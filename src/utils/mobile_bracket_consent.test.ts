import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MobileBracketConsentKey,
  readMobileBracketConsent,
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
})
