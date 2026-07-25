import { describe, expect, it } from 'vitest'
import { isPointerTap } from './pointer_tap'

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
