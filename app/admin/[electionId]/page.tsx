import { notFound } from 'next/navigation'
import { ElectionWithNominees, VoterToken } from '@/lib/types'
import ElectionSetupClient from '@/components/admin/ElectionSetupClient'
import Link from 'next/link'
import { ArrowLeft, BarChart2 } from 'lucide-react'
import { electionsCollection, voterTokensCollection } from '@/lib/mongo-collections'

export default async function ElectionPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const elections = await electionsCollection()
  const electionDoc = await elections.findOne({ _id: electionId })

  if (!electionDoc) notFound()

  const electionData: ElectionWithNominees = {
    id: electionDoc._id,
    title: electionDoc.title,
    status: electionDoc.status,
    created_at: electionDoc.created_at,
    nominees: [...electionDoc.nominees].sort((a, b) => a.sort_order - b.sort_order),
  }

  let tokens: VoterToken[] = []
  if (electionDoc.status !== 'setup') {
    const voterTokens = await voterTokensCollection()
    const tokenDocs = await voterTokens
      .find({ election_id: electionId })
      .sort({ created_at: 1 })
      .toArray()
    tokens = tokenDocs.map((t) => ({ ...t, id: t._id }))
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
        {electionDoc.status !== 'setup' && (
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
