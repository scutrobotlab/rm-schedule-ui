/** 启动时判断是否采用移动端布局；页面生命周期内不随旋转或缩放切换。 */
export function isMobileDevice(): boolean {
  if (typeof globalThis.matchMedia !== 'function') {
    return false
  }

  return globalThis.matchMedia('(max-width: 767px)').matches &&
    globalThis.matchMedia('(pointer: coarse)').matches
}
