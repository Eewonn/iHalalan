import { electionsCollection, voterTokensCollection } from '@/lib/mongo-collections'
import { Election } from '@/lib/types'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [elections, voterTokens] = await Promise.all([
    electionsCollection(),
    voterTokensCollection(),
  ])

  const electionDocs = await elections.find({}).sort({ created_at: -1 }).toArray()
  const electionList: Election[] = electionDocs.map((d) => ({
    id: d._id,
    title: d.title,
    status: d.status,
    created_at: d.created_at,
  }))

  const totalParticipated = await voterTokens.countDocuments({ used: true })
  const activeCount = electionList.filter((e) => e.status === 'voting').length

  const statusConfig = (status: string) => {
    if (status === 'setup') return { label: 'Setup', bg: 'bg-[#fdeee4]', text: 'text-[#a0522d]' }
    if (status === 'voting') return { label: 'Active', bg: 'bg-[#e0f0e8]', text: 'text-[#1a6b3a]' }
    return { label: 'Closed', bg: 'bg-[#e8e6e1]', text: 'text-[#6b7280]' }
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="mb-2">
        <p className="section-label mb-1">Admin ng Halalan</p>
        <h1 className="font-display text-2xl font-semibold text-[#1a1a1a] leading-snug">
          Mga{' '}
          <span className="text-[#0a3d52] italic">Halalan</span>
        </h1>
      </div>

      {/* Create button */}
      <Link
        href="/admin/new"
        className="stats-card flex items-center gap-3 no-underline hover:opacity-90 transition-opacity"
        style={{ paddingTop: '1rem', paddingBottom: '1rem' }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-white font-semibold text-base">Create New Election</span>
      </Link>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Voters participated - dark teal */}
        <div className="stats-card col-span-2">
          <p className="section-label text-white/60 mb-1">Voters Participated</p>
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl font-semibold text-white leading-none">
              {totalParticipated.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <span className="text-white/70 text-xs">Real-time verification active</span>
          </div>
        </div>

        {/* Active elections */}
        <div className="card p-4">
          <div className="w-9 h-9 rounded-lg bg-[#f0efec] flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-[#0a3d52]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 16l2 2 4-4" />
            </svg>
          </div>
          <p className="section-label mb-1">Active Elections</p>
          <p className="font-display text-3xl font-semibold text-[#0a3d52]">
            {String(activeCount).padStart(2, '0')}
          </p>
        </div>

        {/* Total elections */}
        <div className="card p-4">
          <div className="w-9 h-9 rounded-lg bg-[#f0efec] flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-[#0a3d52]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="section-label mb-1">Total Elections</p>
          <p className="font-display text-3xl font-semibold text-[#0a3d52]">
            {String(electionList.length).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Elections list */}
      {electionList.length > 0 && (
        <div>
          <p className="section-label mb-3 mt-2">All Elections</p>
          <div className="space-y-2">
            {electionList.map((election) => {
              const { label, bg, text } = statusConfig(election.status)
              return (
                <Link
                  key={election.id}
                  href={`/admin/${election.id}`}
                  className="card p-4 flex items-center justify-between no-underline hover:shadow-md transition-shadow"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1a1a1a] text-sm truncate">{election.title}</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">
                      {new Date(election.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${bg} ${text}`}>
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {electionList.length === 0 && (
        <div className="card p-10 text-center">
          <div className="w-12 h-12 bg-[#f0efec] rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#9ca3af]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="font-display text-lg font-medium text-[#0a3d52] mb-1">No elections yet</p>
          <p className="text-sm text-[#9ca3af]">Create your first election to begin.</p>
        </div>
      )}
    </div>
  )
}
