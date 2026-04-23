import { loginAction } from './actions'
import LoginForm from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f0efec] flex flex-col">
      {/* iHalalan header */}
      <header className="ihalalan-header">
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

      {/* Body */}
      <div className="flex-1 flex flex-col items-center px-5 pt-10 pb-8 max-w-lg mx-auto w-full">
        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl leading-snug text-[#0a3d52] font-medium">
            Pamahalaan ang<br />
            <em className="italic text-[#0a3d52]">iHalalan.</em>
          </h1>
          <p className="text-[#6b7280] text-sm mt-4 leading-relaxed max-w-xs mx-auto">
            Ilagay ang iyong admin PIN para pamahalaan ang mga halalan.
          </p>
        </div>

        {/* Card */}
        <div className="card w-full p-6 mb-4">
          <LoginForm action={loginAction} />
        </div>

        {/* Footer note */}
        <p className="text-xs text-[#9ca3af] text-center flex items-center gap-1.5 mt-2">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Restricted access — authorized personnel only
        </p>
      </div>
    </div>
  )
}
