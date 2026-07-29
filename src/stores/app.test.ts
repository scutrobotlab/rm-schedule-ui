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
      data: { isTestEnvironment: true },
    })

    const store = useAppStore()
    await store.loadGlobalConfig()

    expect(axios.get).toHaveBeenCalledWith('/api/config')
    expect(store.isTestEnvironment).toBe(true)
  })

  it('defaults to production when config loading fails', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('network error'))

    const store = useAppStore()
    store.isTestEnvironment = true
    await store.loadGlobalConfig()

    expect(store.isTestEnvironment).toBe(false)
  })
})
