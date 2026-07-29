<script setup lang="ts">
import MatchGraph from '../components/MatchGraph.vue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePromotionStore } from '../stores/promotion'
import { useAppStore } from '../stores/app'
import { resolveZonePart } from '../utils/zone_resolve'
import { addTestEnvironmentBadge } from '../utils/test_environment_badge'

const route = useRoute()
const promotionStore = usePromotionStore()
const appStore = useAppStore()

const seasonRaw = String(route.params.season ?? '')
const zoneIdRaw = String(route.params.zoneId ?? '')
const groupRaw = String(route.query.group ?? '0')

const season = Number(seasonRaw)
const zoneId = Number(zoneIdRaw)
const groupIndex = Number(groupRaw)

const status = ref<'pending' | 'ready' | 'error'>('pending')
const base64 = ref('')

const graphRef = ref<InstanceType<typeof MatchGraph>>()

function setError(message: string) {
  status.value = 'error'
  base64.value = message
}

function isValidNonNegativeInt(value: number): boolean {
  return Number.isInteger(value) && value >= 0
}

const paramsValid =
  isValidNonNegativeInt(season) && isValidNonNegativeInt(zoneId) && isValidNonNegativeInt(groupIndex)

if (!paramsValid) {
  setError(`Invalid params: season=${seasonRaw}, zone=${zoneIdRaw}, group=${groupRaw}`)
} else {
  promotionStore.season = season
  promotionStore.zoneId = zoneId
}

const resolved = computed(() => resolveZonePart(season, zoneId, groupIndex))

if (paramsValid && 'error' in resolved.value) {
  setError(resolved.value.error)
}

async function onReady() {
  try {
    await appStore.loadGlobalConfig()
    const exportedDataUrl = await graphRef.value?.exportImage()
    const dataUrl = exportedDataUrl && appStore.isTestEnvironment
      ? await addTestEnvironmentBadge(exportedDataUrl)
      : exportedDataUrl
    if (!dataUrl) {
      setError('exportImage returned empty result')
      return
    }
    const prefix = 'data:image/png;base64,'
    base64.value = dataUrl.startsWith(prefix) ? dataUrl.slice(prefix.length) : dataUrl
    status.value = 'ready'
  } catch (err) {
    setError(err instanceof Error ? err.message : String(err))
  }
}

function onError(message: string) {
  setError(message)
}
</script>

<template>
  <pre id="schedule-export-output" style="display:none" :data-status="status">{{ base64 }}</pre>
  <MatchGraph
    v-if="paramsValid && 'part' in resolved"
    ref="graphRef"
    export-mode
    :zone-id="zoneId"
    :type="resolved.part.type"
    :group="resolved.part.group"
    :json-data="resolved.part.jsonData"
    :round-order="resolved.part.roundOrder"
    :extra-title-data="resolved.part.extraTitleData"
    :extra-image-data="resolved.part.extraImageData"
    @ready="onReady"
    @error="onError"
  />
</template>
