<script setup lang="ts">
import { BilibiliEmbedRenderer } from "vue-bilibili-embed-renderer";
import { MatchNode } from "../types/schedule";
import { computed } from "vue";
import moment from "moment/moment";
import { useAppStore } from "../stores/app";
import { usePromotionStore } from "../stores/promotion";

interface Props {
  match: MatchNode
}

const props = defineProps<Props>();
const appStore = useAppStore()
const promotionStore = usePromotionStore();
const match = computed(() => props.match)

function matchTooltip(match: MatchNode): string {
  if (!match) return ""
  const time = moment.parseZone(match.planStartedAt).utcOffset(8)
  switch (match.status) {
    case "WAITING":
      return `预计 ${time.format('M月D日 HH:mm')} 开始`
    case "STARTED":
      return "比赛直播中"
    case "PENDING":
      return "成绩待确认"
    case "DONE":
      return "比赛已结束"
  }
  return ""
}

function openBilibiliSpace(uid: number) {
  window.open(`https://space.bilibili.com/${uid}`, '_blank')
}

function onAnalyzeMatch() {
  promotionStore.selectedMatch = match.value
  appStore.matchAnalysisDialog = true
}
</script>

<template>
  <v-card
    class="mx-auto"
    prepend-icon="mdi-sword-cross"
    width="320"
  >
    <template v-slot:title>
      <span class="font-weight-black">
        {{ matchTooltip(match) }}
      </span>
    </template>

    <template v-slot:subtitle>
      <span v-if="match.redSide.player && match.blueSide.player" class="font-weight-black">
        {{ match.redSide.player?.team.collegeName }}
        vs
        {{ match.blueSide.player?.team.collegeName }}
      </span>
      <span v-else class="font-weight-black">
        红方 vs 蓝方
      </span>
    </template>

    <BilibiliEmbedRenderer
      v-if="promotionStore.bilibiliReplay"
      width="320"
      height="180"
      :bvid="promotionStore.bilibiliReplay.bvid">
    </BilibiliEmbedRenderer>

    <v-list>
      <v-list-item
        @click="onAnalyzeMatch"
        :disabled="!props.match.redSide.player || !props.match.blueSide.player"
      >
        分析比赛{{ promotionStore.getCurrentZone().name }}第{{ match.orderNumber }}场
      </v-list-item>
      <v-list-item
        @click="appStore.analysisDialog = true"
        :disabled="!promotionStore.selectedPlayer?.team"
      >
        分析队伍{{ promotionStore.selectedPlayer?.team?.collegeName }}
      </v-list-item>
      <v-list-item
        :disabled="!promotionStore.teamInfo || !promotionStore.teamInfo.bilibiliUid"
        @click="openBilibiliSpace(promotionStore.teamInfo?.bilibiliUid)"
      >
        前往战队 bilibili 账号
      </v-list-item>
    </v-list>
  </v-card>
</template>

<style scoped lang="scss">

</style>
