import { describe, expect, it } from 'vitest'
import type { GroupRankInfo } from '../types/group_rank_info'
import { resolveGroupRankStat } from './group_rank'

const data: GroupRankInfo = {
  zones: [{
    zoneName: '测试赛区',
    zoneId: '618',
    groups: [{
      groupName: 'A组',
      groupPlayers: [
        [
          { itemName: '战队', itemValue: { collegeName: '甲大学' } },
          { itemName: '胜/平/负', itemValue: '3/0/1' },
          { itemName: '胜场数', itemValue: 3 },
          { itemName: '对手分', itemValue: -2 },
        ],
        [
          { itemName: '战队', itemValue: { collegeName: '乙大学' } },
          { itemName: '胜/平/负', itemValue: '2/0/2' },
          { itemName: '对手分', itemValue: 5 },
        ],
      ],
    }],
  }],
}

describe('resolveGroupRankStat', () => {
  it('按赛区、小组和学校读取胜场数与对手分', () => {
    expect(resolveGroupRankStat(data, 618, 'A', '甲大学', '胜场数')).toBe('3')
    expect(resolveGroupRankStat(data, 618, 'A', '甲大学', '对手分')).toBe('-2')
  })

  it('旧数据缺少胜场数字段时从胜平负提取', () => {
    expect(resolveGroupRankStat(data, 618, 'A', '乙大学', '胜场数')).toBe('2')
  })

  it('没有对应数据时返回占位符', () => {
    expect(resolveGroupRankStat(data, 618, 'B', '甲大学', '胜场数')).toBe('—')
  })
})
