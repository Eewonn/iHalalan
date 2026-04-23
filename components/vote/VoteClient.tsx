'use client'

import { useState, useTransition, useEffect } from 'react'
import { validateToken, submitBallot } from '@/app/vote/[electionId]/actions'
import { ElectionWithPositions, BallotSelection } from '@/lib/types'
import { cn } from '@/lib/utils'

type Step = 'token' | 'ballot' | 'confirm' | 'done'

// ── Civic status screens ──────────────────────────────────────────

function StatusScreen({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-[#fdeee4] rounded-2xl mb-5">
        {icon}
      </div>
      <h2 className="font-display text-2xl font-semibold text-[#0a3d52] mb-2">{title}</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs mx-auto">{body}</p>
    </div>
  )
}

// ── Token Entry (Image 1) ─────────────────────────────────────────

function TokenEntry({
  election,
  onSuccess,
}: {
  election: { id: string; title: string; status: string }
  onSuccess: (token: string, ballot: ElectionWithPositions) => void
}) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const submit = () => {
    const t = token.trim()
    if (!t) { setError('Please enter your access code'); return }
    setError('')
    startTransition(async () => {
      const result = await validateToken(election.id, t)
      if (result.error) { setError(result.error); return }
      if (result.ballot) onSuccess(t, result.ballot)
    })
  }

  if (election.status === 'closed') return (
    <StatusScreen
      icon={<svg className="w-8 h-8 text-[#a0522d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
      title="Voting has closed"
      body="The election period has ended. Results will be announced by the event organizer."
    />
  )

  if (election.status === 'setup') return (
    <StatusScreen
      icon={<svg className="w-8 h-8 text-[#a0522d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      title="Not yet open"
      body="Voting has not started. Check back once the organizer opens the ballot."
    />
  )

  return (
    <div className="flex flex-col items-center">
      {/* Badge */}
      <span className="badge-peach mb-6">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Boses ng Bayan
      </span>

      {/* Headline */}
      <div className="text-center mb-8 px-2">
        <h1 className="font-display text-4xl leading-snug font-medium text-[#1a1a1a]">
          Ang boto mo,<br />ang tinig mo sa{' '}
          <em className="italic text-[#0a3d52]">halalan.</em>
        </h1>
        <p className="text-[#6b7280] text-sm mt-4 leading-relaxed max-w-xs mx-auto">
          Ilagay ang iyong token para makapag-boto.
        </p>
      </div>

      {/* Card */}
      <div className="card w-full p-5">
        <p className="section-label mb-2">PIN / Token</p>

        <div className="relative mb-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={token}
            onChange={(e) => { setToken(e.target.value.replace(/[^0-9]/g, '')); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="e.g. 123456"
            autoFocus
            className={cn(
              'w-full pl-4 pr-12 py-3.5 rounded-lg border text-[#1a1a1a] text-sm font-mono tracking-widest',
              'focus:outline-none focus:ring-2 focus:ring-[#0a3d52]/25 focus:border-[#0a3d52]',
              'placeholder:text-[#c0bdb8] placeholder:tracking-normal placeholder:font-sans',
              error ? 'border-[#c0392b] bg-red-50' : 'border-[#e4e2dd] bg-[#fafaf8]'
            )}
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0bdb8]">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>

        {error && (
          <p className="text-sm text-[#c0392b] flex items-center gap-1.5 mb-3">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={pending || token.length < 6}
          className="btn-ink"
        >
          {pending ? 'Verifying…' : (
            <>
              Join Election
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-[#9ca3af] text-center flex items-center gap-1.5 mt-4">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        End-to-end encrypted participation
      </p>
    </div>
  )
}

// ── Ballot Form (Image 3) ─────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const colors = ['#f5a878', '#0a3d52', '#c0bdb8']
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="step-segment"
          style={{ backgroundColor: i < current ? colors[Math.min(i, colors.length - 1)] : '#e4e2dd' }}
        />
      ))}
      <span className="text-xs text-[#6b7280] font-medium whitespace-nowrap ml-1">
        Step {current} of {total}
      </span>
    </div>
  )
}

function CandidateCard({
  name, selected, onClick,
}: { name: string; selected: boolean; onClick: () => void }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <button
      onClick={onClick}
      className={cn('candidate-card w-full text-left', selected && 'selected')}
    >
      {/* Photo area */}
      <div
        className="w-full h-32 flex items-center justify-center relative overflow-hidden"
        style={{
          background: selected
            ? 'linear-gradient(135deg, #0a3d52 0%, #0f5672 100%)'
            : 'linear-gradient(135deg, #d4d2cc 0%, #bfbdb7 100%)',
        }}
      >
        <span
          className={cn(
            'font-display text-4xl font-semibold',
            selected ? 'text-white/90' : 'text-white/70'
          )}
        >
          {initials}
        </span>
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5 text-[#0a3d52]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      {/* Name */}
      <div className="px-4 py-3">
        <p className={cn('font-semibold text-sm', selected ? 'text-[#0a3d52]' : 'text-[#1a1a1a]')}>
          {name}
        </p>
        <p className="text-xs text-[#9ca3af] mt-0.5">Tap to select</p>
      </div>
    </button>
  )
}

function BallotForm({
  ballot,
  onConfirm,
}: {
  ballot: ElectionWithPositions
  onConfirm: (selections: BallotSelection[]) => void
}) {
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)

  const totalPositions = ballot.positions.length
  const allComplete = Object.keys(selections).length === totalPositions
  const pos = ballot.positions[currentStep]

  const handleNext = () => {
    if (currentStep < totalPositions - 1) setCurrentStep((s) => s + 1)
    else {
      const sel: BallotSelection[] = ballot.positions.map((p) => ({
        position_id: p.id,
        nominee_id: selections[p.id],
      }))
      onConfirm(sel)
    }
  }

  const canAdvance = !!selections[pos?.id]

  return (
    <div className="pb-4">
      {/* Election meta */}
      <p className="section-label mb-1">General Election</p>
      <h2 className="font-display text-xl font-semibold text-[#0a3d52] mb-2">{ballot.title}</h2>
      <p className="text-sm text-[#6b7280] leading-relaxed mb-4">
        Your vote is your voice. Please select one candidate for each position to participate in this election.
      </p>

      {/* Step indicator */}
      <div className="mb-6">
        <StepIndicator current={currentStep + 1} total={totalPositions} />
      </div>

      {/* Position card */}
      {pos && (
        <div>
          <div className="card p-4 mb-4">
            <h3 className="font-semibold text-[#1a1a1a] text-base mb-1">
              Select your candidate for{' '}
              <span className="text-[#0a3d52]">{pos.title}</span>
            </h3>
            <p className="text-xs text-[#9ca3af]">Only one selection is permitted for this category.</p>
          </div>

          {/* Candidates grid */}
          <div className="grid grid-cols-2 gap-3">
            {pos.nominees.map((nominee) => (
              <CandidateCard
                key={nominee.id}
                name={nominee.name}
                selected={selections[pos.id] === nominee.id}
                onClick={() => setSelections((prev) => ({ ...prev, [pos.id]: nominee.id }))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f0efec] border-t border-[#e4e2dd] px-5 py-4 z-10">
        <div className="max-w-lg mx-auto space-y-2">
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className="btn-ink"
          >
            {currentStep < totalPositions - 1 ? (
              <>
                Next Position
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              <>
                Review Ballot
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
          {currentStep > 0 && (
            <button onClick={() => setCurrentStep((s) => s - 1)} className="btn-ghost">
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Confirmation ──────────────────────────────────────────────────

function ConfirmationScreen({
  ballot, selections, onBack, onSubmit,
}: {
  ballot: ElectionWithPositions
  selections: BallotSelection[]
  onBack: () => void
  onSubmit: () => void
}) {
  const [pending, startTransition] = useTransition()

  const nomineeMap = ballot.positions.reduce<Record<string, string>>((acc, pos) => {
    pos.nominees.forEach((n) => { acc[n.id] = n.name })
    return acc
  }, {})
  const positionMap = ballot.positions.reduce<Record<string, string>>((acc, pos) => {
    acc[pos.id] = pos.title
    return acc
  }, {})

  return (
    <div className="pb-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#0a3d52] mb-5 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Edit ballot
      </button>

      <p className="section-label mb-1">Review Your Ballot</p>
      <h2 className="font-display text-xl font-semibold text-[#0a3d52] mb-2">Confirm Your Selections</h2>
      <p className="text-sm text-[#6b7280] mb-5">Check your choices carefully. Submissions are final and cannot be changed.</p>

      <div className="card divide-y divide-[#f0efec] mb-6">
        {selections.map((sel) => (
          <div key={sel.position_id} className="px-5 py-4 flex items-center justify-between">
            <span className="text-xs text-[#9ca3af] font-medium">{positionMap[sel.position_id]}</span>
            <span className="font-semibold text-[#0a3d52] text-sm">{nomineeMap[sel.nominee_id]}</span>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#f0efec] border-t border-[#e4e2dd] px-5 py-4 z-10">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => startTransition(async () => onSubmit())}
            disabled={pending}
            className="btn-ink"
          >
            {pending ? 'Submitting…' : (
              <>
                Submit Ballot
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Success (Image 4) ─────────────────────────────────────────────

function SuccessScreen({ title }: { title: string }) {
  useEffect(() => {
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min
    import('canvas-confetti').then(({ default: confetti }) => {
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }
      const interval = setInterval(() => {
        confetti({ ...defaults, particleCount: 40, colors: ['#f5a878', '#0a3d52', '#0f5672', '#fdeee4'], origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount: 40, colors: ['#f5a878', '#0a3d52', '#0f5672', '#fdeee4'], origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
      }, 280)
      setTimeout(() => clearInterval(interval), 3000)
    })
  }, [])

  return (
    <div className="flex flex-col items-center text-center pt-8 pb-6">
      {/* Peach icon square */}
      <div className="w-20 h-20 bg-[#fdeee4] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <div className="w-11 h-11 bg-[#1a1a1a] rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h2 className="font-display text-4xl font-semibold text-[#0a3d52] leading-tight mb-4">
        Vote Submitted<br />Successfully!
      </h2>

      <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs mb-8">
        Salamat sa iyong pakikilahok sa {title}. Ang iyong boto ay ligtas na naitala.
      </p>

      <div className="w-full space-y-3">
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'iHalalan', text: `I just voted in ${title}!` }).catch(() => {})
            }
          }}
          className="btn-ink"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share the Experience
        </button>
        <button className="btn-ghost">Done</button>
      </div>

      {/* Live dashboard teaser */}
      <div className="mt-8 w-full border-t border-[#e4e2dd] pt-6">
        <p className="section-label mb-3">Live Dashboard</p>
        <div className="card p-4 text-left">
          <p className="text-sm text-[#6b7280]">
            Results will be visible once the organizer closes voting. Check back after the election period ends.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────

export default function VoteClient({
  election,
}: {
  election: { id: string; title: string; status: string }
}) {
  const [step, setStep] = useState<Step>('token')
  const [token, setToken] = useState('')
  const [ballot, setBallot] = useState<ElectionWithPositions | null>(null)
  const [selections, setSelections] = useState<BallotSelection[]>([])
  const [submitError, setSubmitError] = useState('')

  return (
    <div>
      {submitError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-[#c0392b] flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {submitError}
        </div>
      )}

      {step === 'token' && (
        <TokenEntry
          election={election}
          onSuccess={(t, b) => { setToken(t); setBallot(b); setStep('ballot') }}
        />
      )}
      {step === 'ballot' && ballot && (
        <BallotForm
          ballot={ballot}
          onConfirm={(sel) => { setSelections(sel); setStep('confirm') }}
        />
      )}
      {step === 'confirm' && ballot && (
        <ConfirmationScreen
          ballot={ballot}
          selections={selections}
          onBack={() => setStep('ballot')}
          onSubmit={async () => {
            setSubmitError('')
            const result = await submitBallot(token, selections)
            if (result.error) { setSubmitError(result.error); return }
            setStep('done')
          }}
        />
      )}
      {step === 'done' && <SuccessScreen title={election.title} />}
    </div>
  )
}
