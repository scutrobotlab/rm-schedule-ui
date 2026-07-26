<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import StageRangeSelector, {
  type StageItem,
  type StageRange,
  type StageRangeEdges,
} from './StageRangeSelector.vue'
import BracketBoard from './bracket/BracketBoard.vue'
import AnalyzeTeam from './AnalyzeTeam.vue'
import AnalyzeMatch from './AnalyzeMatch.vue'
import MatchMenu from './MatchMenu.vue'
import SearchPlayer from './SearchPlayer.vue'
import About from './About.vue'
import GraphComment from './GraphComment.vue'
import UpdateAnnouncement from './UpdateAnnouncement.vue'
import AnniversaryAnnouncement from './AnniversaryAnnouncement.vue'
import logoUrl from '@/assets/logo.png'
import { DefaultZoneMap, Part, SeasonList, ZoneMap } from '../constant/zone'
import { usePromotionStore } from '../stores/promotion'
import { useAppStore } from '../stores/app'
import { getStageMatchCounts } from '../utils/stage_teams'
import { buildBracketViewModel, zonesForPart } from '../utils/bracket_adapter'
import {
  resolveBracketParts,
  type BracketPart,
} from '../utils/bracket_part_merge'
import type { BracketViewModel } from '../types/bracket'
import type { MatchNode, Player } from '../types/schedule'
import type { BilibiliReplay } from '../types/bilibili_replay'
import type { TeamInfo } from '../types/team_info'
import { isPointerTap } from '../utils/pointer_tap'

const stageRange = ref<StageRange>({ start: 0, end: 1 })
/** 视口左右边缘（右开区间，允许小数）；渲染与跟手以此为准 */
const windowLeft = ref(0)
const windowRight = ref(2)

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const promotionStore = usePromotionStore()

const liveMode = computed(() => route.query.live == '1')

/** 原始 zone.parts 下标（与 ?group= 兼容） */
const selectedGroup = ref(Number(route.query.group ?? -1))
/** bracket 内容延后一帧切换，让 zone/group 控件先完成选中态绘制 */
const renderedGroup = ref(selectedGroup.value)
const renderedZoneId = ref(Number(route.params.zoneId))
const routeHasGroup = computed(() => route.query.group !== undefined)
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

const bracketViewportRef = ref<HTMLElement | null>(null)
const bracketMatchMenuOpen = ref(false)
const bracketMatchMenuTarget = ref<[number, number]>([0, 0])
const bracketMatchMenuMatch = ref<MatchNode | null>(null)
const bracketMenuVideoLoading = ref(false)
let bracketMenuRequestVersion = 0

const stageCount = computed(() => displayStages.value.length)
const windowSpan = computed(() => Math.max(windowRight.value - windowLeft.value, 0.05))
const visualOverride = computed((): StageRangeEdges => ({
  left: windowLeft.value,
  right: windowRight.value,
}))

const stripStyle = computed(() => {
  const n = stageCount.value
  if (n <= 0) return {}
  const span = windowSpan.value
  return {
    width: `${(n / span) * 100}%`,
    transform: `translate3d(${(-windowLeft.value / n) * 100}%, 0, 0)`,
  }
})

/** live=跟手无过渡；settle=吸附缓动；idle=静止 */
const windowMotion = ref<'live' | 'settle' | 'idle'>('idle')
const isWindowLive = computed(() => windowMotion.value === 'live')
const isStripSettling = computed(() => windowMotion.value === 'settle')
const textFitSuspended = ref(false)
let settleTimer: ReturnType<typeof setTimeout> | null = null
const SETTLE_MS = 300

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function beginLiveMotion() {
  if (settleTimer) {
    clearTimeout(settleTimer)
    settleTimer = null
  }
  windowMotion.value = 'live'
}

function beginSettleMotion() {
  windowMotion.value = 'settle'
  if (settleTimer) clearTimeout(settleTimer)
  settleTimer = setTimeout(() => {
    settleTimer = null
    windowMotion.value = 'idle'
    textFitSuspended.value = false
  }, SETTLE_MS)
}

function onResizeInteraction(active: boolean) {
  if (active) {
    textFitSuspended.value = true
    return
  }
  // 有缩放 preview 时，等待随后的吸附动画结束再恢复完整文字。
  if (windowMotion.value === 'idle') textFitSuspended.value = false
}

/** 吸附后：仅 Knockout 且最左列节点 ≤ 2 时，滚动视口使该列最上节点贴顶（不改树形 Y） */
function leftmostColumnNodeCount(colIndex: number): number {
  const cols = bracketModel.value?.columns
  if (!cols?.length) return 0
  const col = cols.find((c) => c.index === colIndex) ?? cols[colIndex]
  return col?.items.length ?? 0
}

function shouldPinTopAfterSnap(colIndex: number): boolean {
  if (currentPart.value?.type !== 'knockout') return false
  const n = leftmostColumnNodeCount(colIndex)
  return n > 0 && n <= 2
}

function pinLeftColumnToViewportTop(colIndex: number, smooth = true) {
  if (!shouldPinTopAfterSnap(colIndex)) return
  const viewport = bracketViewportRef.value
  if (!viewport) return

  requestAnimationFrame(() => {
    const col = viewport.querySelector(
      `[data-column-index="${colIndex}"]`,
    ) as HTMLElement | null
    if (!col) return
    const nodes = col.querySelectorAll<HTMLElement>('[data-node-id]')
    if (!nodes.length) return

    let topEl: HTMLElement | null = null
    let minTop = Infinity
    nodes.forEach((el) => {
      const t = el.getBoundingClientRect().top
      if (t < minTop) {
        minTop = t
        topEl = el
      }
    })
    if (!topEl) return

    const vRect = viewport.getBoundingClientRect()
    const nRect = topEl.getBoundingClientRect()
    const delta = nRect.top - vRect.top - 8
    if (Math.abs(delta) < 1) return

    const nextScroll = Math.max(0, viewport.scrollTop + delta)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (smooth && !reduceMotion) {
      viewport.scrollTo({ top: nextScroll, behavior: 'smooth' })
    } else {
      viewport.scrollTop = nextScroll
    }
  })
}

function syncWindowFromRange(range: StageRange) {
  const nextLeft = range.start
  const nextRight = range.end + 1
  if (nextLeft === windowLeft.value && nextRight === windowRight.value) {
    windowMotion.value = 'idle'
    textFitSuspended.value = false
    // 选区拖到左右边界时，preview 已经把窗口钳到最终整数位置；
    // 松手虽会强制提交同一范围，但不能因早退跳过左列的 Y 锚定。
    // immediate watcher 运行时 bracketModel 仍在初始化，延后一帧再读取它。
    requestAnimationFrame(() => pinLeftColumnToViewportTop(nextLeft, true))
    return
  }
  // 跟手结束后的整数提交 / 点击切换 → 缓动；避免瞬切
  const shouldAnimate =
    windowMotion.value === 'live' ||
    Math.abs(nextLeft - windowLeft.value) > 0.001 ||
    Math.abs(nextRight - windowRight.value) > 0.001

  if (shouldAnimate) {
    requestAnimationFrame(() => {
      beginSettleMotion()
      windowLeft.value = nextLeft
      windowRight.value = nextRight
      pinLeftColumnToViewportTop(nextLeft, true)
    })
    return
  }
  windowMotion.value = 'idle'
  textFitSuspended.value = false
  windowLeft.value = nextLeft
  windowRight.value = nextRight
  pinLeftColumnToViewportTop(nextLeft, false)
}

function setWindowEdges(left: number, right: number, rubberBand = false) {
  const n = stageCount.value
  if (n <= 0) return
  const span = Math.max(right - left, 0.05)
  const maxLeft = Math.max(0, n - span)
  let nextLeft = left
  if (rubberBand) {
    if (nextLeft < 0) nextLeft = nextLeft * 0.35
    else if (nextLeft > maxLeft) nextLeft = maxLeft + (nextLeft - maxLeft) * 0.35
  } else {
    nextLeft = clamp(nextLeft, 0, maxLeft)
  }
  windowLeft.value = nextLeft
  windowRight.value = nextLeft + span
}

/** 松手/滚轮停顿后吸附到最近整数格，并回写 stageRange */
function snapWindowToNearest() {
  const n = stageCount.value
  if (n <= 0) return
  const span = Math.max(1, Math.round(windowRight.value - windowLeft.value))
  const maxLeft = Math.max(0, n - span)
  const snappedLeft = clamp(Math.round(windowLeft.value), 0, maxLeft)
  const snappedRight = snappedLeft + span
  const next = { start: snappedLeft, end: snappedLeft + span - 1 }
  const already =
    Math.abs(windowLeft.value - snappedLeft) < 0.001 &&
    Math.abs(windowRight.value - snappedRight) < 0.001

  const commitRange = () => {
    if (stageRange.value.start !== next.start || stageRange.value.end !== next.end) {
      stageRange.value = next
    }
  }

  if (already) {
    windowMotion.value = 'idle'
    pinLeftColumnToViewportTop(snappedLeft, true)
    commitRange()
    return
  }

  // 当前帧保持无过渡，下一帧再启用缓动并落到目标格
  windowMotion.value = 'live'
  requestAnimationFrame(() => {
    beginSettleMotion()
    windowLeft.value = snappedLeft
    windowRight.value = snappedRight
    pinLeftColumnToViewportTop(snappedLeft, true)
    commitRange()
  })
}

function onStagePreview(edges: StageRangeEdges) {
  beginLiveMotion()
  windowLeft.value = edges.left
  windowRight.value = edges.right
}

/** —— 赛程区横向跟手手势 —— */
const panPointerId = ref<number | null>(null)
const panStartX = ref(0)
const panStartY = ref(0)
const panOriginLeft = ref(0)
const panAxis = ref<'x' | 'y' | null>(null)
let wheelSnapTimer: ReturnType<typeof setTimeout> | null = null

/** 轴向阈值（px）：越小越容易进入轴向判定 */
const PAN_AXIS_SLOP = 3
/** 水平偏向：dx 达到 dy 的该比例即判为横向（>1 更易触发左右滑） */
const PAN_X_BIAS = 1.35
/** 跟手增益：同位移下窗口滑动更快 */
const PAN_GAIN = 1.35
/** 单列时一格等于整个视口，提高增益以避免需要横跨近半屏才能触发换列 */
const SINGLE_COLUMN_PAN_BOOST = 2.5
/** 两列时小幅提高手势响应，仍保留比单列更稳的滑动手感 */
const TWO_COLUMN_PAN_BOOST = 1.5
const WHEEL_GAIN = 1.25

function onBoardPointerDown(e: PointerEvent) {
  if (
    e.button !== 0 ||
    stageCount.value <= 0 ||
    bracketMatchMenuOpen.value
  ) return
  if (wheelSnapTimer) {
    clearTimeout(wheelSnapTimer)
    wheelSnapTimer = null
  }
  panPointerId.value = e.pointerId
  panStartX.value = e.clientX
  panStartY.value = e.clientY
  panOriginLeft.value = windowLeft.value
  panAxis.value = null
}

function onBoardPointerMove(e: PointerEvent) {
  if (panPointerId.value !== e.pointerId) return
  if (bracketMatchMenuOpen.value) return
  const dx = e.clientX - panStartX.value
  const dy = e.clientY - panStartY.value
  if (!panAxis.value) {
    if (Math.abs(dx) < PAN_AXIS_SLOP && Math.abs(dy) < PAN_AXIS_SLOP) return
    // 偏向横向：斜向滑动也更容易进入左右跟手
    panAxis.value = Math.abs(dx) * PAN_X_BIAS >= Math.abs(dy) ? 'x' : 'y'
    if (panAxis.value === 'x') {
      const target = e.currentTarget as HTMLElement
      target.setPointerCapture(e.pointerId)
      beginLiveMotion()
    }
  }
  if (panAxis.value !== 'x') return
  e.preventDefault()
  const width = bracketViewportRef.value?.clientWidth ?? 1
  if (width <= 0) return
  const cellWidth = width / windowSpan.value
  const panGain = PAN_GAIN * (
    windowSpan.value <= 1.001
      ? SINGLE_COLUMN_PAN_BOOST
      : windowSpan.value <= 2.001
        ? TWO_COLUMN_PAN_BOOST
        : 1
  )
  // 手指右移 → 内容跟手右移 → windowLeft 减小
  const deltaCells = (dx / cellWidth) * panGain
  setWindowEdges(
    panOriginLeft.value - deltaCells,
    panOriginLeft.value - deltaCells + windowSpan.value,
    true,
  )
}

function onBoardPointerUp(e: PointerEvent) {
  if (panPointerId.value !== e.pointerId) return
  const target = e.currentTarget as HTMLElement
  if (target.hasPointerCapture?.(e.pointerId)) {
    target.releasePointerCapture(e.pointerId)
  }
  if (panAxis.value === 'x') {
    snapWindowToNearest()
  }
  panPointerId.value = null
  panAxis.value = null
}

function onBoardWheel(e: WheelEvent) {
  if (stageCount.value <= 0 || bracketMatchMenuOpen.value) return
  let delta = 0
  if (Math.abs(e.deltaX) * PAN_X_BIAS >= Math.abs(e.deltaY)) {
    delta = e.deltaX
  } else if (e.shiftKey) {
    delta = e.deltaY
  } else {
    return
  }
  if (delta === 0) return
  e.preventDefault()
  beginLiveMotion()
  const width = bracketViewportRef.value?.clientWidth ?? 1
  if (width <= 0) return
  const cellWidth = width / windowSpan.value
  const nextLeft = windowLeft.value + (delta / cellWidth) * WHEEL_GAIN
  setWindowEdges(nextLeft, nextLeft + windowSpan.value, false)
  if (wheelSnapTimer) clearTimeout(wheelSnapTimer)
  wheelSnapTimer = setTimeout(() => {
    wheelSnapTimer = null
    snapWindowToNearest()
  }, 100)
}

const zoneId = computed(() => promotionStore.zoneId)
promotionStore.season = Number(route.params.season)
promotionStore.zoneId = Number(route.params.zoneId)
const season = computed(() => promotionStore.season)
const zone = computed(() => ZoneMap[season.value]?.find((z) => z.id == zoneId.value))

/** 前后段合并后的分组列表，仅 BracketPage 使用 */
const bracketParts = computed(() => (zone.value ? resolveBracketParts(zone.value) : []))
const renderedZone = computed(() =>
  ZoneMap[season.value]?.find((item) => item.id == renderedZoneId.value),
)
const renderedBracketParts = computed(() =>
  renderedZone.value ? resolveBracketParts(renderedZone.value) : [],
)

function bracketIndexForRawGroup(rawGroup: number): number {
  if (!bracketParts.value.length) return 0
  const idx = bracketParts.value.findIndex((bp) => bp.sourceIndices.includes(rawGroup))
  return idx >= 0 ? idx : 0
}

/** slide-group 用合并项下标；读写时映射到/自原始 part 下标 */
const selectedBracketIndex = computed({
  get() {
    return bracketIndexForRawGroup(selectedGroup.value)
  },
  set(bracketIndex: number) {
    const bp = bracketParts.value[bracketIndex]
    if (bp) selectedGroup.value = bp.sourceIndices[0]
  },
})

const currentPart = computed(() => bracketParts.value[selectedBracketIndex.value]?.part)
const renderedPart = computed(() => {
  if (!renderedBracketParts.value.length) return undefined
  const index = renderedBracketParts.value.findIndex((bp) =>
    bp.sourceIndices.includes(renderedGroup.value),
  )
  return renderedBracketParts.value[index >= 0 ? index : 0]?.part
})

let groupRenderRaf = 0

function cancelPendingGroupWork() {
  cancelAnimationFrame(groupRenderRaf)
  groupRenderRaf = 0
  if (wheelSnapTimer) {
    clearTimeout(wheelSnapTimer)
    wheelSnapTimer = null
  }
  if (settleTimer) {
    clearTimeout(settleTimer)
    settleTimer = null
  }
  windowMotion.value = 'idle'
}

function scheduleRenderedBracket(rawGroup: number) {
  cancelPendingGroupWork()
  const nextZoneId = zoneId.value
  groupRenderRaf = requestAnimationFrame(() => {
    groupRenderRaf = 0
    renderedZoneId.value = nextZoneId
    renderedGroup.value = rawGroup
  })
}

const groupPointer = {
  id: null as number | null,
  index: -1,
  startX: 0,
  startY: 0,
  suppressClick: false,
}

function selectBracketIndex(index: number) {
  if (index === selectedBracketIndex.value) return
  selectedBracketIndex.value = index
}

function onGroupPointerDown(index: number, event: PointerEvent) {
  if (event.pointerType === 'mouse' || event.button !== 0) return
  groupPointer.suppressClick = false
  groupPointer.id = event.pointerId
  groupPointer.index = index
  groupPointer.startX = event.clientX
  groupPointer.startY = event.clientY
}

function onGroupPointerUp(index: number, event: PointerEvent) {
  if (groupPointer.id !== event.pointerId || groupPointer.index !== index) return
  const tap = isPointerTap(
    groupPointer.startX,
    groupPointer.startY,
    event.clientX,
    event.clientY,
  )
  groupPointer.id = null
  groupPointer.index = -1
  groupPointer.suppressClick = !tap
  if (tap) selectBracketIndex(index)
}

function onGroupPointerCancel(event: PointerEvent) {
  if (groupPointer.id !== event.pointerId) return
  groupPointer.id = null
  groupPointer.index = -1
  groupPointer.suppressClick = true
}

function onGroupClick(index: number, event: MouseEvent) {
  // pointer 手势已被判定为滚动时，屏蔽部分移动浏览器随后合成的 click。
  if (event.detail > 0 && groupPointer.suppressClick) {
    groupPointer.suppressClick = false
    return
  }
  groupPointer.suppressClick = false
  selectBracketIndex(index)
}

const displayStages = computed(() => {
  const part = currentPart.value
  if (!part) return []
  const labels = part.jsonData.stages ?? []
  const matchCounts = getStageMatchCounts(part.jsonData, part)
  return labels.map((label, index, list) =>
    toStageItem(label, index, list.length, matchCounts[index] ?? 0),
  )
})

/** 相同阶段结构跨 group 复用组件，避免无意义的退场/入场和选区重置 */
const stageStructureKey = computed(() =>
  JSON.stringify(displayStages.value.map(stage => ({
    label: stage.label,
    icon: stage.icon,
    thick: stage.thick ?? false,
    columns: stage.columns ?? 1,
  }))),
)

let needsRouteNormalize = false

function toStageItem(label: string, index: number, length: number, matches: number): StageItem {
  const isLast = index === length - 1
  const isTrophy =
    isLast &&
    label.includes('决赛') &&
    !label.includes('半决赛') &&
    !label.includes('四分之一')

  if (isTrophy) {
    // 仅全国赛决赛用自定义奖杯图，赛区决赛用表情
    const icon = zone.value?.name === '全国赛' ? 'trophy' : 'trophyEmoji'
    return { label, icon }
  }
  if (matches <= 0) {
    return { label, icon: 'result' }
  }
  return {
    label,
    icon: matches,
    thick: matches <= 4,
    columns: matches >= 8 ? 2 : 1,
  }
}

// 如果 Season 不存在，则自动选择最后一个可用的 Season
if (!Object.keys(ZoneMap).includes(String(promotionStore.season))) {
  promotionStore.season = Number(Object.keys(ZoneMap).slice(-1)[0])
  promotionStore.zoneId = DefaultZoneMap[promotionStore.season]
  needsRouteNormalize = true
}
// 如果 ZoneId 不存在，则自动选择默认的 ZoneId
if (!ZoneMap[promotionStore.season]?.find((z) => z.id == zoneId.value)) {
  promotionStore.zoneId = DefaultZoneMap[promotionStore.season]
  needsRouteNormalize = true
}
// 如果 selectedGroup 缺失或不存在，则重置为默认组
if (!zone.value?.parts[selectedGroup.value]) {
  initSelectedGroup()
} else if (needsRouteNormalize) {
  updateQuery()
}

async function initSelectedGroup() {
  if (!promotionStore.schedule.data?.event?.zones?.nodes) {
    await promotionStore.updateSchedule()
  }
  selectedGroup.value = getDefaultSelectedGroup(!routeHasGroup.value)
}

function getDefaultSelectedGroup(preferStarted: boolean): number {
  if (preferStarted) {
    const startedGroup = zone.value?.parts.findIndex(partHasStartedMatch) ?? -1
    if (startedGroup >= 0) return startedGroup
  }
  return zone.value?.defaultGroup ?? 0
}

function bracketPath(seasonValue: number, zoneValue: number): string {
  return `/${seasonValue}/${zoneValue}/bracket`
}

function updateQuery() {
  if (!zone.value?.parts[selectedGroup.value]) {
    selectedGroup.value = getDefaultSelectedGroup(false)
    return
  }
  const path = bracketPath(promotionStore.season, zoneId.value)
  const group = String(selectedGroup.value)
  if (route.path === path && String(route.query.group ?? '') === group) return
  void router.push({
    path,
    query: { ...route.query, group },
  })
}

function updateHref(newSeason: number) {
  const query = new URLSearchParams()
  Object.entries(route.query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => v && query.append(key, v))
    } else if (value) {
      query.set(key, value)
    }
  })
  const defaultZone = DefaultZoneMap[newSeason]
  const queryString = query.toString()
  window.location.href = `${bracketPath(newSeason, defaultZone)}${queryString ? `?${queryString}` : ''}`
}

function toggleLiveMode() {
  const query = { ...route.query }
  if (liveMode.value) {
    delete query.live
  } else {
    query.live = '1'
  }
  router.replace({ path: route.path, query })
}

watch(zoneId, () => {
  updateQuery()
  scheduleRenderedBracket(selectedGroup.value)
})
watch(selectedGroup, (rawGroup) => {
  updateQuery()
  scheduleRenderedBracket(rawGroup)
})
watch(
  () => route.query.group,
  (queryGroup) => {
    const rawGroup = Number(queryGroup)
    if (
      Number.isInteger(rawGroup) &&
      zone.value?.parts[rawGroup] &&
      rawGroup !== selectedGroup.value
    ) {
      selectedGroup.value = rawGroup
    }
  },
)
// 覆盖 setup 期间同步完成的 zone/group 归一化；后续变化仍由上方 watcher 合并调度。
scheduleRenderedBracket(selectedGroup.value)
watch(
  [zoneId, stageStructureKey],
  () => {
    const n = displayStages.value.length
    const next = { start: 0, end: Math.min(1, Math.max(0, n - 1)) }
    stageRange.value = next
    syncWindowFromRange(next)
  },
  { immediate: true },
)

function partHasStartedMatch(part: Part): boolean {
  if (!promotionStore.schedule.data?.event?.zones?.nodes) return false
  const planGameCount = part.group == 'QW' ? 2 : 3
  const groupIndex = part.group == 'B' ? 1 : 0
  return part.jsonData.nodes.some((node) => {
    const zoneData = node.data.zones[groupIndex]
    if (!zoneData) return false
    return zoneData.matches.some((order) => {
      return promotionStore.getMatchByOrder(zoneId.value, order, planGameCount)?.status == 'STARTED'
    })
  })
}

function bracketPartHasStartedMatch(bp: BracketPart): boolean {
  return bp.sourceIndices.some((i) => {
    const part = zone.value?.parts[i]
    return part ? partHasStartedMatch(part) : false
  })
}

const MenuItems = ref([
  {
    title: '分析队伍',
    icon: 'mdi-google-analytics',
    disabled: () => !promotionStore.selectedPlayer,
    action: () => {
      appStore.analysisDialog = true
    },
  },
  {
    title: '查看注释',
    icon: 'mdi-comment-text',
    disabled: () => false,
    action: () => {
      appStore.commentDialog = true
    },
  },
  {
    title: () => (liveMode.value ? '关闭直播' : '直播模式'),
    icon: 'mdi-broadcast',
    disabled: () => false,
    action: toggleLiveMode,
  },
  {
    title: '更新公告',
    icon: 'mdi-update',
    disabled: () => false,
    action: () => {
      appStore.updateAnnouncementDialog = true
    },
  },
  {
    title: '关于软件',
    icon: 'mdi-information',
    disabled: () => false,
    action: () => {
      appStore.aboutDialog = true
    },
  },
])

watch(
  () => promotionStore.season,
  async () => {
    void promotionStore.updateGroupRank().catch(() => undefined)
    await promotionStore.updateSchedule()
  },
  { immediate: true },
)

const scheduleReady = computed(
  () => Boolean(promotionStore.schedule.data?.event?.zones?.nodes),
)

const scheduleZone = computed(() => {
  if (!scheduleReady.value) return undefined
  return promotionStore.schedule.data.event.zones.nodes.find(
    (item) => item.id == String(renderedZoneId.value),
  )
})

const matchLookup = computed(() => {
  const group = new Map<string, MatchNode>()
  const knockout = new Map<number, MatchNode>()
  for (const match of scheduleZone.value?.groupMatches.nodes ?? []) {
    group.set(`${match.orderNumber}:${match.planGameCount}`, match)
  }
  for (const match of scheduleZone.value?.knockoutMatches.nodes ?? []) {
    knockout.set(match.orderNumber, match)
  }
  return { group, knockout }
})

function onBracketTeamLongPress(event: Event) {
  const detail = (event as CustomEvent<{
    playerId: string
    matchId?: string | null
    clientX: number
    clientY: number
  }>).detail
  if (!detail?.matchId) return
  const match = [
    ...(scheduleZone.value?.groupMatches.nodes ?? []),
    ...(scheduleZone.value?.knockoutMatches.nodes ?? []),
  ].find(item => item.id === detail.matchId)
  if (!match) return

  promotionStore.selectedMatch = match
  bracketMatchMenuMatch.value = match
  bracketMatchMenuTarget.value = [detail.clientX, detail.clientY]
  bracketMatchMenuOpen.value = true

  const requestVersion = ++bracketMenuRequestVersion
  const selectedPlayer = promotionStore.findPlayerById(detail.playerId)
  bracketMenuVideoLoading.value = true
  promotionStore.bilibiliReplay = null
  promotionStore.teamInfo = null

  void axios.get<BilibiliReplay>('/api/match_order_to_video', {
    params: {
      season: promotionStore.season,
      zone: promotionStore.getZone(zoneId.value).name,
      order_number: match.orderNumber,
    },
  }).then(({ data }) => {
    if (
      requestVersion === bracketMenuRequestVersion &&
      bracketMatchMenuOpen.value &&
      bracketMatchMenuMatch.value?.id === match.id
    ) {
      promotionStore.bilibiliReplay = data
      bracketMenuVideoLoading.value = false
    }
  }).catch(() => {
    if (requestVersion === bracketMenuRequestVersion) {
      promotionStore.bilibiliReplay = null
      bracketMenuVideoLoading.value = false
    }
  })

  const collegeName = selectedPlayer?.team?.collegeName
  if (collegeName) {
    void axios.get<TeamInfo>('/api/team_info', {
      params: { college_name: collegeName },
    }).then(({ data }) => {
      if (
        requestVersion === bracketMenuRequestVersion &&
        bracketMatchMenuOpen.value &&
        promotionStore.selectedPlayer?.id === detail.playerId
      ) {
        promotionStore.teamInfo = data
      }
    }).catch(() => {
      if (requestVersion === bracketMenuRequestVersion) {
        promotionStore.teamInfo = null
      }
    })
  }
}

watch(bracketMatchMenuOpen, (open) => {
  if (open) return
  bracketMenuRequestVersion += 1
  promotionStore.bilibiliReplay = null
  promotionStore.teamInfo = null
  bracketMenuVideoLoading.value = false
  bracketMatchMenuMatch.value = null
})

function preventBrowserContextMenuWhileBracketMenuOpen(event: MouseEvent) {
  if (bracketMatchMenuOpen.value) event.preventDefault()
}

const mpMatchIds = computed(() => {
  const part = renderedPart.value
  if (!part || !scheduleZone.value) return []

  const planGameCount = part.group === 'QW' ? 2 : 3
  const orders = new Set<number>()
  for (const node of part.jsonData.nodes) {
    for (const partZone of zonesForPart(node, part)) {
      for (const order of partZone.matches) orders.add(order)
    }
  }

  const ids = new Set<number>()
  for (const order of orders) {
    const match = matchLookup.value.group.get(`${order}:${planGameCount}`)
      ?? matchLookup.value.knockout.get(order)
    const id = Number(match?.id)
    if (Number.isFinite(id) && id > 0) ids.add(id)
  }
  return [...ids]
})

watch(
  mpMatchIds,
  (ids) => {
    if (ids.length === 0) return
    // 仅拉取当前 group/part；支持率失败不阻塞 Bracket。
    void promotionStore.updateMpMatch(ids).catch(() => undefined)
  },
  { immediate: true },
)

const groupPlayerLookup = computed(() => {
  const players = new Map<string, Player>()
  for (const group of scheduleZone.value?.groups.nodes ?? []) {
    for (const player of group.players.nodes) {
      players.set(`${group.name}:${player.rank}`, player)
    }
  }
  return players
})

const bracketModel = computed((): BracketViewModel | null => {
  const part = renderedPart.value
  if (!part) return null
  const ready = scheduleReady.value
  // 始终渲染全部阶段列；可见窗口由 windowLeft/span + 条带 translate 控制
  return buildBracketViewModel({
    zoneId: renderedZoneId.value,
    part,
    getMatchByOrder: (z, order, plan) => {
      if (!ready || z !== renderedZoneId.value) return undefined
      return matchLookup.value.group.get(`${order}:${plan ?? 3}`)
        ?? matchLookup.value.knockout.get(order)
    },
    getGroupPlayerByRank: (groupName, rank) => {
      if (!ready) return undefined
      return groupPlayerLookup.value.get(`${groupName}:${rank}`) ?? null
    },
  })
})

function onResize() {
  viewportWidth.value = window.innerWidth
}

function openAnniversaryFromCorner(event: MouseEvent) {
  const logoLeft = 0
  const logoRight = 120
  const logoTop = window.innerHeight - 148
  const logoBottom = window.innerHeight - 28
  const isInsideLogo = (
    event.clientX >= logoLeft &&
    event.clientX <= logoRight &&
    event.clientY >= logoTop &&
    event.clientY <= logoBottom
  )
  if (!isInsideLogo) return
  if ((event.target as Element).closest('.match-card, .info-card')) return

  appStore.anniversaryAnnouncementDialog = true
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  document.addEventListener(
    'contextmenu',
    preventBrowserContextMenuWhileBracketMenuOpen,
    { capture: true },
  )
  bracketViewportRef.value?.addEventListener('wheel', onBoardWheel, { passive: false })
  void promotionStore.updateTeamAbbreviations().catch(() => undefined)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(groupRenderRaf)
  window.removeEventListener('resize', onResize)
  document.removeEventListener(
    'contextmenu',
    preventBrowserContextMenuWhileBracketMenuOpen,
    { capture: true },
  )
  bracketViewportRef.value?.removeEventListener('wheel', onBoardWheel)
  if (wheelSnapTimer) {
    clearTimeout(wheelSnapTimer)
    wheelSnapTimer = null
  }
  if (settleTimer) {
    clearTimeout(settleTimer)
    settleTimer = null
  }
})
</script>

<template>
  <div class="bracket-page my-font">
    <img
      class="background-image"
      :style="{ opacity: promotionStore.backgroundImageOpacity }"
      :src="promotionStore.backgroundImage"
      alt=""
    />
    <div
      class="background-dim"
      aria-hidden="true"
    />

    <SearchPlayer :zone-id="zoneId" />
    <About />
    <GraphComment />
    <UpdateAnnouncement />
    <AnniversaryAnnouncement />

    <div class="container">
      <div class="content">
        <div class="floating-container glass-sheet">
          <v-tabs
            class="row bg-transparent"
            height="55px"
            v-model="promotionStore.zoneId"
          >
            <v-select
              label="Season"
              max-width="120px"
              variant="filled"
              :items="SeasonList"
              :model-value="promotionStore.season"
              @update:model-value="(newSeason: number) => updateHref(newSeason)"
            />
            <v-select
              label="Zone"
              max-width="260px"
              variant="filled"
              :item-props="true"
              item-value="id"
              item-title="name"
              :items="ZoneMap[promotionStore.season]"
              v-model="promotionStore.zoneId"
            />
            <v-spacer />

            <div class="top-right-actions text-right ml-4 mr-2 mt-1">
              <button
                class="header-brand"
                type="button"
                @click="appStore.aboutDialog = true"
              >
                <v-img
                  class="header-logo"
                  src="@/assets/rm_schedule_logo.png"
                  alt="RM Schedule"
                />
                <span
                  v-if="viewportWidth >= 800"
                  class="header-logo-text"
                >
                  RM Schedule
                </span>
              </button>

              <v-btn
                class="mx-1"
                variant="flat"
                color="transparent"
                icon="mdi-magnify"
                @click="appStore.searchDialog = true"
              />

              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    variant="flat"
                    color="transparent"
                    icon="mdi-more"
                    v-bind="props"
                  />
                </template>
                <v-list>
                  <v-list-item
                    v-for="(item, index) in MenuItems"
                    :key="index"
                    :value="index"
                    :prepend-icon="item.icon"
                    :title="typeof item.title === 'function' ? item.title() : item.title"
                    :disabled="item.disabled()"
                    @click="item.action"
                  />
                </v-list>
              </v-menu>
            </div>
          </v-tabs>

          <v-sheet
            v-if="zone"
            class="group-selector-wrap mx-auto text-center bg-transparent"
          >
            <div
              class="group-selector"
            >
              <div
                class="group-selector__track"
                role="tablist"
                aria-label="赛段分组"
              >
                <button
                  v-for="(bp, index) in bracketParts"
                  :key="bp.part.name"
                  class="group-selector__item"
                  :class="{ 'group-selector__item--active': index === selectedBracketIndex }"
                  type="button"
                  role="tab"
                  :title="bp.part.name"
                  :aria-selected="index === selectedBracketIndex"
                  @pointerdown="onGroupPointerDown(index, $event)"
                  @pointerup="onGroupPointerUp(index, $event)"
                  @pointercancel="onGroupPointerCancel"
                  @click="onGroupClick(index, $event)"
                >
                  <span class="group-selector__label">{{ bp.part.name }}</span>
                  <span
                    v-if="bracketPartHasStartedMatch(bp)"
                    class="group-live-dot"
                    aria-label="已有比赛开始"
                  />
                </button>
              </div>

              <span
                v-if="liveMode"
                class="live-mode-indicator"
              >
                直播模式
              </span>
            </div>
          </v-sheet>

          <div
            class="stage-transition-slot"
          >
            <Transition name="stage-switch">
              <div
                v-if="displayStages.length >= 2"
                :key="`${zoneId}-${stageStructureKey}`"
                class="stage-range-wrap"
              >
                <StageRangeSelector
                  v-model="stageRange"
                  :stages="displayStages"
                  :visual-override="visualOverride"
                  :suppress-transition="isWindowLive"
                  @preview="onStagePreview"
                  @resize-interaction="onResizeInteraction"
                  @update:model-value="syncWindowFromRange"
                />
              </div>
            </Transition>
          </div>
        </div>

        <div
          ref="bracketViewportRef"
          class="bracket-scroll"
          @pointerdown="onBoardPointerDown"
          @pointermove="onBoardPointerMove"
          @pointerup="onBoardPointerUp"
          @pointercancel="onBoardPointerUp"
          @click="openAnniversaryFromCorner"
          @bracket-team-long-press="onBracketTeamLongPress"
        >
          <div
            class="bracket-strip"
            :class="{ 'bracket-strip--settle': isStripSettling }"
            :style="stripStyle"
          >
            <Transition
              name="bracket-group"
              mode="out-in"
            >
              <BracketBoard
                v-if="bracketModel"
                :key="`${renderedZoneId}-${renderedGroup}`"
                :model="bracketModel"
                :visible-span="windowSpan"
                :motion-state="windowMotion"
                :text-fit-enabled="!textFitSuspended"
              />
            </Transition>
          </div>
        </div>

        <div class="corner-brand">
          <img
            class="corner-logo"
            :src="logoUrl"
            alt="华南虎"
          />
          <p class="corner-copyright">
            华南理工大学 华南虎
          </p>
        </div>
        <v-menu
          v-model="bracketMatchMenuOpen"
          content-class="bracket-match-menu-overlay"
          :target="bracketMatchMenuTarget"
          location="end"
          transition="bracket-menu-transition"
        >
          <Transition
            name="bracket-menu-content"
          >
            <MatchMenu
              v-if="bracketMatchMenuMatch"
              :key="`${bracketMatchMenuMatch.id}-${promotionStore.selectedPlayer?.id ?? ''}`"
              :match="bracketMatchMenuMatch"
              variant="bracket"
              :video-loading="bracketMenuVideoLoading"
              @close="bracketMatchMenuOpen = false"
            />
          </Transition>
        </v-menu>
        <v-bottom-sheet v-model="appStore.analysisDialog">
          <AnalyzeTeam
            :zone-id="zoneId"
            :player="promotionStore.selectedPlayer"
          />
        </v-bottom-sheet>

        <v-bottom-sheet v-model="appStore.matchAnalysisDialog">
          <AnalyzeMatch
            :zone-id="zoneId"
            :match="promotionStore.selectedMatch"
          />
        </v-bottom-sheet>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bracket-page {
  position: fixed;
  inset: 0;
  color: #e8eef5;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.corner-brand {
  position: fixed;
  left: 0;
  bottom: 0;
  /* 保持在卡片下方，让赛程节点的毛玻璃柔化背景 Logo。 */
  z-index: 2;
  width: 120px;
  height: 120px;
  pointer-events: none;
}

:global(.bracket-match-menu-overlay) {
  overflow-x: hidden !important;
  max-width: calc(100vw - 16px);
}

:global(.bracket-menu-transition-enter-active) {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1) !important;
  transform-origin: top left;
}

:global(.bracket-menu-transition-leave-active) {
  transition:
    opacity 150ms ease-in,
    transform 170ms ease-in !important;
  transform-origin: top left;
}

:global(.bracket-menu-transition-enter-from) {
  transform: translateY(-6px) scale(0.94);
}

:global(.bracket-menu-transition-leave-to) {
  opacity: 0;
  transform: translateY(-6px) scale(0.94);
}

:global(.bracket-menu-content-enter-active) {
  transition: transform 190ms cubic-bezier(0.22, 1, 0.36, 1);
}

:global(.bracket-menu-content-leave-active) {
  position: absolute;
  inset: 0;
  width: 100%;
  transition:
    opacity 150ms ease-in,
    transform 160ms ease-in;
  background: transparent !important;
  box-shadow: none !important;
}

:global(.bracket-menu-content-enter-from) {
  transform: translateY(5px) scale(0.985);
}

:global(.bracket-menu-content-leave-to) {
  opacity: 0;
  transform: translateY(-3px) scale(0.99);
}

:global(.bracket-menu-content-enter-active .v-card-item),
:global(.bracket-menu-content-enter-active .v-list),
:global(.bracket-menu-content-enter-active iframe) {
  transition:
    opacity 170ms ease-out 40ms,
    transform 190ms cubic-bezier(0.22, 1, 0.36, 1) 40ms;
}

:global(.bracket-menu-content-enter-from .v-card-item),
:global(.bracket-menu-content-enter-from .v-list),
:global(.bracket-menu-content-enter-from iframe) {
  opacity: 0;
  transform: translateY(3px);
}

@media (prefers-reduced-motion: reduce) {
  :global(.bracket-menu-transition-enter-active),
  :global(.bracket-menu-transition-leave-active),
  :global(.bracket-menu-content-enter-active),
  :global(.bracket-menu-content-leave-active) {
    transition: none !important;
  }

  :global(.bracket-menu-content-enter-active .v-card-item),
  :global(.bracket-menu-content-enter-active .v-list),
  :global(.bracket-menu-content-enter-active iframe) {
    transition: none !important;
  }
}

.corner-logo {
  position: absolute;
  bottom: 28px;
  left: 0;
  display: block;
  width: 120px;
  height: auto;
  opacity: 0.5;
}

.corner-copyright {
  position: absolute;
  bottom: 16px;
  left: 8px;
  margin: 0;
  opacity: 0.5;
  font-size: 0.8rem;
  white-space: nowrap;
  pointer-events: none;
}

.background-image {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  pointer-events: none;
}

.background-dim {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(40, 90, 140, 0.2) 0%, transparent 58%),
    linear-gradient(180deg, rgba(4, 12, 26, 0.58) 0%, rgba(6, 16, 32, 0.72) 100%);
}

.content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.row {
  display: flex;
  flex-basis: 100%;
}

.top-right-actions {
  display: flex;
  align-items: center;
}

.header-brand {
  display: flex;
  align-items: center;
  color: inherit;
  cursor: pointer;
}

.header-logo {
  flex: 0 0 auto;
  width: 48px;
  height: 40px;
}

.header-logo-text {
  margin-left: 8px;
  white-space: nowrap;
}

.live-mode-indicator {
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  color: rgba(210, 224, 244, 0.72);
  font-size: 12px;
}

.glass-sheet {
  background:
    linear-gradient(180deg, rgba(176, 216, 245, 0.1) 0%, rgba(30, 64, 92, 0.025) 100%),
    rgba(7, 22, 40, 0.52);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.09),
    0 14px 32px -12px rgba(0, 6, 18, 0.24);
  backdrop-filter: blur(18px) saturate(1.24);
  -webkit-backdrop-filter: blur(18px) saturate(1.24);
}

.floating-container {
  position: relative;
  z-index: 5;
  width: 100%;
  flex: 0 0 auto;
}

.bracket-scroll {
  position: relative;
  z-index: 3;
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior-y: none;
  /* 透明，让左下 Logo 透到卡片毛玻璃下方被虚化 */
  background: transparent;
}

.bracket-strip {
  position: relative;
  height: fit-content;
  will-change: transform;
  transform-origin: left top;
}

.bracket-strip--settle {
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    width 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.bracket-group-enter-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.bracket-group-leave-active {
  transition:
    opacity 0.12s ease-in,
    transform 0.12s ease-in;
}

.bracket-group-enter-from {
  opacity: 0;
  transform: translate3d(0, 8px, 0);
}

.bracket-group-leave-to {
  opacity: 0;
  transform: translate3d(0, -4px, 0);
}

.stage-transition-slot {
  display: grid;
}

.stage-range-wrap {
  grid-area: 1 / 1;
  padding: 4px 0 8px;
}

.stage-switch-enter-active {
  z-index: 1;
  transition:
    opacity 0.2s ease-out,
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.stage-switch-leave-active {
  transition:
    opacity 0.12s ease-in,
    transform 0.16s ease-in;
}

.stage-switch-enter-from {
  opacity: 0;
  transform: translate3d(0, 5px, 0) scale(0.985);
}

.stage-switch-leave-to {
  opacity: 0;
  transform: translate3d(0, -3px, 0) scale(0.99);
}

.group-selector-wrap {
  width: 100%;
}

.group-selector {
  --track-bg: rgba(8, 28, 72, 0.52);
  --selection-bg: rgba(120, 170, 255, 0.22);
  --label-active: #ffffff;
  --label-inactive: rgba(180, 198, 230, 0.55);
  --snap-ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 8px max(24px, env(safe-area-inset-right, 0px)) 2px
    max(24px, env(safe-area-inset-left, 0px));
  user-select: none;
  overflow-x: auto;
  scrollbar-width: none;
}

.group-selector::-webkit-scrollbar {
  display: none;
}

.group-selector__track {
  position: relative;
  display: flex;
  width: max-content;
  min-width: 100%;
  height: 32px;
  border-radius: 10px;
  background:
    linear-gradient(180deg, rgba(180, 216, 246, 0.07), rgba(30, 64, 104, 0.015)),
    var(--track-bg);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    inset 0 0 0 1px rgba(170, 205, 236, 0.07);
  backdrop-filter: blur(14px) saturate(1.18);
  -webkit-backdrop-filter: blur(14px) saturate(1.18);
  overflow: hidden;
}

.group-selector__item {
  position: relative;
  z-index: 1;
  flex: 1 0 auto;
  min-width: max-content;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--label-inactive);
  font: inherit;
  font-size: clamp(11px, 2vw, 13px);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.28s var(--snap-ease),
    box-shadow 0.28s var(--snap-ease),
    color 0.28s var(--snap-ease),
    text-shadow 0.28s var(--snap-ease);
}

.group-selector__item--active {
  background: var(--selection-bg);
  box-shadow:
    inset 0 0 0 1px rgba(180, 214, 255, 0.12),
    0 3px 12px rgba(0, 8, 28, 0.16);
  color: var(--label-active);
  text-shadow: 0 1px 8px rgba(190, 220, 255, 0.18);
}

.group-selector__item:focus-visible {
  outline: 2px solid rgba(140, 180, 255, 0.7);
  outline-offset: -3px;
  border-radius: 10px;
}

.group-selector__label {
  white-space: nowrap;
}

.group-live-dot {
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  margin-left: 6px;
  border-radius: 50%;
  background: #f44336;
  box-shadow: 0 0 6px rgba(244, 67, 54, 0.55);
}

.my-font {
  font-family: 'MyFont', sans-serif;
}

@media (prefers-reduced-motion: reduce) {
  .bracket-page * {
    animation: none !important;
    transition: none !important;
  }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass-sheet {
    background: rgba(8, 24, 43, 0.92);
  }

  .group-selector {
    --track-bg: rgba(8, 28, 72, 0.88);
  }
}

@media (max-width: 800px) {
  .live-mode-indicator {
    display: none;
  }
}

@media (max-width: 600px) {
  .group-selector {
    padding-right: max(20px, env(safe-area-inset-right, 0px));
    padding-left: max(20px, env(safe-area-inset-left, 0px));
  }
}
</style>
