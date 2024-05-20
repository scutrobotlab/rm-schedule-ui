<script setup lang="ts">
import {RGOptions} from "relation-graph-vue3/types/types/relation-graph-models/types";
import RelationGraph from 'relation-graph-vue3';
import {usePromotionStore} from "../stores/promotion";
import {MatchNode, Player} from "../types/schedule";
import {computed} from "vue";
import {GroupPlayer} from "../types/group_rank_info";

interface Props {
  zone: 'A' | 'B',
}

const props = defineProps<Props>()

const loading = ref(true)

const promotionStore = usePromotionStore();
const promise1 = promotionStore.updateSchedule()
const promise2 = promotionStore.updateGroupRank()
Promise.all([promise1, promise2]).then(async () => {
  await graphRef.value.setJsonData(jsonData)
  await graphRef.value.getInstance().zoomToFit()
  loading.value = false
})

const graphRef = ref<RelationGraph>()

const nodeWidth = 280;
const options = ref<RGOptions>({
  layout: {
    'layoutName': 'fixed',
    'layoutClassName': 'seeks-layout-fixed',
    'defaultJunctionPoint': 'border',
    'defaultNodeShape': 0,
    'defaultLineShape': 1
  },
  backgroundColor: 'transparent',
  defaultNodeColor: '#263238',
  defaultNodeShape: 1,
  defaultNodeWidth: nodeWidth,
  defaultLineShape: 4,
  defaultJunctionPoint: 'lr',
  disableDragNode: true,
  disableDragCanvas: true,
  zoomToFitWhenRefresh: true,
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

function isForecast(node: any): boolean {
  return node.data.round == round.value + 1
}

function winner(orderNumber: number): Player | null {
  const match = promotionStore.getMatchByOrder(orderNumber)
  if (match.redSideWinGameCount == 2) return match.redSide.player
  if (match.blueSideWinGameCount == 2) return match.blueSide.player
  return null
}

function loser(orderNumber: number): Player | null {
  const match = promotionStore.getMatchByOrder(orderNumber)
  if (match.redSideWinGameCount == 2) return match.blueSide.player
  if (match.blueSideWinGameCount == 2) return match.redSide.player
  return null
}

function padNumber(num: number): string {
  return num.toString().padStart(2, '0');
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
  // return 1;
  // return 2;
  // return 3;
  // return 4;
  switch (props.zone) {
    case 'A':
      if (promotionStore.getMatchByOrder(45).redSide.player) return 4
      else if (promotionStore.getMatchByOrder(33).redSide.player) return 3
      else if (promotionStore.getMatchByOrder(17).redSide.player) return 2
      else if (promotionStore.getMatchByOrder(1).redSide.player) return 1
      else return 0
    case 'B':
      if (promotionStore.getMatchByOrder(46).redSide.player) return 4
      else if (promotionStore.getMatchByOrder(39).redSide.player) return 3
      else if (promotionStore.getMatchByOrder(25).redSide.player) return 2
      else if (promotionStore.getMatchByOrder(9).redSide.player) return 1
      else return 1
    default:
      return 0
  }
})

const rx = 0;
const ry = 0;

const jsonData = {
  rootId: '#1',
  nodes: [
    {
      id: '#1',
      text: '第一轮 0:0',
      x: rx,
      y: ry,
      data: {
        title: '瑞士轮第一轮 0-0',
        titleColor: '#FFFFFF',
        round: 1,
        type: 'match',
        zones: [
          {
            matches: [1, 2, 3, 4, 5, 6, 7, 8],
            winners: [],
            losers: [],
            text: ['A1', 'A9', 'A2', 'A10', 'A3', 'A11', 'A4', 'A12', 'A5', 'A13', 'A6', 'A14', 'A7', 'A15', 'A8', 'A16']
          },
          {
            matches: [9, 10, 11, 12, 13, 14, 15, 16],
            winners: [],
            losers: [],
            text: ['B1', 'B9', 'B2', 'B10', 'B3', 'B11', 'B4', 'B12', 'B5', 'B13', 'B6', 'B14', 'B7', 'B15', 'B8', 'B16']
          }
        ]
      }
    },
    {
      id: '#2',
      text: '第二轮 1:0',
      x: rx + nodeWidth + 100,
      y: ry - 80,
      data: {
        title: '瑞士轮第二轮 1-0',
        titleColor: '#FFFFFF',
        round: 2,
        type: 'match',
        zones: [
          {
            matches: [17, 18, 19, 20],
            winners: [1, 2, 3, 4, 5, 6, 7, 8],
            losers: [],
            text: ['A-1', 'A-2', 'A-3', 'A-4', 'A-5', 'A-6', 'A-7', 'A-8'],
            forecasts: [
              {red: 1, blue: 2},
              {red: 3, blue: 4},
              {red: 5, blue: 6},
              {red: 7, blue: 8}
            ]
          },
          {
            matches: [25, 26, 27, 28],
            winners: [9, 10, 11, 12, 13, 14, 15, 16],
            losers: [],
            text: ['B-1', 'B-2', 'B-3', 'B-4', 'B-5', 'B-6', 'B-7', 'B-8'],
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
      x: rx + nodeWidth + 100,
      y: ry + 300,
      data: {
        title: '瑞士轮第二轮 0-1',
        titleColor: '#FFFFFF',
        round: 2,
        type: 'match',
        zones: [
          {
            matches: [21, 22, 23, 24],
            winners: [],
            losers: [1, 2, 3, 4, 5, 6, 7, 8],
            text: ['A-9', 'A-10', 'A-11', 'A-12', 'A-13', 'A-14', 'A-15', 'A-16'],
            forecasts: [
              {red: 9, blue: 10},
              {red: 11, blue: 12},
              {red: 13, blue: 14},
              {red: 15, blue: 16}
            ]
          },
          {
            matches: [29, 30, 31, 32],
            winners: [],
            losers: [9, 10, 11, 12, 13, 14, 15, 16],
            text: ['B-9', 'B-10', 'B-11', 'B-12', 'B-13', 'B-14', 'B-15', 'B-16'],
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
      x: rx + 2 * nodeWidth + 200,
      y: ry - 140,
      data: {
        title: '瑞士轮第三轮 2-0',
        titleColor: '#FFFFFF',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [33, 34],
            winners: [17, 18, 19, 20],
            losers: [],
            text: ['A-(2)', 'A-(1)', 'A-(4)', 'A-(3)'],
            forecasts: [
              {red: 2, blue: 1},
              {red: 4, blue: 3}
            ]
          },
          {
            matches: [39, 40],
            winners: [25, 26, 27, 28],
            losers: [],
            text: ['B-(2)', 'B-(1)', 'B-(4)', 'B-(3)'],
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
      x: rx + 2 * nodeWidth + 200,
      y: ry + 90,
      data: {
        title: '瑞士轮第三轮 1-1',
        titleColor: '#FFFFFF',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [35, 36, 37, 38],
            winners: [21, 22, 23, 24],
            losers: [17, 18, 19, 20],
            text: ['A-(6)', 'A-(5)', 'A-(8)', 'A-(7)', 'A-(10)', 'A-(9)', 'A-(12)', 'A-(11)'],
            forecasts: [
              {red: 6, blue: 5},
              {red: 8, blue: 7},
              {red: 10, blue: 9},
              {red: 12, blue: 11}
            ]
          },
          {
            matches: [41, 42, 43, 44],
            winners: [29, 30, 31, 32],
            losers: [25, 26, 27, 28],
            text: ['B-(6)', 'B-(5)', 'B-(8)', 'B-(7)', 'B-(10)', 'B-(9)', 'B-(12)', 'B-(11)'],
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
      x: rx + 2 * nodeWidth + 200,
      y: ry + 465,
      data: {
        title: '淘汰 0-2',
        titleColor: '#B0BEC5',
        round: 4,
        type: 'eliminate',
        zones: [
          {
            winners: [],
            losers: [21, 22, 23, 24],
            text: ['A-(13)', 'A-(14)', 'A-(15)', 'A-(16)']
          },
          {
            winners: [],
            losers: [29, 30, 31, 32],
            text: ['B-(13)', 'B-(14)', 'B-(15)', 'B-(16)']
          }
        ]
      }
    },
    {
      id: '#7',
      text: '第三轮 3:0 晋级',
      x: rx + 3 * nodeWidth + 300,
      y: ry - 60,
      data: {
        title: '晋级淘汰赛 3-0',
        titleColor: '#FBC02D',
        round: 4,
        type: 'promote',
        zones: [
          {
            winners: [33, 34],
            losers: [],
            text: ['T1', 'T2']
          },
          {
            winners: [39, 40],
            losers: [],
            text: ['T1', 'T2']
          }
        ]
      }
    },
    {
      id: '#8',
      text: '第三轮 2:1 晋级',
      x: rx + 3 * nodeWidth + 300,
      y: ry + 100,
      data: {
        title: '晋级淘汰赛 2-1',
        titleColor: '#FBC02D',
        round: 4,
        type: 'promote',
        zones: [
          {
            winners: [35, 36, 37, 38],
            losers: [33, 34],
            text: ['T3', 'T4 ', 'T5', 'T6', 'T7', 'T8']
          },
          {
            winners: [41, 42, 43, 44],
            losers: [39, 40],
            text: ['T3', 'T4 ', 'T5', 'T6', 'T7', 'T8']
          }
        ]
      }
    },
    {
      id: '#9',
      text: '第三轮 1:2 淘汰',
      x: rx + 3 * nodeWidth + 300,
      y: ry + 400,
      data: {
        title: '淘汰 1-2',
        titleColor: '#B0BEC5',
        round: 4,
        type: 'eliminate',
        zones: [
          {
            winners: [],
            losers: [35, 36, 37, 38],
            text: ['T9', 'T10', 'T11', 'T12']
          },
          {
            winners: [],
            losers: [41, 42, 43, 44],
            text: ['T9', 'T10', 'T11', 'T12']
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
        <h1 class="font-weight-bold">RoboMaster 2024超级对抗赛 东部赛区 {{ zone }}半区</h1>
      </div>
      <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
      <relation-graph ref="graphRef" :options="options">
        <template #node="{node}">
          <div class="py-2 my-1" :style="'color: ' + node.data.titleColor">
            <p class="mt-1 text-h6" :style="'color: ' + node.data.titleColor">
              <b>{{ node.data.title }}</b>
              <span class="ml-1" v-if="isForecast(node)">*</span>
            </p>

            <div v-if="node.data.type == 'match'" class="mt-2">
              <div class="mx-2"
                   v-for="(v, i) in node.data.zones[zoneIndex].matches" :key="i">

                <!--已确认的赛程-->
                <div v-if="round + 1 > node.data.round" class="container my-3">
                  <div class="container mt-2">
                    <div class="left-column ma-1">
                      <h2 class="px-1">{{ padNumber(match(v).orderNumber) }}</h2>
                    </div>

                    <div class="right-column">
                      <div class="top-row row-content mb-1">
                        <div style="background: #D32F2F">
                          <h4 class="px-1">{{ match(v).redSideWinGameCount }}</h4>
                        </div>
                        <v-avatar class="mx-1" color="white" size="x-small">
                          <v-img :src="match(v).redSide.player?.team.collegeLogo"></v-img>
                        </v-avatar>
                        <span class="one-line-text">{{ match(v).redSide.player?.team.collegeName }}</span>
                      </div>

                      <div class="row-content">
                        <div style="background: #1976D2">
                          <h4 class="px-1">{{ match(v).blueSideWinGameCount }}</h4>
                        </div>
                        <v-avatar class="mx-1" color="white" size="x-small">
                          <v-img :src="match(v).blueSide.player?.team.collegeLogo"></v-img>
                        </v-avatar>
                        <span class="one-line-text">{{ match(v).blueSide.player?.team.collegeName }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!--实时预测 动态刷新-->
                <div v-else-if="round + 1 == node.data.round" class="container">
                  <div class="container ml-2">
                    <div class="right-column">
                      <div class="top-row row-content mb-3">
                        <div style="background: #9E9E9E">
                          <h4 class="px-1"> - </h4>
                        </div>
                        <v-avatar class="mx-1 avatar-center" color="white" size="x-small">
                          <v-img :src="winner(v)?.team.collegeLogo"/>
                        </v-avatar>
                        <span class="one-line-text">{{ winner(v)?.team.collegeName }}</span>
                      </div>

                      <div class="row-content mb-3">
                        <div style="background: #9E9E9E">
                          <h4 class="px-1"> - </h4>
                        </div>
                        <v-avatar class="mx-1 avatar-center" color="white" size="x-small">
                          <v-img :src="loser(v)?.team.collegeLogo"/>
                        </v-avatar>
                        <span class="one-line-text">{{ loser(v)?.team.collegeName }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!--纯文字+红蓝R标 A-1-->
                <div v-else class="container my-3">
                  <div class="container mt-2">
                    <div class="left-column ma-1">
                      <h2 class="px-1">{{ padNumber(match(v).orderNumber) }}</h2>
                    </div>

                    <div class="right-column">
                      <div class="top-row row-content mb-1">
                        <div style="background: #9E9E9E">
                          <h4 class="px-1"> - </h4>
                        </div>
                        <v-avatar class="mx-1" size="x-small">
                          <v-img src="@/assets/school_red.png"></v-img>
                        </v-avatar>
                        <span class="one-line-text">{{ node.data.zones[zoneIndex].text[2 * i] }}</span>
                      </div>

                      <div class="row-content">
                        <div style="background: #9E9E9E">
                          <h4 class="px-1"> - </h4>
                        </div>
                        <v-avatar class="mx-1" size="x-small">
                          <v-img src="@/assets/school_blue.png"></v-img>
                        </v-avatar>
                        <span class="one-line-text">{{ node.data.zones[zoneIndex].text[2 * i + 1] }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!--晋级和淘汰-->
            <div v-else-if="node.data.type == 'eliminate' || node.data.type == 'promote'"
                 class="my-3 mx-4">
              <div v-for="(v, i) in node.data.zones[zoneIndex].winners" :key="i"
                   class="mb-3">
                <div v-if="round >= 3 && winner(v)" class="container2 mb-1">
                  <v-avatar class="mx-1 avatar-center" color="white" size="x-small">
                    <v-img :src="winner(v)?.team.collegeLogo"/>
                  </v-avatar>
                  <span class="one-line-text">{{ winner(v)?.team.collegeName }}</span>
                </div>
                <div v-else class="container2 mb-1">
                  <v-avatar class="mx-1 avatar-center" color="white" size="x-small">
                    <v-img src="@/assets/school_grey.png"/>
                  </v-avatar>
                  <span class="one-line-text">待定 {{ node.data.zones[zoneIndex].text[i] }}</span>
                </div>
              </div>

              <div v-for="(v, i) in node.data.zones[zoneIndex].losers" :key="i"
                   class="mb-3">
                <div v-if="round >= 3 && loser(v)" class="container2 mb-1">
                  <v-avatar class="mx-1 avatar-center" color="white" size="x-small">
                    <v-img :src="loser(v)?.team.collegeLogo"/>
                  </v-avatar>
                  <span class="one-line-text">{{ loser(v)?.team.collegeName }}</span>
                </div>
                <div v-else class="container2 mb-1">
                  <v-avatar class="mx-1 avatar-center" color="white" size="x-small">
                    <v-img src="@/assets/school_grey.png"/>
                  </v-avatar>
                  <span class="one-line-text">待定 {{ node.data.zones[zoneIndex].text[i] }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </relation-graph>
    </div>
    <div class="text-end">
      <span class="ml-2 mb-2 text-disabled">
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
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3);
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

.container {
  display: flex;
  width: 100%; /* 确保容器宽度 */
}

.left-column {
  flex: 0 0 10%;
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: center;
}

.right-column {
  flex: 1; /* 占据剩余的空间 */
  display: flex;
  flex-direction: column;
}

.row-content {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: flex-start; /* 水平左对齐 */
  width: 90%; /* 确保行内容宽度 */
}

.one-line-text {
  white-space: nowrap; /* 禁止换行 */
  overflow: hidden; /* 隐藏溢出文本 */
  text-overflow: ellipsis; /* 使用省略号替代溢出文本 */
  flex: 1; /* 占据剩余空间 */
  min-width: 0; /* 确保 flex 项目的最小宽度为 0 */
  text-align: left; /* 确保文本居左对齐 */
}

.container2 {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  flex: 1; /* 平分右边列的高度 */
  justify-content: flex-start; /* 水平左对齐 */
}
</style>
