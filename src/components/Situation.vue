<script setup lang="ts">
import {useAppStore} from "../stores/app";
import MatchGraph from "./MatchGraph.vue";
import {computed} from "vue";
import {usePromotionStore} from "../stores/promotion";
import AnalyzeTeam from "./AnalyzeTeam.vue";

const zoneTab = ref(500)
const selectedGroup = ref([0])
const appStore = useAppStore()
const promotionStore = usePromotionStore();

const zoneId = computed(() => Number(zoneTab.value))

const zones = [
  {id: 498, name: '东部赛区', disabled: false},
  {id: 499, name: '中部赛区', disabled: false},
  {id: 500, name: '南部赛区', disabled: false},
]
</script>

<template>
  <div>
    <img
      class="background-image"
      src="@/assets/background2.jpg"
      alt=""/>

    <div class="container">
      <v-container class="content mt-2">
        <!--        Player = {{ promotionStore.selectedPlayer }}-->
        <v-tabs
          v-model="zoneTab"
          bg-color="#2196F3BB"
        >
          <v-tab
            v-for="zone in zones"
            :key="zone.id"
            :disabled="zone.disabled"
            :value="zone.id"
          >
            {{ zone.name }}
          </v-tab>
        </v-tabs>

        <v-row>
          <v-col cols="12">
            <div
              v-for="zone in zones"
              :key="zone.id"
            >
              <div v-if="zoneId == zone.id">
                <v-carousel
                  height="100vh - 100px"
                  :disabled="true"
                  hide-delimiters
                  :show-arrows="false"
                  v-model="selectedGroup"
                >
                  <v-carousel-item>
                    <MatchGraph :zone-id="zoneId" type="knockout" group=""></MatchGraph>
                  </v-carousel-item>
                  <v-carousel-item>
                    <MatchGraph :zone-id="zoneId" type="group" group="A"></MatchGraph>
                  </v-carousel-item>
                  <v-carousel-item>
                    <MatchGraph :zone-id="zoneId" type="group" group="B"></MatchGraph>
                  </v-carousel-item>
                </v-carousel>

                <div class="mx-auto container2" style="background: rgba(255, 255, 255, 0.2)">
                  <div class="row">
                    <div class="col">
                      <v-sheet
                        class="mx-auto text-center bg-transparent"
                      >
                        <v-slide-group
                          class="ml-2"
                          v-model="selectedGroup"
                          mandatory="force"
                        >
                          <v-slide-group-item
                            v-for="n in ['淘汰赛', 'A组', 'B组']"
                            :key="n"
                            v-slot="{ isSelected, toggle }"
                          >
                            <v-btn
                              :color="isSelected ? 'primary' : undefined"
                              class="mx-1"
                              rounded
                              size="small"
                              @click="toggle">
                              {{ n }}
                            </v-btn>
                          </v-slide-group-item>
                        </v-slide-group>
                      </v-sheet>
                    </div>
                    <div class="col text-right">
                      <v-btn
                        class="mx-1" variant="flat"
                        color="info" size="small"
                        :disabled="!promotionStore.selectedPlayer"
                        @click="appStore.analysisDialog = true"
                      >
                        分析
                      </v-btn>

                      <v-btn
                        class="ma-2" variant="flat"
                        color="info" size="small"
                        @click="appStore.aboutDialog = true"
                      >
                        关于
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-bottom-sheet v-model="appStore.analysisDialog">
          <AnalyzeTeam
            :zone-id="zoneId"
            :player="promotionStore.selectedPlayer"
          ></AnalyzeTeam>
        </v-bottom-sheet>
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

.content {
  position: relative;
  z-index: 3;
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
