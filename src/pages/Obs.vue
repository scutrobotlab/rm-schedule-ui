<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import DeviceChrome from '../components/obs/DeviceChrome.vue'

/** iPhone 17 Pro Max 逻辑分辨率（1320×2868 @3x） */
const DEFAULT_LOGICAL_W = 440
const DEFAULT_LOGICAL_H = 956
/** OBS 画布相对逻辑分辨率的倍率 */
const DEFAULT_SCALE = 4
/** 竖屏安全区：状态栏 54pt + 灵动岛让位 = 62pt，底部 Home 指示条 34pt */
const SAFE_TOP = 62
const SAFE_BOTTOM = 34
/** 屏幕圆角半径（录制画布默认直角，避免裁切边缘） */
const DEFAULT_RADIUS = 0

const route = useRoute()

function queryValue(key: string): string | undefined {
  const raw = route.query[key]
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' ? value : undefined
}

function readPositiveInt(key: string, fallback: number): number {
  const value = Number(queryValue(key))
  return Number.isFinite(value) && value > 0 ? Math.round(value) : fallback
}

function readNumber(key: string, fallback: number): number {
  const value = Number(queryValue(key))
  return Number.isFinite(value) ? value : fallback
}

function readFlag(key: string, fallback: boolean): boolean {
  const value = queryValue(key)
  if (value === undefined || value === '') return fallback
  return value !== '0' && value !== 'false'
}

const logicalW = computed(() => readPositiveInt('w', DEFAULT_LOGICAL_W))
const logicalH = computed(() => readPositiveInt('h', DEFAULT_LOGICAL_H))
const scale = computed(() => readPositiveInt('scale', DEFAULT_SCALE))
const radius = computed(() => Math.max(0, readNumber('radius', DEFAULT_RADIUS)))

const showChrome = computed(() => readFlag('chrome', false))
const showIsland = computed(() => readFlag('island', true))
const showHome = computed(() => readFlag('home', true))
const showWifi = computed(() => readFlag('wifi', false))
const reserveSafe = computed(() => readFlag('safe', true))
const charging = computed(() => readFlag('charging', false))
const battery = computed(() => readNumber('battery', 100))
const signal = computed(() => readNumber('signal', 4))
const timeText = computed(() => queryValue('time') ?? '')

const canvasW = computed(() => logicalW.value * scale.value)
const canvasH = computed(() => logicalH.value * scale.value)

/**
 * 内嵌目标：同源相对路径（可带 query）。
 * 例：/2026/617/bracket?group=0&stage=0-1
 */
const embedSrc = computed(() => {
  const raw = queryValue('src')
  const fallback = '/bracket'

  let pathWithQuery = (raw ?? '').trim() || fallback
  try {
    // 允许传入完整同源 URL，统一收成 path + search
    if (/^https?:\/\//i.test(pathWithQuery)) {
      const absolute = new URL(pathWithQuery)
      if (absolute.origin !== window.location.origin) return fallback
      pathWithQuery = `${absolute.pathname}${absolute.search}`
    }
  } catch {
    pathWithQuery = fallback
  }

  if (!pathWithQuery.startsWith('/')) pathWithQuery = fallback
  // 禁止套娃
  if (pathWithQuery === '/obs' || pathWithQuery.startsWith('/obs?')) pathWithQuery = fallback

  const target = new URL(pathWithQuery, window.location.origin)
  target.searchParams.set('capture', '1')
  // 默认只预留安全区，不绘制状态栏；iframe 内用 query 注入模拟 inset
  if (reserveSafe.value) {
    if (!target.searchParams.has('safe_top')) {
      target.searchParams.set('safe_top', String(SAFE_TOP))
    }
    if (!target.searchParams.has('safe_bottom')) {
      target.searchParams.set('safe_bottom', String(SAFE_BOTTOM))
    }
  }
  return `${target.pathname}${target.search}`
})

const stageStyle = computed(() => ({
  width: `${canvasW.value}px`,
  height: `${canvasH.value}px`,
}))

const layerStyle = computed(() => ({
  width: `${logicalW.value}px`,
  height: `${logicalH.value}px`,
  borderRadius: `${radius.value}px`,
  transform: `scale(${scale.value})`,
  transformOrigin: 'top left',
}))

onMounted(() => {
  document.documentElement.classList.add('obs-capture')
})

onUnmounted(() => {
  document.documentElement.classList.remove('obs-capture')
})
</script>

<template>
  <div
    class="obs-stage"
    :style="stageStyle"
  >
    <div
      class="obs-layer"
      :style="layerStyle"
    >
      <iframe
        class="obs-frame"
        title="OBS nested viewport"
        :src="embedSrc"
        referrerpolicy="same-origin"
      />

      <DeviceChrome
        v-if="showChrome"
        :width="logicalW"
        :height="logicalH"
        :safe-top="SAFE_TOP"
        :safe-bottom="SAFE_BOTTOM"
        :time="timeText"
        :battery="battery"
        :charging="charging"
        :signal="signal"
        :wifi="showWifi"
        :island="showIsland"
        :home="showHome"
      />
    </div>
  </div>
</template>

<style lang="scss">
/* 仅在 /obs 捕获页锁定画布，避免滚动条进入录制画面 */
html.obs-capture,
html.obs-capture body,
html.obs-capture #app {
  margin: 0 !important;
  overflow: hidden !important;
  background: #000 !important;
}

html.obs-capture .v-application,
html.obs-capture .v-application__wrap,
html.obs-capture .v-main,
html.obs-capture .v-main__wrap {
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
}
</style>

<style scoped lang="scss">
.obs-stage {
  position: relative;
  overflow: hidden;
  background: #000;
}

.obs-layer {
  position: relative;
  overflow: hidden;
  /* 逻辑层按 440×956 布局，整体放大铺满录制画布 */
  background: #000;
}

.obs-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
}
</style>
