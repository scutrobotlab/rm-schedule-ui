import type { BracketDensity } from './bracket_density'

/** 与 BracketColumn 样式中 `.column-items` gap 保持一致 */
export function bracketColumnGap(density: BracketDensity, wide = false): number {
  if (density === 'compact') return 4
  if (density === 'normal') return 6
  return wide ? 12 : 8
}
