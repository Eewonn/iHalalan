'use server'

import { electionsCollection, voterTokensCollection, votesCollection, VoterTokenDoc, VoteDoc } from '@/lib/mongo-collections'
import { getClient } from '@/lib/mongo'
import { ElectionWithPositions, BallotSelection } from '@/lib/types'
import { randomUUID } from 'crypto'

export async function validateToken(
  electionId: string,
  token: string
): Promise<{ error?: string; ballot?: ElectionWithPositions }> {
  const elections = await electionsCollection()
  const voterTokens = await voterTokensCollection()

  const electionDoc = await elections.findOne({ _id: electionId })
  if (!electionDoc) return { error: 'Election not found.' }
  if (electionDoc.status === 'setup') return { error: 'Voting has not opened yet.' }
  if (electionDoc.status === 'closed') return { error: 'Voting has closed.' }

  const tokenRow = await voterTokens.findOne(
    { election_id: electionId, token: token.trim() },
    { projection: { _id: 1, used: 1 } }
  )
  if (!tokenRow) return { error: 'Invalid token. Check your slip and try again.' }
  if (tokenRow.used) return { error: 'This token has already been used.' }

  const ballot: ElectionWithPositions = {
    id: electionDoc._id,
    title: electionDoc.title,
    status: electionDoc.status,
    created_at: electionDoc.created_at,
    positions: electionDoc.positions.map((p) => ({
      ...p,
      nominees: [...p.nominees].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    })),
  }

  return { ballot }
}

export async function submitBallot(
  token: string,
  selections: BallotSelection[]
): Promise<{ error?: string; success?: boolean }> {
  const client = await getClient()
  const db = client.db(process.env.MONGODB_DB!)
  const session = client.startSession()

  const messages: Record<string, string> = {
    invalid_token: 'Invalid token.',
    token_used: 'This token has already been used.',
    concurrent_request: 'Your ballot was already submitted. Refresh to confirm.',
  }

  try {
    await session.withTransaction(async () => {
      const vtCol = db.collection<VoterTokenDoc>('voter_tokens')
      const vCol = db.collection<VoteDoc>('votes')

      const tokenDoc = await vtCol.findOneAndUpdate(
        { token: token.trim(), used: false },
        { $set: { used: true, used_at: new Date().toISOString() } },
        { session, returnDocument: 'before' }
      )

      if (!tokenDoc) {
        const exists = await vtCol.findOne({ token: token.trim() }, { session })
        throw new Error(exists ? 'token_used' : 'invalid_token')
      }

      const now = new Date().toISOString()
      await vCol.insertMany(
        selections.map((sel) => ({
          _id: randomUUID(),
          token_id: tokenDoc._id,
          election_id: tokenDoc.election_id,
          position_id: sel.position_id,
          nominee_id: sel.nominee_id,
          submitted_at: now,
        })),
        { session }
      )
    })

    return { success: true }
  } catch (err) {
    const msg = (err as Error).message
    if (msg in messages) return { error: messages[msg] }
    if (msg.includes('WriteConflict') || msg.includes('TransientTransactionError')) {
      return { error: messages.concurrent_request }
    }
    return { error: 'Something went wrong. Please try again.' }
  } finally {
    await session.endSession()
  }
}
