<script setup lang="ts">
import { computed } from 'vue'
import type { BracketViewModel } from '../../types/bracket'
import { resolveBracketDensity } from '../../utils/bracket_density'
import BracketColumn from './BracketColumn.vue'
import BracketConnectors from './BracketConnectors.vue'

const props = defineProps<{
  model: BracketViewModel
  /** 视口内可见跨度（可小数）；密度按取整后的 span 计算 */
  visibleSpan?: number
}>()

const columnCount = computed(() => props.model.columns.length)
const spanForDensity = computed(() => {
  const span = props.visibleSpan ?? columnCount.value
  return Math.max(1, Math.round(span))
})
const density = computed(() => resolveBracketDensity(spanForDensity.value))

const layoutKey = computed(() => {
  const cols = props.model.columns.map((c) => `${c.index}:${c.items.length}`).join('|')
  const conns = props.model.connections.map((c) => `${c.fromNodeId}>${c.toNodeId}`).join('|')
  return `${cols}::${conns}::${density.value}::${spanForDensity.value}`
})
</script>

<template>
  <div
    class="bracket-board"
    :class="`density-${density}`"
    :style="{ '--bracket-cols': String(Math.max(columnCount, 1)) }"
  >
    <BracketConnectors
      :connections="model.connections"
      :layout-key="layoutKey"
    />
    <div class="bracket-grid">
      <BracketColumn
        v-for="column in model.columns"
        :key="`${column.index}-${column.x}`"
        :column="column"
        :density="density"
      />
    </div>
  </div>
</template>

<style scoped>
.bracket-board {
  position: relative;
  width: 100%;
  min-height: 100%;
  padding: 12px 10px 24px;
  overflow: visible;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(40, 90, 140, 0.22) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 100%, rgba(30, 70, 110, 0.18) 0%, transparent 50%),
    linear-gradient(180deg, rgba(4, 14, 28, 0.78) 0%, rgba(6, 18, 34, 0.9) 100%);
}

.bracket-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(var(--bracket-cols, 1), minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  align-items: start;
}

.density-normal .bracket-grid {
  gap: 8px;
}

.density-compact .bracket-grid {
  gap: 6px;
}

@media (min-width: 900px) {
  .bracket-board {
    padding: 16px 20px 32px;
  }

  .density-comfortable .bracket-grid {
    gap: 16px;
  }

  .density-normal .bracket-grid {
    gap: 12px;
  }
}
</style>
