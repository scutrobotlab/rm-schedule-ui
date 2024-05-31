<script setup lang="ts">
import {useAppStore} from "../stores/app";

const appStore = useAppStore()
</script>

<template>
  <v-dialog max-width="480" v-model="appStore.searchDialog" :scrollable="true">
    <v-card variant="elevated">
      <v-card-title><h3>搜索队伍</h3></v-card-title>
      <v-card-subtitle>通过汉字或拼音搜索学校名称或队伍名称</v-card-subtitle>

      <v-card-text class="text-center">
        TODO
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
