<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { BracketConnection, BracketLane } from '../../types/bracket'

interface ConnectorPath {
  key: string
  d: string
  lane: BracketLane
}

const props = defineProps<{
  connections: BracketConnection[]
  /** 用于强制在列/阶段变化后重算 */
  layoutKey: string
}>()

const rootRef = ref<SVGSVGElement | null>(null)
const paths = ref<ConnectorPath[]>([])

let resizeObserver: ResizeObserver | null = null
let rafId = 0

function laneOfNode(el: HTMLElement): BracketLane {
  if (el.classList.contains('lane-gold')) return 'gold'
  return 'main'
}

function measure() {
  const svg = rootRef.value
  const board = svg?.parentElement
  if (!svg || !board) {
    paths.value = []
    return
  }

  const boardRect = board.getBoundingClientRect()
  // 用边框盒尺寸做坐标系，避免 scrollHeight / 绝对定位 SVG 互相撑高可滚动区域
  const width = Math.max(1, board.clientWidth)
  const height = Math.max(1, board.clientHeight)
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))

  const nodeMap = new Map<string, HTMLElement>()
  board.querySelectorAll<HTMLElement>('[data-node-id]').forEach((el) => {
    const id = el.dataset.nodeId
    if (id && !nodeMap.has(id)) nodeMap.set(id, el)
  })

  const next: ConnectorPath[] = []
  for (const conn of props.connections) {
    const fromEl = nodeMap.get(conn.fromNodeId)
    const toEl = nodeMap.get(conn.toNodeId)
    if (!fromEl || !toEl) continue

    const from = fromEl.getBoundingClientRect()
    const to = toEl.getBoundingClientRect()
    const x1 = from.right - boardRect.left
    const y1 = from.top + from.height / 2 - boardRect.top
    const x2 = to.left - boardRect.left
    const y2 = to.top + to.height / 2 - boardRect.top

    if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) {
      continue
    }

    // 折点取两节点相对边之间的水平中点，避免固定偏移把竖线推到右侧卡片上
    const midX = (x1 + x2) / 2
    const d =
      x2 > x1 + 2
        ? `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`
        : `M ${x1} ${y1} C ${x1 + 24} ${y1}, ${x2 - 24} ${y2}, ${x2} ${y2}`

    const lane = laneOfNode(fromEl) !== 'main' ? laneOfNode(fromEl) : laneOfNode(toEl)
    next.push({
      key: `${conn.fromNodeId}->${conn.toNodeId}`,
      d,
      lane,
    })
  }
  paths.value = next
}

function scheduleMeasure() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    nextTick(() => measure())
  })
}

onMounted(() => {
  scheduleMeasure()
  const board = rootRef.value?.parentElement
  if (board && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => scheduleMeasure())
    resizeObserver.observe(board)
  }
  window.addEventListener('resize', scheduleMeasure)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', scheduleMeasure)
})

watch(
  () => [props.connections, props.layoutKey],
  () => scheduleMeasure(),
  { deep: true },
)
</script>

<template>
  <svg
    ref="rootRef"
    class="bracket-connectors"
    aria-hidden="true"
  >
    <path
      v-for="path in paths"
      :key="path.key"
      class="connector"
      :class="`lane-${path.lane}`"
      :d="path.d"
      fill="none"
    />
  </svg>
</template>

<style scoped>
.bracket-connectors {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.connector {
  stroke: rgba(140, 180, 220, 0.45);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.connector.lane-gold {
  stroke: rgba(220, 180, 90, 0.6);
}

@media (min-width: 900px) {
  .connector {
    stroke-width: 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .connector {
    transition: none;
  }
}
</style>
