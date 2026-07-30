/** 显式晋级图入口仅用于测试环境；正式环境的新 UI 只能通过普通赛程页灰度进入。 */
export function explicitBracketFallbackPath(path: string): string | null {
  if (path === '/bracket') return '/'
  if (path.endsWith('/bracket')) return path.slice(0, -'/bracket'.length) || '/'
  return null
}
