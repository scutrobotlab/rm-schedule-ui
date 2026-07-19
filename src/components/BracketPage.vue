<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StageRangeSelector, {
  type StageItem,
  type StageRange,
  type StageRangeEdges,
} from './StageRangeSelector.vue'
import BracketBoard from './bracket/BracketBoard.vue'
import AnalyzeTeam from './AnalyzeTeam.vue'
import AnalyzeMatch from './AnalyzeMatch.vue'
import SearchPlayer from './SearchPlayer.vue'
import About from './About.vue'
import GraphComment from './GraphComment.vue'
import UpdateAnnouncement from './UpdateAnnouncement.vue'
import AnniversaryAnnouncement from './AnniversaryAnnouncement.vue'
import logoUrl from '@/assets/logo.png'
import { DefaultZoneMap, Part, SeasonList, ZoneMap } from '../constant/zone'
import { usePromotionStore } from '../stores/promotion'
import { useAppStore } from '../stores/app'
import { getStageTeamCounts } from '../utils/stage_teams'
import { buildBracketViewModel } from '../utils/bracket_adapter'
import {
  resolveBracketParts,
  type BracketPart,
} from '../utils/bracket_part_merge'
import type { BracketViewModel } from '../types/bracket'

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
const routeHasGroup = computed(() => route.query.group !== undefined)
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

const bracketViewportRef = ref<HTMLElement | null>(null)

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
  }, SETTLE_MS)
}

function syncWindowFromRange(range: StageRange) {
  const nextLeft = range.start
  const nextRight = range.end + 1
  if (nextLeft === windowLeft.value && nextRight === windowRight.value) {
    windowMotion.value = 'idle'
    return
  }
  // 跟手结束后的整数提交 → 下一帧开缓动；分组重置等 → 瞬切
  if (windowMotion.value === 'live') {
    requestAnimationFrame(() => {
      beginSettleMotion()
      windowLeft.value = nextLeft
      windowRight.value = nextRight
    })
    return
  }
  windowMotion.value = 'idle'
  windowLeft.value = nextLeft
  windowRight.value = nextRight
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
    commitRange()
    return
  }

  // 当前帧保持无过渡，下一帧再启用缓动并落到目标格
  windowMotion.value = 'live'
  requestAnimationFrame(() => {
    beginSettleMotion()
    windowLeft.value = snappedLeft
    windowRight.value = snappedRight
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

function onBoardPointerDown(e: PointerEvent) {
  if (e.button !== 0 || stageCount.value <= 0) return
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
  const dx = e.clientX - panStartX.value
  const dy = e.clientY - panStartY.value
  if (!panAxis.value) {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
    panAxis.value = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
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
  // 手指右移 → 内容跟手右移 → windowLeft 减小
  setWindowEdges(
    panOriginLeft.value - dx / cellWidth,
    panOriginLeft.value - dx / cellWidth + windowSpan.value,
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
  if (stageCount.value <= 0) return
  let delta = 0
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
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
  const nextLeft = windowLeft.value + delta / cellWidth
  setWindowEdges(nextLeft, nextLeft + windowSpan.value, false)
  if (wheelSnapTimer) clearTimeout(wheelSnapTimer)
  wheelSnapTimer = setTimeout(() => {
    wheelSnapTimer = null
    snapWindowToNearest()
  }, 120)
}

const zoneId = computed(() => promotionStore.zoneId)
promotionStore.season = Number(route.params.season)
promotionStore.zoneId = Number(route.params.zoneId)
const season = computed(() => promotionStore.season)
const zone = computed(() => ZoneMap[season.value]?.find((z) => z.id == zoneId.value))

/** 前后段合并后的分组列表，仅 BracketPage 使用 */
const bracketParts = computed(() => (zone.value ? resolveBracketParts(zone.value) : []))

/** slide-group 用合并项下标；读写时映射到/自原始 part 下标 */
const selectedBracketIndex = computed({
  get() {
    if (!bracketParts.value.length) return 0
    const idx = bracketParts.value.findIndex((bp) =>
      bp.sourceIndices.includes(selectedGroup.value),
    )
    return idx >= 0 ? idx : 0
  },
  set(bracketIndex: number) {
    const bp = bracketParts.value[bracketIndex]
    if (bp) selectedGroup.value = bp.sourceIndices[0]
  },
})

const currentPart = computed(() => bracketParts.value[selectedBracketIndex.value]?.part)

const displayStages = computed(() => {
  const part = currentPart.value
  if (!part) return []
  const labels = part.jsonData.stages ?? []
  const teamCounts = getStageTeamCounts(part.jsonData, part)
  return labels.map((label, index, list) =>
    toStageItem(label, index, list.length, teamCounts[index] ?? 0),
  )
})

let needsRouteNormalize = false

function toStageItem(label: string, index: number, length: number, teams: number): StageItem {
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
  const count = Math.max(teams, 1)
  return {
    label,
    icon: count,
    thick: count <= 4,
    columns: count >= 8 ? 2 : 1,
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
  updateQuery()
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
  }
  router.push({
    path: bracketPath(promotionStore.season, zoneId.value),
    query: { ...route.query, group: selectedGroup.value },
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

watch(zoneId, updateQuery)
watch(selectedGroup, updateQuery)
watch(
  [selectedGroup, zoneId, () => displayStages.value.length],
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
    await promotionStore.updateSchedule()
  },
  { immediate: true },
)

const scheduleReady = computed(
  () => Boolean(promotionStore.schedule.data?.event?.zones?.nodes),
)

const bracketModel = computed((): BracketViewModel | null => {
  const part = currentPart.value
  if (!part) return null
  const ready = scheduleReady.value
  // 始终渲染全部阶段列；可见窗口由 windowLeft/span + 条带 translate 控制
  return buildBracketViewModel({
    zoneId: zoneId.value,
    part,
    getMatchByOrder: (z, order, plan) => {
      if (!ready) return undefined
      try {
        return promotionStore.getMatchByOrder(z, order, plan)
      } catch {
        return undefined
      }
    },
  })
})

function onResize() {
  viewportWidth.value = window.innerWidth
}

onMounted(() => {
  // 晋级图不自动弹出周年公告，仍可通过左下角 Logo 手动打开
  appStore.anniversaryAnnouncementDialog = false
  window.addEventListener('resize', onResize)
  bracketViewportRef.value?.addEventListener('wheel', onBoardWheel, { passive: false })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
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
              v-model="promotionStore.season"
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
              @update:model-value="updateQuery"
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
            class="mx-auto text-center bg-transparent"
          >
            <v-slide-group
              class="ml-2"
              v-model="selectedBracketIndex"
              mandatory="force"
            >
              <v-slide-group-item
                v-for="(bp, index) in bracketParts"
                :key="bp.part.name"
                :value="index"
                v-slot="{ isSelected, toggle }"
              >
                <v-btn
                  :color="isSelected ? 'primary' : undefined"
                  class="mx-1 my-2"
                  rounded
                  variant="outlined"
                  size="small"
                  @click="toggle"
                >
                  {{ bp.part.name }}
                  <span
                    v-if="bracketPartHasStartedMatch(bp)"
                    class="group-live-dot"
                  />
                </v-btn>
              </v-slide-group-item>

              <v-spacer />

              <div class="text-right mr-4 live-mode-indicator-container">
                <span
                  v-if="liveMode"
                  class="live-mode-indicator"
                >
                  直播模式
                </span>
              </div>
            </v-slide-group>
          </v-sheet>

          <div
            v-if="displayStages.length >= 2"
            class="stage-range-wrap"
          >
            <StageRangeSelector
              v-model="stageRange"
              :stages="displayStages"
              :visual-override="visualOverride"
              :suppress-transition="isWindowLive"
              @preview="onStagePreview"
              @update:model-value="syncWindowFromRange"
            />
          </div>
        </div>

        <div
          ref="bracketViewportRef"
          class="bracket-scroll"
          @pointerdown="onBoardPointerDown"
          @pointermove="onBoardPointerMove"
          @pointerup="onBoardPointerUp"
          @pointercancel="onBoardPointerUp"
        >
          <div
            class="bracket-strip"
            :class="{ 'bracket-strip--settle': isStripSettling }"
            :style="stripStyle"
          >
            <BracketBoard
              v-if="bracketModel"
              :model="bracketModel"
              :visible-span="windowSpan"
            />
          </div>
        </div>

        <div class="corner-brand">
          <img
            class="corner-logo"
            :src="logoUrl"
            alt="华南虎"
            @click="appStore.anniversaryAnnouncementDialog = true"
          />
          <p class="corner-copyright">
            华南理工大学 华南虎
          </p>
        </div>

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
  z-index: 10;
  width: 120px;
  height: 120px;
  pointer-events: none;
}

.corner-logo {
  position: absolute;
  bottom: 28px;
  left: 0;
  display: block;
  width: 120px;
  height: auto;
  opacity: 0.5;
  cursor: pointer;
  pointer-events: auto;
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

.live-mode-indicator-container {
  display: flex;
  align-items: center;
}

.live-mode-indicator {
  white-space: nowrap;
}

.glass-sheet {
  background-color: rgba(10, 28, 48, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
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
}

.bracket-strip {
  position: relative;
  min-height: 100%;
  will-change: transform;
  transform-origin: left top;
}

.bracket-strip--settle {
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    width 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.stage-range-wrap {
  padding: 4px 0 8px;
}

.group-live-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-left: 6px;
  border-radius: 50%;
  background: #f44336;
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
</style>
