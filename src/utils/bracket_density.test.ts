import { describe, expect, it } from 'vitest'
import {
  bracketDisplayUnits,
  resolveBracketTitleShortenLevel,
  shouldForceBracketPendingName,
  shouldShowBracketPendingScore,
  shouldShowBracketPlaceholderLogo,
  shortenBracketSourceLabel,
  shortenBracketTitle,
} from './bracket_density'

describe('bracketDisplayUnits', () => {
  it.each([
    ['瑞士轮第一轮 0-0', 7],
    ['16进8淘汰赛', 5.5],
    ['Q组海外队伍小组赛', 8.5],
    ['A1 胜-负：！', 3],
  ])('按中英文宽度计量 %s', (title, expected) => {
    expect(bracketDisplayUnits(title)).toBe(expected)
  })
})

describe('resolveBracketTitleShortenLevel', () => {
  it.each([
    [2, 0],
    [3, 1],
    [4, 2],
    [5, 3],
    [6, 4],
  ])('可见 %i 列 → 档位 %i', (columns, level) => {
    expect(resolveBracketTitleShortenLevel(columns)).toBe(level)
  })
})

describe('shortenBracketTitle', () => {
  it.each([
    ['瑞士轮第一轮 0-0', '第一轮 0-0'],
    ['瑞士轮第二轮 1-0', '第二轮 1-0'],
    ['瑞士轮第三轮 1-1', '第三轮 1-1'],
    ['瑞士轮第四轮 2-1', '第四轮 2-1'],
    ['瑞士轮第五轮 2-2', '第五轮 2-2'],
    ['瑞士轮第一轮 0胜0负', '第一轮 0-0'],
    ['瑞士轮第二轮 1胜0负', '第二轮 1-0'],
    ['16进8败者组第一轮', '16进8败者一'],
    ['16进8败者组第二轮', '16进8败者二'],
    ['8进4败者组第一轮', '8进4败者一'],
    ['8进4败者组第二轮', '8进4败者二'],
    ['8进4败者组第一场', '8进4败者一'],
    ['全国赛名额争夺', '名额争夺'],
    ['全国赛名额争夺 1-1', '名额争夺 1-1'],
    ['复活赛名额争夺 0-0', '名额争夺 0-0'],
    ['Q组海外队伍小组赛', 'Q组小组赛'],
    ['W组海外队伍小组赛', 'W组小组赛'],
    ['海外队伍淘汰赛', '海外淘汰'],
  ])('≥3 列按语义缩减 %s', (title, expected) => {
    expect(shortenBracketTitle(title, 1)).toBe(expected)
  })

  it.each([
    '第一轮 0-0',
    '16进8淘汰赛',
    '8进4淘汰赛',
    '16进8胜者组',
    '16进8第一轮',
    '冠军争夺战',
    '季军争夺战',
    '晋级淘汰赛 3-0',
  ])('≥3 列不改写不超过 6 单位的标题 %s', (title) => {
    expect(shortenBracketTitle(title, 1)).toBe(title)
  })

  it('≥4 列追加档：晋级淘汰赛 3-0 → 晋级 3-0', () => {
    expect(shortenBracketTitle('晋级淘汰赛 3-0', 2)).toBe('晋级 3-0')
  })

  it.each([
    ['晋级全国赛 2-0', '全国赛 2-0'],
    ['晋级复活赛 1-2', '复活赛 1-2'],
  ])('≥4 列追加档去掉晋级前缀 %s', (title, expected) => {
    expect(shortenBracketTitle(title, 2)).toBe(expected)
  })

  it.each([
    '晋级全国赛',
    '晋级复活赛',
  ])('≥4 列时不缩减无比分去向标题 %s', (title) => {
    expect(shortenBracketTitle(title, 2)).toBe(title)
  })

  it.each([
    ['16进8第一轮', '16进8一轮'],
    ['16进8胜者组', '16进8胜者'],
  ])('≥5 列压缩 16进8 %s', (title, expected) => {
    expect(shortenBracketTitle(title, 3)).toBe(expected)
  })

  it.each([
    '8进4第一轮',
    '8进4胜者组',
  ])('≥5 列不修改 8进4 标题 %s', (title) => {
    expect(shortenBracketTitle(title, 3)).toBe(title)
  })

  it.each([
    ['第一轮 0-0', '0-0'],
    ['第二轮 1-0', '1-0'],
    ['第三轮 1-1', '1-1'],
    ['第四轮 2-1', '2-1'],
    ['第五轮 2-2', '2-2'],
    ['瑞士轮第一轮 0-0', '0-0'],
  ])('≥6 列瑞士轮只留战绩 %s', (title, expected) => {
    expect(shortenBracketTitle(title, 4)).toBe(expected)
  })

  it('缩减超长淘汰赛修饰语时保留 N进M', () => {
    expect(shortenBracketTitle('1234进5678淘汰赛', 1)).toBe('1234进5678')
    expect(shortenBracketTitle('1234进5678胜者组第一轮', 1)).toBe('1234进5678胜')
  })
})

describe('shortenBracketSourceLabel', () => {
  it('1–2 列保留完整来源文案', () => {
    expect(shortenBracketSourceLabel('第一轮 第1名', 'comfortable'))
      .toBe('第一轮 第1名')
  })

  it('3 列起只显示名次', () => {
    expect(shortenBracketSourceLabel('第一轮 第1名', 'normal')).toBe('第1名')
    expect(shortenBracketSourceLabel('第二轮 第12名', 'compact')).toBe('第12名')
  })

  it('仅按调用方要求压缩前序场次胜负来源', () => {
    expect(shortenBracketSourceLabel('第41场胜者', 'normal')).toBe('第41场胜者')
    expect(shortenBracketSourceLabel('第41场胜者', 'normal', 1)).toBe('41胜者')
    expect(shortenBracketSourceLabel('第41场 胜者', 'normal', 1)).toBe('41胜者')
    expect(shortenBracketSourceLabel('第66场败者', 'compact', 2)).toBe('66败')
    expect(shortenBracketSourceLabel('第66场 败者', 'compact', 2)).toBe('66败')
    expect(shortenBracketSourceLabel('第41场胜者', 'comfortable')).toBe('第41场胜者')
  })

  it('不改写其他来源文案', () => {
    expect(shortenBracketSourceLabel('半决赛胜者', 'normal')).toBe('半决赛胜者')
  })
})

describe('shouldShowBracketPlaceholderLogo', () => {
  it('1–3 列显示，4 列及以上隐藏', () => {
    expect(shouldShowBracketPlaceholderLogo(1)).toBe(true)
    expect(shouldShowBracketPlaceholderLogo(3)).toBe(true)
    expect(shouldShowBracketPlaceholderLogo(4)).toBe(false)
    expect(shouldShowBracketPlaceholderLogo(6)).toBe(false)
  })
})

describe('未确定席位的高列数展示', () => {
  it('5 列起隐藏占位比分', () => {
    expect(shouldShowBracketPendingScore(4)).toBe(true)
    expect(shouldShowBracketPendingScore(5)).toBe(false)
    expect(shouldShowBracketPendingScore(6)).toBe(false)
  })

  it('6 列起强制展示来源文字', () => {
    expect(shouldForceBracketPendingName(5)).toBe(false)
    expect(shouldForceBracketPendingName(6)).toBe(true)
  })
})
