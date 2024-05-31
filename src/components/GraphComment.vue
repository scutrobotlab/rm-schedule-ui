<script setup lang="ts">
import {useAppStore} from "../stores/app";

const appStore = useAppStore()

function openRMLive() {
  window.open('https://www.robomaster.com/live?djifrom=scut', '_blank')
}
</script>

<template>
  <v-dialog max-width="480" v-model="appStore.commentDialog" :scrollable="true">
    <v-card class="pt-2" variant="elevated">
      <v-card-title><h3>晋级图注释</h3></v-card-title>
      <v-card-subtitle>注释将帮助您更好地理解晋级图</v-card-subtitle>

      <v-card-text class="px-0">
        <v-list class="align-center text-center">
          <v-list-item>
            <v-list-item-title class="my-1"><h3>实时预测</h3></v-list-item-title>
            <span class="text-subtitle-1">标记 * 号的内容根据官网排名 <b>实时滚榜</b> 更新。</span>
            <div>
              <v-btn
                class="my-2"
                variant="outlined"
                prepend-icon="mdi-open-in-new"
                @click="openRMLive"
              >
                RoboMaster 官网直播
              </v-btn>
            </div>
          </v-list-item>

          <v-list-item class="my-2">
            <v-list-item-title class="my-1"><h3>王牌预言家</h3></v-list-item-title>
            <span class="text-subtitle-1">竞猜数据来自 RoboMaster 王牌预言家。</span>
            <div class="align-center">
              <img
                class="my-2"
                width="50%"
                src="@/assets/rm_qr-code.jpg"
                alt="">
            </div>
          </v-list-item>

          <v-list-item>
            <v-list-item-title class="my-1"><h3>队伍分析</h3></v-list-item-title>
            <span class="text-subtitle-1">
              点击任意一支队伍，软件将高亮显示它出现过的所有位置。此时点击右下角的“分析”按钮即可查看队伍分析。
            </span>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text="关闭"
          @click="appStore.commentDialog = false"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">

</style>
