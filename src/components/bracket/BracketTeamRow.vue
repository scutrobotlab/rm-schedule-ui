<script setup lang="ts">
import type { BracketTeamSlot } from '../../types/bracket'
import type { BracketDensity } from '../../utils/bracket_density'
import { StaticCDN } from '../../utils/cdn'
import schoolGrey from '@/assets/school_grey.png'

defineProps<{
  team: BracketTeamSlot
  score: number | null
  density: BracketDensity
  showScore: boolean
}>()

function logoSrc(url: string | undefined): string | undefined {
  if (!url) return undefined
  return StaticCDN(`${url}?process=bg_white`)
}
</script>

<template>
  <div
    class="team-row"
    :class="{
      winner: team.isWinner,
      loser: team.isLoser,
      pending: team.sourceKind !== 'team',
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
      class="team-name"
      :title="team.sourceLabel || team.displayName"
    >{{ team.displayName || '—' }}</span>

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

.team-score {
  flex: 0 0 auto;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-size: 0.9rem;
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
  font-size: 0.72rem;
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
