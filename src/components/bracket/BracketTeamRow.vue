<script setup lang="ts">
import type { BracketTeamSlot } from '../../types/bracket'
import type { BracketDensity } from '../../utils/bracket_density'
import { StaticCDN } from '../../utils/cdn'
import schoolGrey from '@/assets/school_grey.png'

withDefaults(
  defineProps<{
    team: BracketTeamSlot
    score: number | null
    density: BracketDensity
    showScore: boolean
    /** ≥6 列时为 false */
    showName?: boolean
    /** 冠亚季：金 / 银 / 铜（覆盖默认绿色胜者） */
    medal?: 'gold' | 'silver' | 'bronze' | null
  }>(),
  { showName: true, medal: null },
)

function logoSrc(url: string | undefined): string | undefined {
  if (!url) return undefined
  return StaticCDN(`${url}?process=bg_white`)
}
</script>

<template>
  <div
    class="team-row"
    :class="{
      winner: team.isWinner && !medal,
      loser: team.isLoser && !medal,
      pending: team.sourceKind !== 'team',
      [`medal-${medal}`]: Boolean(medal),
      [`density-${density}`]: true,
    }"
  >
    <span
      v-if="team.groupRank != null"
      class="rank-badge"
    >{{ team.groupRank }}</span>
    <span
      v-else-if="team.sourceKind !== 'team'"
      class="source-badge"
      :class="team.sourceKind"
    >
      {{ team.sourceKind === 'rank' ? '种子' : '来源' }}
    </span>

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

    <span
      v-if="showName"
      class="team-name"
      :title="team.sourceLabel || team.displayName"
    >{{ team.displayName || '—' }}</span>
    <span
      v-else
      class="team-name-spacer"
      :title="team.sourceLabel || team.displayName"
    />

    <span
      v-if="showScore && score != null"
      class="team-score"
    >{{ score }}</span>
  </div>
</template>

<style scoped>
.team-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  min-height: 34px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
}

.team-row.winner {
  background: rgba(46, 120, 88, 0.42);
}

.team-row.loser {
  opacity: 0.52;
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
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.85);
}

.team-logo.placeholder {
  opacity: 0.7;
}

.source-badge {
  flex: 0 0 auto;
  font-size: 0.58rem;
  letter-spacing: 0.04em;
  opacity: 0.45;
  min-width: 1.8em;
}

.source-badge.rank {
  color: #9ec8ff;
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
  font-size: 0.84rem;
  white-space: nowrap;
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
  font-size: 0.9rem;
  line-height: 1;
  text-align: right;
  /* 缩放/紧凑密度下也保证比分完整可读，不被挤掉 */
  overflow: visible;
}

.density-normal .team-logo {
  width: 18px;
  height: 18px;
}

.density-normal {
  min-height: 28px;
  padding: 3px 6px;
  gap: 5px;
}

.density-normal .team-name {
  font-size: 0.76rem;
}

.density-normal .team-score {
  font-size: 0.88rem;
}

.density-normal .source-badge {
  display: none;
}

.density-normal .rank-badge {
  flex-basis: 1.6em;
  width: 1.6em;
  font-size: 0.6rem;
}

.density-compact {
  min-height: 24px;
  padding: 2px 5px;
  gap: 4px;
}

.density-compact .team-logo {
  width: 14px;
  height: 14px;
}

.density-compact .team-name {
  font-size: 0.68rem;
}

.density-compact .team-score {
  /* 紧凑时仍保持可读字号，保证比分完整显示 */
  font-size: 0.86rem;
}

.density-compact .source-badge {
  display: none;
}

.density-compact .rank-badge {
  flex-basis: 1.5em;
  width: 1.5em;
  font-size: 0.56rem;
}

@media (min-width: 900px) {
  .density-comfortable .team-name {
    font-size: 0.92rem;
  }

  .density-comfortable .team-logo {
    width: 26px;
    height: 26px;
  }
}
</style>
