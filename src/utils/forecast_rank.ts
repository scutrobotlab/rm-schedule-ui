/** 从预测占位文案中解析「第N名」 */
export function rankFromForecastText(text?: string): number | null {
  const match = text?.match(/第(\d+)名/)
  return match ? Number(match[1]) : null
}

/** 按 text 行序解析结构席位（不必连续、不必升序） */
export function parseSeedSlots(texts: string[]): number[] {
  return texts
    .map((text) => rankFromForecastText(text))
    .filter((rank): rank is number => rank != null)
}

/**
 * 将已确定队伍的接口 rank（相对强弱）映射到结构席位 seed。
 * 第 i 强 → sorted(unique(seedSlots))[i]
 */
export function assignForecastSeeds(
  determined: { id: string; apiRank: number }[],
  seedSlots: number[],
): Map<string, number> {
  const sortedSeeds = [...new Set(seedSlots)].sort((a, b) => a - b)
  const sorted = [...determined]
    .filter((item) => item.apiRank > 0)
    .sort((a, b) => a.apiRank - b.apiRank)

  const result = new Map<string, number>()
  sorted.forEach((item, index) => {
    const seed = sortedSeeds[index]
    if (seed != null) result.set(item.id, seed)
  })
  return result
}

export type ForecastDetermined = {
  id: string
  apiRank: number
}

export type ForecastRow<T extends ForecastDetermined = ForecastDetermined> = {
  /** 该行结构席位（来自 text「第N名」） */
  seed: number | null
  placeholderText: string
  playerId?: string
  determined?: T
}

/**
 * 按 text 固定行序构建预测列：行数始终等于 texts.length，
 * 已确定队伍按强弱映射到结构 seed 后落入对应行，其余行为占位。
 */
export function buildForecastRows<T extends ForecastDetermined>(
  texts: string[],
  determined: T[],
): ForecastRow<T>[] {
  const seedSlots = texts.map((text) => rankFromForecastText(text))
  const validSlots = seedSlots.filter((seed): seed is number => seed != null)
  const seedByPlayerId = assignForecastSeeds(determined, validSlots)

  const playerBySeed = new Map<number, T>()
  for (const item of determined) {
    const seed = seedByPlayerId.get(item.id)
    if (seed != null) playerBySeed.set(seed, item)
  }

  return texts.map((text, index) => {
    const seed = seedSlots[index]
    const player = seed != null ? playerBySeed.get(seed) : undefined
    return {
      seed,
      placeholderText: text,
      playerId: player?.id,
      determined: player,
    }
  })
}

/**
 * 预测引导线：forecasts 的 red/blue 为结构名次，
 * 连到 seedSlots（text 行序）中该名次的下标。
 */
export function resolveForecastGuidePairs(
  forecasts: { red: number; blue: number }[],
  seedSlots: number[],
): { from: number; to: number }[] {
  return forecasts
    .map((forecast) => ({
      from: seedSlots.indexOf(forecast.red),
      to: seedSlots.indexOf(forecast.blue),
    }))
    .filter((pair) => pair.from >= 0 && pair.to >= 0)
}
