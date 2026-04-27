'use server'

import { electionsCollection, voterTokensCollection } from '@/lib/mongo-collections'
import { generateTokens } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'

export async function addCandidate(electionId: string, name: string, photo_url?: string) {
  const elections = await electionsCollection()
  const candidate = {
    id: randomUUID(),
    election_id: electionId,
    name,
    ...(photo_url ? { photo_url } : {}),
    created_at: new Date().toISOString(),
  }
  await elections.updateOne({ _id: electionId }, { $push: { candidates: candidate } })
  revalidatePath(`/admin/${electionId}`)
  return candidate
}

export async function removeCandidate(candidateId: string, electionId: string) {
  const elections = await electionsCollection()
  await elections.updateOne(
    { _id: electionId },
    { $pull: { candidates: { id: candidateId } } }
  )
  revalidatePath(`/admin/${electionId}`)
}

export async function openVoting(electionId: string, tokenCount: number) {
  if (tokenCount < 1 || tokenCount > 750) return { error: 'Token count must be between 1 and 750' }

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
  if (count < 1 || count > 750) return { error: 'Count must be between 1 and 750' }

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
