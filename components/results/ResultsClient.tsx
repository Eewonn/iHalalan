'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ElectionWithPositions, Vote, VoterToken } from '@/lib/types'
import { closeVoting } from '@/app/admin/[electionId]/actions'
import { cn } from '@/lib/utils'

type VoteCounts = Record<string, number>

function buildCounts(votes: Vote[]): VoteCounts {
  return votes.reduce((acc, v) => {
    acc[v.nominee_id] = (acc[v.nominee_id] || 0) + 1
    return acc
  }, {} as VoteCounts)
}

function exportCSV(election: ElectionWithPositions, counts: VoteCounts, tokens: Pick<VoterToken, 'id' | 'used'>[]) {
  const rows = ['Position,Nominee,Votes,Percentage']
  election.positions.forEach((pos) => {
    const total = pos.nominees.reduce((a, n) => a + (counts[n.id] || 0), 0)
    pos.nominees.forEach((n) => {
      const v = counts[n.id] || 0
      rows.push(`"${pos.title}","${n.name}",${v},${total > 0 ? ((v / total) * 100).toFixed(1) : '0.0'}%`)
    })
  })
  rows.push(`,,Total Tokens,${tokens.length}`)
  rows.push(`,,Votes Cast,${tokens.filter((t) => t.used).length}`)
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${election.title.replace(/[^a-z0-9]/gi, '_')}_results.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ResultsClient({
  election, initialVotes, tokens,
}: {
  election: ElectionWithPositions
  initialVotes: Vote[]
  tokens: Pick<VoterToken, 'id' | 'used'>[]
}) {
  const [counts, setCounts] = useState<VoteCounts>(buildCounts(initialVotes))
  const [ballotsSubmitted, setBallotsSubmitted] = useState(
    new Set(initialVotes.map((v) => v.token_id)).size
  )
  const [projector, setProjector] = useState(false)
  const [closing, setClosing] = useState(false)

  const isLive = election.status === 'voting'
  const totalTokens = tokens.length
  const usedTokens = tokens.filter((t) => t.used).length

  useEffect(() => {
    if (!isLive) return
    const supabase = createClient()
    const channel = supabase
      .channel(`results-${election.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes', filter: `election_id=eq.${election.id}` }, (payload) => {
        const vote = payload.new as Vote
        setCounts((prev) => ({ ...prev, [vote.nominee_id]: (prev[vote.nominee_id] || 0) + 1 }))
        setBallotsSubmitted((prev) => prev + 1 / election.positions.length)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [election.id, election.positions.length, isLive])

  const roundedBallots = Math.round(ballotsSubmitted)

  // ── Projector view ────────────────────────────────────────────
  if (projector) {
    return (
      <div className="fixed inset-0 bg-[#0a3d52] overflow-auto z-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <svg className="w-6 h-6 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11" />
                </svg>
                <span className="font-display text-white/80 text-lg">iHalalan</span>
              </div>
              <h1 className="font-display text-4xl font-semibold text-white">{election.title}</h1>
              <p className="text-white/60 text-lg mt-1">{roundedBallots} of {totalTokens} votes cast</p>
            </div>
            <div className="flex items-center gap-3">
              {isLive && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-[#f5a878] rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-[#f5a878] rounded-full animate-pulse" />
                  Live
                </span>
              )}
              <button onClick={() => setProjector(false)} className="p-2 text-white/50 hover:text-white rounded-lg transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            {election.positions.map((pos) => {
              const posTotal = pos.nominees.reduce((a, n) => a + (counts[n.id] || 0), 0)
              const sorted = [...pos.nominees].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
              return (
                <div key={pos.id} className="bg-white/10 rounded-2xl p-6">
                  <h2 className="font-display text-2xl font-semibold text-white mb-5">{pos.title}</h2>
                  <div className="space-y-4">
                    {sorted.map((nominee, idx) => {
                      const v = counts[nominee.id] || 0
                      const pct = posTotal > 0 ? Math.round((v / posTotal) * 100) : 0
                      const leading = idx === 0 && v > 0
                      return (
                        <div key={nominee.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn('text-xl font-semibold', leading ? 'text-white' : 'text-white/70')}>
                              {nominee.name}
                              {leading && <span className="ml-2 text-sm text-[#f5a878] font-normal">leading</span>}
                            </span>
                            <span className="text-3xl font-display font-semibold text-white">{v}</span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundColor: leading ? '#f5a878' : 'rgba(255,255,255,0.3)' }}
                            />
                          </div>
                          <p className="text-right text-white/40 text-sm mt-1">{pct}%</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Normal view ───────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="section-label mb-1">Election Results</p>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <h1 className="font-display text-2xl font-semibold text-[#0a3d52]">{election.title}</h1>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#e0f0e8] text-[#1a6b3a] text-xs font-semibold rounded-full">
              <span className="w-1.5 h-1.5 bg-[#1a6b3a] rounded-full animate-pulse" />
              Live
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-[#e8e6e1] text-[#6b7280] text-xs font-semibold rounded-full">
              Final
            </span>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="stats-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-label text-white/60 mb-1">Ballots Cast</p>
            <p className="font-display text-3xl font-semibold text-white">{roundedBallots}</p>
            <p className="text-white/60 text-xs mt-0.5">of {totalTokens} registered voters</p>
          </div>
          <div className="text-right">
            <p className="section-label text-white/60 mb-1">Participation</p>
            <p className="font-display text-3xl font-semibold text-white">
              {totalTokens > 0 ? Math.round((usedTokens / totalTokens) * 100) : 0}%
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#f5a878] rounded-full transition-all duration-500"
            style={{ width: `${totalTokens > 0 ? (usedTokens / totalTokens) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => exportCSV(election, counts, tokens)}
          className="px-3 py-2 text-xs font-semibold text-[#6b7280] bg-white border border-[#e4e2dd] rounded-lg hover:bg-[#f0efec] transition-colors"
        >
          Export CSV
        </button>
        <button
          onClick={() => setProjector(true)}
          className="px-3 py-2 text-xs font-semibold text-[#6b7280] bg-white border border-[#e4e2dd] rounded-lg hover:bg-[#f0efec] transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Projector View
        </button>
        {isLive && (
          <button
            onClick={async () => {
              if (!confirm('Close voting and finalize results?')) return
              setClosing(true)
              await closeVoting(election.id)
            }}
            disabled={closing}
            className="px-3 py-2 text-xs font-semibold text-[#c0392b] bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {closing ? 'Closing…' : 'Close Voting'}
          </button>
        )}
      </div>

      {/* Results per position */}
      <div className="space-y-4">
        {election.positions.map((pos) => {
          const posTotal = pos.nominees.reduce((a, n) => a + (counts[n.id] || 0), 0)
          const sorted = [...pos.nominees].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
          return (
            <div key={pos.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#0a3d52] text-sm">{pos.title}</h2>
                <span className="text-xs text-[#9ca3af]">{posTotal} votes</span>
              </div>
              <div className="space-y-3">
                {sorted.map((nominee, idx) => {
                  const v = counts[nominee.id] || 0
                  const pct = posTotal > 0 ? Math.round((v / posTotal) * 100) : 0
                  const leading = idx === 0 && v > 0
                  return (
                    <div key={nominee.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {leading && election.status === 'closed' && (
                            <svg className="w-3.5 h-3.5 text-[#f5a878] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          )}
                          <span className={cn('text-sm', leading ? 'font-semibold text-[#1a1a1a]' : 'text-[#6b7280]')}>
                            {nominee.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs text-[#9ca3af]">{pct}%</span>
                          <span className="text-sm font-semibold text-[#1a1a1a] w-5 text-right">{v}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#f0efec] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: leading ? '#0a3d52' : '#c0bdb8' }}
                        />
                      </div>
                    </div>
                  )
                })}
                {posTotal === 0 && (
                  <p className="text-sm text-[#c0bdb8] py-2">No votes yet</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
