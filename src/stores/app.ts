import {defineStore} from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    aboutDialog: ref(false),
  }),
})
