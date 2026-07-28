/** OBS / demo：在同源 iframe 内合成可信度不足的 PointerEvent，驱动真实组件手势。 */

export interface Point {
  x: number
  y: number
}

export interface PointerStrokeOptions {
  /** 与一次手势绑定的 pointerId */
  pointerId?: number
  pointerType?: 'touch' | 'mouse' | 'pen'
  /** 按下到抬起的总时长（仅 drag） */
  durationMs?: number
  /** 拖动插值步数；默认按 ~60fps */
  steps?: number
  signal?: AbortSignal
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  assertNotAborted(signal)
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/** ease-in-out cubic，拖动更像真人 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function viewOf(target: Element): Window & typeof globalThis {
  return (target.ownerDocument.defaultView ?? window) as Window & typeof globalThis
}

function centerOf(el: Element): Point {
  const rect = el.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

function dispatchPointer(
  target: Element,
  type: string,
  point: Point,
  opts: {
    pointerId: number
    pointerType: string
    buttons: number
    button?: number
  },
) {
  const view = viewOf(target)
  const Ctor = view.PointerEvent
  const event = new Ctor(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    view,
    clientX: point.x,
    clientY: point.y,
    screenX: point.x,
    screenY: point.y,
    pointerId: opts.pointerId,
    pointerType: opts.pointerType,
    isPrimary: true,
    button: opts.button ?? 0,
    buttons: opts.buttons,
    pressure: opts.buttons > 0 ? 0.5 : 0,
  })
  target.dispatchEvent(event)
}

export async function waitForSelector(
  root: ParentNode,
  selector: string,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<Element> {
  const timeoutMs = opts.timeoutMs ?? 15_000
  const started = performance.now()
  while (performance.now() - started < timeoutMs) {
    assertNotAborted(opts.signal)
    const el = root.querySelector(selector)
    if (el) return el
    await sleep(50, opts.signal)
  }
  throw new Error(`waitForSelector timeout: ${selector}`)
}

/** 短按（抬起时 TouchPointerOverlay 会放涟漪） */
export async function pointerTap(
  target: Element,
  point: Point = centerOf(target),
  opts: PointerStrokeOptions = {},
): Promise<void> {
  const pointerId = opts.pointerId ?? 1
  const pointerType = opts.pointerType ?? 'touch'
  assertNotAborted(opts.signal)
  dispatchPointer(target, 'pointerdown', point, { pointerId, pointerType, buttons: 1 })
  await sleep(90, opts.signal)
  dispatchPointer(target, 'pointerup', point, { pointerId, pointerType, buttons: 0 })
}

/** 长按（不触发短按涟漪；用于打开菜单等） */
export async function pointerLongPress(
  target: Element,
  point: Point = centerOf(target),
  opts: PointerStrokeOptions & { holdMs?: number } = {},
): Promise<void> {
  const pointerId = opts.pointerId ?? 1
  const pointerType = opts.pointerType ?? 'touch'
  const holdMs = opts.holdMs ?? 650
  assertNotAborted(opts.signal)
  dispatchPointer(target, 'pointerdown', point, { pointerId, pointerType, buttons: 1 })
  await sleep(holdMs, opts.signal)
  dispatchPointer(target, 'pointerup', point, { pointerId, pointerType, buttons: 0 })
}

/**
 * 在同一 target 上完成拖拽（不依赖 setPointerCapture）。
 * from/to 为 viewport client 坐标。
 */
export async function pointerDrag(
  target: Element,
  from: Point,
  to: Point,
  opts: PointerStrokeOptions = {},
): Promise<void> {
  const pointerId = opts.pointerId ?? 1
  const pointerType = opts.pointerType ?? 'touch'
  const durationMs = opts.durationMs ?? 900
  const steps = opts.steps ?? Math.max(12, Math.round(durationMs / 16))
  assertNotAborted(opts.signal)

  dispatchPointer(target, 'pointerdown', from, { pointerId, pointerType, buttons: 1 })
  await sleep(40, opts.signal)

  for (let i = 1; i <= steps; i++) {
    assertNotAborted(opts.signal)
    const t = easeInOutCubic(i / steps)
    const point = {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    }
    dispatchPointer(target, 'pointermove', point, { pointerId, pointerType, buttons: 1 })
    await sleep(durationMs / steps, opts.signal)
  }

  dispatchPointer(target, 'pointerup', to, { pointerId, pointerType, buttons: 0 })
}

export { centerOf }
