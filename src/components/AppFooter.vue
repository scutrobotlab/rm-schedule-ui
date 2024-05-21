<template>
  <v-footer height="40" app>
    <v-btn
      variant="text"
      @click="appStore.aboutDialog = true"
      size="small"
    >
      关于
    </v-btn>
    <div
      class="text-caption"
      style="position: absolute; right: 16px;"
    >
      &copy; {{ (new Date()).getFullYear() }}
      <span>
        华南理工大学机器人未来创新实验室 华南虎战队
      </span>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
import {useAppStore} from "../stores/app";

const appStore = useAppStore()
</script>

<style scoped lang="sass">
.social-link :deep(.v-icon)
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
  text-decoration: none
  transition: .2s ease-in-out

  &:hover
    color: rgba(25, 118, 210, 1)
</style>
