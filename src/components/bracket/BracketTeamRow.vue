<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { BracketTeamSlot } from '../../types/bracket'
import {
  resolveBracketDensity,
  resolveBracketTeamDisplayName,
  resolveBracketTextTransition,
  resolveBracketTitleShortenLevel,
  shortenBracketSourceLabel,
  type BracketDensity,
  type BracketSourceShortenLevel,
} from '../../utils/bracket_density'
import { StaticCDN } from '../../utils/cdn'
import schoolBlue from '@/assets/school_blue.png'
import schoolGrey from '@/assets/school_grey.png'
import schoolRed from '@/assets/school_red.png'
import { usePromotionStore } from '../../stores/promotion'
import { vAutoFitText } from '../../directives/auto_fit_text'

const props = withDefaults(
  defineProps<{
    team: BracketTeamSlot
    score: number | null
    density: BracketDensity
    visibleSpan?: number
    /** 缩放/吸附结束后才对未确定席位执行完整文字适配 */
    textFitEnabled?: boolean
    showScore: boolean
    /** ≥5 列时为 false */
    showName?: boolean
    /** 是否显示未确定席位的占位比分；真实队伍比分不受影响 */
    showPendingScore?: boolean
    /** 即使校名被隐藏，也强制显示未确定席位的来源文字 */
    forcePendingName?: boolean
    /** 收紧文字与比分的间距，为较长名次留出空间 */
    tightNameScoreGap?: boolean
    /** 无校名/比分的结果席位中，将真实校徽靠右显示 */
    alignLogoRight?: boolean
    /** 对阵红蓝方；排名席位等非对阵不传 */
    side?: 'red' | 'blue' | null
    /** 占位 R logo 的颜色，可与奖牌卡的边框阵营样式解耦 */
    placeholderSide?: 'red' | 'blue' | null
    /** 冠亚季：金 / 银 / 铜（覆盖默认绿色胜者） */
    medal?: 'gold' | 'silver' | 'bronze' | null
    /** 仅比赛结束后显示胜负造成的高亮 / 灰化 */
    finalized?: boolean
    /** 0=完整；1=保留胜/败者；2=进一步去掉「者」；3=第N名缩为第N */
    matchSourceShortenLevel?: BracketSourceShortenLevel
    /** 是否显示未确定队伍的红蓝 R；真实校徽不受此项影响 */
    showPlaceholderLogo?: boolean
    /** 小程序支持率，范围 0–1；无有效数据时不展示 */
    supportRate?: number | null
    /** 仅由单列 Bracket 开启 */
    showSupportRate?: boolean
    showGroupStats?: boolean
    winCount?: string
    opponentScore?: string
  }>(),
  {
    showName: true,
    showPendingScore: true,
    forcePendingName: false,
    tightNameScoreGap: false,
    alignLogoRight: false,
    side: null,
    placeholderSide: null,
    medal: null,
    finalized: true,
    matchSourceShortenLevel: 0,
    showPlaceholderLogo: true,
    supportRate: null,
    showSupportRate: false,
    showGroupStats: false,
    winCount: '—',
    opponentScore: '—',
    visibleSpan: undefined,
    textFitEnabled: true,
  },
)

const promotionStore = usePromotionStore()
const logoLoaded = ref(false)
const logoFailed = ref(false)

function logoSrc(url: string | undefined): string | undefined {
  if (!url) return undefined
  return StaticCDN(`${url}?process=bg_white`)
}

const teamLogoSrc = computed(() => logoSrc(props.team.collegeLogo))
const isDataLoading = computed(
  () => !promotionStore.schedule.data?.event?.zones?.nodes,
)

watch(teamLogoSrc, () => {
  logoLoaded.value = false
  logoFailed.value = false
}, { immediate: true })

function sourceLevelForColumns(columns: number): BracketSourceShortenLevel {
  const titleLevel = resolveBracketTitleShortenLevel(columns)
  if (titleLevel >= 4) return 3
  if (titleLevel >= 2) return 2
  if (titleLevel >= 1) return 1
  return 0
}

const displayName = computed(() => {
  if (props.team.sourceKind === 'team') {
    const fullName = props.team.collegeName ?? props.team.displayName
    const value = resolveBracketTeamDisplayName(
      fullName,
      promotionStore.teamAbbreviations[fullName],
      props.visibleSpan,
    )
    return { from: value, to: value, progress: 0 }
  }
  if (props.visibleSpan == null) {
    const value = shortenBracketSourceLabel(
      props.team.displayName,
      props.density,
      props.matchSourceShortenLevel,
    )
    return { from: value, to: value, progress: 0 }
  }
  return resolveBracketTextTransition(props.visibleSpan, (columns) => (
    shortenBracketSourceLabel(
      props.team.displayName,
      resolveBracketDensity(columns),
      sourceLevelForColumns(columns),
    )
  ))
})

const isPending = computed(() => props.team.sourceKind !== 'team')
const isSingleColumnTeam = computed(() => (
  props.team.sourceKind === 'team' &&
  props.visibleSpan != null &&
  Math.abs(props.visibleSpan - 1) < 0.001
))
const isTwoColumnTeam = computed(() => (
  props.team.sourceKind === 'team' &&
  props.visibleSpan != null &&
  props.visibleSpan >= 2 &&
  props.visibleSpan < 3
))
const isThreeColumnAbbreviation = computed(() => {
  if (
    props.team.sourceKind !== 'team' ||
    props.visibleSpan == null ||
    props.visibleSpan < 3 ||
    props.visibleSpan >= 4
  ) {
    return false
  }
  const fullName = props.team.collegeName ?? props.team.displayName
  return Boolean(promotionStore.teamAbbreviations[fullName])
})
const isFourOrFiveColumnAbbreviation = computed(() => {
  if (
    props.team.sourceKind !== 'team' ||
    props.visibleSpan == null ||
    props.visibleSpan < 4 ||
    props.visibleSpan >= 6
  ) {
    return false
  }
  const fullName = props.team.collegeName ?? props.team.displayName
  return Boolean(promotionStore.teamAbbreviations[fullName])
})
/** 单列校名、二列校名及三至五列简称始终适配；缩放暂停只影响未确定席位。 */
const autoFitActive = computed(() => (
  isSingleColumnTeam.value ||
  isTwoColumnTeam.value ||
  isThreeColumnAbbreviation.value ||
  isFourOrFiveColumnAbbreviation.value ||
  (isPending.value && props.textFitEnabled)
))
const autoFitMinFontSize = computed(
  () => isPending.value && !isThreeColumnAbbreviation.value ? 7 : 0,
)
const normalizedSupportRate = computed(() => {
  if (
    !props.showSupportRate ||
    props.medal ||
    props.team.sourceKind !== 'team' ||
    typeof props.supportRate !== 'number' ||
    !Number.isFinite(props.supportRate) ||
    props.supportRate < 0
  ) {
    return null
  }
  return Math.min(1, props.supportRate)
})
const supportRateStyle = computed(() => ({
  width: `${(normalizedSupportRate.value ?? 0) * 100}%`,
}))
const supportRateText = computed(() => (
  normalizedSupportRate.value == null
    ? ''
    : `${(normalizedSupportRate.value * 100).toFixed(1)}%`
))
const shouldShowName = computed(
  () => props.showName || (props.forcePendingName && isPending.value),
)
const shouldShowScore = computed(
  () => props.showScore && (!isPending.value || props.showPendingScore),
)
const useExtraTightScoreGap = computed(
  () => props.visibleSpan != null && props.visibleSpan >= 4,
)
const useCompactScoreFont = computed(() => (
  props.visibleSpan != null &&
  props.visibleSpan >= 5 &&
  props.visibleSpan < 7
))
const useFiveColumnNameLayout = computed(() => (
  props.visibleSpan != null &&
  props.visibleSpan >= 5 &&
  props.visibleSpan < 6
))
const hideNameEllipsis = computed(
  () => props.visibleSpan != null && props.visibleSpan >= 3,
)
const useTightEdgePadding = computed(
  () => props.visibleSpan != null && props.visibleSpan >= 4,
)
const useCompactTeamSlots = computed(() => (
  props.visibleSpan != null &&
  props.visibleSpan >= 5 &&
  props.team.sourceKind === 'team' &&
  !shouldShowName.value
))
const isTeamNameTransitioning = computed(() => (
  props.visibleSpan != null &&
  props.visibleSpan >= 4 &&
  props.visibleSpan < 5 &&
  props.team.sourceKind === 'team'
))
const isShortMatchSource = computed(() => (
  isPending.value &&
  /^\d+[胜败]$/.test(displayName.value.to || displayName.value.from)
))
</script>

<template>
  <div
    class="team-row"
    :class="{
      winner: finalized && team.isWinner && !medal,
      loser: finalized && team.isLoser && !medal,
      pending: team.sourceKind !== 'team',
      'has-support-rate': normalizedSupportRate != null,
      'group-stats': showGroupStats,
      'tight-name-score-gap': tightNameScoreGap,
      'extra-tight-score-gap': useExtraTightScoreGap,
      'compact-score-font': useCompactScoreFont,
      'five-column-name-layout': useFiveColumnNameLayout,
      'hide-name-ellipsis': hideNameEllipsis,
      'tight-edge-padding': useTightEdgePadding,
      'compact-team-slots': useCompactTeamSlots,
      'team-name-transitioning': isTeamNameTransitioning,
      'logo-right': alignLogoRight && team.sourceKind === 'team',
      [`side-${side}`]: Boolean(side),
      [`medal-${medal}`]: Boolean(medal),
      [`density-${density}`]: true,
    }"
  >
    <Transition name="support-rate-fill">
      <span
        v-if="normalizedSupportRate != null"
        class="support-rate-fill"
        :style="supportRateStyle"
        aria-hidden="true"
      />
    </Transition>
    <Transition name="support-rate-text">
      <span
        v-if="normalizedSupportRate != null"
        class="support-rate-text"
      >{{ supportRateText }}</span>
    </Transition>

    <span
      v-if="!isDataLoading && team.groupRank != null"
      class="rank-badge"
    >{{ team.groupRank }}</span>

    <span
      v-if="isDataLoading && (showPlaceholderLogo || showName)"
      class="team-logo team-logo-skeleton skeleton-pulse"
      aria-hidden="true"
    />
    <img
      v-else-if="team.sourceKind === 'team' && teamLogoSrc && !logoFailed"
      class="team-logo"
      :class="{ 'logo-loading skeleton-pulse': !logoLoaded }"
      :src="teamLogoSrc"
      alt=""
      loading="lazy"
      @load="logoLoaded = true"
      @error="logoFailed = true"
    />
    <img
      v-else-if="team.sourceKind === 'team'"
      class="team-logo placeholder"
      :src="schoolGrey"
      alt=""
    />
    <img
      v-else-if="showPlaceholderLogo && (placeholderSide || side)"
      class="team-logo pending-logo"
      :src="(placeholderSide || side) === 'red' ? schoolRed : schoolBlue"
      alt=""
    />

    <span
      v-if="isDataLoading && shouldShowName"
      class="team-name-skeleton skeleton-pulse"
      aria-hidden="true"
    />
    <span
      v-else-if="shouldShowName"
      v-auto-fit-text="{
        enabled: autoFitActive,
        minFontSize: autoFitMinFontSize,
      }"
      class="team-name text-transition"
      :class="{
        'auto-fit-text': autoFitActive,
        'short-match-source': isShortMatchSource && textFitEnabled,
      }"
      :title="team.sourceKind === 'team'
        ? (team.collegeName || team.displayName)
        : (team.sourceLabel || team.displayName)"
    >
      <span :style="{ opacity: 1 - displayName.progress }">{{ displayName.from || '—' }}</span>
      <span :style="{ opacity: displayName.progress }">{{ displayName.to || '—' }}</span>
    </span>
    <span
      v-else
      class="team-name-spacer"
      :title="team.sourceKind === 'team'
        ? (team.collegeName || team.displayName)
        : (team.sourceLabel || team.displayName)"
    />

    <Transition name="team-stat">
      <span
        v-if="showGroupStats"
        class="team-stat"
      >{{ winCount }}</span>
    </Transition>
    <Transition name="team-stat">
      <span
        v-if="showGroupStats"
        class="team-stat"
      >{{ opponentScore }}</span>
    </Transition>

    <span
      v-if="isDataLoading && showScore"
      class="team-score-skeleton skeleton-pulse"
      aria-hidden="true"
    />
    <span
      v-else-if="shouldShowScore && score != null"
      class="team-score"
      :class="{ 'pending-score': isPending }"
    >{{ score }}</span>
  </div>
</template>

<style scoped>
.team-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: calc(
    4px
    - 1px * var(--bracket-normal-progress, 0)
    - 1px * var(--bracket-compact-progress, 0)
  );
  min-width: 0;
  min-height: calc(
    34px
    - 6px * var(--bracket-normal-progress, 0)
    - 4px * var(--bracket-compact-progress, 0)
  );
  padding:
    calc(
      4px
      - 1px * var(--bracket-normal-progress, 0)
      - 1px * var(--bracket-compact-progress, 0)
    )
    calc(
      8px
      - 2px * var(--bracket-normal-progress, 0)
      - 1px * var(--bracket-compact-progress, 0)
  );
  border-radius: 4px;
  background:
    linear-gradient(180deg, rgba(210, 232, 248, 0.055), rgba(255, 255, 255, 0.025));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.035),
    inset 0 0 0 1px rgba(190, 220, 244, 0.018);
  overflow: hidden;
}

.team-row > :not(.support-rate-fill) {
  position: relative;
  z-index: 1;
}

.team-row > .team-logo,
.team-row > .team-logo-skeleton,
.team-row > .team-name,
.team-row > .team-name-skeleton,
.team-row > .team-name-spacer,
.team-row > .team-score,
.team-row > .team-score-skeleton {
  align-self: center;
}

.team-row.compact-team-slots {
  display: flex;
  justify-content: space-evenly;
  gap: 3px;
}

.team-row.compact-team-slots > .team-name-spacer {
  display: none;
}

.team-row.compact-team-slots > .team-score,
.team-row.compact-team-slots > .team-score-skeleton {
  margin-left: 0;
}

.team-row.compact-team-slots.logo-right .team-logo {
  order: initial;
  margin-left: 0;
}

.team-row.team-name-transitioning > .team-name,
.team-row.team-name-transitioning > .team-name-spacer {
  flex-basis: calc(
    12rem
    - 12rem * var(--bracket-compact-progress, 0)
  );
  max-width: calc(
    12rem
    - 12rem * var(--bracket-compact-progress, 0)
  );
  opacity: calc(1 - var(--bracket-compact-progress, 0));
  transform:
    translateX(calc(-3px * var(--bracket-compact-progress, 0)))
    scaleX(calc(1 - 0.08 * var(--bracket-compact-progress, 0)));
  transform-origin: left center;
  transition: none;
}

.team-row.tight-edge-padding {
  padding-inline: calc(
    4px
    - 1px * var(--bracket-compact-progress, 0)
  );
}

.support-rate-fill {
  position: absolute;
  z-index: 0;
  inset: 0 auto 0 0;
  border-radius: 0 3px 3px 0;
  opacity: 1;
  transform: scaleX(1);
  transform-origin: left center;
  will-change: transform, opacity;
  pointer-events: none;
}

.support-rate-fill-enter-active,
.support-rate-fill-leave-active {
  transition:
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 240ms ease;
}

.support-rate-fill-enter-from,
.support-rate-fill-leave-to {
  opacity: 0;
  transform: scaleX(0);
}

.side-red .support-rate-fill {
  background: linear-gradient(
    90deg,
    rgba(var(--side-color), 1) 0,
    rgba(var(--side-color), 0.58) 8px,
    rgba(var(--side-color), 0.38) 28px,
    rgba(var(--side-color), 0.28) 100%
  );
}

.side-blue .support-rate-fill {
  background: linear-gradient(
    90deg,
    rgba(var(--side-color), 1) 0,
    rgba(var(--side-color), 0.58) 8px,
    rgba(var(--side-color), 0.38) 28px,
    rgba(var(--side-color), 0.28) 100%
  );
}

.team-row > .support-rate-text {
  position: absolute;
  z-index: 0;
  top: 50%;
  left: 11px;
  width: 3rem;
  max-width: 3rem;
  overflow: hidden;
  font-size: 0.72rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-align: left;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  transform: translateY(-50%);
  will-change: transform, opacity;
}

.support-rate-text-enter-active,
.support-rate-text-leave-active {
  transition:
    opacity 220ms ease,
    transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.support-rate-text-enter-from,
.support-rate-text-leave-to {
  opacity: 0;
  transform: translate(-6px, -50%);
}

.team-row > .rank-badge,
.team-row > .team-logo,
.team-row > .team-name,
.team-row > .team-name-spacer {
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.team-row.has-support-rate > .rank-badge,
.team-row.has-support-rate > .team-logo,
.team-row.has-support-rate > .team-name,
.team-row.has-support-rate > .team-name-spacer {
  transform: translateX(3rem);
}

.team-row.has-support-rate.group-stats > .team-name,
.team-row.has-support-rate.group-stats > .team-name-spacer {
  margin-right: 2.2rem;
}

.side-red .support-rate-text {
  color: #ff8a86;
}

.side-blue .support-rate-text {
  color: #77bfff;
}

.team-row.side-red {
  --side-color: 229, 57, 53;
  border-left: 3px solid rgb(var(--side-color));
}

.team-row.side-blue {
  --side-color: 30, 136, 229;
  border-left: 3px solid rgb(var(--side-color));
}

.team-row.has-support-rate.side-red,
.team-row.has-support-rate.side-blue {
  border-left: 0;
  padding-left: calc(
    11px
    - 2px * var(--bracket-normal-progress, 0)
    - 1px * var(--bracket-compact-progress, 0)
  );
}

.team-row.winner.side-red {
  background: hsla(2, 36%, 35%, 0.42);
}

.team-row.winner.side-blue {
  background: hsla(212, 36%, 35%, 0.42);
}

.team-row.loser {
  opacity: 0.52;
}

.team-row.loser.side-red {
  --side-color: 138, 74, 72;
}

.team-row.loser.side-blue {
  --side-color: 74, 106, 138;
}

.team-row.medal-gold {
  background: rgba(212, 160, 48, 0.48);
  box-shadow: inset 0 0 0 1px rgba(255, 213, 106, 0.35);
  animation: medal-shimmer-gold 3.6s ease-in-out infinite;
}

.team-row.medal-silver {
  background: rgba(160, 172, 188, 0.42);
  box-shadow: inset 0 0 0 1px rgba(210, 220, 235, 0.35);
  animation: medal-shimmer-silver 3.6s ease-in-out infinite;
}

.team-row.medal-bronze {
  background: rgba(176, 112, 64, 0.46);
  box-shadow: inset 0 0 0 1px rgba(224, 168, 120, 0.35);
  animation: medal-shimmer-bronze 3.6s ease-in-out infinite;
}

@keyframes medal-shimmer-gold {
  0%,
  100% {
    background: rgba(212, 160, 48, 0.4);
    box-shadow:
      inset 0 0 0 1px rgba(255, 213, 106, 0.28),
      0 0 0 0 rgba(255, 213, 106, 0);
  }
  50% {
    background: rgba(240, 190, 70, 0.62);
    box-shadow:
      inset 0 0 0 1px rgba(255, 230, 150, 0.55),
      0 0 10px 1px rgba(255, 200, 80, 0.35);
  }
}

@keyframes medal-shimmer-silver {
  0%,
  100% {
    background: rgba(160, 172, 188, 0.36);
    box-shadow:
      inset 0 0 0 1px rgba(210, 220, 235, 0.28),
      0 0 0 0 rgba(200, 210, 225, 0);
  }
  50% {
    background: rgba(200, 210, 225, 0.58);
    box-shadow:
      inset 0 0 0 1px rgba(235, 240, 250, 0.55),
      0 0 10px 1px rgba(200, 215, 235, 0.32);
  }
}

@keyframes medal-shimmer-bronze {
  0%,
  100% {
    background: rgba(176, 112, 64, 0.38);
    box-shadow:
      inset 0 0 0 1px rgba(224, 168, 120, 0.28),
      0 0 0 0 rgba(200, 130, 70, 0);
  }
  50% {
    background: rgba(200, 135, 80, 0.58);
    box-shadow:
      inset 0 0 0 1px rgba(235, 185, 140, 0.55),
      0 0 10px 1px rgba(200, 130, 70, 0.3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-pulse {
    animation: none;
    opacity: 0.62;
  }

  .support-rate-fill-enter-active,
  .support-rate-fill-leave-active,
  .support-rate-text-enter-active,
  .support-rate-text-leave-active,
  .team-stat-enter-active,
  .team-stat-leave-active,
  .team-row > .rank-badge,
  .team-row > .team-logo,
  .team-row > .team-name,
  .team-row > .team-name-spacer {
    transition: none;
  }

  .team-row.medal-gold,
  .team-row.medal-silver,
  .team-row.medal-bronze {
    animation: none;
  }
}

.team-row.pending {
  background: rgba(255, 255, 255, 0.03);
}

.team-logo {
  display: block;
  flex: 0 0 auto;
  width: calc(
    22px
    - 4px * var(--bracket-normal-progress, 0)
    - 4px * var(--bracket-compact-progress, 0)
  );
  height: calc(
    22px
    - 4px * var(--bracket-normal-progress, 0)
    - 4px * var(--bracket-compact-progress, 0)
  );
  border-radius: 50%;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.85);
}

.team-logo.logo-loading,
.team-logo-skeleton {
  background: rgba(190, 210, 232, 0.18);
}

.team-logo.logo-loading {
  object-position: -9999px -9999px;
}

.team-name-skeleton {
  flex: 1 1 auto;
  width: min(56%, 7rem);
  max-width: 7rem;
  height: 0.62em;
  border-radius: 999px;
  background: rgba(190, 210, 232, 0.15);
}

.team-score-skeleton {
  flex: 0 0 1.1rem;
  width: 1.1rem;
  height: 0.62em;
  border-radius: 999px;
  background: rgba(190, 210, 232, 0.13);
}

.skeleton-pulse {
  animation: skeleton-pulse 1.35s ease-in-out infinite alternate;
}

@keyframes skeleton-pulse {
  from {
    opacity: 0.42;
  }

  to {
    opacity: 0.82;
  }
}

.team-logo.pending-logo {
  max-width: calc(22px * var(--bracket-placeholder-opacity, 1));
  opacity: var(--bracket-placeholder-opacity, 1);
  transform: scale(var(--bracket-placeholder-opacity, 1));
}

.team-logo.placeholder {
  opacity: 0.7;
}

.team-row.logo-right .team-logo {
  order: 2;
  margin-left: auto;
}

.rank-badge {
  flex: 0 0 1.75em;
  width: 1.75em;
  box-sizing: border-box;
  padding: 1px 0;
  border-radius: 3px;
  font-size: 0.68rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: center;
  color: #fff;
  background: #e7a662;
}

.team-name {
  flex: 1 1 auto;
  min-width: 0;
  font-size: calc(
    0.84rem
    - 0.08rem * var(--bracket-normal-progress, 0)
    - 0.08rem * var(--bracket-compact-progress, 0)
  );
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-name.short-match-source {
  flex: 0 0 auto;
  overflow: visible;
  text-overflow: clip;
}

.team-name.short-match-source > span {
  overflow: visible;
  text-overflow: clip;
}

.team-name.auto-fit-text,
.team-name.auto-fit-text > span {
  text-overflow: clip;
}

.team-name.auto-fit-text {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.team-name.auto-fit-text > span {
  overflow: visible;
}

.team-row.pending .team-name.auto-fit-text {
  transition:
    transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
    font-size 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .team-row.pending .team-name.auto-fit-text {
    transition: none;
  }
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

.team-row.hide-name-ellipsis .team-name,
.team-row.hide-name-ellipsis .team-name > span {
  text-overflow: clip;
}

.team-name-spacer {
  flex: 1 1 auto;
  min-width: 0;
}

.team-score {
  flex: 0 0 auto;
  flex-shrink: 0;
  min-width: 1.1em;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-size: calc(
    0.9rem
    - 0.02rem * var(--bracket-normal-progress, 0)
    - 0.02rem * var(--bracket-compact-progress, 0)
  );
  line-height: 1;
  text-align: right;
  /* 缩放/紧凑密度下也保证比分完整可读，不被挤掉 */
  overflow: visible;
}

.team-row.compact-score-font .team-score {
  font-size: 0.76rem;
}

.team-row.five-column-name-layout .team-name {
  font-size: 0.64rem;
}

.team-row.five-column-name-layout .team-score {
  margin-left: 0;
}

.team-stat {
  position: relative;
  z-index: 1;
  flex: 0 0 2rem;
  width: 2rem;
  color: rgba(236, 243, 252, 0.88);
  font-size: 0.76rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-align: center;
}

.team-stat + .team-stat {
  margin-left: 0;
}

.team-stat-enter-active {
  transition:
    opacity 220ms ease,
    transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.team-stat-leave-active {
  position: absolute;
  opacity: 0;
  transition: none;
  pointer-events: none;
}

.team-stat-enter-from,
.team-stat-leave-to {
  opacity: 0;
  transform: translateX(6px);
}

.team-row.group-stats .team-score {
  flex: 0 0 1.8rem;
  width: 1.8rem;
  margin-left: -4px;
  text-align: center;
}

.team-score.pending-score {
  min-width: 0;
  max-width: calc(1.1em * var(--bracket-pending-score-opacity, 1));
  opacity: var(--bracket-pending-score-opacity, 1);
  overflow: hidden;
  transform: scale(var(--bracket-pending-score-opacity, 1));
}

.team-row.tight-name-score-gap .team-score {
  margin-left: -4px;
}

.team-row.extra-tight-score-gap .team-score {
  margin-left: -8px;
}

.density-normal.side-red,
.density-normal.side-blue {
  border-left-width: 2px;
}

.density-normal .rank-badge {
  flex-basis: 1.6em;
  width: 1.6em;
  font-size: 0.6rem;
}

.density-compact.side-red,
.density-compact.side-blue {
  border-left-width: 2px;
}

.density-compact .rank-badge {
  flex-basis: 1.5em;
  width: 1.5em;
  font-size: 0.56rem;
}

@media (min-width: 900px) {
  .team-name {
    font-size: calc(
      0.92rem
      - 0.16rem * var(--bracket-normal-progress, 0)
      - 0.08rem * var(--bracket-compact-progress, 0)
    );
  }

  .team-logo {
    width: calc(
      26px
      - 8px * var(--bracket-normal-progress, 0)
      - 4px * var(--bracket-compact-progress, 0)
    );
    height: calc(
      26px
      - 8px * var(--bracket-normal-progress, 0)
      - 4px * var(--bracket-compact-progress, 0)
    );
  }

  .team-logo.pending-logo {
    max-width: calc(26px * var(--bracket-placeholder-opacity, 1));
  }
}
</style>
