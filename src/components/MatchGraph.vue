<script setup lang="ts">
import RelationGraph, { RGOptions } from 'relation-graph-vue3';
import { usePromotionStore } from "../stores/promotion";
import { MatchNode, Player, PlayerWithMatch } from "../types/schedule";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { RoundOrder } from "../types/round_order";
import { GroupType, ImageData, TitleData, ZoneForecastData, ZoneJsonData, ZoneNodeJsonData, ZoneZoneData } from "../types/zone";
import moment from "moment";
import { CompleteForm } from "../constant/complete_form";
import { useRobotDataStore } from "../stores/robot_data";
import { useAppStore } from "../stores/app";
import axios, { AxiosResponse } from "axios";
import { BilibiliReplay } from "../types/bilibili_replay";
import { TeamInfo } from "../types/team_info";
import MatchMenu from "./MatchMenu.vue";
import { StaticCDN } from "../utils/cdn";

interface Props {
  zoneId: number,
  type: 'group' | 'knockout',
  group: GroupType,
  jsonData: ZoneJsonData,
  roundOrder?: RoundOrder,
  extraTitleData?: TitleData[],
  extraImageData?: ImageData[],
  rx?: number,
  ry?: number,
  exportMode?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  exportMode: false,
})
const emit = defineEmits<{
  ready: []
  error: [message: string]
}>()

const loading = ref(true)

const route = useRoute()
const liveMode = computed(() => route.query.live == "1")
const staticArchivedSeasons = new Set([2024, 2025])
const staticArchivedZoneMap = new Map<number, Set<number>>([
  [2026, new Set([614, 615, 616])],
])

const appStore = useAppStore()
const promotionStore = usePromotionStore();
const robotDataStore = useRobotDataStore();

function loadSupplementaryData(): void {
  // 排名和机器人统计只用于附加信息。等首屏赛程就绪后再预取，避免大响应
  // 与 schedule 争用带宽和主线程；依赖它们的卡片会通过 Pinia 响应式更新。
  void promotionStore.updateGroupRank().catch(() => undefined)
  void robotDataStore.updateRobotData(promotionStore.season).catch(() => undefined)
}

async function initializeGraph(): Promise<void> {
  try {
    // Situation 在缺少 group 参数时可能已经取过赛程，避免再次请求整季数据。
    if (!promotionStore.schedule.data?.event?.zones?.nodes) {
      await promotionStore.updateSchedule()
    }

    await updateMpMatch()
    loading.value = false
    // schedule 已在 Store 中时，上面的流程可能在首次渲染前完成。等待模板挂载，
    // 确保切换 group 新建的 RelationGraph ref 已可用。
    await nextTick()
    if (!graphRef.value) throw new Error('graph not mounted')
    await graphRef.value.setJsonData(props.jsonData)
    await graphRef.value.getInstance().zoomToFit()
    patchDownloadWithScale()
    if (props.exportMode) {
      // 后台 chromedp 导出会在 ready 后立即快照，若此时校徽（走 /api/static 代理 + bg_white
      // 处理，加载较慢）尚未加载完成，快照会得到 v-avatar 的白色底 → 校徽显示为白色。
      // 浏览器里人工导出前图片早已加载，故只在无头导出稳定复现。这里显式等待画布内所有图片就绪。
      await waitForGraphImagesLoaded()
    }
    emit('ready')
    loadSupplementaryData()
  } catch (err: unknown) {
    loading.value = false
    emit('error', err instanceof Error ? err.message : String(err))
  }
}

onMounted(() => {
  void initializeGraph()
})

async function waitForGraphImagesLoaded(timeoutMs = 20000): Promise<void> {
  const instance = graphRef.value?.getInstance?.()
  const root: ParentNode = instance?.$canvasDom ?? document
  // 未设置 src 的懒加载占位图不纳入等待（它们不会真正发起加载），只等待已有 src 的图片
  const pendingImages = (): HTMLImageElement[] =>
    (Array.from(root.querySelectorAll('img')) as HTMLImageElement[]).filter((img) => {
      const src = img.currentSrc || img.getAttribute('src') || ''
      if (!src) return false
      return !img.complete || img.naturalWidth === 0
    })

  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline && pendingImages().length > 0) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // 等待解码，确保快照绘制时像素可用
  const images = Array.from(root.querySelectorAll('img')) as HTMLImageElement[]
  await Promise.all(
    images.map((img) =>
      typeof img.decode === 'function' ? img.decode().catch(() => undefined) : Promise.resolve()
    )
  )
}

const DOWNLOAD_IMAGE_SCALE = 2

async function withDownloadImageScale<T>(fn: () => Promise<T>): Promise<T> {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio')
  Object.defineProperty(window, 'devicePixelRatio', {
    get: () => DOWNLOAD_IMAGE_SCALE,
    configurable: true,
  })
  try {
    return await fn()
  } finally {
    if (descriptor) {
      Object.defineProperty(window, 'devicePixelRatio', descriptor)
    }
  }
}

const patchedDownloadInstances = new WeakSet<object>()

function patchDownloadWithScale() {
  const instance = graphRef.value?.getInstance()
  if (!instance || patchedDownloadInstances.has(instance)) return

  const origDownload = instance.downloadAsImage.bind(instance)
  instance.downloadAsImage = (format?: string, fileName?: string) =>
    withDownloadImageScale(() => origDownload(format, fileName))
  patchedDownloadInstances.add(instance)
}

function exportImage() {
  if (!graphRef.value) {
    return Promise.reject(new Error('graph not mounted'))
  }
  return graphRef.value.getInstance().getImageBase64('png')
}

defineExpose({ exportImage })

function refresh() {
  promotionStore.updateSchedule()
  promotionStore.updateGroupRank()
  robotDataStore.updateRobotData(promotionStore.season)
  updateMpMatch()
}

function isStaticArchivedZone(season: number, zoneId: number): boolean {
  return staticArchivedSeasons.has(season) || !!staticArchivedZoneMap.get(season)?.has(zoneId)
}

let refreshInterval: ReturnType<typeof setInterval> | undefined
if (!props.exportMode && !isStaticArchivedZone(promotionStore.season, props.zoneId)) {
  refreshInterval = setInterval(refresh, 30_000)
}
onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

const graphRef = ref<RelationGraph>()
const activeMatchMenuId = ref<string | null>(null)

const nodeWidth = 380;
const options = ref<RGOptions>({
  layout: {
    layoutName: 'fixed',
    layoutClassName: 'seeks-layout-fixed',
    defaultJunctionPoint: 'border',
    defaultNodeShape: 0,
    defaultLineShape: 1
  },
  backgroundColor: 'rgba(255, 255, 255, 0)',
  defaultNodeColor: 'transparent',
  defaultNodeShape: 1,
  defaultNodeWidth: nodeWidth,
  defaultLineShape: 4,
  defaultLineWidth: 2,
  defaultJunctionPoint: 'lr',
  disableDragNode: true,
  disableDragCanvas: false,
  zoomToFitWhenRefresh: true,
  allowShowDownloadButton: liveMode.value,
  // allowShowMiniToolBar: !liveMode.value,
  // graphOffset_y: props.type == 'knockout' ? 0 : -40,
})

watch(liveMode, (isLive) => {
  options.value.allowShowDownloadButton = isLive
})

function match(orderNumber: number): MatchNode | undefined {
  let planGameCount = 3
  if (props.group == 'QW') planGameCount = 2
  return promotionStore.getMatchByOrder(props.zoneId, orderNumber, planGameCount)
}

function matchStarted(orderNumber: number): boolean {
  return match(orderNumber)?.status == 'STARTED'
}

function isForecast(node: any): boolean {
  return node.data.round == round.value + 1
}

function winner(orderNumber: number): Player | null {
  const m = match(orderNumber)
  if (!m) return null
  if (m.status != 'DONE') return null
  if (m.redSideWinGameCount > m.blueSideWinGameCount) return m.redSide.player
  if (m.redSideWinGameCount < m.blueSideWinGameCount) return m.blueSide.player
  return null
}

function loser(orderNumber: number): Player | null {
  const m = match(orderNumber)
  if (!m) return null
  if (m.status != 'DONE') return null
  if (m.redSideWinGameCount < m.blueSideWinGameCount) return m.redSide.player
  if (m.redSideWinGameCount > m.blueSideWinGameCount) return m.blueSide.player
  return null
}

function matchRank(player: Player): number {
  const zone = promotionStore.getZone(props.zoneId)
  for (let i = 0; i < zone.groups.nodes.length; i++) {
    const group = zone.groups.nodes[i]
    for (let j = 0; j < group.players.nodes.length; j++) {
      const p = group.players.nodes[j]
      if (p.team.id == player.team?.id) {
        return p.rank
      }
    }
  }
}

function rankList(zone: any): PlayerWithMatch[] {
  const playerWithMatches: PlayerWithMatch[] = []
  for (let i = 0; i < zone.winners.length; i++) {
    const player = winner(zone.winners[i])
    if (player) playerWithMatches.push({
      player: player,
      match: match(zone.winners[i])
    })
  }
  for (let i = 0; i < zone.losers.length; i++) {
    const player = loser(zone.losers[i])
    if (player) playerWithMatches.push({
      player: player,
      match: match(zone.losers[i])
    })
  }
  playerWithMatches.sort((a, b) => {
    return matchRank(a.player) - matchRank(b.player)
  })
  return playerWithMatches
}

function groupRank(groupName: string, rank: number): Player {
  const zone = promotionStore.getZone(props.zoneId)
  let group = zone.groups.nodes.find((g) => g.name == groupName)
  if (!group) return null
  return group.players.nodes.find((p) => p.rank == rank)
}

function groupTrulyRank(groupName: string, rank: number): number {
  const zone = promotionStore.getZone(props.zoneId)
  let group = zone.groups.nodes.find((g) => g.name == groupName)
  if (!group) return null
  let allZero = true
  for (let i = 0; i < group.players.nodes.length; i++) {
    if (group.players.nodes[i].score != 0) {
      allZero = false
      break
    }
  }
  if (allZero) return 1
  return rank
}

function padNumber(num: number): string {
  return num.toString().padStart(2, '0');
}

function schoolNameText(name?: string | number | null): string {
  return String(name ?? '').replaceAll('（', '(').replaceAll('）', ')')
}

function schoolNameDisplayLength(name?: string | number | null): number {
  const text = schoolNameText(name).trim()
  const bracketPairCount = text.match(/\([^()]*\)/g)?.length ?? 0
  return text.length - bracketPairCount
}

function schoolNameStyle(name?: string | number | null, showMpRate = false) {
  const length = schoolNameDisplayLength(name)
  // 仅非直播模式且显示胜率时，为长校名额外缩小字号
  if (!liveMode.value && showMpRate) {
    if (length >= 12) return { fontSize: '16px' }
    if (length >= 11) return { fontSize: '18px' }
    if (length >= 10) return { fontSize: '20px' }
    return undefined
  }
  const thresholdOffset = showMpRate ? 1 : 0
  if (length >= 12 - thresholdOffset) return { fontSize: '18px' }
  if (length >= 11 - thresholdOffset) return { fontSize: '20px' }
  return undefined
}

function mpMatchRateVisible(match?: MatchNode, side?: "RED" | "BLUE"): boolean {
  if (liveMode.value || !match) return false
  const mpMatch = promotionStore.getMpMatch(match.id)
  if (!mpMatch) return false
  return side == "RED" ? mpMatch.redRate >= 0 : mpMatch.blueRate >= 0
}

function convertToOrdinal(number: number): string {
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return number + "st";
  } else if (lastDigit === 2 && lastTwoDigits !== 12) {
    return number + "nd";
  } else if (lastDigit === 3 && lastTwoDigits !== 13) {
    return number + "rd";
  } else {
    return number + "th";
  }
}

function rankFromForecastText(text?: string): number | null {
  const match = text?.match(/第(\d+)名/)
  return match ? Number(match[1]) : null
}

function forecastDisplayText(zone: ZoneZoneData): string[] {
  return zone.forecastText ?? zone.text
}

function forecastOrdinal(zone: ZoneZoneData, index: number, player: Player): string {
  return convertToOrdinal(rankFromForecastText(forecastDisplayText(zone)[index]) ?? matchRank(player))
}

function forecastGuidePairs(zone: ZoneZoneData): { from: number, to: number }[] {
  const rankIndexMap = new Map<number, number>()
  forecastDisplayText(zone).forEach((text, index) => {
    const rank = rankFromForecastText(text)
    if (rank) rankIndexMap.set(rank, index)
  })
  return (zone.forecasts ?? [])
    .map((forecast: ZoneForecastData) => ({
      from: rankIndexMap.get(forecast.red),
      to: rankIndexMap.get(forecast.blue),
    }))
    .filter((pair): pair is { from: number, to: number } => pair.from != null && pair.to != null)
}

function forecastGuideVisible(zone: ZoneZoneData): boolean {
  return forecastGuidePairs(zone).some((pair) => Math.abs(pair.from - pair.to) > 1)
}

function forecastGuideHeight(zone: ZoneZoneData): number {
  return Math.max(forecastDisplayText(zone).length, rankList(zone).length) * 52
}

function forecastGuidePath(pair: { from: number, to: number }): string {
  const rowCenter = (index: number) => index * 52 + 27
  const startY = rowCenter(pair.from)
  const endY = rowCenter(pair.to)
  const midY = (startY + endY) / 2
  const outerX = 330 + Math.abs(pair.to - pair.from) * 5
  return `M 322 ${startY} C ${outerX} ${startY}, ${outerX} ${midY}, ${outerX} ${midY} C ${outerX} ${midY}, ${outerX} ${endY}, 322 ${endY}`
}

async function updateMpMatch() {
  const idSet = new Set<number>()
  const zone = promotionStore.getZone(props.zoneId)

  props.jsonData.nodes.forEach((node: any) => {
    const matchZones = props.type == 'group' ? [node.data.zones[groupIndex.value]] : node.data.zones
    matchZones.forEach((matchZone: any) => {
      matchZone?.matches?.forEach((order: number) => {
        let matchNode: MatchNode | undefined
        if (props.type == 'group') {
          matchNode = match(order)
        } else {
          matchNode = zone.knockoutMatches.nodes.find((node: MatchNode) => node.orderNumber == order)
        }

        const matchId = Number(matchNode?.id)
        if (matchId) idSet.add(matchId)
      })
    })
  })

  await promotionStore.updateMpMatch([...idSet])
}

function colorfulNode(node: any): boolean {
  if (liveMode.value) return false; // 直播模式不闪烁
  if (props.type != 'knockout') return false;
  if (node.data.type != 'match') return false;
  const _match = match(node.data.zones[0].matches[0])
  if (!_match) return false;
  return _match.status == 'STARTED';
}

function selectPlayer(player: Player) {
  if (promotionStore.selectedPlayer && player && promotionStore.selectedPlayer.id == player.id) {
    promotionStore.selectedPlayer = null
  } else {
    promotionStore.selectedPlayer = player
  }
}

function playerSelected(player: Player): boolean {
  if (!promotionStore.selectedPlayer) return false
  if (!player) return false
  return promotionStore.selectedPlayer.id == player.id
}

function updateBilibiliReplay(orderNumber: number) {
  if (!orderNumber || !match(orderNumber).redSide.player) {
    promotionStore.bilibiliReplay = null
    return
  }
  axios({
    method: "GET",
    url: "/api/match_order_to_video",
    params: {
      season: promotionStore.season,
      zone: promotionStore.getZone(props.zoneId).name,
      order_number: orderNumber,
    },
  }).then(async (response: AxiosResponse<BilibiliReplay>) => {
    promotionStore.bilibiliReplay = response.data;
  }).catch(err => {
    promotionStore.bilibiliReplay = null;
  })
}

function updateTeamInfo(collegeName?: string) {
  if (!collegeName) {
    promotionStore.teamInfo = null
    return
  }
  axios({
    method: "GET",
    url: "/api/team_info",
    params: {
      college_name: collegeName,
    },
  }).then(async (response: AxiosResponse<TeamInfo>) => {
    promotionStore.teamInfo = response.data;
  }).catch(err => {
    promotionStore.teamInfo = null;
  })
}

function selectPlayerMatch(match: MatchNode, player?: Player) {
  promotionStore.selectedMatch = match
  activeMatchMenuId.value = match.id

  if (promotionStore.selectedPlayer && player && promotionStore.selectedPlayer.id == player.id) {
    promotionStore.selectedPlayer = null
    promotionStore.bilibiliReplay = null
    promotionStore.teamInfo = null
  } else {
    promotionStore.selectedPlayer = player ?? null

    updateBilibiliReplay(match.orderNumber)
    updateTeamInfo(player?.team?.collegeName)
  }
}

function openBilibiliSpace(uid: number) {
  window.open(`https://space.bilibili.com/${uid}`, '_blank')
}

function onMatchMenuModelValue(on: boolean, match?: MatchNode) {
  activeMatchMenuId.value = on && match ? match.id : null

  if (!on) {
    promotionStore.bilibiliReplay = null
    promotionStore.teamInfo = null
  }
}

function matchMenuActive(match?: MatchNode): boolean {
  return !!match && activeMatchMenuId.value == match.id
}

function matchSelected(match: MatchNode): boolean {
  if (!promotionStore.selectedMatch) return false
  if (!match) return false
  return promotionStore.selectedMatch.id == match.id
}

function winnerSuggestion(match: MatchNode): "RED" | "BLUE" | "NONE" {
  if (promotionStore.zoneId != 567) return "NONE"
  let redRank = CompleteForm.find((e) => e.school == match.redSide.player?.team.collegeName)
  let blueRank = CompleteForm.find((e) => e.school == match.blueSide.player?.team.collegeName)
  if (!redRank || !blueRank) return "NONE"
  if (redRank.rank < blueRank.rank) return "RED"
  if (redRank.rank > blueRank.rank) return "BLUE"
  return "NONE"
}

function matchTooltip(match: MatchNode): string {
  if (!match) return ""
  const time = moment.parseZone(match.planStartedAt).utcOffset(8)
  return `预计 ${time.format('M月D日 HH:mm')} 开始`
}

const logoCDN = (url: string): string => {
  // 如果是PNG图片，将透明背景转换为白色背景
  return StaticCDN(`${url}?process=bg_white`);
};

const fingersCount = ref(0);
const updateFingersCount = (event: TouchEvent) => {
  fingersCount.value = event.touches.length;
};

window.addEventListener('touchstart', updateFingersCount);
window.addEventListener('touchmove', updateFingersCount);
window.addEventListener('touchend', updateFingersCount);

const isDragging = ref(false);
const nodeStart = ref({ x: 0, y: 0 });
const canvasStart = ref({ x: 0, y: 0 });

const onDragStart = (x: number, y: number) => {
  isDragging.value = true;
  nodeStart.value = { x: x, y: y };
  const canvasOffset = graphRef.value.getInstance().options.canvasOffset
  canvasStart.value = { x: canvasOffset.x, y: canvasOffset.y };
};

const onTouchStart = (event: TouchEvent) => {
  if (fingersCount.value > 1) {
    // 两个手指以上不允许拖拽
    isDragging.value = false;
    return;
  }
  onDragStart(event.touches[0].pageX, event.touches[0].pageY);
};

const onTouchMove = (event: TouchEvent) => {
  if (fingersCount.value > 1) {
    // 两个手指以上不允许拖拽
    isDragging.value = false;
    return;
  }
  onDragging(event.touches[0].pageX, event.touches[0].pageY);
};

const onDragging = (x: number, y: number) => {
  if (isDragging.value) {
    const offsetX = x - nodeStart.value.x;
    const offsetY = y - nodeStart.value.y;
    graphRef.value.getInstance().options.canvasOffset = {
      x: canvasStart.value.x + offsetX,
      y: canvasStart.value.y + offsetY
    };
  }
};

const onDragEnd = () => {
  isDragging.value = false;
};

const bgGrayEnabled = computed(() => {
  return false;
  // return promotionStore.backgroundImage !== '/background/2024_final.png';
})

const groupIndex = computed(() => {
  switch (props.group) {
    case 'A':
      return 0
    case 'B':
      return 1
    case "C":
      return 0
    default:
      return 0
  }
})

const round = computed(() => {
  // return 0;
  // return 1;
  // return 2;
  // return 3;
  // return 4;
  // return 5;
  // return 6;
  let orderList: number[]
  switch (props.group) {
    case 'A':
      orderList = props.roundOrder.A
      break
    case 'B':
      orderList = props.roundOrder.B
      break
    case 'C':
      orderList = props.roundOrder.C
      break
    case "QW":
      orderList = props.roundOrder.QW
      break
    default:
      return -1
  }
  // 从后往前找到第一个有选手的比赛，返回其轮次
  for (let i = orderList.length - 1; i >= 0; i--) {
    const m = match(orderList[i])
    if (!m) continue
    if (m.redSide.player && m.redSide.player.team) return i + 1
  }
  return 0;
})
</script>

<template>
  <div class="my-graph pt-2 my-font">
    <div :style="liveMode ? 'height: calc(100vh - 0px);' : 'height: calc(100vh - 0px);'">
      <!--      <div class="text-center mb-4">-->
      <!--        <h1 class="font-weight-bold">{{ title }}</h1>-->
      <!--      </div>-->
      <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
      <relation-graph
        v-show="!loading"
        class="draggable"
        ref="graphRef"
        :options="options"
      >
        <template #node="{node}">
          <div :class="{
              // 'golden-shine': node.id == '#16',
              // 'highlight-gray': colorfulNode(node),
            }"
               :style="{ color: node.data.titleColor }"
               @mousedown="e => onDragStart(e.pageX, e.pageY)"
               @mousemove="e => onDragging(e.pageX, e.pageY)"
               @mouseup="onDragEnd"
               @touchstart="onTouchStart"
               @touchmove="onTouchMove"
               @touchend="onDragEnd"
          >
            <div v-if="node.data.title != ''"
                 class="text-h6"
                 :class="{'node-title-bg-gray': bgGrayEnabled}"
                 :style="'color: ' + node.data.titleColor">
              <div class="title-image-container graph-title-image-container">
                <img :style="'border-right: 2px solid ' + node.data.borderColor"
                     :src="node.data.titleImage" alt="Image"/>
                <div class="title-text-overlay graph-title-text-overlay mt-1 my-font">
                  <b>{{ node.data.title }}</b>
                  <b class="ml-1" v-if="isForecast(node) && !liveMode">*</b>
                </div>
              </div>
            </div>

            <div class="pt-1 pb-3"
                 :class="{'node-bg-gray': bgGrayEnabled}"
                 :style="{
                   'border-left': '2px solid ' + node.data.borderColor,
                   'border-right': '2px solid ' + node.data.borderColor,
                   'border-bottom': '2px solid ' + node.data.borderColor,
                 }">
              <div v-if="node.data.type == 'match'">

                <!--实时预测 动态刷新-->
                <div
                  v-if="round + 1 == node.data.round && round > 0 && !liveMode"
                  class="forecast-list"
                >
                  <svg
                    v-if="forecastGuideVisible(node.data.zones[groupIndex])"
                    class="forecast-guide-lines"
                    :style="{ height: `${forecastGuideHeight(node.data.zones[groupIndex])}px` }"
                    :viewBox="`0 0 370 ${forecastGuideHeight(node.data.zones[groupIndex])}`"
                    preserveAspectRatio="none"
                  >
                    <path
                      v-for="(pair, i) in forecastGuidePairs(node.data.zones[groupIndex])"
                      :key="i"
                      :d="forecastGuidePath(pair)"
                    />
                  </svg>
                  <div class="mx-2"
                       v-for="(v, i) in rankList(node.data.zones[groupIndex])" :key="i">
                    <div class="container ml-2">
                      <div class="right-column">
                        <div
                          v-if="v"
                          class="top-row row-content mt-1"
                          :class="{
                            'selected-player': playerSelected(v.player),
                          }"
                          @click="selectPlayer(v.player)"
                        >
                          <div class="school-image-container">
                            <img src="@/assets/school_bg.png" style="width: 320px" alt="Image"/>
                            <div class="overlay ml-4">
                              <div v-if="v.match.status == 'DONE'" style="background: #FFA500">
                                <h4 class="px-1" style="width: 2.5rem">
                                  {{ forecastOrdinal(node.data.zones[groupIndex], i, v.player) }}
                                </h4>
                              </div>
                              <div v-else style="background: #616161">
                                <h4 class="px-1" style="width: 2.5rem"> 待定 </h4>
                              </div>
                              <v-avatar class="mx-1 avatar-center bg-white" color="white" size="x-small">
                                <v-img :eager="exportMode" :src="logoCDN(v.player.team.collegeLogo)"/>
                              </v-avatar>
                              <span class="one-line-text" :style="schoolNameStyle(v.player.team.collegeName)">{{ schoolNameText(v.player.team.collegeName) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    class="mx-2"
                    v-for="(v, i) in forecastDisplayText(node.data.zones[groupIndex]).slice(rankList(node.data.zones[groupIndex]).length)"
                    :key="i">
                    <div class="container ml-2">
                      <div class="right-column">
                        <div class="top-row row-content mt-2">
                          <div class="school-image-container">
                            <img src="@/assets/school_bg.png" style="width: 320px" alt="Image"/>
                            <div class="overlay ml-4">
                              <div style="background: #616161">
                                <h4 class="px-1" style="width: 2.5rem">待定</h4>
                              </div>
                              <v-avatar class="mx-1 avatar-center" color="white" size="x-small">
                                <v-img :eager="exportMode" src="@/assets/school_grey.png"/>
                              </v-avatar>
                              <span class="one-line-text" :style="schoolNameStyle(v)">{{ schoolNameText(v) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else v-for="(v, i) in node.data.zones[groupIndex].matches" :key="i">

                  <!--已确认的赛程-->
                  <div v-if="round + 1 > node.data.round && match(v)" class="container">
                    <v-menu
                      :model-value="matchMenuActive(match(v))"
                      @update:model-value="onMatchMenuModelValue($event, match(v))"
                    >
                      <template v-slot:activator="{ isActive, props }">
                        <div
                          v-bind="props"
                          class="container ml-2"
                          :class="{
                            'mt-2': type == 'group',
                            'selected-match': isActive,
                          }"
                        >
                          <div class="left-column order-image-container">
                            <img src="@/assets/order_bg.png" alt="Image"/>
                            <div class="order-text-overlay">
                              <b>{{ padNumber(match(v).orderNumber) }}</b>
                            </div>
                          </div>

                          <div class="right-column">
                            <div
                              class="top-row row-content mb-1"
                              :class="{
                                'selected-player': playerSelected(match(v).redSide.player),
                              }"
                              @click.stop="selectPlayerMatch(match(v), match(v).redSide.player)"
                            >
                              <div class="school-image-container">
                                <img src="@/assets/school_bg.png" style="width: 320px" alt="Image"/>
                                <span
                                  v-if="!liveMode && matchStarted(v)"
                                  class="order-live-dot"
                                ></span>
                                <div class="overlay ml-4">
                                  <div
                                    style="background: #616161"
                                    :class="{
                                      'colorful-red': !liveMode && loser(v) != match(v).redSide.player,
                                      'score-red': liveMode && loser(v) != match(v).redSide.player,
                                    }">
                                    <h4 class="px-1">{{ match(v).redSideWinGameCount }}</h4>
                                  </div>
                                  <div
                                    v-if="mpMatchRateVisible(match(v), 'RED')"
                                    class="ml-1 text-caption"
                                    :style="{
                                      width: '2.5rem',
                                      background: `linear-gradient(to right, #F44336 ${promotionStore.getMpMatch(match(v).id).redRate * 100}%, transparent ${promotionStore.getMpMatch(match(v).id).redRate * 100 + 20}%)`,
                                      border: '1px solid #F44336',
                                      'border-radius': '2px',
                                    }">
                                    {{ (100 * promotionStore.getMpMatch(match(v).id).redRate).toFixed(1) }}%
                                  </div>
                                  <v-avatar v-if="match(v).redSide.player?.team" class="mx-1 bg-white" color="white"
                                            size="x-small">
                                    <v-img :eager="exportMode" :src="logoCDN(match(v).redSide.player?.team.collegeLogo)"></v-img>
                                  </v-avatar>
                                  <v-avatar v-else class="mx-1" size="x-small">
                                    <v-img :eager="exportMode" src="@/assets/school_red.png"></v-img>
                                  </v-avatar>
                                  <span v-if="match(v).redSide.player?.team"
                                        :style="[schoolNameStyle(match(v).redSide.player?.team.collegeName, mpMatchRateVisible(match(v), 'RED')), {color: (node as ZoneNodeJsonData).data.collegeNameColor}]"
                                        :class="{'color-gray': loser(v) == match(v).redSide.player }"
                                        class="one-line-text">{{ schoolNameText(match(v).redSide.player?.team.collegeName) }}</span>
                                  <span v-else :style="[schoolNameStyle(node.data.zones[groupIndex].text[2 * i], mpMatchRateVisible(match(v), 'RED')), {color: (node as ZoneNodeJsonData).data.collegeNameColor}]"
                                        class="one-line-text">{{ schoolNameText(node.data.zones[groupIndex].text[2 * i]) }}</span>
                                  <v-icon
                                    v-if="promotionStore.suggestionEnabled && winnerSuggestion(match(v)) == 'RED'"
                                    icon="mdi-checkbox-marked-circle">
                                  </v-icon>
                                </div>
                              </div>
                            </div>

                            <div
                              class="row-content"
                              :class="{
                              'selected-player': playerSelected(match(v).blueSide.player),
                            }"
                              @click.stop="selectPlayerMatch(match(v), match(v).blueSide.player)"
                            >
                              <div class="school-image-container">
                                <img src="@/assets/school_bg.png" style="width: 320px" alt="Image"/>
                                <div class="overlay ml-4">
                                  <div
                                    style="background: #616161"
                                    :class="{
                                      'colorful-blue': !liveMode && loser(v) != match(v).blueSide.player,
                                      'score-blue': liveMode && loser(v) != match(v).blueSide.player,
                                    }">
                                    <h4 class="px-1">{{ match(v).blueSideWinGameCount }}</h4>
                                  </div>
                                  <div
                                    v-if="mpMatchRateVisible(match(v), 'BLUE')"
                                    class="ml-1 text-caption"
                                    :style="{
                                       width: '2.5rem',
                                       background: `linear-gradient(to right, #2196F3 ${promotionStore.getMpMatch(match(v).id).blueRate * 100}%, transparent ${promotionStore.getMpMatch(match(v).id).blueRate * 100 + 20}%)`,
                                       border: '1px solid #2196F3',
                                       'border-radius': '2px',
                                 }">
                                    {{ (100 * promotionStore.getMpMatch(match(v).id).blueRate).toFixed(1) }}%
                                  </div>
                                  <v-avatar v-if="match(v).blueSide.player?.team" class="mx-1 bg-white" color="white"
                                            size="x-small">
                                    <v-img :eager="exportMode" :src="logoCDN(match(v).blueSide.player?.team.collegeLogo)"></v-img>
                                  </v-avatar>
                                  <v-avatar v-else class="mx-1" size="x-small">
                                    <v-img :eager="exportMode" src="@/assets/school_blue.png"></v-img>
                                  </v-avatar>
                                  <span v-if="match(v).blueSide.player?.team"
                                        :style="[schoolNameStyle(match(v).blueSide.player?.team.collegeName, mpMatchRateVisible(match(v), 'BLUE')), {color: (node as ZoneNodeJsonData).data.collegeNameColor}]"
                                        :class="{'color-gray': loser(v) == match(v).blueSide.player }"
                                        class="one-line-text">{{ schoolNameText(match(v).blueSide.player?.team.collegeName) }}</span>
                                  <span v-else :style="[schoolNameStyle(node.data.zones[groupIndex].text[2 * i + 1], mpMatchRateVisible(match(v), 'BLUE')), {color: (node as ZoneNodeJsonData).data.collegeNameColor}]"
                                        class="one-line-text">{{ schoolNameText(node.data.zones[groupIndex].text[2 * i + 1]) }}</span>
                                  <v-icon
                                    v-if="promotionStore.suggestionEnabled && winnerSuggestion(match(v)) == 'BLUE'"
                                    icon="mdi-checkbox-marked-circle">
                                  </v-icon>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                      <MatchMenu :match="match(v)"/>
                    </v-menu>
                  </div>

                  <!--纯文字+红蓝R标 A-1-->
                  <div v-else class="container">
                    <v-tooltip :text="matchTooltip(match(v))">
                      <template v-slot:activator="{ props }">
                        <div
                          v-bind="props"
                          v-if="match(v)"
                          class="container ml-2"
                          :class="{
                            'mt-2': type == 'group',
                          }">
                          <div class="left-column order-image-container">
                            <img src="@/assets/order_bg.png" alt="Image"/>
                            <div class="order-text-overlay">
                              <b>{{ padNumber(match(v).orderNumber) }}</b>
                            </div>
                          </div>

                          <div class="right-column">
                            <div class="top-row row-content mb-1">
                              <div class="school-image-container">
                                <img src="@/assets/school_bg.png" style="width: 320px" alt="Image"/>
                                <span
                                  v-if="!liveMode && matchStarted(v)"
                                  class="order-live-dot"
                                ></span>
                                <div class="overlay ml-4">
                                  <div style="background: #616161">
                                    <h4 class="px-1"> 0 </h4>
                                  </div>
                                  <v-avatar class="mx-1" size="x-small">
                                    <v-img :eager="exportMode" src="@/assets/school_red.png"></v-img>
                                  </v-avatar>
                                  <span class="one-line-text" :style="schoolNameStyle(node.data.zones[groupIndex].text[2 * i])">
                                    {{
                                      // match(v).redSide.player ? match(v).redSide.player.name : node.data.zones[groupIndex].text[2 * i]
                                      schoolNameText(node.data.zones[groupIndex].text[2 * i])
                                    }}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div class="row-content">
                              <div class="school-image-container">
                                <img src="@/assets/school_bg.png" style="width: 320px" alt="Image"/>
                                <div class="overlay ml-4">
                                  <div style="background: #616161">
                                    <h4 class="px-1"> 0 </h4>
                                  </div>
                                  <v-avatar class="mx-1" size="x-small">
                                    <v-img :eager="exportMode" src="@/assets/school_blue.png"></v-img>
                                  </v-avatar>
                                  <span class="one-line-text" :style="schoolNameStyle(node.data.zones[groupIndex].text[2 * i + 1])">
                                    {{
                                      // match(v).blueSide.player ? match(v).blueSide.player.name : node.data.zones[groupIndex].text[2 * i + 1]
                                      schoolNameText(node.data.zones[groupIndex].text[2 * i + 1])
                                    }}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </v-tooltip>
                  </div>
                </div>
              </div>

              <div v-else-if="node.data.type == 'groupLoop'">
                <div
                  class="mx-2"
                  v-for="(v, i) in node.data.zones[groupIndex].groupRank"
                  :key="i">
                  <div class="container ml-2">
                    <div class="right-column">
                      <div class="top-row row-content mt-2">
                        <div class="school-image-container">
                          <img src="@/assets/school_bg.png" style="width: 320px" alt="Image"/>
                          <div class="overlay ml-4">
                            <div :style="{background: node.data.rankColor}">
                              <h4 class="px-1" style="width: 2.5rem">
                                {{ convertToOrdinal(groupTrulyRank(node.data.zones[groupIndex].group, v)) }}
                              </h4>
                            </div>
                            <v-avatar class="mx-1 avatar-center bg-white" color="white" size="x-small">
                              <v-img v-if="groupRank(node.data.zones[groupIndex].group, v).team"
                                     :eager="exportMode"
                                     :src="logoCDN(groupRank(node.data.zones[groupIndex].group, v).team?.collegeLogo)"/>
                              <v-img v-else :eager="exportMode" src="@/assets/school_grey.png"/>
                            </v-avatar>
                            <span v-if="groupRank(node.data.zones[groupIndex].group, v).team"
                                  :style="schoolNameStyle(groupRank(node.data.zones[groupIndex].group, v).team?.collegeName)"
                                  class="one-line-text">
                              {{
                                schoolNameText(groupRank(node.data.zones[groupIndex].group, v).team?.collegeName)
                              }}
                            </span>
                            <span v-else class="one-line-text" :style="schoolNameStyle(node.data.zones[groupIndex].text[i])">
                              {{
                                schoolNameText(node.data.zones[groupIndex].text[i])
                              }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!--晋级和淘汰-->
              <div v-else-if="node.data.type == 'eliminate' || node.data.type == 'promote'">
                <div class="mx-2"
                     v-for="(v, i) in rankList(node.data.zones[groupIndex])" :key="i">
                  <div class="container ml-2">
                    <div class="right-column">
                      <div
                        v-if="v"
                        class="top-row row-content mt-2"
                        :class="{
                        'selected-player': playerSelected(v.player),
                      }"
                        @click="selectPlayer(v.player)"
                      >
                        <div class="school-image-container">
                          <img src="@/assets/school_bg.png" style="width: 345px" alt="Image"/>
                          <div class="overlay ml-4">
                            <div v-if="v.match.status == 'DONE'"
                                 :style="{background: node.data.rankColor}">
                              <h4 class="px-1" style="width: 2.5rem; color: white">
                                {{ convertToOrdinal(matchRank(v.player)) }}
                              </h4>
                            </div>
                            <div v-else style="background: #616161">
                              <h4 class="px-1" style="width: 2.5rem; color: white"> 待定 </h4>
                            </div>
                            <v-avatar class="mx-1 avatar-center bg-white" color="white" size="x-small">
                              <v-img :eager="exportMode" :src="logoCDN(v.player.team.collegeLogo)"/>
                            </v-avatar>
                            <span :style="[schoolNameStyle(v.player.team.collegeName), {color: (node as ZoneNodeJsonData).data.collegeNameColor}]"
                                  class="one-line-text">{{ schoolNameText(v.player.team.collegeName) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mx-2"
                     v-for="(v, i) in node.data.zones[groupIndex].text.slice(rankList(node.data.zones[groupIndex]).length)"
                     :key="i">
                  <div class="container ml-2">
                    <div class="right-column">
                      <div class="top-row row-content mt-2">
                        <div class="school-image-container">
                          <img src="@/assets/school_bg.png" style="width: 345px" alt="Image"/>
                          <div class="overlay ml-4">
                            <div style="background: #616161">
                              <h4 class="px-1" style="width: 2.5rem">待定</h4>
                            </div>
                            <v-avatar class="mx-1 avatar-center" color="white" size="x-small">
                              <v-img :eager="exportMode" src="@/assets/school_grey.png"/>
                            </v-avatar>
                            <span :style="[schoolNameStyle(v), {color: (node as ZoneNodeJsonData).data.collegeNameColor}]"
                                  class="one-line-text">{{ schoolNameText(v) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #canvas-plug>
          <div>
            <div v-for="v in extraTitleData" :key="v.title"
                 :style="{
                    left: `${v.left}px`,
                    top: `${v.top}px`,
                    width: `${nodeWidth - 20}px`,
                    position:'absolute',
                  }">
              <div class="title-image-container">
                <img :src="v.image" alt="Image"/>
                <div class="title-text-overlay">
                  <h3>{{ v.title }}</h3>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div v-for="v in extraImageData" :key="v.id"
                 :style="{
                    left: `${v.left}px`,
                    top: `${v.top}px`,
                    position:'absolute',
                  }">
              <div class="title-image-container">
                <img :src="v.image" alt="Image"/>
              </div>
            </div>
          </div>

          <!--          <div-->
          <!--            :style="{-->
          <!--              left: `0px`,-->
          <!--              top: `-160px`,-->
          <!--              position: 'absolute',-->
          <!--              'white-space': 'nowrap',-->
          <!--            }">-->
          <!--            <div>-->
          <!--              <b><span style="font-size: 5rem">A组小组赛</span></b>-->
          <!--              <b><span style="font-size: 2.5rem; color: #f48b3c"-->
          <!--                       class="ml-4">瑞士轮赛制</span></b>-->
          <!--            </div>-->
          <!--          </div>-->
        </template>
      </relation-graph>
    </div>
    <div class="text-end">
      <v-img
        class="logo"
        src="@/assets/logo.png"
        @click="appStore.anniversaryAnnouncementDialog = true">
      </v-img>

      <p class="copyright">
        华南理工大学华南虎
      </p>

      <GraphComment/>
    </div>
  </div>
</template>

<style scoped lang="scss">
::v-deep(.relation-graph) {
  .rel-map {
    background: none !important;

    .rel-node-shape-1 {
      border-radius: 2px;
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
    }
  }

  .rel-toolbar {
    color: #ffffff;

    .c-current-zoom {
      color: #ffffff;
    }
  }

  .rel-node-checked {
    //box-shadow: 0 0 16px 8px #5a879c;
    box-shadow: 0 0 0 0 #5a879c;
  }

  .rel-node {
    span {
      white-space: nowrap;
    }
  }

  .knockout-cross-line-right {
    transform: translateX(5px);
  }

  .knockout-cross-line-left {
    transform: translateX(-5px);
  }
}

.my-graph {
  //background: rgba(0, 0, 0, 0.75);
  background: transparent;
  --school-row-height: 44px;
  --school-logo-size: 30px;
  --graph-title-height: 48px;

  //background-image: url("src/assets/background3.png");
  ///* 背景图垂直、水平均居中 */
  //background-position: center center;
  ///* 背景图不平铺 */
  //background-repeat: no-repeat;
  ///* 当内容高度大于图片高度时，背景图像的位置相对于viewport固定 */
  //background-attachment: fixed;
  ///* 让背景图基于容器大小伸缩 */
  //background-size: cover;
}

.container {
  display: flex;
  width: 100%; /* 确保容器宽度 */
}

.left-column {
  flex: 0 0 10%;
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: center;
}

.right-column {
  flex: 1; /* 占据剩余的空间 */
  display: flex;
  flex-direction: column;
}

.row-content {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: flex-start; /* 水平左对齐 */
  width: 96%; /* 确保行内容宽度 */
  padding: 0 0;
}

.selected-player {
  background: rgba(223, 223, 223, 0.75); /* 选中内容的背景色 */
  padding: 4px 18px 4px 4px;
  border-radius: 4px; /* 添加圆角边框 */
  box-shadow: 0 0 8px 4px rgba(255, 255, 255, 0.5); /* 添加阴影效果 */
  transition: all 0.5s ease; /* 添加过渡效果，使变化更平滑 */
}

.selected-match {
  background: rgba(255, 215, 0, 0.5); /* 选中内容的背景色 */
  padding: 4px 0;
  border-radius: 4px; /* 添加圆角边框 */
  box-shadow: 0 0 8px 4px rgba(255, 215, 0, 0.25); /* 添加阴影效果 */
  transition: all 0.5s ease; /* 添加过渡效果，使变化更平滑 */
}

.forecast-list {
  position: relative;
}

.forecast-list > .mx-2 {
  position: relative;
  z-index: 1;
}

.forecast-guide-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 2;
}

.forecast-guide-lines path {
  fill: none;
  stroke: #FFFFFF;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 6 5;
  opacity: 0.9;
}

.one-line-text {
  white-space: nowrap; /* 禁止换行 */
  overflow: hidden; /* 隐藏溢出文本 */
  text-overflow: ellipsis; /* 使用省略号替代溢出文本 */
  flex: 1; /* 占据剩余空间 */
  min-width: 0; /* 确保 flex 项目的最小宽度为 0 */
  text-align: left; /* 确保文本居左对齐 */
  font-size: 22px;
}

.container2 {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  flex: 1; /* 平分右边列的高度 */
  justify-content: flex-start; /* 水平左对齐 */
}

.colorful-red {
  animation: color-change-red 1.5s infinite;
}

@keyframes color-change-red {
  0% {
    background: #C62828;
  }
  50% {
    background: #F44336;
  }
  100% {
    background: #C62828;
  }
}

.colorful-blue {
  animation: color-change-blue 1.5s infinite;
}

.score-red {
  background: #C62828 !important;
}

.score-blue {
  background: #1565C0 !important;
}

@keyframes color-change-blue {
  0% {
    background: #1565C0;
  }
  50% {
    background: #2196F3;
  }
  100% {
    background: #1565C0;
  }
}

.color-gray {
  color: #9D9F9F;
}

.highlight-gray {
  border-radius: 12px;
  animation: color-change-gray 2s infinite;
}

@keyframes color-change-gray {
  0% {
    border: 4px solid #263238;
  }
  50% {
    border: 4px solid #90A4AE;
  }
  100% {
    border: 4px solid #263238;
  }
}

.draggable {
  touch-action: none; /* 禁止默认的触摸行为 */
}

.logo {
  position: absolute;
  bottom: 28px;
  left: 0;
  width: 120px;
  opacity: 0.5;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.copyright {
  position: absolute;
  bottom: 16px;
  left: 8px;
  opacity: 0.5;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
  font-size: 0.8rem;
}

.legend {
  position: absolute;
  bottom: 8px;
  right: 12px;
  opacity: 0.8;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.background-image {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.golden-shine {
  background: linear-gradient(60deg, #263238 10%, rgba(238, 232, 170, 0.8) 50%, #263238 75%);
  background-size: 2000px 100%;
  animation: shimmer 4s linear infinite;
}

.title-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.graph-title-image-container {
  height: var(--graph-title-height);
}

.title-image-container img {
  width: 100%;
  height: 100%;
}

.title-text-overlay {
  position: absolute;
  width: 100%;
  text-align: center;
  text-shadow: 3px 3px 6px #000000;
}

.title-text-overlay h3 {
  font-size: 22px;
}

.graph-title-text-overlay {
  font-size: 22px;
}

.order-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.order-image-container img {
  width: 20px;
}

.order-text-overlay {
  color: black;
  position: absolute;
  width: 100%;
  text-align: center;
  font-size: 12px;
}

.order-live-dot {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 10;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f44336;
  border: 2px solid #ffffff;
  box-shadow: 0 0 10px 3px rgba(244, 67, 54, 0.75);
  animation: order-live-dot-pulse 1.2s ease-in-out infinite;
}

@keyframes order-live-dot-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 10px 3px rgba(244, 67, 54, 0.65);
  }

  50% {
    transform: scale(1.18);
    box-shadow: 0 0 16px 5px rgba(244, 67, 54, 0.9);
  }
}

.school-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.school-image-container img {
  width: 100%;
}

.school-image-container > img {
  height: var(--school-row-height);
  object-fit: fill;
}

.school-image-container :deep(.v-avatar) {
  width: var(--school-logo-size) !important;
  height: var(--school-logo-size) !important;
  min-width: var(--school-logo-size) !important;
}

.overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.node-title-border {
  border-right: 2px solid #5a879c;
}

.node-title-bg-gray {
  background: linear-gradient(to right, transparent 50%, rgba(96, 96, 96, 0.3) 100%);
}

.node-bg-gray {
  background-color: rgba(96, 96, 96, 0.3);
}

.my-font {
  font-family: 'MyFont', sans-serif;
}
</style>
