import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { usePromotionStore } from './promotion'
import type { Player, ZoneNode } from '../types/schedule'

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

describe('promotion player selection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function player(id: string): Player {
    return {
      id,
      name: id,
      rank: 1,
      score: 0,
      teamId: `team-${id}`,
      team: {
        id: `team-${id}`,
        name: id,
        collegeLogo: '',
        collegeName: `College ${id}`,
      },
    }
  }

  function zoneWithPlayers(groupPlayer: Player, matchPlayer: Player): ZoneNode {
    return {
      id: '617',
      matchDates: [],
      name: 'test',
      zoneType: '',
      groups: {
        nodes: [{
          id: 'group',
          name: 'A',
          players: { nodes: [groupPlayer] },
        }],
      },
      groupMatches: {
        nodes: [{
          id: 'match',
          groupId: 'group',
          matchType: '',
          orderNumber: 1,
          planGameCount: 3,
          planStartedAt: '',
          result: '',
          slug: null,
          slugName: '',
          status: 'PENDING',
          winnerPlaceholdName: null,
          loserPlaceholdName: null,
          blueSideId: '',
          blueSideScore: 0,
          blueSideWinGameCount: 0,
          blueSide: {
            id: 'blue',
            preparedStatus: '',
            fillStatus: '',
            playerId: matchPlayer.id,
            player: matchPlayer,
            updatedAt: '',
          },
          redSideId: '',
          redSideScore: 0,
          redSideWinGameCount: 0,
          redSide: {
            id: 'red',
            preparedStatus: '',
            fillStatus: '',
            updatedAt: '',
          },
        }],
      },
      knockoutMatches: { nodes: [] },
    }
  }

  it('selects players from groups or matches and toggles the same player off', () => {
    const groupPlayer = player('group-player')
    const matchPlayer = player('match-player')
    const store = usePromotionStore()
    store.zoneId = 617
    store.schedule = {
      data: {
        event: {
          title: 'test',
          zones: { nodes: [zoneWithPlayers(groupPlayer, matchPlayer)] },
        },
        last_event: {
          title: '',
          zones: { nodes: [] },
        },
      },
    }

    expect(store.toggleSelectedPlayerById(groupPlayer.id)).toBe(true)
    expect(store.selectedPlayer?.id).toBe(groupPlayer.id)

    expect(store.toggleSelectedPlayerById(matchPlayer.id)).toBe(true)
    expect(store.selectedPlayer?.id).toBe(matchPlayer.id)

    expect(store.toggleSelectedPlayerById(matchPlayer.id)).toBe(true)
    expect(store.selectedPlayer).toBeNull()
  })

  it('preserves the selection when the player cannot be found', () => {
    const selected = player('selected')
    const store = usePromotionStore()
    store.selectedPlayer = selected

    expect(store.toggleSelectedPlayerById('missing')).toBe(false)
    expect(store.selectedPlayer?.id).toBe(selected.id)
  })
})
