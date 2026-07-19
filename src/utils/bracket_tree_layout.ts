import type { BracketColumn, BracketConnection } from '../types/bracket'

export interface KnockoutLayoutInput {
  columns: BracketColumn[]
  connections: BracketConnection[]
  /** 各节点内容高度（不含 margin） */
  heights: Record<string, number>
  gap: number
}

export interface KnockoutLayoutResult {
  /** 相对 column-items 顶边的 offsetTop */
  tops: Record<string, number>
  /** 各列内容区所需高度 */
  columnHeights: Record<number, number>
}

/**
 * 淘汰赛列布局：右侧节点垂直居中于其左侧相邻两个 feeder 的中点。
 * 仅使用已有连线与量测高度；无 2 个 feeder 时退化为单 feeder 对齐或顺序堆叠。
 */
export function computeKnockoutLayout(input: KnockoutLayoutInput): KnockoutLayoutResult {
  const { columns, connections, heights, gap } = input
  const tops: Record<string, number> = {}
  const centers: Record<string, number> = {}
  const columnHeights: Record<number, number> = {}

  const incoming = new Map<string, string[]>()
  for (const c of connections) {
    const list = incoming.get(c.toNodeId)
    if (list) list.push(c.fromNodeId)
    else incoming.set(c.toNodeId, [c.fromNodeId])
  }

  const nodeColumn = new Map<string, number>()
  for (const col of columns) {
    for (const item of col.items) {
      nodeColumn.set(item.nodeId, col.index)
    }
  }

  for (let ci = 0; ci < columns.length; ci++) {
    const col = columns[ci]
    let cursor = 0
    let maxBottom = 0

    for (const item of col.items) {
      const id = item.nodeId
      const h = Math.max(0, heights[id] ?? 0)
      const parents = resolveParents(id, ci, incoming, nodeColumn, centers)

      let top: number
      if (parents.length >= 2) {
        const c0 = centers[parents[0]]
        const c1 = centers[parents[1]]
        top = (c0 + c1) / 2 - h / 2
      } else if (parents.length === 1) {
        top = centers[parents[0]] - h / 2
      } else {
        top = cursor
      }

      // 同列不重叠：必要时下推（极端不等高时）
      if (top < cursor) top = cursor
      if (top < 0) top = 0

      tops[id] = top
      centers[id] = top + h / 2
      const bottom = top + h
      cursor = bottom + gap
      if (bottom > maxBottom) maxBottom = bottom
    }

    columnHeights[col.index] = maxBottom
  }

  return { tops, columnHeights }
}

/**
 * 将锚点列（当前视口最左列）的最上节点顶对齐到 0，整树一起上移。
 * 仅当该列节点数 ≤ 2 时生效（半决赛/决赛等稀疏列）；节点更多时保持原树形位置。
 * 左侧不可见列可能出现负 top，由 board overflow 裁切即可。
 */
export function shiftLayoutToAnchor(
  result: KnockoutLayoutResult,
  anchorColumnIndex: number,
  columns: BracketColumn[],
  heights: Record<string, number>,
): KnockoutLayoutResult {
  const col =
    columns.find((c) => c.index === anchorColumnIndex) ?? columns[anchorColumnIndex]
  if (!col?.items.length) return result
  // 最左列节点较多时不贴顶上移，避免大段树形被整体抽动
  if (col.items.length > 2) return result

  let minTop = Infinity
  for (const item of col.items) {
    const t = result.tops[item.nodeId]
    if (t != null && t < minTop) minTop = t
  }
  if (!Number.isFinite(minTop) || Math.abs(minTop) < 0.5) return result

  const tops: Record<string, number> = {}
  for (const [id, t] of Object.entries(result.tops)) {
    tops[id] = t - minTop
  }

  const columnHeights: Record<number, number> = {}
  for (const c of columns) {
    let maxBottom = 0
    for (const item of c.items) {
      const t = tops[item.nodeId] ?? 0
      const h = Math.max(0, heights[item.nodeId] ?? 0)
      const bottom = t + h
      if (bottom > maxBottom) maxBottom = bottom
    }
    columnHeights[c.index] = Math.max(0, maxBottom)
  }

  return { tops, columnHeights }
}

/** 优先取上一列的 feeder；凑不满 2 个再取更左侧已布局节点 */
function resolveParents(
  nodeId: string,
  columnIndex: number,
  incoming: Map<string, string[]>,
  nodeColumn: Map<string, number>,
  centers: Record<string, number>,
): string[] {
  const raw = incoming.get(nodeId) ?? []
  const placed = raw.filter((id) => centers[id] !== undefined)

  const fromPrev = placed
    .filter((id) => nodeColumn.get(id) === columnIndex - 1)
    .sort((a, b) => centers[a] - centers[b])

  if (fromPrev.length >= 2) return pickAdjacentPair(fromPrev, centers)
  if (fromPrev.length === 1) return fromPrev

  const fromLeft = placed
    .filter((id) => (nodeColumn.get(id) ?? 999) < columnIndex)
    .sort((a, b) => centers[a] - centers[b])

  if (fromLeft.length >= 2) return pickAdjacentPair(fromLeft, centers)
  return fromLeft.slice(0, 1)
}

function pickAdjacentPair(sorted: string[], centers: Record<string, number>): string[] {
  if (sorted.length <= 2) return sorted.slice(0, 2)
  let best = [sorted[0], sorted[1]]
  let bestSpan = centers[sorted[1]] - centers[sorted[0]]
  for (let i = 1; i < sorted.length - 1; i++) {
    const span = centers[sorted[i + 1]] - centers[sorted[i]]
    if (span < bestSpan) {
      bestSpan = span
      best = [sorted[i], sorted[i + 1]]
    }
  }
  return best
}
