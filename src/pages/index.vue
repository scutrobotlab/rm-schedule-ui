<template>
  <Bracket v-if="useBracket"/>
  <template v-else-if="readyForLegacy">
    <Situation/>
    <About/>
  </template>
  <div v-else class="page-loading" aria-hidden="true"/>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import About from '../components/About.vue'
import Situation from '../components/Situation.vue'
import Bracket from './Bracket.vue'
import { useAppStore } from '../stores/app'
import { isMobileDevice } from '../utils/mobile'

const appStore = useAppStore()

/** 移动端一律进 Bracket，无视灰度 / consent；一旦判定为移动端则粘滞，不随旋转回退。 */
const useBracket = ref(isMobileDevice())
const mobileRecheckDone = ref(false)

onMounted(() => {
  // 部分移动浏览器首屏 matchMedia 未就绪；若此时误挂 Situation，
  // 会先 redirect 到 /:season/:zoneId，且路由复用后不会重跑 setup。
  if (isMobileDevice()) useBracket.value = true
  mobileRecheckDone.value = true
})

const readyForLegacy = computed(() =>
  !useBracket.value &&
  mobileRecheckDone.value &&
  appStore.globalConfigLoaded,
)
</script>

<style scoped>
.page-loading {
  min-height: 100dvh;
  background: var(--app-canvas);
}

</style>
