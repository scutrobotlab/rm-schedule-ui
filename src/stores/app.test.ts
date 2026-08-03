import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import axios from 'axios'
import { useAppStore } from './app'
import { MobileBracketConsentKey } from '../utils/mobile_bracket_consent'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('app store global config', () => {
  const storage = new Map<string, string>()

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    })
    setActivePinia(createPinia())
    vi.mocked(axios.get).mockReset()
  })

  it('enables the badge from backend config', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { isTestEnvironment: true, mobileBracketEnabled: true },
    })

    const store = useAppStore()
    await store.loadGlobalConfig()

    expect(axios.get).toHaveBeenCalledWith('/api/config', { timeout: 3000 })
    expect(store.isTestEnvironment).toBe(true)
    expect(store.mobileBracketEnabled).toBe(true)
    expect(store.globalConfigLoaded).toBe(true)
  })

  it('defaults to production when config loading fails', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('network error'))

    const store = useAppStore()
    store.isTestEnvironment = true
    await store.loadGlobalConfig()

    expect(store.isTestEnvironment).toBe(false)
    expect(store.mobileBracketEnabled).toBe(false)
    expect(store.globalConfigLoaded).toBe(true)
  })

  it('updates and persists the mobile UI preference together', () => {
    const store = useAppStore()

    store.setMobileBracketConsent('declined')
    expect(store.mobileBracketConsent).toBe('declined')
    expect(storage.get(MobileBracketConsentKey)).toBe('declined')

    store.setMobileBracketConsent('accepted')
    expect(store.mobileBracketConsent).toBe('accepted')
    expect(storage.get(MobileBracketConsentKey)).toBe('accepted')
  })
})
