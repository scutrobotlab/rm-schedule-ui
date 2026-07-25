<script setup lang="ts">
import { computed } from 'vue'
import type { BracketTeamSlot } from '../../types/bracket'
import {
  resolveBracketDensity,
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

const props = withDefaults(
  defineProps<{
    team: BracketTeamSlot
    score: number | null
    density: BracketDensity
    visibleSpan?: number
    showScore: boolean
    /** ≥6 列时为 false */
    showName?: boolean
    /** 是否显示未确定席位的占位比分；真实队伍比分不受影响 */
    showPendingScore?: boolean
    /** 即使校名被隐藏，也强制显示未确定席位的来源文字 */
    forcePendingName?: boolean
    /** 收紧文字与比分的间距，为较长名次留出空间 */
    tightNameScoreGap?: boolean
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
  }>(),
  {
    showName: true,
    showPendingScore: true,
    forcePendingName: false,
    tightNameScoreGap: false,
    side: null,
    placeholderSide: null,
    medal: null,
    finalized: true,
    matchSourceShortenLevel: 0,
    showPlaceholderLogo: true,
    visibleSpan: undefined,
  },
)

function logoSrc(url: string | undefined): string | undefined {
  if (!url) return undefined
  return StaticCDN(`${url}?process=bg_white`)
}

function sourceLevelForColumns(columns: number): BracketSourceShortenLevel {
  const titleLevel = resolveBracketTitleShortenLevel(columns)
  if (titleLevel >= 4) return 3
  if (titleLevel >= 2) return 2
  if (titleLevel >= 1) return 1
  return 0
}

const displayName = computed(() => {
  if (props.team.sourceKind === 'team') {
    return { from: props.team.displayName, to: props.team.displayName, progress: 0 }
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
const shouldShowName = computed(
  () => props.showName || (props.forcePendingName && isPending.value),
)
const shouldShowScore = computed(
  () => props.showScore && (!isPending.value || props.showPendingScore),
)
</script>

<template>
  <div
    class="team-row"
    :class="{
      winner: finalized && team.isWinner && !medal,
      loser: finalized && team.isLoser && !medal,
      pending: team.sourceKind !== 'team',
      'tight-name-score-gap': tightNameScoreGap,
      [`side-${side}`]: Boolean(side),
      [`medal-${medal}`]: Boolean(medal),
      [`density-${density}`]: true,
    }"
  >
    <span
      v-if="team.groupRank != null"
      class="rank-badge"
    >{{ team.groupRank }}</span>

    <img
      v-if="team.sourceKind === 'team' && team.collegeLogo"
      class="team-logo"
      :src="logoSrc(team.collegeLogo)"
      alt=""
      loading="lazy"
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
      v-if="shouldShowName"
      class="team-name text-transition"
      :title="team.sourceLabel || team.displayName"
    >
      <span :style="{ opacity: 1 - displayName.progress }">{{ displayName.from || '—' }}</span>
      <span :style="{ opacity: displayName.progress }">{{ displayName.to || '—' }}</span>
    </span>
    <span
      v-else
      class="team-name-spacer"
      :title="team.sourceLabel || team.displayName"
    />

    <span
      v-if="shouldShowScore && score != null"
      class="team-score"
      :class="{ 'pending-score': isPending }"
    >{{ score }}</span>
  </div>
</template>

<style scoped>
.team-row {
  display: flex;
  align-items: center;
  gap: calc(
    6px
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
  background: rgba(255, 255, 255, 0.05);
}

.team-row.side-red {
  border-left: 3px solid #e53935;
}

.team-row.side-blue {
  border-left: 3px solid #1e88e5;
}

.team-row.winner {
  background: rgba(46, 120, 88, 0.42);
}

.team-row.loser {
  opacity: 0.52;
}

.team-row.loser.side-red {
  border-left-color: #8a4a48;
}

.team-row.loser.side-blue {
  border-left-color: #4a6a8a;
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

.team-logo.pending-logo {
  max-width: calc(22px * var(--bracket-placeholder-opacity, 1));
  opacity: var(--bracket-placeholder-opacity, 1);
  transform: scale(var(--bracket-placeholder-opacity, 1));
}

.team-logo.placeholder {
  opacity: 0.7;
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
