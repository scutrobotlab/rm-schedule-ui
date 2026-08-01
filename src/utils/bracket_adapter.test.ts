import { describe, expect, it } from 'vitest'
import type { Part } from '../constant/zone'
import type { MatchNode, Player, Team } from '../types/schedule'
import type { ZoneJsonData } from '../types/zone'
import {
  buildBracketViewModel,
  detectLane,
  filterBracketByStageRange,
  formatBracketTitle,
  formatSourceLabel,
  resolveLoser,
  resolveWinner,
  resolveBracketProgressLabel,
} from './bracket_adapter'
import { resolveBracketDensity, shouldShowBracketTypeTag } from './bracket_density'

function team(name: string, logo = 'https://example.com/logo.png'): Team {
  return {
    id: `t-${name}`,
    name,
    collegeName: name,
    collegeLogo: logo,
  }
}

function player(id: string, college: string): Player {
  return {
    id,
    name: id,
    rank: 0,
    score: 0,
    teamId: `t-${college}`,
    team: team(college),
  }
}

function match(partial: {
  orderNumber: number
  status?: string
  red?: Player | null
  blue?: Player | null
  redWins?: number
  blueWins?: number
}): MatchNode {
  const redPlayer = partial.red === undefined ? player('r', '红校') : partial.red
  const bluePlayer = partial.blue === undefined ? player('b', '蓝校') : partial.blue
  return {
    id: `m-${partial.orderNumber}`,
    groupId: 'g',
    matchType: 'KNOCKOUT',
    orderNumber: partial.orderNumber,
    planGameCount: 3,
    planStartedAt: '2026-07-01T10:00:00Z',
    result: '',
    slug: null,
    slugName: '',
    status: partial.status ?? 'PENDING',
    winnerPlaceholdName: null,
    loserPlaceholdName: null,
    blueSideId: 'blue',
    blueSideScore: 0,
    blueSideWinGameCount: partial.blueWins ?? 0,
    blueSide: {
      id: 'blue',
      preparedStatus: '',
      fillStatus: '',
      playerId: bluePlayer?.id,
      player: bluePlayer ?? undefined,
      updatedAt: '',
    },
    redSideId: 'red',
    redSideScore: 0,
    redSideWinGameCount: partial.redWins ?? 0,
    redSide: {
      id: 'red',
      preparedStatus: '',
      fillStatus: '',
      playerId: redPlayer?.id,
      player: redPlayer ?? undefined,
      updatedAt: '',
    },
  }
}

function partOf(jsonData: ZoneJsonData, overrides: Partial<Part> = {}): Part {
  return {
    name: overrides.name ?? '测试赛段',
    type: overrides.type ?? 'knockout',
    group: overrides.group ?? 'Knockout',
    jsonData,
    ...overrides,
  }
}

const singleElimJson: ZoneJsonData = {
  rootId: '#3',
  stages: ['半决赛', '决赛'],
  nodes: [
    {
      id: '#1',
      text: '半决赛 第1场',
      x: 0,
      y: 0,
      data: {
        title: '半决赛 第1场',
        titleColor: '#fff',
        round: 1,
        type: 'match',
        zones: [{
          matches: [1],
          winners: [],
          losers: [],
          text: ['小组赛A组 第1名', '小组赛B组 第2名'],
        }],
      },
    },
    {
      id: '#2',
      text: '半决赛 第2场',
      x: 0,
      y: 100,
      data: {
        title: '半决赛 第2场',
        titleColor: '#fff',
        round: 1,
        type: 'match',
        zones: [{
          matches: [2],
          winners: [],
          losers: [],
          text: ['A2', 'B1'],
        }],
      },
    },
    {
      id: '#3',
      text: '决赛',
      x: 100,
      y: 40,
      data: {
        title: '决赛',
        titleColor: '#fff',
        round: 2,
        type: 'match',
        zones: [{
          matches: [3],
          winners: [],
          losers: [],
          text: ['半决赛胜者', '半决赛胜者'],
        }],
      },
    },
    {
      id: '#4',
      text: '季军争夺战',
      x: 100,
      y: 140,
      data: {
        title: '季军争夺战',
        titleColor: '#fff',
        round: 2,
        type: 'match',
        zones: [{
          matches: [4],
          winners: [],
          losers: [],
          text: ['半决赛败者', '半决赛败者'],
        }],
      },
    },
  ],
  lines: [
    { from: '#1', to: '#3' },
    { from: '#2', to: '#3' },
    { from: '#1', to: '#4' },
    { from: '#2', to: '#4' },
  ],
}

const swissJson: ZoneJsonData = {
  rootId: '#1',
  stages: ['第一轮', '晋级'],
  nodes: [
    {
      id: '#1',
      text: '第一轮 0-0',
      x: 0,
      y: 0,
      data: {
        title: '瑞士轮第一轮',
        titleColor: '#fff',
        round: 1,
        type: 'match',
        zones: [
          {
            matches: [1, 2],
            winners: [],
            losers: [],
            text: ['第一梯队种子 A1', '抽签结果待定 A9', '第二梯队种子 A2', '抽签结果待定 A10'],
          },
          {
            matches: [11, 12],
            winners: [],
            losers: [],
            text: ['第一梯队种子 B1', '抽签结果待定 B9', '第二梯队种子 B2', '抽签结果待定 B10'],
          },
        ],
      },
    },
    {
      id: '#2',
      text: '晋级 3-0',
      x: 100,
      y: 0,
      data: {
        title: '晋级淘汰赛',
        titleColor: '#fff',
        round: 2,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [1],
            losers: [],
            text: ['第1场胜者'],
          },
          {
            matches: [],
            winners: [11],
            losers: [],
            text: ['第11场胜者'],
          },
        ],
      },
    },
  ],
  lines: [],
}

const doubleElimJson: ZoneJsonData = {
  rootId: '#2',
  stages: ['败者组第一轮', '败者组第二轮'],
  nodes: [
    {
      id: '#1',
      text: '16进8败者组第一轮 第1场',
      x: 0,
      y: 0,
      data: {
        title: '',
        titleColor: '#fff',
        round: 1,
        type: 'match',
        zones: [{
          matches: [10],
          winners: [],
          losers: [],
          text: ['胜者组第1场败者', '胜者组第2场败者'],
        }],
      },
    },
    {
      id: '#2',
      text: '16进8败者组第二轮 第1场',
      x: 100,
      y: 0,
      data: {
        title: '',
        titleColor: '#fff',
        round: 2,
        type: 'match',
        zones: [{
          matches: [20],
          winners: [],
          losers: [],
          text: ['败者组第一轮胜者', '胜者组第3场败者'],
        }],
      },
    },
  ],
  lines: [{ from: '#1', to: '#2' }],
}

describe('formatSourceLabel', () => {
  it('将小组排名文案规范为 A1 / B2', () => {
    expect(formatSourceLabel('小组赛A组 第1名')).toBe('A1')
    expect(formatSourceLabel('B组 第2名')).toBe('B2')
    expect(formatSourceLabel('第一梯队种子 A1')).toBe('A1')
    expect(formatSourceLabel('抽签结果待定 B9')).toBe('B9')
    expect(formatSourceLabel('A组 第一轮 第1名')).toBe('第一轮 第1名')
    expect(formatSourceLabel('小组赛B组 第二轮 第2名')).toBe('第二轮 第2名')
  })

  it('保留无法解析的来源文案，不退回空待定', () => {
    expect(formatSourceLabel('半决赛胜者')).toBe('半决赛胜者')
  })

  it('统一场次胜负来源中的空格', () => {
    expect(formatSourceLabel('第23场 胜者')).toBe('第23场胜者')
    expect(formatSourceLabel('第24场 败者')).toBe('第24场败者')
    expect(formatSourceLabel('第25场胜者')).toBe('第25场胜者')
  })
})

describe('formatBracketTitle', () => {
  it('去掉末尾第N场', () => {
    expect(formatBracketTitle('16进8第一轮 第1场')).toBe('16进8第一轮')
    expect(formatBracketTitle('半决赛 第2场')).toBe('半决赛')
    expect(formatBracketTitle('冠军争夺战')).toBe('冠军争夺战')
    expect(formatBracketTitle('第3场')).toBe('')
  })
})

describe('resolveWinner / resolveLoser', () => {
  it('仅在 DONE 且胜局不等时判定胜负', () => {
    const done = match({
      orderNumber: 1,
      status: 'DONE',
      red: player('r1', '红校'),
      blue: player('b1', '蓝校'),
      redWins: 2,
      blueWins: 1,
    })
    expect(resolveWinner(done)?.id).toBe('r1')
    expect(resolveLoser(done)?.id).toBe('b1')

    const pending = match({ orderNumber: 2, status: 'STARTED', redWins: 1, blueWins: 0 })
    expect(resolveWinner(pending)).toBeNull()
    expect(resolveLoser(pending)).toBeNull()
  })
})

describe('detectLane', () => {
  it('冠军与季军统一金色标记；其余为普通对阵', () => {
    expect(detectLane(doubleElimJson.nodes[0])).toBe('main')
    expect(detectLane(singleElimJson.nodes[2])).toBe('gold')
    expect(detectLane(singleElimJson.nodes[3])).toBe('gold')
    expect(detectLane({
      ...singleElimJson.nodes[0],
      text: '冠军争夺战',
    })).toBe('gold')
    expect(detectLane({
      ...singleElimJson.nodes[0],
      text: '半决赛 第1场',
    })).toBe('main')
  })
})

describe('resolveBracketProgressLabel', () => {
  it('按轮次给出卡片内队伍当前所处进程', () => {
    expect(resolveBracketProgressLabel('16进8', '16进8淘汰赛 第1场')).toBe('16强')
    expect(resolveBracketProgressLabel('16进8第一轮', '')).toBe('16强')
    expect(resolveBracketProgressLabel('16进8胜者组', '')).toBe('12强')
    expect(resolveBracketProgressLabel('8进4', '')).toBe('八强')
    expect(resolveBracketProgressLabel('8进4胜者组', '')).toBe('八强')
    expect(resolveBracketProgressLabel('半决赛', '半决赛 第1场')).toBe('四强')
  })

  it('败者组按当前阶段标记进程', () => {
    expect(resolveBracketProgressLabel('16进8败者组第一轮', '')).toBe('16强')
    expect(resolveBracketProgressLabel('16进8败者组第二轮', '')).toBe('12强')
    expect(resolveBracketProgressLabel('8进4败者组第一轮', '')).toBe('八强')
    expect(resolveBracketProgressLabel('8进4败者组第二轮', '')).toBe('六强')
  })

  it('冠季军使用卡片自身的名次标签', () => {
    expect(resolveBracketProgressLabel('决赛', '冠军争夺战')).toBeNull()
    expect(resolveBracketProgressLabel('决赛', '季军争夺战')).toBeNull()
  })
})

describe('buildBracketViewModel — 单败 + 季军', () => {
  const matches = new Map<number, MatchNode>([
    [1, match({
      orderNumber: 1,
      status: 'DONE',
      red: player('a1', '甲大学'),
      blue: player('b2', '乙大学'),
      redWins: 2,
      blueWins: 0,
    })],
    [2, match({ orderNumber: 2, status: 'PENDING', red: null, blue: null })],
    [3, match({ orderNumber: 3, status: 'PENDING', red: null, blue: null })],
    [4, match({ orderNumber: 4, status: 'PENDING', red: null, blue: null })],
  ])

  it('产出列、对阵卡、来源占位与比分', () => {
    const model = buildBracketViewModel({
      zoneId: 1,
      part: partOf(singleElimJson),
      getMatchByOrder: (_z, order) => matches.get(order),
    })

    expect(model.columns).toHaveLength(2)
    expect(model.columns[0].label).toBe('半决赛')
    expect(model.columns[1].label).toBe('决赛')
    expect(model.connections).toHaveLength(4)

    const semi1 = model.columns[0].items.find((i) => i.nodeId === '#1')
    expect(semi1?.kind).toBe('match')
    if (semi1?.kind === 'match') {
      expect(semi1.slots[0].displayName).toBe('甲大学')
      expect(semi1.slots[0].collegeLogo).toBeTruthy()
      expect(semi1.slots[0].isWinner).toBe(true)
      expect(semi1.redWinGames).toBe(2)
      expect(semi1.blueWinGames).toBe(0)
      expect(semi1.progressLabel).toBe('四强')
    }

    const semi2 = model.columns[0].items.find((i) => i.nodeId === '#2')
    expect(semi2?.kind).toBe('match')
    if (semi2?.kind === 'match') {
      expect(semi2.slots[0].displayName).toBe('A2')
      expect(semi2.slots[0].sourceKind).toBe('rank')
      expect(semi2.slots[1].displayName).toBe('B1')
    }

    const third = model.columns[1].items.find((i) => i.nodeId === '#4')
    expect(third?.kind).toBe('match')
    if (third?.kind === 'match') {
      expect(third.lane).toBe('gold')
      expect(third.slots[0].displayName).toBe('半决赛败者')
    }
  })

  it('按阶段范围裁剪列与连线', () => {
    const full = buildBracketViewModel({
      zoneId: 1,
      part: partOf(singleElimJson),
      getMatchByOrder: (_z, order) => matches.get(order),
    })
    const filtered = filterBracketByStageRange(full, { start: 1, end: 1 })
    expect(filtered.columns).toHaveLength(1)
    expect(filtered.columns[0].index).toBe(1)
    expect(filtered.connections.every(
      (c) => ['#3', '#4'].includes(c.fromNodeId) && ['#3', '#4'].includes(c.toNodeId),
    )).toBe(true)

    const built = buildBracketViewModel({
      zoneId: 1,
      part: partOf(singleElimJson),
      getMatchByOrder: (_z, order) => matches.get(order),
      stageRange: { start: 0, end: 0 },
    })
    expect(built.columns).toHaveLength(1)
    expect(built.columns[0].label).toBe('半决赛')
    expect(built.connections).toHaveLength(0)
  })
})

describe('buildBracketViewModel — 瑞士轮 / 分组', () => {
  it('多场节点以 info 卡展示，并按 A/B 组过滤 zones', () => {
    const aModel = buildBracketViewModel({
      zoneId: 1,
      part: partOf(swissJson, { type: 'group', group: 'A', name: 'A组' }),
      getMatchByOrder: () => undefined,
    })
    expect(aModel.columns).toHaveLength(2)
    const round1 = aModel.columns[0].items[0]
    expect(round1.kind).toBe('info')
    if (round1.kind === 'info') {
      expect(round1.nodeType).toBe('matchGroup')
      expect(round1.matches).toHaveLength(2)
      // 无赛程时回退到 text 种子占位
      expect(round1.slots[0].displayName).toBe('A1')
      expect(round1.slots[1].displayName).toBe('A9')
    }

    const promote = aModel.columns[1].items[0]
    expect(promote.kind).toBe('info')
    if (promote.kind === 'info') {
      expect(promote.nodeType).toBe('promote')
      expect(promote.slots[0].displayName).toBe('第1场胜者')
    }

    const bModel = buildBracketViewModel({
      zoneId: 1,
      part: partOf(swissJson, { type: 'group', group: 'B', name: 'B组' }),
      getMatchByOrder: () => undefined,
    })
    const bRound = bModel.columns[0].items[0]
    expect(bRound.kind).toBe('info')
    if (bRound.kind === 'info') {
      expect(bRound.slots[0].displayName).toBe('B1')
      expect(bRound.matches[0].orderNumber).toBe(11)
    }
  })

  it('第一轮 winners 为空时从 matches 读取实时对阵队伍', () => {
    const schedule = new Map<number, MatchNode>([
      [1, match({
        orderNumber: 1,
        status: 'DONE',
        red: player('p1', '东南大学'),
        blue: player('p2', '深圳大学'),
        redWins: 2,
        blueWins: 1,
      })],
      [2, match({
        orderNumber: 2,
        status: 'STARTED',
        red: player('p3', '华南理工'),
        blue: player('p4', '大连理工'),
        redWins: 1,
        blueWins: 0,
      })],
    ])

    const model = buildBracketViewModel({
      zoneId: 1,
      part: partOf(swissJson, { type: 'group', group: 'A', name: 'A组' }),
      getMatchByOrder: (_z, order) => schedule.get(order),
    })
    const round1 = model.columns[0].items[0]
    expect(round1.kind).toBe('info')
    if (round1.kind === 'info') {
      expect(round1.slots[0].displayName).toBe('东南大学')
      expect(round1.slots[0].sourceKind).toBe('team')
      expect(round1.slots[0].isWinner).toBe(true)
      expect(round1.slots[1].displayName).toBe('深圳大学')
      expect(round1.slots[2].displayName).toBe('华南理工')
      expect(round1.slots[3].displayName).toBe('大连理工')
      expect(round1.matches[0].status).toBe('DONE')
      expect(round1.matches[0].planStartedAt).toBe('2026-07-01T10:00:00Z')
      expect(round1.matches[1].status).toBe('STARTED')
      expect(round1.matches[1].planStartedAt).toBe('2026-07-01T10:00:00Z')
    }
  })

  it('后续席位优先使用小组榜实时排名，并在缺失时回退比赛快照', () => {
    const snapshotWinner = { ...player('p1', '华中科技大学'), rank: 6, score: 3 }
    const liveWinner = { ...snapshotWinner, rank: 4, score: 6 }
    const finished = match({
      orderNumber: 1,
      status: 'DONE',
      red: snapshotWinner,
      blue: player('p2', '对手大学'),
      redWins: 2,
      blueWins: 0,
    })
    const options = {
      zoneId: 1,
      part: partOf(swissJson, { type: 'group' as const, group: 'A', name: 'A组' }),
      getMatchByOrder: (_z: number, order: number) => order === 1 ? finished : undefined,
    }

    const liveModel = buildBracketViewModel({
      ...options,
      getPlayerById: (playerId) => playerId === liveWinner.id ? liveWinner : null,
    })
    const livePromote = liveModel.columns[1].items[0]
    expect(livePromote.kind).toBe('info')
    if (livePromote.kind === 'info') {
      expect(livePromote.slots[0].groupRank).toBe(4)
    }

    const fallbackModel = buildBracketViewModel(options)
    const fallbackPromote = fallbackModel.columns[1].items[0]
    expect(fallbackPromote.kind).toBe('info')
    if (fallbackPromote.kind === 'info') {
      expect(fallbackPromote.slots[0].groupRank).toBe(6)
    }
  })
})

describe('buildBracketViewModel — 双败败者组', () => {
  it('败者组按普通对阵处理并保留阶段连线', () => {
    const model = buildBracketViewModel({
      zoneId: 1,
      part: partOf(doubleElimJson),
      getMatchByOrder: () => undefined,
    })
    expect(model.columns[0].items[0].lane).toBe('main')
    expect(model.columns[1].items[0].lane).toBe('main')
    expect(model.connections).toEqual([{ fromNodeId: '#1', toNodeId: '#2' }])
  })
})

describe('buildBracketViewModel — 海外小组赛 groupLoop', () => {
  const overseasJson: ZoneJsonData = {
    rootId: '#1',
    stages: ['海外小组赛', '海外淘汰赛'],
    nodes: [
      {
        id: '#1',
        text: 'Q组海外队伍小组赛',
        x: 0,
        y: 0,
        data: {
          title: 'Q组海外队伍小组赛',
          titleColor: '#fff',
          round: 1,
          type: 'groupLoop',
          zones: [{
            matches: [],
            winners: [],
            losers: [],
            text: ['Q1', 'Q2', 'Q3'],
            group: 'Q',
            groupRank: [1, 2, 3],
          }],
        },
      },
      {
        id: '#2',
        text: '海外队伍淘汰赛',
        x: 100,
        y: 0,
        data: {
          title: '海外队伍淘汰赛',
          titleColor: '#fff',
          round: 2,
          type: 'match',
          zones: [{
            matches: [7, 8],
            winners: [],
            losers: [],
            text: ['Q组 第1名', 'W组 第2名', 'W组 第1名', 'Q组 第2名'],
          }],
        },
      },
    ],
    lines: [{ from: '#1', to: '#2' }],
  }

  it('无赛程时回退到 Q1/Q2/Q3 占位', () => {
    const model = buildBracketViewModel({
      zoneId: 524,
      part: partOf(overseasJson, { type: 'group', group: 'QW', name: '港澳台及海外赛区' }),
      getMatchByOrder: () => undefined,
    })
    const card = model.columns[0].items[0]
    expect(card.kind).toBe('info')
    if (card.kind === 'info') {
      expect(card.nodeType).toBe('groupLoop')
      expect(card.slots.map((s) => s.displayName)).toEqual(['Q1', 'Q2', 'Q3'])
      expect(card.slots.map((s) => s.groupRank)).toEqual([1, 2, 3])
    }
  })

  it('按 group + groupRank 解析实时排名队伍', () => {
    const byRank = new Map<number, Player>([
      [1, { ...player('q1', '香港科技大学'), rank: 1, score: 6 }],
      [2, { ...player('q2', '香港大学'), rank: 2, score: 3 }],
      [3, { ...player('q3', '澳门大学'), rank: 3, score: 0 }],
    ])

    const model = buildBracketViewModel({
      zoneId: 524,
      part: partOf(overseasJson, { type: 'group', group: 'QW', name: '港澳台及海外赛区' }),
      getMatchByOrder: () => undefined,
      getGroupPlayerByRank: (groupName, rank) => (
        groupName === 'Q' ? byRank.get(rank) : null
      ),
    })
    const card = model.columns[0].items[0]
    expect(card.kind).toBe('info')
    if (card.kind === 'info') {
      expect(card.slots[0].displayName).toBe('香港科技大学')
      expect(card.slots[0].sourceKind).toBe('team')
      expect(card.slots[0].groupRank).toBe(1)
      expect(card.slots[1].displayName).toBe('香港大学')
      expect(card.slots[2].displayName).toBe('澳门大学')
      expect(card.slots[2].groupRank).toBe(3)
    }
  })

  it('全员未开打时名次统一显示 1', () => {
    const byRank = new Map<number, Player>([
      [1, { ...player('q1', '香港科技大学'), rank: 1 }],
      [2, { ...player('q2', '香港大学'), rank: 2 }],
      [3, { ...player('q3', '澳门大学'), rank: 3 }],
    ])

    const model = buildBracketViewModel({
      zoneId: 524,
      part: partOf(overseasJson, { type: 'group', group: 'QW', name: '港澳台及海外赛区' }),
      getMatchByOrder: () => undefined,
      getGroupPlayerByRank: (groupName, rank) => (
        groupName === 'Q' ? byRank.get(rank) : null
      ),
    })
    const card = model.columns[0].items[0]
    expect(card.kind).toBe('info')
    if (card.kind === 'info') {
      expect(card.slots.map((s) => s.displayName)).toEqual([
        '香港科技大学',
        '香港大学',
        '澳门大学',
      ])
      expect(card.slots.map((s) => s.groupRank)).toEqual([1, 1, 1])
    }
  })
})

describe('resolveBracketDensity', () => {
  it('按可见列数分级', () => {
    expect(resolveBracketDensity(1)).toBe('comfortable')
    expect(resolveBracketDensity(2)).toBe('comfortable')
    expect(resolveBracketDensity(3)).toBe('normal')
    expect(resolveBracketDensity(4)).toBe('normal')
    expect(resolveBracketDensity(5)).toBe('compact')
  })
})

describe('shouldShowBracketTypeTag', () => {
  it('≥4 列时隐藏右上角标签', () => {
    expect(shouldShowBracketTypeTag(1)).toBe(true)
    expect(shouldShowBracketTypeTag(3)).toBe(true)
    expect(shouldShowBracketTypeTag(4)).toBe(false)
    expect(shouldShowBracketTypeTag(6)).toBe(false)
  })
})
