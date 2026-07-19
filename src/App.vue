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
#app {
  font-family: Noto Sans SC, sans-serif;
  font-style: normal;
  font-weight: 400;
}
</style>
