export interface MpMatchRoot {
  list: MpMatch[]
}

export interface MpMatch {
  matchId: number
  redCount: number
  blueCount: number
  tieCount: number
  totalCount: number
  redRate: number
  blueRate: number
  tieRate: number
}
