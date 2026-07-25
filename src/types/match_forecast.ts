/** 与后端 MatchForecastResp 对齐。 */
export interface MatchForecastResp {
  publish_time: string
  /** 东八区，精确到分钟；上游未查到时可能为空串。 */
  support_rate_deadline: string
  zone_name: string
  zone_id: number
  current: MatchForecast
  next: MatchForecast
}

/** 单场预测对象（snake_case JSON）。 */
export interface MatchForecast {
  has_match: boolean
  order_number: number
  /** schedule 透传；分组赛常见为 null。 */
  slug: string | null
  match_id: number
  /** 与当前查询对应的海报 PNG 地址。 */
  image_url: string
  red_side: ForecastSide
  blue_side: ForecastSide
}

export interface ForecastSide {
  team_info: ForecastTeamInfo
  /** 0~1；不可用时为 -1。 */
  support_rate: number
  /** 0~100；不可用时为 -1。不得把 -1 渲染成 0%。 */
  support_rate_percent: number
}

export interface ForecastTeamInfo {
  team_id: string
  team_name: string
  /** 绝对 URL，或本服务相对路径（如 /api/static/...）。 */
  college_logo: string
  college_name: string
}
