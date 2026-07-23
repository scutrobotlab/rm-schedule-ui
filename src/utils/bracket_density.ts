/**
 * 按可见列数控制晋级图信息密度。
 * 仅收缩字号/内边距/次要元信息；纵向对阵与席位永不截断。
 */
export type BracketDensity = 'comfortable' | 'normal' | 'compact'

const MAX_BRACKET_TITLE_UNITS = 6

export function resolveBracketDensity(columnCount: number): BracketDensity {
  if (columnCount <= 2) return 'comfortable'
  if (columnCount <= 4) return 'normal'
  return 'compact'
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

/** 视口内至少可见 3 列时，允许对超长标题进行语义缩减。 */
export function shouldShortenBracketTitle(columnCount: number): boolean {
  return columnCount >= 3
}

/**
 * 仅缩减超过 6 个显示单位的已格式化标题；每条规则都保留标题语义，
 * 尤其不会移除淘汰赛标题中的 N进M。
 */
export function shortenBracketTitle(title: string): string {
  if (bracketDisplayUnits(title) <= MAX_BRACKET_TITLE_UNITS) return title

  let shortened = title
  const fits = () => bracketDisplayUnits(shortened) <= MAX_BRACKET_TITLE_UNITS

  // 瑞士轮第一轮 0胜0负 -> 第一轮 0-0
  shortened = shortened.replace(/^瑞士轮/, '')
  shortened = shortened.replace(/(\d+)胜(\d+)负/g, '$1-$2')
  if (fits()) return shortened

  // N进M 是硬约束，只移除其后的“淘汰赛”。
  shortened = shortened.replace(/^(\d+进\d+)淘汰赛$/, '$1')
  if (fits()) return shortened

  // 16进8败者组第一轮/场 -> 16进8败者一
  shortened = shortened.replace(
    /^(\d+进\d+)败者组第?([零一二三四五六七八九十百两\d]+)(?:轮|场)$/,
    '$1败者$2',
  )
  if (fits()) return shortened

  // 超长胜者组标题保留 N进M，并压缩其余修饰语。
  shortened = shortened.replace(/^(\d+进\d+)胜者组.*$/, '$1胜')
  if (fits()) return shortened

  shortened = shortened.replace(/(?:全国赛|复活赛)名额争夺/, '名额争夺')
  if (fits()) return shortened

  shortened = shortened.replace(/^([QW])组海外队伍小组赛$/, '$1组小组赛')
  shortened = shortened.replace(/^海外队伍淘汰赛$/, '海外淘汰')
  if (fits()) return shortened

  // type-tag 已表达晋级/淘汰，超长时只保留战绩或去向。
  shortened = shortened.replace(/^晋级(?:淘汰赛)?\s*(?=\d+-\d+$)/, '')
  shortened = shortened.replace(/^晋级(?=(?:全国赛|复活赛|第二赛段))/, '')
  shortened = shortened.replace(/^淘汰\s*(?=\d+-\d+$)/, '')
  if (fits()) return shortened

  shortened = shortened
    .replace(/冠军争夺战/g, '冠军战')
    .replace(/季军争夺战/g, '季军战')

  return shortened
}

/** ≥4 列时隐藏节点右上角类型/去向标签 */
export function shouldShowBracketTypeTag(columnCount: number): boolean {
  return columnCount < 4
}

/** ≥6 列时隐藏校名，仅保留校徽与比分 */
export function shouldShowBracketTeamName(columnCount: number): boolean {
  return columnCount < 6
}
