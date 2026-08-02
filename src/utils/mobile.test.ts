import { afterEach, describe, expect, it, vi } from 'vitest'
import { isMobileDevice } from './mobile'

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubMedia(matches: Record<string, boolean>) {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: matches[query] ?? false,
  })))
}

describe('isMobileDevice', () => {
  it('accepts a narrow screen with a coarse pointer', () => {
    stubMedia({
      '(max-width: 767px)': true,
      '(pointer: coarse)': true,
    })
    expect(isMobileDevice()).toBe(true)
  })

  it('accepts a narrow screen with any-pointer coarse', () => {
    stubMedia({
      '(max-width: 767px)': true,
      '(any-pointer: coarse)': true,
    })
    expect(isMobileDevice()).toBe(true)
  })

  it('accepts a narrow screen with hover none', () => {
    stubMedia({
      '(max-width: 767px)': true,
      '(hover: none)': true,
    })
    expect(isMobileDevice()).toBe(true)
  })

  it('accepts a narrow screen with touch points when pointer media is fine', () => {
    stubMedia({
      '(max-width: 767px)': true,
    })
    vi.stubGlobal('navigator', { maxTouchPoints: 5 })
    expect(isMobileDevice()).toBe(true)
  })

  it('rejects a narrow screen without touch signals', () => {
    stubMedia({
      '(max-width: 767px)': true,
      '(pointer: coarse)': false,
      '(any-pointer: coarse)': false,
      '(hover: none)': false,
    })
    vi.stubGlobal('navigator', { maxTouchPoints: 0 })
    expect(isMobileDevice()).toBe(false)
  })

  it('rejects a wide touch screen', () => {
    stubMedia({
      '(max-width: 767px)': false,
      '(pointer: coarse)': true,
    })
    vi.stubGlobal('navigator', { maxTouchPoints: 5 })
    expect(isMobileDevice()).toBe(false)
  })
})
