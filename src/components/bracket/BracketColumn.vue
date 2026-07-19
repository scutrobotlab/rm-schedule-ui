<script setup lang="ts">
import type { BracketColumn, BracketInfoCard, BracketMatchCard } from '../../types/bracket'
import type { BracketDensity } from '../../utils/bracket_density'
import BracketMatchCardView from './BracketMatchCard.vue'
import BracketInfoCardView from './BracketInfoCard.vue'

defineProps<{
  column: BracketColumn
  density: BracketDensity
}>()

function isMatch(item: BracketMatchCard | BracketInfoCard): item is BracketMatchCard {
  return item.kind === 'match'
}
</script>

<template>
  <section
    class="bracket-column"
    :class="`density-${density}`"
    :data-column-index="column.index"
  >
    <header class="column-header">
      {{ column.label }}
    </header>
    <div class="column-items">
      <template
        v-for="item in column.items"
        :key="item.id"
      >
        <BracketMatchCardView
          v-if="isMatch(item)"
          :item="item"
          :density="density"
        />
        <BracketInfoCardView
          v-else
          :item="item"
          :density="density"
        />
      </template>
    </div>
  </section>
</template>

<style scoped>
.bracket-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.column-header {
  margin-bottom: 8px;
  padding: 6px 8px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: center;
  border-radius: 6px;
  background: rgba(8, 18, 36, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px) saturate(1.1);
  -webkit-backdrop-filter: blur(8px) saturate(1.1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.column-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
}

.density-normal .column-header {
  margin-bottom: 6px;
  padding: 5px 6px;
  font-size: 0.7rem;
}

.density-normal .column-items {
  gap: 6px;
}

.density-compact .column-header {
  margin-bottom: 4px;
  padding: 4px 4px;
  font-size: 0.62rem;
}

.density-compact .column-items {
  gap: 4px;
}

@media (min-width: 900px) {
  .density-comfortable .column-header {
    font-size: 0.86rem;
    padding: 8px 10px;
  }

  .density-comfortable .column-items {
    gap: 12px;
  }
}
</style>
