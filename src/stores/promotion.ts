import {defineStore} from 'pinia'
import {Data} from "../types/schedule";
import axios, {AxiosResponse} from "axios";

export interface Schedule {
  data: Data
}

export const usePromotionStore = defineStore('promotion', {
  state: () => ({
    schedule: {},
  }),
  actions: {
    getSchedule() {
      axios({
        method: 'GET',
        url: '/api/schedule',
      }).then((response: AxiosResponse<Schedule>) => {
        this.schedule = response.data
      })
    }
  },
})

