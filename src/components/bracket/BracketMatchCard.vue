<script setup lang="ts">
import { computed } from 'vue'
import moment from 'moment'
import type { BracketMatchCard as MatchCard } from '../../types/bracket'
import {
  resolveBracketTextTransition,
  resolveBracketTitleShortenLevel,
  shortenBracketTitle,
  type BracketDensity,
  type BracketMotionState,
  type BracketTitleShortenLevel,
} from '../../utils/bracket_density'
import BracketTeamRow from './BracketTeamRow.vue'
import { usePromotionStore } from '../../stores/promotion'
import { resolveGroupRankStat, type GroupRankStatName } from '../../utils/group_rank'
import { vAutoFitText } from '../../directives/auto_fit_text'

const props = withDefaults(
  defineProps<{
    item: MatchCard
    density: BracketDensity
    visibleSpan: number
    motionState?: BracketMotionState
    textFitEnabled?: boolean
    titleShortenLevel?: BracketTitleShortenLevel
    showTeamName?: boolean
    showPendingScore?: boolean
    forcePendingName?: boolean
    showPlaceholderLogo?: boolean
    showTypeTag?: boolean
    showGroupStats?: boolean
    groupName?: string
  }>(),
  {
    titleShortenLevel: 0,
    showTeamName: true,
    showPendingScore: true,
    forcePendingName: false,
    showPlaceholderLogo: true,
    showTypeTag: true,
    showGroupStats: false,
    groupName: '',
    motionState: 'idle',
    textFitEnabled: true,
  },
)
const promotionStore = usePromotionStore()

const statusLabel: Record<string, string> = {
  STARTED: '进行中',
  DONE: '已结束',
  PENDING: '未开始',
  UNKNOWN: '待确认',
}

/** 2→3 列缩放期间保持挂载，由 --bracket-normal-progress 连续收起。 */
const showMeta = computed(() => props.visibleSpan < 3)
const showSupportRate = computed(() => Math.abs(props.visibleSpan - 1) < 0.001)
const mpMatch = computed(() => (
  props.item.matchId ? promotionStore.getMpMatch(props.item.matchId) : undefined
))

function groupStat(side: 'red' | 'blue', itemName: GroupRankStatName): string {
  return resolveGroupRankStat(
    promotionStore.groupRank,
    promotionStore.zoneId,
    props.groupName,
    props.item.slots[side === 'red' ? 0 : 1].collegeName,
    itemName,
  )
}
const titleTransition = computed(() => resolveBracketTextTransition(
  props.visibleSpan,
  (columns) => shortenBracketTitle(
    props.item.title,
    resolveBracketTitleShortenLevel(columns),
  ),
))
const timeText = computed(() => {
  if (!props.item.planStartedAt) return ''
  const m = moment(props.item.planStartedAt)
  return m.isValid() ? m.format('M/D HH:mm') : ''
})

/** 冠军争夺战 → 冠亚；季军争夺战 → 季殿 */
const podiumKind = computed<'champion' | 'third' | null>(() => {
  const title = props.item.title || ''
  if (title.includes('季军')) return 'third'
  if (title.includes('冠军')) return 'champion'
  return null
})

const podiumTag = computed(() => {
  if (podiumKind.value === 'third') return '季殿'
  if (podiumKind.value === 'champion') return '冠亚'
  return null
})

const progressTag = computed(() => {
  if (podiumTag.value || !props.item.progressLabel) return ''
  if (props.item.progressLabel === '16强') return '十六强'
  if (props.item.progressLabel === '12强') return '十二强'
  return props.item.progressLabel
})
/** 与缩放手势同步：2→3 列期间连续收起，达到 3 列时再卸载。 */
const progressTagVisibility = computed(() => (
  Math.min(1, Math.max(0, 3 - props.visibleSpan))
))
const progressTagStyle = computed(() => {
  const visibility = progressTagVisibility.value
  return {
    maxWidth: `${7 * visibility}rem`,
    paddingInline: `${5 * visibility}px`,
    opacity: String(visibility),
    transform: `scale(${visibility})`,
  }
})

function slotMedal(
  slot: { isWinner: boolean; isLoser: boolean },
): 'gold' | 'silver' | 'bronze' | null {
  if (podiumKind.value === 'champion') {
    if (slot.isWinner) return 'gold'
    if (slot.isLoser) return 'silver'
  }
  if (podiumKind.value === 'third' && slot.isWinner) return 'bronze'
  return null
}
</script>

<template>
  <article
    class="match-card"
    :class="[
      `lane-${item.lane}`,
      `density-${density}`,
      podiumKind ? `podium-${podiumKind}` : null,
    ]"
    :data-node-id="item.nodeId"
  >
    <div
      v-if="
        titleTransition.from ||
        (showTypeTag && podiumTag) ||
        (progressTag && progressTagVisibility > 0) ||
        showGroupStats
      "
      class="card-head"
    >
      <span
        v-if="titleTransition.from"
        v-auto-fit-text="{ enabled: textFitEnabled, minFontSize: 8 }"
        class="card-title text-transition"
        :class="{ 'auto-fit-text': textFitEnabled }"
      >
        <span :style="{ opacity: 1 - titleTransition.progress }">{{ titleTransition.from }}</span>
        <span :style="{ opacity: titleTransition.progress }">{{ titleTransition.to }}</span>
      </span>
      <Transition name="group-stats">
        <span
          v-if="showGroupStats"
          class="group-stats-tools"
        >
          <span>胜场</span>
          <span>对手分</span>
        </span>
      </Transition>
      <span
        v-if="showGroupStats"
        class="type-tag type-tag--match"
      >对阵</span>
      <span
        v-else-if="showTypeTag && podiumTag"
        class="type-tag"
      >{{ podiumTag }}</span>
      <span
        v-else-if="progressTag && progressTagVisibility > 0"
        class="type-tag progress-tag"
        :style="progressTagStyle"
      >
        {{ progressTag }}
      </span>
    </div>

    <div class="slot-stack">
      <BracketTeamRow
        :team="item.slots[0]"
        :score="item.redWinGames"
        :density="density"
        :visible-span="visibleSpan"
        :text-fit-enabled="textFitEnabled"
        :show-score="true"
        :show-name="showTeamName"
        :show-pending-score="showPendingScore"
        :force-pending-name="forcePendingName"
        :tight-name-score-gap="(titleShortenLevel ?? 0) >= 1"
        :side="podiumKind ? null : 'red'"
        placeholder-side="red"
        :medal="slotMedal(item.slots[0])"
        :finalized="item.status === 'DONE'"
        :match-source-shorten-level="
          (titleShortenLevel ?? 0) >= 4 ? 3
            : (titleShortenLevel ?? 0) >= 2 ? 2
              : (titleShortenLevel ?? 0) >= 1 ? 1 : 0
        "
        :show-placeholder-logo="showPlaceholderLogo"
        :show-support-rate="showSupportRate"
        :support-rate="mpMatch?.redRate"
        :show-group-stats="showGroupStats"
        :win-count="groupStat('red', '胜场数')"
        :opponent-score="groupStat('red', '对手分')"
      />
      <BracketTeamRow
        :team="item.slots[1]"
        :score="item.blueWinGames"
        :density="density"
        :visible-span="visibleSpan"
        :text-fit-enabled="textFitEnabled"
        :show-score="true"
        :show-name="showTeamName"
        :show-pending-score="showPendingScore"
        :force-pending-name="forcePendingName"
        :tight-name-score-gap="(titleShortenLevel ?? 0) >= 1"
        :side="podiumKind ? null : 'blue'"
        placeholder-side="blue"
        :medal="slotMedal(item.slots[1])"
        :finalized="item.status === 'DONE'"
        :match-source-shorten-level="
          (titleShortenLevel ?? 0) >= 4 ? 3
            : (titleShortenLevel ?? 0) >= 2 ? 2
              : (titleShortenLevel ?? 0) >= 1 ? 1 : 0
        "
        :show-placeholder-logo="showPlaceholderLogo"
        :show-support-rate="showSupportRate"
        :support-rate="mpMatch?.blueRate"
        :show-group-stats="showGroupStats"
        :win-count="groupStat('blue', '胜场数')"
        :opponent-score="groupStat('blue', '对手分')"
      />
    </div>

    <div
      v-if="showMeta && (statusLabel[item.status] || item.orderNumber || timeText)"
      class="card-meta"
    >
      <span v-if="statusLabel[item.status]">{{ statusLabel[item.status] }}</span>
      <span v-if="item.orderNumber">第{{ item.orderNumber }}场</span>
      <span v-if="timeText">{{ timeText }}</span>
    </div>
  </article>
</template>

<style scoped>
.match-card {
  position: relative;
  z-index: 1;
  padding: calc(
    8px
    - 2px * var(--bracket-normal-progress, 0)
    - 2px * var(--bracket-compact-progress, 0)
  );
  border-radius: calc(8px - 2px * var(--bracket-compact-progress, 0));
  background:
    linear-gradient(180deg, rgba(162, 205, 240, 0.1) 0%, rgba(22, 50, 78, 0.03) 42%),
    rgba(4, 12, 28, 0.4);
  border: 1px solid rgba(154, 196, 230, 0.26);
  border-left-width: 3px;
  border-left-color: rgba(132, 187, 230, 0.68);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 0 1px rgba(190, 220, 244, 0.025),
    0 8px 22px rgba(0, 5, 16, 0.18);
  transition:
    transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1),
    filter 220ms ease-out,
    opacity 220ms ease-out;
  backdrop-filter: blur(22px) saturate(1.28);
  -webkit-backdrop-filter: blur(22px) saturate(1.28);
}

.match-card:active {
  transform: scale(0.975);
  filter: brightness(0.9) saturate(0.94);
  opacity: 0.9;
  transition-duration: 80ms;
  transition-timing-function: ease-out;
}

.match-card.lane-gold {
  background:
    linear-gradient(180deg, rgba(255, 215, 112, 0.13) 0%, rgba(93, 60, 12, 0.035) 46%),
    rgba(34, 24, 8, 0.4);
  border-color: rgba(232, 187, 102, 0.32);
  border-left-color: #ffc857;
  box-shadow:
    inset 0 1px 0 rgba(255, 231, 164, 0.14),
    inset 0 0 0 1px rgba(255, 215, 112, 0.025),
    0 8px 22px rgba(12, 8, 0, 0.2);
}

.match-card.lane-gold .card-title {
  color: #ffd56a;
  opacity: 1;
  font-weight: 600;
}

.match-card.podium-champion .type-tag {
  color: #1a1408;
  background: #ffd56a;
  opacity: var(--bracket-type-tag-opacity, 1);
  font-weight: 700;
}

.match-card.podium-third {
  background:
    linear-gradient(180deg, rgba(214, 150, 101, 0.12) 0%, rgba(79, 43, 24, 0.035) 46%),
    rgba(30, 20, 17, 0.4);
  border-color: rgba(200, 137, 90, 0.3);
  border-left-color: #c8895a;
  box-shadow:
    inset 0 1px 0 rgba(238, 183, 137, 0.13),
    inset 0 0 0 1px rgba(224, 168, 120, 0.025),
    0 8px 22px rgba(12, 6, 3, 0.19);
}

.match-card.podium-third .card-title {
  color: #e0a878;
}

.match-card.podium-third .type-tag {
  color: #1a120c;
  background: #c8895a;
  opacity: var(--bracket-type-tag-opacity, 1);
  font-weight: 700;
}

.slot-stack {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.group-stats-tools {
  display: inline-grid;
  grid-template-columns: repeat(2, 2rem);
  flex: 0 0 auto;
  gap: 4px;
  align-items: center;
  margin-left: auto;
  margin-right: calc(1.8rem + 8px);
  color: rgba(220, 232, 246, 0.72);
  font-size: 0.58rem;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}

.group-stats-enter-active,
.group-stats-leave-active {
  transition:
    opacity 220ms ease,
    transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.group-stats-enter-from,
.group-stats-leave-to {
  opacity: 0;
  transform: translateX(6px);
}

.card-head {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px 6px;
  max-height: 1rem;
  margin-bottom: 6px;
  overflow: hidden;
}

.card-title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: calc(
    0.72rem
    - 0.06rem * var(--bracket-normal-progress, 0)
    - 0.02rem * var(--bracket-compact-progress, 0)
  );
  opacity: 0.72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-transition {
  display: grid;
}

.text-transition > span {
  grid-area: 1 / 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.auto-fit-text,
.auto-fit-text > span {
  text-overflow: clip;
}

.card-title.auto-fit-text {
  transition: font-size 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.type-tag {
  flex: 0 0 auto;
  max-width: calc(7rem * var(--bracket-type-tag-opacity, 1));
  font-size: 0.58rem;
  padding: 1px 5px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.08);
  opacity: var(--bracket-type-tag-opacity, 1);
  overflow: hidden;
  transform: scale(var(--bracket-type-tag-opacity, 1));
  transform-origin: right center;
}

.type-tag--match {
  position: absolute;
  right: 0;
}

.progress-tag {
  color: #9fd9bc;
  background: rgba(93, 206, 160, 0.18);
  opacity: var(--bracket-type-tag-opacity, 1);
  font-weight: 600;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: calc(1.2rem * (1 - var(--bracket-normal-progress, 0)));
  margin-top: calc(6px * (1 - var(--bracket-normal-progress, 0)));
  font-size: 0.66rem;
  line-height: 1.2rem;
  opacity: calc(0.55 * (1 - var(--bracket-normal-progress, 0)));
  overflow: hidden;
  transform: translateY(calc(-2px * var(--bracket-normal-progress, 0)));
}

.card-head {
  margin-bottom: calc(6px - 2px * var(--bracket-normal-progress, 0));
}

@media (prefers-reduced-motion: reduce) {
  .match-card {
    transition: none;
  }

  .match-card:active {
    transform: none;
  }

  .group-stats-enter-active,
  .group-stats-leave-active {
    transition: none;
  }

  .card-title.auto-fit-text {
    transition: none;
  }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .match-card {
    background: rgba(7, 18, 36, 0.9);
  }

  .match-card.lane-gold {
    background: rgba(40, 29, 11, 0.9);
  }

  .match-card.podium-third {
    background: rgba(37, 24, 20, 0.9);
  }
}

@media (min-width: 900px) {
  .match-card {
    padding: calc(
      10px
      - 4px * var(--bracket-normal-progress, 0)
      - 2px * var(--bracket-compact-progress, 0)
    );
  }

  .card-title {
    font-size: calc(
      0.78rem
      - 0.12rem * var(--bracket-normal-progress, 0)
      - 0.02rem * var(--bracket-compact-progress, 0)
    );
  }
}
</style>
