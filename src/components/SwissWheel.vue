<script setup lang="ts">
import {RGOptions} from "relation-graph-vue3/types/types/relation-graph-models/types";
import RelationGraph from 'relation-graph-vue3';
import {usePromotionStore} from "../stores/promotion";
import {MatchNode} from "../types/schedule";
import {computed} from "vue";

interface Props {
  zone: 'A' | 'B',
}

const props = defineProps<Props>()

const promotionStore = usePromotionStore();
promotionStore.updateSchedule().then(() => {
  graphRef.value.setJsonData(jsonData)
})

const graphRef = ref<RelationGraph>()

const options = ref<RGOptions>({
  layout: {
    layoutName: 'tree',
    from: 'left',
    max_per_width: 300,
    min_per_height: 40
  },
  defaultNodeShape: 1,
  defaultNodeWidth: 250,
  defaultLineShape: 4,
  defaultJunctionPoint: 'lr',
  defaultNodeBorderWidth: 0,
})

function match(orderNumber: number): MatchNode | undefined {
  return promotionStore.getMatchByOrder(orderNumber)
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

const jsonData = {
  rootId: '#1',
  nodes: [
    {
      id: '#1',
      text: '第一轮 0:0',
      data: {
        title: '第一轮 0:0',
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
        zones: [
          {
            matches: [17, 18, 19, 20],
            text: ['A-1 - A-2', 'A-3 - A-4', 'A-5 - A-6', 'A-7 - A-8']
          },
          {
            matches: [25, 26, 27, 28],
            text: ['B-1 - B-2', 'B-3 - B-4', 'B-5 - B-6', 'B-7 - B-8']
          }
        ]
      }
    },
    {
      id: '#3',
      text: '第二轮 0:1',
      data: {
        title: '第二轮 0:1',
        zones: [
          {
            matches: [21, 22, 23, 24],
            text: ['A-9 - A-10', 'A-11 - A-12', 'A-13 - A-14', 'A-15 - A-16']
          },
          {
            matches: [29, 30, 31, 32],
            text: ['B-9 - B-10', 'B-11 - B-12', 'B-13 - B-14', 'B-15 - B-16']
          }
        ]
      }
    },
    {
      id: '#4',
      text: '第三轮 2:0',
      data: {
        title: '第三轮 2:0',
        zones: [
          {
            matches: [33, 34],
            text: ['A-(2) - A-(1)', 'A-(4) - A-(3)']
          },
          {
            matches: [39, 40],
            text: ['B-(2) - B-(1)', 'B-(4) - B-(3)']
          }
        ]
      }
    },
    {
      id: '#5',
      text: '第三轮 1:1',
      data: {
        title: '第三轮 1:1',
        zones: [
          {
            matches: [35, 36, 37, 38],
            text: ['A-(6) - A-(5)', 'A-(8) - A-(7)', 'A-(10) - A-(9)', 'A-(12) - A-(11)']
          },
          {
            matches: [41, 42, 43, 44],
            text: ['B-(6) - B-(5)', 'B-(8) - B-(7)', 'B-(10) - B-(9)', 'B-(12) - B-(11)']
          }
        ]
      }
    },
    {
      id: '#6',
      text: '第三轮 0:2 淘汰',
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
  <div>
    <h3 class="mt-2 ml-4 text-disabled">半区 {{ zone }}</h3>
    <div style="height: calc(100vh - 200px);">
      <relation-graph ref="graphRef" :options="options">
        <template #node="{node}">
          <div class="pa-2">
            <h2>{{ node.data.title }}</h2>
            <v-spacer class="mt-1"/>
            <div v-for="(v, i) in node.data.zones[zoneIndex].matches" :key="i">
              <div v-if="match(v).redSide.player?.team" class="text-caption">
                <span style="color: white">
                {{ limitText(match(v).redSide.player?.team.collegeName, 9) }} -
                </span>
                <span style="color: white">
                {{ limitText(match(v).blueSide.player?.team.collegeName, 9) }}
                </span>
              </div>
              <div v-else>
                {{ node.data.zones[zoneIndex].text[i] }}
              </div>
            </div>
          </div>
        </template>
      </relation-graph>
    </div>
    <span class="ml-2 mb-2 text-disabled text-end">
      华南理工大学 华南虎
    </span>
  </div>
</template>

<style scoped lang="sass">

</style>
