/** 按可见列数控制晋级图信息密度 */
export type BracketDensity = 'comfortable' | 'normal' | 'compact'

export function resolveBracketDensity(columnCount: number): BracketDensity {
  if (columnCount <= 2) return 'comfortable'
  if (columnCount <= 4) return 'normal'
  return 'compact'
}
