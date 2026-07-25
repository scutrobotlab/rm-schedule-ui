import { ZoneJsonData } from "../types/zone";

const rx = 0;
const ry = 0;

const groupXOffset = 435;

export const FinalZoneGroup1JsonData: ZoneJsonData = {
  rootId: '#1',
  stages: ['第一轮', '第二轮', '第三轮', '前段晋级', '第四轮'],
  nodes: [
    {
      id: '#1',
      text: '第一轮 0-0',
      x: rx - 4 * groupXOffset,
      y: ry - 200,
      data: {
        title: '瑞士轮第一轮 0-0',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 1,
        type: 'match',
        zones: [
          {
            matches: [1, 2, 3, 4, 5, 6, 7, 8],
            winners: [],
            losers: [],
            text: ['A1', 'A9', 'A2', 'A10', 'A11', 'A3', 'A12', 'A4', 'A5', 'A13', 'A6', 'A14', 'A15', 'A7', 'A16', 'A8']
          },
          {
            matches: [9, 10, 11, 12, 13, 14, 15, 16],
            winners: [],
            losers: [],
            text: ['B9', 'B1', 'B10', 'B2', 'B3', 'B11', 'B4', 'B12', 'B13', 'B5', 'B14', 'B6', 'B7', 'B15', 'B8', 'B16']
          }
        ]
      }
    },
    {
      id: '#2',
      text: '第二轮 1-0',
      x: rx - 3 * groupXOffset,
      y: ry - 260,
      data: {
        title: '瑞士轮第二轮 1-0',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 2,
        type: 'match',
        zones: [
          {
            matches: [17, 18, 19, 20],
            winners: [1, 2, 3, 4, 5, 6, 7, 8],
            losers: [],
            text: ['A组 第一轮 第1名', 'A组 第一轮 第2名', 'A组 第一轮 第3名', 'A组 第一轮 第4名',
              'A组 第一轮 第6名', 'A组 第一轮 第5名', 'A组 第一轮 第8名', 'A组 第一轮 第7名'],
            forecasts: [
              { red: 1, blue: 2 },
              { red: 3, blue: 4 },
              { red: 6, blue: 5 },
              { red: 8, blue: 7 },
            ]
          },
          {
            matches: [25, 26, 27, 28],
            winners: [9, 10, 11, 12, 13, 14, 15, 16],
            losers: [],
            text: ['B组 第一轮 第2名', 'B组 第一轮 第1名', 'B组 第一轮 第4名', 'B组 第一轮 第3名',
              'B组 第一轮 第5名', 'B组 第一轮 第6名', 'B组 第一轮 第7名', 'B组 第一轮 第8名'],
            forecasts: [
              { red: 2, blue: 1 },
              { red: 4, blue: 3 },
              { red: 5, blue: 6 },
              { red: 7, blue: 8 },
            ]
          }
        ]
      }
    },
    {
      id: '#3',
      text: '第二轮 0-1',
      x: rx - 3 * groupXOffset,
      y: ry + 240,
      data: {
        title: '瑞士轮第二轮 0-1',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 2,
        type: 'match',
        zones: [
          {
            matches: [21, 22, 23, 24],
            winners: [],
            losers: [1, 2, 3, 4, 5, 6, 7, 8],
            text: ['A组 第一轮 第9名', 'A组 第一轮 第10名', 'A组 第一轮 第11名', 'A组 第一轮 第12名',
              'A组 第一轮 第14名', 'A组 第一轮 第13名', 'A组 第一轮 第16名', 'A组 第一轮 第15名'],
            forecasts: [
              { red: 9, blue: 10 },
              { red: 11, blue: 12 },
              { red: 14, blue: 13 },
              { red: 16, blue: 15 },
            ]
          },
          {
            matches: [29, 30, 31, 32],
            winners: [],
            losers: [9, 10, 11, 12, 13, 14, 15, 16],
            text: ['B组 第一轮 第10名', 'B组 第一轮 第9名', 'B组 第一轮 第12名', 'B组 第一轮 第11名',
              'B组 第一轮 第13名', 'B组 第一轮 第14名', 'B组 第一轮 第15名', 'B组 第一轮 第16名'],
            forecasts: [
              { red: 10, blue: 9 },
              { red: 12, blue: 11 },
              { red: 13, blue: 14 },
              { red: 15, blue: 16 },
            ]
          }
        ]
      }
    },
    {
      id: '#4',
      text: '第三轮 2-0',
      x: rx - 2 * groupXOffset,
      y: ry - 300,
      data: {
        title: '瑞士轮第三轮 2-0',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [33, 34],
            winners: [17, 18, 19, 20],
            losers: [],
            text: ['A组 第二轮 第1名', 'A组 第二轮 第2名', 'A组 第二轮 第3名', 'A组 第二轮 第4名'],
            forecasts: [
              { red: 1, blue: 2 },
              { red: 3, blue: 4 },
            ]
          },
          {
            matches: [41, 42],
            winners: [25, 26, 27, 28],
            losers: [],
            text: ['B组 第二轮 第2名', 'B组 第二轮 第1名', 'B组 第二轮 第4名', 'B组 第二轮 第3名'],
            forecasts: [
              { red: 2, blue: 1 },
              { red: 4, blue: 3 },
            ]
          }
        ]
      }
    },
    {
      id: '#5',
      text: '第三轮 1-1',
      x: rx - 2 * groupXOffset,
      y: ry - 20,
      data: {
        title: '瑞士轮第三轮 1-1',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [35, 36, 37, 38],
            winners: [21, 22, 23, 24],
            losers: [17, 18, 19, 20],
            text: ['A组 第二轮 第6名', 'A组 第二轮 第5名', 'A组 第二轮 第8名', 'A组 第二轮 第7名',
              'A组 第二轮 第9名', 'A组 第二轮 第10名', 'A组 第二轮 第11名', 'A组 第二轮 第12名'],
            forecasts: [
              { red: 6, blue: 5 },
              { red: 8, blue: 7 },
              { red: 9, blue: 10 },
              { red: 11, blue: 12 },
            ]
          },
          {
            matches: [43, 44, 45, 46],
            winners: [29, 30, 31, 32],
            losers: [25, 26, 27, 28],
            text: ['B组 第二轮 第5名', 'B组 第二轮 第6名', 'B组 第二轮 第7名', 'B组 第二轮 第8名',
              'B组 第二轮 第10名', 'B组 第二轮 第9名', 'B组 第二轮 第12名', 'B组 第二轮 第11名'],
            forecasts: [
              { red: 5, blue: 6 },
              { red: 7, blue: 8 },
              { red: 10, blue: 9 },
              { red: 12, blue: 11 },
            ]
          }
        ]
      }
    },
    {
      id: '#6',
      text: '第三轮 0-2',
      x: rx - 2 * groupXOffset,
      y: ry + 460,
      data: {
        title: '瑞士轮第三轮 0-2',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [39, 40],
            winners: [],
            losers: [21, 22, 23, 24],
            text: ['A组 第二轮 第14名', 'A组 第二轮 第13名', 'A组 第二轮 第16名', 'A组 第二轮 第15名'],
            forecasts: [
              { red: 14, blue: 13 },
              { red: 16, blue: 15 },
            ]
          },
          {
            matches: [47, 48],
            winners: [],
            losers: [29, 30, 31, 32],
            text: ['B组 第二轮 第13名', 'B组 第二轮 第14名', 'B组 第二轮 第15名', 'B组 第二轮 第16名'],
            forecasts: [
              { red: 13, blue: 14 },
              { red: 15, blue: 16 },
            ]
          }
        ]
      }
    },
    {
      id: '#7',
      text: '晋级 3-0',
      x: rx - groupXOffset + 15,
      y: ry - 252,
      data: {
        title: '晋级淘汰赛 3-0',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_winner_bg.png',
        borderColor: '#E7A662',
        collegeNameColor: '#FFB553',
        rankColor: '#FFA500',
        round: 4,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [33, 34],
            losers: [],
            text: ['第33场胜者', '第34场胜者'],
          },
          {
            matches: [],
            winners: [41, 42],
            losers: [],
            text: ['第41场胜者', '第42场胜者'],
          }
        ]
      }
    },
    {
      id: '#8',
      text: '淘汰 0-3',
      x: rx - groupXOffset + 15,
      y: ry + 508,
      data: {
        title: '淘汰 0-3',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_loser_bg.png',
        borderColor: '#3E484D',
        collegeNameColor: '#9D9F9F',
        rankColor: '#4F4F4F',
        round: 4,
        type: 'eliminate',
        zones: [
          {
            matches: [],
            winners: [],
            losers: [39, 40],
            text: ['第39场败者', '第40场败者'],
          },
          {
            matches: [],
            winners: [],
            losers: [47, 48],
            text: ['第47场败者', '第48场败者'],
          }
        ]
      }
    },
    {
      id: '#9',
      text: '第四轮 2-1',
      x: 0,
      y: ry - 180,
      data: {
        title: '瑞士轮第四轮 2-1',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 4,
        type: 'match',
        zones: [
          {
            matches: [49, 50, 51],
            winners: [35, 36, 37, 38],
            losers: [33, 34],
            // 3-4 6-5 8-7
            text: ['A组 第三轮 第3名', 'A组 第三轮 第4名', 'A组 第三轮 第6名', 'A组 第三轮 第5名', 'A组 第三轮 第8名', 'A组 第三轮 第7名'],
            forecasts: [
              { red: 3, blue: 4 },
              { red: 6, blue: 5 },
              { red: 8, blue: 7 },
            ]
          },
          {
            matches: [55, 56, 57],
            winners: [43, 44, 45, 46],
            losers: [41, 42],
            // 4-3 5-6 7-8
            text: ['B组 第三轮 第4名', 'B组 第三轮 第3名', 'B组 第三轮 第5名', 'B组 第三轮 第6名', 'B组 第三轮 第7名', 'B组 第三轮 第8名'],
            forecasts: [
              { red: 4, blue: 3 },
              { red: 5, blue: 6 },
              { red: 7, blue: 8 },
            ]
          }
        ]
      }
    },
    {
      id: '#10',
      text: '第四轮 1-2',
      x: 0,
      y: ry + 220,
      data: {
        title: '瑞士轮第四轮 1-2',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 4,
        type: 'match',
        zones: [
          {
            matches: [52, 53, 54],
            winners: [39, 40],
            losers: [35, 36, 37, 38],
            // 9-10 11-12 14-13
            text: ['A组 第三轮 第9名', 'A组 第三轮 第10名', 'A组 第三轮 第11名', 'A组 第三轮 第12名', 'A组 第三轮 第14名', 'A组 第三轮 第13名'],
            forecasts: [
              { red: 9, blue: 10 },
              { red: 11, blue: 12 },
              { red: 14, blue: 13 },
            ]
          },
          {
            matches: [58, 59, 60],
            winners: [47, 48],
            losers: [43, 44, 45, 46],
            // 10-9 12-11 13-14
            text: ['B组 第三轮 第10名', 'B组 第三轮 第9名', 'B组 第三轮 第12名', 'B组 第三轮 第11名', 'B组 第三轮 第13名', 'B组 第三轮 第14名'],
            forecasts: [
              { red: 10, blue: 9 },
              { red: 12, blue: 11 },
              { red: 13, blue: 14 },
            ]
          }
        ]
      }
    },
  ],
  lines: [
    { from: '#1', to: '#2', },
    { from: '#1', to: '#3', },
    { from: '#2', to: '#4', },
    { from: '#2', to: '#5', },
    { from: '#3', to: '#5', },
    { from: '#3', to: '#6', },
    { from: '#4', to: '#7', lineShape: 5 },
    { from: '#6', to: '#8', lineShape: 5 },
    { from: '#4', to: '#9', },
    { from: '#5', to: '#9', },
    { from: '#5', to: '#10', },
    { from: '#6', to: '#10', },
  ],
}

export const FinalZoneGroup1RoundOrder = {
  'A': [1, 17, 33, 49],
  'B': [9, 25, 41, 55],
}

export const FinalZoneGroup2JsonData: ZoneJsonData = {
  rootId: '#1',
  stages: ['第四轮', '第五轮', '后段晋级'],
  nodes: [
    {
      id: '#1',
      text: '晋级 3-0',
      x: rx - 2 * groupXOffset,
      y: ry - 320,
      data: {
        title: '晋级淘汰赛 3-0',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_winner_bg.png',
        borderColor: '#E7A662',
        collegeNameColor: '#FFB553',
        rankColor: '#FFA500',
        round: 1,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [33, 34],
            losers: [],
            text: ['第33场胜者', '第34场胜者'],
          },
          {
            matches: [],
            winners: [41, 42],
            losers: [],
            text: ['第41场胜者', '第42场胜者'],
          }
        ]
      }
    },
    {
      id: '#2',
      text: '第四轮 2-1',
      x: rx - 2 * groupXOffset,
      y: ry - 130,
      data: {
        title: '瑞士轮第四轮 2-1',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 1,
        type: 'match',
        zones: [
          {
            matches: [49, 50, 51],
            winners: [35, 36, 37, 38],
            losers: [33, 34],
            text: ['A组 第三轮 第3名', 'A组 第三轮 第4名', 'A组 第三轮 第6名', 'A组 第三轮 第5名', 'A组 第三轮 第8名', 'A组 第三轮 第7名'],
            forecasts: [
              { red: 3, blue: 4 },
              { red: 6, blue: 5 },
              { red: 8, blue: 7 },
            ]
          },
          {
            matches: [55, 56, 57],
            winners: [43, 44, 45, 46],
            losers: [41, 42],
            text: ['B组 第三轮 第4名', 'B组 第三轮 第3名', 'B组 第三轮 第5名', 'B组 第三轮 第6名', 'B组 第三轮 第7名', 'B组 第三轮 第8名'],
            forecasts: [
              { red: 4, blue: 3 },
              { red: 5, blue: 6 },
              { red: 7, blue: 8 },
            ]
          }
        ]
      }
    },
    {
      id: '#3',
      text: '第四轮 1-2',
      x: rx - 2 * groupXOffset,
      y: ry + 260,
      data: {
        title: '瑞士轮第四轮 1-2',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 1,
        type: 'match',
        zones: [
          {
            matches: [52, 53, 54],
            winners: [39, 40],
            losers: [35, 36, 37, 38],
            text: ['A组 第三轮 第9名', 'A组 第三轮 第10名', 'A组 第三轮 第11名', 'A组 第三轮 第12名', 'A组 第三轮 第14名', 'A组 第三轮 第13名'],
            forecasts: [
              { red: 9, blue: 10 },
              { red: 11, blue: 12 },
              { red: 14, blue: 13 },
            ]
          },
          {
            matches: [58, 59, 60],
            winners: [47, 48],
            losers: [43, 44, 45, 46],
            text: ['B组 第三轮 第10名', 'B组 第三轮 第9名', 'B组 第三轮 第12名', 'B组 第三轮 第11名', 'B组 第三轮 第13名', 'B组 第三轮 第14名'],
            forecasts: [
              { red: 10, blue: 9 },
              { red: 12, blue: 11 },
              { red: 13, blue: 14 },
            ]
          }
        ]
      }
    },
    {
      id: '#4',
      text: '晋级 3-1',
      x: rx - groupXOffset,
      y: ry - 270,
      data: {
        title: '晋级淘汰赛 3-1',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_winner_bg.png',
        borderColor: '#E7A662',
        collegeNameColor: '#FFB553',
        rankColor: '#FFA500',
        round: 2,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [49, 50, 51],
            losers: [],
            text: ['第49场胜者', '第50场胜者', '第51场胜者'],
          },
          {
            matches: [],
            winners: [55, 56, 57],
            losers: [],
            text: ['第55场胜者', '第56场胜者', '第57场胜者'],
          }
        ]
      }
    },
    {
      id: '#5',
      text: '第五轮 2-2',
      x: rx - groupXOffset,
      y: ry - 20,
      data: {
        title: '瑞士轮第五轮 2-2',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 2,
        type: 'match',
        zones: [
          {
            matches: [61, 62, 63],
            winners: [52, 53, 54],
            losers: [49, 50, 51],
            text: ['A组 第四轮 第6名', 'A组 第四轮 第7名', 'A组 第四轮 第8名', 'A组 第四轮 第9名', 'A组 第四轮 第11名', 'A组 第四轮 第10名'],
            forecasts: [
              { red: 6, blue: 7 },
              { red: 8, blue: 9 },
              { red: 11, blue: 10 },
            ]
          },
          {
            matches: [64, 65, 66],
            winners: [58, 59, 60],
            losers: [55, 56, 57],
            text: ['B组 第四轮 第7名', 'B组 第四轮 第6名', 'B组 第四轮 第8名', 'B组 第四轮 第9名', 'B组 第四轮 第11名', 'B组 第四轮 第10名'],
            forecasts: [
              { red: 7, blue: 6 },
              { red: 8, blue: 9 },
              { red: 11, blue: 10 },
            ]
          }
        ]
      }
    },
    {
      id: '#6',
      text: '淘汰 1-3',
      x: rx - groupXOffset,
      y: ry + 370,
      data: {
        title: '淘汰 1-3',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_loser_bg.png',
        borderColor: '#3E484D',
        collegeNameColor: '#9D9F9F',
        rankColor: '#4F4F4F',
        round: 2,
        type: 'eliminate',
        zones: [
          {
            matches: [],
            winners: [],
            losers: [52, 53, 54],
            text: ['第52场败者', '第53场败者', '第54场败者'],
          },
          {
            matches: [],
            winners: [],
            losers: [58, 59, 60],
            text: ['第58场败者', '第59场败者', '第60场败者'],
          }
        ]
      }
    },
    {
      id: '#7',
      text: '晋级 3-2',
      x: 0,
      y: ry - 160,
      data: {
        title: '晋级淘汰赛 3-2',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_winner_bg.png',
        borderColor: '#E7A662',
        collegeNameColor: '#FFB553',
        rankColor: '#FFA500',
        round: 3,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [61, 62, 63],
            losers: [],
            text: ['第61场胜者', '第62场胜者', '第63场胜者'],
          },
          {
            matches: [],
            winners: [64, 65, 66],
            losers: [],
            text: ['第64场胜者', '第65场胜者', '第66场胜者'],
          }
        ]
      }
    },
    {
      id: '#8',
      text: '淘汰 2-3',
      x: 0,
      y: ry + 240,
      data: {
        title: '淘汰 2-3',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_loser_bg.png',
        borderColor: '#3E484D',
        collegeNameColor: '#9D9F9F',
        rankColor: '#4F4F4F',
        round: 3,
        type: 'eliminate',
        zones: [
          {
            matches: [],
            winners: [],
            losers: [61, 62, 63],
            text: ['第61场败者', '第62场败者', '第63场败者'],
          },
          {
            matches: [],
            winners: [],
            losers: [64, 65, 66],
            text: ['第64场败者', '第65场败者', '第66场败者'],
          }
        ]
      }
    }
  ],
  lines: [
    { from: '#2', to: '#4', },
    { from: '#2', to: '#5', },
    { from: '#3', to: '#5', },
    { from: '#3', to: '#6', },
    { from: '#5', to: '#7', },
    { from: '#5', to: '#8', },
  ],
}

export const FinalZoneGroup2RoundOrder = {
  'A': [49, 61, 61],
  'B': [55, 64, 64],
}

export const FinalZoneGroup1JsonData2025: ZoneJsonData = {
  rootId: '#1',
  stages: ['第一轮', '第二轮', '第三轮', '前段晋级', '第四轮'],
  nodes: [
    {
      id: '#1',
      text: '第一轮 0-0',
      x: rx - 4 * groupXOffset,
      y: ry - 200,
      data: {
        title: '瑞士轮第一轮 0-0',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 1,
        type: 'match',
        zones: [
          {
            matches: [1, 2, 3, 4, 5, 6, 7, 8],
            winners: [],
            losers: [],
            text: ['A1', 'A9', 'A2', 'A10', 'A11', 'A3', 'A12', 'A4', 'A5', 'A13', 'A6', 'A14', 'A15', 'A7', 'A16', 'A8']
          },
          {
            matches: [9, 10, 11, 12, 13, 14, 15, 16],
            winners: [],
            losers: [],
            text: ['B9', 'B1', 'B10', 'B2', 'B3', 'B11', 'B4', 'B12', 'B13', 'B5', 'B14', 'B6', 'B7', 'B15', 'B8', 'B16']
          }
        ]
      }
    },
    {
      id: '#2',
      text: '第二轮 1-0',
      x: rx - 3 * groupXOffset,
      y: ry - 260,
      data: {
        title: '瑞士轮第二轮 1-0',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 2,
        type: 'match',
        zones: [
          {
            matches: [17, 18, 19, 20],
            winners: [1, 2, 3, 4, 5, 6, 7, 8],
            losers: [],
            text: ['A组 第一轮 第1名', 'A组 第一轮 第2名', 'A组 第一轮 第3名', 'A组 第一轮 第4名',
              'A组 第一轮 第6名', 'A组 第一轮 第5名', 'A组 第一轮 第8名', 'A组 第一轮 第7名'],
            forecasts: [
              { red: 1, blue: 2 },
              { red: 3, blue: 4 },
              { red: 6, blue: 5 },
              { red: 8, blue: 7 },
            ]
          },
          {
            matches: [25, 26, 27, 28],
            winners: [9, 10, 11, 12, 13, 14, 15, 16],
            losers: [],
            text: ['B组 第一轮 第2名', 'B组 第一轮 第1名', 'B组 第一轮 第4名', 'B组 第一轮 第3名',
              'B组 第一轮 第5名', 'B组 第一轮 第6名', 'B组 第一轮 第7名', 'B组 第一轮 第8名'],
            forecasts: [
              { red: 2, blue: 1 },
              { red: 4, blue: 3 },
              { red: 5, blue: 6 },
              { red: 7, blue: 8 },
            ]
          }
        ]
      }
    },
    {
      id: '#3',
      text: '第二轮 0-1',
      x: rx - 3 * groupXOffset,
      y: ry + 240,
      data: {
        title: '瑞士轮第二轮 0-1',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 2,
        type: 'match',
        zones: [
          {
            matches: [21, 22, 23, 24],
            winners: [],
            losers: [1, 2, 3, 4, 5, 6, 7, 8],
            text: ['A组 第一轮 第9名', 'A组 第一轮 第10名', 'A组 第一轮 第11名', 'A组 第一轮 第12名',
              'A组 第一轮 第14名', 'A组 第一轮 第13名', 'A组 第一轮 第16名', 'A组 第一轮 第15名'],
            forecasts: [
              { red: 9, blue: 10 },
              { red: 11, blue: 12 },
              { red: 14, blue: 13 },
              { red: 16, blue: 15 },
            ]
          },
          {
            matches: [29, 30, 31, 32],
            winners: [],
            losers: [9, 10, 11, 12, 13, 14, 15, 16],
            text: ['B组 第一轮 第10名', 'B组 第一轮 第9名', 'B组 第一轮 第12名', 'B组 第一轮 第11名',
              'B组 第一轮 第13名', 'B组 第一轮 第14名', 'B组 第一轮 第15名', 'B组 第一轮 第16名'],
            forecasts: [
              { red: 10, blue: 9 },
              { red: 12, blue: 11 },
              { red: 13, blue: 14 },
              { red: 15, blue: 16 },
            ]
          }
        ]
      }
    },
    {
      id: '#4',
      text: '第三轮 2-0',
      x: rx - 2 * groupXOffset,
      y: ry - 300,
      data: {
        title: '瑞士轮第三轮 2-0',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [33, 34],
            winners: [17, 18, 19, 20],
            losers: [],
            text: ['A组 第二轮 第1名', 'A组 第二轮 第2名', 'A组 第二轮 第3名', 'A组 第二轮 第4名'],
            forecasts: [
              { red: 1, blue: 2 },
              { red: 3, blue: 4 },
            ]
          },
          {
            matches: [41, 42],
            winners: [25, 26, 27, 28],
            losers: [],
            text: ['B组 第二轮 第2名', 'B组 第二轮 第1名', 'B组 第二轮 第4名', 'B组 第二轮 第3名'],
            forecasts: [
              { red: 2, blue: 1 },
              { red: 4, blue: 3 },
            ]
          }
        ]
      }
    },
    {
      id: '#5',
      text: '第三轮 1-1',
      x: rx - 2 * groupXOffset,
      y: ry - 20,
      data: {
        title: '瑞士轮第三轮 1-1',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [35, 36, 37, 38],
            winners: [21, 22, 23, 24],
            losers: [17, 18, 19, 20],
            text: ['A组 第二轮 第6名', 'A组 第二轮 第5名', 'A组 第二轮 第8名', 'A组 第二轮 第7名',
              'A组 第二轮 第9名', 'A组 第二轮 第10名', 'A组 第二轮 第11名', 'A组 第二轮 第12名'],
            forecasts: [
              { red: 6, blue: 5 },
              { red: 8, blue: 7 },
              { red: 9, blue: 10 },
              { red: 11, blue: 12 },
            ]
          },
          {
            matches: [43, 44, 45, 46],
            winners: [29, 30, 31, 32],
            losers: [25, 26, 27, 28],
            text: ['B组 第二轮 第5名', 'B组 第二轮 第6名', 'B组 第二轮 第7名', 'B组 第二轮 第8名',
              'B组 第二轮 第10名', 'B组 第二轮 第9名', 'B组 第二轮 第12名', 'B组 第二轮 第11名'],
            forecasts: [
              { red: 5, blue: 6 },
              { red: 7, blue: 8 },
              { red: 10, blue: 9 },
              { red: 12, blue: 11 },
            ]
          }
        ]
      }
    },
    {
      id: '#6',
      text: '第三轮 0-2',
      x: rx - 2 * groupXOffset,
      y: ry + 460,
      data: {
        title: '瑞士轮第三轮 0-2',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 3,
        type: 'match',
        zones: [
          {
            matches: [39, 40],
            winners: [],
            losers: [21, 22, 23, 24],
            text: ['A组 第二轮 第14名', 'A组 第二轮 第13名', 'A组 第二轮 第16名', 'A组 第二轮 第15名'],
            forecasts: [
              { red: 14, blue: 13 },
              { red: 16, blue: 15 },
            ]
          },
          {
            matches: [47, 48],
            winners: [],
            losers: [29, 30, 31, 32],
            text: ['B组 第二轮 第13名', 'B组 第二轮 第14名', 'B组 第二轮 第15名', 'B组 第二轮 第16名'],
            forecasts: [
              { red: 13, blue: 14 },
              { red: 15, blue: 16 },
            ]
          }
        ]
      }
    },
    {
      id: '#7',
      text: '晋级 3-0',
      x: rx - groupXOffset + 15,
      y: ry - 252,
      data: {
        title: '晋级淘汰赛 3-0',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_winner_bg.png',
        borderColor: '#E7A662',
        collegeNameColor: '#FFB553',
        rankColor: '#FFA500',
        round: 4,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [33, 34],
            losers: [],
            text: ['第33场胜者', '第34场胜者'],
          },
          {
            matches: [],
            winners: [41, 42],
            losers: [],
            text: ['第41场胜者', '第42场胜者'],
          }
        ]
      }
    },
    {
      id: '#8',
      text: '淘汰 0-3',
      x: rx - groupXOffset + 15,
      y: ry + 508,
      data: {
        title: '淘汰 0-3',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_loser_bg.png',
        borderColor: '#3E484D',
        collegeNameColor: '#9D9F9F',
        rankColor: '#4F4F4F',
        round: 4,
        type: 'eliminate',
        zones: [
          {
            matches: [],
            winners: [],
            losers: [39, 40],
            text: ['第39场败者', '第40场败者'],
          },
          {
            matches: [],
            winners: [],
            losers: [47, 48],
            text: ['第47场败者', '第48场败者'],
          }
        ]
      }
    },
    {
      id: '#9',
      text: '第四轮 2-1',
      x: 0,
      y: ry - 180,
      data: {
        title: '瑞士轮第四轮 2-1',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 4,
        type: 'match',
        zones: [
          {
            matches: [49, 50, 51],
            winners: [35, 36, 37, 38],
            losers: [33, 34],
            // 3-4 6-5 8-7
            text: ['A组 第三轮 第3名', 'A组 第三轮 第4名', 'A组 第三轮 第6名', 'A组 第三轮 第5名', 'A组 第三轮 第8名', 'A组 第三轮 第7名'],
            forecasts: [
              { red: 3, blue: 4 },
              { red: 6, blue: 5 },
              { red: 8, blue: 7 },
            ]
          },
          {
            matches: [55, 56, 57],
            winners: [43, 44, 45, 46],
            losers: [41, 42],
            // 4-3 5-6 7-8
            text: ['B组 第三轮 第4名', 'B组 第三轮 第3名', 'B组 第三轮 第5名', 'B组 第三轮 第6名', 'B组 第三轮 第7名', 'B组 第三轮 第8名'],
            forecasts: [
              { red: 4, blue: 3 },
              { red: 5, blue: 6 },
              { red: 7, blue: 8 },
            ]
          }
        ]
      }
    },
    {
      id: '#10',
      text: '第四轮 1-2',
      x: 0,
      y: ry + 220,
      data: {
        title: '瑞士轮第四轮 1-2',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 4,
        type: 'match',
        zones: [
          {
            matches: [52, 53, 54],
            winners: [39, 40],
            losers: [35, 36, 37, 38],
            // 9-10 11-12 14-13
            text: ['A组 第三轮 第9名', 'A组 第三轮 第10名', 'A组 第三轮 第11名', 'A组 第三轮 第12名', 'A组 第三轮 第14名', 'A组 第三轮 第13名'],
            forecasts: [
              { red: 9, blue: 10 },
              { red: 11, blue: 12 },
              { red: 14, blue: 13 },
            ]
          },
          {
            matches: [58, 59, 60],
            winners: [47, 48],
            losers: [43, 44, 45, 46],
            // 10-9 12-11 13-14
            text: ['B组 第三轮 第10名', 'B组 第三轮 第9名', 'B组 第三轮 第12名', 'B组 第三轮 第11名', 'B组 第三轮 第13名', 'B组 第三轮 第14名'],
            forecasts: [
              { red: 10, blue: 9 },
              { red: 12, blue: 11 },
              { red: 13, blue: 14 },
            ]
          }
        ]
      }
    },
  ],
  lines: [
    { from: '#1', to: '#2', },
    { from: '#1', to: '#3', },
    { from: '#2', to: '#4', },
    { from: '#2', to: '#5', },
    { from: '#3', to: '#5', },
    { from: '#3', to: '#6', },
    { from: '#4', to: '#7', lineShape: 5 },
    { from: '#6', to: '#8', lineShape: 5 },
    { from: '#4', to: '#9', },
    { from: '#5', to: '#9', },
    { from: '#5', to: '#10', },
    { from: '#6', to: '#10', },
  ],
}

export const FinalZoneGroup1RoundOrder2025 = {
  'A': [1, 17, 33, 49],
  'B': [9, 25, 41, 55],
}

export const FinalZoneGroup2JsonData2025: ZoneJsonData = {
  rootId: '#1',
  stages: ['第四轮', '第五轮', '后段晋级'],
  nodes: [
    {
      id: '#1',
      text: '晋级 3-0',
      x: rx - 2 * groupXOffset,
      y: ry - 320,
      data: {
        title: '晋级淘汰赛 3-0',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_winner_bg.png',
        borderColor: '#E7A662',
        collegeNameColor: '#FFB553',
        rankColor: '#FFA500',
        round: 1,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [33, 34],
            losers: [],
            text: ['第33场胜者', '第34场胜者'],
          },
          {
            matches: [],
            winners: [41, 42],
            losers: [],
            text: ['第41场胜者', '第42场胜者'],
          }
        ]
      }
    },
    {
      id: '#2',
      text: '第四轮 2-1',
      x: rx - 2 * groupXOffset,
      y: ry - 130,
      data: {
        title: '瑞士轮第四轮 2-1',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 1,
        type: 'match',
        zones: [
          {
            matches: [49, 50, 51],
            winners: [35, 36, 37, 38],
            losers: [33, 34],
            text: ['A组 第三轮 第3名', 'A组 第三轮 第4名', 'A组 第三轮 第6名', 'A组 第三轮 第5名', 'A组 第三轮 第8名', 'A组 第三轮 第7名'],
            forecasts: [
              { red: 3, blue: 4 },
              { red: 6, blue: 5 },
              { red: 8, blue: 7 },
            ]
          },
          {
            matches: [55, 56, 57],
            winners: [43, 44, 45, 46],
            losers: [41, 42],
            text: ['B组 第三轮 第4名', 'B组 第三轮 第3名', 'B组 第三轮 第5名', 'B组 第三轮 第6名', 'B组 第三轮 第7名', 'B组 第三轮 第8名'],
            forecasts: [
              { red: 4, blue: 3 },
              { red: 5, blue: 6 },
              { red: 7, blue: 8 },
            ]
          }
        ]
      }
    },
    {
      id: '#3',
      text: '第四轮 1-2',
      x: rx - 2 * groupXOffset,
      y: ry + 260,
      data: {
        title: '瑞士轮第四轮 1-2',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 1,
        type: 'match',
        zones: [
          {
            matches: [52, 53, 54],
            winners: [39, 40],
            losers: [35, 36, 37, 38],
            text: ['A组 第三轮 第9名', 'A组 第三轮 第10名', 'A组 第三轮 第11名', 'A组 第三轮 第12名', 'A组 第三轮 第14名', 'A组 第三轮 第13名'],
            forecasts: [
              { red: 9, blue: 10 },
              { red: 11, blue: 12 },
              { red: 14, blue: 13 },
            ]
          },
          {
            matches: [58, 59, 60],
            winners: [47, 48],
            losers: [43, 44, 45, 46],
            text: ['B组 第三轮 第10名', 'B组 第三轮 第9名', 'B组 第三轮 第12名', 'B组 第三轮 第11名', 'B组 第三轮 第13名', 'B组 第三轮 第14名'],
            forecasts: [
              { red: 10, blue: 9 },
              { red: 12, blue: 11 },
              { red: 13, blue: 14 },
            ]
          }
        ]
      }
    },
    {
      id: '#4',
      text: '晋级 3-1',
      x: rx - groupXOffset,
      y: ry - 270,
      data: {
        title: '晋级淘汰赛 3-1',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_winner_bg.png',
        borderColor: '#E7A662',
        collegeNameColor: '#FFB553',
        rankColor: '#FFA500',
        round: 2,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [49, 50, 51],
            losers: [],
            text: ['第49场胜者', '第50场胜者', '第51场胜者'],
          },
          {
            matches: [],
            winners: [55, 56, 57],
            losers: [],
            text: ['第55场胜者', '第56场胜者', '第57场胜者'],
          }
        ]
      }
    },
    {
      id: '#5',
      text: '第五轮 2-2',
      x: rx - groupXOffset,
      y: ry - 20,
      data: {
        title: '瑞士轮第五轮 2-2',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 2,
        type: 'match',
        zones: [
          {
            matches: [61, 62, 63],
            winners: [52, 53, 54],
            losers: [49, 50, 51],
            text: ['A组 第四轮 第6名', 'A组 第四轮 第11名', 'A组 第四轮 第10名', 'A组 第四轮 第7名', 'A组 第四轮 第8名', 'A组 第四轮 第9名'],
            forecasts: [
              { red: 6, blue: 11 },
              { red: 10, blue: 7 },
              { red: 8, blue: 9 },
            ]
          },
          {
            matches: [64, 65, 66],
            winners: [58, 59, 60],
            losers: [55, 56, 57],
            text: ['B组 第四轮 第11名', 'B组 第四轮 第6名', 'B组 第四轮 第7名', 'B组 第四轮 第10名', 'B组 第四轮 第9名', 'B组 第四轮 第8名'],
            forecasts: [
              { red: 11, blue: 6 },
              { red: 7, blue: 10 },
              { red: 9, blue: 8 },
            ]
          }
        ]
      }
    },
    {
      id: '#6',
      text: '淘汰 1-3',
      x: rx - groupXOffset,
      y: ry + 370,
      data: {
        title: '淘汰 1-3',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_loser_bg.png',
        borderColor: '#3E484D',
        collegeNameColor: '#9D9F9F',
        rankColor: '#4F4F4F',
        round: 2,
        type: 'eliminate',
        zones: [
          {
            matches: [],
            winners: [],
            losers: [52, 53, 54],
            text: ['第52场败者', '第53场败者', '第54场败者'],
          },
          {
            matches: [],
            winners: [],
            losers: [58, 59, 60],
            text: ['第58场败者', '第59场败者', '第60场败者'],
          }
        ]
      }
    },
    {
      id: '#7',
      text: '晋级 3-2',
      x: 0,
      y: ry - 160,
      data: {
        title: '晋级淘汰赛 3-2',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_winner_bg.png',
        borderColor: '#E7A662',
        collegeNameColor: '#FFB553',
        rankColor: '#FFA500',
        round: 3,
        type: 'promote',
        zones: [
          {
            matches: [],
            winners: [61, 62, 63],
            losers: [],
            text: ['第61场胜者', '第62场胜者', '第63场胜者'],
          },
          {
            matches: [],
            winners: [64, 65, 66],
            losers: [],
            text: ['第64场胜者', '第65场胜者', '第66场胜者'],
          }
        ]
      }
    },
    {
      id: '#8',
      text: '淘汰 2-3',
      x: 0,
      y: ry + 240,
      data: {
        title: '淘汰 2-3',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_loser_bg.png',
        borderColor: '#3E484D',
        collegeNameColor: '#9D9F9F',
        rankColor: '#4F4F4F',
        round: 3,
        type: 'eliminate',
        zones: [
          {
            matches: [],
            winners: [],
            losers: [61, 62, 63],
            text: ['第61场败者', '第62场败者', '第63场败者'],
          },
          {
            matches: [],
            winners: [],
            losers: [64, 65, 66],
            text: ['第64场败者', '第65场败者', '第66场败者'],
          }
        ]
      }
    }
  ],
  lines: [
    { from: '#2', to: '#4', },
    { from: '#2', to: '#5', },
    { from: '#3', to: '#5', },
    { from: '#3', to: '#6', },
    { from: '#5', to: '#7', },
    { from: '#5', to: '#8', },
  ],
}

export const FinalZoneGroup2RoundOrder2025 = {
  'A': [49, 61, 61],
  'B': [55, 64, 64],
}
