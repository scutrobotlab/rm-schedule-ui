export const SCHEDULE_REFRESH_INTERVAL_MS = 30_000

const staticArchivedSeasons = new Set([2024, 2025])
const staticArchivedZoneMap = new Map<number, Set<number>>([
  [2026, new Set([614, 615, 616])],
])

export function isStaticArchivedZone(season: number, zoneId: number): boolean {
  return staticArchivedSeasons.has(season) || !!staticArchivedZoneMap.get(season)?.has(zoneId)
}
