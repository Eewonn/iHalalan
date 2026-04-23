import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { ElectionWithPositions, VoterToken, Vote } from '@/lib/types'
import ResultsClient from '@/components/results/ResultsClient'
import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const supabase = await createClient()

  const { data: election } = await supabase
    .from('elections')
    .select(`*, positions(*, nominees(*))`)
    .eq('id', electionId)
    .order('sort_order', { referencedTable: 'positions' })
    .single()

  if (!election) notFound()

  const { data: votes } = await supabase
    .from('votes')
    .select('*')
    .eq('election_id', electionId)

  const { data: tokens } = await supabase
    .from('voter_tokens')
    .select('id, used')
    .eq('election_id', electionId)

  // Sort nominees by created_at
  const electionData = {
    ...election,
    positions: election.positions.map((p: { nominees: { created_at: string }[] }) => ({
      ...p,
      nominees: [...p.nominees].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    })),
  } as ElectionWithPositions

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/admin/${electionId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <Settings className="w-3.5 h-3.5" />
          Election Setup
        </Link>
      </div>

      <ResultsClient
        election={electionData}
        initialVotes={(votes as Vote[]) ?? []}
        tokens={(tokens as Pick<VoterToken, 'id' | 'used'>[]) ?? []}
      />
    </div>
  )
}
