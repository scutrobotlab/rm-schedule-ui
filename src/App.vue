<template>
  <v-app>
    <v-main>
      <AnniversaryAnnouncement v-if="!isForecastRoute"/>
      <UpdateAnnouncement v-if="!isForecastRoute"/>
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

/** 竞猜海报路由不挂载全局公告，避免遮罩进入 chromedp 截图 */
const isForecastRoute = computed(() => route.path === '/forecast')

appStore.initStore()
</script>

<style lang="scss">
#app {
  font-family: Noto Sans SC, sans-serif;
  font-style: normal;
  font-weight: 400;
}
</style>
