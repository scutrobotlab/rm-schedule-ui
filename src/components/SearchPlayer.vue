<script setup lang="ts">
import { useAppStore } from "../stores/app";
import { usePromotionStore } from "../stores/promotion";
import { computed, ref } from "vue";
import { Player } from "../types/schedule";
import PinyinMatch from 'pinyin-match';

interface Props {
  zoneId: number,
}

const props = defineProps<Props>()

export interface InternalItem<T = any> {
  value: any
  raw: T
}

const appStore = useAppStore()
const promotionStore = usePromotionStore()

const onlyCurrentZone = ref(false)
const selected = ref<Player>()
const players = computed(() => {
  let ret: Player[] = []
  let zones = promotionStore.schedule.data.event.zones.nodes
  if (onlyCurrentZone.value) {
    zones = zones.filter(zone => zone.id == props.zoneId.toString())
  }
  zones.forEach(zone => {
    zone.groups.nodes.forEach(group => {
      ret = ret.concat(group.players.nodes)
    })
  })
  return ret
})

function customFilter(value: string, query: string, item?: InternalItem<Player>) {
  if (!item) return false
  if (!item.raw.team) return false
  const t = item.raw.team
  return t.collegeName.includes(query) || t.name.includes(query) ||
    PinyinMatch.match(t.collegeName, query) || PinyinMatch.match(t.name, query)
}

function handleZoneChange() {
  // 当选中队伍不在当前赛区时，自动跳转到该队伍参赛且编号最大的赛区
  let inCurrentZone = false
  const currenZone = promotionStore.getZone(props.zoneId)
  for (let group of currenZone.groups.nodes) {
    if (group.players.nodes.some(p => p.id == promotionStore.selectedPlayer.id)) {
      inCurrentZone = true
      break
    }
  }
  if (!inCurrentZone) {
    let latestZoneId = props.zoneId
    let zones = promotionStore.schedule.data.event.zones.nodes
    for (let zone of zones) {
      for (let group of zone.groups.nodes) {
        if (group.players.nodes.some(p => p.id == promotionStore.selectedPlayer.id)) {
          latestZoneId = Number(zone.id)
          // 此处故意不写break，目的是当一个队伍参加多个赛区（区域赛+国赛）时，取最晚的组
        }
      }
    }
    if (latestZoneId != props.zoneId) promotionStore.zoneId = latestZoneId
  }
}

function confirm() {
  appStore.searchDialog = false
  promotionStore.selectedPlayer = selected.value
  if (!onlyCurrentZone.value) handleZoneChange()
}

function analyze() {
  confirm()
  appStore.analysisDialog = true
}
</script>

<template>
  <v-dialog
    v-model="appStore.searchDialog"
    class="search-dialog"
    content-class="search-dialog__content"
    max-width="480"
    :scrollable="true"
    scrim="rgba(1, 7, 16, 0.54)"
  >
    <v-card class="search-dialog__card" variant="flat">
      <div class="search-dialog__glow" aria-hidden="true" />
      <v-card-title class="search-dialog__title">
        <span class="search-dialog__title-icon">
          <v-icon icon="mdi-magnify" size="20" />
        </span>
        <span>搜索队伍</span>
        <v-btn
          class="search-dialog__close"
          icon="mdi-close"
          size="small"
          variant="text"
          aria-label="关闭搜索"
          @click="appStore.searchDialog = false"
        />
      </v-card-title>
      <v-card-subtitle class="search-dialog__subtitle">
        通过汉字或汉语拼音搜索队伍
      </v-card-subtitle>

      <v-card-text class="search-dialog__body">
        <v-switch
          v-model="onlyCurrentZone"
          class="search-dialog__switch"
          color="blue-lighten-2"
          label="仅限当前赛区"
          hide-details
        >
        </v-switch>

        <v-autocomplete
          v-model="selected"
          :items="players"
          color="blue-grey-lighten-2"
          :custom-filter="customFilter"
          hint="请输入学校或队伍名称"
          persistent-hint
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-school-outline"
          menu-icon="mdi-chevron-down"
          :menu-props="{ contentClass: 'search-player-menu' }"
          chips
          closable-chips
          return-object
        >
          <template v-slot:chip="{ props, item }">
            <v-chip
              class="selected-team-chip"
              v-bind="props"
              :text="(item.raw as Player).team?.collegeName"
            >
              <template v-slot:prepend>
                <v-avatar class="team-logo-avatar selected-team-logo bg-white mr-1" size="24">
                  <v-img :src="(item.raw as Player).team?.collegeLogo"></v-img>
                </v-avatar>
              </template>
            </v-chip>
          </template>

          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="(item.raw as Player).team?.collegeName"
              :subtitle="(item.raw as Player).team?.name"
            >
              <template v-slot:prepend>
                <v-avatar class="team-logo-avatar bg-white" size="36">
                  <v-img :src="(item.raw as Player).team?.collegeLogo"></v-img>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-card-text>

      <v-card-actions class="search-dialog__actions">
        <v-btn
          class="search-dialog__secondary"
          variant="text"
          text="关闭"
          @click="appStore.searchDialog = false"
        ></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          class="search-dialog__secondary"
          variant="tonal"
          text="选中"
          :disabled="!selected"
          @click="confirm"
        ></v-btn>
        <v-btn
          class="search-dialog__primary"
          color="blue-lighten-2"
          variant="flat"
          text="分析"
          :disabled="!selected"
          @click="analyze"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.search-dialog__card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(169, 209, 241, 0.22);
  border-radius: 22px !important;
  color: #edf5ff;
  background:
    linear-gradient(145deg, rgba(194, 225, 249, 0.13), transparent 42%),
    linear-gradient(180deg, rgba(17, 43, 68, 0.76), rgba(5, 17, 34, 0.68)) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 28px 80px rgba(0, 4, 14, 0.5) !important;
  backdrop-filter: blur(30px) saturate(1.35);
  -webkit-backdrop-filter: blur(30px) saturate(1.35);
}

.search-dialog__glow {
  position: absolute;
  top: -110px;
  right: -90px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: rgba(101, 173, 232, 0.16);
  filter: blur(34px);
  pointer-events: none;
}

.search-dialog__title {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 22px 4px;
  font-size: 1.12rem;
  font-weight: 650;
  letter-spacing: 0.02em;
}

.search-dialog__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(160, 207, 245, 0.2);
  border-radius: 11px;
  color: #a9d8ff;
  background: rgba(107, 174, 230, 0.13);
}

.search-dialog__close {
  margin-left: auto;
  color: rgba(224, 238, 252, 0.72);
}

.search-dialog__subtitle {
  padding: 2px 22px 10px;
  color: rgba(205, 222, 239, 0.62) !important;
}

.search-dialog__body {
  padding: 8px 22px 10px;
}

.search-dialog__switch {
  margin-bottom: 8px;
  color: rgba(231, 241, 251, 0.9);
}

.search-dialog__actions {
  padding: 10px 18px 18px;
  gap: 4px;
}

.search-dialog__secondary,
.search-dialog__primary {
  border-radius: 11px;
  letter-spacing: 0.04em;
}

.search-dialog__primary {
  color: #071728 !important;
  box-shadow: 0 8px 22px rgba(68, 147, 211, 0.24);
}

:deep(.v-field) {
  border-radius: 14px;
  background: rgba(4, 17, 34, 0.28);
}

:deep(.v-field__outline) {
  --v-field-border-opacity: 0.22;
}

:deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 0.58;
}

.team-logo-avatar {
  flex: 0 0 auto;
  aspect-ratio: 1;
  border-radius: 50% !important;
  overflow: hidden;
}

.team-logo-avatar :deep(.v-img) {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.selected-team-chip {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.selected-team-chip :deep(.v-chip__content) {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-team-logo {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px;
  margin-inline-start: 0 !important;
}

:deep(.v-autocomplete .v-field__input) {
  flex-wrap: nowrap;
  min-width: 0;
  overflow: hidden;
}

:deep(.v-autocomplete .v-autocomplete__selection) {
  min-width: 0;
  max-width: calc(100% - 4px);
}

:deep(.v-autocomplete .v-field__input > input) {
  min-width: 1px;
}

:global(.search-player-menu) {
  overflow: hidden;
  border: 1px solid rgba(169, 209, 241, 0.2);
  border-radius: 14px !important;
  background:
    linear-gradient(145deg, rgba(155, 205, 242, 0.11), transparent 45%),
    rgba(7, 22, 40, 0.94) !important;
  box-shadow: 0 18px 48px rgba(0, 4, 14, 0.42) !important;
  backdrop-filter: blur(24px) saturate(1.3);
  -webkit-backdrop-filter: blur(24px) saturate(1.3);
}

:global(.search-player-menu .v-list) {
  color: #edf5ff;
  background: transparent !important;
}

:global(.search-player-menu .v-list-item:hover),
:global(.search-player-menu .v-list-item--active) {
  background: rgba(128, 188, 235, 0.13);
}

:global(.search-dialog .v-overlay__scrim) {
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .search-dialog__card {
    background: rgba(7, 22, 40, 0.96) !important;
  }

  :global(.search-player-menu) {
    background: rgba(7, 22, 40, 0.98) !important;
  }
}

@media (max-width: 600px) {
  .search-dialog__card {
    margin: 12px;
    border-radius: 18px !important;
  }

  .search-dialog__title {
    padding: 18px 18px 4px;
  }

  .search-dialog__subtitle {
    padding-right: 18px;
    padding-left: 18px;
  }

  .search-dialog__body {
    padding-right: 18px;
    padding-left: 18px;
  }

  .search-dialog__actions {
    padding: 8px 14px 14px;
  }
}
</style>
