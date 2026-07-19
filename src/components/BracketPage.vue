<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StageRangeSelector, { type StageItem, type StageRange } from './StageRangeSelector.vue'
import BracketBoard from './bracket/BracketBoard.vue'
import { DefaultZoneMap, Part, SeasonList, ZoneMap } from '../constant/zone'
import { usePromotionStore } from '../stores/promotion'
import { getStageTeamCounts } from '../utils/stage_teams'
import { buildBracketViewModel } from '../utils/bracket_adapter'
import {
  resolveBracketParts,
  type BracketPart,
} from '../utils/bracket_part_merge'
import type { BracketViewModel } from '../types/bracket'

const stageRange = ref<StageRange>({ start: 0, end: 1 })

const route = useRoute()
const router = useRouter()
const promotionStore = usePromotionStore()

/** 原始 zone.parts 下标（与 ?group= 兼容） */
const selectedGroup = ref(Number(route.query.group ?? -1))
const routeHasGroup = computed(() => route.query.group !== undefined)
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

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

watch(zoneId, updateQuery)
watch(selectedGroup, updateQuery)
watch(
  [selectedGroup, zoneId, () => displayStages.value.length],
  () => {
    const n = displayStages.value.length
    stageRange.value = { start: 0, end: Math.min(1, Math.max(0, n - 1)) }
  },
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
    stageRange: stageRange.value,
  })
})

function onResize() {
  viewportWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
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
              <span
                v-if="viewportWidth >= 800"
                class="page-label"
              >晋级图</span>
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
            </v-slide-group>
          </v-sheet>

          <div
            v-if="displayStages.length >= 2"
            class="stage-range-wrap"
          >
            <StageRangeSelector
              v-model="stageRange"
              :stages="displayStages"
            />
          </div>
        </div>

        <BracketBoard
          v-if="bracketModel"
          :model="bracketModel"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bracket-page {
  color: #e8eef5;
  min-height: 100vh;
}

.container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  /* 纵向随内容增高，禁止裁切对阵列表 */
  overflow-x: hidden;
  overflow-y: visible;
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
  min-height: 100vh;
}

.row {
  display: flex;
  flex-basis: 100%;
}

.top-right-actions {
  display: flex;
  align-items: center;
}

.page-label {
  opacity: 0.75;
  letter-spacing: 0.08em;
  font-size: 0.85rem;
}

.glass-sheet {
  background-color: rgba(10, 28, 48, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.floating-container {
  position: relative;
  z-index: 4;
  width: 100%;
  flex: 0 0 auto;
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
