/**
 * 响应式 / 赛区结构冒烟检查（可在 vitest 中运行，无需浏览器）。
 * 覆盖 2024 / 2025 / 2026 各一个不同结构赛区的视图模型构建与密度规则。
 */
import { ZoneMap } from '../constant/zone'
import { buildBracketViewModel } from './bracket_adapter'
import { resolveBracketDensity } from './bracket_density'

export interface BracketSmokeCase {
  season: number
  zoneId: number
  zoneName: string
  partIndex: number
  partName: string
  columnCount: number
  density: ReturnType<typeof resolveBracketDensity>
  connectionCount: number
  hasMatchCard: boolean
  hasInfoCard: boolean
}

/** 选取各赛季代表性赛区：单败淘汰 / 双败 / 瑞士轮分组 */
export const REPRESENTATIVE_CASES: Array<{
  season: number
  zoneId: number
  partIndex: number
}> = [
  // 2024 东部赛区 · 淘汰赛（单败）
  { season: 2024, zoneId: 498, partIndex: 2 },
  // 2025 全国赛 · 淘汰赛败者组（双败）
  { season: 2025, zoneId: 572, partIndex: 4 },
  // 2026 南部赛区 · A组前段（瑞士轮）
  { season: 2026, zoneId: 614, partIndex: 0 },
]

export function runBracketSmokeCases(): BracketSmokeCase[] {
  return REPRESENTATIVE_CASES.map(({ season, zoneId, partIndex }) => {
    const zone = ZoneMap[season]?.find((z) => z.id === zoneId)
    if (!zone) {
      throw new Error(`missing zone ${season}/${zoneId}`)
    }
    const part = zone.parts[partIndex]
    if (!part) {
      throw new Error(`missing part ${season}/${zoneId}#${partIndex}`)
    }

    const full = buildBracketViewModel({
      zoneId,
      part,
      getMatchByOrder: () => undefined,
    })
    const filtered = buildBracketViewModel({
      zoneId,
      part,
      getMatchByOrder: () => undefined,
      stageRange: {
        start: 0,
        end: Math.min(1, Math.max(0, full.columns.length - 1)),
      },
    })

    if (filtered.columns.length < 1) {
      throw new Error(`stage filter emptied bracket for ${season}/${zoneId}`)
    }
    if (filtered.columns.length > full.columns.length) {
      throw new Error(`stage filter expanded columns for ${season}/${zoneId}`)
    }

    const density = resolveBracketDensity(filtered.columns.length)
    return {
      season,
      zoneId,
      zoneName: zone.name,
      partIndex,
      partName: part.name,
      columnCount: filtered.columns.length,
      density,
      connectionCount: filtered.connections.length,
      hasMatchCard: full.columns.some((c) => c.items.some((i) => i.kind === 'match')),
      hasInfoCard: full.columns.some((c) => c.items.some((i) => i.kind === 'info')),
    }
  })
}
