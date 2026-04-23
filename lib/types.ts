export type ElectionStatus = 'setup' | 'voting' | 'closed'

export interface Election {
  id: string
  title: string
  status: ElectionStatus
  created_at: string
}

export interface Position {
  id: string
  election_id: string
  title: string
  sort_order: number
  created_at: string
}

export interface Nominee {
  id: string
  position_id: string
  name: string
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
  position_id: string
  nominee_id: string
  submitted_at: string
}

export interface PositionWithNominees extends Position {
  nominees: Nominee[]
}

export interface ElectionWithPositions extends Election {
  positions: PositionWithNominees[]
}

// Vote selection during ballot filling
export interface BallotSelection {
  position_id: string
  nominee_id: string
}
