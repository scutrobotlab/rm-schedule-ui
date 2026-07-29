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

  it('rejects a narrow screen with a precise pointer', () => {
    stubMedia({
      '(max-width: 767px)': true,
      '(pointer: coarse)': false,
    })
    expect(isMobileDevice()).toBe(false)
  })

  it('rejects a wide touch screen', () => {
    stubMedia({
      '(max-width: 767px)': false,
      '(pointer: coarse)': true,
    })
    expect(isMobileDevice()).toBe(false)
  })
})
