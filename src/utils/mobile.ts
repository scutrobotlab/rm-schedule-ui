const MOBILE_UA_RE =
  /Android.+Mobile|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i

export function isMobileUserAgent(
  userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '',
): boolean {
  return MOBILE_UA_RE.test(userAgent)
}

export function isIOSDevice(
  userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '',
  platform = typeof navigator !== 'undefined' ? navigator.platform : '',
  maxTouchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0,
): boolean {
  // iPadOS 13+ 默认使用 Macintosh 桌面 UA，只能结合触控点识别。
  return /iPad|iPhone|iPod/i.test(userAgent) ||
    (platform === 'MacIntel' && maxTouchPoints > 1)
}

function hasTouchSignal(): boolean {
  if (typeof globalThis.matchMedia === 'function') {
    if (
      globalThis.matchMedia('(pointer: coarse)').matches ||
      globalThis.matchMedia('(any-pointer: coarse)').matches ||
      globalThis.matchMedia('(hover: none)').matches
    ) {
      return true
    }
  }
  return typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
}

/**
 * 启动时判断是否采用移动端布局。
 * 一旦上层将其粘滞为 true，不应再随旋转/缩放切回经典版。
 */
export function isMobileDevice(): boolean {
  const uaMobile = isMobileUserAgent()
  const touch = hasTouchSignal()

  if (typeof globalThis.matchMedia !== 'function') {
    return uaMobile || touch
  }

  const narrow = globalThis.matchMedia('(max-width: 767px)').matches

  // 常见路径：窄屏 + 触控
  if (narrow && touch) return true
  // 部分 WebView 首屏 viewport 未生效，宽度仍约 980；用手机 UA + 触控兜底
  if (uaMobile && touch) return true
  if (uaMobile && narrow) return true

  return false
}
