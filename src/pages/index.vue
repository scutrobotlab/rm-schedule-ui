<template>
  <Bracket v-if="showBracketByExperiment"/>
  <template v-else-if="appStore.globalConfigLoaded">
    <Situation/>
    <About/>
  </template>
  <div v-else class="page-loading" aria-hidden="true"/>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import About from '../components/About.vue'
import Situation from '../components/Situation.vue'
import Bracket from './Bracket.vue'
import { useAppStore } from '../stores/app'
import { isMobileDevice } from '../utils/mobile'

const appStore = useAppStore()
const mobileAtStartup = isMobileDevice()

const showBracketByExperiment = computed(() =>
  appStore.globalConfigLoaded &&
  mobileAtStartup &&
  appStore.mobileBracketEnabled,
)
</script>

<style scoped>
.page-loading {
  min-height: 100dvh;
  background: var(--app-canvas);
}
</style>
