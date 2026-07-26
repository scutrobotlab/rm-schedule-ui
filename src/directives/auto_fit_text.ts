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
  el.style.removeProperty('font-size')
  if (!enabled || el.clientWidth <= 0) return

  const rect = el.getBoundingClientRect()
  const parentRect = el.parentElement?.getBoundingClientRect()
  const availableWidth = parentRect
    ? Math.max(0, Math.min(rect.right, parentRect.right) - Math.max(rect.left, parentRect.left))
    : el.clientWidth
  if (availableWidth <= 0) return

  const style = getComputedStyle(el)
  const baseFontSize = Number.parseFloat(style.fontSize)
  if (!Number.isFinite(baseFontSize)) return

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return
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

  if (requiredWidth <= availableWidth) return
  const fittedSize = Math.max(minFontSize, baseFontSize * availableWidth / requiredWidth)
  el.style.fontSize = `${fittedSize}px`
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
    resizeObserver.observe(el)
    mutationObserver.observe(el, { childList: true, subtree: true, characterData: true })
    el.__autoFitCleanup = () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      if (el.__autoFitFrame != null) cancelAnimationFrame(el.__autoFitFrame)
    }
    scheduleFit(el)
  },
  updated(el, binding) {
    el.__autoFitOptions = optionsOf(binding)
    scheduleFit(el)
  },
  unmounted(el) {
    el.__autoFitCleanup?.()
  },
}
