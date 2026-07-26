/**
 * 按可见列数控制晋级图信息密度。
 * 仅收缩字号/内边距/次要元信息；纵向对阵与席位永不截断。
 */
export type BracketDensity = 'comfortable' | 'normal' | 'compact'
export type BracketMotionState = 'live' | 'settle' | 'idle'
export type BracketSourceShortenLevel = 0 | 1 | 2 | 3

/** 0=不缩；1=≥3；2=≥4；3=≥5；4=≥6 */
export type BracketTitleShortenLevel = 0 | 1 | 2 | 3 | 4

export interface BracketTextTransition<T> {
  from: T
  to: T
  progress: number
}

export interface BracketVisualProgress {
  normal: number
  compact: number
  resultCard: number
  typeTag: number
  placeholderLogo: number
  pendingScore: number
}

const MAX_BRACKET_TITLE_UNITS = 6
const INTEGER_SPAN_EPSILON = 0.001

/**
 * 横向拖动会经过多次浮点加减，整数列宽可能变成 2.999999999。
 * 在密度和文字档位计算前吸附到整数，避免误进入相邻档位的过渡态。
 */
export function normalizeBracketVisibleSpan(visibleSpan: number): number {
  const rounded = Math.round(visibleSpan)
  return Math.abs(visibleSpan - rounded) < INTEGER_SPAN_EPSILON
    ? rounded
    : visibleSpan
}

export function resolveBracketDensity(columnCount: number): BracketDensity {
  if (columnCount <= 2) return 'comfortable'
  if (columnCount <= 4) return 'normal'
  return 'compact'
}

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/**
 * 连续列宽的视觉收缩进度。
 * comfortable → normal 发生在 2–3 列，normal → compact 发生在 4–5 列。
 */
export function resolveBracketVisualProgress(visibleSpan: number): BracketVisualProgress {
  return {
    normal: clampUnit(visibleSpan - 2),
    compact: clampUnit(visibleSpan - 4),
    resultCard: clampUnit(visibleSpan - 3),
    typeTag: 1 - clampUnit(visibleSpan - 3),
    placeholderLogo: 1 - clampUnit(visibleSpan - 3),
    pendingScore: 1 - clampUnit(visibleSpan - 4),
  }
}

/** 返回当前整数档与下一整数档，以及两者之间的连续混合比例。 */
export function resolveBracketTextTransition<T>(
  visibleSpan: number,
  resolve: (columnCount: number) => T,
): BracketTextTransition<T> {
  const clamped = Math.max(1, normalizeBracketVisibleSpan(visibleSpan))
  const lower = Math.floor(clamped)
  const upper = Math.ceil(clamped)
  return {
    from: resolve(lower),
    to: resolve(upper),
    progress: upper === lower ? 0 : clampUnit(clamped - lower),
  }
}

/**
 * 估算标题占用的显示宽度：中文/全角字符计 1，ASCII 字母数字计 0.5，
 * 空白、标点与符号不占单位。
 */
export function bracketDisplayUnits(title: string): number {
  let units = 0
  for (const char of title) {
    if (/[A-Za-z0-9]/.test(char)) {
      units += 0.5
    } else if (!/[\s\p{P}\p{S}\p{M}]/u.test(char)) {
      units += 1
    }
  }
  return units
}

/** 按可见列数解析标题缩减档位。 */
export function resolveBracketTitleShortenLevel(
  columnCount: number,
): BracketTitleShortenLevel {
  if (columnCount >= 6) return 4
  if (columnCount >= 5) return 3
  if (columnCount >= 4) return 2
  if (columnCount >= 3) return 1
  return 0
}

/** @deprecated 使用 resolveBracketTitleShortenLevel */
export function shouldShortenBracketTitle(columnCount: number): boolean {
  return resolveBracketTitleShortenLevel(columnCount) >= 1
}

/** @deprecated 使用 resolveBracketTitleShortenLevel */
export function shouldExtraShortenBracketTitle(columnCount: number): boolean {
  return resolveBracketTitleShortenLevel(columnCount) >= 2
}

/**
 * 按档位缩减已格式化标题。
 * 1：≥3 列基础语义缩减；2：≥4 列追加；3：≥5 列仅 16进8；4：≥6 列压缩瑞士轮轮次。
 */
export function shortenBracketTitle(
  title: string,
  level: BracketTitleShortenLevel = 1,
): string {
  if (level <= 0) return title

  let shortened = title

  // ≥3 列：晋级淘汰赛 3-0 → 晋级 3-0。
  shortened = shortened.replace(/晋级淘汰赛/g, '晋级')

  if (bracketDisplayUnits(shortened) > MAX_BRACKET_TITLE_UNITS) {
    const fits = () => bracketDisplayUnits(shortened) <= MAX_BRACKET_TITLE_UNITS

    // 瑞士轮第一轮 0胜0负 -> 第一轮 0-0
    shortened = shortened.replace(/^瑞士轮/, '')
    shortened = shortened.replace(/(\d+)胜(\d+)负/g, '$1-$2')
    if (!fits()) {
      // N进M 是硬约束，只移除其后的“淘汰赛”。
      shortened = shortened.replace(/^(\d+进\d+)淘汰赛$/, '$1')
    }
    if (!fits()) {
      // 16进8败者组第一轮/场 -> 16进8败者一
      shortened = shortened.replace(
        /^(\d+进\d+)败者组第?([零一二三四五六七八九十百两\d]+)(?:轮|场)$/,
        '$1败者$2',
      )
    }
    if (!fits()) {
      // 超长胜者组标题保留 N进M，并压缩其余修饰语。
      shortened = shortened.replace(/^(\d+进\d+)胜者组.*$/, '$1胜')
    }
    if (!fits()) {
      shortened = shortened.replace(/(?:全国赛|复活赛)名额争夺/, '名额争夺')
    }
    if (!fits()) {
      shortened = shortened.replace(/^([QW])组海外队伍小组赛$/, '$1组小组赛')
      shortened = shortened.replace(/^海外队伍淘汰赛$/, '海外淘汰')
    }
    if (!fits()) {
      // type-tag 已表达晋级/淘汰，超长时只保留战绩或去向。
      shortened = shortened.replace(/^晋级(?:淘汰赛)?\s*(?=\d+-\d+$)/, '')
      shortened = shortened.replace(/^晋级(?=(?:全国赛|复活赛|第二赛段))/, '')
      shortened = shortened.replace(/^淘汰\s*(?=\d+-\d+$)/, '')
    }
    if (!fits()) {
      shortened = shortened
        .replace(/冠军争夺战/g, '冠军战')
        .replace(/季军争夺战/g, '季军战')
    }
  }

  if (level >= 2) {
    // 仅带比分时去掉晋级：晋级全国赛 2-0 / 晋级复活赛 1-2
    shortened = shortened.replace(/^晋级(?=(?:全国赛|复活赛)\s+\d+-\d+$)/, '')
  }

  if (level >= 3) {
    // ≥5 列：仅压缩 16进8，不改动 8进4
    shortened = shortened
      .replace(/^16进8第一轮$/, '16进8一轮')
      .replace(/^16进8胜者组$/, '16进8胜者')
  }

  if (level >= 4) {
    // ≥6 列：第一轮 0-0 / 第二轮 1-0 -> 一轮 0-0 / 二轮 1-0
    shortened = shortened.replace(
      /^第([零一二三四五六七八九十百两\d]+)轮\s+(\d+-\d+)$/,
      '$1轮 $2',
    )
  }

  return shortened
}

/** 3→4 列期间保持节点右上角类型/去向标签挂载，以便连续淡出。 */
export function shouldShowBracketTypeTag(columnCount: number): boolean {
  return columnCount < 4
}

/** ≥6 列时隐藏校名；5 列仍显示二字简称。 */
export function shouldShowBracketTeamName(columnCount: number): boolean {
  return columnCount < 6
}

export interface TeamAbbreviation {
  abbreviation4: string
  abbreviation2: string
}

/** 3 列显示四字档、4–5 列显示二字档；其他列数显示校名。 */
export function resolveBracketTeamDisplayName(
  fullName: string,
  abbreviation: TeamAbbreviation | undefined,
  visibleSpan: number | undefined,
): string {
  if (visibleSpan != null && visibleSpan >= 2 && visibleSpan < 3) {
    const characters = Array.from(fullName)
    return characters.length > 7
      ? `${characters.slice(0, 7).join('')}…`
      : fullName
  }
  if (
    visibleSpan != null &&
    visibleSpan >= 4 &&
    visibleSpan < 6 &&
    abbreviation
  ) {
    return abbreviation.abbreviation2
  }
  if (
    visibleSpan != null &&
    visibleSpan >= 3 &&
    visibleSpan < 6 &&
    abbreviation
  ) {
    return abbreviation.abbreviation4
  }
  return fullName
}

/** ≥5 列时隐藏未确定席位的占位比分；真实队伍比分不受影响。 */
export function shouldShowBracketPendingScore(columnCount: number): boolean {
  return columnCount < 5
}

/** ≥5 列时仍展示未确定席位的来源文字，避免整行只剩空白。 */
export function shouldForceBracketPendingName(columnCount: number): boolean {
  return columnCount >= 5
}

/** ≥4 列时隐藏未确定队伍的红蓝 R 占位 Logo，真实校徽不受影响。 */
export function shouldShowBracketPlaceholderLogo(columnCount: number): boolean {
  return columnCount < 4
}

/**
 * 3 列起省略来源席位的轮次，避免「第一轮 第1名」被截断。
 */
export function shortenBracketSourceLabel(
  label: string,
  density: BracketDensity,
  matchSourceLevel: BracketSourceShortenLevel = 0,
): string {
  if (density === 'comfortable') return label

  const rankOnly = label.replace(
    /^第[零一二三四五六七八九十百两\d]+轮\s*第(\d+)名$/,
    '第$1名',
  )
  if (matchSourceLevel === 0) return rankOnly

  const compact = rankOnly
    .replace(/^第(\d+)场\s*胜者$/, '$1胜者')
    .replace(/^第(\d+)场\s*败者$/, '$1败者')
  if (matchSourceLevel === 1) return compact

  const extraCompact = compact
    .replace(/^(\d+)胜者$/, '$1胜')
    .replace(/^(\d+)败者$/, '$1败')
  if (matchSourceLevel === 2) return extraCompact

  return extraCompact.replace(/^第(\d+)名$/, '第$1')
}
