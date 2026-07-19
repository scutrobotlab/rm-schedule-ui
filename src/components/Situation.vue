<script setup lang="ts">
import { useAppStore } from "../stores/app";
import MatchGraph from "./MatchGraph.vue";
import { computed, watch, ref } from "vue";
import { usePromotionStore } from "../stores/promotion";
import AnalyzeTeam from "./AnalyzeTeam.vue";
import { useRoute, useRouter } from "vue-router";
import { DefaultZoneMap, Part, SeasonList, ZoneMap } from "../constant/zone";
import AnalyzeMatch from "./AnalyzeMatch.vue";

const route = useRoute()
const router = useRouter()

const liveMode = computed(() => route.query.live == "1")
const predict = ref(Boolean(route.query.predict == "1"))
const selectedGroup = ref(Number(route.query.group ?? -1))
const appStore = useAppStore()
const promotionStore = usePromotionStore();
const routeHasGroup = computed(() => route.query.group !== undefined)

const zoneId = computed(() => promotionStore.zoneId)
promotionStore.season = Number(route.params.season)
promotionStore.zoneId = Number(route.params.zoneId)
const season = computed(() => promotionStore.season)
const zone = computed(() => ZoneMap[season.value].find((zone) => zone.id == zoneId.value))
let needsRouteNormalize = false

// 如果 Season 不存在，则自动选择最后一个可用的 Season
if (!Object.keys(ZoneMap).includes(String(promotionStore.season))) {
  promotionStore.season = Number(Object.keys(ZoneMap).slice(-1)[0])
  promotionStore.zoneId = DefaultZoneMap[promotionStore.season]
  needsRouteNormalize = true
}
// 如果 ZoneId 不存在，则自动选择默认的 ZoneId
if (!ZoneMap[promotionStore.season].find((zone) => zone.id == zoneId.value)) {
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

function updateQuery() {
  // 如果选中的组不存在，则重置为第一个组
  if (!zone.value?.parts[selectedGroup.value]) {
    selectedGroup.value = getDefaultSelectedGroup(false)
  }
  router.push({ path: `/${promotionStore.season}/${zoneId.value}`, query: { ...route.query, group: selectedGroup.value } })
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
  const queryString = query.toString()
  window.location.href = `/${newSeason}${queryString ? `?${queryString}` : ''}`
}

function toggleLiveMode() {
  const query = { ...route.query }
  if (liveMode.value) {
    delete query.live
  } else {
    query.live = "1"
  }
  router.replace({ path: route.path, query })
}

watch(zoneId, updateQuery)
watch(selectedGroup, updateQuery)

function badgeTab(zoneId: number): boolean {
  if (!promotionStore.selectedPlayer) return false
  const zone = promotionStore.getZone(zoneId)
  if (!zone) return false
  for (let group of zone.groups.nodes) {
    for (let player of group.players.nodes) {
      if (promotionStore.selectedPlayer.id == player.id) return true
    }
  }
  return false
}

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

const width = computed(() => {
  return window.innerWidth
})

const MenuItems = ref(
  [
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
      title: () => liveMode.value ? '关闭直播' : '直播模式',
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
  ]
)
</script>

<template>
  <div class="my-font">
    <img
      class="background-image"
      :style="{
        opacity: promotionStore.backgroundImageOpacity,
      }"
      :src="promotionStore.backgroundImage"
      alt=""/>

    <SearchPlayer :zone-id="zoneId"/>

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
            ></v-select>
            <v-select
              label="Zone"
              max-width="260px"
              variant="filled"
              :item-props="true"
              item-value="id"
              item-title="name"
              :disable="(item) => !item.disabled"
              :items="ZoneMap[promotionStore.season]"
              v-model="promotionStore.zoneId"
              @update:model-value="updateQuery"
            ></v-select>
            <v-spacer/>

            <v-switch
              v-if="predict"
              color="orange"
              class="ml-2"
              label="预测"
              v-model="promotionStore.suggestionEnabled"
            ></v-switch>

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
                ></v-img>
                <span v-if="width >= 800" class="header-logo-text">
                  RM Schedule
                </span>
              </button>

              <v-btn
                class="mx-1"
                variant="flat"
                color="transparent"
                icon="mdi-magnify"
                @click="appStore.searchDialog = true"
              >
              </v-btn>

              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    variant="flat"
                    color="transparent"
                    icon="mdi-more"
                    v-bind="props"
                  ></v-btn>
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
                  >
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-tabs>

          <v-sheet class="mx-auto text-center bg-transparent">
            <v-slide-group
              class="ml-2"
              v-model="selectedGroup"
              mandatory="force"
            >
              <v-slide-group-item
                v-for="part in zone.parts"
                :key="part.name"
                v-slot="{ isSelected, toggle }"
              >
                <v-btn
                  :color="isSelected ? 'primary' : undefined"
                  class="mx-1 my-2"
                  rounded
                  variant="outlined"
                  size="small"
                  @click="toggle">
                  {{ part.name }}
                  <span
                    v-if="!liveMode && partHasStartedMatch(part)"
                    class="group-live-dot"
                  ></span>
                </v-btn>
              </v-slide-group-item>

              <v-spacer/>

              <div class="text-right mr-4 live-mode-indicator-container">
                <span v-if="liveMode" class="live-mode-indicator">
                  直播模式
                </span>
              </div>
            </v-slide-group>
          </v-sheet>
        </div>

        <div
          v-for="zone in ZoneMap[promotionStore.season]"
          :key="zone.id"
        >
          <v-carousel
            v-if="zoneId == zone.id"
            height="100vh - 100px"
            :disabled="true"
            hide-delimiters
            :show-arrows="false"
            v-model="selectedGroup"
          >
            <v-carousel-item
              v-for="part in zone.parts"
              :key="part.name"
            >
              <MatchGraph
                :key="`${zoneId}-${part.name}-${liveMode ? 'live' : 'normal'}`"
                :zone-id="zoneId"
                :type="part.type"
                :group="part.group"
                :json-data="part.jsonData"
                :round-order="part.roundOrder"
                :extra-title-data="part.extraTitleData"
                :extra-image-data="part.extraImageData"
              ></MatchGraph>
            </v-carousel-item>
          </v-carousel>
        </div>

        <v-bottom-sheet v-model="appStore.analysisDialog">
          <AnalyzeTeam
            :zone-id="zoneId"
            :player="promotionStore.selectedPlayer"
          ></AnalyzeTeam>
        </v-bottom-sheet>

        <v-bottom-sheet v-model="appStore.matchAnalysisDialog">
          <AnalyzeMatch
            :zone-id="zoneId"
            :match="promotionStore.selectedMatch"
          ></AnalyzeMatch>
        </v-bottom-sheet>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100vh; /* 使容器的高度与视口高度一致 */
  overflow: hidden;
}

.background-image {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
  object-fit: cover;
}

.content {
  position: relative;
  z-index: 3;
}

.container2 {
  display: flex; /* 使用Flexbox来布局子元素 */
  flex-wrap: wrap; /* 允许子元素换行 */
}

.row {
  display: flex; /* 每行也使用Flexbox布局 */
  flex-basis: 100%; /* 每行占满容器宽度 */
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

.group-live-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-left: 6px;
  border-radius: 50%;
  background: #f44336;
}

.col {
  flex: 1; /* 列占用可用空间 */
  align-content: center;
}

.my-font {
  font-family: 'MyFont', sans-serif;
}

.glass-sheet {
  background-color: rgba(255, 255, 255, 0.05); /* 半透明背景 */
  backdrop-filter: blur(5px); /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(5px); /* 兼容 Safari */
}

.floating-container {
  position: absolute; /* 绝对定位 */
  z-index: 4; /* 确保在 v-carousel 上方 */
  width: 100%; /* 占满宽度 */
}

.v-carousel {
  position: relative; /* 确保 v-carousel 作为定位参考 */
}
</style>
