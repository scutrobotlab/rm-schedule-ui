import type { Directive, DirectiveBinding } from 'vue'

interface AutoFitTextOptions {
  enabled?: boolean
  minFontSize?: number
}

type AutoFitElement = HTMLElement & {
  __autoFitCleanup?: () => void
  __autoFitFrame?: number
  __autoFitOptions?: Required<AutoFitTextOptions>
}

function optionsOf(binding: DirectiveBinding<boolean | AutoFitTextOptions>): Required<AutoFitTextOptions> {
  if (typeof binding.value === 'boolean') {
    return { enabled: binding.value, minFontSize: 7 }
  }
  return {
    enabled: binding.value?.enabled ?? true,
    minFontSize: binding.value?.minFontSize ?? 7,
  }
}

function fit(el: AutoFitElement): void {
  const { enabled, minFontSize } = el.__autoFitOptions ?? {
    enabled: true,
    minFontSize: 7,
  }

  // font-size 本身有过渡时，移除上一次的内联字号后，getComputedStyle() 仍会
  // 返回过渡中的旧字号。若直接拿它作为下一次适配的基准，重复测量会让字号
  // 单向递减。测量和写入期间临时关闭过渡，强制读取 CSS 声明的真实基准值。
  const previousTransition = el.style.getPropertyValue('transition')
  const previousTransitionPriority = el.style.getPropertyPriority('transition')
  el.style.setProperty('transition', 'none', 'important')
  el.style.removeProperty('font-size')
  // 触发布局，使后续 computed style 不再停留在取消前的过渡状态。
  void el.offsetWidth

  if (!enabled || el.clientWidth <= 0) {
    restoreTransition(el, previousTransition, previousTransitionPriority)
    return
  }

  const rect = el.getBoundingClientRect()
  const parentRect = el.parentElement?.getBoundingClientRect()
  const availableWidth = parentRect
    ? Math.max(0, Math.min(rect.right, parentRect.right) - Math.max(rect.left, parentRect.left))
    : el.clientWidth
  if (availableWidth <= 0) {
    restoreTransition(el, previousTransition, previousTransitionPriority)
    return
  }

  const style = getComputedStyle(el)
  const baseFontSize = Number.parseFloat(style.fontSize)
  if (!Number.isFinite(baseFontSize)) {
    restoreTransition(el, previousTransition, previousTransitionPriority)
    return
  }

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) {
    restoreTransition(el, previousTransition, previousTransitionPriority)
    return
  }
  context.font = style.font

  const candidates = el.children.length > 0
    ? Array.from(el.children)
    : [el]
  const letterSpacing = Number.parseFloat(style.letterSpacing) || 0
  const requiredWidth = candidates.reduce((widest, candidate) => {
    const text = candidate.textContent ?? ''
    return Math.max(
      widest,
      context.measureText(text).width + Math.max(0, text.length - 1) * letterSpacing,
    )
  }, 0)

  if (requiredWidth > availableWidth) {
    const fittedSize = Math.max(minFontSize, baseFontSize * availableWidth / requiredWidth)
    el.style.fontSize = `${fittedSize}px`
  }

  // 在恢复过渡前提交最终字号，避免恢复后又从旧的动画值开始插值。
  void el.offsetWidth
  restoreTransition(el, previousTransition, previousTransitionPriority)
}

function restoreTransition(
  el: HTMLElement,
  value: string,
  priority: string,
): void {
  if (value) el.style.setProperty('transition', value, priority)
  else el.style.removeProperty('transition')
}

function scheduleFit(el: AutoFitElement): void {
  if (el.__autoFitFrame != null) cancelAnimationFrame(el.__autoFitFrame)
  el.__autoFitFrame = requestAnimationFrame(() => {
    el.__autoFitFrame = undefined
    fit(el)
  })
}

export const vAutoFitText: Directive<AutoFitElement, boolean | AutoFitTextOptions> = {
  mounted(el, binding) {
    el.__autoFitOptions = optionsOf(binding)
    const resizeObserver = new ResizeObserver(() => scheduleFit(el))
    const mutationObserver = new MutationObserver(() => scheduleFit(el))
    // 监听可用空间的容器，而不是文字自身；否则 font-size 过渡会持续触发
    // ResizeObserver，反复重启适配动画。
    resizeObserver.observe(el.parentElement ?? el)
    mutationObserver.observe(el, { childList: true, subtree: true, characterData: true })
    el.__autoFitCleanup = () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      if (el.__autoFitFrame != null) cancelAnimationFrame(el.__autoFitFrame)
    }
    scheduleFit(el)
  },
  updated(el, binding) {
    const previous = el.__autoFitOptions
    const next = optionsOf(binding)
    el.__autoFitOptions = next
    if (
      previous?.enabled !== next.enabled ||
      previous?.minFontSize !== next.minFontSize
    ) {
      scheduleFit(el)
    }
  },
  unmounted(el) {
    el.__autoFitCleanup?.()
  },
}
