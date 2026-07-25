<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { BracketViewModel } from '../../types/bracket'
import {
  resolveBracketDensity,
  resolveBracketTitleShortenLevel,
  resolveBracketVisualProgress,
  shouldForceBracketPendingName,
  shouldShowBracketPendingScore,
  shouldShowBracketPlaceholderLogo,
  shouldShowBracketTeamName,
  shouldShowBracketTypeTag,
} from '../../utils/bracket_density'
import { bracketColumnGapForSpan } from '../../utils/bracket_column_gap'
import { computeKnockoutLayout } from '../../utils/bracket_tree_layout'
import BracketColumn from './BracketColumn.vue'
import BracketConnectors from './BracketConnectors.vue'

const props = defineProps<{
  model: BracketViewModel
  /** 视口内可见跨度（可小数）；密度按取整后的 span 计算 */
  visibleSpan?: number
}>()

const boardRef = ref<HTMLElement | null>(null)
const nodeTops = ref<Record<string, number>>({})
const columnHeights = ref<Record<number, number>>({})

const columnCount = computed(() => props.model.columns.length)
const spanForDensity = computed(() => {
  const span = props.visibleSpan ?? columnCount.value
  return Math.max(1, Math.floor(span))
})
const visibleSpan = computed(() => Math.max(1, props.visibleSpan ?? columnCount.value))
const density = computed(() => resolveBracketDensity(spanForDensity.value))
const titleShortenLevel = computed(() => resolveBracketTitleShortenLevel(spanForDensity.value))
const showTeamName = computed(() => shouldShowBracketTeamName(visibleSpan.value))
const showPendingScore = computed(() => shouldShowBracketPendingScore(visibleSpan.value))
const forcePendingName = computed(() => shouldForceBracketPendingName(visibleSpan.value))
const showPlaceholderLogo = computed(
  () => shouldShowBracketPlaceholderLogo(visibleSpan.value),
)
const showTypeTag = computed(() => shouldShowBracketTypeTag(visibleSpan.value))
const isKnockout = computed(() => props.model.partType === 'knockout')
const boardStyle = computed(() => {
  const progress = resolveBracketVisualProgress(visibleSpan.value)
  return {
    '--bracket-cols': String(Math.max(columnCount.value, 1)),
    '--bracket-normal-progress': String(progress.normal),
    '--bracket-compact-progress': String(progress.compact),
    '--bracket-placeholder-opacity': String(progress.placeholderLogo),
    '--bracket-pending-score-opacity': String(progress.pendingScore),
  }
})

const layoutKey = computed(() => {
  const cols = props.model.columns.map((c) => `${c.index}:${c.items.length}`).join('|')
  const conns = props.model.connections.map((c) => `${c.fromNodeId}>${c.toNodeId}`).join('|')
  return `${cols}::${conns}::${density.value}::${visibleSpan.value}::${props.model.partType}`
})

const connectorLayoutKey = computed(
  () => `${layoutKey.value}::${JSON.stringify(nodeTops.value)}`,
)

let resizeObserver: ResizeObserver | null = null
let rafId = 0

function gapPx(): number {
  const wide = typeof window !== 'undefined' && window.innerWidth >= 900
  return bracketColumnGapForSpan(visibleSpan.value, wide)
}

function clearTreeLayout() {
  nodeTops.value = {}
  columnHeights.value = {}
}

function measureAndLayout() {
  if (!isKnockout.value) {
    clearTreeLayout()
    return
  }
  const board = boardRef.value
  if (!board) return

  const heights: Record<string, number> = {}
  board.querySelectorAll<HTMLElement>('[data-node-id]').forEach((el) => {
    const id = el.dataset.nodeId
    if (!id) return
    heights[id] = el.offsetHeight
  })

  // 固定树形坐标，横向吸附不改 Y，避免滑列时整体上下抽动
  const result = computeKnockoutLayout({
    columns: props.model.columns,
    connections: props.model.connections,
    heights,
    gap: gapPx(),
  })

  if (!recordsEqual(nodeTops.value, result.tops)) {
    nodeTops.value = result.tops
  }
  if (!recordsEqual(columnHeights.value, result.columnHeights)) {
    columnHeights.value = result.columnHeights
  }
}

function recordsEqual(a: Record<string | number, number>, b: Record<string | number, number>): boolean {
  const ak = Object.keys(a)
  const bk = Object.keys(b)
  if (ak.length !== bk.length) return false
  return ak.every((k) => a[k as keyof typeof a] === b[k as keyof typeof b])
}

function scheduleLayout() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    nextTick(() => measureAndLayout())
  })
}

onMounted(() => {
  scheduleLayout()
  if (typeof ResizeObserver !== 'undefined' && boardRef.value) {
    resizeObserver = new ResizeObserver(() => scheduleLayout())
    resizeObserver.observe(boardRef.value)
  }
  window.addEventListener('resize', scheduleLayout)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', scheduleLayout)
})

watch(layoutKey, () => scheduleLayout())
</script>

<template>
  <div
    ref="boardRef"
    class="bracket-board"
    :class="[`density-${density}`, { 'bracket-board--knockout': isKnockout }]"
    :style="boardStyle"
  >
    <BracketConnectors
      :connections="model.connections"
      :layout-key="connectorLayoutKey"
    />
    <div class="bracket-grid">
      <BracketColumn
        v-for="column in model.columns"
        :key="`${column.index}-${column.x}`"
        :column="column"
        :density="density"
        :visible-span="visibleSpan"
        :title-shorten-level="titleShortenLevel"
        :show-team-name="showTeamName"
        :show-pending-score="showPendingScore"
        :force-pending-name="forcePendingName"
        :show-placeholder-logo="showPlaceholderLogo"
        :show-type-tag="showTypeTag"
        :tree-tops="isKnockout ? nodeTops : null"
        :tree-height="isKnockout ? columnHeights[column.index] : null"
      />
    </div>
  </div>
</template>

<style scoped>
.bracket-board {
  position: relative;
  width: 100%;
  height: fit-content;
  padding: 12px 10px 16px;
  overflow: hidden;
  background: transparent;
}

.bracket-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(var(--bracket-cols, 1), minmax(0, 1fr));
  gap: calc(
    10px
    - 2px * var(--bracket-normal-progress, 0)
    - 2px * var(--bracket-compact-progress, 0)
  );
  width: 100%;
  align-items: start;
}

@media (min-width: 900px) {
  .bracket-board {
    padding: 16px 20px 20px;
  }

  .bracket-grid {
    gap: calc(
      16px
      - 4px * var(--bracket-normal-progress, 0)
      - 6px * var(--bracket-compact-progress, 0)
    );
  }
}
</style>
