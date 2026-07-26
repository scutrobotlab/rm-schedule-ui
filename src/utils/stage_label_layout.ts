const LABEL_BREAK_SUFFIXES = [
  '第一轮',
  '第二轮',
  '第三轮',
  '第四轮',
  '第五轮',
  '胜者组',
  '败者组',
] as const

const ALWAYS_WRAP_LABELS = new Set([
  '16进8第一轮',
  '16进8胜者组',
  '8进4胜者组',
])

/** 优先按赛制语义断句，不适用时保持单行。 */
export function splitStageLabelByMeaning(label: string): string[] {
  if (label.length <= 8 && !ALWAYS_WRAP_LABELS.has(label)) return [label]

  for (const suffix of LABEL_BREAK_SUFFIXES) {
    if (label.endsWith(suffix) && label.length > suffix.length) {
      return [label.slice(0, -suffix.length), suffix]
    }
  }
  return [label]
}

/** 空间不足时使用的通用断句；短标题保持完整。 */
export function splitOverlappingStageLabel(label: string): string[] {
  const semanticLines = splitStageLabelByMeaning(label)
  if (semanticLines.length > 1 || label.length <= 4) return semanticLines

  const mid = Math.ceil(label.length / 2)
  return [label.slice(0, mid), label.slice(mid)]
}

/**
 * 返回发生自然单行文字重叠的标题下标。
 * widths 与 centers 均使用同一坐标系；文字按各阶段格中心对齐。
 */
export function findOverlappingStageLabels(
  widths: number[],
  centers: number[],
): Set<number> {
  const overlapping = new Set<number>()
  const count = Math.min(widths.length, centers.length)

  for (let index = 0; index < count - 1; index += 1) {
    const rightEdge = centers[index] + widths[index] / 2
    const nextLeftEdge = centers[index + 1] - widths[index + 1] / 2
    if (rightEdge > nextLeftEdge) {
      overlapping.add(index)
      overlapping.add(index + 1)
    }
  }

  return overlapping
}
