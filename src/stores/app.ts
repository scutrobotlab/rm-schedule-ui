import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
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
    isTestEnvironment: false,
  }),
  actions: {
    async loadGlobalConfig() {
      try {
        const response = await axios.get<{ isTestEnvironment: boolean }>('/api/config')
        this.isTestEnvironment = response.data.isTestEnvironment === true
      } catch {
        // 配置接口异常时按正式环境处理，避免误显示测试标记。
        this.isTestEnvironment = false
      }
    },
    initStore() {
      const anniversaryVersion = localStorage.getItem(AnniversaryVersionCodeKey)
      if (!anniversaryVersion || parseInt(anniversaryVersion) < AnniversaryVersionCode) {
        this.anniversaryAnnouncementDialog = true
      }
    }
  }
})
