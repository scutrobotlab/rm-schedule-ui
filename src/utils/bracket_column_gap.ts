import {
  resolveBracketVisualProgress,
  type BracketDensity,
} from './bracket_density'

/** 与 BracketColumn 样式中 `.column-items` gap 保持一致 */
export function bracketColumnGap(density: BracketDensity, wide = false): number {
  if (density === 'compact') return 4
  if (density === 'normal') return 6
  return wide ? 12 : 8
}

/** 与连续 density CSS 变量保持一致的树形布局间距。 */
export function bracketColumnGapForSpan(visibleSpan: number, wide = false): number {
  const progress = resolveBracketVisualProgress(visibleSpan)
  const comfortableGap = wide ? 12 : 8
  return comfortableGap
    - (comfortableGap - 6) * progress.normal
    - 2 * progress.compact
}
