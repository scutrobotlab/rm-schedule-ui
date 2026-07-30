import { createRouter, createWebHistory } from 'vue-router'
import Index from "../pages/index.vue";
import ExportGraph from "../pages/ExportGraph.vue";
import Forecast from "../pages/Forecast.vue";
import Bracket from "../pages/Bracket.vue";
import Obs from "../pages/Obs.vue";
import { DefaultZoneMap, ZoneMap } from "../constant/zone";
import pinia from '../stores'
import { useAppStore } from '../stores/app'
import { explicitBracketFallbackPath } from '../utils/bracket_route'

function latestSeason(): number {
  return Number(Object.keys(ZoneMap).slice(-1)[0])
}

const routes = [
  { path: '/', component: Index },
  // 静态路径必须在 /:season 之前，否则会被当成 season 参数
  { path: '/forecast', component: Forecast },
  { path: '/obs', component: Obs },
  { path: '/bracket', component: Bracket },
  { path: '/:season/:zoneId/bracket', component: Bracket },
  { path: '/:season', component: Index },
  { path: '/:season/:zoneId/export', component: ExportGraph },
  { path: '/:season/:zoneId', component: Index },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const fallbackPath = explicitBracketFallbackPath(to.path)
  if (fallbackPath == null) return true

  const appStore = useAppStore(pinia)
  await appStore.loadGlobalConfig()
  if (appStore.isTestEnvironment) {
    if (to.path !== '/bracket') return true

    const season = latestSeason()
    return {
      path: `/${season}/${DefaultZoneMap[season]}/bracket`,
      query: to.query,
      hash: to.hash,
      replace: true,
    }
  }

  return {
    path: fallbackPath,
    query: to.query,
    hash: to.hash,
    replace: true,
  }
})

export default router
