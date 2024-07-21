import {ZoneJsonData} from "../types/zone";

const rx = 0;
const ry = 60;

const xOffset = 420;

export const RevivalZone2GroupJsonData: ZoneJsonData = {
  rootId: '#1',
  nodes: [
    {
      id: '#1',
      text: '第一轮 0-0',
      x: rx - 4 * xOffset,
      y: ry + 80,
      data: {
        title: '瑞士轮第一轮 0-0',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5A879C',
        round: 1,
        type: 'match',
        zones: [
          {
            matches: [23, 24, 25, 26],
            winners: [],
            losers: [],
            text: ['第一赛段 A组 第2名', '第一赛段 B组 第3名', '第一赛段 B组 第2名', '第一赛段 A组 第3名', '第一赛段 B组 第4名', '第一赛段 国际赛区 第1名', '第一赛段 国际赛区 第2名', '第一赛段 A组 第4名']
          }
        ]
      }
    },
    {
      id: '#2',
      text: '第二轮 1-0',
      x: rx - 3 * xOffset,
      y: ry - 20,
      data: {
        title: '瑞士轮第二轮 1-0',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5A879C',
        round: 2,
        type: 'match',
        zones: [
          {
            matches: [28, 28],
            winners: [23, 24, 25, 26],
            losers: [],
            text: ['C组 第一轮 第1名', 'C组 第一轮 第2名', 'C组 第一轮 第3名', 'C组 第一轮 第4名'],
            forecasts: [
              {red: 1, blue: 2},
              {red: 3, blue: 4},
            ]
          },
        ]
      }
    },
    {
      id: '#3',
      text: '第二轮 0-1',
      x: rx - 3 * xOffset,
      y: ry + 330,
      data: {
        title: '瑞士轮第二轮 0-1',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5A879C',
        round: 2,
        type: 'match',
        zones: [
          {
            matches: [29, 30],
            winners: [],
            losers: [23, 24, 25, 26],
            text: ['C组 第一轮 第6名', 'C组 第一轮 第5名', 'C组 第一轮 第8名', 'C组 第一轮 第7名'],
            forecasts: [
              {red: 6, blue: 5},
              {red: 8, blue: 7},
            ]
          },
        ]
      }
    },
    {
      id: '#4',
      text: '第三轮 2-0',
      x: rx - 2 * xOffset,
      y: ry - 100,
      data: {
        title: '瑞士轮第三轮 2-0',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5A879C',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [31],
            winners: [27, 28],
            losers: [],
            text: ['C组 第二轮 第1名', 'C组 第二轮 第2名'],
            forecasts: [
              {red: 2, blue: 1},
            ]
          }
        ]
      }
    },
    {
      id: '#5',
      text: '第三轮 1-1',
      x: rx - 2 * xOffset,
      y: ry + 160,
      data: {
        title: '瑞士轮第三轮 1-1',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5A879C',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [32, 33],
            winners: [29, 30],
            losers: [27, 28],
            text: ['C组 第二轮 第4名', 'C组 第二轮 第3名', 'C组 第二轮 第5名', 'C组 第二轮 第6名'],
            forecasts: [
              {red: 4, blue: 3},
              {red: 5, blue: 6},
            ]
          }
        ]
      }
    },
    {
      id: '#6',
      text: '淘汰 0-2',
      x: rx - 2 * xOffset,
      y: ry + 500,
      data: {
        title: '淘汰 0-2',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_loser_bg.png',
        borderColor: '#3E484D',
        round: 3,
        type: 'eliminate',
        zones: [
          {
            matches: [],
            winners: [],
            losers: [29, 30],
            text: ['C组 第7名', 'C组 第8名']
          },
        ]
      }
    },
    {
      id: '#7',
      text: '第三轮 2-1',
      x: rx - xOffset,
      y: ry + 60,
      data: {
        title: '瑞士轮第三轮 2-1',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5A879C',
        round: 4,
        type: 'match',
        zones: [
          {
            matches: [35],
            winners: [31, 34],
            losers: [],
            text: ['第31场 胜者', '第34场 胜者'],
            forecasts: [
              {red: 2, blue: 1},
            ]
          }
        ]
      }
    },
    {
      id: '#8',
      text: '第三轮 2-1',
      x: rx - xOffset,
      y: ry + 240,
      data: {
        title: '瑞士轮第三轮 2-1',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5A879C',
        round: 4,
        type: 'match',
        zones: [
          {
            matches: [34],
            winners: [32, 33],
            losers: [],
            text: ['第32场 胜者', '第33场 胜者'],
            forecasts: [
              {red: 3, blue: 4},
            ]
          }
        ]
      }
    },
    {
      id: '#9',
      text: '淘汰 1-2',
      x: rx - xOffset,
      y: ry + 420,
      data: {
        title: '淘汰 1-2',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_loser_bg.png',
        borderColor: '#3E484D',
        round: 5,
        type: 'eliminate',
        zones: [
          {
            matches: [],
            winners: [],
            losers: [32, 33],
            text: ['第32场 败者', '第33场 败者']
          },
        ]
      }
    },
    {
      id: '#10',
      text: '晋级全国赛',
      x: 0,
      y: 0,
      data: {
        title: '晋级全国赛',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_winner_bg.png',
        borderColor: '#E7A662',
        round: 5,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [31, 35],
            losers: [],
            text: ['第31场 胜者', '第35场 胜者']
          },
        ]
      }
    },
    {
      id: '#11',
      text: '淘汰',
      x: 0,
      y: ry + 180,
      data: {
        title: '淘汰',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_loser_bg.png',
        borderColor: '#3E484D',
        round: 5,
        type: 'eliminate',
        zones: [
          {
            matches: [],
            winners: [],
            losers: [34, 35],
            text: ['第34场 败者', '第35场 败者']
          },
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
    {from: '#4', to: '#10',},
    {from: '#5', to: '#8',},
    {from: '#5', to: '#9',},
    {from: '#7', to: '#10',},
    {from: '#7', to: '#11',},
    {from: '#8', to: '#11',},
  ],
}

export const RevivalZone2RoundOrder = {
  'C': [23, 28, 31, 34],
}
