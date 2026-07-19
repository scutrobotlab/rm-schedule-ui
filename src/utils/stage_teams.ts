import type { Part } from '../constant/zone'
import type { ZoneJsonData, ZoneNodeJsonData, ZoneZoneData } from '../types/zone'

function countZoneTeams(zone: ZoneZoneData): number {
  if (zone.matches.length > 0) return zone.matches.length * 2
  const fromRefs = zone.winners.length + zone.losers.length
  if (fromRefs > 0) return fromRefs
  return zone.text.length
}

function zonesForPart(node: ZoneNodeJsonData, part: Part): ZoneZoneData[] {
  if (part.type === 'group' && part.group !== 'QW') {
    const idx = part.group === 'B' ? 1 : 0
    const zone = node.data.zones[idx] ?? node.data.zones[0]
    return zone ? [zone] : []
  }
  return node.data.zones
}

/** 按节点 x 从左到右，汇总每阶段列的队伍席位数（与 stages 对齐对齐） */
export function getStageTeamCounts(jsonData: ZoneJsonData, part: Part): number[] {
  const stageCount = jsonData.stages?.length ?? 0
  if (stageCount === 0) return []

  const byX = new Map<number, number>()
  for (const node of jsonData.nodes) {
    const teams = zonesForPart(node, part).reduce((sum, zone) => sum + countZoneTeams(zone), 0)
    byX.set(node.x, (byX.get(node.x) ?? 0) + teams)
  }

  const counts = [...byX.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, n]) => n)

  if (counts.length === stageCount) return counts
  if (counts.length > stageCount) return counts.slice(0, stageCount)

  while (counts.length < stageCount) counts.push(0)
  return counts
}
