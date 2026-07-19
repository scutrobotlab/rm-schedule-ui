import type { Part } from '../constant/zone'
import type { ZoneJsonData, ZoneNodeJsonData, ZoneZoneData } from '../types/zone'

interface ColumnStats {
  matchPart: number
  matchWinners: number
  promote: number
  eliminate: number
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

function buildColumnStats(jsonData: ZoneJsonData, part: Part): ColumnStats[] {
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

  return [...byX.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, stats]) => stats)
}

function priorPromote(cols: ColumnStats[], index: number): number {
  let sum = 0
  for (let i = 0; i < index; i++) sum += cols[i].promote
  return sum
}

function remainingAfterColumn(cols: ColumnStats[], index: number): number {
  const cur = cols[index]
  const next = cols[index + 1]
  const next2 = cols[index + 2]
  const lockedPromote = priorPromote(cols, index) + cur.promote

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
    // 瑞士轮：败者仍进入后续列；淘汰赛：规模缩小
    if (nextThroughput >= cur.matchPart || nextMatch >= cur.matchPart) {
      return lockedPromote + cur.matchPart
    }
    if (nextMatch > 0) {
      return lockedPromote + nextMatch
    }
    // 下一列只是晋级/淘汰节点时，再看再下一列对阵
    if (next2 && next2.matchPart > 0) {
      return lockedPromote + next.promote + next2.matchPart
    }
    return Math.max(lockedPromote + next.promote, cur.matchWinners, 1)
  }

  // 纯晋级/淘汰列：已锁定晋级 + 后续仍在对阵的队伍
  // lockedPromote 已含本列 promote；下一列 promote 另计时避免把本列再加一次
  if (nextMatch > 0) {
    return lockedPromote + nextMatch
  }
  return Math.max(lockedPromote + next.promote, 1)
}

/**
 * 各阶段「当前轮次结束后」剩余队伍数（与 stages 从左到右对齐）。
 * 例如淘汰赛半决赛 → 2（晋级决赛）。
 */
export function getStageTeamCounts(jsonData: ZoneJsonData, part: Part): number[] {
  const stageCount = jsonData.stages?.length ?? 0
  if (stageCount === 0) return []

  const cols = buildColumnStats(jsonData, part)
  const counts = cols.map((_, index) => remainingAfterColumn(cols, index))

  if (counts.length === stageCount) return counts
  if (counts.length > stageCount) return counts.slice(0, stageCount)

  while (counts.length < stageCount) counts.push(1)
  return counts
}
