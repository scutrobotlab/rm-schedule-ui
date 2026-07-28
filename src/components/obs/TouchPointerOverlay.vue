<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, watch } from 'vue'

export interface TouchPointerHost {
  contentWindow: Window | null
  contentDocument: Document | null
}

const props = withDefaults(
  defineProps<{
    /** 同源 iframe；加载完成后绑定其 document 上的指针事件 */
    host: TouchPointerHost | null
    enabled?: boolean
  }>(),
  { enabled: true },
)

interface FingerState {
  id: number
  x: number
  y: number
  pressed: boolean
  visible: boolean
}

interface Ripple {
  id: number
  x: number
  y: number
}

/** 超过此时长视为长按：只保留指尖，不放外圈涟漪 */
const LONG_PRESS_MS = 400
const TAP_SLOP_PX = 10

const finger = reactive<FingerState>({
  id: -1,
  x: 0,
  y: 0,
  pressed: false,
  visible: false,
})

const ripples = ref<Ripple[]>([])
let rippleSeq = 0
const rippleTimers = new Map<number, number>()

let boundDoc: Document | null = null
let hideTimer: number | undefined
let pressStartedAt = 0
let pressStartX = 0
let pressStartY = 0

function clearHideTimer() {
  if (hideTimer !== undefined) {
    window.clearTimeout(hideTimer)
    hideTimer = undefined
  }
}

function spawnRipple(x: number, y: number) {
  const id = ++rippleSeq
  ripples.value = [...ripples.value, { id, x, y }]
  const timer = window.setTimeout(() => {
    ripples.value = ripples.value.filter((item) => item.id !== id)
    rippleTimers.delete(id)
  }, 520)
  rippleTimers.set(id, timer)
}

function isShortTap(event: PointerEvent): boolean {
  const duration = performance.now() - pressStartedAt
  if (duration >= LONG_PRESS_MS) return false
  return Math.hypot(event.clientX - pressStartX, event.clientY - pressStartY) <= TAP_SLOP_PX
}

function onPointerDown(event: PointerEvent) {
  if (!props.enabled) return
  // 忽略非主按键鼠标；触控 / 笔一律显示
  if (event.pointerType === 'mouse' && event.button !== 0) return

  clearHideTimer()
  pressStartedAt = performance.now()
  pressStartX = event.clientX
  pressStartY = event.clientY
  finger.id = event.pointerId
  finger.x = event.clientX
  finger.y = event.clientY
  finger.pressed = true
  finger.visible = true
}

function onPointerMove(event: PointerEvent) {
  if (!props.enabled || !finger.visible || finger.id !== event.pointerId) return
  finger.x = event.clientX
  finger.y = event.clientY
}

function onPointerUp(event: PointerEvent) {
  if (!props.enabled || finger.id !== event.pointerId) return
  finger.x = event.clientX
  finger.y = event.clientY
  finger.pressed = false
  // 短按才放外圈；长按 / 拖动只有指尖
  if (isShortTap(event)) {
    spawnRipple(event.clientX, event.clientY)
  }
  // 抬起后再留一瞬，方便录屏看清落点
  clearHideTimer()
  hideTimer = window.setTimeout(() => {
    if (!finger.pressed) finger.visible = false
  }, 180)
}

function unbind() {
  if (!boundDoc) return
  boundDoc.removeEventListener('pointerdown', onPointerDown, true)
  boundDoc.removeEventListener('pointermove', onPointerMove, true)
  boundDoc.removeEventListener('pointerup', onPointerUp, true)
  boundDoc.removeEventListener('pointercancel', onPointerUp, true)
  boundDoc = null
}

function bind(doc: Document | null) {
  unbind()
  if (!doc || !props.enabled) return
  boundDoc = doc
  boundDoc.addEventListener('pointerdown', onPointerDown, true)
  boundDoc.addEventListener('pointermove', onPointerMove, true)
  boundDoc.addEventListener('pointerup', onPointerUp, true)
  boundDoc.addEventListener('pointercancel', onPointerUp, true)
}

function tryBindHost() {
  const doc = props.host?.contentDocument ?? null
  // 跨域或尚未就绪时跳过；同源 /obs iframe 会很快可用
  if (!doc || doc.URL === 'about:blank') return
  bind(doc)
}

watch(
  () => [props.host, props.enabled] as const,
  () => {
    if (!props.enabled) {
      unbind()
      finger.visible = false
      finger.pressed = false
      return
    }
    tryBindHost()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearHideTimer()
  for (const timer of rippleTimers.values()) window.clearTimeout(timer)
  rippleTimers.clear()
  unbind()
})

defineExpose({
  /** iframe @load 后由父级再调一次，确保 document 已就绪 */
  rebind: tryBindHost,
})
</script>

<template>
  <div
    class="touch-overlay"
    aria-hidden="true"
  >
    <div
      v-for="ripple in ripples"
      :key="ripple.id"
      class="touch-ripple"
      :style="{ left: `${ripple.x}px`, top: `${ripple.y}px` }"
    />

    <div
      v-show="finger.visible"
      class="touch-finger"
      :class="{ 'is-pressed': finger.pressed }"
      :style="{ left: `${finger.x}px`, top: `${finger.y}px` }"
    />
  </div>
</template>

<style scoped lang="scss">
.touch-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  overflow: hidden;
  pointer-events: none;
}

.touch-finger {
  position: absolute;
  width: 42px;
  height: 42px;
  margin: -21px 0 0 -21px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 30%,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(210, 230, 245, 0.34) 42%,
    rgba(120, 170, 210, 0.22) 100%
  );
  box-shadow:
    0 0 0 1.5px rgba(255, 255, 255, 0.45),
    0 6px 16px rgba(0, 12, 28, 0.28);
  opacity: 0.72;
  transform: scale(1);
  transition:
    transform 120ms ease-out,
    opacity 120ms ease-out;
  will-change: transform, opacity;
}

.touch-finger.is-pressed {
  opacity: 0.92;
  transform: scale(0.86);
}

.touch-ripple {
  position: absolute;
  width: 18px;
  height: 18px;
  margin: -9px 0 0 -9px;
  border-radius: 50%;
  border: 2px solid rgba(235, 245, 255, 0.85);
  box-shadow: 0 0 0 0 rgba(180, 220, 255, 0.35);
  animation: touch-ripple-expand 520ms ease-out forwards;
  will-change: transform, opacity;
}

@keyframes touch-ripple-expand {
  0% {
    opacity: 0.9;
    transform: scale(0.55);
  }
  70% {
    opacity: 0.35;
  }
  100% {
    opacity: 0;
    transform: scale(3.2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .touch-finger {
    transition: none;
  }

  .touch-ripple {
    animation-duration: 1ms;
  }
}
</style>
