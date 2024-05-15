import {defineStore} from 'pinia'
import {ScheduleData, MatchNode, ZoneNode} from "../types/schedule";
import axios, {AxiosResponse} from "axios";

export interface Schedule {
  data: ScheduleData
}

export const usePromotionStore = defineStore('promotion', {
  state: () => ({
    zoneId: 498,
    schedule: {} as Schedule,
  }),
  actions: {
    async updateSchedule() {
      await axios({
        method: 'GET',
        url: '/api/schedule',
      }).then((response: AxiosResponse<Schedule>) => {
        this.schedule = response.data
      })
    },
    getMatchByOrder(orderNumber: number): MatchNode | undefined {
      const zone = this.schedule.data.event.zones.nodes.find((zone: ZoneNode) => zone.id = this.zoneId)
      let node = zone.groupMatches.nodes.find((match: MatchNode) => match.orderNumber === orderNumber)
      if (node) return node
      node = zone.knockoutMatches.nodes.find((match: MatchNode) => match.orderNumber === orderNumber)
      if (node) return node
      return undefined
    },
  },
})

