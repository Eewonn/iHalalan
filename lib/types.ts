export type ElectionStatus = 'setup' | 'voting' | 'closed'

export interface Election {
  id: string
  title: string
  status: ElectionStatus
  created_at: string
}

export interface Nominee {
  id: string
  election_id: string
  name: string
  image_url?: string
  bio?: string
  background?: string
  platform?: string
  sort_order: number
  created_at: string
}

export interface VoterToken {
  id: string
  election_id: string
  token: string
  used: boolean
  used_at: string | null
  created_at: string
}

export interface Vote {
  id: string
  token_id: string
  election_id: string
  nominee_id: string
  submitted_at: string
}

export interface ElectionWithNominees extends Election {
  nominees: Nominee[]
}

// Vote selection during ballot filling
export interface BallotSelection {
  nominee_id: string
}
