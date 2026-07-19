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

/** 多场对阵按场次完整展示；纵向席位/场次一律不截断 */
const showAsMatches = computed(
  () => props.item.nodeType === 'matchGroup' && props.item.matches.length > 0,
)

const showMatchCount = computed(
  () => props.density !== 'compact' && props.item.matches.length > 1,
)
const showScore = computed(() => props.density !== 'compact')
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
        <div
          v-if="density === 'comfortable'"
          class="mini-match-label"
        >
          第{{ m.orderNumber }}场
        </div>
        <BracketTeamRow
          :team="m.slots[0]"
          :score="m.redWinGames"
          :density="density"
          :show-score="showScore"
        />
        <BracketTeamRow
          :team="m.slots[1]"
          :score="m.blueWinGames"
          :density="density"
          :show-score="showScore"
        />
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

.info-card.lane-gold {
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

.info-card.node-eliminate :deep(.rank-badge) {
  background: #6b6f76;
  color: rgba(255, 255, 255, 0.85);
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

.type-tag {
  flex: 0 0 auto;
  font-size: 0.58rem;
  padding: 1px 5px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  background: rgba(255, 255, 255, 0.08);
  opacity: 0.8;
}

.match-list,
.slot-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.match-list {
  gap: 6px;
}

.mini-match {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.03);
}

.mini-match-label {
  font-size: 0.6rem;
  opacity: 0.5;
  padding: 0 2px 2px;
}

.density-normal .match-list {
  gap: 5px;
}

.density-compact .match-list {
  gap: 4px;
}

.density-compact .mini-match {
  padding: 2px;
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

  .density-comfortable .match-list {
    gap: 8px;
  }
}
</style>
