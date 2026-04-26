export type ElectionStatus = 'setup' | 'voting' | 'closed'

export interface Election {
  id: string
  title: string
  status: ElectionStatus
  created_at: string
}

export interface Candidate {
  id: string
  election_id: string
  name: string
  photo_url?: string
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
  candidate_id: string
  submitted_at: string
}

export interface ElectionWithCandidates extends Election {
  candidates: Candidate[]
}

export interface BallotSelection {
  candidate_id: string
}
