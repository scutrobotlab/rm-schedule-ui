import {defineStore} from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    analysisDialog: ref(false),
    aboutDialog: ref(false),
  }),
})
