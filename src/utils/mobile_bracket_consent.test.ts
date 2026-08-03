import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MobileBracketConsentKey,
  readMobileBracketConsent,
  shouldUseMobileBracket,
  writeMobileBracketConsent,
} from './mobile_bracket_consent'

const storage = new Map<string, string>()

beforeEach(() => {
  storage.clear()
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
  })
})

describe('mobile Bracket consent', () => {
  it('persists accepted and declined choices', () => {
    writeMobileBracketConsent('accepted')
    expect(storage.get(MobileBracketConsentKey)).toBe('accepted')
    expect(readMobileBracketConsent()).toBe('accepted')

    writeMobileBracketConsent('declined')
    expect(readMobileBracketConsent()).toBe('declined')
  })

  it('ignores unknown values', () => {
    storage.set(MobileBracketConsentKey, 'unknown')
    expect(readMobileBracketConsent()).toBeNull()
  })

  it('defaults mobile users to Bracket and respects their saved choice', () => {
    expect(shouldUseMobileBracket(true, null)).toBe(true)
    expect(shouldUseMobileBracket(true, 'accepted')).toBe(true)
    expect(shouldUseMobileBracket(true, 'declined')).toBe(false)
  })

  it('always keeps non-mobile users on the legacy UI', () => {
    expect(shouldUseMobileBracket(false, null)).toBe(false)
    expect(shouldUseMobileBracket(false, 'accepted')).toBe(false)
    expect(shouldUseMobileBracket(false, 'declined')).toBe(false)
  })

  it('tolerates unavailable storage', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => { throw new Error('blocked') }),
      setItem: vi.fn(() => { throw new Error('blocked') }),
    })
    expect(readMobileBracketConsent()).toBeNull()
    expect(() => writeMobileBracketConsent('declined')).not.toThrow()
  })
})
