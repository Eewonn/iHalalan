import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import VoteClient from '@/components/vote/VoteClient'

export default async function VotePage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const supabase = await createClient()

  const { data: election } = await supabase
    .from('elections')
    .select('id, title, status')
    .eq('id', electionId)
    .single()

  if (!election) notFound()

  return (
    <div className="min-h-screen bg-[#f0efec] pb-28 flex flex-col">
      {/* iHalalan header */}
      <header className="ihalalan-header flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 text-white/90 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11" />
          </svg>
          <span className="brand-name text-white text-lg">iHalalan</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 pt-6 w-full flex-1">
        <VoteClient election={election} />
      </div>
    </div>
  )
}
