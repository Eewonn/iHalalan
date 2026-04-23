import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { ElectionWithPositions, VoterToken } from '@/lib/types'
import ElectionSetupClient from '@/components/admin/ElectionSetupClient'
import Link from 'next/link'
import { ArrowLeft, BarChart2 } from 'lucide-react'

export default async function ElectionPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const supabase = await createClient()

  const { data: election } = await supabase
    .from('elections')
    .select(`
      *,
      positions (
        *,
        nominees (*)
      )
    `)
    .eq('id', electionId)
    .order('sort_order', { referencedTable: 'positions' })
    .single()

  if (!election) notFound()

  // Sort nominees by created_at within each position
  const electionData = {
    ...election,
    positions: election.positions.map((p: { nominees: { created_at: string }[] }) => ({
      ...p,
      nominees: [...p.nominees].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    })),
  } as ElectionWithPositions

  // For voting/closed status, also fetch tokens
  let tokens: VoterToken[] = []
  if (election.status !== 'setup') {
    const { data } = await supabase
      .from('voter_tokens')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at')
    tokens = (data as VoterToken[]) ?? []
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Elections
        </Link>
        {election.status !== 'setup' && (
          <Link
            href={`/admin/${electionId}/results`}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
          >
            <BarChart2 className="w-4 h-4" />
            Live Results
          </Link>
        )}
      </div>

      <ElectionSetupClient
        election={electionData}
        tokens={tokens}
      />
    </div>
  )
}
