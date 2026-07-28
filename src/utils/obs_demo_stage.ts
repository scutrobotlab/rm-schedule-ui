/**
 * OBS 演示：2025 全国赛 · 合并 A 组阶段选择器
 * 叙事：1 列连续扩到 6 列（高潮）→ 缩到 3 列 → 平移选区
 */
import {
  centerOf,
  pointerDrag,
  sleep,
  waitForSelector,
} from './obs_pointer'

export const STAGE_DEMO_DEFAULT_SRC = '/2025/572/bracket?group=0&stage=0-0'

const SELECTORS = {
  track: '.stage-range__track',
  selection: '.stage-range__selection',
  handleEnd: '.stage-range__handle--end',
} as const

export interface StageDemoOptions {
  signal?: AbortSignal
}

function cellWidth(track: Element, stageCount: number): number {
  const width = track.getBoundingClientRect().width
  return width / Math.max(stageCount, 1)
}

function readStageCount(track: Element): number {
  const root = track.closest('.stage-range')
  const raw = root
    ? getComputedStyle(root).getPropertyValue('--stage-count').trim()
    : ''
  const fromVar = Number(raw)
  if (Number.isFinite(fromVar) && fromVar > 0) return Math.round(fromVar)
  return Math.max(1, track.querySelectorAll('.stage-range__icon-cell').length)
}

/** 把右把手拖到轨道右缘（扩满）或按格数偏移 */
async function dragEndHandleTo(
  doc: Document,
  toX: number,
  durationMs: number,
  pointerId: number,
  signal?: AbortSignal,
) {
  const handleEnd = await waitForSelector(doc, SELECTORS.handleEnd, { signal })
  const from = centerOf(handleEnd)
  await pointerDrag(handleEnd, from, { x: toX, y: from.y }, {
    durationMs,
    signal,
    pointerId,
  })
}

/**
 * 在已加载的 bracket 文档内执行演示。
 * 假定初始为 1 列（stage=0-0）。
 */
export async function runStageSelectorDemo(
  doc: Document,
  opts: StageDemoOptions = {},
): Promise<void> {
  const { signal } = opts

  await waitForSelector(doc, SELECTORS.handleEnd, { timeoutMs: 20_000, signal })
  await sleep(800, signal)

  const track = await waitForSelector(doc, SELECTORS.track, { signal })
  const stageCount = readStageCount(track)
  const trackRect = track.getBoundingClientRect()
  const cw = cellWidth(track, stageCount)

  // —— 1. 高潮：右把手从 1 列一路拖到轨道右缘（满 6 列）——
  await dragEndHandleTo(doc, trackRect.right - 4, 3200, 41, signal)
  await sleep(1100, signal)

  // —— 2. 缩到约 3 列，便于后续平移 ——
  {
    const handleEnd = await waitForSelector(doc, SELECTORS.handleEnd, { signal })
    const from = centerOf(handleEnd)
    // 满宽时选区左缘应贴轨道左；目标右缘 ≈ 左 + 3 格
    const targetRight = trackRect.left + cw * 3
    await pointerDrag(handleEnd, from, { x: targetRight, y: from.y }, {
      durationMs: 1200,
      signal,
      pointerId: 42,
    })
    await sleep(600, signal)
  }

  // —— 3. 平移 3 列选区 ——
  {
    const selection = await waitForSelector(doc, SELECTORS.selection, { signal })
    const from = centerOf(selection)
    await pointerDrag(selection, from, { x: from.x + cw * 2.4, y: from.y }, {
      durationMs: 1100,
      signal,
      pointerId: 43,
    })
    await sleep(450, signal)

    const mid = centerOf(
      await waitForSelector(doc, SELECTORS.selection, { signal }),
    )
    await pointerDrag(selection, mid, { x: mid.x - cw * 2.0, y: mid.y }, {
      durationMs: 1000,
      signal,
      pointerId: 44,
    })
    await sleep(500, signal)
  }
}
