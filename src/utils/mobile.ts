/** 启动时判断是否采用移动端布局；页面生命周期内不随旋转或缩放切换。 */
export function isMobileDevice(): boolean {
  if (typeof globalThis.matchMedia !== 'function') {
    return false
  }

  const narrow = globalThis.matchMedia('(max-width: 767px)').matches
  if (!narrow) return false

  // 部分 WebView / 外接键鼠场景下 pointer:coarse 首屏不可靠，放宽触控信号。
  return globalThis.matchMedia('(pointer: coarse)').matches ||
    globalThis.matchMedia('(any-pointer: coarse)').matches ||
    globalThis.matchMedia('(hover: none)').matches ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
}
