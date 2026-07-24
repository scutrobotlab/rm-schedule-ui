import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { DefaultZoneMap, ZoneMap } from './zone'
import {
  RevivalZone2026GroupJsonData,
  RevivalZone2026KnockoutJsonData,
  RevivalZone2026RoundOrder,
} from './revival_zone_2026'
import { buildBracketViewModel } from '../utils/bracket_adapter'
import { usePromotionStore } from '../stores/promotion'
import type { ZoneJsonData, ZoneZoneData } from '../types/zone'

function collectMatchOrders(json: ZoneJsonData, groupIndex?: number): number[] {
  const orders = new Set<number>()
  for (const node of json.nodes) {
    for (let i = 0; i < node.data.zones.length; i++) {
      if (groupIndex !== undefined && i !== groupIndex) continue
      for (const order of node.data.zones[i].matches) {
        orders.add(order)
      }
    }
  }
  return [...orders].sort((a, b) => a - b)
}

function zoneAt(groupIndex: number, nodeId: string): ZoneZoneData {
  const node = RevivalZone2026GroupJsonData.nodes.find((n) => n.id === nodeId)
  if (!node) throw new Error(`missing node ${nodeId}`)
  return node.data.zones[groupIndex]
}

function knockoutZone(nodeId: string): ZoneZoneData {
  const node = RevivalZone2026KnockoutJsonData.nodes.find((n) => n.id === nodeId)
  if (!node) throw new Error(`missing knockout node ${nodeId}`)
  return node.data.zones[0]
}

describe('2026 ZoneMap 注册与默认赛区', () => {
  it('注册 617/618，默认赛区为 618', () => {
    const zones = ZoneMap[2026]
    expect(zones.map((z) => z.id)).toEqual([614, 615, 616, 617, 618])
    expect(DefaultZoneMap[2026]).toBe(618)

    const revival = zones.find((z) => z.id === 617)!
    expect(revival.name).toBe('复活赛')
    expect(revival.parts.map((p) => [p.name, p.type, p.group])).toEqual([
      ['A组', 'group', 'A'],
      ['B组', 'group', 'B'],
      ['淘汰赛', 'group', 'Knockout'],
    ])

    const final = zones.find((z) => z.id === 618)!
    expect(final.name).toBe('全国赛')
    expect(final.parts.map((p) => [p.name, p.type, p.group])).toEqual([
      ['A组前段', 'group', 'A'],
      ['B组前段', 'group', 'B'],
      ['A组后段', 'group', 'A'],
      ['B组后段', 'group', 'B'],
      ['淘汰赛败者组', 'knockout', 'Knockout'],
      ['淘汰赛胜者组', 'knockout', 'Knockout'],
    ])
  })
})

describe('2026 复活赛 617 小组赛布局', () => {
  it('A/B 组场次绑定为 1–22，且轮次顺序正确', () => {
    const aOrders = collectMatchOrders(RevivalZone2026GroupJsonData, 0)
    const bOrders = collectMatchOrders(RevivalZone2026GroupJsonData, 1)
    expect(aOrders).toEqual([1, 2, 3, 4, 9, 10, 11, 12, 17, 18, 19])
    expect(bOrders).toEqual([5, 6, 7, 8, 13, 14, 15, 16, 20, 21, 22])
    expect([...aOrders, ...bOrders].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 22 }, (_, i) => i + 1),
    )

    expect(zoneAt(0, '#1').matches).toEqual([1, 2, 3, 4])
    expect(zoneAt(1, '#1').matches).toEqual([5, 6, 7, 8])
    expect(zoneAt(0, '#2').matches).toEqual([9, 10])
    expect(zoneAt(0, '#3').matches).toEqual([11, 12])
    expect(zoneAt(1, '#2').matches).toEqual([13, 14])
    expect(zoneAt(1, '#3').matches).toEqual([15, 16])
    expect(zoneAt(0, '#4').matches).toEqual([17])
    expect(zoneAt(0, '#5').matches).toEqual([18, 19])
    expect(zoneAt(1, '#4').matches).toEqual([20])
    expect(zoneAt(1, '#5').matches).toEqual([21, 22])

    expect(RevivalZone2026RoundOrder).toEqual({
      A: [1, 9, 17, 17],
      B: [5, 13, 20, 20],
    })
  })

  it('第三轮 1-1 配对与胜负去向符合官方拓扑', () => {
    const a11 = zoneAt(0, '#5')
    expect(a11.forecasts).toEqual([
      { red: 3, blue: 6 },
      { red: 4, blue: 5 },
    ])
    expect(a11.winners).toEqual([11, 12])
    expect(a11.losers).toEqual([9, 10])

    const b11 = zoneAt(1, '#5')
    expect(b11.forecasts).toEqual([
      { red: 6, blue: 3 },
      { red: 5, blue: 4 },
    ])
    expect(b11.winners).toEqual([15, 16])
    expect(b11.losers).toEqual([13, 14])

    const promote = zoneAt(0, '#7')
    expect(promote.winners).toEqual([17, 18, 19])
    expect(promote.losers).toEqual([17])
    expect(promote.text).toEqual(['A组 第1名', 'A组 第2名', 'A组 第3名', 'A组 第4名'])
  })

  it('A/B 组 bracket 可构建并保留阶段连线', () => {
    const zone = ZoneMap[2026].find((z) => z.id === 617)!
    for (const part of zone.parts.slice(0, 2)) {
      const model = buildBracketViewModel({
        zoneId: 617,
        part,
        getMatchByOrder: () => undefined,
      })
      expect(model.columns.length).toBeGreaterThan(0)
      expect(model.connections.length).toBeGreaterThan(0)
      const matchOrders = model.columns.flatMap((col) =>
        col.items.flatMap((item) =>
          item.kind === 'info' ? item.matches.map((m) => m.orderNumber) : [],
        ),
      )
      expect(matchOrders.length).toBeGreaterThan(0)
      expect(Math.max(...matchOrders)).toBeLessThanOrEqual(22)
    }
  })
})

describe('2026 复活赛 617 名额争夺 group 23–32', () => {
  it('场次完整覆盖 23–32，且无小组赛场次混入', () => {
    expect(collectMatchOrders(RevivalZone2026KnockoutJsonData)).toEqual(
      Array.from({ length: 10 }, (_, i) => i + 23),
    )
  })

  it('同一组场次合并为一个节点，并保留胜负去向', () => {
    expect(RevivalZone2026KnockoutJsonData.nodes).toHaveLength(6)

    const quota = knockoutZone('#1')
    expect(quota.matches).toEqual([23, 24, 25, 26])
    expect(quota.text).toEqual([
      '小组赛B组 第1名', '小组赛A组 第4名',
      '小组赛A组 第2名', '小组赛B组 第3名',
      '小组赛A组 第3名', '小组赛B组 第2名',
      '小组赛B组 第4名', '小组赛A组 第1名',
    ])

    const winners = knockoutZone('#2')
    expect(winners.matches).toEqual([29, 30])
    expect(winners.winners).toEqual([23, 24, 26, 25])

    const losers = knockoutZone('#3')
    expect(losers.matches).toEqual([27, 28])
    expect(losers.losers).toEqual([23, 24, 26, 25])
  })

  it('组间收敛后，31–32 决出其余全国赛席位', () => {
    const promote = knockoutZone('#5')
    expect(promote.winners).toEqual([29, 30, 31, 32])
    expect(promote.text).toEqual([
      '第29场 胜者',
      '第30场 胜者',
      '第31场 胜者',
      '第32场 胜者',
    ])

    const finalLosers = knockoutZone('#4')
    expect(finalLosers.matches).toEqual([31, 32])
    expect(finalLosers.losers).toEqual([29, 30])
    expect(finalLosers.winners).toEqual([28, 27])
    expect(finalLosers.text).toEqual([
      '第29场 败者', '第28场 胜者',
      '第27场 胜者', '第30场 败者',
    ])

    const eliminate = knockoutZone('#6')
    expect(eliminate.losers).toEqual([27, 28, 31, 32])
  })

  it('组节点之间的连线覆盖胜者组、败者组与全国赛出口', () => {
    const lines = new Set(
      RevivalZone2026KnockoutJsonData.lines.map((l) => `${l.from}->${l.to}`),
    )
    for (const edge of [
      '#1->#2', '#1->#3', '#2->#4', '#2->#5',
      '#3->#4', '#3->#6', '#4->#5', '#4->#6',
    ]) {
      expect(lines.has(edge)).toBe(true)
    }

    const zone = ZoneMap[2026].find((z) => z.id === 617)!
    const model = buildBracketViewModel({
      zoneId: 617,
      part: zone.parts[2],
      getMatchByOrder: () => undefined,
    })
    expect(model.partType).toBe('group')
    expect(model.connections.length).toBe(8)
    const promote = model.columns.flatMap((c) => c.items).find(
      (i) => i.kind === 'info' && i.nodeType === 'promote',
    )
    expect(promote).toBeTruthy()
  })
})

describe('2026 全国赛 618 复用布局', () => {
  it('可解析关键场次 1、66、67、96，且全明星 97/98 不在主赛程图', () => {
    const zone = ZoneMap[2026].find((z) => z.id === 618)!
    const allOrders = new Set<number>()
    for (const part of zone.parts) {
      for (const order of collectMatchOrders(part.jsonData)) {
        allOrders.add(order)
      }
    }

    for (const order of [1, 66, 67, 96]) {
      expect(allOrders.has(order)).toBe(true)
    }
    expect(allOrders.has(97)).toBe(false)
    expect(allOrders.has(98)).toBe(false)
    expect(Math.max(...allOrders)).toBe(96)

    // 小组赛含 1/66；淘汰赛含 67/96
    expect(collectMatchOrders(zone.parts[0].jsonData)).toContain(1)
    expect(collectMatchOrders(zone.parts[2].jsonData)).toContain(66)
    expect(collectMatchOrders(zone.parts[5].jsonData)).toContain(67)
    expect(collectMatchOrders(zone.parts[5].jsonData)).toContain(96)

    for (const part of zone.parts) {
      const model = buildBracketViewModel({
        zoneId: 618,
        part,
        getMatchByOrder: () => undefined,
      })
      expect(model.columns.length).toBeGreaterThan(0)
    }
  })
})

describe('2026 主题背景', () => {
  beforeEach(() => {
    // vitest node 环境无 DOM；getter 仅用宽高判断桌面/移动
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { innerWidth: 1280, innerHeight: 720 },
    })
    setActivePinia(createPinia())
  })

  it('617/618 复用全国赛背景，区域赛仍用 2026 分组背景', () => {
    const store = usePromotionStore()
    store.season = 2026

    store.zoneId = 616
    expect(store.backgroundImage).toBe('/background/2026_group.jpg')

    store.zoneId = 617
    expect(store.backgroundImage).toBe('/background/2026_final.jpg')

    store.zoneId = 618
    expect(store.backgroundImage).toBe('/background/2026_final.jpg')
  })
})
