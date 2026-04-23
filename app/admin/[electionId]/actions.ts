'use server'

import { createClient } from '@/lib/supabase-server'
import { generateTokens } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ── Position actions ─────────────────────────────────────────────

export async function addPosition(electionId: string, title: string) {
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('positions')
    .select('sort_order')
    .eq('election_id', electionId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sort_order = (existing?.sort_order ?? -1) + 1

  const { data } = await supabase
    .from('positions')
    .insert({ election_id: electionId, title, sort_order })
    .select()
    .single()

  revalidatePath(`/admin/${electionId}`)
  return data
}

export async function updatePositionTitle(positionId: string, electionId: string, title: string) {
  const supabase = await createClient()
  await supabase.from('positions').update({ title }).eq('id', positionId)
  revalidatePath(`/admin/${electionId}`)
}

export async function removePosition(positionId: string, electionId: string) {
  const supabase = await createClient()
  await supabase.from('positions').delete().eq('id', positionId)
  revalidatePath(`/admin/${electionId}`)
}

// ── Nominee actions ──────────────────────────────────────────────

export async function addNominee(positionId: string, electionId: string, name: string) {
  const supabase = await createClient()
  await supabase.from('nominees').insert({ position_id: positionId, name })
  revalidatePath(`/admin/${electionId}`)
}

export async function removeNominee(nomineeId: string, electionId: string) {
  const supabase = await createClient()
  await supabase.from('nominees').delete().eq('id', nomineeId)
  revalidatePath(`/admin/${electionId}`)
}

// ── Voting lifecycle ─────────────────────────────────────────────

export async function openVoting(electionId: string, tokenCount: number) {
  if (tokenCount < 1 || tokenCount > 500) return { error: 'Token count must be between 1 and 500' }

  const supabase = await createClient()
  const tokens = generateTokens(tokenCount)

  const { error: statusError } = await supabase
    .from('elections')
    .update({ status: 'voting' })
    .eq('id', electionId)

  if (statusError) return { error: statusError.message }

  const { error: tokenError } = await supabase
    .from('voter_tokens')
    .insert(tokens.map((token) => ({ election_id: electionId, token })))

  if (tokenError) {
    // Roll back status
    await supabase.from('elections').update({ status: 'setup' }).eq('id', electionId)
    return { error: tokenError.message }
  }

  revalidatePath(`/admin/${electionId}`)
  return { success: true }
}

export async function generateMoreTokens(electionId: string, count: number) {
  if (count < 1 || count > 200) return { error: 'Count must be between 1 and 200' }

  const supabase = await createClient()
  const tokens = generateTokens(count)

  const { error } = await supabase
    .from('voter_tokens')
    .insert(tokens.map((token) => ({ election_id: electionId, token })))

  if (error) return { error: error.message }

  revalidatePath(`/admin/${electionId}`)
  return { success: true }
}

export async function closeVoting(electionId: string) {
  const supabase = await createClient()
  await supabase.from('elections').update({ status: 'closed' }).eq('id', electionId)
  revalidatePath(`/admin/${electionId}`)
  redirect(`/admin/${electionId}/results`)
}

export async function deleteElection(electionId: string) {
  const supabase = await createClient()
  await supabase.from('elections').delete().eq('id', electionId)
  redirect('/admin')
}
