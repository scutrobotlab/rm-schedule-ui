import { describe, expect, it } from 'vitest'
import {
  findOverlappingStageLabels,
  splitOverlappingStageLabel,
  splitStageLabelByMeaning,
} from './stage_label_layout'

describe('stage label layout', () => {
  it.each([
    ['16进8第一轮', ['16进8', '第一轮']],
    ['16进8胜者组', ['16进8', '胜者组']],
    ['8进4胜者组', ['8进4', '胜者组']],
  ])('按赛制语义拆分 %s', (label, expected) => {
    expect(splitStageLabelByMeaning(label)).toEqual(expected)
  })

  it('短标题保持单行', () => {
    expect(splitOverlappingStageLabel('半决赛')).toEqual(['半决赛'])
    expect(splitOverlappingStageLabel('决赛')).toEqual(['决赛'])
  })

  it('复活赛的短轮次标题不因语义后缀换行', () => {
    expect(splitStageLabelByMeaning('败者组第二轮')).toEqual(['败者组第二轮'])
  })

  it('将空间不足且没有语义后缀的长标题从中间拆开', () => {
    expect(splitOverlappingStageLabel('全国赛晋级结果')).toEqual(['全国赛晋', '级结果'])
  })

  it('返回所有相邻重叠标题', () => {
    expect([...findOverlappingStageLabels(
      [70, 70, 20],
      [40, 100, 160],
    )]).toEqual([0, 1])
  })

  it('相邻标题边缘相接不视为重叠', () => {
    expect(findOverlappingStageLabels(
      [60, 60],
      [30, 90],
    ).size).toBe(0)
  })
})
