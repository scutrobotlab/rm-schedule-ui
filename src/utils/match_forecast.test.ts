import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import { fetchMatchForecast } from './match_forecast'
import type { MatchForecastResp } from '../types/match_forecast'

vi.mock('axios', () => ({
  default: Object.assign(vi.fn(), {
    isAxiosError: vi.fn(() => false),
  }),
}))

const response: MatchForecastResp = {
  publish_time: '2026-07-25 12:00:00',
  has_match: false,
  zone_name: '',
  zone_id: 0,
  order_number: 0,
  slug: null,
  match_id: 0,
  support_rate_deadline: '',
  image_url: '/api/match_forecast_image',
  red_side: {
    team_info: {
      team_id: '',
      team_name: '',
      college_logo: '',
      college_name: '',
    },
    support_rate: -1,
    support_rate_percent: -1,
  },
  blue_side: {
    team_info: {
      team_id: '',
      team_name: '',
      college_logo: '',
      college_name: '',
    },
    support_rate: -1,
    support_rate_percent: -1,
  },
}

describe('fetchMatchForecast', () => {
  beforeEach(() => {
    vi.mocked(axios).mockReset()
    vi.mocked(axios).mockResolvedValue({ data: response })
  })

  it('uses current-match selection when matchId is omitted', async () => {
    await fetchMatchForecast()

    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      url: '/api/match_forecast',
      params: undefined,
    }))
  })

  it('forwards an explicit matchId', async () => {
    await fetchMatchForecast('30988')

    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      url: '/api/match_forecast',
      params: { match_id: '30988' },
    }))
  })

  it('preserves backend errors for the poster error state', async () => {
    const error = new Error('Request failed with status code 404')
    vi.mocked(axios).mockRejectedValue(error)

    await expect(fetchMatchForecast('99999')).rejects.toBe(error)
  })
})
