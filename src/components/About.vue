<script setup lang="ts">
import {useAppStore} from "../stores/app";

const appStore = useAppStore()
</script>

<template>
  <v-dialog max-width="480" v-model="appStore.aboutDialog" :scrollable="true">
    <v-card variant="elevated">
      <v-img
        class="text-white py-2"
        height="240"
        src="@/assets/banner2.jpg"
        cover
      >
        <v-card-title><h3>关于 RM Situation</h3></v-card-title>
        <v-card-subtitle>华南理工大学华南虎战队出品</v-card-subtitle>
      </v-img>

      <v-card-text class="text-center">
        <h3 class="mt-2">— 研发 —</h3>
        <p>22-24赛季 软件开发组 常霆钰</p>
        <p>反馈&建议 + QQ1067088037</p>
        <h3 class="mt-2">— 宣传 —</h3>
        <p>22-24赛季 宣传运营组 杨卓石</p>
        <h3 class="mt-4">— 特别鸣谢 —</h3>
        <p>RoboMaster 组委会</p>
        <p>如有更多软件想法，可微信搜索微信号 rmfans666 联系 RoboMaster 组委会</p>

        <div class="mt-6">
          <v-img src="@/assets/qr-code2.png"></v-img>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text="关闭"
          @click="appStore.aboutDialog = false"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">

</style>
