import {ZoneJsonData} from "../types/zone";

const rx = 0;
const ry = 0;

const xOffset = 420;

export const RevivalZoneGroupJsonData: ZoneJsonData = {
  rootId: '#1',
  nodes: [
    {
      id: '#1',
      text: '第一轮 0-0',
      x: rx - 3 * xOffset,
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
            matches: [1, 2, 3, 4],
            winners: [],
            losers: [],
            text: ['A1', 'A5', 'A2', 'A6', 'A7', 'A3', 'A8', 'A4']
          },
          {
            matches: [5, 6, 7, 8],
            winners: [],
            losers: [],
            text: ['B1', 'B5', 'B2', 'B6', 'B7', 'B3', 'B8', 'B4']
          }
        ]
      }
    },
    {
      id: '#2',
      text: '第二轮 1-0',
      x: rx - 2 * xOffset,
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
            matches: [9, 10],
            winners: [1, 2, 3, 4],
            losers: [],
            text: ['A组 第一轮 第1名', 'A组 第一轮 第2名', 'A组 第一轮 第3名', 'A组 第一轮 第4名'],
            forecasts: [
              {red: 1, blue: 2},
              {red: 3, blue: 4},
            ]
          },
          {
            matches: [13, 14],
            winners: [5, 6, 7, 8],
            losers: [],
            text: ['B组 第一轮 第2名', 'B组 第一轮 第1名', 'B组 第一轮 第4名', 'B组 第一轮 第3名'],
            forecasts: [
              {red: 2, blue: 1},
              {red: 4, blue: 3},
            ]
          }
        ]
      }
    },
    {
      id: '#3',
      text: '第二轮 0-1',
      x: rx - 2 * xOffset,
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
            matches: [11, 12],
            winners: [],
            losers: [1, 2, 3, 4],
            text: ['A组 第一轮 第6名', 'A组 第一轮 第5名', 'A组 第一轮 第8名', 'A组 第一轮 第7名'],
            forecasts: [
              {red: 6, blue: 5},
              {red: 8, blue: 7},
            ]
          },
          {
            matches: [15, 16],
            winners: [],
            losers: [5, 6, 7, 8],
            text: ['B组 第一轮 第5名', 'B组 第一轮 第6名', 'B组 第一轮 第7名', 'B组 第一轮 第8名'],
            forecasts: [
              {red: 5, blue: 6},
              {red: 7, blue: 8},
            ]
          }
        ]
      }
    },
    {
      id: '#4',
      text: '第三轮 2-0',
      x: rx - xOffset,
      y: ry - 80,
      data: {
        title: '瑞士轮第三轮 2-0',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_bg.png',
        borderColor: '#5A879C',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [17],
            winners: [9, 10],
            losers: [],
            text: ['A组 第二轮 第1名', 'A组 第二轮 第2名'],
            forecasts: [
              {red: 1, blue: 2},
            ]
          },
          {
            matches: [20],
            winners: [13, 14],
            losers: [],
            text: ['B组 第二轮 第2名', 'B组 第二轮 第1名'],
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
      x: rx - xOffset,
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
            matches: [18, 19],
            winners: [11, 12],
            losers: [9, 10],
            text: ['A组 第二轮 第3名', 'A组 第二轮 第4名', 'A组 第二轮 第6名', 'A组 第二轮 第5名'],
            forecasts: [
              {red: 3, blue: 4},
              {red: 6, blue: 5},
            ]
          },
          {
            matches: [21, 22],
            winners: [15, 16],
            losers: [13, 14],
            text: ['B组 第二轮 第4名', 'B组 第二轮 第3名', 'B组 第二轮 第5名', 'B组 第二轮 第6名'],
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
      x: rx - xOffset,
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
            losers: [11, 12],
            text: ['A组 第7名', 'A组 第8名']
          },
          {
            matches: [],
            winners: [],
            losers: [15, 16],
            text: ['B组 第7名', 'B组 第8名']
          }
        ]
      }
    },
    {
      id: '#7',
      text: '晋级 3-0',
      x: 0,
      y: 0,
      data: {
        title: '晋级第二赛段',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_winner_bg.png',
        borderColor: '#E7A662',
        round: 4,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [17],
            losers: [],
            text: ['A组 第1名']
          },
          {
            matches: [],
            winners: [20],
            losers: [],
            text: ['B组 第1名']
          }
        ]
      }
    },
    {
      id: '#8',
      text: '第三轮 2-1',
      x: rx,
      y: ry + 200,
      data: {
        title: '晋级第二赛段',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_winner_bg.png',
        borderColor: '#E7A662',
        round: 4,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [18, 19],
            losers: [17],
            text: ['A组 第2名', 'A组 第3名', 'A组 第4名']
          },
          {
            matches: [],
            winners: [21, 22],
            losers: [20],
            text: ['B组 第2名', 'B组 第3名', 'B组 第4名']
          }
        ]
      }
    },
    {
      id: '#9',
      text: '淘汰 1-2',
      x: rx,
      y: ry + 440,
      data: {
        title: '淘汰 1-2',
        titleColor: '#FFFFFF',
        titleImage: 'src/assets/title_loser_bg.png',
        borderColor: '#3E484D',
        round: 4,
        type: 'eliminate',
        zones: [
          {
            matches: [],
            winners: [],
            losers: [18, 19],
            text: ['A组 第5名', 'A组 第6名']
          },
          {
            matches: [],
            winners: [],
            losers: [21, 22],
            text: ['B组 第5名', 'B组 第6名']
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

export const RevivalZoneRoundOrder = {
  'A': [1, 9, 17, 23], // TODO: 23 可能有bug
  'B': [5, 13, 20, 23], // TODO: 23 可能有bug
}
