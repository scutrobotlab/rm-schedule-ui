import { describe, expect, it } from 'vitest'
import { REPRESENTATIVE_CASES, runBracketSmokeCases } from './bracket_responsive_check'
import { resolveBracketDensity } from './bracket_density'

describe('bracket responsive / season smoke', () => {
  it('2024/2025/2026 代表性赛区可构建视图模型并应用阶段筛选', () => {
    const results = runBracketSmokeCases()
    expect(results).toHaveLength(REPRESENTATIVE_CASES.length)

    const bySeason = new Map(results.map((r) => [r.season, r]))
    expect(bySeason.get(2024)?.hasMatchCard).toBe(true)
    expect(bySeason.get(2025)?.hasMatchCard).toBe(true)
    expect(bySeason.get(2026)?.hasInfoCard).toBe(true)

    for (const row of results) {
      expect(row.columnCount).toBeGreaterThan(0)
      expect(row.columnCount).toBeLessThanOrEqual(2)
      expect(row.density).toBe(resolveBracketDensity(row.columnCount))
    }
  })

  it('可见列数对应移动优先密度档位', () => {
    // 1–2 列：完整信息；3–4：收缩元信息；5+：紧凑双行
    expect(['comfortable', 'normal', 'compact']).toEqual([
      resolveBracketDensity(2),
      resolveBracketDensity(4),
      resolveBracketDensity(6),
    ])
  })
})
