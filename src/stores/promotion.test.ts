import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { usePromotionStore } from './promotion'

vi.mock('axios', () => ({
  default: vi.fn(),
}))

describe('promotion team abbreviations', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(axios).mockReset()
  })

  it('loads and stores the abbreviation map once', async () => {
    vi.mocked(axios).mockResolvedValue({
      data: {
        上海交通大学: {
          abbreviation4: '上海交大',
          abbreviation2: '上交',
        },
      },
    })
    const store = usePromotionStore()

    await store.updateTeamAbbreviations()
    await store.updateTeamAbbreviations()

    expect(axios).toHaveBeenCalledTimes(1)
    expect(axios).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/team_abbreviations',
    })
    expect(store.teamAbbreviations).toEqual({
      上海交通大学: {
        abbreviation4: '上海交大',
        abbreviation2: '上交',
      },
    })
  })

  it('keeps an empty fallback map when loading fails', async () => {
    vi.mocked(axios).mockRejectedValue(new Error('network error'))
    const store = usePromotionStore()

    await expect(store.updateTeamAbbreviations()).rejects.toThrow('network error')

    expect(store.teamAbbreviations).toEqual({})
    expect(store.teamAbbreviationsLoaded).toBe(true)
  })
})
