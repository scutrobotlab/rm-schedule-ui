<script setup lang="ts">
import {RGOptions} from "relation-graph-vue3/types/types/relation-graph-models/types";
import RelationGraph from 'relation-graph-vue3';
import {usePromotionStore} from "../stores/promotion";
import {MatchNode} from "../types/schedule";
import {computed} from "vue";
import {GroupPlayer} from "../types/group_rank_info";

interface Props {
  zone: 'A' | 'B',
}

const props = defineProps<Props>()

const promotionStore = usePromotionStore();
promotionStore.updateSchedule().then(async () => {
  await promotionStore.updateGroupRank()
  await graphRef.value.setJsonData(jsonData)
})

const graphRef = ref<RelationGraph>()

const options = ref<RGOptions>({
  layout: {
    layoutName: 'tree',
    from: 'left',
    max_per_width: 300,
    min_per_height: 40
  },
  backgroundColor: 'transparent',
  defaultNodeColor: '#212121',
  defaultNodeShape: 1,
  defaultNodeWidth: 250,
  defaultLineShape: 4,
  defaultJunctionPoint: 'lr',
  disableDragNode: true,
})

function match(orderNumber: number): MatchNode | undefined {
  return promotionStore.getMatchByOrder(orderNumber)
}

function forecast(index: number): GroupPlayer[] | undefined {
  return promotionStore.getForecastByIndex(zoneIndex.value, index)
}

function limitText(text: string, limit: number): string {
  return text.length > limit ? text.slice(0, limit) + '...' : text
}

const zoneIndex = computed(() => {
  switch (props.zone) {
    case 'A':
      return 0
    case 'B':
      return 1
    default:
      return 0
  }
})

const round = computed(() => {
  switch (props.zone) {
    case 'A':
      if (promotionStore.getMatchByOrder(17).redSide.player) return 2
      else if (promotionStore.getMatchByOrder(33).redSide.player) return 3
      else return 1
    case 'B':
      if (promotionStore.getMatchByOrder(25).redSide.player) return 2
      else if (promotionStore.getMatchByOrder(39).redSide.player) return 3
      else return 1
    default:
      return 0
  }
})

const jsonData = {
  rootId: '#1',
  nodes: [
    {
      id: '#1',
      text: '第一轮 0:0',
      data: {
        title: '第一轮 0:0',
        round: 1,
        zones: [
          {
            matches: [1, 2, 3, 4, 5, 6, 7, 8],
            text: ['A1 - A9', 'A2 - A10', 'A3 - A11', 'A4 - A12', 'A5 - A13', 'A6 - A14', 'A7 - A15', 'A8 - A16']
          },
          {
            matches: [9, 10, 11, 12, 13, 14, 15, 16],
            text: ['B1 - B9', 'B2 - B10', 'B3 - B11', 'B4 - B12', 'B5 - B13', 'B6 - B14', 'B7 - B15', 'B8 - B16']
          }
        ]
      }
    },
    {
      id: '#2',
      text: '第二轮 1:0',
      data: {
        title: '第二轮 1:0',
        round: 2,
        zones: [
          {
            matches: [17, 18, 19, 20],
            text: ['A-1 - A-2', 'A-3 - A-4', 'A-5 - A-6', 'A-7 - A-8'],
            forecasts: [
              {red: 1, blue: 2},
              {red: 3, blue: 4},
              {red: 5, blue: 6},
              {red: 7, blue: 8}
            ]
          },
          {
            matches: [25, 26, 27, 28],
            text: ['B-1 - B-2', 'B-3 - B-4', 'B-5 - B-6', 'B-7 - B-8'],
            forecasts: [
              {red: 1, blue: 2},
              {red: 3, blue: 4},
              {red: 5, blue: 6},
              {red: 7, blue: 8}
            ]
          }
        ]
      }
    },
    {
      id: '#3',
      text: '第二轮 0:1',
      data: {
        title: '第二轮 0:1',
        round: 2,
        zones: [
          {
            matches: [21, 22, 23, 24],
            text: ['A-9 - A-10', 'A-11 - A-12', 'A-13 - A-14', 'A-15 - A-16'],
            forecasts: [
              {red: 9, blue: 10},
              {red: 11, blue: 12},
              {red: 13, blue: 14},
              {red: 15, blue: 16}
            ]
          },
          {
            matches: [29, 30, 31, 32],
            text: ['B-9 - B-10', 'B-11 - B-12', 'B-13 - B-14', 'B-15 - B-16'],
            forecasts: [
              {red: 9, blue: 10},
              {red: 11, blue: 12},
              {red: 13, blue: 14},
              {red: 15, blue: 16}
            ]
          }
        ]
      }
    },
    {
      id: '#4',
      text: '第三轮 2:0',
      data: {
        title: '第三轮 2:0',
        round: 3,
        zones: [
          {
            matches: [33, 34],
            text: ['A-(2) - A-(1)', 'A-(4) - A-(3)'],
            forecasts: [
              {red: 2, blue: 1},
              {red: 4, blue: 3}
            ]
          },
          {
            matches: [39, 40],
            text: ['B-(2) - B-(1)', 'B-(4) - B-(3)'],
            forecasts: [
              {red: 2, blue: 1},
              {red: 4, blue: 3}
            ]
          }
        ]
      }
    },
    {
      id: '#5',
      text: '第三轮 1:1',
      data: {
        title: '第三轮 1:1',
        round: 3,
        zones: [
          {
            matches: [35, 36, 37, 38],
            text: ['A-(6) - A-(5)', 'A-(8) - A-(7)', 'A-(10) - A-(9)', 'A-(12) - A-(11)'],
            forecasts: [
              {red: 6, blue: 5},
              {red: 8, blue: 7},
              {red: 10, blue: 9},
              {red: 12, blue: 11}
            ]
          },
          {
            matches: [41, 42, 43, 44],
            text: ['B-(6) - B-(5)', 'B-(8) - B-(7)', 'B-(10) - B-(9)', 'B-(12) - B-(11)'],
            forecasts: [
              {red: 6, blue: 5},
              {red: 8, blue: 7},
              {red: 10, blue: 9},
              {red: 12, blue: 11}
            ]
          }
        ]
      }
    },
    {
      id: '#6',
      text: '第三轮 0:2 淘汰',
      round: 4,
      data: {
        title: '第三轮 0:2 淘汰',
        zones: [
          {
            matches: [],
            text: ['A-(14) - A-(13)', 'A-(16) - A-(15)']
          },
          {
            matches: [],
            text: ['B-(14) - B-(13)', 'B-(16) - B-(15)']
          }
        ]
      }
    },
    {
      id: '#7',
      text: '第三轮 3:0 晋级',
      data: {
        title: '第三轮 3:0 晋级',
        round: 4,
        zones: [
          {
            matches: [],
            text: ['T1 T2']
          },
          {
            matches: [],
            text: ['T1 T2']
          }
        ]
      }
    },
    {
      id: '#8',
      text: '第三轮 2:1 晋级',
      data: {
        title: '第三轮 2:1 晋级',
        round: 4,
        zones: [
          {
            matches: [],
            text: ['T3 T4 T5 T6 T7 T8']
          },
          {
            matches: [],
            text: ['T3 T4 T5 T6 T7 T8']
          }
        ]
      }
    },
    {
      id: '#9',
      text: '第三轮 1:2 淘汰',
      data: {
        title: '第三轮 1:2 淘汰',
        round: 4,
        zones: [
          {
            matches: [],
            text: ['T9 T10 T11 T12']
          },
          {
            matches: [],
            text: ['T9 T10 T11 T12']
          }
        ]
      }
    },
  ],
  lines: [
    {from: '#1', to: '#2',},
    {from: '#1', to: '#3',},
    {from: '#2', to: '#4',},
    {from: '#2', to: '#5',},
    {from: '#3', to: '#5',},
    {from: '#3', to: '#6',},
    {from: '#4', to: '#7',},
    {from: '#4', to: '#8',},
    {from: '#5', to: '#8',},
    {from: '#5', to: '#9',},
  ],
}
</script>

<template>
  <div class="my-graph pa-4">
    <div style="height: calc(100vh - 180px);">
      <div class="text-center mt-4">
        <h1 class="font-weight-bold">东部赛区 半区 {{ zone }}</h1>
      </div>
      <relation-graph ref="graphRef" :options="options">
        <template #node="{node}">
          <div class="py-2">
            <h2 class="mr-2">{{ node.data.title }}
              <span v-if="node.data.round == round + 1">*</span>
            </h2>
            <v-spacer class="mt-2"/>
            <div v-for="(v, i) in node.data.zones[zoneIndex].matches" :key="i">
              <div v-if="match(v).redSide.player?.team" class="text-caption">
                <span style="color: white">
                {{ limitText(match(v).redSide.player?.team.collegeName, 8) }}
                  {{ match(v).redSideWinGameCount }}
                </span>
                :
                <span style="color: white">
                  {{ match(v).blueSideWinGameCount }}
                {{ limitText(match(v).blueSide.player?.team.collegeName, 8) }}
                </span>
              </div>
              <div v-else-if="node.data.round == round + 1">
                <div
                  v-if="forecast(node.data.zones[zoneIndex].forecasts[i].red - 1)[2].itemValue != '0/0/0'"
                  class="text-caption"
                >
                  {{
                    limitText(forecast(node.data.zones[zoneIndex].forecasts[i].red - 1)[1].itemValue['collegeName'], 9)
                  }}
                  -
                  {{
                    limitText(forecast(node.data.zones[zoneIndex].forecasts[i].blue - 1)[1].itemValue['collegeName'], 9)
                  }}
                </div>
                <div v-else>
                  {{ node.data.zones[zoneIndex].text[i] }}
                </div>
              </div>
              <div v-else>
                {{ node.data.zones[zoneIndex].text[i] }}
              </div>
            </div>
          </div>
        </template>
      </relation-graph>
    </div>
    <div>
      <span class="ml-2 mb-2 text-disabled text-end">
        * 根据官网排名<b>实时</b>预测
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
::v-deep(.relation-graph) {
  .rel-map {
    background: none !important;

    .rel-node-shape-1 {
      background: rgba(255, 255, 255, 0.2) !important;
      border-radius: 10px;
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
    }
  }

  .rel-toolbar {
    color: #ffffff;

    .c-current-zoom {
      color: #ffffff;
    }
  }

  .rel-node-checked {
    box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.3);
  }

  .rel-node {
    span {
      white-space: nowrap;
    }
  }
}

.my-graph {
  background: rgba(0, 0, 0, 0.75);
}
</style>
