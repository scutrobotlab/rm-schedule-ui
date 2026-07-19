import type { Part } from '../constant/zone'
import type { ZoneJsonData, ZoneNodeJsonData, ZoneZoneData } from '../types/zone'

interface ColumnStats {
  matchPart: number
  matchWinners: number
  promote: number
  eliminate: number
}

/** 末列回收的晋级/淘汰，按战绩锁定轮次回填（1-based） */
interface DeferredLocks {
  /** round → promote seats */
  promoteByRound: Map<number, number>
}

function zonesForPart(node: ZoneNodeJsonData, part: Part): ZoneZoneData[] {
  if (part.type === 'group' && part.group !== 'QW') {
    const idx = part.group === 'B' ? 1 : 0
    const zone = node.data.zones[idx] ?? node.data.zones[0]
    return zone ? [zone] : []
  }
  return node.data.zones
}

function isThirdPlaceNode(node: ZoneNodeJsonData): boolean {
  return node.text.includes('季军')
}

function zoneSeatCount(zone: ZoneZoneData): number {
  if (zone.matches.length > 0) return zone.matches.length * 2
  const fromRefs = zone.winners.length + zone.losers.length
  if (fromRefs > 0) return fromRefs
  return zone.text.length
}

function buildColumnStats(jsonData: ZoneJsonData, part: Part): {
  cols: ColumnStats[]
  xValues: number[]
} {
  const byX = new Map<number, ColumnStats>()

  for (const node of jsonData.nodes) {
    if (isThirdPlaceNode(node)) continue

    let stats = byX.get(node.x)
    if (!stats) {
      stats = { matchPart: 0, matchWinners: 0, promote: 0, eliminate: 0 }
      byX.set(node.x, stats)
    }

    const zones = zonesForPart(node, part)
    const type = node.data.type
    for (const zone of zones) {
      if (type === 'eliminate') {
        stats.eliminate += zoneSeatCount(zone)
      } else if (type === 'promote') {
        stats.promote += zoneSeatCount(zone)
      } else if (zone.matches.length > 0) {
        stats.matchPart += zone.matches.length * 2
        stats.matchWinners += zone.matches.length
      } else {
        stats.promote += zoneSeatCount(zone)
      }
    }
  }

  const sorted = [...byX.entries()].sort((a, b) => a[0] - b[0])
  return {
    xValues: sorted.map(([x]) => x),
    cols: sorted.map(([, stats]) => stats),
  }
}

/**
 * 仅回收「最后一场对阵列之后」的晋级节点，按 W-L 战绩锁定轮次回填。
 * 避免与前段晋级等中间结果列重复计数。
 */
function buildDeferredPromoteLocks(
  jsonData: ZoneJsonData,
  part: Part,
  cols: ColumnStats[],
  xValues: number[],
): DeferredLocks {
  const promoteByRound = new Map<number, number>()
  let lastMatchCol = -1
  for (let i = 0; i < cols.length; i++) {
    if (cols[i].matchPart > 0) lastMatchCol = i
  }
  if (lastMatchCol < 0 || lastMatchCol >= cols.length - 1) {
    return { promoteByRound }
  }

  const trailingXs = new Set(xValues.slice(lastMatchCol + 1))

  for (const node of jsonData.nodes) {
    if (isThirdPlaceNode(node)) continue
    if (!trailingXs.has(node.x)) continue
    if (node.data.type !== 'promote') continue

    const lockRound = recordLockRound(node.text)
    if (lockRound == null) continue

    const zones = zonesForPart(node, part)
    let seats = 0
    for (const zone of zones) seats += zoneSeatCount(zone)
    promoteByRound.set(lockRound, (promoteByRound.get(lockRound) ?? 0) + seats)
  }

  return { promoteByRound }
}

/** 「晋级 3-0」→ 锁定于第 3 轮（胜场+负场） */
function recordLockRound(text: string): number | null {
  const match = text.match(/(\d)\s*[-:]\s*(\d)/)
  if (!match) return null
  const wins = Number(match[1])
  const losses = Number(match[2])
  if (!Number.isFinite(wins) || !Number.isFinite(losses)) return null
  const round = wins + losses
  return round > 0 ? round : null
}

function matchRoundOf(cols: ColumnStats[], index: number): number | null {
  if (cols[index].matchPart <= 0) return null
  let round = 0
  for (let i = 0; i <= index; i++) {
    if (cols[i].matchPart > 0) round++
  }
  return round > 0 ? round : null
}

function deferredPromoteThrough(locks: DeferredLocks, round: number): number {
  let sum = 0
  for (const [r, seats] of locks.promoteByRound) {
    if (r <= round) sum += seats
  }
  return sum
}

function priorPromote(cols: ColumnStats[], index: number): number {
  let sum = 0
  for (let i = 0; i < index; i++) sum += cols[i].promote
  return sum
}

function remainingAfterColumn(
  cols: ColumnStats[],
  index: number,
  locks: DeferredLocks,
): number {
  const cur = cols[index]
  const next = cols[index + 1]
  const next2 = cols[index + 2]
  const matchRound = matchRoundOf(cols, index)
  const deferredLocked =
    matchRound != null ? deferredPromoteThrough(locks, matchRound) : 0
  const lockedPromote = priorPromote(cols, index) + cur.promote + deferredLocked

  if (!next) {
    // 图段末列：瑞士轮对阵双方通常都晋级下一赛段，不能只用胜者数
    if (cur.matchPart > 0) {
      return lockedPromote + cur.matchPart
    }
    return Math.max(lockedPromote, cur.matchWinners, 1)
  }

  const nextMatch = next.matchPart
  const nextThroughput = next.matchPart + next.promote + next.eliminate

  if (cur.matchPart > 0) {
    if (nextMatch > 0) {
      // 瑞士轮：败者仍进入后续列；淘汰赛：规模缩小
      if (nextThroughput >= cur.matchPart || nextMatch >= cur.matchPart) {
        return lockedPromote + cur.matchPart
      }
      // 规模下降：仍在对阵 + 已锁定晋级
      return lockedPromote + nextMatch
    }
    // 下一列无对阵
    if (next2 && next2.matchPart > 0) {
      return lockedPromote + next.promote + next2.matchPart
    }
    // 下一列是终端晋级/淘汰结果列
    return Math.max(lockedPromote, next.promote, cur.matchWinners, 1)
  }

  // 纯晋级/淘汰列：已锁定晋级 + 后续仍在对阵的队伍
  if (nextMatch > 0) {
    return lockedPromote + nextMatch
  }
  return Math.max(lockedPromote + next.promote, 1)
}

/**
 * 各阶段「当前轮次结束后」剩余队伍数（与 stages 从左到右对齐）。
 * 例如淘汰赛半决赛 → 2（晋级决赛）。
 * 合并前后段后，末列晋级会按战绩回填到对应轮次的「已锁定晋级」。
 */
export function getStageTeamCounts(jsonData: ZoneJsonData, part: Part): number[] {
  const stageCount = jsonData.stages?.length ?? 0
  if (stageCount === 0) return []

  const { cols, xValues } = buildColumnStats(jsonData, part)
  const locks = buildDeferredPromoteLocks(jsonData, part, cols, xValues)
  const counts = cols.map((_, index) => remainingAfterColumn(cols, index, locks))

  if (counts.length === stageCount) return counts
  if (counts.length > stageCount) return counts.slice(0, stageCount)

  while (counts.length < stageCount) counts.push(1)
  return counts
}
