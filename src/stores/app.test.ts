import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import axios from 'axios'
import { useAppStore } from './app'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('app store global config', () => {
  beforeEach(() => {
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
})
