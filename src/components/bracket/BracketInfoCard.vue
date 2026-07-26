<script setup lang="ts">
import { computed } from 'vue'
import moment from 'moment'
import type { BracketInfoCard as InfoCard, BracketMatchSummary } from '../../types/bracket'
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
    item: InfoCard
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

const nodeTypeLabel: Record<string, string> = {
  promote: '晋级',
  eliminate: '淘汰',
  groupLoop: '小组',
  matchGroup: '对阵',
}

const statusLabel: Record<string, string> = {
  STARTED: '进行中',
  DONE: '已结束',
  PENDING: '未开始',
  UNKNOWN: '待确认',
}

/** 多场对阵按场次完整展示；纵向席位/场次一律不截断 */
const showAsMatches = computed(
  () => props.item.nodeType === 'matchGroup' && props.item.matches.length > 0,
)

/** 2→3 列缩放期间保持挂载，由 --bracket-normal-progress 连续收起。 */
const showMeta = computed(() => props.visibleSpan < 3)
const showSupportRate = computed(() => Math.abs(props.visibleSpan - 1) < 0.001)
const titleTransition = computed(() => resolveBracketTextTransition(
  props.visibleSpan,
  (columns) => shortenBracketTitle(
    props.item.title,
    resolveBracketTitleShortenLevel(columns),
  ),
))

function matchTimeText(m: BracketMatchSummary): string {
  if (!m.planStartedAt) return ''
  const parsed = moment(m.planStartedAt)
  return parsed.isValid() ? parsed.format('M/D HH:mm') : ''
}

function hasMatchMeta(m: BracketMatchSummary): boolean {
  return Boolean(statusLabel[m.status] || m.orderNumber || matchTimeText(m))
}

function supportRate(m: BracketMatchSummary, side: 'red' | 'blue'): number | null {
  if (!m.matchId) return null
  const mpMatch = promotionStore.getMpMatch(m.matchId)
  return mpMatch?.[side === 'red' ? 'redRate' : 'blueRate'] ?? null
}

function groupStat(
  m: BracketMatchSummary,
  side: 'red' | 'blue',
  itemName: GroupRankStatName,
): string {
  const teamName = m.slots[side === 'red' ? 0 : 1].collegeName
  return resolveGroupRankStat(
    promotionStore.groupRank,
    promotionStore.zoneId,
    props.groupName,
    teamName,
    itemName,
  )
}
</script>

<template>
  <article
    class="info-card"
    :class="[
      `lane-${item.lane}`,
      `node-${item.nodeType}`,
      `density-${density}`,
      { 'compact-horizontal': visibleSpan >= 4 },
    ]"
    :data-node-id="item.nodeId"
  >
    <div class="card-head">
      <span
        v-auto-fit-text="{ enabled: textFitEnabled, minFontSize: 8 }"
        class="card-title text-transition"
        :class="{ 'auto-fit-text': textFitEnabled }"
      >
        <span :style="{ opacity: 1 - titleTransition.progress }">{{ titleTransition.from }}</span>
        <span :style="{ opacity: titleTransition.progress }">{{ titleTransition.to }}</span>
      </span>
      <Transition name="group-stats">
        <span
          v-if="showGroupStats && showAsMatches"
          class="group-stats-tools"
        >
          <span>胜场</span>
          <span>对手分</span>
        </span>
      </Transition>
      <span
        v-if="showGroupStats && showAsMatches"
        class="type-tag type-tag--match"
      >{{ nodeTypeLabel[item.nodeType] }}</span>
      <span
        v-else-if="showTypeTag"
        class="type-tag"
      >{{ nodeTypeLabel[item.nodeType] }}</span>
    </div>

    <div
      v-if="showAsMatches"
      class="match-list"
    >
      <div
        v-for="(m, mi) in item.matches"
        :key="`${item.id}-match-${m.orderNumber}-${mi}`"
        class="mini-match"
      >
        <div class="slot-stack">
          <BracketTeamRow
            :team="m.slots[0]"
            :score="m.redWinGames"
            :density="density"
            :visible-span="visibleSpan"
            :text-fit-enabled="textFitEnabled"
            :show-score="true"
            :show-name="showTeamName"
            :show-pending-score="showPendingScore"
            :force-pending-name="forcePendingName"
            :tight-name-score-gap="(titleShortenLevel ?? 0) >= 1"
            side="red"
            :finalized="m.status === 'DONE'"
            :match-source-shorten-level="
              (titleShortenLevel ?? 0) >= 4 ? 3
                : (titleShortenLevel ?? 0) >= 2 ? 2
                  : (titleShortenLevel ?? 0) >= 1 ? 1 : 0
            "
            :show-placeholder-logo="showPlaceholderLogo"
            :show-support-rate="showSupportRate"
            :support-rate="supportRate(m, 'red')"
            :show-group-stats="showGroupStats"
            :win-count="groupStat(m, 'red', '胜场数')"
            :opponent-score="groupStat(m, 'red', '对手分')"
          />
          <BracketTeamRow
            :team="m.slots[1]"
            :score="m.blueWinGames"
            :density="density"
            :visible-span="visibleSpan"
            :text-fit-enabled="textFitEnabled"
            :show-score="true"
            :show-name="showTeamName"
            :show-pending-score="showPendingScore"
            :force-pending-name="forcePendingName"
            :tight-name-score-gap="(titleShortenLevel ?? 0) >= 1"
            side="blue"
            :finalized="m.status === 'DONE'"
            :match-source-shorten-level="
              (titleShortenLevel ?? 0) >= 4 ? 3
                : (titleShortenLevel ?? 0) >= 2 ? 2
                  : (titleShortenLevel ?? 0) >= 1 ? 1 : 0
            "
            :show-placeholder-logo="showPlaceholderLogo"
            :show-support-rate="showSupportRate"
            :support-rate="supportRate(m, 'blue')"
            :show-group-stats="showGroupStats"
            :win-count="groupStat(m, 'blue', '胜场数')"
            :opponent-score="groupStat(m, 'blue', '对手分')"
          />
        </div>
        <div
          v-if="showMeta && hasMatchMeta(m)"
          class="card-meta"
        >
          <span v-if="statusLabel[m.status]">{{ statusLabel[m.status] }}</span>
          <span v-if="m.orderNumber">第{{ m.orderNumber }}场</span>
          <span v-if="matchTimeText(m)">{{ matchTimeText(m) }}</span>
        </div>
      </div>
    </div>

    <div
      v-else
      class="slot-list"
    >
      <BracketTeamRow
        v-for="(slot, si) in item.slots"
        :key="`${item.id}-slot-${si}`"
        :team="slot"
        :score="null"
        :density="density"
        :visible-span="visibleSpan"
        :text-fit-enabled="textFitEnabled"
        :show-score="false"
        :show-name="showTeamName"
        :show-pending-score="showPendingScore"
        :force-pending-name="forcePendingName"
        :align-logo-right="
          visibleSpan >= 6 &&
          (item.nodeType === 'promote' || item.nodeType === 'eliminate')
        "
        :match-source-shorten-level="
          (titleShortenLevel ?? 0) >= 4 ? 3 : (titleShortenLevel ?? 0) >= 2 ? 2 : 0
        "
        :show-placeholder-logo="showPlaceholderLogo"
      />
    </div>
  </article>
</template>

<style scoped>
.info-card {
  position: relative;
  z-index: 1;
  padding: calc(
    8px
    - 2px * var(--bracket-normal-progress, 0)
    - 2px * var(--bracket-compact-progress, 0)
  );
  border-radius: calc(8px - 2px * var(--bracket-compact-progress, 0));
  background:
    linear-gradient(180deg, rgba(162, 205, 240, 0.085) 0%, rgba(22, 50, 78, 0.025) 42%),
    rgba(4, 12, 28, 0.38);
  border: 1px solid rgba(154, 196, 230, 0.23);
  border-left-width: 3px;
  border-left-color: rgba(132, 187, 230, 0.58);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.09),
    inset 0 0 0 1px rgba(190, 220, 244, 0.02),
    0 8px 22px rgba(0, 5, 16, 0.16);
  transition:
    transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1),
    filter 220ms ease-out,
    opacity 220ms ease-out;
  backdrop-filter: blur(22px) saturate(1.28);
  -webkit-backdrop-filter: blur(22px) saturate(1.28);
}

.info-card:active {
  transform: scale(0.975);
  filter: brightness(0.9) saturate(0.94);
  opacity: 0.9;
  transition-duration: 80ms;
  transition-timing-function: ease-out;
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

.info-card.lane-gold {
  border-left-color: #ffc857;
}

.info-card.lane-gold .card-title {
  color: #ffd56a;
  opacity: 1;
  font-weight: 600;
}

.info-card.node-promote {
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

.info-card.node-promote .card-title {
  color: #ffd56a;
  opacity: 1;
  font-weight: 600;
}

.info-card.node-promote .type-tag {
  color: #1a1408;
  background: #ffd56a;
  opacity: var(--bracket-type-tag-opacity, 1);
  font-weight: 700;
}

.info-card.node-eliminate {
  background:
    linear-gradient(180deg, rgba(185, 190, 202, 0.08) 0%, rgba(55, 58, 68, 0.025) 44%),
    rgba(16, 17, 22, 0.42);
  border-color: rgba(148, 151, 163, 0.28);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.085),
    inset 0 0 0 1px rgba(205, 208, 218, 0.02),
    0 8px 22px rgba(0, 0, 4, 0.17);
}

.info-card.node-eliminate :deep(.rank-badge) {
  background: #6b6f76;
  color: rgba(255, 255, 255, 0.85);
  opacity: 0.68;
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
  opacity: 0.78;
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

.type-tag.text-transition > span {
  overflow: visible;
  text-overflow: clip;
}

.match-list,
.slot-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/*
 * 4→5 列时晋级/淘汰节点优先让出横向空间，确保压缩后的「XX胜/XX败」
 * 不被条目自身 padding 和图文 gap 挤掉。
 */
.info-card.node-promote :deep(.team-row),
.info-card.node-eliminate :deep(.team-row) {
  padding-inline: calc(
    8px
    - 2px * var(--bracket-normal-progress, 0)
    - 4px * var(--bracket-compact-progress, 0)
  );
  gap: calc(
    6px
    - 1px * var(--bracket-normal-progress, 0)
    - 3px * var(--bracket-compact-progress, 0)
  );
}

/* 多场纵向分割：仅用上下间距与分隔线，不挤占水平内容区 */
.match-list {
  gap: 0;
}

.mini-match {
  display: flex;
  flex-direction: column;
  padding:
    calc(
      8px
      - 2px * var(--bracket-normal-progress, 0)
      - 1px * var(--bracket-compact-progress, 0)
    )
    0;
}

.mini-match:first-child {
  padding-top: 0;
}

.mini-match:last-child {
  padding-bottom: 0;
}

.mini-match + .mini-match {
  border-top: 1px solid rgba(120, 170, 220, 0.2);
}

.slot-stack {
  display: flex;
  flex-direction: column;
  gap: 3px;
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

.density-compact .mini-match + .mini-match {
  border-top-color: rgba(120, 170, 220, 0.14);
}

.card-head {
  margin-bottom: calc(6px - 2px * var(--bracket-normal-progress, 0));
}

@media (prefers-reduced-motion: reduce) {
  .info-card {
    transition: none;
  }

  .info-card:active {
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
  .info-card {
    background: rgba(7, 18, 36, 0.9);
  }

  .info-card.node-promote {
    background: rgba(40, 29, 11, 0.9);
  }

  .info-card.node-eliminate {
    background: rgba(23, 24, 30, 0.92);
  }
}

@media (min-width: 900px) {
  .info-card {
    padding: calc(
      10px
      - 4px * var(--bracket-normal-progress, 0)
      - 2px * var(--bracket-compact-progress, 0)
    );
  }

  .mini-match {
    padding:
      calc(
        10px
        - 4px * var(--bracket-normal-progress, 0)
        - 1px * var(--bracket-compact-progress, 0)
      )
      0;
  }

  .card-title {
    font-size: calc(
      0.78rem
      - 0.12rem * var(--bracket-normal-progress, 0)
      - 0.02rem * var(--bracket-compact-progress, 0)
    );
  }
}

.info-card.compact-horizontal.node-promote,
.info-card.compact-horizontal.node-eliminate {
  padding-inline: calc(
    4px
    - 1px * var(--bracket-compact-progress, 0)
  );
}

.info-card.compact-horizontal.node-promote :deep(.team-row),
.info-card.compact-horizontal.node-eliminate :deep(.team-row) {
  padding-inline: calc(
    4px
    - 1px * var(--bracket-compact-progress, 0)
  );
  gap: calc(
    3px
    - 1px * var(--bracket-compact-progress, 0)
  );
}
</style>
