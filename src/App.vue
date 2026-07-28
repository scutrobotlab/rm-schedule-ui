<template>
  <v-app>
    <v-main>
      <AnniversaryAnnouncement v-if="!hideGlobalAnnouncements"/>
      <UpdateAnnouncement v-if="!hideGlobalAnnouncements"/>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "./stores/app";
import AnniversaryAnnouncement from "./components/AnniversaryAnnouncement.vue";
import UpdateAnnouncement from "./components/UpdateAnnouncement.vue";

const route = useRoute()
const appStore = useAppStore()

/** 竞猜海报 / 晋级图 / OBS 嵌套层不挂载全局公告，避免遮罩干扰全屏浏览、截图或录制 */
const hideGlobalAnnouncements = computed(() => {
  const path = route.path
  return path === '/forecast' || path === '/obs' || path === '/bracket' || path.endsWith('/bracket')
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
