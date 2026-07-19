import { describe, expect, it } from 'vitest'
import { computeKnockoutLayout, shiftLayoutToAnchor } from './bracket_tree_layout'
import type { BracketColumn, BracketConnection } from '../types/bracket'

function col(index: number, ids: string[]): BracketColumn {
  return {
    index,
    x: index * 100,
    label: `R${index}`,
    items: ids.map((nodeId, i) => ({
      kind: 'match' as const,
      id: nodeId,
      nodeId,
      title: nodeId,
      orderNumber: i + 1,
      status: 'PENDING' as const,
      lane: 'main' as const,
      y: i * 100,
      slots: [
        { displayName: 'A', sourceKind: 'empty' as const, isWinner: false, isLoser: false },
        { displayName: 'B', sourceKind: 'empty' as const, isWinner: false, isLoser: false },
      ],
      redWinGames: null,
      blueWinGames: null,
    })),
  }
}

describe('computeKnockoutLayout', () => {
  it('右侧节点垂直居中于左侧相邻两个 feeder', () => {
    const columns = [col(0, ['#1', '#2', '#3', '#4']), col(1, ['#5', '#6'])]
    const connections: BracketConnection[] = [
      { fromNodeId: '#1', toNodeId: '#5' },
      { fromNodeId: '#2', toNodeId: '#5' },
      { fromNodeId: '#3', toNodeId: '#6' },
      { fromNodeId: '#4', toNodeId: '#6' },
    ]
    const H = 40
    const gap = 8
    const heights = Object.fromEntries(
      ['#1', '#2', '#3', '#4', '#5', '#6'].map((id) => [id, H]),
    )

    const { tops } = computeKnockoutLayout({ columns, connections, heights, gap })

    // 左列顺序堆叠中心
    const c1 = H / 2
    const c2 = H + gap + H / 2
    const c3 = 2 * (H + gap) + H / 2
    const c4 = 3 * (H + gap) + H / 2

    expect(tops['#5'] + H / 2).toBeCloseTo((c1 + c2) / 2)
    expect(tops['#6'] + H / 2).toBeCloseTo((c3 + c4) / 2)
  })

  it('锚点列贴顶后最上节点 top 为 0，相对关系保持', () => {
    const columns = [col(0, ['#1', '#2', '#3', '#4']), col(1, ['#5', '#6'])]
    const connections: BracketConnection[] = [
      { fromNodeId: '#1', toNodeId: '#5' },
      { fromNodeId: '#2', toNodeId: '#5' },
      { fromNodeId: '#3', toNodeId: '#6' },
      { fromNodeId: '#4', toNodeId: '#6' },
    ]
    const H = 40
    const gap = 8
    const heights = Object.fromEntries(
      ['#1', '#2', '#3', '#4', '#5', '#6'].map((id) => [id, H]),
    )
    const raw = computeKnockoutLayout({ columns, connections, heights, gap })
    const { tops } = shiftLayoutToAnchor(raw, 1, columns, heights)

    expect(Math.min(tops['#5'], tops['#6'])).toBeCloseTo(0)
    expect(tops['#6'] - tops['#5']).toBeCloseTo(raw.tops['#6'] - raw.tops['#5'])
    expect(tops['#1']).toBeLessThan(0)
  })
})
