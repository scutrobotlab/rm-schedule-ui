<script setup lang="ts">
import {useAppStore} from "../stores/app";
import MatchGraph from "./MatchGraph.vue";
import {computed, watch} from "vue";
import {usePromotionStore} from "../stores/promotion";
import AnalyzeTeam from "./AnalyzeTeam.vue";
import {useRoute, useRouter} from "vue-router";
import {Zones} from "../constant/zone";

const route = useRoute()
const router = useRouter()

const liveMode = ref(route.query.live == "1")
const zoneTab = ref(Number(route.params.zoneId) || 500)
const selectedGroup = ref([route.query.group || 0])
const appStore = useAppStore()
const promotionStore = usePromotionStore();

const zoneId = computed(() => Number(zoneTab.value))

function updateQuery() {
  router.push({path: `/${zoneId.value}`, query: {group: selectedGroup.value}})
}

watch(zoneId, updateQuery)
watch(selectedGroup, updateQuery)

function badgeTab(zoneId: number): boolean {
  if (!promotionStore.selectedPlayer) return false
  const zone = promotionStore.getZone(zoneId)
  if (!zone) return false
  for (let group of zone.groups.nodes) {
    for (let player of group.players.nodes) {
      if (promotionStore.selectedPlayer.id == player.id) return true
    }
  }
  return false
}
</script>

<template>
  <div>
    <img
      class="background-image"
      src="@/assets/background3.png"
      alt=""/>

    <SearchPlayer :zone-id="zoneId"/>

    <div class="container">
      <div class="content">
        <div class="container2">
          <v-tabs
            v-if="!liveMode"
            class="row"
            v-model="zoneTab"
            bg-color="#2196F3BB"
          >
            <div class="col">
              <v-tab
                v-for="zone in Zones"
                :key="zone.id"
                :disabled="zone.disabled"
                :value="zone.id"
              >
                <v-badge
                  v-if="badgeTab(zone.id)"
                  color="white"
                  dot floating
                >
                  {{ zone.name }}
                </v-badge>
                <span v-else>
                  {{ zone.name }}
                </span>
              </v-tab>
            </div>

            <div class="text-right mr-2">
              <v-btn
                variant="flat"
                color="transparent"
                icon="mdi-magnify"
                @click="appStore.searchDialog = true"
              >
              </v-btn>
            </div>
          </v-tabs>
        </div>

        <v-row>
          <v-col cols="12">
            <div
              v-for="zone in Zones"
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
                  <v-carousel-item
                    v-for="part in zone.parts"
                    :key="part.name"
                  >
                    <MatchGraph
                      :zone-id="zoneId"
                      :type="part.type"
                      :group="part.group"
                      :json-data="part.jsonData"
                      :extra-title-data="part.extraTitleData"
                      :round-order="part.roundOrder"
                    ></MatchGraph>
                  </v-carousel-item>
                </v-carousel>

                <div v-if="!liveMode"
                     class="mx-auto container2" style="background: rgba(255, 255, 255, 0.2)">
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
                            v-for="n in zone.parts.map(p => p.name)"
                            :key="n"
                            v-slot="{ isSelected, toggle }"
                          >
                            <v-btn
                              :color="isSelected ? 'primary' : undefined"
                              class="mx-1 my-2"
                              rounded
                              size="small"
                              @click="toggle">
                              {{ n }}
                            </v-btn>
                          </v-slide-group-item>
                        </v-slide-group>
                      </v-sheet>
                    </div>
                    <div class="col text-right mr-2">
                      <v-btn
                        class="mx-1 my-2" variant="flat"
                        color="info" size="small"
                        :disabled="!promotionStore.selectedPlayer"
                        @click="appStore.analysisDialog = true"
                      >
                        分析
                      </v-btn>

                      <v-btn
                        class="mx-1 my-2" variant="flat"
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
      </div>
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
  right: 0;
  width: 100%;
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
