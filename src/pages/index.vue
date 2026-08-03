<template>
  <Bracket v-if="useBracket"/>
  <template v-else-if="readyForLegacy">
    <Situation :mobile-ui-switch-available="mobileDetected"/>
    <About/>
  </template>
  <div v-else class="page-loading" aria-hidden="true"/>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import About from '../components/About.vue'
import Situation from '../components/Situation.vue'
import Bracket from './Bracket.vue'
import { isMobileDevice } from '../utils/mobile'
import { useAppStore } from '../stores/app'
import { shouldUseMobileBracket } from '../utils/mobile_bracket_consent'

const appStore = useAppStore()
/** 移动端识别一旦为 true 则粘滞；用户偏好仍可实时切换 UI。 */
const mobileDetected = ref(isMobileDevice())
const allowLegacy = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
let mediaQuery: MediaQueryList | null = null

function promoteBracket() {
  if (isMobileDevice()) mobileDetected.value = true
}

onMounted(() => {
  promoteBracket()

  // 首屏 matchMedia / viewport 可能滞后数帧甚至数百毫秒。
  // 即使 Situation 已挂载并完成 redirect，后续仍可升级到 Bracket，无需整页刷新。
  for (const ms of [0, 50, 100, 250, 500, 1000]) {
    timers.push(setTimeout(promoteBracket, ms))
  }

  // 宽限后再挂经典版，降低误进 Situation 抢跑 redirect 的概率。
  timers.push(setTimeout(() => {
    allowLegacy.value = true
  }, 300))

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    mediaQuery = window.matchMedia('(max-width: 767px)')
    mediaQuery.addEventListener('change', promoteBracket)
  }
})

onBeforeUnmount(() => {
  for (const timer of timers) clearTimeout(timer)
  mediaQuery?.removeEventListener('change', promoteBracket)
})

const useBracket = computed(() => shouldUseMobileBracket(
  mobileDetected.value,
  appStore.mobileBracketConsent,
))
const readyForLegacy = computed(() =>
  !useBracket.value &&
  (allowLegacy.value || appStore.mobileBracketConsent === 'declined'),
)
</script>

<style scoped>
.page-loading {
  min-height: 100dvh;
  background: var(--app-canvas);
}

</style>
