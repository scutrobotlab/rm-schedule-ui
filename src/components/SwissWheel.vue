<script setup lang="ts">
import {RGOptions} from "relation-graph-vue3/types/types/relation-graph-models/types";
import RelationGraph from 'relation-graph-vue3';

interface Props {
  zone: 'A' | 'B',
}

defineProps<Props>()

const graphRef = ref<RelationGraph>()

const options = ref<RGOptions>({
  layout: {
    layoutName: 'tree',
    from: 'left',
    max_per_width: 300,
    min_per_height: 40
  },
  defaultNodeShape: 1,
  defaultNodeWidth: 120,
  defaultLineShape: 4,
  defaultJunctionPoint: 'lr',
  defaultNodeBorderWidth: 0,
  defaultLineTextOffset_x: -8,
  defaultLineTextOffset_y: -1
})

onMounted(() => {
  const jsonData = {
    rootId: 'a',
    nodes: [
      {
        id: '#1',
        text: '0:0 <br> A1 - A9 <br> A2 - A10 <br> A3 - A11 <br> A4 - A12 <br> A5 - A13 <br> A6 - A14 <br> A7 - A15 <br> A8 - A16',
      },
      {
        id: '#2',
        text: '1:0 <br> A-1 - A-2 <br> A-3 - A-4 <br> A-5 - A-6 <br> A-7 - A-8',
      },
      {
        id: '#3',
        text: '0:1 <br> A-9 - A-10 <br> A-11 - A-12 <br> A-13 - A-14 <br> A-15 - A-16',
      },
      {
        id: '#4',
        text: '2:0 <br> A-(2) - A-(1) <br> A-(4) - A-(3)',
      },
      {
        id: '#5',
        text: '1:1 <br> A-(6) - A-(5) <br> A-(8) - A-(7) <br> A - (10) - A - (9) <br> A-(12) - A - (11)',
      },
      {
        id: '#6',
        text: '0:2 淘汰 <br> A-(14) - A-(13) <br> A-(16) - A-(15)'
      },
      {
        id: '#7',
        text: '3:0 晋级 <br> T1 T2',
      },
      {
        id: '#8',
        text: '2:1 晋级 <br> T3 T4 T5 <br> T6 T7 T8',
      },
      {
        id: '#9',
        text: '1:2 淘汰 <br> T9 T10 T11 T12',
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

  graphRef.value.setJsonData(jsonData)
})
</script>

<template>
  <div>
    <div style="height: calc(100vh - 200px); width: 100%;">
      <relation-graph ref="graphRef" :options="options">
        <!--        <template #node="{node}">-->
        <!--          <div>-->
        <!--            {{ node.text }}-->
        <!--          </div>-->
        <!--        </template>-->
      </relation-graph>
    </div>
  </div>
</template>

<style scoped lang="sass">

</style>
