import {defineStore} from 'pinia'
import {ScheduleData, MatchNode, ZoneNode, Player, PlayerWithMatch} from "../types/schedule";
import axios, {AxiosResponse} from "axios";
import {GroupPlayer, GroupRankInfo, GroupRankInfoZone} from "../types/group_rank_info";
import {MpMatch, MpMatchRoot} from "../types/mp_match";
import {computed} from "vue";

export interface Schedule {
  data: ScheduleData
}

export const usePromotionStore = defineStore('promotion', {
  state: () => ({
    schedule: {} as Schedule,
    groupRank: {} as GroupRankInfo,
    mpMatchMap: new Map<string, MpMatch>(),
    selectedPlayer: null as Player,
  }),
  getters: {},
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
    getZone(zoneId: number): ZoneNode {
      return this.schedule.data.event.zones.nodes.find((zone: ZoneNode) => zone.id == zoneId.toString())
    },
    getMatchByOrder(zoneId: number, orderNumber: number, planGameCount: number = 3): MatchNode | undefined {
      const zone = this.getZone(zoneId)
      let node = zone.groupMatches.nodes.find((match: MatchNode) => match.orderNumber == orderNumber && match.planGameCount == planGameCount)
      if (node) return node
      node = zone.knockoutMatches.nodes.find((match: MatchNode) => match.orderNumber == orderNumber)
      if (node) return node
      return undefined
    },
    getMpMatch(matchId: string): MpMatch {
      return this.mpMatchMap.get(matchId) as MpMatch
    },
  },
})

