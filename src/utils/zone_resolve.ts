import { Part, Zone, ZoneMap } from '../constant/zone'

export type ZonePartResolveResult =
  | { zone: Zone; part: Part }
  | { error: string }

export function resolveZonePart(season: number, zoneId: number, groupIndex: number): ZonePartResolveResult {
  const zones = ZoneMap[season]
  if (!zones) {
    return { error: `Season ${season} not found` }
  }
  const zone = zones.find((z) => z.id === zoneId)
  if (!zone) {
    return { error: `Zone ${zoneId} not found in season ${season}` }
  }
  const part = zone.parts[groupIndex]
  if (!part) {
    return { error: `Group index ${groupIndex} not found for zone ${zoneId}` }
  }
  return { zone, part }
}
