import {TitleData, ZoneJsonData} from "../types/zone";

const rx = 0;
const ry = 0;

const groupXOffset = 420;

export const FinalZoneGroup1JsonData: ZoneJsonData = {
  rootId: '#1',
  nodes: [
    {
      id: '#1',
      text: '第一轮 0-0',
      x: rx - 4 * groupXOffset,
      y: ry - 200,
      data: {
        title: '瑞士轮第一轮 0-0',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_bg.png',
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
      y: ry - 250,
      data: {
        title: '瑞士轮第二轮 1-0',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_bg.png',
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
              {red: 1, blue: 2},
              {red: 3, blue: 4},
              {red: 6, blue: 5},
              {red: 8, blue: 7},
            ]
          },
          {
            matches: [25, 26, 27, 28],
            winners: [9, 10, 11, 12, 13, 14, 15, 16],
            losers: [],
            text: ['B组 第一轮 第2名', 'B组 第一轮 第1名', 'B组 第一轮 第4名', 'B组 第一轮 第3名',
              'B组 第一轮 第5名', 'B组 第一轮 第6名', 'B组 第一轮 第7名', 'B组 第一轮 第8名'],
            forecasts: [
              {red: 2, blue: 1},
              {red: 4, blue: 3},
              {red: 5, blue: 6},
              {red: 7, blue: 8},
            ]
          }
        ]
      }
    },
    {
      id: '#3',
      text: '第二轮 0-1',
      x: rx - 3 * groupXOffset,
      y: ry + 160,
      data: {
        title: '瑞士轮第二轮 0-1',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_bg.png',
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
              {red: 9, blue: 10},
              {red: 11, blue: 12},
              {red: 14, blue: 13},
              {red: 16, blue: 15},
            ]
          },
          {
            matches: [29, 30, 31, 32],
            winners: [],
            losers: [9, 10, 11, 12, 13, 14, 15, 16],
            text: ['B组 第一轮 第10名', 'B组 第一轮 第9名', 'B组 第一轮 第12名', 'B组 第一轮 第11名',
              'B组 第一轮 第13名', 'B组 第一轮 第14名', 'B组 第一轮 第15名', 'B组 第一轮 第16名'],
            forecasts: [
              {red: 10, blue: 9},
              {red: 12, blue: 11},
              {red: 13, blue: 14},
              {red: 15, blue: 16},
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
        titleImage: 'static/title_bg.png',
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
              {red: 1, blue: 2},
              {red: 3, blue: 4},
            ]
          },
          {
            matches: [41, 42],
            winners: [25, 26, 27, 28],
            losers: [],
            text: ['B组 第二轮 第2名', 'B组 第二轮 第1名', 'B组 第二轮 第4名', 'B组 第二轮 第3名'],
            forecasts: [
              {red: 2, blue: 1},
              {red: 4, blue: 3},
            ]
          }
        ]
      }
    },
    {
      id: '#5',
      text: '第三轮 1-1',
      x: rx - 2 * groupXOffset,
      y: ry - 60,
      data: {
        title: '瑞士轮第三轮 1-1',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_bg.png',
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
              {red: 6, blue: 5},
              {red: 8, blue: 7},
              {red: 9, blue: 10},
              {red: 11, blue: 12},
            ]
          },
          {
            matches: [43, 44, 45, 46],
            winners: [29, 30, 31, 32],
            losers: [25, 26, 27, 28],
            text: ['B组 第二轮 第5名', 'B组 第二轮 第6名', 'B组 第二轮 第7名', 'B组 第二轮 第8名',
              'B组 第二轮 第10名', 'B组 第二轮 第9名', 'B组 第二轮 第12名', 'B组 第二轮 第11名'],
            forecasts: [
              {red: 5, blue: 6},
              {red: 7, blue: 8},
              {red: 10, blue: 9},
              {red: 12, blue: 11},
            ]
          }
        ]
      }
    },
    {
      id: '#6',
      text: '第三轮 0-2',
      x: rx - 2 * groupXOffset,
      y: ry + 345,
      data: {
        title: '瑞士轮第三轮 0-2',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_bg.png',
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
              {red: 14, blue: 13},
              {red: 16, blue: 15},
            ]
          },
          {
            matches: [47, 48],
            winners: [],
            losers: [29, 30, 31, 32],
            text: ['B组 第二轮 第13名', 'B组 第二轮 第14名', 'B组 第二轮 第15名', 'B组 第二轮 第16名'],
            forecasts: [
              {red: 13, blue: 14},
              {red: 15, blue: 16},
            ]
          }
        ]
      }
    },
    {
      id: '#7',
      text: '晋级 3-0',
      x: rx - groupXOffset,
      y: ry - 262,
      data: {
        title: '晋级淘汰赛 3-0',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_winner_bg.png',
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
      x: rx - groupXOffset,
      y: ry + 382,
      data: {
        title: '淘汰 0-3',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_loser_bg.png',
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
      y: ry - 200,
      data: {
        title: '瑞士轮第四轮 2-1',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_bg.png',
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
              {red: 3, blue: 4},
              {red: 6, blue: 5},
              {red: 8, blue: 7},
            ]
          },
          {
            matches: [55, 56, 57],
            winners: [43, 44, 45, 46],
            losers: [41, 42],
            // 4-3 5-6 7-8
            text: ['B组 第三轮 第4名', 'B组 第三轮 第3名', 'B组 第三轮 第5名', 'B组 第三轮 第6名', 'B组 第三轮 第7名', 'B组 第三轮 第8名'],
            forecasts: [
              {red: 4, blue: 3},
              {red: 5, blue: 6},
              {red: 7, blue: 8},
            ]
          }
        ]
      }
    },
    {
      id: '#10',
      text: '第四轮 1-2',
      x: 0,
      y: ry + 160,
      data: {
        title: '瑞士轮第四轮 1-2',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_bg.png',
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
              {red: 9, blue: 10},
              {red: 11, blue: 12},
              {red: 14, blue: 13},
            ]
          },
          {
            matches: [58, 59, 60],
            winners: [47, 48],
            losers: [43, 44, 45, 46],
            // 10-9 12-11 13-14
            text: ['B组 第三轮 第10名', 'B组 第三轮 第9名', 'B组 第三轮 第12名', 'B组 第三轮 第11名', 'B组 第三轮 第13名', 'B组 第三轮 第14名'],
            forecasts: [
              {red: 10, blue: 9},
              {red: 12, blue: 11},
              {red: 13, blue: 14},
            ]
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
    {from: '#6', to: '#8',},
    {from: '#4', to: '#9',},
    {from: '#5', to: '#9',},
    {from: '#5', to: '#10',},
    {from: '#6', to: '#10',},
  ],
}

export const FinalZoneGroup1RoundOrder = {
  'A': [1, 17, 33, 49],
  'B': [9, 25, 41, 55],
}

export const FinalZoneGroup2JsonData: ZoneJsonData = {
  rootId: '#1',
  nodes: [
    {
      id: '#1',
      text: '晋级 3-0',
      x: rx - 2 * groupXOffset,
      y: ry - 320,
      data: {
        title: '晋级淘汰赛 3-0',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_winner_bg.png',
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
      y: ry - 140,
      data: {
        title: '瑞士轮第四轮 2-1',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_bg.png',
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
              {red: 3, blue: 4},
              {red: 6, blue: 5},
              {red: 8, blue: 7},
            ]
          },
          {
            matches: [55, 56, 57],
            winners: [43, 44, 45, 46],
            losers: [41, 42],
            text: ['B组 第三轮 第4名', 'B组 第三轮 第3名', 'B组 第三轮 第5名', 'B组 第三轮 第6名', 'B组 第三轮 第7名', 'B组 第三轮 第8名'],
            forecasts: [
              {red: 4, blue: 3},
              {red: 5, blue: 6},
              {red: 7, blue: 8},
            ]
          }
        ]
      }
    },
    {
      id: '#3',
      text: '第四轮 1-2',
      x: rx - 2 * groupXOffset,
      y: ry + 200,
      data: {
        title: '瑞士轮第四轮 1-2',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_bg.png',
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
              {red: 9, blue: 10},
              {red: 11, blue: 12},
              {red: 14, blue: 13},
            ]
          },
          {
            matches: [58, 59, 60],
            winners: [47, 48],
            losers: [43, 44, 45, 46],
            text: ['B组 第三轮 第10名', 'B组 第三轮 第9名', 'B组 第三轮 第12名', 'B组 第三轮 第11名', 'B组 第三轮 第13名', 'B组 第三轮 第14名'],
            forecasts: [
              {red: 10, blue: 9},
              {red: 12, blue: 11},
              {red: 13, blue: 14},
            ]
          }
        ]
      }
    },
    {
      id: '#4',
      text: '晋级 3-1',
      x: rx - groupXOffset,
      y: ry - 260,
      data: {
        title: '晋级淘汰赛 3-1',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_winner_bg.png',
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
      y: ry - 40,
      data: {
        title: '瑞士轮第五轮 2-2',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_bg.png',
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
              {red: 6, blue: 7},
              {red: 8, blue: 9},
              {red: 11, blue: 10},
            ]
          },
          {
            matches: [64, 65, 66],
            winners: [58, 59, 60],
            losers: [55, 56, 57],
            text: ['B组 第四轮 第7名', 'B组 第四轮 第6名', 'B组 第四轮 第8名', 'B组 第四轮 第9名', 'B组 第四轮 第11名', 'B组 第四轮 第10名'],
            forecasts: [
              {red: 7, blue: 6},
              {red: 8, blue: 9},
              {red: 11, blue: 10},
            ]
          }
        ]
      }
    },
    {
      id: '#6',
      text: '淘汰 1-3',
      x: rx - groupXOffset,
      y: ry + 300,
      data: {
        title: '淘汰 1-3',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_loser_bg.png',
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
        titleImage: 'static/title_winner_bg.png',
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
      y: ry + 200,
      data: {
        title: '淘汰 2-3',
        titleColor: '#FFFFFF',
        titleImage: 'static/title_loser_bg.png',
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
    {from: '#2', to: '#4',},
    {from: '#2', to: '#5',},
    {from: '#3', to: '#5',},
    {from: '#3', to: '#6',},
    {from: '#5', to: '#7',},
    {from: '#5', to: '#8',},
  ],
}

export const FinalZoneGroup2RoundOrder = {
  'A': [49, 61, 61],
  'B': [55, 64, 64],
}

const KnockoutXOffset = 420;
const KnockoutYOffset = 50;

export const FinalZoneKnockoutJsonData: ZoneJsonData = {
  rootId: '#18',
  nodes: [
    // 67 B1 A8
    // 68 B5 A4
    // 69 A7 B2
    // 70 A3 B6
    // 71 A6 B3
    // 72 A2 B7
    // 73 B4 A5
    // 74 B8 A1
    {
      id: '#1',
      text: '16进8第一轮 第1场',
      x: rx - KnockoutXOffset * 4,
      y: ry - KnockoutYOffset * 7,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [67],
            winners: [],
            losers: [],
            text: ['小组赛B组 第1名', '小组赛A组 第8名']
          },
        ]
      }
    },
    {
      id: '#2',
      text: '16进8第一轮 第2场',
      x: rx - KnockoutXOffset * 4,
      y: ry - KnockoutYOffset * 5,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [68],
            winners: [],
            losers: [],
            text: ['小组赛B组 第5名', '小组赛A组 第4名']
          },
        ]
      }
    },
    {
      id: '#3',
      text: '16进8第一轮 第3场',
      x: rx - KnockoutXOffset * 4,
      y: ry - KnockoutYOffset * 3,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [69],
            winners: [],
            losers: [],
            text: ['小组赛A组 第7名', '小组赛B组 第2名']
          },
        ]
      }
    },
    {
      id: '#4',
      text: '16进8第一轮 第4场',
      x: rx - KnockoutXOffset * 4,
      y: ry - KnockoutYOffset,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [70],
            winners: [],
            losers: [],
            text: ['小组赛A组 第3名', '小组赛B组 第6名']
          },
        ]
      }
    },
    {
      id: '#5',
      text: '16进8第一轮 第5场',
      x: rx - KnockoutXOffset * 4,
      y: ry + KnockoutYOffset,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [71],
            winners: [],
            losers: [],
            text: ['小组赛A组 第6名', '小组赛B组 第3名']
          },
        ]
      }
    },
    {
      id: '#6',
      text: '16进8第一轮 第6场',
      x: rx - KnockoutXOffset * 4,
      y: ry + KnockoutYOffset * 3,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [72],
            winners: [],
            losers: [],
            text: ['小组赛A组 第2名', '小组赛B组 第7名']
          },
        ]
      }
    },
    {
      id: '#7',
      text: '16进8第一轮 第7场',
      x: rx - KnockoutXOffset * 4,
      y: ry + KnockoutYOffset * 5,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [73],
            winners: [],
            losers: [],
            text: ['小组赛B组 第4名', '小组赛A组 第5名']
          },
        ]
      }
    },
    {
      id: '#8',
      text: '16进8第一轮 第8场',
      x: rx - KnockoutXOffset * 4,
      y: ry + KnockoutYOffset * 7,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [74],
            winners: [],
            losers: [],
            text: ['小组赛B组 第8名', '小组赛A组 第1名']
          },
        ]
      }
    },
    // 79 1-2
    // 80 4-3
    // 81 5-6
    // 82 8-7
    {
      id: '#9',
      text: '16进8胜者组 第1场',
      x: rx - KnockoutXOffset * 3,
      y: ry - KnockoutYOffset * 6,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [79],
            winners: [67, 68],
            losers: [],
            text: ['第67场胜者', '第68场胜者']
          },
        ]
      }
    },
    {
      id: '#10',
      text: '16进8胜者组 第2场',
      x: rx - KnockoutXOffset * 3,
      y: ry - KnockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [80],
            winners: [70, 69],
            losers: [],
            text: ['第70场胜者', '第69场胜者']
          },
        ]
      }
    },
    {
      id: '#11',
      text: '16进8胜者组 第3场',
      x: rx - KnockoutXOffset * 3,
      y: ry + KnockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [81],
            winners: [71, 72],
            losers: [],
            text: ['第71场胜者', '第72场胜者']
          },
        ]
      }
    },
    {
      id: '#12',
      text: '16进8胜者组 第4场',
      x: rx - KnockoutXOffset * 3,
      y: ry + KnockoutYOffset * 6,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [82],
            winners: [74, 73],
            losers: [],
            text: ['第74场胜者', '第73场胜者']
          },
        ]
      }
    },
    // 87 1-3
    // 88 2-4
    {
      id: '#13',
      text: '8进4胜者组 第1场',
      x: rx - KnockoutXOffset * 2,
      y: ry - KnockoutYOffset * 4,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [87],
            winners: [79, 81],
            losers: [],
            text: ['第79场胜者', '第81场胜者']
          },
        ]
      }
    },
    {
      id: '#14',
      text: '8进4胜者组 第2场',
      x: rx - KnockoutXOffset * 2,
      y: ry + KnockoutYOffset * 4,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [88],
            winners: [80, 82],
            losers: [],
            text: ['第80场胜者', '第82场胜者']
          },
        ]
      }
    },
    // 93
    // 94
    {
      id: '#15',
      text: '半决赛 第1场',
      x: rx - KnockoutXOffset,
      y: ry - KnockoutYOffset * 4,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [93],
            winners: [91, 87],
            losers: [],
            text: ['第91场胜者', '第87场胜者']
          },
        ]
      }
    },
    {
      id: '#16',
      text: '半决赛 第2场',
      x: rx - KnockoutXOffset,
      y: ry + KnockoutYOffset * 4,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [94],
            winners: [88, 92],
            losers: [],
            text: ['第88场胜者', '第92场胜者']
          },
        ]
      }
    },
    {
      id: '#17',
      text: '季军争夺战',
      x: 0,
      y: ry + KnockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        collegeNameColor: '#FFB553',
        rankColor: '#FFA500',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [95],
            winners: [],
            losers: [93, 94],
            text: ['第93场败者', '第94场败者']
          },
        ]
      }
    },
    {
      id: '#18',
      text: '冠军争夺战',
      x: 0,
      y: ry - KnockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        collegeNameColor: '#FFB553',
        rankColor: '#FFA500',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [96],
            winners: [],
            losers: [93, 94],
            text: ['第93场胜者', '第94场胜者']
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
    {from: '#14', to: '#16',},
    {from: '#15', to: '#17',},
    {from: '#15', to: '#18',},
    {from: '#16', to: '#17',},
    {from: '#16', to: '#18',},
  ],
}

export const FinalZoneKnockoutTitleData: TitleData[] = [
  {
    left: rx - KnockoutXOffset * 4 + 20,
    top: ry - KnockoutYOffset * 7 - 40,
    title: '16进8第一轮 BO3',
    image: 'static/title_bg.png',
  },
  {
    left: rx - KnockoutXOffset * 3 + 20,
    top: ry - KnockoutYOffset * 6 - 40,
    title: '16进8胜者组 BO3',
    image: 'static/title_bg.png',
  },
  {
    left: rx - KnockoutXOffset * 2 + 20,
    top: ry - KnockoutYOffset * 4 - 40,
    title: '8进4胜者组 BO3',
    image: 'static/title_bg.png',
  },
  {
    left: rx - KnockoutXOffset + 20,
    top: ry - KnockoutYOffset * 4 - 40,
    title: '半决赛 BO3',
    image: 'static/title_bg.png',
  },
  {
    left: 20,
    top: ry + KnockoutYOffset * 2 - 40,
    title: '季军争夺战 BO5',
    image: 'static/title_winner_bg.png',
  },
  {
    left: 20,
    top: ry - KnockoutYOffset * 2 - 40,
    title: '冠军争夺战 BO5',
    image: 'static/title_winner_bg.png',
  },
]

export const FinalZoneKnockoutLoserJsonData: ZoneJsonData = {
  rootId: '#18',
  nodes: [
    // 75 1-2
    // 76 4-3
    // 77 5-6
    // 78 8-7
    {
      id: '#1',
      text: '16进8败者组第一轮 第1场',
      x: rx - KnockoutXOffset * 3,
      y: ry - KnockoutYOffset * 6,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [75],
            winners: [],
            losers: [67, 68],
            text: ['第67场败者', '第68场败者']
          },
        ]
      }
    },
    {
      id: '#2',
      text: '16进8败者组第一轮 第2场',
      x: rx - KnockoutXOffset * 3,
      y: ry - KnockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [76],
            winners: [],
            losers: [70, 69],
            text: ['第70场败者', '第69场败者']
          },
        ]
      }
    },
    {
      id: '#3',
      text: '16进8败者组第一轮 第3场',
      x: rx - KnockoutXOffset * 3,
      y: ry + KnockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [77],
            winners: [],
            losers: [71, 72],
            text: ['第71场败者', '第72场败者']
          },
        ]
      }
    },
    {
      id: '#4',
      text: '16进8败者组第一轮 第4场',
      x: rx - KnockoutXOffset * 3,
      y: ry + KnockoutYOffset * 6,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [78],
            winners: [],
            losers: [74, 73],
            text: ['第74场败者', '第73场败者']
          },
        ]
      }
    },
    // 83
    // 84
    // 85
    // 86
    {
      id: '#5',
      text: '16进8败者组第二轮 第1场',
      x: rx - KnockoutXOffset * 2,
      y: ry - KnockoutYOffset * 6,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [83],
            winners: [78],
            losers: [79],
            text: ['第78场胜者', '第79场败者']
          },
        ]
      }
    },
    {
      id: '#6',
      text: '16进8败者组第二轮 第2场',
      x: rx - KnockoutXOffset * 2,
      y: ry - KnockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [84],
            winners: [77],
            losers: [80],
            text: ['第77场胜者', '第80场败者']
          },
        ]
      }
    },
    {
      id: '#7',
      text: '16进8败者组第二轮 第3场',
      x: rx - KnockoutXOffset * 2,
      y: ry + KnockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [85],
            winners: [81],
            losers: [76],
            text: ['第81场败者', '第76场胜者']
          },
        ]
      }
    },
    {
      id: '#8',
      text: '16进8败者组第二轮 第4场',
      x: rx - KnockoutXOffset * 2,
      y: ry + KnockoutYOffset * 6,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [86],
            winners: [75],
            losers: [82],
            text: ['第82场败者', '第75场胜者']
          },
        ]
      }
    },
    // 89
    // 90
    {
      id: '#9',
      text: '8进4败者组第一轮 第1场',
      x: rx - KnockoutXOffset,
      y: ry - KnockoutYOffset * 4,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [89],
            winners: [83, 86],
            losers: [],
            text: ['第83场胜者', '第86场胜者']
          },
        ]
      }
    },
    {
      id: '#10',
      text: '8进4败者组第一场 第2场',
      x: rx - KnockoutXOffset,
      y: ry + KnockoutYOffset * 4,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [90],
            winners: [84, 85],
            losers: [],
            text: ['第84场胜者', '第85场胜者']
          },
        ]
      }
    },
    // 91
    // 92
    {
      id: '#11',
      text: '8进4败者组第二轮 第1场',
      x: 0,
      y: ry - KnockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [91],
            winners: [89],
            losers: [87],
            text: ['第87场败者', '第89场胜者']
          },
        ]
      }
    },
    {
      id: '#12',
      text: '8进4败者组第二轮 第2场',
      x: 0,
      y: ry + KnockoutYOffset * 2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [
          {
            matches: [92],
            winners: [90],
            losers: [88],
            text: ['第88场败者', '第90场胜者']
          },
        ]
      }
    },
  ],
  lines: [
    {from: '#1', to: '#5',},
    {from: '#2', to: '#6',},
    {from: '#3', to: '#7',},
    {from: '#4', to: '#8',},
    {from: '#5', to: '#9',},
    {from: '#6', to: '#10',},
    {from: '#7', to: '#9',},
    {from: '#8', to: '#10',},
    {from: '#9', to: '#11',},
    {from: '#10', to: '#12',},
  ],
}

export const FinalZoneKnockoutLoserTitleData: TitleData[] = [
  {
    left: rx - KnockoutXOffset * 3 + 20,
    top: ry - KnockoutYOffset * 6 - 40,
    title: '16进8败者组 第一轮 BO3',
    image: 'static/title_bg.png',
  },
  {
    left: rx - KnockoutXOffset * 2 + 20,
    top: ry - KnockoutYOffset * 6 - 40,
    title: '16进8败者组 第二轮 BO3',
    image: 'static/title_bg.png',
  },
  {
    left: rx - KnockoutXOffset + 20,
    top: ry - KnockoutYOffset * 4 - 40,
    title: '8进4败者组 第一轮 BO3',
    image: 'static/title_bg.png',
  },
  {
    left: 20,
    top: ry - KnockoutYOffset * 2 - 40,
    title: '8进4败者组 第二轮 BO3',
    image: 'static/title_bg.png',
  },
]
