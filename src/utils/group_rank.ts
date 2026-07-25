import type { GroupRankInfo } from '../types/group_rank_info'

export type GroupRankStatName = '胜场数' | '对手分'

export function resolveGroupRankStat(
  data: GroupRankInfo,
  zoneId: number,
  groupCode: string,
  collegeName: string | undefined,
  itemName: GroupRankStatName,
): string {
  if (!collegeName) return '—'
  const zone = data.zones?.find((item) => item.zoneId === String(zoneId))
  const group = zone?.groups.find((item) => item.groupName === `${groupCode}组`)
  const player = group?.groupPlayers.find(
    (items) => items[0]?.itemValue?.collegeName === collegeName,
  )
  if (!player) return '—'

  const direct = player.find((item) => item.itemName === itemName)?.itemValue
  if (direct != null) return String(direct)
  if (itemName === '胜场数') {
    const record = player.find((item) => item.itemName === '胜/平/负')?.itemValue
    return String(record ?? '').split('/')[0] || '—'
  }
  return '—'
}
