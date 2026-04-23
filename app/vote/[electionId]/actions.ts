'use server'

import { createClient } from '@/lib/supabase-server'
import { ElectionWithPositions, BallotSelection } from '@/lib/types'

export async function validateToken(
  electionId: string,
  token: string
): Promise<{ error?: string; ballot?: ElectionWithPositions }> {
  const supabase = await createClient()

  // Check election status
  const { data: election, error: electionError } = await supabase
    .from('elections')
    .select(`*, positions(*, nominees(*))`)
    .eq('id', electionId)
    .order('sort_order', { referencedTable: 'positions' })
    .single()

  if (electionError || !election) return { error: 'Election not found.' }
  if (election.status === 'setup') return { error: 'Voting has not opened yet.' }
  if (election.status === 'closed') return { error: 'Voting has closed.' }

  // Check token
  const { data: tokenRow, error: tokenError } = await supabase
    .from('voter_tokens')
    .select('id, used')
    .eq('election_id', electionId)
    .eq('token', token.trim())
    .single()

  if (tokenError || !tokenRow) return { error: 'Invalid token. Check your slip and try again.' }
  if (tokenRow.used) return { error: 'This token has already been used.' }

  // Sort nominees by created_at
  const ballot = {
    ...election,
    positions: election.positions.map((p: { nominees: { created_at: string }[] }) => ({
      ...p,
      nominees: [...p.nominees].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    })),
  } as ElectionWithPositions

  return { ballot }
}

export async function submitBallot(
  token: string,
  selections: BallotSelection[]
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('submit_ballot', {
    p_token: token.trim(),
    p_selections: selections,
  })

  if (error) return { error: error.message }
  if (!data.success) {
    const messages: Record<string, string> = {
      invalid_token: 'Invalid token.',
      token_used: 'This token has already been used.',
      concurrent_request: 'Your ballot was already submitted. Refresh to confirm.',
    }
    return { error: messages[data.error] ?? 'Something went wrong. Please try again.' }
  }

  return { success: true }
}
