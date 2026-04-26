import { notFound } from 'next/navigation'
import { ElectionWithNominees, VoterToken, Vote } from '@/lib/types'
import ResultsClient from '@/components/results/ResultsClient'
import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'
import { electionsCollection, voterTokensCollection, votesCollection } from '@/lib/mongo-collections'

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params

  const [elections, voterTokens, votes] = await Promise.all([
    electionsCollection(),
    voterTokensCollection(),
    votesCollection(),
  ])

  const electionDoc = await elections.findOne({ _id: electionId })
  if (!electionDoc) notFound()

  const [voteDocs, tokenDocs] = await Promise.all([
    votes.find({ election_id: electionId }).toArray(),
    voterTokens.find({ election_id: electionId }, { projection: { _id: 1, used: 1 } }).toArray(),
  ])

  const electionData: ElectionWithNominees = {
    id: electionDoc._id,
    title: electionDoc.title,
    status: electionDoc.status,
    created_at: electionDoc.created_at,
    nominees: [...electionDoc.nominees].sort((a, b) => a.sort_order - b.sort_order),
  }

  const initialVotes: Vote[] = voteDocs.map((v) => ({ ...v, id: v._id }))
  const tokens: Pick<VoterToken, 'id' | 'used'>[] = tokenDocs.map((t) => ({
    id: t._id,
    used: t.used,
  }))

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
        initialVotes={initialVotes}
        tokens={tokens}
      />
    </div>
  )
}
