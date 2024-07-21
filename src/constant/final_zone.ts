import {TitleData, ZoneJsonData} from "../types/zone";
import {GroupZoneKnockoutOrderNumbers} from "./group_zone";

const rx = 0;
const ry = 0;

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
    // 75 1-2
    // 76 4-3
    // 77 5-6
    // 78 8-7
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
            matches: [75],
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
            matches: [76],
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
            matches: [77],
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
            matches: [78],
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
    title: '16进8 第一轮 BO3',
    image: 'src/assets/title_bg.png',
  },
  {
    left: rx - KnockoutXOffset * 3 + 20,
    top: ry - KnockoutYOffset * 6 - 40,
    title: '16进8 胜者组 BO3',
    image: 'src/assets/title_bg.png',
  },
  {
    left: rx - KnockoutXOffset * 2 + 20,
    top: ry - KnockoutYOffset * 4 - 40,
    title: '8进4 胜者组 BO3',
    image: 'src/assets/title_bg.png',
  },
  {
    left: rx - KnockoutXOffset + 20,
    top: ry - KnockoutYOffset * 4 - 40,
    title: '半决赛 BO3',
    image: 'src/assets/title_bg.png',
  },
  {
    left: 20,
    top: ry + KnockoutYOffset * 2 - 40,
    title: '季军争夺战 BO5',
    image: 'src/assets/title_winner_bg.png',
  },
  {
    left: 20,
    top: ry - KnockoutYOffset * 2 - 40,
    title: '冠军争夺战 BO5',
    image: 'src/assets/title_winner_bg.png',
  },
]
