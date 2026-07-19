import type { GroupType } from './zone'

/** 双败 / 季军等泳道标记 */
export type BracketLane = 'main' | 'winners' | 'losers' | 'third'

export type BracketMatchStatus = 'UNKNOWN' | 'PENDING' | 'STARTED' | 'DONE'

/** 槽位内容来源 */
export type BracketSourceKind = 'team' | 'source' | 'rank' | 'empty'

export type BracketInfoNodeType = 'promote' | 'eliminate' | 'groupLoop' | 'matchGroup'

export interface BracketStageRange {
  start: number
  end: number
}

export interface BracketTeamSlot {
  /** 主展示名：校名 / A1 / 来源文案 */
  displayName: string
  /** 原始来源文案（未确定队伍时） */
  sourceLabel?: string
  sourceKind: BracketSourceKind
  collegeName?: string
  collegeLogo?: string
  playerId?: string
  /** 小组内名次（晋级列 1–16 等） */
  groupRank?: number
  isWinner: boolean
  isLoser: boolean
}

export interface BracketMatchCard {
  kind: 'match'
  id: string
  nodeId: string
  title: string
  orderNumber: number
  status: BracketMatchStatus
  lane: BracketLane
  y: number
  slots: [BracketTeamSlot, BracketTeamSlot]
  redWinGames: number | null
  blueWinGames: number | null
  planStartedAt?: string
}

/** 多场次节点内的单场摘要（瑞士轮等） */
export interface BracketMatchSummary {
  orderNumber: number
  status: BracketMatchStatus
  slots: [BracketTeamSlot, BracketTeamSlot]
  redWinGames: number | null
  blueWinGames: number | null
}

export interface BracketInfoCard {
  kind: 'info'
  id: string
  nodeId: string
  title: string
  nodeType: BracketInfoNodeType
  lane: BracketLane
  y: number
  /** 晋级/淘汰/小组排名等席位 */
  slots: BracketTeamSlot[]
  /** 无法拆成独立对阵卡时的多场摘要 */
  matches: BracketMatchSummary[]
}

export type BracketItem = BracketMatchCard | BracketInfoCard

export interface BracketColumn {
  /** 与 stages 对齐的列下标 */
  index: number
  x: number
  label: string
  items: BracketItem[]
}

/** 列间连线（来自 ZoneJsonData.lines） */
export interface BracketConnection {
  fromNodeId: string
  toNodeId: string
}

export interface BracketViewModel {
  columns: BracketColumn[]
  connections: BracketConnection[]
  stages: string[]
  partType: 'group' | 'knockout'
  partGroup: GroupType
  partName: string
}
