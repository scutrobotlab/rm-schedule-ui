import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import {
  AnniversaryVersionCode,
  AnniversaryVersionCodeKey
} from "../constant/common";
import {
  readMobileBracketConsent,
  writeMobileBracketConsent,
  type MobileBracketConsent,
} from '../utils/mobile_bracket_consent'

interface GlobalConfigResponse {
  isTestEnvironment: boolean
  mobileBracketEnabled: boolean
}

const globalConfigRequests = new WeakMap<object, Promise<void>>()

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
    mobileBracketEnabled: false,
    globalConfigLoaded: false,
    mobileBracketConsent: readMobileBracketConsent() as MobileBracketConsent,
  }),
  actions: {
    setMobileBracketConsent(consent: Exclude<MobileBracketConsent, null>) {
      this.mobileBracketConsent = consent
      writeMobileBracketConsent(consent)
    },
    async loadGlobalConfig() {
      const existingRequest = globalConfigRequests.get(this)
      if (existingRequest) {
        return existingRequest
      }

      const request = (async () => {
        try {
          const response = await axios.get<GlobalConfigResponse>('/api/config', { timeout: 3000 })
          this.isTestEnvironment = response.data.isTestEnvironment === true
          this.mobileBracketEnabled = response.data.mobileBracketEnabled === true
        } catch {
          // 配置接口异常时按正式环境和对照组处理。
          this.isTestEnvironment = false
          this.mobileBracketEnabled = false
        } finally {
          this.globalConfigLoaded = true
        }
      })()
      globalConfigRequests.set(this, request)

      return request
    },
    initStore() {
      const anniversaryVersion = localStorage.getItem(AnniversaryVersionCodeKey)
      if (!anniversaryVersion || parseInt(anniversaryVersion) < AnniversaryVersionCode) {
        this.anniversaryAnnouncementDialog = true
      }
    }
  }
})
