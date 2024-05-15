export interface ScheduleData {
  event: Event
  last_event: LastEvent
}

export interface Event {
  title: string
  zones: Zones
}

export interface Zones {
  nodes: ZoneNode[]
}

export interface ZoneNode {
  id: string
  matchDates: string[]
  name: string
  zoneType: string
  groups: Groups
  groupMatches: Matches
  knockoutMatches: Matches
}

export interface Groups {
  nodes: GroupNode[]
}

export interface GroupNode {
  id: string
  name: string
  players: Players
}

export interface Players {
  nodes: PlayerNode[]
}

export interface PlayerNode {
  id: string
  name: string
  rank: number
  score: number
  teamId?: string
  team?: Team
}

export interface Team {
  id: string
  name: string
  collegeLogo: string
  collegeName: string
}

export interface Matches {
  nodes: MatchNode[]
}

export interface MatchNode {
  id: string
  groupId: string
  matchType: string
  orderNumber: number
  planGameCount: number
  planStartedAt: string
  result: string
  slug: any
  slugName: string
  status: string
  winnerPlaceholdName: any
  loserPlaceholdName: any
  blueSideId: string
  blueSideScore: number
  blueSideWinGameCount: number
  blueSide: BlueSide
  redSideId: string
  redSideScore: number
  redSideWinGameCount: number
  redSide: RedSide
}

export interface BlueSide {
  id: string
  preparedStatus: string
  fillSourceId?: string
  fillSourceType?: string
  fillSourceNumber?: number
  fillStatus: string
  playerId?: string
  player?: Player
  updatedAt: string
}

export interface Player {
  id: string
  name: string
  rank: number
  score: number
  teamId?: string
  team?: Team
}

export interface RedSide {
  id: string
  preparedStatus: string
  fillSourceId?: string
  fillSourceType?: string
  fillSourceNumber?: number
  fillStatus: string
  playerId?: string
  player?: Player
  updatedAt: string
}

export interface LastEvent {
  title: string
  zones: Zones
}
