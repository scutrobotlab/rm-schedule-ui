<script setup lang="ts">
import { computed } from 'vue'
import moment from 'moment'
import type { BracketMatchCard as MatchCard } from '../../types/bracket'
import type { BracketDensity } from '../../utils/bracket_density'
import BracketTeamRow from './BracketTeamRow.vue'

const props = defineProps<{
  item: MatchCard
  density: BracketDensity
}>()

const statusLabel: Record<string, string> = {
  STARTED: '进行中',
  DONE: '已结束',
  PENDING: '',
  UNKNOWN: '',
}

const showMeta = computed(() => props.density === 'comfortable')
const timeText = computed(() => {
  if (!props.item.planStartedAt) return ''
  const m = moment(props.item.planStartedAt)
  return m.isValid() ? m.format('M/D HH:mm') : ''
})
</script>

<template>
  <article
    class="match-card"
    :class="[`lane-${item.lane}`, `density-${density}`]"
    :data-node-id="item.nodeId"
  >
    <div
      v-if="density !== 'compact'"
      class="card-head"
    >
      <span class="card-title">{{ item.title || `第${item.orderNumber}场` }}</span>
    </div>

    <div class="slot-stack">
      <BracketTeamRow
        :team="item.slots[0]"
        :score="item.redWinGames"
        :density="density"
        :show-score="true"
      />
      <BracketTeamRow
        :team="item.slots[1]"
        :score="item.blueWinGames"
        :density="density"
        :show-score="true"
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
  padding: 8px;
  border-radius: 8px;
  background: rgba(4, 12, 28, 0.28);
  border: 1px solid rgba(120, 170, 220, 0.22);
  border-left-width: 3px;
  border-left-color: rgba(120, 170, 220, 0.6);
  backdrop-filter: blur(10px) saturate(1.15);
  -webkit-backdrop-filter: blur(10px) saturate(1.15);
}

.match-card.lane-gold {
  border-left-color: rgba(220, 180, 90, 0.95);
}

.match-card.density-normal {
  padding: 6px;
}

.match-card.density-compact {
  padding: 4px;
  border-radius: 6px;
}

.slot-stack {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 6px;
}

.card-title {
  min-width: 0;
  font-size: 0.72rem;
  opacity: 0.72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
  font-size: 0.66rem;
  opacity: 0.55;
}

.density-normal .card-head {
  margin-bottom: 4px;
}

.density-normal .card-title {
  font-size: 0.66rem;
}

@media (min-width: 900px) {
  .density-comfortable {
    padding: 10px;
  }

  .density-comfortable .card-title {
    font-size: 0.78rem;
  }
}
</style>
