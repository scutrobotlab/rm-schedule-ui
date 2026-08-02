<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DeviceChrome from '../components/obs/DeviceChrome.vue'
import TouchPointerOverlay from '../components/obs/TouchPointerOverlay.vue'
import { runStageSelectorDemo, STAGE_DEMO_DEFAULT_SRC } from '../utils/obs_demo_stage'
import {
  runHeroDemo,
  runStoryboardDemo,
  STORYBOARD_DEMO_DEFAULT_SRC,
  type StoryboardCue,
} from '../utils/obs_demo_storyboard'

/** iPhone 17 Pro Max 逻辑分辨率（1320×2868 @3x） */
const DEFAULT_LOGICAL_W = 440
const DEFAULT_LOGICAL_H = 956
/** OBS 画布相对逻辑分辨率的倍率 */
const DEFAULT_SCALE = 4
/** 竖屏安全区：为灵动岛底部额外保留呼吸空间，底部 Home 指示条 34pt */
const SAFE_TOP = 72
const SAFE_BOTTOM = 34
/** 屏幕圆角半径（录制画布默认直角，避免裁切边缘） */
const DEFAULT_RADIUS = 0

const route = useRoute()
const frameRef = ref<HTMLIFrameElement | null>(null)
const touchOverlayRef = ref<InstanceType<typeof TouchPointerOverlay> | null>(null)
const storyboardCue = ref<StoryboardCue | null>(null)

let demoAbort: AbortController | null = null

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
/** 录制时默认显示半透明指尖与点击涟漪；touch=0 关闭 */
const showTouch = computed(() => readFlag('touch', true))
/** caption=0 隐藏旁白字幕；scene=0 隐藏底部分镜序号。 */
const showCaption = computed(() => readFlag('caption', true))
const showSceneNumber = computed(() => readFlag('scene', true))
/** demo=stage：自动演示阶段选择器拖拽/缩放 */
const demoKind = computed(() => queryValue('demo') ?? '')
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
  const fallback = demoKind.value === 'stage'
    ? STAGE_DEMO_DEFAULT_SRC
    : demoKind.value === 'storyboard'
      ? STORYBOARD_DEMO_DEFAULT_SRC
      : '/bracket'

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
  // 自动演示缺省阶段由各自的默认 src 决定。
  if (
    (demoKind.value === 'stage' || demoKind.value === 'storyboard') &&
    !target.searchParams.has('stage')
  ) {
    target.searchParams.set('stage', '0-0')
  }
  // 完整分镜和独立英雄镜头均由脚本在蓄力段结束后触发缩放把手入场。
  if (demoKind.value === 'storyboard' || demoKind.value === 'hero') {
    target.searchParams.set('stage_handles', 'intro')
  }
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

function stopDemo() {
  demoAbort?.abort()
  demoAbort = null
  storyboardCue.value = null
}

async function startDemoIfNeeded() {
  stopDemo()
  if (
    demoKind.value !== 'stage' &&
    demoKind.value !== 'storyboard' &&
    demoKind.value !== 'hero'
  ) return
  const doc = frameRef.value?.contentDocument
  if (!doc || doc.URL === 'about:blank') return

  const controller = new AbortController()
  demoAbort = controller
  try {
    if (demoKind.value === 'storyboard') {
      await runStoryboardDemo(doc, {
        signal: controller.signal,
        onCue: cue => {
          storyboardCue.value = cue
        },
      })
    } else if (demoKind.value === 'hero') {
      await runHeroDemo(doc, { signal: controller.signal })
    } else {
      await runStageSelectorDemo(doc, { signal: controller.signal })
    }
  } catch (error) {
    if ((error as DOMException)?.name === 'AbortError') return
    console.warn('[obs demo]', error)
  }
}

function onFrameLoad() {
  touchOverlayRef.value?.rebind()
  void startDemoIfNeeded()
}

watch(demoKind, () => {
  // query 变化且 iframe 已在时重跑；通常靠 load
  if (frameRef.value?.contentDocument && frameRef.value.contentDocument.URL !== 'about:blank') {
    void startDemoIfNeeded()
  }
})

onMounted(() => {
  document.documentElement.classList.add('obs-capture')
})

onUnmounted(() => {
  stopDemo()
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
        ref="frameRef"
        class="obs-frame"
        title="OBS nested viewport"
        :src="embedSrc"
        referrerpolicy="same-origin"
        @load="onFrameLoad"
      />

      <TouchPointerOverlay
        v-if="showTouch"
        ref="touchOverlayRef"
        :host="frameRef"
        :enabled="showTouch"
      />

      <Transition name="storyboard-caption">
        <div
          v-if="storyboardCue && ((showCaption && storyboardCue.voiceover) || showSceneNumber)"
          class="storyboard-caption"
          :class="{ 'storyboard-caption--brand': storyboardCue.brand }"
        >
          <div
            v-if="showCaption && storyboardCue.voiceover"
            class="storyboard-caption__voiceover"
          >
            {{ storyboardCue.voiceover }}
          </div>
          <div
            v-if="showSceneNumber"
            class="storyboard-caption__scene"
          >
            分镜 {{ storyboardCue.scene }}
          </div>
        </div>
      </Transition>

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

.storyboard-caption {
  position: absolute;
  z-index: 30;
  right: 18px;
  bottom: 48px;
  left: 18px;
  padding: 12px 16px;
  color: #fff;
  text-align: center;
  border: 1px solid rgba(205, 228, 247, 0.2);
  border-radius: 14px;
  background: rgba(4, 14, 28, 0.68);
  box-shadow: 0 12px 30px rgba(0, 5, 18, 0.3);
  backdrop-filter: blur(16px) saturate(1.35);
  pointer-events: none;

  &__voiceover {
    color: rgba(255, 255, 255, 0.96);
    font-size: 13px;
    font-weight: 500;
    line-height: 1.55;
    text-wrap: balance;
    text-shadow: 0 1px 4px rgba(0, 5, 18, 0.8);
  }

  &__scene {
    margin-top: 9px;
    color: rgba(205, 228, 247, 0.68);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
  }

  &--brand {
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 32px;
    border: 0;
    border-radius: 0;
    background: rgba(1, 8, 18, 0.72);

    .storyboard-caption__voiceover {
      font-size: 15px;
    }

    .storyboard-caption__scene {
      position: absolute;
      right: 0;
      bottom: 28px;
      left: 0;
      margin-top: 0;
    }
  }
}

.storyboard-caption-enter-active,
.storyboard-caption-leave-active {
  transition: opacity 240ms ease, transform 240ms ease;
}

.storyboard-caption-enter-from,
.storyboard-caption-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.storyboard-caption--brand.storyboard-caption-enter-from,
.storyboard-caption--brand.storyboard-caption-leave-to {
  transform: none;
}
</style>
