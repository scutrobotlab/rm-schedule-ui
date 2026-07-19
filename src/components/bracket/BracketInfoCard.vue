<script setup lang="ts">
import { computed } from 'vue'
import type { BracketInfoCard as InfoCard } from '../../types/bracket'
import type { BracketDensity } from '../../utils/bracket_density'
import BracketTeamRow from './BracketTeamRow.vue'

const props = defineProps<{
  item: InfoCard
  density: BracketDensity
}>()

const nodeTypeLabel: Record<string, string> = {
  promote: '晋级',
  eliminate: '淘汰',
  groupLoop: '小组',
  matchGroup: '对阵',
}

const laneLabel: Record<string, string> = {
  winners: '胜者组',
  losers: '败者组',
  third: '季军',
}

const maxSlots = computed(() => {
  if (props.density === 'comfortable') return 12
  if (props.density === 'normal') return 8
  return 6
})

const visibleSlots = computed(() => props.item.slots.slice(0, maxSlots.value))
const showLane = computed(() => props.item.lane !== 'main' && props.density !== 'compact')
const showMatchCount = computed(
  () => props.density === 'comfortable' && props.item.matches.length > 1,
)
</script>

<template>
  <article
    class="info-card"
    :class="[`lane-${item.lane}`, `node-${item.nodeType}`, `density-${density}`]"
    :data-node-id="item.nodeId"
  >
    <div class="card-head">
      <span class="card-title">{{ item.title }}</span>
      <span
        v-if="density !== 'compact'"
        class="type-tag"
      >{{ nodeTypeLabel[item.nodeType] || '说明' }}</span>
      <span
        v-if="showLane"
        class="lane-tag"
      >{{ laneLabel[item.lane] }}</span>
    </div>

    <div class="slot-list">
      <BracketTeamRow
        v-for="(slot, si) in visibleSlots"
        :key="`${item.id}-slot-${si}`"
        :team="slot"
        :score="null"
        :density="density"
        :show-score="false"
      />
    </div>

    <div
      v-if="showMatchCount"
      class="card-meta"
    >
      {{ item.matches.length }} 场对阵
    </div>
  </article>
</template>

<style scoped>
.info-card {
  position: relative;
  z-index: 1;
  padding: 8px;
  border-radius: 8px;
  background: rgba(0, 8, 20, 0.5);
  border: 1px solid rgba(120, 170, 220, 0.18);
  border-left-width: 3px;
  border-left-color: rgba(120, 170, 220, 0.45);
}

.info-card.lane-winners {
  border-left-color: rgba(90, 190, 140, 0.85);
}

.info-card.lane-losers {
  border-left-color: rgba(210, 110, 110, 0.85);
}

.info-card.lane-third {
  border-left-color: rgba(220, 180, 90, 0.9);
}

.info-card.node-promote {
  background: rgba(40, 28, 8, 0.45);
  border-color: rgba(220, 170, 90, 0.28);
}

.info-card.node-eliminate {
  background: rgba(18, 18, 22, 0.5);
  border-color: rgba(120, 120, 130, 0.25);
}

.info-card.density-normal {
  padding: 6px;
}

.info-card.density-compact {
  padding: 4px;
  border-radius: 6px;
}

.card-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 6px;
  margin-bottom: 6px;
}

.card-title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 0.72rem;
  opacity: 0.78;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.type-tag,
.lane-tag {
  flex: 0 0 auto;
  font-size: 0.58rem;
  padding: 1px 5px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  background: rgba(255, 255, 255, 0.08);
  opacity: 0.8;
}

.lane-winners .lane-tag {
  color: #8fd9b0;
}

.lane-losers .lane-tag {
  color: #f0a0a0;
}

.lane-third .lane-tag {
  color: #f0d48a;
}

.slot-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.card-meta {
  margin-top: 6px;
  font-size: 0.66rem;
  opacity: 0.55;
}

.density-compact .card-head {
  margin-bottom: 4px;
}

.density-compact .card-title {
  font-size: 0.64rem;
}

@media (min-width: 900px) {
  .density-comfortable {
    padding: 10px;
  }
}
</style>
