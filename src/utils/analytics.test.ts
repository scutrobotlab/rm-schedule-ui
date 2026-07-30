import { afterEach, describe, expect, it, vi } from 'vitest'

import { shouldEnableAnalytics } from './analytics'

describe('shouldEnableAnalytics', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('enables analytics for regular browsers', () => {
    vi.stubGlobal('navigator', { webdriver: false })

    expect(shouldEnableAnalytics()).toBe(true)
  })

  it('disables analytics for chromedp browsers', () => {
    vi.stubGlobal('navigator', { webdriver: true })

    expect(shouldEnableAnalytics()).toBe(false)
  })
})
