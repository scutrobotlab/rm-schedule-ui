/**
 * OBS 60 秒产品分镜演示。
 *
 * 该脚本只编排真实 Bracket DOM 的操作；字幕和片尾由 Obs.vue 根据 cue 回调绘制。
 * 默认从 2025 全国赛 A 组、0–1 两列开始。
 */
import {
  centerOf,
  pointerDrag,
  pointerLongPress,
  pointerTap,
  sleep,
  waitForSelector,
  type Point,
} from './obs_pointer'

export const STORYBOARD_DEMO_DEFAULT_SRC = '/2025/572/bracket?group=0&stage=0-1'

export interface StoryboardCue {
  scene: number
  main: string
  sub: string
  voiceover?: string
  brand?: boolean
}

export interface StoryboardDemoOptions {
  signal?: AbortSignal
  onCue?: (cue: StoryboardCue) => void
}

function all(root: ParentNode, selector: string): Element[] {
  return Array.from(root.querySelectorAll(selector))
}

function normalizedText(element: Element): string {
  return (element.textContent ?? '').replace(/\s+/g, '')
}

async function waitForText(
  root: ParentNode,
  selector: string,
  text: string,
  signal?: AbortSignal,
  timeoutMs = 15_000,
): Promise<Element> {
  const started = performance.now()
  const expected = text.replace(/\s+/g, '')
  while (performance.now() - started < timeoutMs) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const found = all(root, selector).find(element =>
      normalizedText(element).includes(expected),
    )
    if (found) return found
    await sleep(50, signal)
  }
  throw new Error(`waitForText timeout: ${selector} / ${text}`)
}

async function waitForCondition(
  check: () => boolean,
  signal?: AbortSignal,
  timeoutMs = 15_000,
): Promise<void> {
  const started = performance.now()
  while (performance.now() - started < timeoutMs) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    if (check()) return
    await sleep(50, signal)
  }
  throw new Error('waitForCondition timeout')
}

function cue(
  options: StoryboardDemoOptions,
  scene: number,
  main: string,
  sub: string,
  voiceover = '',
  brand = false,
) {
  options.onCue?.({ scene, main, sub, voiceover, brand })
}

async function tapText(
  doc: Document,
  selector: string,
  text: string,
  pointerId: number,
  signal?: AbortSignal,
): Promise<Element> {
  const target = await waitForText(doc, selector, text, signal)
  await pointerTap(target, centerOf(target), { pointerId, signal })
  return target
}

async function selectZone(doc: Document, zoneName: string, signal?: AbortSignal) {
  const selects = all(doc, '.v-select')
  const zoneSelect = selects.find(element =>
    normalizedText(element).includes('Zone'),
  ) ?? selects[1]
  if (!zoneSelect) throw new Error('Zone selector not found')

  const activator = zoneSelect.querySelector('.v-field[role="combobox"]') ?? zoneSelect
  await pointerTap(activator, centerOf(activator), { pointerId: 101, signal })
  // 完整展示下拉选项，避免“展开—选中”快得看不清。
  await sleep(1200, signal)
  const item = await waitForText(doc, '.v-list-item', zoneName, signal)
  await pointerTap(item, centerOf(item), { pointerId: 102, signal })
  await waitForCondition(
    () => normalizedText(zoneSelect).includes(zoneName),
    signal,
  )
  // Board 切换稳定即可继续，不在全国赛首屏空等。
  await sleep(550, signal)
}

async function selectSeason(doc: Document, season: string, signal?: AbortSignal) {
  const selects = all(doc, '.v-select')
  const seasonSelect = selects.find(element =>
    normalizedText(element).includes('Season'),
  ) ?? selects[0]
  if (!seasonSelect) throw new Error('Season selector not found')

  const activator = seasonSelect.querySelector('.v-field[role="combobox"]') ?? seasonSelect
  await pointerTap(activator, centerOf(activator), { pointerId: 121, signal })
  await sleep(900, signal)
  const item = await waitForText(doc, '.v-list-item', season, signal)
  await pointerTap(item, centerOf(item), { pointerId: 122, signal })
  // Season 更新会导航并重载 iframe；Obs.vue 的 load 回调会接管 2026 续段。
}

async function searchAndSelectCurrentZoneTeam(
  doc: Document,
  collegeName: string,
  signal?: AbortSignal,
) {
  const searchButton = await waitForSelector(doc, '[aria-label="搜索队伍"]', { signal })
  await pointerTap(searchButton, centerOf(searchButton), { pointerId: 114, signal })

  const dialog = await waitForSelector(doc, '.v-dialog .v-card', { signal })
  await sleep(800, signal)

  // 限定全国赛，避免同一学校在区域赛与全国赛产生多个同名结果。
  const currentZoneSwitch = dialog.querySelector(
    '.v-switch input[type="checkbox"]',
  ) as HTMLInputElement | null
  if (currentZoneSwitch && !currentZoneSwitch.checked) {
    await pointerTap(currentZoneSwitch, centerOf(currentZoneSwitch), {
      pointerId: 115,
      signal,
    })
    await sleep(800, signal)
  }

  const input = await waitForSelector(
    dialog,
    '.v-autocomplete input[type="text"]',
    { signal },
  ) as HTMLInputElement
  await pointerTap(input, centerOf(input), { pointerId: 116, signal })
  // 直接从当前赛区学校列表选择目标，不再输入 HNLG。
  await sleep(800, signal)

  const result = await waitForText(
    doc,
    '.v-overlay--active .v-list-item',
    collegeName,
    signal,
  )
  await pointerTap(result, centerOf(result), { pointerId: 117, signal })
  await sleep(700, signal)

  const selectButton = await waitForText(dialog, '.v-btn', '选中', signal)
  await pointerTap(selectButton, centerOf(selectButton), {
    pointerId: 118,
    signal,
  })
  await waitForCondition(
    () => !doc.querySelector('.v-dialog .v-card'),
    signal,
  )
  // 返回赛程后留出弹窗退场时间；长校名完整展示由后续独立分镜控制。
  await sleep(500, signal)
}

function matchCardForOrder(doc: Document, order: number): Element | undefined {
  const marker = `第${order}场`
  return all(doc, '.match-card, .mini-match').find(card =>
    normalizedText(card).includes(marker),
  )
}

function teamRowIn(card: Element, collegeName: string): Element | undefined {
  return all(card, '.team-row').find(row => {
    const label = row.getAttribute('aria-label') ?? ''
    return label.includes(collegeName) || normalizedText(row).includes(collegeName)
  })
}

async function waitForTeamInMatch(
  doc: Document,
  order: number,
  collegeName: string,
  signal?: AbortSignal,
): Promise<{ card: Element; row: Element }> {
  let result: { card: Element; row: Element } | undefined
  await waitForCondition(() => {
    const card = matchCardForOrder(doc, order)
    const row = card ? teamRowIn(card, collegeName) : undefined
    if (card && row) result = { card, row }
    return Boolean(result)
  }, signal, 20_000)
  return result!
}

async function animateScroll(
  element: HTMLElement,
  to: number,
  durationMs: number,
  signal?: AbortSignal,
) {
  const from = element.scrollTop
  const started = performance.now()
  while (performance.now() - started < durationMs) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const t = Math.min(1, (performance.now() - started) / durationMs)
    const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
    element.scrollTop = from + (to - from) * eased
    await sleep(16, signal)
  }
  element.scrollTop = to
}

async function scrollCardIntoView(
  doc: Document,
  card: Element,
  durationMs: number,
  signal?: AbortSignal,
) {
  const viewport = await waitForSelector(doc, '.bracket-scroll', { signal }) as HTMLElement
  const viewportRect = viewport.getBoundingClientRect()
  const cardRect = card.getBoundingClientRect()
  const targetScrollTop = Math.max(
    0,
    // 第 21 场停在视口中部偏下即可，避免为了贴近顶部而下滑过深。
    viewport.scrollTop + cardRect.top - viewportRect.top - viewportRect.height * 0.48,
  )
  const from: Point = {
    x: viewportRect.left + viewportRect.width * 0.72,
    y: viewportRect.top + viewportRect.height * 0.72,
  }
  const to: Point = { x: from.x, y: viewportRect.top + viewportRect.height * 0.28 }
  await Promise.all([
    pointerDrag(viewport, from, to, {
      durationMs,
      pointerId: 103,
      signal,
    }),
    animateScroll(viewport, targetScrollTop, durationMs, signal),
  ])
}

async function boardPanToLastStages(doc: Document, signal?: AbortSignal) {
  const viewport = await waitForSelector(doc, '.bracket-scroll', { signal })
  const rect = viewport.getBoundingClientRect()
  const y = rect.top + rect.height * 0.68
  // 两列视图下，约四分之一屏宽的左滑对应前进一列。
  // 分四次完成 0–1 → 1–2 → 2–3 → 3–4 → 4–5，让吸附过程可见。
  const fromX = rect.left + rect.width * 0.72
  const toX = rect.left + rect.width * 0.47
  for (let index = 0; index < 4; index++) {
    await pointerDrag(
      viewport,
      { x: fromX, y },
      { x: toX, y },
      {
        durationMs: 520,
        pointerId: 105 + index,
        signal,
      },
    )
    await sleep(360, signal)
  }
}

async function returnBoardToTop(doc: Document, signal?: AbortSignal) {
  const viewport = await waitForSelector(doc, '.bracket-scroll', { signal }) as HTMLElement
  const rect = viewport.getBoundingClientRect()
  const from: Point = {
    x: rect.left + rect.width * 0.72,
    y: rect.top + rect.height * 0.3,
  }
  const to: Point = {
    x: from.x,
    y: rect.top + rect.height * 0.76,
  }
  // 手指向下拖动，赛程同步回到顶部；触摸覆盖层可完整显示按下和移动。
  await Promise.all([
    pointerDrag(viewport, from, to, {
      durationMs: 1200,
      pointerId: 129,
      signal,
    }),
    animateScroll(viewport, 0, 1200, signal),
  ])
  // 到顶后留出明确静止，让观众把注意力转移到阶段选择器。
  await sleep(1700, signal)
}

async function revealStageHandles(doc: Document, signal?: AbortSignal) {
  const selector = await waitForSelector(doc, '.stage-range', { signal })
  selector.dispatchEvent(new CustomEvent('stage-range:reveal-handles', {
    bubbles: false,
  }))
  await waitForCondition(
    () => (
      selector.classList.contains('stage-range--handles-revealing') ||
      !selector.classList.contains('stage-range--handles-hidden')
    ),
    signal,
  )
  // 1.5 秒完整播放滑块/把手生长，再留 3 秒让观众看清最终状态。
  await sleep(4500, signal)
}

async function stageGeometry(doc: Document, signal?: AbortSignal) {
  const track = await waitForSelector(doc, '.stage-range__track', { signal })
  const handle = await waitForSelector(doc, '.stage-range__handle--start', { signal })
  const trackRect = track.getBoundingClientRect()
  return { trackRect, handle }
}

/** 第一遍：快速直达六列，作为干净有力的英雄镜头。 */
async function expandFastHero(
  doc: Document,
  signal?: AbortSignal,
  durationMs = 1000,
) {
  const { trackRect, handle } = await stageGeometry(doc, signal)
  const from = centerOf(handle)
  await pointerDrag(
    handle,
    from,
    { x: trackRect.left + 2, y: from.y },
    { durationMs, pointerId: 106, signal },
  )
  await sleep(1400, signal)
}

/**
 * 独立英雄镜头：保留主分镜第 6–8 镜的前奏、展开和全景停留。
 * 拖动复用主分镜的轨迹与缓动，但独立素材适当放慢，方便后期剪辑。
 */
export async function runHeroDemo(
  doc: Document,
  options: StoryboardDemoOptions = {},
): Promise<void> {
  const { signal } = options
  await waitForSelector(doc, '.stage-range__handle--start', {
    timeoutMs: 20_000,
    signal,
  })

  // 第 6 镜前半：无把手状态下静止蓄力；随后播放相同的把手入场与停顿。
  await sleep(4500, signal)
  await revealStageHandles(doc, signal)

  // 第 7 镜：独立素材将展开延长至 1.5 秒，其余节奏保持不变。
  await expandFastHero(doc, signal, 1500)
  await sleep(1300, signal)

  // 第 8 镜：保持完整全景，给后期留下与主视频一致的收束素材。
  await sleep(3500, signal)
}

async function collapseToFirstStage(doc: Document, signal?: AbortSignal) {
  const track = await waitForSelector(doc, '.stage-range__track', { signal })
  const handle = await waitForSelector(doc, '.stage-range__handle--end', { signal })
  const trackRect = track.getBoundingClientRect()
  const stageCount = Math.max(1, track.querySelectorAll('.stage-range__icon-cell').length)
  const from = centerOf(handle)
  await pointerDrag(
    handle,
    from,
    {
      x: trackRect.left + trackRect.width / stageCount - 2,
      y: from.y,
    },
    // 第二次也是最后一次范围调整：慢慢从六列收到一列，展示信息展开。
    {
      durationMs: 3500,
      pointerId: 107,
      easing: 'linear',
      signal,
    },
  )
  await sleep(1200, signal)
}

async function selectGroup(doc: Document, label: string, pointerId: number, signal?: AbortSignal) {
  await tapText(doc, '.group-selector__item', label, pointerId, signal)
  await sleep(1000, signal)
}

/** 两列选区拖到轨道最右端，定位 2025 胜者组半决赛与决赛。 */
async function dragStageRangeToFinal(doc: Document, signal?: AbortSignal) {
  const track = await waitForSelector(doc, '.stage-range__track', { signal })
  const selection = await waitForSelector(doc, '.stage-range__selection', { signal })
  const trackRect = track.getBoundingClientRect()
  const selectionRect = selection.getBoundingClientRect()
  const from = centerOf(selection)
  await pointerDrag(
    selection,
    from,
    {
      x: trackRect.right - selectionRect.width / 2 - 2,
      y: from.y,
    },
    { durationMs: 1200, pointerId: 130, signal },
  )
  await sleep(1800, signal)
}

/** 防御性确认当前 Group 为默认 0–1 两列；正常 Season 流程下不会产生手势。 */
async function ensureFirstTwoStages(doc: Document, signal?: AbortSignal) {
  const track = await waitForSelector(doc, '.stage-range__track', { signal })
  const selection = await waitForSelector(doc, '.stage-range__selection', { signal })
  const trackRect = track.getBoundingClientRect()
  const stageCount = Math.max(1, track.querySelectorAll('.stage-range__icon-cell').length)
  const selectionRect = selection.getBoundingClientRect()
  const targetWidth = trackRect.width * Math.min(2, stageCount) / stageCount
  if (Math.abs(selectionRect.width - targetWidth) < 3) return

  const handle = await waitForSelector(doc, '.stage-range__handle--end', { signal })
  const from = centerOf(handle)
  await pointerDrag(
    handle,
    from,
    {
      x: trackRect.left + targetWidth - 2,
      y: from.y,
    },
    { durationMs: 650, pointerId: 123, signal },
  )
  await sleep(500, signal)
}

/** 将当前 Group 从默认两列展开到完整阶段范围。 */
async function expandStageRangeToAllStages(doc: Document, signal?: AbortSignal) {
  const track = await waitForSelector(doc, '.stage-range__track', { signal })
  const selection = await waitForSelector(doc, '.stage-range__selection', { signal })
  const trackRect = track.getBoundingClientRect()
  const selectionRect = selection.getBoundingClientRect()
  if (Math.abs(selectionRect.right - trackRect.right) < 3) return

  const handle = await waitForSelector(doc, '.stage-range__handle--end', { signal })
  const from = centerOf(handle)
  await pointerDrag(
    handle,
    from,
    { x: trackRect.right - 2, y: from.y },
    { durationMs: 1500, pointerId: 124, easing: 'linear', signal },
  )
  await sleep(1200, signal)
}

async function runStoryboard2026Continuation(
  doc: Document,
  options: StoryboardDemoOptions,
): Promise<void> {
  const { signal } = options
  await waitForSelector(doc, '.bracket-page', { timeoutMs: 20_000, signal })
  await waitForText(doc, '.v-select', '2026', signal, 20_000)
  await waitForText(doc, '.v-select', '复活赛', signal, 20_000)

  const seasonVoiceover = '来到 2026，新的晋级之路，就此展开。'
  cue(options, 11, '2026 复活赛', '切换赛季 · 进入默认赛区', seasonVoiceover)
  await sleep(900, signal)
  cue(options, 11, '复活赛 → 全国赛', '切换 Zone · 进入2026全国赛', seasonVoiceover)
  await selectZone(doc, '全国赛', signal)
  await sleep(900, signal)
  cue(
    options,
    12,
    '2026 全国赛 · 淘汰赛胜者组',
    '第0–4阶段 · 完整晋级路径',
    '对阵尚未揭晓，但晋级的方向依然清晰可见。',
  )
  await selectGroup(doc, '淘汰赛胜者组', 124, signal)
  await expandStageRangeToAllStages(doc, signal)
  await sleep(5000, signal)

  cue(
    options,
    13,
    'Bracket · 一图看懂晋级',
    '从一场比赛，到完整晋级之路',
    '',
    true,
  )
  await sleep(5000, signal)
}

/**
 * 分镜总长约 100 秒。初始数据等待不计入动作节奏；录制时建议在 iframe 稳定后开始。
 */
export async function runStoryboardDemo(
  doc: Document,
  options: StoryboardDemoOptions = {},
): Promise<void> {
  const { signal } = options
  if (doc.location.pathname.startsWith('/2026/')) {
    await runStoryboard2026Continuation(doc, options)
    return
  }

  await waitForSelector(doc, '.bracket-page', { timeoutMs: 20_000, signal })
  await waitForTeamInMatch(doc, 1, '华南理工大学', signal).catch(() => undefined)

  cue(
    options,
    1,
    '2025 全国赛',
    '默认两列，清晰查看每场对阵',
    '这，是全新的 RM Schedule 移动端。两列，看清晋级之路。',
  )
  await sleep(8000, signal)

  const jingchengName = '南京航空航天大学金城学院'
  const searchVoiceover = '搜索并选中队伍，即可高亮全部赛程。再长的校名，也能完整呈现。'
  cue(options, 2, '直接选择南航金城', '限定当前赛区 · 快速定位', searchVoiceover)
  await searchAndSelectCurrentZoneTeam(doc, jingchengName, signal)

  const jingcheng = await waitForTeamInMatch(doc, 5, jingchengName, signal)
  await waitForCondition(
    () => jingcheng.row.classList.contains('selected'),
    signal,
  )
  await waitForCondition(
    () => Boolean(jingcheng.row.querySelector('.selected-name-marquee')),
    signal,
  )
  cue(options, 2, '长校名完整展示', '选中后自动滚动', searchVoiceover)
  // 0.5 秒延迟 + 5 秒完整滚动周期，让校名从头到尾清楚出现。
  await sleep(5500, signal)

  const first = await waitForTeamInMatch(doc, 1, '华南理工大学', signal)
  const highlightVoiceover = '点击你关注的队伍，高亮随之切换。沿着路径，跟踪晋级的每一步。'
  cue(options, 3, '直接点击切换高亮', '南航金城 → 华南理工', highlightVoiceover)
  await pointerTap(first.row, centerOf(first.row), { pointerId: 119, signal })
  await sleep(1200, signal)

  cue(options, 3, '高亮路径 · 上下浏览', '第1场 0–2 → 第21场 2–0', highlightVoiceover)
  await sleep(450, signal)
  const twentyFirst = await waitForTeamInMatch(doc, 21, '华南理工大学', signal)
  await scrollCardIntoView(doc, twentyFirst.card, 2400, signal)
  await sleep(4000, signal)

  cue(
    options,
    4,
    '第21场 · 长按查看更多',
    '回放 · 比赛分析 · 队伍分析',
    '长按队伍，展开菜单选项。快速跳转B站回放或数据分析。',
  )
  await pointerLongPress(twentyFirst.row, centerOf(twentyFirst.row), {
    pointerId: 109,
    holdMs: 700,
    signal,
  })
  await waitForSelector(doc, '.bracket-menu-close', { signal })
  // 给回放 iframe 留出加载和播放时间，菜单内容至少完整展示数秒。
  await sleep(7200, signal)
  const close = await waitForSelector(doc, '.bracket-menu-close', { signal })
  await pointerTap(close, centerOf(close), { pointerId: 110, signal })
  await sleep(1350, signal)

  cue(
    options,
    5,
    '赛程区向左滑动',
    '第0–1阶段 → 第4–5阶段',
    '向左滑动，沿着赛程，回顾晋级之路的每一步。',
  )
  await boardPanToLastStages(doc, signal)
  await sleep(2150, signal)

  cue(
    options,
    6,
    '阶段范围选择器',
    '平移浏览 → 自由缩放',
    '回到顶部。两列，不是视野的边界——让我们展开全局视角。',
  )
  await sleep(350, signal)
  await returnBoardToTop(doc, signal)
  await revealStageHandles(doc, signal)

  cue(options, 7, '快速展开完整赛程', '2列 → 6列 · 英雄镜头')
  await expandFastHero(doc, signal)
  await sleep(1300, signal)

  cue(
    options,
    8,
    '华南理工 · 3胜1负晋级',
    '比赛比分 0–2 · 2–0 · 2–0 · 2–0',
    '开局失利，更要看清全局。',
  )
  await sleep(3500, signal)

  cue(
    options,
    9,
    '聚焦单一阶段，展开完整数据',
    '状态 · 场次 · 时间 · 支持率 · 胜场 · 对手分',
    '从六列到一列，每一级缩放，都呈现恰到好处的信息密度。',
  )
  await collapseToFirstStage(doc, signal)
  await sleep(2500, signal)

  const knockoutVoiceover = '从瑞士轮，到淘汰赛，再到金色之雨——每走一步，都算数。'
  cue(options, 10, '2025 全国赛淘汰赛', 'A组 → 败者组 → 胜者组', knockoutVoiceover)
  await selectGroup(doc, '淘汰赛败者组', 111, signal)
  await sleep(650, signal)
  await selectGroup(doc, '淘汰赛胜者组', 112, signal)
  await sleep(800, signal)
  await ensureFirstTwoStages(doc, signal)

  cue(
    options,
    10,
    '2025 最终对决',
    '拖拽定位半决赛与决赛 · 冠军高光',
    knockoutVoiceover,
  )
  await dragStageRangeToFinal(doc, signal)
  await sleep(2600, signal)

  cue(
    options,
    11,
    '2025 → 2026',
    '切换赛季 · 默认进入复活赛',
    '来到 2026，新的晋级之路，就此展开。',
  )
  await sleep(900, signal)
  await selectSeason(doc, '2026', signal)
}
