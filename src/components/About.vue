<script setup lang="ts">
import {useAppStore} from "../stores/app";

const appStore = useAppStore()

const items = [
  {
    id: 1,
    color: 'grey-lighten-2',
    icon: 'mdi-head-lightbulb',
    title: '2024年5月14日',
    text: '宣传提出了瑞士轮可视化的构想，研发和宣传决定次日开始制作。',
  },
  {
    id: 2,
    color: 'grey-lighten-2',
    icon: 'mdi-xml',
    title: '2024年5月15日',
    text: '研发完成了初版软件并与宣传美化了UI，宣传设计了推文并发布。',
  },
  {
    id: 3,
    color: 'grey-lighten-2',
    icon: 'mdi-hands-pray',
    title: '2024年5月18日',
    text: '研发前往苏州观赛时，RM组委会人员表达了对该软件的认可。双方“一拍即合”决定共同支持该软件。',
  },
  {
    id: 4,
    color: 'grey-lighten-2',
    icon: 'mdi-new-box',
    title: '2024年5月21日',
    text: '研发继续该软件的迭代，增加了功能同时美化了UI. 期间RM组委会提出了宝贵建议并提供宣发支持。',
  },
  {
    id: 5,
    color: 'grey-lighten-2',
    icon: 'mdi-play-circle',
    title: '2024年5月22日',
    text: '中部区域赛启动，祝愿该软件能够帮助更多的队伍提高比赛效率，祝愿各个队伍取得好成绩。',
  },
]
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
        <p>如有更多软件 idea，可以微信搜索微信号 <b>rmfans666</b> 联系 RoboMaster 组委会</p>

        <div class="mt-6">
          <v-img src="@/assets/qr-code2.png"></v-img>
        </div>

        <v-timeline class="my-4 text-start" side="end">
          <v-timeline-item
            v-for="item in items"
            :key="item.id"
            :dot-color="item.color"
            size="small"
          >
            <v-alert
              :color="item.color"
              :icon="item.icon"
              :value="true"
              :title="item.title"
              variant="outlined"
              density="compact"
            >
              {{ item.text }}
            </v-alert>
          </v-timeline-item>
        </v-timeline>
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
