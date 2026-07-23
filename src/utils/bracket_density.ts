/**
 * 按可见列数控制晋级图信息密度。
 * 仅收缩字号/内边距/次要元信息；纵向对阵与席位永不截断。
 */
export type BracketDensity = 'comfortable' | 'normal' | 'compact'

export function resolveBracketDensity(columnCount: number): BracketDensity {
  if (columnCount <= 2) return 'comfortable'
  if (columnCount <= 4) return 'normal'
  return 'compact'
}

/** ≥4 列时隐藏节点右上角类型/去向标签 */
export function shouldShowBracketTypeTag(columnCount: number): boolean {
  return columnCount < 4
}

/** ≥6 列时隐藏校名，仅保留校徽与比分 */
export function shouldShowBracketTeamName(columnCount: number): boolean {
  return columnCount < 6
}
