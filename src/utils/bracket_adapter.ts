import type { Part } from '../constant/zone'
import type {
  BracketColumn,
  BracketConnection,
  BracketInfoCard,
  BracketInfoNodeType,
  BracketItem,
  BracketLane,
  BracketMatchCard,
  BracketMatchStatus,
  BracketMatchSummary,
  BracketSourceKind,
  BracketStageRange,
  BracketTeamSlot,
  BracketViewModel,
} from '../types/bracket'
import type { MatchNode, Player } from '../types/schedule'
import type { ZoneNodeJsonData, ZoneZoneData } from '../types/zone'

export type GetMatchByOrder = (
  zoneId: number,
  orderNumber: number,
  planGameCount?: number,
) => MatchNode | undefined

/** 按小组名 + 名次取实时排名席位（海外小组赛 groupLoop 等） */
export type GetGroupPlayerByRank = (
  groupName: string,
  rank: number,
) => Player | null | undefined

/** 按选手 ID 取小组榜中的实时选手数据，避免使用比赛内的旧排名快照。 */
export type GetPlayerById = (playerId: string) => Player | null | undefined

export interface BuildBracketOptions {
  zoneId: number
  part: Part
  getMatchByOrder: GetMatchByOrder
  getGroupPlayerByRank?: GetGroupPlayerByRank
  getPlayerById?: GetPlayerById
  /** 闭区间；省略则返回全部列 */
  stageRange?: BracketStageRange
}

/**
 * 将 ZoneJsonData + 实时赛程转换为原生晋级图视图模型。
 * 列按节点固定 x 坐标分组，与 stages 从左到右对齐。
 */
export function buildBracketViewModel(options: BuildBracketOptions): BracketViewModel {
  const { zoneId, part, getMatchByOrder, getGroupPlayerByRank, getPlayerById, stageRange } = options
  const jsonData = part.jsonData
  const stages = jsonData.stages ?? []
  const planGameCount = part.group === 'QW' ? 2 : 3

  const xValues = uniqueSorted(jsonData.nodes.map((n) => n.x))
  const suppressGroupRank = part.name.includes('名额争夺')
  const columns: BracketColumn[] = xValues.map((x, index) => {
    const nodes = jsonData.nodes
      .filter((n) => n.x === x)
      .sort((a, b) => a.y - b.y)

    const items: BracketItem[] = []
    for (const node of nodes) {
      const zones = zonesForPart(node, part)
      for (let zi = 0; zi < zones.length; zi++) {
        const zone = zones[zi]
        const item = toBracketItem({
          node,
          zone,
          zoneIndex: zi,
          zoneId,
          planGameCount,
          getMatchByOrder,
          getGroupPlayerByRank,
          getPlayerById,
          suppressGroupRank,
        })
        if (item) items.push(item)
      }
    }

    return {
      index,
      x,
      label: stages[index] ?? `阶段 ${index + 1}`,
      items,
    }
  })

  const maxIndex = Math.max(0, columns.length - 1)
  const range = stageRange ? clampRange(stageRange, maxIndex) : null
  const visible = range
    ? columns.filter((c) => c.index >= range.start && c.index <= range.end)
    : columns

  if (part.type === 'knockout') {
    annotateProgressLabels(columns)
  }

  return {
    columns: visible,
    connections: connectionsForColumns(jsonData.lines ?? [], visible),
    stages: padStages(stages, columns.length),
    partType: part.type,
    partGroup: part.group,
    partName: part.name,
  }
}

/** 在已有完整视图模型上按阶段范围裁剪列（不重新解析赛程） */
export function filterBracketByStageRange(
  model: BracketViewModel,
  stageRange: BracketStageRange,
): BracketViewModel {
  const maxIndex = Math.max(0, model.stages.length - 1, ...model.columns.map((c) => c.index))
  const range = clampRange(stageRange, maxIndex)
  const columns = model.columns.filter((c) => c.index >= range.start && c.index <= range.end)
  const ids = new Set(columns.flatMap((col) => col.items.map((i) => i.nodeId)))
  return {
    ...model,
    columns,
    connections: model.connections.filter(
      (c) => ids.has(c.fromNodeId) && ids.has(c.toNodeId),
    ),
  }
}

/** 仅保留两端节点均落在可见列中的连线 */
export function connectionsForColumns(
  lines: { from: string; to: string }[],
  columns: BracketColumn[],
): BracketConnection[] {
  const visibleNodeIds = new Set(columns.flatMap((c) => c.items.map((i) => i.nodeId)))
  return lines
    .filter((l) => visibleNodeIds.has(l.from) && visibleNodeIds.has(l.to))
    .map((l) => ({ fromNodeId: l.from, toNodeId: l.to }))
}

/** 与 MatchGraph / stage_teams 一致：小组按 A/B 取对应 zones 槽 */
export function zonesForPart(node: ZoneNodeJsonData, part: Part): ZoneZoneData[] {
  if (part.type === 'group' && part.group !== 'QW') {
    const idx = part.group === 'B' ? 1 : 0
    const zone = node.data.zones[idx] ?? node.data.zones[0]
    return zone ? [zone] : []
  }
  return node.data.zones
}

/**
 * 节点标题去掉末尾「第N场」，如「16进8第一轮 第1场」→「16进8第一轮」。
 */
export function formatBracketTitle(raw: string | undefined | null): string {
  return (raw ?? '').replace(/\s*第\d+场\s*$/u, '').trim()
}

/** 冠军 / 季军统一金色边框；其余对阵无特殊标记 */
export function detectLane(node: ZoneNodeJsonData): BracketLane {
  const text = `${node.text}${node.data.title ?? ''}`
  if (text.includes('季军') || text.includes('冠军')) return 'gold'
  if (text.includes('决赛') && !text.includes('半决赛')) return 'gold'
  return 'main'
}

/**
 * 淘汰赛当前进程短标签。
 * 标签描述卡片内队伍当前所处阶段，而非胜者的下一站。
 */
export function resolveBracketProgressLabel(stageLabel: string, matchTitle: string): string | null {
  const title = matchTitle || ''
  if (/季军/.test(title)) return null
  if (/冠军/.test(title)) return null

  const stage = stageLabel || ''

  if (/16进8(?:胜者组|败者组第二轮)/.test(stage)) return '12强'
  if (/16进8|十六强|十六进八/.test(stage)) return '16强'
  if (/8进4败者组第二轮/.test(stage)) return '六强'
  if (/8进4|四分之一/.test(stage)) return '八强'
  if (/半决赛/.test(stage)) return '四强'
  return null
}

function annotateProgressLabels(columns: BracketColumn[]): void {
  for (const col of columns) {
    for (const item of col.items) {
      if (item.kind !== 'match') continue
      const label = resolveBracketProgressLabel(col.label, item.title)
      if (label) item.progressLabel = label
    }
  }
}

/** 与 MatchGraph.winner 一致：仅 DONE 且胜局不等时返回胜者 */
export function resolveWinner(match: MatchNode | undefined | null): Player | null {
  if (!match || match.status !== 'DONE') return null
  if (match.redSideWinGameCount > match.blueSideWinGameCount) {
    return match.redSide.player ?? null
  }
  if (match.redSideWinGameCount < match.blueSideWinGameCount) {
    return match.blueSide.player ?? null
  }
  return null
}

/** 与 MatchGraph.loser 一致 */
export function resolveLoser(match: MatchNode | undefined | null): Player | null {
  if (!match || match.status !== 'DONE') return null
  if (match.redSideWinGameCount < match.blueSideWinGameCount) {
    return match.redSide.player ?? null
  }
  if (match.redSideWinGameCount > match.blueSideWinGameCount) {
    return match.blueSide.player ?? null
  }
  return null
}

/**
 * 将来源文案规范为紧凑占位（优先 A1 / B1 等），避免无信息的「待定」。
 */
export function formatSourceLabel(raw: string | undefined | null): string {
  const text = (raw ?? '').trim()
  if (!text) return ''

  // 历史布局常量混用「第23场 胜者」与「第23场胜者」，在适配边界统一。
  const normalized = text.replace(/^第(\d+)场\s+(胜者|败者)$/, '第$1场$2')

  if (/^[A-QW]\d{1,2}$/i.test(normalized)) {
    return normalized.toUpperCase()
  }

  // 小组赛B组 第1名 / B组 第1名 / Q组第2名
  const groupRank = normalized.match(/(?:小组赛)?([A-QW])组\s*第\s*(\d+)\s*名/i)
  if (groupRank) {
    return `${groupRank[1].toUpperCase()}${groupRank[2]}`
  }

  // 第一梯队种子 A1 / 抽签结果待定 B9
  const trailingCode = normalized.match(/\b([A-QW]\d{1,2})\s*$/i)
  if (trailingCode) {
    return trailingCode[1].toUpperCase()
  }

  // 文案中部嵌入的分组排名码
  const embedded = normalized.match(/\b([A-QW]\d{1,2})\b/i)
  if (embedded && /种子|抽签|待定|排名/.test(normalized)) {
    return embedded[1].toUpperCase()
  }

  // 同一 bracket 已明确当前组别，轮次占位无需重复展示「A组 / 小组赛A组」。
  return normalized.replace(/^(?:小组赛)?[A-QW]组\s*/i, '')
}

function toBracketItem(args: {
  node: ZoneNodeJsonData
  zone: ZoneZoneData
  zoneIndex: number
  zoneId: number
  planGameCount: number
  getMatchByOrder: GetMatchByOrder
  getGroupPlayerByRank?: GetGroupPlayerByRank
  getPlayerById?: GetPlayerById
  suppressGroupRank?: boolean
}): BracketItem | null {
  const {
    node,
    zone,
    zoneIndex,
    zoneId,
    planGameCount,
    getMatchByOrder,
    getGroupPlayerByRank,
    getPlayerById,
    suppressGroupRank,
  } = args
  const lane = detectLane(node)
  const type = node.data.type

  // 标准单场对阵卡
  if (type === 'match' && zone.matches.length === 1) {
    return buildMatchCard({
      node,
      zone,
      zoneIndex,
      orderNumber: zone.matches[0],
      lane,
      zoneId,
      planGameCount,
      getMatchByOrder,
    })
  }

  // 多场 / 晋级 / 淘汰 / 小组循环 → 说明卡，不伪造淘汰连线关系
  return buildInfoCard({
    node,
    zone,
    zoneIndex,
    lane,
    zoneId,
    planGameCount,
    getMatchByOrder,
    getGroupPlayerByRank,
    getPlayerById,
    suppressGroupRank,
  })
}

function buildMatchCard(args: {
  node: ZoneNodeJsonData
  zone: ZoneZoneData
  zoneIndex: number
  orderNumber: number
  lane: BracketLane
  zoneId: number
  planGameCount: number
  getMatchByOrder: GetMatchByOrder
}): BracketMatchCard {
  const { node, zone, zoneIndex, orderNumber, lane, zoneId, planGameCount, getMatchByOrder } = args
  const match = getMatchByOrder(zoneId, orderNumber, planGameCount)
  const redText = zone.text[0]
  const blueText = zone.text[1]
  const slots = buildPairSlots(match, redText, blueText)

  return {
    kind: 'match',
    id: `${node.id}:${zoneIndex}:${orderNumber}`,
    matchId: match?.id,
    nodeId: node.id,
    title: formatBracketTitle(node.data.title || node.text),
    orderNumber,
    status: toMatchStatus(match),
    lane,
    y: node.y,
    slots,
    redWinGames: match ? match.redSideWinGameCount : null,
    blueWinGames: match ? match.blueSideWinGameCount : null,
    planStartedAt: match?.planStartedAt,
  }
}

function buildInfoCard(args: {
  node: ZoneNodeJsonData
  zone: ZoneZoneData
  zoneIndex: number
  lane: BracketLane
  zoneId: number
  planGameCount: number
  getMatchByOrder: GetMatchByOrder
  getGroupPlayerByRank?: GetGroupPlayerByRank
  getPlayerById?: GetPlayerById
  suppressGroupRank?: boolean
}): BracketInfoCard {
  const {
    node,
    zone,
    zoneIndex,
    lane,
    zoneId,
    planGameCount,
    getMatchByOrder,
    getGroupPlayerByRank,
    getPlayerById,
    suppressGroupRank,
  } = args
  const nodeType = resolveInfoNodeType(node, zone)

  const matches: BracketMatchSummary[] = zone.matches.map((orderNumber, i) => {
    const match = getMatchByOrder(zoneId, orderNumber, planGameCount)
    const redText = zone.text[i * 2]
    const blueText = zone.text[i * 2 + 1]
    return {
      matchId: match?.id,
      orderNumber,
      status: toMatchStatus(match),
      slots: buildPairSlots(match, redText, blueText),
      redWinGames: match ? match.redSideWinGameCount : null,
      blueWinGames: match ? match.blueSideWinGameCount : null,
      planStartedAt: match?.planStartedAt,
    }
  })

  const slots = buildInfoSlots(zone, zoneId, planGameCount, getMatchByOrder, {
    suppressGroupRank,
    getGroupPlayerByRank,
    getPlayerById,
  })
  if (!suppressGroupRank && (nodeType === 'promote' || nodeType === 'eliminate')) {
    applyGroupRanks(slots, zone)
  }

  return {
    kind: 'info',
    id: `${node.id}:${zoneIndex}:info`,
    nodeId: node.id,
    title: formatBracketTitle(node.data.title || node.text),
    nodeType,
    lane,
    y: node.y,
    slots,
    matches,
  }
}

/** 晋级/淘汰席位：结构名次兜底，完赛后优先用球员小组名次，并按名次排序 */
function applyGroupRanks(slots: BracketTeamSlot[], zone: ZoneZoneData): void {
  for (let i = 0; i < slots.length; i++) {
    if (slots[i].groupRank == null && zone.groupRank?.[i] != null) {
      slots[i].groupRank = zone.groupRank[i]
    }
  }
  slots.sort((a, b) => (a.groupRank ?? 999) - (b.groupRank ?? 999))
}

function resolveInfoNodeType(node: ZoneNodeJsonData, zone: ZoneZoneData): BracketInfoNodeType {
  if (node.data.type === 'promote') return 'promote'
  if (node.data.type === 'eliminate') return 'eliminate'
  if (node.data.type === 'groupLoop') return 'groupLoop'
  if (zone.matches.length > 1) return 'matchGroup'
  return 'matchGroup'
}

function buildInfoSlots(
  zone: ZoneZoneData,
  zoneId: number,
  planGameCount: number,
  getMatchByOrder: GetMatchByOrder,
  options: {
    suppressGroupRank?: boolean
    getGroupPlayerByRank?: GetGroupPlayerByRank
    getPlayerById?: GetPlayerById
  } = {},
): BracketTeamSlot[] {
  const slots: BracketTeamSlot[] = []
  const suppressGroupRank = Boolean(options.suppressGroupRank)
  const getGroupPlayerByRank = options.getGroupPlayerByRank
  const getPlayerById = options.getPlayerById

  for (let i = 0; i < zone.winners.length; i++) {
    const match = getMatchByOrder(zoneId, zone.winners[i], planGameCount)
    const snapshotPlayer = resolveWinner(match)
    const player = resolveLivePlayer(snapshotPlayer, getPlayerById)
    const fallback = zone.text[slots.length]
    const structural = suppressGroupRank ? undefined : zone.groupRank?.[slots.length]
    slots.push(
      playerToSlot(player, fallback, false, false, {
        matchDone: suppressGroupRank ? false : match?.status === 'DONE',
        structuralRank: structural,
      }),
    )
  }

  for (let i = 0; i < zone.losers.length; i++) {
    const match = getMatchByOrder(zoneId, zone.losers[i], planGameCount)
    const snapshotPlayer = resolveLoser(match)
    const player = resolveLivePlayer(snapshotPlayer, getPlayerById)
    const fallback = zone.text[slots.length]
    const structural = suppressGroupRank ? undefined : zone.groupRank?.[slots.length]
    slots.push(
      playerToSlot(player, fallback, false, false, {
        matchDone: suppressGroupRank ? false : match?.status === 'DONE',
        structuralRank: structural,
      }),
    )
  }

  // 瑞士轮第一轮等：winners/losers 为空，队伍直接挂在本轮 matches 上
  if (slots.length === 0 && zone.matches.length > 0) {
    for (let i = 0; i < zone.matches.length; i++) {
      const match = getMatchByOrder(zoneId, zone.matches[i], planGameCount)
      const [red, blue] = buildPairSlots(match, zone.text[i * 2], zone.text[i * 2 + 1])
      slots.push(red, blue)
    }
    return slots
  }

  // 海外小组赛等 groupLoop：按 group + groupRank 解析实时排名队伍
  if (slots.length === 0 && zone.groupRank?.length) {
    const displayRanks = resolveGroupLoopDisplayRanks(zone, getGroupPlayerByRank)
    for (let i = 0; i < zone.groupRank.length; i++) {
      const structuralRank = zone.groupRank[i]
      const label = zone.text[i] ?? `${zone.group ?? ''}${structuralRank}`
      const player = (
        zone.group && getGroupPlayerByRank
          ? getGroupPlayerByRank(zone.group, structuralRank)
          : undefined
      ) ?? null
      const displayRank = suppressGroupRank ? undefined : displayRanks[i]
      slots.push(
        playerToSlot(player, label, false, false, {
          matchDone: Boolean(player && player.score !== 0),
          structuralRank: displayRank,
        }),
      )
    }
    return slots
  }

  for (let i = slots.length; i < zone.text.length; i++) {
    slots.push(sourceSlot(zone.text[i]))
  }

  return slots
}

function resolveLivePlayer(
  player: Player | null | undefined,
  getPlayerById?: GetPlayerById,
): Player | null | undefined {
  if (!player?.id || !getPlayerById) return player
  return getPlayerById(player.id) ?? player
}

/**
 * 与旧 MatchGraph.groupTrulyRank 对齐：小组尚未开打（全员 score=0）时名次统一显示 1，
 * 否则按结构名次 1/2/3… 展示。
 */
function resolveGroupLoopDisplayRanks(
  zone: ZoneZoneData,
  getGroupPlayerByRank?: GetGroupPlayerByRank,
): number[] {
  const ranks = zone.groupRank ?? []
  if (!zone.group || !getGroupPlayerByRank || ranks.length === 0) return ranks

  let anyPlayer = false
  let allZero = true
  for (const rank of ranks) {
    const player = getGroupPlayerByRank(zone.group, rank)
    if (!player) continue
    anyPlayer = true
    if (player.score !== 0) allZero = false
  }
  if (anyPlayer && allZero) return ranks.map(() => 1)
  return ranks
}

function buildPairSlots(
  match: MatchNode | undefined,
  redText?: string,
  blueText?: string,
): [BracketTeamSlot, BracketTeamSlot] {
  const winner = resolveWinner(match)
  const loser = resolveLoser(match)
  const redPlayer = match?.redSide?.player ?? null
  const bluePlayer = match?.blueSide?.player ?? null

  const redIsWinner = Boolean(winner && redPlayer && winner.id === redPlayer.id)
  const blueIsWinner = Boolean(winner && bluePlayer && winner.id === bluePlayer.id)
  const redIsLoser = Boolean(loser && redPlayer && loser.id === redPlayer.id)
  const blueIsLoser = Boolean(loser && bluePlayer && loser.id === bluePlayer.id)

  return [
    playerToSlot(redPlayer, redText, redIsWinner, redIsLoser),
    playerToSlot(bluePlayer, blueText, blueIsWinner, blueIsLoser),
  ]
}

function playerToSlot(
  player: Player | null | undefined,
  sourceText: string | undefined,
  isWinner: boolean,
  isLoser: boolean,
  rankOpts?: { matchDone?: boolean; structuralRank?: number },
): BracketTeamSlot {
  const groupRank = resolveSlotGroupRank(player, rankOpts)
  const team = player?.team
  if (team?.collegeName || team?.name) {
    return {
      displayName: team.collegeName || team.name,
      sourceLabel: sourceText ? formatSourceLabel(sourceText) : undefined,
      sourceKind: 'team',
      collegeName: team.collegeName,
      collegeLogo: team.collegeLogo,
      playerId: player?.id,
      groupRank,
      isWinner,
      isLoser,
    }
  }
  return sourceSlot(sourceText, groupRank)
}

function resolveSlotGroupRank(
  player: Player | null | undefined,
  rankOpts?: { matchDone?: boolean; structuralRank?: number },
): number | undefined {
  if (rankOpts?.matchDone && player && player.rank > 0) return player.rank
  return rankOpts?.structuralRank
}

function sourceSlot(sourceText: string | undefined, groupRank?: number): BracketTeamSlot {
  const label = formatSourceLabel(sourceText)
  if (!label) {
    return {
      displayName: '',
      sourceKind: 'empty',
      groupRank,
      isWinner: false,
      isLoser: false,
    }
  }
  const kind: BracketSourceKind = /^[A-QW]\d{1,2}$/.test(label) ? 'rank' : 'source'
  return {
    displayName: label,
    sourceLabel: (sourceText ?? '').trim() || label,
    sourceKind: kind,
    groupRank,
    isWinner: false,
    isLoser: false,
  }
}

function toMatchStatus(match: MatchNode | undefined): BracketMatchStatus {
  if (!match) return 'PENDING'
  if (match.status === 'DONE') return 'DONE'
  if (match.status === 'STARTED') return 'STARTED'
  if (match.status === 'PENDING') return 'PENDING'
  return 'UNKNOWN'
}

function clampRange(range: BracketStageRange, maxIndex: number): BracketStageRange {
  let start = Math.min(Math.max(0, Math.round(range.start)), maxIndex)
  let end = Math.min(Math.max(0, Math.round(range.end)), maxIndex)
  if (start > end) {
    const tmp = start
    start = end
    end = tmp
  }
  return { start, end }
}

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b)
}

function padStages(stages: string[], columnCount: number): string[] {
  if (stages.length >= columnCount) return stages.slice(0, Math.max(stages.length, columnCount))
  const padded = [...stages]
  while (padded.length < columnCount) {
    padded.push(`阶段 ${padded.length + 1}`)
  }
  return padded
}
