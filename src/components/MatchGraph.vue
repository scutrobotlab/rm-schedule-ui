<script setup lang="ts">
import {RGOptions} from "relation-graph-vue3/types/types/relation-graph-models/types";
import RelationGraph from 'relation-graph-vue3';
import {usePromotionStore} from "../stores/promotion";
import {MatchNode, Player, PlayerWithMatch} from "../types/schedule";
import {computed, onMounted} from "vue";
import {useAppStore} from "../stores/app";

interface Props {
  zoneId: number,
  type: 'group' | 'knockout',
  group: '' | 'A' | 'B',
}

const props = defineProps<Props>()

const loading = ref(true)

const appStore = useAppStore();
const promotionStore = usePromotionStore();
const promise1 = promotionStore.updateSchedule()
const promise2 = promotionStore.updateGroupRank()
Promise.all([promise1, promise2]).then(async () => {
  await updateMpMatch()
  loading.value = false
  if (props.type == 'group') {
    await graphRef.value.setJsonData(groupJsonData)
  } else {
    await graphRef.value.setJsonData(knockoutJsonData)
  }
  await graphRef.value.getInstance().zoomToFit()
})

function refresh() {
  promotionStore.updateSchedule()
  promotionStore.updateGroupRank()
  updateMpMatch()
}

setInterval(refresh, 30_000)

const graphRef = ref<RelationGraph>()

const nodeWidth = 300;
const options = ref<RGOptions>({
  layout: {
    'layoutName': 'fixed',
    'layoutClassName': 'seeks-layout-fixed',
    'defaultJunctionPoint': 'border',
    'defaultNodeShape': 0,
    'defaultLineShape': 1
  },
  backgroundColor: 'transparent',
  defaultNodeColor: 'transparent',
  defaultNodeShape: 1,
  defaultNodeWidth: nodeWidth,
  defaultLineShape: 4,
  defaultJunctionPoint: 'lr',
  disableDragNode: true,
  disableDragCanvas: false,
  zoomToFitWhenRefresh: true,
  graphOffset_y: props.type == 'knockout' ? 0 : -40,
})

function match(orderNumber: number): MatchNode | undefined {
  return promotionStore.getMatchByOrder(props.zoneId, orderNumber)
}

function isForecast(node: any): boolean {
  return node.data.round == round.value + 1
}

function winner(orderNumber: number): Player | null {
  const match = promotionStore.getMatchByOrder(props.zoneId, orderNumber)
  if (match.status != 'DONE') return null
  if (match.redSideWinGameCount == 2) return match.redSide.player
  if (match.blueSideWinGameCount == 2) return match.blueSide.player
  return null
}

function loser(orderNumber: number): Player | null {
  const match = promotionStore.getMatchByOrder(props.zoneId, orderNumber)
  if (match.status != 'DONE') return null
  if (match.redSideWinGameCount == 2) return match.blueSide.player
  if (match.blueSideWinGameCount == 2) return match.redSide.player
  return null
}

function matchRank(player: Player): number {
  const zone = promotionStore.getZone(props.zoneId)
  for (let i = 0; i < zone.groups.nodes.length; i++) {
    const group = zone.groups.nodes[i]
    for (let j = 0; j < group.players.nodes.length; j++) {
      const p = group.players.nodes[j]
      if (p.team.id == player.team?.id) {
        return p.rank
      }
    }
  }
}

function rankList(zone: any): PlayerWithMatch[] {
  const playerWithMatches: PlayerWithMatch[] = []
  for (let i = 0; i < zone.winners.length; i++) {
    const player = winner(zone.winners[i])
    if (player) playerWithMatches.push({
      player: player,
      match: match(zone.winners[i])
    })
  }
  for (let i = 0; i < zone.losers.length; i++) {
    const player = loser(zone.losers[i])
    if (player) playerWithMatches.push({
      player: player,
      match: match(zone.losers[i])
    })
  }
  playerWithMatches.sort((a, b) => {
    return matchRank(a.player) - matchRank(b.player)
  })
  return playerWithMatches
}

function padNumber(num: number): string {
  return num.toString().padStart(2, '0');
}

function convertToOrdinal(number: number): string {
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return number + "st";
  } else if (lastDigit === 2 && lastTwoDigits !== 12) {
    return number + "nd";
  } else if (lastDigit === 3 && lastTwoDigits !== 13) {
    return number + "rd";
  } else {
    return number + "th";
  }
}

function generateNumberArray(baseId: number, n: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < n; i++) {
    result.push(baseId + i);
  }
  return result;
}

async function updateMpMatch() {
  let firstId: number, lastId: number
  if (props.type == 'group') {
    firstId = Number(promotionStore.getZone(props.zoneId).groupMatches.nodes[0].id)
    const idList = []
    groupJsonData.nodes.forEach(e => {
      e.data.zones[groupIndex.value].matches.forEach((order: number, i: number) => {
        idList.push(firstId + order - 1)
      })
    })
    await promotionStore.updateMpMatch(idList)
  } else if (props.type == 'knockout') {
    firstId = Number(promotionStore.getZone(props.zoneId).knockoutMatches.nodes[0].id)
    lastId = Number(promotionStore.getZone(props.zoneId).knockoutMatches.nodes[promotionStore.getZone(props.zoneId).knockoutMatches.nodes.length - 1].id)
    await promotionStore.updateMpMatch(generateNumberArray(firstId, lastId - firstId + 1))
  }
}

function colorfulNode(node: any): boolean {
  if (props.type != 'knockout') return false;
  if (node.data.type != 'match') return false;
  const _match = match(node.data.zones[0].matches[0])
  if (!_match) return false;
  return _match.status == 'STARTED';
}

function selectPlayer(player: Player) {
  if (promotionStore.selectedPlayer && player && promotionStore.selectedPlayer.id == player.id) {
    promotionStore.selectedPlayer = null
  } else {
    promotionStore.selectedPlayer = player
  }
}

function playerSelected(player: Player): boolean {
  if (!promotionStore.selectedPlayer) return false
  if (!player) return false
  return promotionStore.selectedPlayer.id == player.id
}

const fingersCount = ref(0);
const updateFingersCount = (event: TouchEvent) => {
  fingersCount.value = event.touches.length;
};

window.addEventListener('touchstart', updateFingersCount);
window.addEventListener('touchmove', updateFingersCount);
window.addEventListener('touchend', updateFingersCount);

const isDragging = ref(false);
const nodeStart = ref({x: 0, y: 0});
const canvasStart = ref({x: 0, y: 0});

const onDragStart = (x: number, y: number) => {
  isDragging.value = true;
  nodeStart.value = {x: x, y: y};
  const canvasOffset = graphRef.value.getInstance().options.canvasOffset
  canvasStart.value = {x: canvasOffset.x, y: canvasOffset.y};
};

const onTouchStart = (event: TouchEvent) => {
  if (fingersCount.value > 1) {
    // 两个手指以上不允许拖拽
    isDragging.value = false;
    return;
  }
  onDragStart(event.touches[0].pageX, event.touches[0].pageY);
};

const onTouchMove = (event: TouchEvent) => {
  if (fingersCount.value > 1) {
    // 两个手指以上不允许拖拽
    isDragging.value = false;
    return;
  }
  onDragging(event.touches[0].pageX, event.touches[0].pageY);
};

const onDragging = (x: number, y: number) => {
  if (isDragging.value) {
    const offsetX = x - nodeStart.value.x;
    const offsetY = y - nodeStart.value.y;
    graphRef.value.getInstance().options.canvasOffset = {
      x: canvasStart.value.x + offsetX,
      y: canvasStart.value.y + offsetY
    };
  }
};

const onDragEnd = (event: Event) => {
  isDragging.value = false;
};

const title = computed(() => {
  if (!promotionStore.schedule.data) return ''
  const zone = promotionStore.getZone(props.zoneId)
  if (props.type == 'knockout') return `${promotionStore.schedule.data.event.title} ${zone.name} 淘汰赛`
  else if (props.type == 'group') return `${promotionStore.schedule.data.event.title} ${zone.name} 瑞士轮 ${props.group}组`
})

const groupIndex = computed(() => {
  switch (props.group) {
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
  switch (props.group) {
    case 'A':
      if (promotionStore.getMatchByOrder(props.zoneId, 46).redSide.player) return 4
      else if (promotionStore.getMatchByOrder(props.zoneId, 33).redSide.player) return 3
      else if (promotionStore.getMatchByOrder(props.zoneId, 17).redSide.player) return 2
      else if (promotionStore.getMatchByOrder(props.zoneId, 1).redSide.player) return 1
      else return 0
    case 'B':
      if (promotionStore.getMatchByOrder(props.zoneId, 46).blueSide.player) return 4
      else if (promotionStore.getMatchByOrder(props.zoneId, 39).redSide.player) return 3
      else if (promotionStore.getMatchByOrder(props.zoneId, 25).redSide.player) return 2
      else if (promotionStore.getMatchByOrder(props.zoneId, 9).redSide.player) return 1
      else return 1
    default:
      return -1
  }
})

const rx = 0;
const ry = 0;

const groupJsonData = {
  rootId: '#1',
  nodes: [
    {
      id: '#1',
      text: '第一轮 0:0',
      x: rx,
      y: ry,
      data: {
        title: '瑞士轮第一轮 0胜0负',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5a879c',
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
      x: rx + nodeWidth + 80,
      y: ry - 80,
      data: {
        title: '瑞士轮第二轮 1胜0负',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5a879c',
        round: 2,
        type: 'match',
        zones: [
          {
            matches: [17, 18, 19, 20],
            winners: [1, 2, 3, 4, 5, 6, 7, 8],
            losers: [],
            text: ['A组 第一轮 第1名', 'A组 第一轮 第2名', 'A组 第一轮 第3名', 'A组 第一轮 第4名', 'A组 第一轮 第5名', 'A组 第一轮 第6名', 'A组 第一轮 第7名', 'A组 第一轮 第8名'],
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
            text: ['B组 第一轮 第1名', 'B组 第一轮 第2名', 'B组 第一轮 第3名', 'B组 第一轮 第4名', 'B组 第一轮 第5名', 'B组 第一轮 第6名', 'B组 第一轮 第7名', 'B组 第一轮 第8名'],
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
      x: rx + nodeWidth + 80,
      y: ry + 330,
      data: {
        title: '瑞士轮第二轮 0胜1负',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5a879c',
        round: 2,
        type: 'match',
        zones: [
          {
            matches: [21, 22, 23, 24],
            winners: [],
            losers: [1, 2, 3, 4, 5, 6, 7, 8],
            text: ['A组 第一轮 第9名', 'A组 第一轮 第10名', 'A组 第一轮 第11名', 'A组 第一轮 第12名', 'A组 第一轮 第13名', 'A组 第一轮 第14名', 'A组 第一轮 第15名', 'A组 第一轮 第16名'],
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
            text: ['B组 第一轮 第9名', 'B组 第一轮 第10名', 'B组 第一轮 第11名', 'B组 第一轮 第12名', 'B组 第一轮 第13名', 'B组 第一轮 第14名', 'B组 第一轮 第15名', 'B组 第一轮 第16名'],
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
      x: rx + 2 * nodeWidth + 160,
      y: ry - 120,
      data: {
        title: '瑞士轮第三轮 2胜0负',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5a879c',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [33, 34],
            winners: [17, 18, 19, 20],
            losers: [],
            text: ['A组 第二轮 第1名', 'A组 第二轮 第2名', 'A组 第二轮 第3名', 'A组 第二轮 第4名'],
            forecasts: [
              {red: 2, blue: 1},
              {red: 4, blue: 3}
            ]
          },
          {
            matches: [39, 40],
            winners: [25, 26, 27, 28],
            losers: [],
            text: ['B组 第二轮 第1名', 'B组 第二轮 第2名', 'B组 第二轮 第3名', 'B组 第二轮 第4名'],
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
      x: rx + 2 * nodeWidth + 160,
      y: ry + 110,
      data: {
        title: '瑞士轮第三轮 1胜1负',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5a879c',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [35, 36, 37, 38],
            winners: [21, 22, 23, 24],
            losers: [17, 18, 19, 20],
            text: ['A组 第二轮 第5名', 'A组 第二轮 第6名', 'A组 第二轮 第7名', 'A组 第二轮 第8名', 'A组 第二轮 第9名', 'A组 第二轮 第10名', 'A组 第二轮 第11名', 'A组 第二轮 第12名'],
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
            text: ['B组 第二轮 第5名', 'B组 第二轮 第6名', 'B组 第二轮 第7名', 'B组 第二轮 第8名', 'B组 第二轮 第9名', 'B组 第二轮 第10名', 'B组 第二轮 第11名', 'B组 第二轮 第12名'],
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
      x: rx + 2 * nodeWidth + 160,
      y: ry + 505,
      data: {
        title: '淘汰 0胜2负',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_loser_bg.png',
        borderColor: '#3e484d',
        round: 3,
        type: 'eliminate',
        zones: [
          {
            matches: [],
            winners: [],
            losers: [21, 22, 23, 24],
            text: ['A组 第13名', 'A组 第14名', 'A组 第15名', 'A组 第16名']
          },
          {
            matches: [],
            winners: [],
            losers: [29, 30, 31, 32],
            text: ['B组 第13名', 'B组 第14名', 'B组 第15名', 'B组 第16名']
          }
        ]
      }
    },
    {
      id: '#7',
      text: '第三轮 3:0 晋级',
      x: rx + 3 * nodeWidth + 240,
      y: ry + 20,
      data: {
        title: '晋级淘汰赛 3胜0负',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_winner_bg.png',
        borderColor: '#e7a662',
        round: 4,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [33, 34],
            losers: [],
            text: ['A组 第1名', 'A组 第2名']
          },
          {
            matches: [],
            winners: [39, 40],
            losers: [],
            text: ['B组 第1名', 'B组 第2名']
          }
        ]
      }
    },
    {
      id: '#8',
      text: '第三轮 2:1 晋级',
      x: rx + 3 * nodeWidth + 240,
      y: ry + 180,
      data: {
        title: '晋级淘汰赛 2胜1负',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_winner_bg.png',
        borderColor: '#e7a662',
        round: 4,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [35, 36, 37, 38],
            losers: [33, 34],
            text: ['A组 第3名', 'A组 第4名', 'A组 第5名', 'A组 第6名', 'A组 第7名', 'A组 第8名']
          },
          {
            matches: [],
            winners: [41, 42, 43, 44],
            losers: [39, 40],
            text: ['B组 第3名', 'B组 第4名', 'B组 第5名', 'B组 第6名', 'B组 第7名', 'B组 第8名']
          }
        ]
      }
    },
    {
      id: '#9',
      text: '第三轮 1:2 淘汰',
      x: rx + 3 * nodeWidth + 240,
      y: ry + 520,
      data: {
        title: '淘汰 1胜2负',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_loser_bg.png',
        borderColor: '#3e484d',
        round: 4,
        type: 'eliminate',
        zones: [
          {
            matches: [],
            winners: [],
            losers: [35, 36, 37, 38],
            text: ['A组 第9名', 'A组 第10名', 'A组 第11名', 'A组 第12名']
          },
          {
            matches: [],
            winners: [],
            losers: [41, 42, 43, 44],
            text: ['B组 第9名', 'B组 第10名', 'B组 第11名', 'B组 第12名']
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

const knockoutYOffset = 60;

const knockoutOrderNumbers = {
  498: [0,
    45, 46, 47, 48, 49, 50, 51, 52,
    53, 54, 57, 58,
    63, 64,
    66, 67,
  ],
  499: [0,
    45, 46, 47, 48, 49, 50, 51, 52,
    53, 54, 55, 56,
    61, 62,
    67, 69,
  ],
  500: [0,
    45, 46, 47, 48, 49, 50, 51, 52,
    53, 54, 55, 56,
    61, 62,
    65, 66,
  ],
}

const knockoutJsonData = {
  rootId: '#16',
  nodes: [
    {
      id: '#1',
      text: '16进8淘汰赛 第1场',
      x: rx - nodeWidth * 3 - 450,
      y: ry - knockoutYOffset * 7,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][1]],
            winners: [],
            losers: [],
            text: ['小组赛B 第1名', '小组赛A 第8名']
          },
        ]
      }
    },
    {
      id: '#2',
      text: '16进8淘汰赛 第2场',
      x: rx - nodeWidth * 3 - 450,
      y: ry - knockoutYOffset * 5,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][2]],
            winners: [],
            losers: [],
            text: ['小组赛A 第4名', '小组赛B 第5名']
          },
        ]
      }
    },
    {
      id: '#3',
      text: '16进8淘汰赛 第3场',
      x: rx - nodeWidth * 3 - 450,
      y: ry - knockoutYOffset * 3,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][3]],
            winners: [],
            losers: [],
            text: ['小组赛A 第7名', '小组赛B 第2名']
          },
        ]
      }
    },
    {
      id: '#4',
      text: '16进8淘汰赛 第4场',
      x: rx - nodeWidth * 3 - 450,
      y: ry - knockoutYOffset,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][4]],
            winners: [],
            losers: [],
            text: ['小组赛B 第6名', '小组赛A 第3名']
          },
        ]
      }
    },
    {
      id: '#5',
      text: '16进8淘汰赛 第5场',
      x: rx - nodeWidth * 3 - 450,
      y: ry + knockoutYOffset,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][5]],
            winners: [],
            losers: [],
            text: ['小组赛A 第2名', '小组赛B 第7名']
          },
        ]
      }
    },
    {
      id: '#6',
      text: '16进8淘汰赛 第6场',
      x: rx - nodeWidth * 3 - 450,
      y: ry + knockoutYOffset * 3,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][6]],
            winners: [],
            losers: [],
            text: ['小组赛B 第3名', '小组赛A 第6名']
          },
        ]
      }
    },
    {
      id: '#7',
      text: '16进8淘汰赛 第7场',
      x: rx - nodeWidth * 3 - 450,
      y: ry + knockoutYOffset * 5,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][7]],
            winners: [],
            losers: [],
            text: ['小组赛B 第8名', '小组赛A 第1名']
          },
        ]
      }
    },
    {
      id: '#8',
      text: '16进8淘汰赛 第8场',
      x: rx - nodeWidth * 3 - 450,
      y: ry + knockoutYOffset * 7,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][8]],
            winners: [],
            losers: [],
            text: ['小组赛A 第5名', '小组赛B 第4名']
          },
        ]
      }
    },
    {
      id: '#9',
      text: '8进4淘汰赛 第1场',
      x: rx - nodeWidth * 2 - 300,
      y: ry - knockoutYOffset * 6,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][9]],
            winners: [knockoutOrderNumbers[props.zoneId][2], knockoutOrderNumbers[props.zoneId][1]],
            losers: [],
            text: [`第${knockoutOrderNumbers[props.zoneId][2]}场 胜者`, `第${knockoutOrderNumbers[props.zoneId][1]}场 胜者`]
          },
        ]
      }
    },
    {
      id: '#10',
      text: '8进4淘汰赛 第2场',
      x: rx - nodeWidth * 2 - 300,
      y: ry - knockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][10]],
            winners: [knockoutOrderNumbers[props.zoneId][3], knockoutOrderNumbers[props.zoneId][4]],
            losers: [],
            text: [`第${knockoutOrderNumbers[props.zoneId][3]}场 胜者`, `第${knockoutOrderNumbers[props.zoneId][4]}场 胜者`]
          },
        ]
      }
    },
    {
      id: '#11',
      text: '8进4淘汰赛 第3场',
      x: rx - nodeWidth * 2 - 300,
      y: ry + knockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][11]],
            winners: [knockoutOrderNumbers[props.zoneId][6], knockoutOrderNumbers[props.zoneId][5]],
            losers: [],
            text: [`第${knockoutOrderNumbers[props.zoneId][6]}场 胜者`, `第${knockoutOrderNumbers[props.zoneId][5]}场 胜者`]
          },
        ]
      }
    },
    {
      id: '#12',
      text: '8进4淘汰赛 第4场',
      x: rx - nodeWidth * 2 - 300,
      y: ry + knockoutYOffset * 6,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][12]],
            winners: [knockoutOrderNumbers[props.zoneId][7], knockoutOrderNumbers[props.zoneId][8]],
            losers: [],
            text: [`第${knockoutOrderNumbers[props.zoneId][7]}场 胜者`, `第${knockoutOrderNumbers[props.zoneId][8]}场 胜者`]
          },
        ]
      }
    },
    {
      id: '#13',
      text: '半决赛 第1场',
      x: rx - nodeWidth - 150,
      y: ry - knockoutYOffset * 4,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][13]],
            winners: [knockoutOrderNumbers[props.zoneId][9], knockoutOrderNumbers[props.zoneId][11]],
            losers: [],
            text: [`第${knockoutOrderNumbers[props.zoneId][9]}场 胜者`, `第${knockoutOrderNumbers[props.zoneId][11]}场 胜者`]
          },
        ]
      }
    },
    {
      id: '#14',
      text: '半决赛 第2场',
      x: rx - nodeWidth - 150,
      y: ry + knockoutYOffset * 4,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][14]],
            winners: [knockoutOrderNumbers[props.zoneId][10], knockoutOrderNumbers[props.zoneId][12]],
            losers: [],
            text: [`第${knockoutOrderNumbers[props.zoneId][10]}场 胜者`, `第${knockoutOrderNumbers[props.zoneId][12]}场 胜者`]
          },
        ]
      }
    },
    {
      id: '#15',
      text: '季军争夺战',
      x: rx,
      y: ry + knockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][15]],
            winners: [],
            losers: [knockoutOrderNumbers[props.zoneId][13], knockoutOrderNumbers[props.zoneId][14]],
            text: [`第${knockoutOrderNumbers[props.zoneId][13]}场 败者`, `第${knockoutOrderNumbers[props.zoneId][14]}场 败者`]
          },
        ]
      }
    },
    {
      id: '#16',
      text: '冠军争夺战',
      x: rx,
      y: ry - knockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [knockoutOrderNumbers[props.zoneId][16]],
            winners: [knockoutOrderNumbers[props.zoneId][13], knockoutOrderNumbers[props.zoneId][14]],
            losers: [],
            text: [`第${knockoutOrderNumbers[props.zoneId][13]}场 胜者`, `第${knockoutOrderNumbers[props.zoneId][14]}场 胜者`]
          },
        ]
      }
    },
  ],
  lines: [
    {from: '#1', to: '#9',},
    {from: '#2', to: '#9',},
    {from: '#3', to: '#10',},
    {from: '#4', to: '#10',},
    {from: '#5', to: '#11',},
    {from: '#6', to: '#11',},
    {from: '#7', to: '#12',},
    {from: '#8', to: '#12',},
    {from: '#9', to: '#13',},
    {from: '#10', to: '#14',},
    {from: '#11', to: '#13',},
    {from: '#12', to: '#14',},
    {from: '#13', to: '#15',},
    {from: '#14', to: '#15',},
    {from: '#13', to: '#16',},
    {from: '#14', to: '#16',},
  ],
}
</script>

<template>
  <div class="my-graph pa-4">
    <div class="mb-4" style="height: calc(100vh - 240px);">
      <div class="text-center mb-4">
        <h1 class="font-weight-bold">{{ title }}</h1>
      </div>
      <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
      <relation-graph
        v-show="!loading"
        class="draggable"
        ref="graphRef"
        :options="options"
      >
        <template #node="{node}">
          <div :class="{
              'golden-shine': node.id == '#16',
              'highlight-gray': colorfulNode(node),
            }"
               :style="{ color: node.data.titleColor }"
               @mousedown="e => onDragStart(e.pageX, e.pageY)"
               @mousemove="e => onDragging(e.pageX, e.pageY)"
               @mouseup="onDragEnd"
               @touchstart="onTouchStart"
               @touchmove="onTouchMove"
               @touchend="onDragEnd"
          >
            <div v-if="node.data.title != ''"
                 class="text-h6"
                 :style="'color: ' + node.data.titleColor">
              <div class="title-image-container">
                <img :style="'border-right: 2px solid ' + node.data.borderColor"
                     :src="node.data.titleImage" alt="Image"/>
                <div class="title-text-overlay mt-1">
                  <b>{{ node.data.title }}</b>
                </div>
              </div>
              <span class="ml-1" v-if="isForecast(node)">*</span>
            </div>

            <div class="pt-1 pb-3"
                 :style="{
                   'border-left': '2px solid ' + node.data.borderColor,
                   'border-right': '2px solid ' + node.data.borderColor,
                   'border-bottom': '2px solid ' + node.data.borderColor,
                 }">
              <div v-if="node.data.type == 'match'">

                <!--实时预测 动态刷新-->
                <div v-if="round + 1 == node.data.round">
                  <div v-for="(v, i) in rankList(node.data.zones[groupIndex])" :key="i">
                    <div class="container">
                      <div class="right-column">
                        <div
                          v-if="v"
                          class="top-row row-content mb-3"
                          :class="{
                          'selected-content': playerSelected(v.player),
                        }"
                          @click="selectPlayer(v.player)"
                        >
                          <div v-if="v.match.status == 'DONE'" style="background: #43A047">
                            <h4 class="px-1" style="width: 2.5rem">{{ convertToOrdinal(matchRank(v.player)) }}</h4>
                          </div>
                          <div v-else style="background: #616161">
                            <h4 class="px-1" style="width: 2.5rem"> 待定 </h4>
                          </div>
                          <v-avatar class="mx-1 avatar-center" color="white" size="x-small">
                            <v-img :src="v.player.team.collegeLogo"/>
                          </v-avatar>
                          <span class="one-line-text">{{ v.player.team.collegeName }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-for="(v, i) in node.data.zones[groupIndex].text.slice(rankList(node.data.zones[groupIndex]).length)"
                    :key="i">
                    <div class="container">
                      <div class="right-column">
                        <div class="top-row row-content mb-3">
                          <div style="background: #616161">
                            <h4 class="px-1" style="width: 2.5rem">待定</h4>
                          </div>
                          <v-avatar class="mx-1 avatar-center" color="white" size="x-small">
                            <v-img src="@/assets/school_grey.png"/>
                          </v-avatar>
                          <span class="one-line-text">{{ v }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else v-for="(v, i) in node.data.zones[groupIndex].matches" :key="i">

                  <!--已确认的赛程-->
                  <div v-if="round + 1 > node.data.round && match(v)" class="container">
                    <div
                      class="ml-2"
                      :class="{
                      'container': true,
                      'mt-2': type == 'group',
                    }"
                    >
                      <div class="left-column order-image-container">
                        <img src="@/assets/order_bg.png" alt="Image"/>
                        <div class="order-text-overlay">
                          <b>{{ padNumber(match(v).orderNumber) }}</b>
                        </div>
                      </div>

                      <div class="right-column">
                        <div
                          class="top-row row-content mb-1"
                          :class="{
                          'selected-content': playerSelected(match(v).redSide.player),
                        }"
                          @click="selectPlayer(match(v).redSide.player)"
                        >
                          <div class="school-image-container">
                            <img src="@/assets/school_bg.png" alt="Image"/>
                            <div class="overlay ml-4">
                              <div class="colorful-red">
                                <h4 class="px-1">{{ match(v).redSideWinGameCount }}</h4>
                              </div>
                              <div
                                v-if="promotionStore.getMpMatch(match(v).id) && promotionStore.getMpMatch(match(v).id).redRate >= 0"
                                class="ml-1 text-caption"
                                :style="{
                               width: '2.5rem',
                               background: `linear-gradient(to right, #EF6C00 ${promotionStore.getMpMatch(match(v).id).redRate * 100}%, transparent ${promotionStore.getMpMatch(match(v).id).redRate * 100 + 20}%)`,
                               border: '2px solid #EF6C00',
                             }">
                                {{ (100 * promotionStore.getMpMatch(match(v).id).redRate).toFixed(1) }}%
                              </div>
                              <v-avatar v-if="match(v).redSide.player?.team" class="mx-1" color="white" size="x-small">
                                <v-img :src="match(v).redSide.player?.team.collegeLogo"></v-img>
                              </v-avatar>
                              <v-avatar v-else class="mx-1" size="x-small">
                                <v-img src="@/assets/school_red.png"></v-img>
                              </v-avatar>
                              <span v-if="match(v).redSide.player?.team"
                                    class="one-line-text">{{ match(v).redSide.player?.team.collegeName }}</span>
                              <span v-else class="one-line-text">{{ node.data.zones[groupIndex].text[2 * i] }}</span>
                            </div>
                          </div>
                        </div>

                        <div
                          class="row-content"
                          :class="{
                          'selected-content': playerSelected(match(v).blueSide.player),
                        }"
                          @click="selectPlayer(match(v).blueSide.player)"
                        >
                          <div class="school-image-container">
                            <img src="@/assets/school_bg.png" alt="Image"/>
                            <div class="overlay ml-4">
                              <div class="colorful-blue">
                                <h4 class="px-1">{{ match(v).blueSideWinGameCount }}</h4>
                              </div>
                              <div
                                v-if="promotionStore.getMpMatch(match(v).id) && promotionStore.getMpMatch(match(v).id).blueRate >= 0"
                                class="ml-1 text-caption"
                                :style="{
                               width: '2.5rem',
                               background: `linear-gradient(to right, #00695C ${promotionStore.getMpMatch(match(v).id).blueRate * 100}%, transparent ${promotionStore.getMpMatch(match(v).id).blueRate * 100 + 20}%)`,
                               border: '2px solid #00695C'
                             }">
                                {{ (100 * promotionStore.getMpMatch(match(v).id).blueRate).toFixed(1) }}%
                              </div>
                              <v-avatar v-if="match(v).blueSide.player?.team" class="mx-1" color="white" size="x-small">
                                <v-img :src="match(v).blueSide.player?.team.collegeLogo"></v-img>
                              </v-avatar>
                              <v-avatar v-else class="mx-1" size="x-small">
                                <v-img src="@/assets/school_blue.png"></v-img>
                              </v-avatar>
                              <span v-if="match(v).blueSide.player?.team"
                                    class="one-line-text">{{ match(v).blueSide.player?.team.collegeName }}</span>
                              <span v-else class="one-line-text">{{
                                  node.data.zones[groupIndex].text[2 * i + 1]
                                }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!--纯文字+红蓝R标 A-1-->
                  <div v-else class="container">
                    <div
                      v-if="match(v)"
                      :class="{
                      'container': true,
                      'mt-2': type == 'group',
                    }">
                      <div class="left-column ma-1">
                        <h2 class="px-1">{{ padNumber(match(v).orderNumber) }}</h2>
                      </div>

                      <div class="right-column">
                        <div class="top-row row-content mb-1">
                          <div style="background: #616161">
                            <h4 class="px-1"> 0 </h4>
                          </div>
                          <v-avatar class="mx-1" size="x-small">
                            <v-img src="@/assets/school_red.png"></v-img>
                          </v-avatar>
                          <span class="one-line-text">{{ node.data.zones[groupIndex].text[2 * i] }}</span>
                        </div>

                        <div class="row-content">
                          <div style="background: #616161">
                            <h4 class="px-1"> 0 </h4>
                          </div>
                          <v-avatar class="mx-1" size="x-small">
                            <v-img src="@/assets/school_blue.png"></v-img>
                          </v-avatar>
                          <span class="one-line-text">{{ node.data.zones[groupIndex].text[2 * i + 1] }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!--晋级和淘汰-->
              <div v-else-if="node.data.type == 'eliminate' || node.data.type == 'promote'">
                <div class="mx-2"
                     v-for="(v, i) in rankList(node.data.zones[groupIndex])" :key="i">
                  <div class="container ml-2">
                    <div class="right-column">
                      <div
                        v-if="v"
                        class="top-row row-content mt-2"
                        :class="{
                        'selected-content': playerSelected(v.player),
                      }"
                        @click="selectPlayer(v.player)"
                      >
                        <div class="school-image-container">
                          <img src="@/assets/school_bg.png" alt="Image"/>
                          <div class="overlay ml-4">
                            <div v-if="v.match.status == 'DONE'" style="background: #43A047">
                              <h4 class="px-1" style="width: 2.5rem; color: white">
                                {{ convertToOrdinal(matchRank(v.player)) }}
                              </h4>
                            </div>
                            <div v-else style="background: #616161">
                              <h4 class="px-1" style="width: 2.5rem; color: white"> 待定 </h4>
                            </div>
                            <v-avatar class="mx-1 avatar-center" color="white" size="x-small">
                              <v-img :src="v.player.team.collegeLogo"/>
                            </v-avatar>
                            <span class="one-line-text">{{ v.player.team.collegeName }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mx-2"
                     v-for="(v, i) in node.data.zones[groupIndex].text.slice(rankList(node.data.zones[groupIndex]).length)"
                     :key="i">
                  <div class="container ml-2">
                    <div class="right-column">
                      <div class="top-row row-content mb-3">
                        <div style="background: #616161">
                          <h4 class="px-1" style="width: 2.5rem">待定</h4>
                        </div>
                        <v-avatar class="mx-1 avatar-center" color="white" size="x-small">
                          <v-img src="@/assets/school_grey.png"/>
                        </v-avatar>
                        <span class="one-line-text">{{ v }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #canvas-plug>
          <div
            v-if="type == 'knockout'"
            :style="{
              left: `${rx - nodeWidth * 3 - 450 + 8}px`,
              top: `${ry - knockoutYOffset * 7 - 60}px`,
              position:'absolute',
              width: `${nodeWidth}px`
            }">
            <div class="text-center"
                 style="padding:10px; background: #2196F388">
              <h2>16进8淘汰赛</h2>
            </div>
          </div>

          <div
            v-if="type == 'knockout'"
            :style="{
              left: `${rx - nodeWidth * 2 - 300 + 8}px`,
              top: `${ry - knockoutYOffset * 6 - 60}px`,
              position:'absolute',
              width: `${nodeWidth}px`
            }">
            <div class="text-center"
                 style="padding:10px; background: #2196F388">
              <h2>8进4淘汰赛</h2>
            </div>
          </div>

          <div
            v-if="type == 'knockout'"
            :style="{
              left: `${rx - nodeWidth - 150 + 8}px`,
              top: `${ry - knockoutYOffset * 4 - 60}px`,
              position:'absolute',
              width: `${nodeWidth}px`
            }">
            <div class="text-center"
                 style="padding:10px; background: #2196F388">
              <h2>半决赛</h2>
            </div>
          </div>

          <div
            v-if="type == 'knockout'"
            :style="{
              left: `${rx + 8}px`,
              top: `${ry - knockoutYOffset * 2 - 60}px`,
              position:'absolute',
              width: `${nodeWidth}px`
            }">
            <div class="text-center"
                 style="padding:10px; background: #2196F388">
              <h2>冠军争夺战</h2>
            </div>
          </div>

          <div
            v-if="type == 'knockout'"
            :style="{
              left: `${rx + 8}px`,
              top: `${ry + knockoutYOffset * 2 - 60}px`,
              position:'absolute',
              width: `${nodeWidth}px`
            }">
            <div class="text-center"
                 style="padding:10px; background: #2196F388">
              <h2>季军争夺战</h2>
            </div>
          </div>

          <div
            v-if="type == 'knockout'"
            :style="{
              left: `${rx + 320}px`,
              top: `${ry - knockoutYOffset * 2 - 60}px`,
              position:'absolute',
              width: `80px`
            }">
            <div>
              <v-img src="@/assets/champion.png"></v-img>
            </div>
          </div>

          <div
            :style="{
              left: `${ry + 3 * nodeWidth + 220}px`,
              top: `${rx - 160}px`,
              position: 'absolute',
              'white-space': 'nowrap',
            }">
            <div>
              <b><span style="font-size: 5rem">A组小组赛</span></b>
              <b><span style="font-size: 2.5rem; color: #f48b3c"
                       class="ml-4">瑞士轮赛制</span></b>
            </div>
          </div>
        </template>
      </relation-graph>
    </div>
    <div class="text-end">
      <v-img
        class="logo"
        src="@/assets/logo.png">
      </v-img>

      <v-btn
        class="ml-2 mb-2 px-2"
        variant="text"
        density="compact"
        @click="appStore.commentDialog = true"
      >
        查看图注
      </v-btn>

      <GraphComment/>
    </div>
  </div>
</template>

<style scoped lang="scss">
::v-deep(.relation-graph) {
  .rel-map {
    background: none !important;

    .rel-node-shape-1 {
      border-radius: 2px;
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
    //box-shadow: 0 0 16px 8px #5a879c;
    box-shadow: 0 0 0 0 #5a879c;
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
  padding: 0 0;
}

.selected-content {
  background: #ECEFF166;
  color: whitesmoke;
  padding: 2px 4px;
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

.colorful-red {
  animation: color-change-red 1.5s infinite;
}

@keyframes color-change-red {
  0% {
    background: #C62828;
  }
  50% {
    background: #F44336;
  }
  100% {
    background: #C62828;
  }
}

.colorful-blue {
  animation: color-change-blue 1.5s infinite;
}

@keyframes color-change-blue {
  0% {
    background: #1565C0;
  }
  50% {
    background: #2196F3;
  }
  100% {
    background: #1565C0;
  }
}

.highlight-gray {
  border-radius: 12px;
  animation: color-change-gray 2s infinite;
}

@keyframes color-change-gray {
  0% {
    border: 4px solid #263238;
  }
  50% {
    border: 4px solid #90A4AE;
  }
  100% {
    border: 4px solid #263238;
  }
}

.draggable {
  touch-action: none; /* 禁止默认的触摸行为 */
}

.logo {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100px;
  opacity: 0.5;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
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
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.golden-shine {
  background: linear-gradient(60deg, #263238 10%, rgba(238, 232, 170, 0.8) 50%, #263238 75%);
  background-size: 2000px 100%;
  animation: shimmer 4s linear infinite;
}

.title-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title-image-container img {
  width: 100%;
  height: 100%;
}

.title-text-overlay {
  position: absolute;
  width: 100%;
  text-align: center;
  text-shadow: 3px 3px 6px #000000;
}

.order-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.order-image-container img {
  width: 20px;
}

.order-text-overlay {
  color: black;
  position: absolute;
  width: 100%;
  text-align: center;
}

.school-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.school-image-container img {
  width: 100%;
}

.overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.node-title-border {
  border-right: 2px solid #5a879c;
}
</style>
