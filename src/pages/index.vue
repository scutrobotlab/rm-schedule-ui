<template>
  <Bracket v-if="showBracket"/>
  <template v-else-if="appStore.globalConfigLoaded">
    <Situation/>
    <About/>
  </template>
  <div v-else class="page-loading" aria-hidden="true"/>

  <v-dialog
    v-model="showConsentDialog"
    max-width="420"
    persistent
  >
    <v-card class="consent-dialog">
      <div class="consent-dialog__glow" aria-hidden="true"/>
      <v-card-text class="consent-dialog__content">
        <div class="consent-dialog__icon" aria-hidden="true">
          <v-icon icon="mdi-tournament" size="30"/>
        </div>
        <h2 class="consent-dialog__title">全新版本抢先体验</h2>
        <p class="consent-dialog__description">
          您获得了新版对阵图的抢先体验资格。专为移动端打造，晋级路线一目了然，比赛结果更加清晰。
        </p>
      </v-card-text>
      <v-card-actions class="consent-dialog__actions">
        <v-btn
          class="consent-dialog__button"
          rounded="lg"
          variant="outlined"
          @click="declineExperiment"
        >
          继续旧版
        </v-btn>
        <v-btn
          class="consent-dialog__button consent-dialog__button--primary"
          rounded="lg"
          variant="flat"
          @click="acceptExperiment"
        >
          体验新版
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import About from '../components/About.vue'
import Situation from '../components/Situation.vue'
import Bracket from './Bracket.vue'
import { useAppStore } from '../stores/app'
import { isMobileDevice } from '../utils/mobile'
import {
  writeMobileBracketConsent,
} from '../utils/mobile_bracket_consent'

const appStore = useAppStore()
const route = useRoute()
const mobileAtStartup = isMobileDevice()
const forceLegacy = computed(() => route.query.legacy === '1')

const eligibleForExperiment = computed(() =>
  !forceLegacy.value &&
  appStore.globalConfigLoaded &&
  mobileAtStartup &&
  appStore.mobileBracketEnabled,
)

const showBracket = computed(() =>
  eligibleForExperiment.value && appStore.mobileBracketConsent === 'accepted',
)

const showConsentDialog = ref(false)

watch(
  [
    eligibleForExperiment,
    () => appStore.anniversaryAnnouncementDialog,
  ],
  ([eligible, anniversaryOpen]) => {
    showConsentDialog.value =
      eligible &&
      !anniversaryOpen &&
      appStore.mobileBracketConsent === null
  },
  { immediate: true },
)

function acceptExperiment() {
  appStore.mobileBracketConsent = 'accepted'
  writeMobileBracketConsent('accepted')
  showConsentDialog.value = false
}

function declineExperiment() {
  appStore.mobileBracketConsent = 'declined'
  writeMobileBracketConsent('declined')
  showConsentDialog.value = false
}
</script>

<style scoped>
.page-loading {
  min-height: 100dvh;
  background: var(--app-canvas);
}

.consent-dialog {
  position: relative;
  overflow: hidden;
  border: 1px solid rgb(100 196 255 / 24%);
  background:
    linear-gradient(145deg, rgb(19 43 62 / 98%), rgb(7 23 37 / 99%));
  box-shadow:
    0 24px 64px rgb(0 0 0 / 48%),
    inset 0 1px rgb(255 255 255 / 7%);
  color: #fff;
}

.consent-dialog__glow {
  position: absolute;
  top: -96px;
  right: -72px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgb(40 169 255 / 18%);
  filter: blur(8px);
  pointer-events: none;
}

.consent-dialog__content {
  position: relative;
  padding: 28px 28px 20px !important;
  text-align: center;
}

.consent-dialog__icon {
  display: grid;
  width: 58px;
  height: 58px;
  margin: 0 auto 16px;
  place-items: center;
  border: 1px solid rgb(111 207 255 / 34%);
  border-radius: 18px;
  background:
    linear-gradient(145deg, rgb(50 174 255 / 24%), rgb(29 112 174 / 10%));
  box-shadow:
    0 10px 28px rgb(0 128 220 / 18%),
    inset 0 1px rgb(255 255 255 / 12%);
  color: #83d5ff;
}

.consent-dialog__eyebrow {
  margin-bottom: 7px;
  color: #75cfff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.consent-dialog__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.04em;
}

.consent-dialog__description {
  max-width: 320px;
  margin: 12px auto 0;
  color: rgb(224 239 249 / 76%);
  font-size: 14px;
  line-height: 1.75;
}

.consent-dialog__actions {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 24px 24px !important;
}

.consent-dialog__button {
  min-height: 44px;
  border-color: rgb(203 232 249 / 24%);
  color: rgb(234 247 255 / 86%);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.consent-dialog__button--primary {
  background: linear-gradient(135deg, #1aa7eb, #2677e8);
  box-shadow: 0 8px 22px rgb(20 133 225 / 30%);
  color: #fff;
}

@media (max-width: 380px) {
  .consent-dialog__content {
    padding: 24px 22px 18px !important;
  }

  .consent-dialog__actions {
    padding: 0 18px 20px !important;
  }
}
</style>
