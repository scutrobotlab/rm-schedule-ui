import axios, { type AxiosResponse } from 'axios'
import type { MatchForecastResp } from '../types/match_forecast'
import { SeasonList, ZoneMap } from '../constant/zone'

/** 竞猜接口超时；配合海报 12s 资源上限，避免拖到后端全局渲染超时。 */
export const FORECAST_API_TIMEOUT_MS = 10_000

/**
 * 单次拉取指定比赛或当前进行中比赛的竞猜预测。
 * matchId 未传时由后端选择当前进行中的比赛。
 * 不做轮询；海报预览/导出各自调用一次即可。
 */
export async function fetchMatchForecast(matchId?: string): Promise<MatchForecastResp> {
  try {
    const response: AxiosResponse<MatchForecastResp> = await axios({
      method: 'GET',
      url: '/api/match_forecast',
      params: matchId === undefined ? undefined : { match_id: matchId },
      timeout: FORECAST_API_TIMEOUT_MS,
    })
    return normalizeForecastResp(response.data)
  } catch (err) {
    if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
      throw new Error(`竞猜接口超时（${FORECAST_API_TIMEOUT_MS / 1000}s）`)
    }
    throw err
  }
}

/** 将 slug 等松散字段规范成前端可用形态。 */
export function normalizeForecastResp(raw: MatchForecastResp): MatchForecastResp {
  return {
    ...raw,
    // 后端 slug 为 interface{}，运行时可能非 string
    slug: normalizeSlug(raw.slug as unknown),
    support_rate_deadline: raw.support_rate_deadline ?? '',
    red_side: normalizeSide(raw.red_side),
    blue_side: normalizeSide(raw.blue_side),
  }
}

function normalizeSlug(slug: unknown): string | null {
  if (slug == null) return null
  if (typeof slug !== 'string') {
    const asString = String(slug).trim()
    return asString === '' ? null : asString
  }
  const trimmed = slug.trim()
  return trimmed === '' ? null : trimmed
}

function normalizeSide(side: MatchForecastResp['red_side']) {
  return {
    support_rate: Number(side?.support_rate ?? -1),
    support_rate_percent: Number(side?.support_rate_percent ?? -1),
    team_info: {
      team_id: side?.team_info?.team_id ?? '',
      team_name: side?.team_info?.team_name ?? '',
      college_logo: side?.team_info?.college_logo ?? '',
      college_name: side?.team_info?.college_name ?? '',
    },
  }
}

/** 由 zone_id 反查赛季；未知时取 SeasonList 最新一年。 */
export function resolveForecastSeason(zoneId?: number): number {
  if (Number.isFinite(zoneId) && zoneId! > 0) {
    for (const season of SeasonList) {
      const zones = ZoneMap[season]
      if (zones?.some((z) => z.id === zoneId)) return season
    }
  }
  return SeasonList[SeasonList.length - 1] ?? new Date().getFullYear()
}

/**
 * 拼装页眉比赛元信息。
 * 格式：`< RMUC {赛季} {赛区} ｜ {阶段} 第{N}场`；slug 为 null 时省略阶段文字。
 */
export function formatMatchMeta(
  data: Pick<MatchForecastResp, 'zone_name' | 'slug' | 'order_number' | 'zone_id'>,
): string {
  const season = resolveForecastSeason(data.zone_id)
  const zone = (data.zone_name || '').trim() || '未知赛区'
  const stage = data.slug
  const order = Number.isFinite(data.order_number) ? data.order_number : 0
  const tail = stage ? `${stage} 第${order}场` : `第${order}场`
  return `< RMUC ${season} ${zone} ｜ ${tail}`
}

/** 无进行中比赛时的元信息占位。 */
export function formatMatchMetaEmpty(zoneId?: number): string {
  const season = resolveForecastSeason(zoneId)
  return `<< RMUC ${season} ｜ 暂无进行中比赛`
}

/** 支持率是否可用于展示（不可用时不得显示 0%）。 */
export function hasValidSupportRate(rate: number): boolean {
  return Number.isFinite(rate) && rate >= 0
}
