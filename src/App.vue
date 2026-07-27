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
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "./stores/app";
import AnniversaryAnnouncement from "./components/AnniversaryAnnouncement.vue";
import UpdateAnnouncement from "./components/UpdateAnnouncement.vue";

const route = useRoute()
const appStore = useAppStore()

/** 竞猜海报 / 晋级图不挂载全局公告，避免遮罩干扰全屏浏览或截图 */
const hideGlobalAnnouncements = computed(() => {
  const path = route.path
  return path === '/forecast' || path === '/bracket' || path.endsWith('/bracket')
})

appStore.initStore()
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
</style>
