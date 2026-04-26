import { redirect } from 'next/navigation'
import Link from 'next/link'
import { electionsCollection } from '@/lib/mongo-collections'
import { randomUUID } from 'crypto'

async function createElection(formData: FormData) {
  'use server'
  const title = (formData.get('title') as string).trim()
  if (!title) return

  const elections = await electionsCollection()
  const id = randomUUID()
  await elections.insertOne({
    _id: id,
    title,
    status: 'setup',
    created_at: new Date().toISOString(),
    positions: [],
  })

  redirect(`/admin/${id}`)
}

export default function NewElectionPage() {
  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#0a3d52] mb-6 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to elections
      </Link>

      <p className="section-label mb-1">New Election</p>
      <h1 className="font-display text-2xl font-semibold text-[#0a3d52] mb-5">
        Create a Civic Event
      </h1>

      <div className="card p-6">
        <form action={createElection} className="space-y-4">
          <div>
            <p className="section-label mb-1.5">Election Title</p>
            <input
              id="title"
              name="title"
              type="text"
              required
              autoFocus
              placeholder="e.g. Spring 2025 Club Elections"
              className="w-full px-4 py-3.5 rounded-lg border border-[#e4e2dd] bg-[#fafaf8] text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0a3d52]/20 focus:border-[#0a3d52] placeholder:text-[#c0bdb8]"
            />
          </div>

          <button type="submit" className="btn-ink">
            Create Election
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
