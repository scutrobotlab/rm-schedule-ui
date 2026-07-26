<script setup lang="ts">
import { BilibiliEmbedRenderer } from "vue-bilibili-embed-renderer";
import { MatchNode } from "../types/schedule";
import { computed } from "vue";
import moment from "moment/moment";
import { useAppStore } from "../stores/app";
import { usePromotionStore } from "../stores/promotion";

interface Props {
  match: MatchNode
  variant?: 'default' | 'bracket'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
});
const emit = defineEmits<{
  close: []
}>()
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
    :class="{ 'bracket-glass-menu': variant === 'bracket' }"
    prepend-icon="mdi-sword-cross"
    width="320"
  >
    <v-btn
      v-if="variant === 'bracket'"
      class="bracket-menu-close"
      icon="mdi-close"
      size="small"
      variant="text"
      aria-label="关闭菜单"
      @click="emit('close')"
    />
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
.bracket-glass-menu {
  overflow: hidden;
  overflow-x: hidden;
  max-width: calc(100vw - 16px);
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  color: rgba(242, 248, 255, 0.96);
  border: 1px solid rgba(210, 232, 250, 0.2);
  border-radius: 20px !important;
  background:
    linear-gradient(145deg, rgba(172, 211, 240, 0.075), rgba(24, 53, 79, 0.025)),
    rgba(7, 20, 36, 0.3) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 0 0 1px rgba(180, 218, 246, 0.035),
    0 18px 48px rgba(0, 5, 16, 0.42),
    0 4px 14px rgba(0, 8, 24, 0.28) !important;
  backdrop-filter: blur(28px) saturate(1.55);
  -webkit-backdrop-filter: blur(28px) saturate(1.55);

  :deep(.v-card-item) {
    padding: 18px 52px 12px 18px;
  }

  :deep(.v-card-item__prepend) {
    color: rgba(194, 224, 247, 0.86);
  }

  :deep(.v-card-title) {
    font-size: 0.98rem;
    letter-spacing: 0.01em;
  }

  :deep(.v-card-subtitle) {
    margin-top: 3px;
    color: rgba(211, 227, 241, 0.7);
    opacity: 1;
  }

  :deep(.v-list) {
    overflow-x: hidden;
    padding: 8px;
    color: inherit;
    background: transparent;
  }

  :deep(.v-list-item) {
    min-height: 44px;
    margin: 2px 0;
    border-radius: 12px;
    transition:
      background-color 160ms ease,
      transform 120ms ease;
  }

  :deep(.v-list-item:hover) {
    background: rgba(180, 218, 246, 0.1);
  }

  :deep(.v-list-item:active) {
    background: rgba(180, 218, 246, 0.16);
    transform: scale(0.985);
  }

  :deep(.v-list-item--disabled) {
    opacity: 0.36;
  }

  :deep(iframe) {
    display: block;
    overflow: hidden;
    max-width: 100%;
    margin: 4px auto 8px;
    border-radius: 14px;
  }
}

.bracket-menu-close {
  position: absolute;
  z-index: 2;
  top: 10px;
  right: 10px;
  color: rgba(226, 240, 251, 0.82);
  background: rgba(205, 229, 247, 0.08);
  border: 1px solid rgba(218, 237, 251, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition:
    color 160ms ease,
    background-color 160ms ease,
    transform 120ms ease;

  &:hover {
    color: #fff;
    background: rgba(218, 237, 251, 0.14);
  }

  &:active {
    transform: scale(0.92);
  }
}
</style>
