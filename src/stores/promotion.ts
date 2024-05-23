import {defineStore} from 'pinia'
import {ScheduleData, MatchNode, ZoneNode} from "../types/schedule";
import axios, {AxiosResponse} from "axios";
import {GroupPlayer, GroupRankInfo, GroupRankInfoZone} from "../types/group_rank_info";
import {MpMatch, MpMatchRoot} from "../types/mp_match";
import {computed} from "vue";

export interface Schedule {
  data: ScheduleData
}

export const ZoneId = 499
export const ZoneIdStr = ZoneId.toString()

export const usePromotionStore = defineStore('promotion', {
  state: () => ({
    schedule: {} as Schedule,
    groupRank: {} as GroupRankInfo,
    mpMatchMap: new Map<string, MpMatch>(),
  }),
  getters: {
    currentZone(state) {
      return state.schedule.data.event.zones.nodes.find((zone: ZoneNode) => zone.id == ZoneIdStr)
    }
  },
  actions: {
    async updateSchedule() {
      await axios({
        method: 'GET',
        url: '/api/schedule',
      }).then(async (response: AxiosResponse<Schedule>) => {
        this.schedule = response.data
      })
    },
    async updateGroupRank() {
      await axios({
        method: 'GET',
        url: '/api/group_rank_info',
      }).then((response: AxiosResponse<any>) => {
        this.groupRank = response.data
      })
    },
    async updateMpMatch(matchIds: number[]) {
      axios({
        method: 'GET',
        url: '/api/mp/match',
        params: {
          match_ids: matchIds.join(',')
        }
      }).then((res: AxiosResponse<MpMatchRoot>) => {
        res.data.list.forEach((match: MpMatch) => {
          this.mpMatchMap.set(match.matchId.toString(), match)
        })
      })
    },
    getMatchByOrder(orderNumber: number): MatchNode | undefined {
      const zone = this.currentZone
      let node = zone.groupMatches.nodes.find((match: MatchNode) => match.orderNumber == orderNumber)
      if (node) return node
      node = zone.knockoutMatches.nodes.find((match: MatchNode) => match.orderNumber == orderNumber)
      if (node) return node
      return undefined
    },
    getForecastByIndex(zoneIndex: number, index: number): GroupPlayer[] | undefined {
      return this.currentZone.groups[zoneIndex].groupPlayers[index]
    },
    getMpMatch(matchId: string): MpMatch {
      return this.mpMatchMap.get(matchId) as MpMatch
    },
  },
})

