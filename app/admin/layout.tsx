import { logoutAction } from '@/app/actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0efec]">
      {/* iHalalan header */}
      <header className="ihalalan-header">
        <a href="/admin" className="flex items-center gap-2.5">
          <svg className="w-5 h-5 text-white/90 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11" />
          </svg>
          <span className="brand-name text-white text-lg">iHalalan</span>
        </a>
        {/* Hamburger / sign out */}
        <form action={logoutAction}>
          <button type="submit" className="flex flex-col gap-1.5 p-1 opacity-80 hover:opacity-100 transition-opacity" aria-label="Sign out">
            <span className="block w-5 h-0.5 bg-white rounded-full" />
            <span className="block w-5 h-0.5 bg-white rounded-full" />
            <span className="block w-5 h-0.5 bg-white rounded-full" />
          </button>
        </form>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">
        {children}
      </main>
    </div>
  )
}
