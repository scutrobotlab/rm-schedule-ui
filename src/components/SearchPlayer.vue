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
  <v-dialog max-width="480" v-model="appStore.searchDialog" :scrollable="true">
    <v-card class="pt-2" variant="elevated">
      <v-card-title><h3>搜索队伍</h3></v-card-title>
      <v-card-subtitle>通过汉字或汉语拼音搜索队伍</v-card-subtitle>

      <v-card-text>
        <v-switch
          v-model="onlyCurrentZone"
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
          chips
          closable-chips
          return-object
        >
          <template v-slot:chip="{ props, item }">
            <v-chip
              v-bind="props"
              :text="(item.raw as Player).team?.collegeName"
            >
              <template v-slot:prepend>
                <v-avatar class="bg-white mr-1">
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
                <v-avatar class="bg-white">
                  <v-img :src="(item.raw as Player).team?.collegeLogo"></v-img>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-card-text>

      <v-card-actions>
        <v-btn
          text="关闭"
          @click="appStore.searchDialog = false"
        ></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          text="选中"
          @click="confirm"
        ></v-btn>
        <v-btn
          text="分析"
          @click="analyze"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">

</style>
