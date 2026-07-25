import { describe, expect, it } from 'vitest'
import {
  GroupZoneGroup1JsonData,
  GroupZoneGroup2JsonData,
} from '../constant/group_zone'
import { ZoneMap, type Part, type Zone } from '../constant/zone'
import { buildBracketViewModel } from './bracket_adapter'
import { mergeFrontBackJsonData, resolveBracketParts } from './bracket_part_merge'

describe('mergeFrontBackJsonData', () => {
  it('合并 GroupZoneGroup1 + GroupZoneGroup2：5 轮 + 统一晋级列、无重复第四轮 match', () => {
    const merged = mergeFrontBackJsonData(GroupZoneGroup1JsonData, GroupZoneGroup2JsonData)

    expect(merged.stages).toEqual([
      '第一轮',
      '第二轮',
      '第三轮',
      '第四轮',
      '第五轮',
      '晋级',
    ])
    expect(merged.stages).toHaveLength(6)

    const fourthRoundMatchKeys = merged.nodes
      .filter((n) => n.data.type === 'match' && n.text.includes('第四轮'))
      .map((n) => n.data.zones.flatMap((z) => z.matches).join(','))
    expect(fourthRoundMatchKeys).toHaveLength(new Set(fourthRoundMatchKeys).size)

    const promoteLike = merged.nodes
      .filter((n) => n.data.type === 'promote' || n.data.type === 'eliminate')
      .sort((a, b) => a.y - b.y)
    expect(promoteLike.length).toBeGreaterThanOrEqual(4)
    const promoteXs = new Set(promoteLike.map((n) => n.x))
    expect(promoteXs.size).toBe(1)
    expect(promoteLike.map((n) => n.text.match(/(\d-\d)/)?.[1])).toEqual([
      '3-0',
      '3-1',
      '3-2',
      '2-3',
      '1-3',
      '0-3',
    ])

    const ranks = promoteLike.flatMap((n) => n.data.zones[0]?.groupRank ?? [])
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])

    for (const node of GroupZoneGroup1JsonData.nodes) {
      expect(merged.nodes.some((n) => n.id === node.id)).toBe(true)
    }
    const backKeptIds = GroupZoneGroup2JsonData.nodes
      .filter((n) => n.x !== Math.min(...GroupZoneGroup2JsonData.nodes.map((x) => x.x)))
      .map((n) => n.id)
    for (const id of backKeptIds) {
      expect(merged.nodes.some((n) => n.id === `b${id}`)).toBe(true)
    }
  })

  it('后段第一列出发的线对齐到前段第四轮节点', () => {
    const merged = mergeFrontBackJsonData(GroupZoneGroup1JsonData, GroupZoneGroup2JsonData)
    // back #2(第四轮 2-1) → front #9；back #3 → front #10
    const fromFrontFourth = merged.lines.filter(
      (l) => l.from === '#9' || l.from === '#10',
    )
    expect(fromFrontFourth.some((l) => l.to.startsWith('b'))).toBe(true)
  })
})

describe('resolveBracketParts', () => {
  it('含前后段的赛区合并为 A组/B组，淘汰赛仍独立', () => {
    const zone = ZoneMap[2026]?.find((z) => z.name === '南部赛区')
    expect(zone).toBeTruthy()

    const resolved = resolveBracketParts(zone!)
    const names = resolved.map((bp) => bp.part.name)

    expect(names).toContain('A组')
    expect(names).toContain('B组')
    expect(names).not.toContain('A组前段')
    expect(names).not.toContain('A组后段')
    expect(names).toContain('淘汰赛')

    const aGroup = resolved.find((bp) => bp.part.name === 'A组')!
    expect(aGroup.sourceIndices).toHaveLength(2)
    expect(zone!.parts[aGroup.sourceIndices[0]].name).toBe('A组前段')
    expect(zone!.parts[aGroup.sourceIndices[1]].name).toBe('A组后段')
    expect(aGroup.part.jsonData.stages).toEqual([
      '第一轮',
      '第二轮',
      '第三轮',
      '第四轮',
      '第五轮',
      '晋级',
    ])
  })

  it('无前后段的赛区 parts 数量不变', () => {
    const zone = ZoneMap[2024]?.find((z) => z.name === '东部赛区')
    expect(zone).toBeTruthy()

    const resolved = resolveBracketParts(zone!)
    expect(resolved).toHaveLength(zone!.parts.length)
    expect(resolved.every((bp) => bp.sourceIndices.length === 1)).toBe(true)
    expect(resolved.map((bp) => bp.part.name)).toEqual(zone!.parts.map((p) => p.name))
  })

  it('无前后段的小组赛：晋级/淘汰收拢到末列，前面只保留对阵', () => {
    const zone = ZoneMap[2024]?.find((z) => z.name === '东部赛区')
    expect(zone).toBeTruthy()

    const aGroup = resolveBracketParts(zone!).find((bp) => bp.part.name === 'A组')!
    expect(aGroup.part.type).toBe('group')
    expect(aGroup.part.jsonData.stages).toEqual([
      '第一轮',
      '第二轮',
      '第三轮',
      '晋级',
    ])

    const promoteLike = aGroup.part.jsonData.nodes.filter(
      (n) => n.data.type === 'promote' || n.data.type === 'eliminate',
    )
    const matchLike = aGroup.part.jsonData.nodes.filter(
      (n) => n.data.type !== 'promote' && n.data.type !== 'eliminate',
    )
    expect(promoteLike.length).toBeGreaterThan(0)
    expect(new Set(promoteLike.map((n) => n.x)).size).toBe(1)
    const promoteX = promoteLike[0]!.x
    expect(Math.max(...matchLike.map((n) => n.x))).toBeLessThan(promoteX)
  })

  it('淘汰赛不做晋级收拢', () => {
    const zone = ZoneMap[2024]?.find((z) => z.name === '东部赛区')
    expect(zone).toBeTruthy()

    const knockout = resolveBracketParts(zone!).find((bp) => bp.part.name === '淘汰赛')!
    const raw = zone!.parts.find((p) => p.name === '淘汰赛')!
    expect(knockout.part.jsonData.stages).toEqual(raw.jsonData.stages)
    expect(knockout.part.jsonData.nodes).toEqual(raw.jsonData.nodes)
  })

  it('全国赛名额争夺战：按胜负排序且不赋名次', () => {
    // 2025 东部 · QuotaCompetition_9_5：晋级桶含 3-0 / 2-1 / 1-1 / 0-2
    const zone = ZoneMap[2025]?.find((z) => z.name === '东部赛区')
    expect(zone).toBeTruthy()

    const quota = resolveBracketParts(zone!).find((bp) => bp.part.name === '全国赛名额争夺战')
    expect(quota).toBeTruthy()

    const promoteLike = quota!.part.jsonData.nodes
      .filter((n) => n.data.type === 'promote' || n.data.type === 'eliminate')
      .sort((a, b) => a.y - b.y)

    // 胜场多在上；同胜场则负场少在上；晋级全国赛优先于晋级复活赛/淘汰
    expect(promoteLike.map((n) => n.text.match(/(\d-\d)/)?.[1])).toEqual([
      '3-0',
      '2-1',
      '1-1',
      '0-2',
    ])
    expect(promoteLike.every((n) => n.data.zones.every((z) => z.groupRank == null))).toBe(true)

    const model = buildBracketViewModel({
      zoneId: zone!.id,
      part: quota!.part,
      getMatchByOrder: () => undefined,
    })
    const last = model.columns[model.columns.length - 1]!
    const ranks = last.items
      .filter((i): i is Extract<typeof i, { kind: 'info' }> => i.kind === 'info')
      .flatMap((i) => i.slots.map((s) => s.groupRank))
    expect(ranks.every((r) => r == null)).toBe(true)
  })

  it('复活赛第二赛段：晋级全国赛置顶，淘汰高于淘汰 1-2', () => {
    const zone = ZoneMap[2025]?.find((z) => z.name === '复活赛第二赛段')
    expect(zone).toBeTruthy()

    const part = resolveBracketParts(zone!)[0]!.part
    const promoteLike = part.jsonData.nodes
      .filter((n) => n.data.type === 'promote' || n.data.type === 'eliminate')
      .sort((a, b) => a.y - b.y)

    expect(promoteLike.map((n) => n.text)).toEqual([
      '晋级全国赛',
      '淘汰',
      '淘汰 1-2',
      '淘汰 0-2',
    ])
  })

  it('孤立前后段名称不合并', () => {
    const zone: Zone = {
      id: 1,
      name: '测试',
      disabled: false,
      defaultGroup: 0,
      parts: [
        partStub('A组前段', 'A'),
        partStub('淘汰赛', 'Knockout'),
      ],
    }
    const resolved = resolveBracketParts(zone)
    expect(resolved).toHaveLength(2)
    expect(resolved[0].part.name).toBe('A组前段')
  })

  it('2026 复活赛名额争夺：保留包含「晋级」的首个对阵 stage', () => {
    const zone = ZoneMap[2026]?.find((z) => z.id === 617)
    expect(zone).toBeTruthy()

    const part = resolveBracketParts(zone!).find((bp) => bp.sourceIndices.includes(2))!.part
    expect(part.type).toBe('group')
    expect(part.jsonData.stages).toEqual([
      '晋级名额争夺战',
      '胜负分组',
      '败者组第二轮',
      '晋级',
    ])
  })
})

describe('merge + buildBracketViewModel 冒烟', () => {
  it('2026 南部 A组合并后可构建视图模型', () => {
    const zone = ZoneMap[2026]?.find((z) => z.name === '南部赛区')
    expect(zone).toBeTruthy()

    const aGroup = resolveBracketParts(zone!).find((bp) => bp.part.name === 'A组')
    expect(aGroup).toBeTruthy()

    const model = buildBracketViewModel({
      zoneId: zone!.id,
      part: aGroup!.part,
      getMatchByOrder: () => undefined,
    })

    expect(model.columns.length).toBe(6)
    expect(model.columns.map((c) => c.label)).toEqual([
      '第一轮',
      '第二轮',
      '第三轮',
      '第四轮',
      '第五轮',
      '晋级',
    ])
    const last = model.columns[model.columns.length - 1]!
    expect(last.label).toBe('晋级')
    expect(last.items.every((i) => i.kind === 'info')).toBe(true)
    const ranks = last.items
      .filter((i): i is Extract<typeof i, { kind: 'info' }> => i.kind === 'info')
      .flatMap((i) => i.slots.map((s) => s.groupRank))
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
    expect(model.columns.some((c) => c.items.length > 0)).toBe(true)
  })
})

function partStub(name: string, group: Part['group']): Part {
  return {
    name,
    type: group === 'Knockout' ? 'knockout' : 'group',
    group,
    jsonData: { rootId: '#1', nodes: [], lines: [], stages: ['第一轮'] },
  }
}
