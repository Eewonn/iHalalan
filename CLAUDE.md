# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
npx tsc --noEmit  # Type-check without emitting
```

## Environment

Copy `.env.local.example` to `.env.local` and fill in:
- `MONGODB_URI` — MongoDB Atlas connection string (or any replica-set URI for Change Streams support)
- `MONGODB_DB` — database name (e.g. `ihalalan`)
- `ADMIN_PIN` — any numeric string; used as the admin password

Run `npx tsx scripts/setup-db.ts` once after pointing `.env.local` at your cluster to create all indexes.

## Architecture

**iHalalan** is a Filipino community voting/election system. Three user flows share one MongoDB Atlas backend:

### Route map
| Route | Purpose |
|---|---|
| `/` | Admin login (PIN → HTTP-only cookie) |
| `/admin` | Dashboard — list elections, create new |
| `/admin/[electionId]` | Election setup: positions, nominees, tokens, lifecycle |
| `/admin/[electionId]/results` | Live results with SSE Change Streams + projector view |
| `/vote/[electionId]` | Voter flow: enter token → ballot (one position at a time) → confirm → success |
| `/demo` | Static design preview of all four screens in phone frames — no DB needed |

### Auth model
`proxy.ts` (Next.js 16's renamed `middleware.ts`) guards all `/admin/*` routes by checking the `admin_session` cookie against `ADMIN_PIN`. There is no Supabase Auth — voters are authenticated solely by single-use 6-digit numeric tokens stored in the `voter_tokens` collection.

### Data flow
- **Server Components** fetch data from MongoDB and pass it as props to Client Components.
- **Server Actions** handle all mutations. After mutating, call `revalidatePath()` so Next.js re-delivers fresh props to the Client Component. Client Components that maintain local state (e.g. `ElectionSetupClient`) also update that state directly from the action's return value — do not rely on revalidation alone for instant UI feedback.
- **Atomic vote submission** uses a MongoDB transaction (`session.withTransaction`) with `findOneAndUpdate` on `voter_tokens` and `insertMany` on `votes` to prevent race conditions.
- **Realtime results** use a Server-Sent Events route (`/api/results/[electionId]/stream`) backed by a MongoDB Change Stream on the `votes` collection.

### MongoDB collections
- `elections` — embedded `positions[]` (each with embedded `nominees[]`); `_id` = string UUID
- `voter_tokens` — one doc per token; indexed on `{ token: 1 }` unique and `{ election_id, used }`
- `votes` — one doc per vote cast; indexed on `{ election_id }` and `{ election_id, position_id, nominee_id }`

### Key files
- `proxy.ts` — Next.js 16 middleware (exported as `proxy`, not `middleware`)
- `lib/mongo.ts` — singleton `MongoClient` (HMR-safe via `globalThis`); exports `getClient()` and `getDb()`
- `lib/mongo-collections.ts` — typed collection getters + `toRecord()` helper (`_id → id`)
- `lib/types.ts` — all shared TypeScript interfaces (`Election`, `Position`, `Nominee`, `VoterToken`, `Vote`, and their `WithX` composites)
- `lib/utils.ts` — `generateToken()` (6-digit numeric), `generateTokens(n)`, `cn()`
- `app/actions.ts` — `loginAction` / `logoutAction` (PIN auth, cookie management)
- `app/admin/[electionId]/actions.ts` — position/nominee CRUD + voting lifecycle (`openVoting`, `closeVoting`, `generateMoreTokens`, `deleteElection`)
- `app/vote/[electionId]/actions.ts` — `validateToken`, `submitBallot` (MongoDB transaction)
- `app/api/results/[electionId]/stream/route.ts` — SSE endpoint backed by MongoDB Change Stream
- `components/admin/ElectionSetupClient.tsx` — the main admin management UI; manages local `positions` state that must stay in sync with server props via `useEffect`
- `components/vote/VoteClient.tsx` — 4-step voter flow: `token → ballot → confirm → done`
- `components/results/ResultsClient.tsx` — live results with SSE EventSource + full-screen projector mode

### Design system
Tailwind v4 — configured entirely in `app/globals.css` via `@theme {}`. No `tailwind.config.js`.

Custom CSS utility classes (defined in `globals.css`, use directly in JSX):
`.btn-ink`, `.btn-ghost`, `.badge-peach`, `.card`, `.stats-card`, `.ihalalan-header`, `.section-label`, `.brand-name`, `.candidate-card`

Fonts: Cormorant Garamond (`--font-display`, `font-display` class) for headings/brand; DM Sans (`--font-sans`) for body. Both loaded via `next/font/google` in `app/layout.tsx`.

Tailwind v4 preflight sets `svg { display: block }`, which breaks SVGs inside flex buttons. The fix is already in `globals.css`: `button svg, a svg { display: inline; }`.
