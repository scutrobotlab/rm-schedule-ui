import axios, { type AxiosResponse } from 'axios'
import type { CurrentMatchForecastResp } from '../types/current_match_forecast'

/** 竞猜接口超时；配合海报 12s 资源上限，避免拖到后端全局渲染超时。 */
export const FORECAST_API_TIMEOUT_MS = 10_000

/**
 * 单次拉取当前进行中比赛的竞猜预测。
 * 不做轮询；海报预览/导出各自调用一次即可。
 */
export async function fetchCurrentMatchForecast(): Promise<CurrentMatchForecastResp> {
  try {
    const response: AxiosResponse<CurrentMatchForecastResp> = await axios({
      method: 'GET',
      url: '/api/current_match_forecast',
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
export function normalizeForecastResp(raw: CurrentMatchForecastResp): CurrentMatchForecastResp {
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

function normalizeSide(side: CurrentMatchForecastResp['red_side']) {
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

/** 拼装页眉比赛元信息；slug 为 null 时省略阶段文字。 */
export function formatMatchMeta(data: Pick<CurrentMatchForecastResp, 'zone_name' | 'slug' | 'order_number'>): string {
  const zone = (data.zone_name || '').trim()
  const stage = data.slug
  const order = Number.isFinite(data.order_number) ? data.order_number : 0
  const parts: string[] = []
  if (zone) parts.push(zone)
  if (stage) parts.push(`${stage} 第${order}场`)
  else parts.push(`第${order}场`)
  return `<< ${parts.join(' | ')}`
}

/** 支持率是否可用于展示（不可用时不得显示 0%）。 */
export function hasValidSupportRate(rate: number): boolean {
  return Number.isFinite(rate) && rate >= 0
}
