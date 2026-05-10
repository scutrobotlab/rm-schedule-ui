import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  AnniversaryVersionCode,
  AnniversaryVersionCodeKey
} from "../constant/common";

export const useAppStore = defineStore('app', {
  state: () => ({
    analysisDialog: ref(false),
    matchAnalysisDialog: ref(false),
    aboutDialog: ref(false),
    searchDialog: ref(false),
    commentDialog: ref(false),
    updateAnnouncementDialog: ref(false),
    anniversaryAnnouncementDialog: ref(false),
  }),
  actions: {
    initStore() {
      const anniversaryVersion = localStorage.getItem(AnniversaryVersionCodeKey)
      if (!anniversaryVersion || parseInt(anniversaryVersion) < AnniversaryVersionCode) {
        this.anniversaryAnnouncementDialog = true
      }
    }
  }
})
