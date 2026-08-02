import { afterEach, describe, expect, it, vi } from 'vitest'
import { isMobileDevice, isMobileUserAgent } from './mobile'

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubMedia(matches: Record<string, boolean>) {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: matches[query] ?? false,
  })))
}

describe('isMobileUserAgent', () => {
  it('detects common phone user agents', () => {
    expect(isMobileUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    )).toBe(true)
    expect(isMobileUserAgent(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36',
    )).toBe(true)
  })

  it('rejects desktop user agents', () => {
    expect(isMobileUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/120.0.0.0',
    )).toBe(false)
  })
})

describe('isMobileDevice', () => {
  it('accepts a narrow screen with a coarse pointer', () => {
    stubMedia({
      '(max-width: 767px)': true,
      '(pointer: coarse)': true,
    })
    vi.stubGlobal('navigator', { userAgent: 'Desktop', maxTouchPoints: 0 })
    expect(isMobileDevice()).toBe(true)
  })

  it('accepts phone UA with touch even when width is still desktop-sized', () => {
    stubMedia({
      '(max-width: 767px)': false,
      '(pointer: coarse)': true,
    })
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      maxTouchPoints: 5,
    })
    expect(isMobileDevice()).toBe(true)
  })

  it('accepts a narrow phone UA without coarse pointer media', () => {
    stubMedia({
      '(max-width: 767px)': true,
    })
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      maxTouchPoints: 0,
    })
    expect(isMobileDevice()).toBe(true)
  })

  it('rejects a narrow desktop screen without touch signals', () => {
    stubMedia({
      '(max-width: 767px)': true,
      '(pointer: coarse)': false,
      '(any-pointer: coarse)': false,
      '(hover: none)': false,
    })
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)',
      maxTouchPoints: 0,
    })
    expect(isMobileDevice()).toBe(false)
  })

  it('rejects a wide desktop touch screen without phone UA', () => {
    stubMedia({
      '(max-width: 767px)': false,
      '(pointer: coarse)': true,
    })
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)',
      maxTouchPoints: 5,
    })
    expect(isMobileDevice()).toBe(false)
  })
})
