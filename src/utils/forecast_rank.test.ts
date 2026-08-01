import { describe, expect, it } from 'vitest'
import {
  assignForecastSeeds,
  buildForecastRows,
  parseSeedSlots,
  rankFromForecastText,
  resolveForecastGuidePairs,
} from './forecast_rank'

describe('rankFromForecastText', () => {
  it('解析第N名', () => {
    expect(rankFromForecastText('B组 第二轮 第6名')).toBe(6)
    expect(rankFromForecastText('A组 第一轮 第1名')).toBe(1)
    expect(rankFromForecastText('B1')).toBeNull()
  })
})

describe('parseSeedSlots', () => {
  it('按行序解析席位，保留对阵序', () => {
    expect(
      parseSeedSlots([
        'B组 第二轮 第6名',
        'B组 第二轮 第3名',
        'B组 第二轮 第5名',
        'B组 第二轮 第4名',
      ]),
    ).toEqual([6, 3, 5, 4])
  })
})

describe('assignForecastSeeds', () => {
  it('按相对强弱赋给 sortedSeeds', () => {
    const map = assignForecastSeeds(
      [
        { id: 'a', apiRank: 2 },
        { id: 'b', apiRank: 5 },
      ],
      [6, 3, 5, 4],
    )
    expect(map.get('a')).toBe(3)
    expect(map.get('b')).toBe(4)
  })
})

describe('buildForecastRows', () => {
  const bRound3 = [
    'B组 第二轮 第6名',
    'B组 第二轮 第3名',
    'B组 第二轮 第5名',
    'B组 第二轮 第4名',
  ]

  const a618Round3 = [
    'A组 第二轮 第6名',
    'A组 第二轮 第5名',
    'A组 第二轮 第8名',
    'A组 第二轮 第7名',
    'A组 第二轮 第9名',
    'A组 第二轮 第10名',
    'A组 第二轮 第11名',
    'A组 第二轮 第12名',
  ]

  it('中场：仅桂电 apiRank=2 → seed=3，占第3名行（index 1），非首行', () => {
    const rows = buildForecastRows(bRound3, [{ id: 'gui', apiRank: 2 }])
    expect(rows.map((row) => ({ seed: row.seed, playerId: row.playerId }))).toEqual([
      { seed: 6, playerId: undefined },
      { seed: 3, playerId: 'gui' },
      { seed: 5, playerId: undefined },
      { seed: 4, playerId: undefined },
    ])
  })

  it('非连续对阵序：仅 apiRank=2 → seed=5，占第5名行（index 1）', () => {
    const rows = buildForecastRows(a618Round3, [{ id: 'team', apiRank: 2 }])
    expect(rows[0]).toMatchObject({ seed: 6, playerId: undefined })
    expect(rows[1]).toMatchObject({ seed: 5, playerId: 'team' })
    expect(rows.slice(2).every((row) => row.playerId == null)).toBe(true)
  })

  it('完赛：四人接口已是 3/4/5/6 → 恒等占位', () => {
    const rows = buildForecastRows(bRound3, [
      { id: 'r3', apiRank: 3 },
      { id: 'r4', apiRank: 4 },
      { id: 'r5', apiRank: 5 },
      { id: 'r6', apiRank: 6 },
    ])
    expect(rows.map((row) => ({ seed: row.seed, playerId: row.playerId }))).toEqual([
      { seed: 6, playerId: 'r6' },
      { seed: 3, playerId: 'r3' },
      { seed: 5, playerId: 'r5' },
      { seed: 4, playerId: 'r4' },
    ])
  })

  it('两人 apiRank=[2,5] + slots=[6,3,5,4] → seed 3、4，各占对应 text 行', () => {
    const rows = buildForecastRows(bRound3, [
      { id: 'strong', apiRank: 2 },
      { id: 'weak', apiRank: 5 },
    ])
    expect(rows.map((row) => ({ seed: row.seed, playerId: row.playerId }))).toEqual([
      { seed: 6, playerId: undefined },
      { seed: 3, playerId: 'strong' },
      { seed: 5, playerId: undefined },
      { seed: 4, playerId: 'weak' },
    ])
  })

  it('行数始终等于 texts.length', () => {
    expect(buildForecastRows(bRound3, []).length).toBe(4)
    expect(buildForecastRows(a618Round3, [{ id: 'x', apiRank: 1 }]).length).toBe(8)
  })
})

describe('resolveForecastGuidePairs', () => {
  it('按结构名次在 seedSlots 中的下标连线（6v3 / 5v4）', () => {
    const pairs = resolveForecastGuidePairs(
      [
        { red: 6, blue: 3 },
        { red: 5, blue: 4 },
      ],
      [6, 3, 5, 4],
    )
    expect(pairs).toEqual([
      { from: 0, to: 1 },
      { from: 2, to: 3 },
    ])
  })

  it('非相邻对阵：6v5 → index 0 与 1', () => {
    expect(
      resolveForecastGuidePairs([{ red: 6, blue: 5 }], [6, 5, 8, 7, 9, 10, 11, 12]),
    ).toEqual([{ from: 0, to: 1 }])
  })
})
