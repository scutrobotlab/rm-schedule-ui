import { describe, expect, it } from 'vitest'
import { isHorizontalPointerPan, isPointerTap } from './pointer_tap'

describe('isPointerTap', () => {
  it('accepts small mobile finger movement as a tap', () => {
    expect(isPointerTap(10, 20, 16, 25)).toBe(true)
  })

  it('rejects an intentional horizontal swipe', () => {
    expect(isPointerTap(10, 20, 30, 21)).toBe(false)
  })

  it('uses radial distance instead of independent axis thresholds', () => {
    expect(isPointerTap(0, 0, 8, 8)).toBe(false)
  })
})

describe('isHorizontalPointerPan', () => {
  it('reaches the bracket pan threshold before a long press can fire', () => {
    expect(isHorizontalPointerPan(0, 0, 3, 0)).toBe(true)
  })

  it('allows sub-threshold finger jitter during a long press', () => {
    expect(isHorizontalPointerPan(0, 0, 2, 2)).toBe(false)
  })

  it('does not treat vertical scrolling as a horizontal pan', () => {
    expect(isHorizontalPointerPan(0, 0, 2, 8)).toBe(false)
  })
})
