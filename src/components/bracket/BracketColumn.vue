<script setup lang="ts">
import { computed } from 'vue'
import type { BracketColumn, BracketInfoCard, BracketMatchCard } from '../../types/bracket'
import type { BracketDensity } from '../../utils/bracket_density'
import BracketMatchCardView from './BracketMatchCard.vue'
import BracketInfoCardView from './BracketInfoCard.vue'

const props = defineProps<{
  column: BracketColumn
  density: BracketDensity
  /** 淘汰赛树形布局：节点 offsetTop；null 表示普通堆叠 */
  treeTops?: Record<string, number> | null
  treeHeight?: number | null
}>()

const useTree = computed(
  () => props.treeTops != null && Object.keys(props.treeTops).length > 0,
)

const itemsStyle = computed(() => {
  if (!useTree.value || props.treeHeight == null) return undefined
  return { height: `${Math.max(props.treeHeight, 0)}px` }
})

function itemStyle(nodeId: string): Record<string, string> | undefined {
  if (!useTree.value || !props.treeTops) return undefined
  const top = props.treeTops[nodeId]
  if (top == null) return undefined
  return { top: `${top}px` }
}

function isMatch(item: BracketMatchCard | BracketInfoCard): item is BracketMatchCard {
  return item.kind === 'match'
}
</script>

<template>
  <section
    class="bracket-column"
    :class="[`density-${density}`, { 'bracket-column--tree': useTree }]"
    :data-column-index="column.index"
  >
    <header class="column-header">
      {{ column.label }}
    </header>
    <div
      class="column-items"
      :style="itemsStyle"
    >
      <div
        v-for="item in column.items"
        :key="item.id"
        class="column-item"
        :style="itemStyle(item.nodeId)"
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
      </div>
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

.bracket-column--tree .column-items {
  position: relative;
  gap: 0;
  flex: 0 0 auto;
}

.bracket-column--tree .column-item {
  position: absolute;
  left: 0;
  right: 0;
}

.density-normal .column-header {
  margin-bottom: 6px;
  padding: 5px 6px;
  font-size: 0.7rem;
}

.density-normal .column-items {
  gap: 6px;
}

.bracket-column--tree.density-normal .column-items,
.bracket-column--tree.density-compact .column-items,
.bracket-column--tree.density-comfortable .column-items {
  gap: 0;
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
