'use client'

import { useState, useTransition, useEffect } from 'react'
import { ElectionWithCandidates, Candidate, VoterToken } from '@/lib/types'
import {
  addCandidate, removeCandidate,
  openVoting, generateMoreTokens, closeVoting, deleteElection,
} from '@/app/admin/[electionId]/actions'
import QRCodeDisplay from './QRCodeDisplay'
import { cn } from '@/lib/utils'
import { Plus, Trash2, ChevronDown, ChevronUp, ExternalLink, Copy, Check } from 'lucide-react'

// ── Add Candidate Input ───────────────────────────────────────────

function AddCandidateInput({ electionId, onAdd }: { electionId: string; onAdd: (c: Candidate) => void }) {
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [pending, startTransition] = useTransition()

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    startTransition(async () => {
      const c = await addCandidate(electionId, trimmed, photoUrl.trim() || undefined)
      if (c) onAdd(c)
      setName('')
      setPhotoUrl('')
    })
  }

  return (
    <div className="pt-3 border-t border-[#f0efec] space-y-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Candidate name"
        disabled={pending}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[#e4e2dd] bg-[#fafaf8] focus:outline-none focus:ring-2 focus:ring-[#0a3d52]/20 focus:border-[#0a3d52] disabled:opacity-50 placeholder:text-[#c0bdb8]"
      />
      <div className="flex gap-2">
        <input
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="Google Drive photo link (optional)"
          disabled={pending}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#e4e2dd] bg-[#fafaf8] focus:outline-none focus:ring-2 focus:ring-[#0a3d52]/20 focus:border-[#0a3d52] disabled:opacity-50 placeholder:text-[#c0bdb8]"
        />
        <button
          onClick={submit}
          disabled={!name.trim() || pending}
          className="px-3 py-2 bg-[#0a3d52] hover:bg-[#072e3d] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
    </div>
  )
}

// ── Confirm Delete Modal ──────────────────────────────────────────

function ConfirmDeleteModal({
  title, body, confirmLabel = 'Delete', onConfirm, onClose,
}: {
  title: string
  body: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-[#0a3d52]/60 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#f0efec] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-[#c0392b]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1a1a1a]">{title}</h3>
            <p className="text-xs text-[#9ca3af]">This cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-[#6b7280] mb-5 leading-relaxed">{body}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 border border-[#e4e2dd] text-[#6b7280] hover:bg-[#e8e6e1] font-medium rounded-lg transition-colors text-sm">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className="flex-1 py-3 bg-[#c0392b] hover:bg-[#a93226] text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Open Voting Modal ─────────────────────────────────────────────

function OpenVotingModal({ electionId, onClose }: { electionId: string; onClose: () => void }) {
  const [count, setCount] = useState(30)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  return (
    <div className="fixed inset-0 bg-[#0a3d52]/60 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#f0efec] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#fdeee4] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-[#a0522d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-[#1a1a1a]">Open Voting</h3>
            <p className="text-xs text-[#9ca3af]">This locks the candidate list permanently</p>
          </div>
        </div>

        <p className="text-sm text-[#6b7280] mb-4 leading-relaxed">
          How many voters are expected? Each voter receives a unique 6-digit token to access the ballot.
        </p>

        <div className="mb-4">
          <p className="section-label mb-1.5">Number of Voters</p>
          <input
            type="number" min={1} max={750} value={count}
            onChange={(e) => { setCount(Number(e.target.value)); setError('') }}
            className="w-full px-4 py-3 rounded-lg border border-[#e4e2dd] bg-white text-center text-2xl font-display font-semibold text-[#0a3d52] focus:outline-none focus:ring-2 focus:ring-[#0a3d52]/20"
          />
          {error && <p className="mt-1.5 text-sm text-[#c0392b]">{error}</p>}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 border border-[#e4e2dd] text-[#6b7280] hover:bg-[#e8e6e1] font-medium rounded-lg transition-colors text-sm">
            Cancel
          </button>
          <button
            onClick={() => {
              if (count < 1) { setError('Enter at least 1 voter'); return }
              startTransition(async () => { const r = await openVoting(electionId, count); if (r?.error) setError(r.error) })
            }}
            disabled={pending}
            className="flex-1 py-3 bg-[#0a3d52] hover:bg-[#072e3d] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {pending ? 'Opening…' : 'Open Voting'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Token Panel ───────────────────────────────────────────────────

function TokenPanel({ tokens, electionId }: { tokens: VoterToken[]; electionId: string }) {
  const [showAll, setShowAll] = useState(false)
  const [addCount, setAddCount] = useState(10)
  const [pending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const usedCount = tokens.filter((t) => t.used).length
  const displayed = showAll ? tokens : tokens.slice(0, 24)

  const copyAll = () => {
    navigator.clipboard.writeText(tokens.map((t) => t.token).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="section-label mb-0.5">Voter Tokens</p>
          <p className="text-sm text-[#6b7280]">{usedCount} used / {tokens.length} total</p>
        </div>
        <button onClick={copyAll} className="flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-[#0a3d52] px-3 py-1.5 bg-[#f0efec] rounded-lg transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy All'}
        </button>
      </div>

      <div className="mb-4">
        <div className="h-1.5 bg-[#e4e2dd] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0a3d52] rounded-full transition-all"
            style={{ width: tokens.length ? `${(usedCount / tokens.length) * 100}%` : '0%' }}
          />
        </div>
        <p className="text-xs text-[#9ca3af] mt-1">{tokens.length - usedCount} tokens remaining</p>
      </div>

      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {displayed.map((t, i) => (
          <span
            key={t.id}
            className={cn(
              'flex flex-col items-center font-mono text-xs px-1.5 py-1.5 rounded-lg',
              t.used ? 'bg-[#e8e6e1] text-[#c0bdb8] line-through' : 'bg-[#e8f0f4] text-[#0a3d52]'
            )}
          >
            <span className={cn('text-[9px] leading-none mb-0.5', t.used ? 'text-[#c0bdb8]' : 'text-[#0a3d52]/40')}>
              #{i + 1}
            </span>
            <span className="font-semibold">{t.token}</span>
          </span>
        ))}
      </div>

      {tokens.length > 24 && (
        <button onClick={() => setShowAll(!showAll)} className="text-xs text-[#0a3d52] hover:opacity-70 flex items-center gap-1 mb-4">
          {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showAll ? 'Show fewer' : `Show all ${tokens.length} tokens`}
        </button>
      )}

      <div className="border-t border-[#f0efec] pt-4 flex gap-2 items-center">
        <input
          type="number" min={1} max={750} value={addCount}
          onChange={(e) => setAddCount(Number(e.target.value))}
          className="w-16 px-2 py-2 text-sm rounded-lg border border-[#e4e2dd] focus:outline-none focus:ring-2 focus:ring-[#0a3d52]/20 text-center"
        />
        <button
          onClick={() => startTransition(async () => { await generateMoreTokens(electionId, addCount) })}
          disabled={pending}
          className="text-xs font-medium text-[#0a3d52] hover:bg-[#e8f0f4] px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          {pending ? 'Adding…' : 'Generate more'}
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────

export default function ElectionSetupClient({
  election, tokens,
}: {
  election: ElectionWithCandidates
  tokens: VoterToken[]
}) {
  const [candidates, setCandidates] = useState(election.candidates)
  const [showOpenModal, setShowOpenModal] = useState(false)
  const [showDeleteElection, setShowDeleteElection] = useState(false)
  const [showCloseVoting, setShowCloseVoting] = useState(false)
  const [removeCandidateId, setRemoveCandidateId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => { setCandidates(election.candidates) }, [election.candidates])

  const isSetup = election.status === 'setup'
  const isVoting = election.status === 'voting'
  const isClosed = election.status === 'closed'

  const [voterUrl, setVoterUrl] = useState(`/vote/${election.id}`)
  useEffect(() => {
    setVoterUrl(`${window.location.origin}/vote/${election.id}`)
  }, [election.id])

  const statusBadge = {
    setup: <span className="px-2.5 py-1 bg-[#fdeee4] text-[#a0522d] text-xs font-semibold rounded-full">Setup</span>,
    voting: <span className="px-2.5 py-1 bg-[#e0f0e8] text-[#1a6b3a] text-xs font-semibold rounded-full flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#1a6b3a] rounded-full animate-pulse" />Voting Open</span>,
    closed: <span className="px-2.5 py-1 bg-[#e8e6e1] text-[#6b7280] text-xs font-semibold rounded-full">Closed</span>,
  }[election.status]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h1 className="font-display text-2xl font-semibold text-[#0a3d52]">{election.title}</h1>
            {statusBadge}
          </div>
          <p className="text-xs text-[#9ca3af]">
            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowDeleteElection(true)}
          className="p-1.5 text-[#c0bdb8] hover:text-[#c0392b] rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Voter URL (when open/closed) */}
      {!isSetup && (
        <div className="card p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="section-label mb-2">Voter Access URL</p>
              <a href={voterUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#0a3d52] font-mono text-xs break-all hover:opacity-70 transition-opacity">
                {voterUrl}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
              <p className="text-xs text-[#9ca3af] mt-2">Display this URL or QR code — voters enter their 6-digit token.</p>
            </div>
            <QRCodeDisplay value={voterUrl} size={90} />
          </div>
        </div>
      )}

      {/* Candidates (setup only) */}
      {isSetup && (
        <div className="card p-5">
          <p className="section-label mb-3">Candidates</p>

          {candidates.length === 0 ? (
            <p className="text-sm text-[#9ca3af] italic mb-3">No candidates yet. Add names below.</p>
          ) : (
            <div className="divide-y divide-[#f5f4f1] mb-3">
              {candidates.map((c, idx) => (
                <div key={c.id} className="flex items-center gap-3 py-2.5 group">
                  <span className="text-xs font-mono text-[#c0bdb8] w-5 text-right flex-shrink-0">{idx + 1}</span>
                  <span className="flex-1 text-sm text-[#1a1a1a]">{c.name}</span>
                  <button
                    onClick={() => setRemoveCandidateId(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#c0bdb8] hover:text-[#c0392b] rounded transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <AddCandidateInput
            electionId={election.id}
            onAdd={(c) => setCandidates((prev) => [...prev, c])}
          />
        </div>
      )}

      {/* Token panel */}
      {!isSetup && <TokenPanel tokens={tokens} electionId={election.id} />}

      {/* Actions */}
      <div className="space-y-2.5">
        {isSetup && (
          <>
            <button
              onClick={() => setShowOpenModal(true)}
              disabled={candidates.length === 0}
              className={cn(
                'w-full py-3.5 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm',
                candidates.length > 0 ? 'bg-[#0a3d52] hover:bg-[#072e3d] text-white' : 'bg-[#e8e6e1] text-[#c0bdb8] cursor-not-allowed'
              )}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Open Voting
            </button>
            {candidates.length === 0 && (
              <p className="text-xs text-[#a0522d] text-center">Add at least one candidate to open voting.</p>
            )}
          </>
        )}

        {isVoting && (
          <>
            <a href={`/admin/${election.id}/results`} className="btn-ink no-underline">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
              </svg>
              View Live Results
            </a>
            <button
              onClick={() => setShowCloseVoting(true)}
              className="w-full py-3 border border-[#e4e2dd] text-[#6b7280] hover:bg-[#e8e6e1] font-medium rounded-xl transition-colors text-sm"
            >
              Close Voting
            </button>
          </>
        )}

        {isClosed && (
          <a href={`/admin/${election.id}/results`} className="btn-ink no-underline">
            View Final Results
          </a>
        )}
      </div>

      {showOpenModal && <OpenVotingModal electionId={election.id} onClose={() => setShowOpenModal(false)} />}

      {showDeleteElection && (
        <ConfirmDeleteModal
          title="Delete Election"
          body={`"${election.title}" and all its data will be permanently deleted.`}
          confirmLabel="Delete Election"
          onConfirm={() => startTransition(async () => deleteElection(election.id))}
          onClose={() => setShowDeleteElection(false)}
        />
      )}

      {removeCandidateId && (() => {
        const candidate = candidates.find((c) => c.id === removeCandidateId)
        return (
          <ConfirmDeleteModal
            title="Remove Candidate"
            body={`"${candidate?.name}" will be removed from the ballot.`}
            confirmLabel="Remove"
            onConfirm={() => {
              setCandidates((prev) => prev.filter((x) => x.id !== removeCandidateId))
              startTransition(async () => removeCandidate(removeCandidateId, election.id))
            }}
            onClose={() => setRemoveCandidateId(null)}
          />
        )
      })()}

      {showCloseVoting && (
        <ConfirmDeleteModal
          title="Close Voting"
          body="Voting will be permanently closed. Results will be final and no more ballots can be submitted."
          confirmLabel="Close Voting"
          onConfirm={() => startTransition(async () => closeVoting(election.id))}
          onClose={() => setShowCloseVoting(false)}
        />
      )}
    </div>
  )
}
