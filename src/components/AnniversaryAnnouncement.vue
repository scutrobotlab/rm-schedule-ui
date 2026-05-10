<script setup lang="ts">
import { useAppStore } from "../stores/app";
import { AnniversaryVersionCode, AnniversaryVersionCodeKey } from "../constant/common";

const appStore = useAppStore()

function rememberAnniversaryAnnouncement() {
  localStorage.setItem(AnniversaryVersionCodeKey, AnniversaryVersionCode.toString())
}

function onDialogModelUpdate(isOpen: boolean) {
  if (!isOpen) {
    rememberAnniversaryAnnouncement()
  }
}

function closeDialog() {
  appStore.anniversaryAnnouncementDialog = false
  rememberAnniversaryAnnouncement()
}
</script>

<template>
  <v-dialog
    v-model="appStore.anniversaryAnnouncementDialog"
    width="100%"
    max-width="960"
    scrollable
    @update:model-value="onDialogModelUpdate"
  >
    <v-card class="anniversary-card">
      <img
        class="anniversary-image"
        src="@/assets/three_years_same_frequency.jpg"
        alt="三年同行热爱同频"
      />

      <v-card-text class="anniversary-content text-center">
        <h3>
          RM Schedule 陪伴 RoboMaster 走进第三年
        </h3>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text="关闭"
          variant="outlined"
          @click="closeDialog"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.anniversary-card {
  width: 100%;
  overflow: hidden;
}

.anniversary-image {
  display: block;
  width: 100%;
  height: auto;
}

.anniversary-content {
  h2 {
    font-size: 1.75rem;
    font-weight: 700;
  }

  p {
    margin-top: 12px;
    font-size: 1.05rem;
  }
}
</style>
