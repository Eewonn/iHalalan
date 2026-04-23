/* Demo page — shows all 4 iHalalan screens side-by-side for design review */
export default function DemoPage() {
  return (
    <div className="bg-[#e8e6e1] min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl font-semibold text-[#0a3d52] mb-2">iHalalan — Design Preview</h1>
        <p className="text-[#6b7280] text-sm mb-8">All 4 screens at mobile width (390px)</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Screen 1: Voter Token Entry */}
          <PhoneFrame label="Screen 1 — Voter Login">
            <div className="flex flex-col h-full bg-[#f0efec]">
              <header className="ihalalan-header flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11" />
                  </svg>
                  <span className="brand-name text-white text-base">iHalalan</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </header>
              <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-4">
                <span className="badge-peach mb-4 text-xs">
                  <svg className="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Boses ng Bayan
                </span>
                <div className="text-center mb-5">
                  <h2 className="font-display text-2xl font-medium text-[#1a1a1a] leading-snug">
                    Ang boto mo,<br />ang tinig mo sa{' '}
                    <em className="italic text-[#0a3d52]">halalan.</em>
                  </h2>
                  <p className="text-[#6b7280] text-xs mt-2 leading-relaxed">
                    Ilagay ang iyong token para makapag-boto.
                  </p>
                </div>
                <div className="card w-full p-4">
                  <p className="section-label mb-1.5">PIN / Token</p>
                  <div className="relative mb-3">
                    <div className="w-full pl-3 pr-10 py-3 rounded-lg border border-[#e4e2dd] bg-[#fafaf8] text-[#c0bdb8] text-xs font-mono">
                      e.g. 123456
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0bdb8]">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-[#0a3d52] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2">
                    Join Election
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
                <p className="text-[#9ca3af] text-xs mt-3 flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  End-to-end encrypted participation
                </p>
              </div>
            </div>
          </PhoneFrame>

          {/* Screen 2: Admin Dashboard */}
          <PhoneFrame label="Screen 2 — Admin Dashboard">
            <div className="flex flex-col h-full bg-[#f0efec]">
              <header className="ihalalan-header flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11" />
                  </svg>
                  <span className="brand-name text-white text-base">iHalalan</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="block w-4 h-0.5 bg-white rounded-full" />
                  <span className="block w-4 h-0.5 bg-white rounded-full" />
                  <span className="block w-4 h-0.5 bg-white rounded-full" />
                </div>
              </header>
              <div className="flex-1 px-4 py-4 space-y-3">
                <div>
                  <p className="section-label mb-0.5">Admin ng Halalan</p>
                  <h2 className="font-display text-lg font-semibold text-[#1a1a1a] leading-snug">
                    Mga{' '}
                    <span className="text-[#0a3d52] italic">Halalan</span>
                  </h2>
                </div>
                <div className="stats-card flex items-center gap-3 cursor-pointer" style={{padding: '0.875rem'}}>
                  <div className="w-7 h-7 rounded-full border-2 border-white/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="text-white font-semibold text-sm">Create New Election</span>
                </div>
                <div className="stats-card" style={{padding: '1rem'}}>
                  <p className="section-label text-white/60 mb-1">Voters Participated</p>
                  <p className="font-display text-4xl font-semibold text-white leading-none">124,592</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <svg className="w-3.5 h-3.5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                    <span className="text-white/70 text-xs">Real-time verification active</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="card p-3">
                    <div className="w-7 h-7 rounded-lg bg-[#f0efec] flex items-center justify-center mb-2">
                      <svg className="w-4 h-4 text-[#0a3d52]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path strokeLinecap="round" d="M9 16l2 2 4-4" /></svg>
                    </div>
                    <p className="section-label mb-0.5">Active Elections</p>
                    <p className="font-display text-2xl font-semibold text-[#0a3d52]">08</p>
                  </div>
                  <div className="card p-3">
                    <div className="w-7 h-7 rounded-lg bg-[#f0efec] flex items-center justify-center mb-2">
                      <svg className="w-4 h-4 text-[#0a3d52]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <p className="section-label mb-0.5">Total Elections</p>
                    <p className="font-display text-2xl font-semibold text-[#0a3d52]">12</p>
                  </div>
                </div>
              </div>
            </div>
          </PhoneFrame>

          {/* Screen 3: Ballot */}
          <PhoneFrame label="Screen 3 — Ballot">
            <div className="flex flex-col h-full bg-[#f0efec]">
              <header className="ihalalan-header flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11" />
                  </svg>
                  <span className="brand-name text-white text-base">iHalalan</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              </header>
              <div className="flex-1 px-4 py-4 overflow-hidden">
                <p className="section-label mb-0.5">General Election 2024</p>
                <h2 className="font-display text-base font-semibold text-[#0a3d52] mb-2">Community Board Election</h2>
                <p className="text-xs text-[#6b7280] leading-relaxed mb-3">
                  Your vote is your voice. Please select one candidate for the position of Chairperson.
                </p>
                {/* Step indicator */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="step-segment" style={{backgroundColor: '#f5a878'}} />
                  <div className="step-segment" style={{backgroundColor: '#0a3d52'}} />
                  <div className="step-segment" style={{backgroundColor: '#e4e2dd'}} />
                  <span className="text-xs text-[#6b7280] whitespace-nowrap ml-1">Step 2 of 3</span>
                </div>
                {/* Position card */}
                <div className="card p-3 mb-3">
                  <p className="font-semibold text-[#1a1a1a] text-sm mb-0.5">Select your candidate for <span className="text-[#0a3d52]">Chairperson</span></p>
                  <p className="text-xs text-[#9ca3af]">Only one selection is permitted for this category.</p>
                </div>
                {/* Candidate card */}
                <div className="candidate-card selected">
                  <div className="w-full h-24 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #0a3d52 0%, #0f5672 100%)'}}>
                    <span className="font-display text-3xl font-semibold text-white/80">MA</span>
                    <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#0a3d52]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <p className="font-semibold text-sm text-[#0a3d52]">Maria Andrade</p>
                    <p className="text-xs text-[#9ca3af]">Selected</p>
                  </div>
                </div>
              </div>
              {/* Bottom bar */}
              <div className="bg-[#f0efec] border-t border-[#e4e2dd] px-4 py-3">
                <button className="w-full py-3 bg-[#0a3d52] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2">
                  Next Position
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </PhoneFrame>

          {/* Screen 4: Success */}
          <PhoneFrame label="Screen 4 — Vote Submitted">
            <div className="flex flex-col h-full bg-[#f0efec]">
              <header className="ihalalan-header flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11" />
                  </svg>
                  <span className="brand-name text-white text-base">iHalalan</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              </header>
              <div className="flex-1 flex flex-col items-center text-center px-5 pt-8 pb-5">
                <div className="w-16 h-16 bg-[#fdeee4] rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                  <div className="w-9 h-9 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <h2 className="font-display text-3xl font-semibold text-[#0a3d52] leading-tight mb-3">
                  Vote Submitted<br />Successfully!
                </h2>
                <p className="text-[#6b7280] text-xs leading-relaxed mb-6 max-w-[200px]">
                  Salamat sa iyong pakikilahok. Ang iyong boto ay ligtas na naitala.
                </p>
                <div className="w-full space-y-2">
                  <button className="w-full py-3 bg-[#0a3d52] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                    Share the Experience
                  </button>
                  <button className="w-full py-3 bg-[#e8e6e1] text-[#6b7280] text-sm font-semibold rounded-lg">
                    Done
                  </button>
                </div>
                <div className="w-full mt-5 border-t border-[#e4e2dd] pt-4 text-left">
                  <p className="section-label mb-2">Live Dashboard</p>
                  <div className="card p-3">
                    <p className="text-xs text-[#6b7280]">Results visible once organizer closes voting.</p>
                  </div>
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>
      </div>
    </div>
  )
}

function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#6b7280] mb-2 uppercase tracking-wider">{label}</p>
      <div className="w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-[#1a1a1a] bg-[#1a1a1a]" style={{aspectRatio: '390/844'}}>
        <div className="relative h-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
