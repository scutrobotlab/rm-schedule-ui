<template>
  <v-app>
    <div v-if="appStore.isTestEnvironment" class="test-environment-badge">
      测试环境
    </div>
    <v-main>
      <AnniversaryAnnouncement v-if="!hideGlobalAnnouncements"/>
      <UpdateAnnouncement v-if="!hideGlobalAnnouncements"/>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "./stores/app";
import AnniversaryAnnouncement from "./components/AnniversaryAnnouncement.vue";
import UpdateAnnouncement from "./components/UpdateAnnouncement.vue";
import { isMobileDevice } from "./utils/mobile";

const route = useRoute()
const appStore = useAppStore()
/** 与 index 一致：移动端粘滞为 true，挂载后再确认一次，避免首屏误判仍弹全局公告 */
const mobileAtStartup = ref(isMobileDevice())

onMounted(() => {
  if (isMobileDevice()) mobileAtStartup.value = true
})

void appStore.loadGlobalConfig()

/** 竞猜海报 / 晋级图 / OBS 嵌套层不挂载全局公告，避免遮罩干扰全屏浏览、截图或录制 */
const hideGlobalAnnouncements = computed(() => {
  const path = route.path
  const mobileBracketActive =
    mobileAtStartup.value &&
    (path === '/' || /^\/\d+(?:\/\d+)?$/.test(path))
  return mobileBracketActive ||
    path === '/forecast' ||
    path === '/obs' ||
    path === '/bracket' ||
    path.endsWith('/bracket')
})

/**
 * 在 iframe 内（如 /obs 录制层）拿不到真实 env(safe-area-inset-*)，
 * 允许通过 query 注入模拟安全区，避免内容被状态栏或 Home 指示条压住。
 */
const SAFE_AREA_QUERY_VARS: Record<string, string> = {
  safe_top: '--app-safe-top',
  safe_right: '--app-safe-right',
  safe_bottom: '--app-safe-bottom',
  safe_left: '--app-safe-left',
}

watchEffect(() => {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  for (const [key, cssVar] of Object.entries(SAFE_AREA_QUERY_VARS)) {
    const raw = Array.isArray(route.query[key]) ? route.query[key][0] : route.query[key]
    const value = Number(raw)
    if (typeof raw === 'string' && Number.isFinite(value) && value >= 0) {
      root.style.setProperty(cssVar, `${value}px`)
    } else {
      root.style.removeProperty(cssVar)
    }
  }

  // /obs iframe 内隐藏系统光标，只保留指尖叠层
  root.classList.toggle('obs-touch-capture', route.query.capture != null)
})

/** 录制层（?capture=1）不自动弹公告，避免遮住画面 */
const isCaptureEmbed =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('capture')

if (!isCaptureEmbed) {
  appStore.initStore()
}
</script>

<style lang="scss">
:root {
  --app-safe-top: env(safe-area-inset-top, 0px);
  --app-safe-right: env(safe-area-inset-right, 0px);
  --app-safe-bottom: env(safe-area-inset-bottom, 0px);
  --app-safe-left: env(safe-area-inset-left, 0px);
  --app-canvas: #061321;
}

html,
body,
#app {
  margin: 0;
  background-color: var(--app-canvas);
}

/* 避免 Vuetify 默认底在圆角/合成层缝隙透出浅色发丝线 */
.v-application,
.v-application__wrap,
.v-main,
.v-main__wrap {
  background: transparent !important;
}

.test-environment-badge {
  position: fixed;
  z-index: 10000;
  bottom: max(10px, var(--app-safe-bottom));
  right: max(10px, var(--app-safe-right));
  padding: 5px 11px;
  border: 1px solid #fff;
  border-radius: 6px;
  background: rgb(194 55 24 / 92%);
  box-shadow: 0 2px 10px rgb(0 0 0 / 30%);
  color: #fff8dc;
  opacity: 0.9;
  font-family: 'MyFont', sans-serif;
  font-size: 13px;
  font-weight: 800;
  line-height: 20px;
  letter-spacing: 0.12em;
  pointer-events: none;
}

@media (min-width: 768px) {
  .test-environment-badge {
    padding: 8px 16px;
    border-width: 2px;
    border-radius: 8px;
    font-size: 17px;
    line-height: 24px;
  }
}

#app {
  font-family: Noto Sans SC, sans-serif;
  font-style: normal;
  font-weight: 400;
}

html.obs-touch-capture,
html.obs-touch-capture * {
  cursor: none !important;
}
</style>
