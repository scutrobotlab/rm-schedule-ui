<script setup lang="ts">
import {useAppStore} from "../stores/app";

const selectedZone = ref([0])
const appStore = useAppStore()
</script>

<template>
  <div>
    <img
      class="background-image"
      src="@/assets/background2.jpg"
      alt=""/>

    <v-img
      class="logo"
      src="@/assets/logo.png">
    </v-img>

    <div class="container">
      <v-container class="content mt-2">
        <v-row>
          <v-col cols="12">
            <div>
              <v-carousel
                height="100vh - 100px"
                :disabled="true"
                hide-delimiters
                :show-arrows="false"
                v-model="selectedZone"
              >
                <v-carousel-item>
                  <SwissWheel zone="A"></SwissWheel>
                </v-carousel-item>
                <v-carousel-item>
                  <SwissWheel zone="B"></SwissWheel>
                </v-carousel-item>

              </v-carousel>

              <div class="mx-auto container2" style="background: rgba(255, 255, 255, 0.2)">
                <div class="row">
                  <div class="col">
                    <v-sheet
                      class="mx-auto text-center bg-transparent"
                    >
                      <v-slide-group
                        v-model="selectedZone"
                        mandatory="force"
                      >
                        <v-slide-group-item
                          v-for="n in ['A', 'B']"
                          :key="n"
                          v-slot="{ isSelected, toggle }"
                        >
                          <v-btn
                            :color="isSelected ? 'primary' : undefined"
                            class="ma-2"
                            rounded
                            @click="toggle">
                            {{ n }}组
                          </v-btn>
                        </v-slide-group-item>
                      </v-slide-group>
                    </v-sheet>
                  </div>
                  <div class="col text-right">
                    <v-btn
                      class="ma-2"
                      variant="flat"
                      color="info"
                      @click="appStore.aboutDialog = true"
                    >
                      关于
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100vh; /* 使容器的高度与视口高度一致 */
  overflow: hidden;
}

.background-image {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
  object-fit: cover; /* 或 contain */
}

.logo {
  position: absolute;
  bottom: 50px;
  right: 0;
  width: 100px;
  opacity: 0.5;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 3;
}

.content {
  position: relative;
  z-index: 2;
}

.container2 {
  display: flex; /* 使用Flexbox来布局子元素 */
  flex-wrap: wrap; /* 允许子元素换行 */
}

.row {
  display: flex; /* 每行也使用Flexbox布局 */
  flex-basis: 100%; /* 每行占满容器宽度 */
}

.col {
  flex: 1; /* 列占用可用空间 */
  align-content: center;
}
</style>
