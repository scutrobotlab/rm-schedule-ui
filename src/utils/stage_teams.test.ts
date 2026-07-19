import { describe, expect, it } from 'vitest'
import {
  GroupZoneGroup1JsonData,
  GetGroupZoneKnockoutJsonData,
} from '../constant/group_zone'
import { ZoneMap, type Part } from '../constant/zone'
import { resolveBracketParts } from './bracket_part_merge'
import { getStageMatchCounts, getStageTeamCounts } from './stage_teams'

function partOf(jsonData: Part['jsonData'], overrides: Partial<Part> = {}): Part {
  return {
    name: overrides.name ?? 'A组',
    type: overrides.type ?? 'group',
    group: overrides.group ?? 'A',
    jsonData,
    ...overrides,
  }
}

describe('getStageTeamCounts', () => {
  it('合并 A 组：中间轮计入已锁定晋级', () => {
    const zone = ZoneMap[2026]?.find((z) => z.name === '南部赛区')
    expect(zone).toBeTruthy()
    const aGroup = resolveBracketParts(zone!).find((bp) => bp.part.name === 'A组')!.part

    const counts = getStageTeamCounts(aGroup.jsonData, aGroup)
    expect(aGroup.jsonData.stages).toEqual([
      '第一轮',
      '第二轮',
      '第三轮',
      '第四轮',
      '第五轮',
      '晋级',
    ])
    // 16 → 16 → 14(12 续赛+2 已 3-0) → 11(6+5) → 8 → 8
    expect(counts).toEqual([16, 16, 14, 11, 8, 8])
  })

  it('未合并前段：行为与原先一致（含中间晋级列）', () => {
    const part = partOf(GroupZoneGroup1JsonData, { name: 'A组前段', group: 'A' })
    const counts = getStageTeamCounts(part.jsonData, part)
    expect(counts[0]).toBe(16)
    expect(counts[1]).toBe(16)
    // 第三轮后：12 进第四轮 + 2 已晋级 = 14
    expect(counts[2]).toBe(14)
    expect(counts[3]).toBe(14)
    expect(counts[4]).toBe(14)
  })

  it('淘汰赛：规模逐轮缩小', () => {
    const part = partOf(GetGroupZoneKnockoutJsonData(614), {
      name: '淘汰赛',
      type: 'knockout',
      group: 'Knockout',
    })
    const counts = getStageTeamCounts(part.jsonData, part)
    expect(counts[0]).toBe(8)
    expect(counts[1]).toBe(4)
    expect(counts[2]).toBe(2)
  })
})

describe('getStageMatchCounts', () => {
  it('合并 A 组：横线按本轮比赛数', () => {
    const zone = ZoneMap[2026]?.find((z) => z.name === '南部赛区')
    expect(zone).toBeTruthy()
    const aGroup = resolveBracketParts(zone!).find((bp) => bp.part.name === 'A组')!.part

    const counts = getStageMatchCounts(aGroup.jsonData, aGroup)
    // 8 / 8 / 8 / 6 / 3 / 0（晋级列无对阵）
    expect(counts).toEqual([8, 8, 8, 6, 3, 0])
  })

  it('淘汰赛：场数逐轮减半', () => {
    const part = partOf(GetGroupZoneKnockoutJsonData(614), {
      name: '淘汰赛',
      type: 'knockout',
      group: 'Knockout',
    })
    const counts = getStageMatchCounts(part.jsonData, part)
    expect(counts[0]).toBe(8)
    expect(counts[1]).toBe(4)
    expect(counts[2]).toBe(2)
  })
})
