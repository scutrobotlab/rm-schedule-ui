import type { GroupType, ZoneNodeData } from '../types/zone'

export function knockoutResultBadge(
  group: GroupType,
  nodeType: ZoneNodeData['type'],
): string | null {
  if (group !== 'Knockout') return null
  if (nodeType === 'promote') return '晋级'
  if (nodeType === 'eliminate') return '淘汰'
  return null
}
