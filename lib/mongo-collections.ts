import { Collection, WithId } from 'mongodb'
import { getDb } from './mongo'
import { Election, VoterToken, Vote } from './types'

export type ElectionDoc = Omit<Election, 'id'> & {
  _id: string
  candidates: Array<{ id: string; election_id: string; name: string; created_at: string }>
}

export type VoterTokenDoc = Omit<VoterToken, 'id'> & { _id: string }
export type VoteDoc = Omit<Vote, 'id'> & { _id: string }

export async function electionsCollection(): Promise<Collection<ElectionDoc>> {
  const db = await getDb()
  return db.collection<ElectionDoc>('elections')
}

export async function voterTokensCollection(): Promise<Collection<VoterTokenDoc>> {
  const db = await getDb()
  return db.collection<VoterTokenDoc>('voter_tokens')
}

export async function votesCollection(): Promise<Collection<VoteDoc>> {
  const db = await getDb()
  return db.collection<VoteDoc>('votes')
}

export function toRecord<T>(doc: WithId<T & { _id: string }> | null): (T & { id: string }) | null {
  if (!doc) return null
  const { _id, ...rest } = doc as unknown as Record<string, unknown>
  return { ...rest, id: _id as string } as T & { id: string }
}
