import type { Part, Zone } from '../constant/zone'
import type { ZoneJsonData, ZoneLineJsonData, ZoneNodeJsonData } from '../types/zone'

/** 后段保留节点 id 前缀，避免与前段冲突（如 `#4` → `b#4`） */
const BACK_ID_PREFIX = 'b'

const FRONT_NAME_RE = /^([AB])组前段$/
const BACK_NAME_RE = /^([AB])组后段$/

export interface BracketPart {
  part: Part
  /** 原始 `zone.parts` 下标；合并项为 [前段, 后段] */
  sourceIndices: number[]
}

/**
 * 将瑞士轮前段 + 后段 JSON 合并为一张完整图。
 * - nodes：保留前段全部；后段跳过第一列后做 id 前缀与 x 平移
 * - lines：前段原样；后段两端均保留的线做 id 重映射；
 *   从被跳过第一列出发的线按 matches/winners 对齐到前段节点
 * - 晋级/淘汰节点收拢到末列，stages 为各比赛轮次 +「晋级」
 */
export function mergeFrontBackJsonData(front: ZoneJsonData, back: ZoneJsonData): ZoneJsonData {
  if (back.nodes.length === 0) {
    return consolidatePromoteDisplay({
      rootId: front.rootId,
      stages: [...(front.stages ?? [])],
      nodes: [...front.nodes],
      lines: [...(front.lines ?? [])],
    })
  }

  const backFirstX = Math.min(...back.nodes.map((n) => n.x))
  const frontLastX = Math.max(...front.nodes.map((n) => n.x))
  const xShift = frontLastX - backFirstX

  const skippedBack = back.nodes.filter((n) => n.x === backFirstX)
  const keptBack = back.nodes.filter((n) => n.x !== backFirstX)
  const skippedIds = new Set(skippedBack.map((n) => n.id))

  const frontByKey = new Map<string, string>()
  for (const node of front.nodes) {
    frontByKey.set(nodeIdentityKey(node), node.id)
  }

  const skippedToFront = new Map<string, string>()
  for (const node of skippedBack) {
    const frontId = frontByKey.get(nodeIdentityKey(node))
    if (frontId) skippedToFront.set(node.id, frontId)
  }

  const remappedKept: ZoneNodeJsonData[] = keptBack.map((node) => ({
    ...node,
    id: BACK_ID_PREFIX + node.id,
    x: node.x + xShift,
  }))

  const lines: ZoneLineJsonData[] = [...(front.lines ?? [])]
  for (const line of back.lines ?? []) {
    if (skippedIds.has(line.to)) continue

    const from = resolveBackEndpoint(line.from, skippedIds, skippedToFront)
    const to = resolveBackEndpoint(line.to, skippedIds, skippedToFront)
    if (!from || !to) continue

    lines.push({
      ...line,
      from,
      to,
    })
  }

  return consolidatePromoteDisplay({
    rootId: front.rootId,
    nodes: [...front.nodes, ...remappedKept],
    lines,
  })
}

/**
 * 把分散的晋级/淘汰节点收到最后一列，stages = 比赛轮次… +「晋级」。
 * 例如：前段晋级 / 第五轮旁的 3-1 / 后段晋级 → 统一「晋级」列。
 * 比赛轮次标签尽量沿用原 stages（去掉含「晋级/淘汰」的列名）。
 */
function consolidatePromoteDisplay(
  data: ZoneJsonData,
  options: { assignGroupRank?: boolean } = {},
): ZoneJsonData {
  const nodes = data.nodes.map((n) => ({ ...n }))
  const promoteLike = nodes.filter(isPromoteLike)
  const matchLike = nodes.filter((n) => !isPromoteLike(n))

  if (promoteLike.length === 0 || matchLike.length === 0) {
    return {
      ...data,
      nodes,
      stages: data.stages ?? [],
    }
  }

  const matchXs = uniqueSorted(matchLike.map((n) => n.x))
  const lastMatchX = matchXs[matchXs.length - 1]!
  const trailingPromoteX = uniqueSorted(promoteLike.map((n) => n.x)).find((x) => x > lastMatchX)
  const gap =
    matchXs.length >= 2 ? Math.abs(matchXs[1]! - matchXs[0]!) : 435
  const promoteX = trailingPromoteX ?? lastMatchX + gap

  const ordered = [...promoteLike].sort(comparePromoteByRecord)
  const yStep = 160
  const yStart =
    ordered.length > 0
      ? Math.min(...ordered.map((n) => n.y))
      : 0

  const assignGroupRank = options.assignGroupRank !== false

  /** 各 zones 槽独立累计名次（A/B 组各自 1–16）；名额争夺等不赋名次 */
  const nextRankByZone: number[] = []
  ordered.forEach((node, index) => {
    node.x = promoteX
    node.y = yStart + index * yStep
    node.data = {
      ...node.data,
      zones: node.data.zones.map((zone, zi) => {
        if (!assignGroupRank) {
          const next = { ...zone }
          delete next.groupRank
          return next
        }
        const seats = promoteZoneSeatCount(zone)
        const start = nextRankByZone[zi] ?? 1
        nextRankByZone[zi] = start + seats
        return {
          ...zone,
          groupRank: Array.from({ length: seats }, (_, i) => start + i),
        }
      }),
    }
  })

  const fallbackRoundLabels = [
    '第一轮',
    '第二轮',
    '第三轮',
    '第四轮',
    '第五轮',
    '第六轮',
    '第七轮',
  ]
  const preservedMatchLabels = (data.stages ?? []).filter(
    (label) => !/晋级|淘汰/.test(label),
  )
  const stages = [
    ...matchXs.map(
      (_, i) =>
        preservedMatchLabels[i] ?? fallbackRoundLabels[i] ?? `第${i + 1}轮`,
    ),
    '晋级',
  ]

  return {
    ...data,
    nodes: [...matchLike, ...ordered],
    stages,
  }
}

function promoteZoneSeatCount(zone: { winners: number[]; losers: number[]; text: string[] }): number {
  const fromRefs = zone.winners.length + zone.losers.length
  if (fromRefs > 0) return fromRefs
  return Math.max(zone.text.length, 0)
}

/** 晋级列排序：晋级全国赛置顶 → 其它晋级 → 淘汰；同组内按胜负场 */
function comparePromoteByRecord(a: ZoneNodeJsonData, b: ZoneNodeJsonData): number {
  const tierA = promoteDisplayTier(a)
  const tierB = promoteDisplayTier(b)
  if (tierA !== tierB) return tierA - tierB

  const ra = parseWinLossRecord(a.text)
  const rb = parseWinLossRecord(b.text)

  // 淘汰：无「x-y」文案（如「淘汰」）视为更晚出局，高于「淘汰 1-2」
  if (a.data.type === 'eliminate' && b.data.type === 'eliminate') {
    if (!ra && rb) return -1
    if (ra && !rb) return 1
  } else {
    if (ra && !rb) return -1
    if (!ra && rb) return 1
  }

  if (ra && rb) {
    if (ra.wins !== rb.wins) return rb.wins - ra.wins
    return ra.losses - rb.losses
  }
  return 0
}

function promoteDisplayTier(node: ZoneNodeJsonData): number {
  const text = `${node.text}${node.data.title ?? ''}`
  if (text.includes('晋级全国赛')) return 0
  if (node.data.type === 'promote') return 1
  return 2
}

function parseWinLossRecord(text: string): { wins: number; losses: number } | null {
  const match = text.match(/(\d)\s*[-:]\s*(\d)/)
  if (!match) return null
  const wins = Number(match[1])
  const losses = Number(match[2])
  if (!Number.isFinite(wins) || !Number.isFinite(losses)) return null
  return { wins, losses }
}

function isPromoteLike(node: ZoneNodeJsonData): boolean {
  return node.data.type === 'promote' || node.data.type === 'eliminate'
}

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b)
}

/**
 * 仅供 BracketPage：将 Zone.parts 中的「X组前段/后段」合并为「X组」，其余原样。
 * 所有非淘汰赛都会把晋级/淘汰收到末列，前面只保留对阵。
 */
export function resolveBracketParts(zone: Zone): BracketPart[] {
  const { parts } = zone
  const used = new Set<number>()
  const result: BracketPart[] = []

  for (let i = 0; i < parts.length; i++) {
    if (used.has(i)) continue

    const part = parts[i]
    const frontMatch = part.name.match(FRONT_NAME_RE)
    if (frontMatch) {
      const groupLetter = frontMatch[1]
      const backIndex = parts.findIndex(
        (p, j) => !used.has(j) && p.name === `${groupLetter}组后段`,
      )
      if (backIndex >= 0) {
        used.add(i)
        used.add(backIndex)
        result.push(mergeBracketPart(part, parts[backIndex], [i, backIndex]))
        continue
      }
    }

    const backMatch = part.name.match(BACK_NAME_RE)
    if (backMatch) {
      const groupLetter = backMatch[1]
      const frontIndex = parts.findIndex(
        (p, j) => !used.has(j) && p.name === `${groupLetter}组前段`,
      )
      if (frontIndex >= 0) {
        used.add(frontIndex)
        used.add(i)
        result.push(mergeBracketPart(parts[frontIndex], part, [frontIndex, i]))
        continue
      }
    }

    used.add(i)
    result.push({
      part: normalizeNonKnockoutPart(part),
      sourceIndices: [i],
    })
  }

  return result
}

/** 非淘汰赛：晋级/淘汰收拢末列；淘汰赛原样 */
function normalizeNonKnockoutPart(part: Part): Part {
  if (part.type === 'knockout') return part
  return {
    ...part,
    jsonData: consolidatePromoteDisplay(part.jsonData, {
      // 名额争夺按战绩分桶，没有小组名次语义
      assignGroupRank: !part.name.includes('名额争夺'),
    }),
  }
}

function mergeBracketPart(front: Part, back: Part, sourceIndices: number[]): BracketPart {
  const groupLetter = front.name.match(FRONT_NAME_RE)?.[1]
    ?? back.name.match(BACK_NAME_RE)?.[1]
    ?? front.group

  return {
    sourceIndices,
    part: {
      name: `${groupLetter}组`,
      type: front.type,
      group: front.group,
      jsonData: mergeFrontBackJsonData(front.jsonData, back.jsonData),
      roundOrder: front.roundOrder,
      extraTitleData: front.extraTitleData,
      extraImageData: front.extraImageData,
    },
  }
}

function resolveBackEndpoint(
  id: string,
  skippedIds: Set<string>,
  skippedToFront: Map<string, string>,
): string | null {
  if (skippedIds.has(id)) {
    return skippedToFront.get(id) ?? null
  }
  return BACK_ID_PREFIX + id
}

/** 用 matches / winners / losers 对齐前后段重叠节点 */
function nodeIdentityKey(node: ZoneNodeJsonData): string {
  const zones = node.data.zones
  const matches = zones.flatMap((z) => z.matches)
  if (matches.length > 0) return `m:${matches.join(',')}`

  const winners = zones.flatMap((z) => z.winners)
  if (winners.length > 0) return `w:${winners.join(',')}`

  const losers = zones.flatMap((z) => z.losers)
  if (losers.length > 0) return `l:${losers.join(',')}`

  return `t:${node.data.type}|text:${node.text}`
}
