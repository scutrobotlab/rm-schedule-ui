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

function defaultSeasonZonePath(season = latestSeason()): string {
  return `/${season}/${DefaultZoneMap[season]}`
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
  if (fallbackPath != null) {
    // TEMP debug: allow explicit bracket routes locally
    if (to.path !== '/bracket') return true

    return {
      path: `${defaultSeasonZonePath()}/bracket`,
      query: to.query,
      hash: to.hash,
      replace: true,
    }
  }

  // 规范化入口，避免 Index 先在 `/` 挂载再被子组件 redirect，导致移动端判定只跑一次。
  if (to.path === '/') {
    return {
      path: defaultSeasonZonePath(),
      query: to.query,
      hash: to.hash,
      replace: true,
    }
  }

  const seasonParam = Array.isArray(to.params.season) ? to.params.season[0] : to.params.season
  if (
    typeof seasonParam === 'string' &&
    /^\d+$/.test(seasonParam) &&
    to.params.zoneId == null &&
    ZoneMap[Number(seasonParam)]
  ) {
    return {
      path: defaultSeasonZonePath(Number(seasonParam)),
      query: to.query,
      hash: to.hash,
      replace: true,
    }
  }

  return true
})

export default router
