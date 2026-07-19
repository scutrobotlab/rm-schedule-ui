<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import championIcon from '@/assets/champion.png'

export interface StageItem {
  label: string
  /** 轨道内缩略图：横线条数 / 全国赛奖杯图 / 普通决赛表情 */
  icon: number | 'trophy' | 'trophyEmoji'
  /** 粗横条（如小组赛） */
  thick?: boolean
  /** 双列排布（如 32 强） */
  columns?: 1 | 2
}

export interface StageRange {
  start: number
  end: number
}

const props = defineProps<{
  stages: StageItem[]
  modelValue: StageRange
}>()

const emit = defineEmits<{
  'update:modelValue': [value: StageRange]
  change: [value: StageRange]
}>()

const trackRef = ref<HTMLElement | null>(null)

type DragMode = 'start' | 'end' | 'range'
const dragMode = ref<DragMode | null>(null)
const dragPointerId = ref<number | null>(null)
const dragOriginX = ref(0)
const dragOriginLeft = ref(0)
const dragOriginRight = ref(0)
/** 本次拖动是否产生位移；用于区分点击与拖拽 */
const didDrag = ref(false)

/** 选区左右边界（以阶段格为单位，右边界为开区间） */
const visualLeft = ref(0)
const visualRight = ref(1)

const stageCount = computed(() => props.stages.length)
const isDragging = computed(() => dragMode.value !== null)

const normalized = computed((): StageRange => {
  const max = Math.max(0, stageCount.value - 1)
  let start = clamp(Math.round(props.modelValue.start), 0, max)
  let end = clamp(Math.round(props.modelValue.end), 0, max)
  if (start > end) {
    const swapped = start
    start = end
    end = swapped
  }
  return { start, end }
})

const selectionStyle = computed(() => {
  const n = stageCount.value
  if (n <= 0) return { left: '0%', width: '0%' }
  const left = clamp(visualLeft.value, 0, n)
  const right = clamp(visualRight.value, left + 0.05, n)
  return {
    left: `${(left / n) * 100}%`,
    width: `${((right - left) / n) * 100}%`,
  }
})

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function syncVisualFromModel() {
  const { start, end } = normalized.value
  visualLeft.value = start
  visualRight.value = end + 1
}

function rangeFromEdges(left: number, right: number): StageRange {
  const n = stageCount.value
  const max = Math.max(0, n - 1)
  let start = clamp(Math.round(left), 0, max)
  let end = clamp(Math.round(right) - 1, 0, max)
  if (start > end) {
    if (dragMode.value === 'start') end = start
    else if (dragMode.value === 'end') start = end
    else {
      const mid = start
      start = end
      end = mid
    }
  }
  return { start, end }
}

function isActive(index: number): boolean {
  const { start, end } = rangeFromEdges(visualLeft.value, visualRight.value)
  return index >= start && index <= end
}

/** 超过 8 个字时按语义断句（如 16进8败者组 / 第一轮） */
const LABEL_BREAK_SUFFIXES = ['第一轮', '第二轮', '第三轮', '第四轮', '第五轮', '胜者组', '败者组'] as const

function labelLines(label: string): string[] {
  if (label.length <= 8) return [label]
  for (const suffix of LABEL_BREAK_SUFFIXES) {
    if (label.endsWith(suffix) && label.length > suffix.length) {
      return [label.slice(0, -suffix.length), suffix]
    }
  }
  const mid = Math.ceil(label.length / 2)
  return [label.slice(0, mid), label.slice(mid)]
}

function emitRange(start: number, end: number) {
  if (start === props.modelValue.start && end === props.modelValue.end) return
  const value = { start, end }
  emit('update:modelValue', value)
  emit('change', value)
}

/** 点击阶段：保持当前窗口宽度，以该阶段为起点（末端贴边时左移） */
function selectStageAt(index: number) {
  const n = stageCount.value
  if (n <= 0) return
  const max = n - 1
  const idx = clamp(Math.round(index), 0, max)
  const span = Math.max(1, normalized.value.end - normalized.value.start + 1)
  let start = idx
  let end = Math.min(max, start + span - 1)
  if (end - start + 1 < span) {
    start = Math.max(0, end - span + 1)
  }
  visualLeft.value = start
  visualRight.value = end + 1
  emitRange(start, end)
}

function indexFromClientX(clientX: number): number {
  const track = trackRef.value
  const n = stageCount.value
  if (!track || n <= 0) return 0
  const rect = track.getBoundingClientRect()
  if (rect.width <= 0) return 0
  const ratio = (clientX - rect.left) / rect.width
  return clamp(Math.floor(ratio * n), 0, n - 1)
}

function applyVisual(left: number, right: number) {
  const n = stageCount.value
  const nextLeft = clamp(left, 0, n - 1)
  const nextRight = clamp(right, nextLeft + 1, n)
  visualLeft.value = nextLeft
  visualRight.value = nextRight
  const { start, end } = rangeFromEdges(nextLeft, nextRight)
  emitRange(start, end)
}

function onPointerDown(mode: DragMode, e: PointerEvent) {
  if (stageCount.value <= 0) return
  e.preventDefault()
  e.stopPropagation()
  const target = e.currentTarget as HTMLElement
  target.setPointerCapture(e.pointerId)
  dragMode.value = mode
  dragPointerId.value = e.pointerId
  dragOriginX.value = e.clientX
  dragOriginLeft.value = visualLeft.value
  dragOriginRight.value = visualRight.value
  didDrag.value = false
}

function onPointerMove(e: PointerEvent) {
  if (dragMode.value === null || dragPointerId.value !== e.pointerId) return
  const track = trackRef.value
  if (!track || stageCount.value <= 0) return

  const cellWidth = track.getBoundingClientRect().width / stageCount.value
  if (cellWidth <= 0) return

  const deltaCells = (e.clientX - dragOriginX.value) / cellWidth
  if (!didDrag.value && Math.abs(e.clientX - dragOriginX.value) > 4) {
    didDrag.value = true
  }
  const n = stageCount.value
  const span = dragOriginRight.value - dragOriginLeft.value

  if (dragMode.value === 'start') {
    applyVisual(
      clamp(dragOriginLeft.value + deltaCells, 0, dragOriginRight.value - 1),
      dragOriginRight.value,
    )
    return
  }

  if (dragMode.value === 'end') {
    applyVisual(
      dragOriginLeft.value,
      clamp(dragOriginRight.value + deltaCells, dragOriginLeft.value + 1, n),
    )
    return
  }

  let left = dragOriginLeft.value + deltaCells
  let right = left + span
  if (left < 0) {
    left = 0
    right = span
  } else if (right > n) {
    right = n
    left = n - span
  }
  applyVisual(left, right)
}

function onPointerUp(e: PointerEvent) {
  if (dragPointerId.value !== e.pointerId) return
  const target = e.currentTarget as HTMLElement
  if (target.hasPointerCapture(e.pointerId)) {
    target.releasePointerCapture(e.pointerId)
  }
  const mode = dragMode.value
  const wasClick = !didDrag.value
  dragMode.value = null
  dragPointerId.value = null

  if (wasClick && mode === 'range') {
    selectStageAt(indexFromClientX(e.clientX))
    didDrag.value = false
    return
  }

  const { start, end } = rangeFromEdges(visualLeft.value, visualRight.value)
  visualLeft.value = start
  visualRight.value = end + 1
  emitRange(start, end)
  didDrag.value = false
}

function onTrackClick(e: MouseEvent) {
  // 选区/把手上的点击由 pointer 逻辑处理，避免重复
  const target = e.target as HTMLElement | null
  if (target?.closest('.stage-range__selection, .stage-range__handle')) return
  if (didDrag.value) return
  selectStageAt(indexFromClientX(e.clientX))
}

function onLabelClick(index: number) {
  if (isDragging.value) return
  selectStageAt(index)
}

watch(
  () => [props.modelValue.start, props.modelValue.end, stageCount.value] as const,
  () => {
    if (isDragging.value) return
    syncVisualFromModel()
  },
  { immediate: true },
)

function barList(stage: StageItem): number[] {
  if (typeof stage.icon !== 'number') return []
  return Array.from({ length: stage.icon }, (_, i) => i)
}

function barColumns(stage: StageItem): 1 | 2 {
  if (typeof stage.icon !== 'number') return 1
  if ((stage.columns ?? 1) > 1 || stage.icon >= 8) return 2
  return 1
}

function barRows(stage: StageItem): number {
  const count = typeof stage.icon === 'number' ? stage.icon : 1
  return Math.ceil(Math.max(count, 1) / barColumns(stage))
}

function barsClass(stage: StageItem): Record<string, boolean> {
  const rows = barRows(stage)
  const cols = barColumns(stage)
  return {
    'stage-range__bars--thick': Boolean(stage.thick) && rows <= 4 && cols === 1,
    'stage-range__bars--thin': rows > 6 && rows <= 8,
    'stage-range__bars--xthin': rows > 8,
    'stage-range__bars--cols': cols > 1,
    // 双列且行数不多时加高，避免 8 条看起来比 4 条单列更扁
    'stage-range__bars--cols-roomy': cols > 1 && rows <= 5,
  }
}

function barsStyle(stage: StageItem): Record<string, string> {
  const count = typeof stage.icon === 'number' ? stage.icon : 1
  return {
    '--bar-count': String(Math.max(count, 1)),
    '--bar-rows': String(barRows(stage)),
  }
}
</script>

<template>
  <div
    class="stage-range"
    :class="{ 'stage-range--dragging': isDragging }"
    :style="{ '--stage-count': Math.max(stageCount, 1) }"
  >
    <div class="stage-range__labels">
      <button
        v-for="(stage, index) in stages"
        :key="`label-${index}`"
        type="button"
        class="stage-range__label"
        :class="{
          'stage-range__label--active': isActive(index),
          'stage-range__label--wrap': labelLines(stage.label).length > 1,
        }"
        :aria-label="`切换到${stage.label}`"
        @click="onLabelClick(index)"
      >
        <span
          v-for="(line, lineIndex) in labelLines(stage.label)"
          :key="lineIndex"
          class="stage-range__label-line"
        >{{ line }}</span>
      </button>
    </div>

    <div
      ref="trackRef"
      class="stage-range__track"
      role="slider"
      :aria-valuemin="0"
      :aria-valuemax="Math.max(stageCount - 1, 0)"
      :aria-valuetext="`${stages[normalized.start]?.label ?? ''} – ${stages[normalized.end]?.label ?? ''}`"
      @click="onTrackClick"
    >
      <div class="stage-range__icons">
        <div
          v-for="(stage, index) in stages"
          :key="`icon-${index}`"
          class="stage-range__icon-cell"
          :class="{ 'stage-range__icon-cell--active': isActive(index) }"
        >
          <img
            v-if="stage.icon === 'trophy'"
            class="stage-range__trophy"
            :src="championIcon"
            alt="冠军"
          />
          <span
            v-else-if="stage.icon === 'trophyEmoji'"
            class="stage-range__trophy-emoji"
            role="img"
            aria-label="冠军"
          >🏆</span>
          <div
            v-else
            class="stage-range__bars"
            :class="barsClass(stage)"
            :style="barsStyle(stage)"
          >
            <span
              v-for="barIndex in barList(stage)"
              :key="barIndex"
              class="stage-range__bar"
            />
            <span
              v-if="typeof stage.icon === 'number' && stage.icon > 8"
              class="stage-range__count"
            >{{ stage.icon }}</span>
          </div>
        </div>
      </div>

      <div
        class="stage-range__selection"
        :style="selectionStyle"
        @pointerdown="onPointerDown('range', $event)"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <button
          type="button"
          class="stage-range__handle stage-range__handle--start"
          aria-label="调整起始阶段"
          @pointerdown.stop="onPointerDown('start', $event)"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <span class="stage-range__chevron">‹</span>
        </button>
        <button
          type="button"
          class="stage-range__handle stage-range__handle--end"
          aria-label="调整结束阶段"
          @pointerdown.stop="onPointerDown('end', $event)"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <span class="stage-range__chevron">›</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stage-range {
  --track-bg: rgba(8, 28, 72, 0.92);
  --selection-bg: rgba(120, 170, 255, 0.28);
  --label-active: #ffffff;
  --label-inactive: rgba(180, 198, 230, 0.55);
  --icon-active: rgba(255, 255, 255, 0.95);
  --icon-inactive: rgba(170, 190, 220, 0.45);
  --snap-ease: cubic-bezier(0.22, 1, 0.36, 1);
  /* 进度条与把手共用固定圆角，避免胶囊椭圆 */
  --bar-radius: 12px;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 12px;
  user-select: none;
  touch-action: none;
}

.stage-range__labels {
  display: grid;
  grid-template-columns: repeat(var(--stage-count), minmax(0, 1fr));
  gap: 0;
  margin-bottom: 6px;
}

.stage-range__label {
  min-height: 2.4em;
  padding: 0 2px;
  border: 0;
  background: transparent;
  color: var(--label-inactive);
  font: inherit;
  font-size: clamp(11px, 2.4vw, 14px);
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
  transition: color 0.28s var(--snap-ease);
}

.stage-range__label:focus-visible {
  outline: 2px solid rgba(140, 180, 255, 0.7);
  outline-offset: 2px;
  border-radius: 4px;
}

.stage-range__label--wrap {
  gap: 0;
}

.stage-range__label-line {
  display: block;
  white-space: nowrap;
}

.stage-range__label--active {
  color: var(--label-active);
}

.stage-range__track {
  position: relative;
  height: 48px;
  border-radius: var(--bar-radius);
  background: var(--track-bg);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  overflow: hidden;
  cursor: pointer;
}

.stage-range__icons {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(var(--stage-count), minmax(0, 1fr));
  pointer-events: none;
  z-index: 1;
}

.stage-range__icon-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icon-inactive);
  transition:
    color 0.28s var(--snap-ease),
    transform 0.28s var(--snap-ease),
    opacity 0.28s var(--snap-ease);
  opacity: 0.85;
}

.stage-range__icon-cell--active {
  color: var(--icon-active);
  opacity: 1;
  transform: scale(1.22);
}

.stage-range__bars {
  --bar-count: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  max-height: 100%;
  padding: 4px 0;
  box-sizing: border-box;
}

.stage-range__bars--thick {
  gap: 4px;
}

.stage-range__bars--thin {
  gap: 1.5px;
}

.stage-range__bars--xthin {
  gap: 1px;
}

.stage-range__bars--cols {
  --bar-rows: 4;
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-auto-flow: column;
  grid-template-rows: repeat(var(--bar-rows), auto);
  gap: 2px 4px;
}

.stage-range__bars--cols-roomy {
  gap: 3.5px 5px;
  padding: 2px 0;
}

.stage-range__bar {
  display: block;
  width: 18px;
  height: 2px;
  border-radius: 1px;
  background: currentColor;
  flex-shrink: 0;
}

.stage-range__bars--thick .stage-range__bar {
  width: 20px;
  height: 3px;
}

.stage-range__bars--thin .stage-range__bar {
  width: 16px;
  height: 1.5px;
}

.stage-range__bars--xthin .stage-range__bar {
  width: 14px;
  height: 1px;
  border-radius: 0.5px;
}

.stage-range__bars--cols .stage-range__bar {
  width: 11px;
}

.stage-range__bars--cols-roomy .stage-range__bar {
  width: 12px;
  height: 2.5px;
}

.stage-range__count {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
  font-size: 0.72rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: inherit;
  text-shadow:
    0 0 4px var(--track-bg),
    0 0 2px var(--track-bg),
    0 1px 0 var(--track-bg);
  line-height: 1;
}

.stage-range__trophy {
  width: 16px;
  height: 28px;
  object-fit: contain;
  pointer-events: none;
}

.stage-range__trophy-emoji {
  font-size: 1.1rem;
  line-height: 1;
  pointer-events: none;
}

.stage-range__selection {
  --handle-width: 14px;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  background: transparent;
  cursor: grab;
  touch-action: none;
  will-change: left, width;
  transition:
    left 0.28s var(--snap-ease),
    width 0.28s var(--snap-ease);
}

/* 浅色选区仅填充两端把手内侧，不超出半圆外沿 */
.stage-range__selection::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--handle-width);
  right: var(--handle-width);
  background: var(--selection-bg);
  pointer-events: none;
  transition: background-color 0.2s ease;
}

.stage-range--dragging .stage-range__selection {
  transition: none;
  cursor: grabbing;
}

.stage-range--dragging .stage-range__selection::before {
  background: rgba(140, 185, 255, 0.34);
}

.stage-range__handle {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  width: var(--handle-width, 14px);
  height: 100%;
  padding: 0;
  border: none;
  background: #ffffff;
  color: #1a2a4a;
  cursor: ew-resize;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  transition:
    transform 0.2s var(--snap-ease),
    box-shadow 0.2s ease,
    width 0.2s ease;
}

.stage-range--dragging .stage-range__handle {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.32);
}

.stage-range__handle--start {
  left: 0;
  border-radius: var(--bar-radius) 0 0 var(--bar-radius);
}

.stage-range__handle--end {
  right: 0;
  border-radius: 0 var(--bar-radius) var(--bar-radius) 0;
}

.stage-range__handle:active {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.36);
}

.stage-range__chevron {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  margin-top: -1px;
}

@media (max-width: 600px) {
  .stage-range {
    max-width: 100%;
    padding: 0 8px;
  }

  .stage-range__track {
    height: 44px;
  }

  .stage-range__selection {
    --handle-width: 12px;
  }

  .stage-range__bar {
    width: 14px;
  }

  .stage-range__bars--thick .stage-range__bar {
    width: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stage-range__label,
  .stage-range__icon-cell,
  .stage-range__selection,
  .stage-range__handle {
    transition: none;
  }
}
</style>
