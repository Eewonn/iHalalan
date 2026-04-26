'use server'

import { electionsCollection, voterTokensCollection } from '@/lib/mongo-collections'
import { generateTokens } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'

// ── Position actions ─────────────────────────────────────────────

export async function addPosition(electionId: string, title: string) {
  const elections = await electionsCollection()
  const election = await elections.findOne({ _id: electionId }, { projection: { positions: 1 } })
  const sortOrder = election?.positions?.length ?? 0

  const newPos = {
    id: randomUUID(),
    election_id: electionId,
    title,
    sort_order: sortOrder,
    created_at: new Date().toISOString(),
    nominees: [] as never[],
  }

  await elections.updateOne({ _id: electionId }, { $push: { positions: newPos } })
  revalidatePath(`/admin/${electionId}`)
  return newPos
}

export async function updatePositionTitle(positionId: string, electionId: string, title: string) {
  const elections = await electionsCollection()
  await elections.updateOne(
    { _id: electionId, 'positions.id': positionId },
    { $set: { 'positions.$.title': title } }
  )
  revalidatePath(`/admin/${electionId}`)
}

export async function removePosition(positionId: string, electionId: string) {
  const elections = await electionsCollection()
  await elections.updateOne(
    { _id: electionId },
    { $pull: { positions: { id: positionId } } }
  )
  revalidatePath(`/admin/${electionId}`)
}

// ── Nominee actions ──────────────────────────────────────────────

export async function addNominee(positionId: string, electionId: string, name: string) {
  const elections = await electionsCollection()
  const nominee = {
    id: randomUUID(),
    position_id: positionId,
    name,
    created_at: new Date().toISOString(),
  }
  await elections.updateOne(
    { _id: electionId, 'positions.id': positionId },
    { $push: { 'positions.$.nominees': nominee } }
  )
  revalidatePath(`/admin/${electionId}`)
}

export async function removeNominee(nomineeId: string, electionId: string) {
  const elections = await electionsCollection()
  await elections.updateOne(
    { _id: electionId },
    { $pull: { 'positions.$[].nominees': { id: nomineeId } } }
  )
  revalidatePath(`/admin/${electionId}`)
}

// ── Voting lifecycle ─────────────────────────────────────────────

export async function openVoting(electionId: string, tokenCount: number) {
  if (tokenCount < 1 || tokenCount > 500) return { error: 'Token count must be between 1 and 500' }

  const elections = await electionsCollection()
  const voterTokens = await voterTokensCollection()

  const { modifiedCount } = await elections.updateOne(
    { _id: electionId },
    { $set: { status: 'voting' } }
  )
  if (!modifiedCount) return { error: 'Election not found' }

  const tokens = generateTokens(tokenCount)
  try {
    await voterTokens.insertMany(
      tokens.map((token) => ({
        _id: randomUUID(),
        election_id: electionId,
        token,
        used: false,
        used_at: null,
        created_at: new Date().toISOString(),
      }))
    )
  } catch (err) {
    await elections.updateOne({ _id: electionId }, { $set: { status: 'setup' } })
    return { error: (err as Error).message }
  }

  revalidatePath(`/admin/${electionId}`)
  return { success: true }
}

export async function generateMoreTokens(electionId: string, count: number) {
  if (count < 1 || count > 200) return { error: 'Count must be between 1 and 200' }

  const voterTokens = await voterTokensCollection()
  const tokens = generateTokens(count)

  try {
    await voterTokens.insertMany(
      tokens.map((token) => ({
        _id: randomUUID(),
        election_id: electionId,
        token,
        used: false,
        used_at: null,
        created_at: new Date().toISOString(),
      }))
    )
  } catch (err) {
    return { error: (err as Error).message }
  }

  revalidatePath(`/admin/${electionId}`)
  return { success: true }
}

export async function closeVoting(electionId: string) {
  const elections = await electionsCollection()
  await elections.updateOne({ _id: electionId }, { $set: { status: 'closed' } })
  revalidatePath(`/admin/${electionId}`)
  redirect(`/admin/${electionId}/results`)
}

export async function deleteElection(electionId: string) {
  const [elections, voterTokens, votes] = await Promise.all([
    electionsCollection(),
    voterTokensCollection(),
    (await import('@/lib/mongo-collections')).votesCollection(),
  ])
  await Promise.all([
    elections.deleteOne({ _id: electionId }),
    voterTokens.deleteMany({ election_id: electionId }),
    votes.deleteMany({ election_id: electionId }),
  ])
  redirect('/admin')
}
