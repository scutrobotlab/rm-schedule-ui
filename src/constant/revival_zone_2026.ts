import { RoundOrder } from "../types/round_order";
import { TitleData, ZoneJsonData } from "../types/zone";

const rx = 0;
const ry = 0;

const xOffset = 435;

/**
 * 2026 复活赛（617）小组赛布局。
 * 与往年 RevivalZone 的差异：第三轮 1-1 配对（A: 3v6/4v5，B: 6v3/5v4），
 * 以及前四名统一晋级「名额争夺」而非全国赛/第二赛段分流。
 */
export const RevivalZone2026GroupJsonData: ZoneJsonData = {
  rootId: '#1',
  stages: ['第一轮', '第二轮', '第三轮', '晋级结果'],
  nodes: [
    {
      id: '#1',
      text: '第一轮 0-0',
      x: rx - 3 * xOffset,
      y: ry + 80,
      data: {
        title: '瑞士轮第一轮 0-0',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_bg.png',
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
        titleImage: '/static/title_bg.png',
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
              { red: 1, blue: 2 },
              { red: 3, blue: 4 },
            ]
          },
          {
            matches: [13, 14],
            winners: [5, 6, 7, 8],
            losers: [],
            text: ['B组 第一轮 第2名', 'B组 第一轮 第1名', 'B组 第一轮 第4名', 'B组 第一轮 第3名'],
            forecasts: [
              { red: 2, blue: 1 },
              { red: 4, blue: 3 },
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
        titleImage: '/static/title_bg.png',
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
              { red: 6, blue: 5 },
              { red: 8, blue: 7 },
            ]
          },
          {
            matches: [15, 16],
            winners: [],
            losers: [5, 6, 7, 8],
            text: ['B组 第一轮 第5名', 'B组 第一轮 第6名', 'B组 第一轮 第7名', 'B组 第一轮 第8名'],
            forecasts: [
              { red: 5, blue: 6 },
              { red: 7, blue: 8 },
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
        titleImage: '/static/title_bg.png',
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
              { red: 1, blue: 2 },
            ]
          },
          {
            matches: [20],
            winners: [13, 14],
            losers: [],
            text: ['B组 第二轮 第2名', 'B组 第二轮 第1名'],
            forecasts: [
              { red: 2, blue: 1 },
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
        titleImage: '/static/title_bg.png',
        borderColor: '#5A879C',
        round: 3,
        type: 'match',
        zones: [
          {
            // 官方：18 Ⅲ-A3 vs Ⅲ-A6，19 Ⅲ-A4 vs Ⅲ-A5
            matches: [18, 19],
            winners: [11, 12],
            losers: [9, 10],
            text: ['A组 第二轮 第3名', 'A组 第二轮 第6名', 'A组 第二轮 第4名', 'A组 第二轮 第5名'],
            forecasts: [
              { red: 3, blue: 6 },
              { red: 4, blue: 5 },
            ]
          },
          {
            // 官方：21 Ⅲ-B6 vs Ⅲ-B3，22 Ⅲ-B5 vs Ⅲ-B4
            matches: [21, 22],
            winners: [15, 16],
            losers: [13, 14],
            text: ['B组 第二轮 第6名', 'B组 第二轮 第3名', 'B组 第二轮 第5名', 'B组 第二轮 第4名'],
            forecasts: [
              { red: 6, blue: 3 },
              { red: 5, blue: 4 },
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
      text: '晋级名额争夺',
      x: 0,
      y: ry - 40,
      data: {
        title: '晋级名额争夺',
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
            winners: [17, 18, 19],
            losers: [17],
            text: ['A组 第1名', 'A组 第2名', 'A组 第3名', 'A组 第4名']
          },
          {
            matches: [],
            winners: [20, 21, 22],
            losers: [20],
            text: ['B组 第1名', 'B组 第2名', 'B组 第3名', 'B组 第4名']
          }
        ]
      }
    },
    {
      id: '#8',
      text: '淘汰 1-2',
      x: rx,
      y: ry + 440,
      data: {
        title: '淘汰 1-2',
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
    { from: '#1', to: '#2' },
    { from: '#1', to: '#3' },
    { from: '#2', to: '#4' },
    { from: '#2', to: '#5' },
    { from: '#3', to: '#5' },
    { from: '#3', to: '#6' },
    { from: '#4', to: '#7' },
    { from: '#5', to: '#7' },
    { from: '#5', to: '#8' },
  ],
}

export const RevivalZone2026RoundOrder: RoundOrder = {
  A: [1, 9, 17, 17],
  B: [5, 13, 20, 20],
}

const KnockoutXOffset = 520;
/** 单场卡片垂直间距 */
const KnockoutYOffset = 100;

/**
 * 2026 复活赛（617）淘汰赛布局（order 23–32）。
 *
 * 四列：
 * 1. 晋级名额争夺战（23–26）
 * 2. 胜者组（上）+ 败者组第一轮（下），整列垂直居中
 * 3. 败者组第二轮，与败者组第一轮水平对齐（27→32、28→31）
 * 4. 晋级全国赛 + 淘汰，整列垂直居中
 */
export const RevivalZone2026KnockoutJsonData: ZoneJsonData = {
  rootId: '#1',
  stages: ['晋级名额争夺战', '胜负分组', '败者组第二轮', '晋级结果'],
  nodes: [
    // —— 第1列：晋级名额争夺战（垂直居中）——
    {
      id: '#1',
      text: '名额争夺 第23场',
      x: rx - KnockoutXOffset * 3,
      y: ry - KnockoutYOffset * 1.5,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [{
          matches: [23],
          winners: [],
          losers: [],
          text: ['小组赛B组 第1名', '小组赛A组 第4名'],
        }],
      },
    },
    {
      id: '#2',
      text: '名额争夺 第24场',
      x: rx - KnockoutXOffset * 3,
      y: ry - KnockoutYOffset * 0.5,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [{
          matches: [24],
          winners: [],
          losers: [],
          text: ['小组赛A组 第2名', '小组赛B组 第3名'],
        }],
      },
    },
    {
      id: '#3',
      text: '名额争夺 第25场',
      x: rx - KnockoutXOffset * 3,
      y: ry + KnockoutYOffset * 0.5,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [{
          matches: [25],
          winners: [],
          losers: [],
          text: ['小组赛A组 第3名', '小组赛B组 第2名'],
        }],
      },
    },
    {
      id: '#4',
      text: '名额争夺 第26场',
      x: rx - KnockoutXOffset * 3,
      y: ry + KnockoutYOffset * 1.5,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [{
          matches: [26],
          winners: [],
          losers: [],
          text: ['小组赛B组 第4名', '小组赛A组 第1名'],
        }],
      },
    },
    // —— 第2列上：胜者组 ——
    {
      id: '#5',
      text: '胜者组 第29场',
      x: rx - KnockoutXOffset * 2,
      y: ry - KnockoutYOffset * 1.8,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [{
          matches: [29],
          winners: [23, 24],
          losers: [],
          text: ['第23场 胜者', '第24场 胜者'],
        }],
      },
    },
    {
      id: '#6',
      text: '胜者组 第30场',
      x: rx - KnockoutXOffset * 2,
      y: ry - KnockoutYOffset * 0.8,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [{
          matches: [30],
          winners: [26, 25],
          losers: [],
          text: ['第26场 胜者', '第25场 胜者'],
        }],
      },
    },
    // —— 第2列下：败者组第一轮（与第3列同行）——
    {
      id: '#7',
      text: '败者组 第27场',
      x: rx - KnockoutXOffset * 2,
      y: ry + KnockoutYOffset * 0.8,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [{
          matches: [27],
          winners: [],
          losers: [23, 24],
          text: ['第23场 败者', '第24场 败者'],
        }],
      },
    },
    {
      id: '#8',
      text: '败者组 第28场',
      x: rx - KnockoutXOffset * 2,
      y: ry + KnockoutYOffset * 1.8,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [{
          matches: [28],
          winners: [],
          losers: [26, 25],
          text: ['第26场 败者', '第25场 败者'],
        }],
      },
    },
    // —— 第3列：败者组第二轮（31 上、32 下，与场次编号一致）——
    {
      id: '#9',
      text: '败者组 第31场',
      x: rx - KnockoutXOffset,
      y: ry + KnockoutYOffset * 0.2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [{
          matches: [31],
          winners: [28],
          losers: [29],
          text: ['第29场 败者', '第28场 胜者'],
        }],
      },
    },
    {
      id: '#10',
      text: '败者组 第32场',
      x: rx - KnockoutXOffset,
      y: ry + KnockoutYOffset * 1.2,
      data: {
        title: '',
        titleColor: '#FFFFFF',
        round: -1,
        type: 'match',
        zones: [{
          matches: [32],
          winners: [27],
          losers: [30],
          text: ['第27场 胜者', '第30场 败者'],
        }],
      },
    },
    // —— 第4列：晋级全国赛 + 淘汰（垂直居中）——
    {
      id: '#11',
      text: '晋级全国赛',
      x: rx,
      y: ry - KnockoutYOffset * 2.2,
      data: {
        title: '晋级全国赛',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_winner_bg.png',
        borderColor: '#E7A662',
        collegeNameColor: '#FFB553',
        rankColor: '#FFA500',
        round: -1,
        type: 'promote',
        zones: [{
          matches: [],
          winners: [29, 30, 31, 32],
          losers: [],
          text: ['第29场 胜者', '第30场 胜者', '第31场 胜者', '第32场 胜者'],
        }],
      },
    },
    {
      id: '#12',
      text: '淘汰',
      x: rx,
      y: ry + KnockoutYOffset * 1.2,
      data: {
        title: '淘汰',
        titleColor: '#FFFFFF',
        titleImage: '/static/title_loser_bg.png',
        borderColor: '#3E484D',
        collegeNameColor: '#9D9F9F',
        rankColor: '#4F4F4F',
        round: -1,
        type: 'eliminate',
        zones: [{
          matches: [],
          winners: [],
          losers: [27, 28, 31, 32],
          text: ['第27场 败者', '第28场 败者', '第31场 败者', '第32场 败者'],
        }],
      },
    },
  ],
  lines: [
    // lineShape 4 = 折线；2/3/5/6 为曲线
    { from: '#1', to: '#5', lineShape: 4 },
    { from: '#2', to: '#5', lineShape: 4 },
    { from: '#3', to: '#6', lineShape: 4 },
    { from: '#4', to: '#6', lineShape: 4 },
    { from: '#1', to: '#7', lineShape: 4 },
    { from: '#2', to: '#7', lineShape: 4 },
    { from: '#3', to: '#8', lineShape: 4 },
    { from: '#4', to: '#8', lineShape: 4 },
    { from: '#5', to: '#11', lineShape: 4 },
    { from: '#6', to: '#11', lineShape: 4 },
    { from: '#5', to: '#9', lineShape: 4 },
    { from: '#6', to: '#10', lineShape: 4 },
    { from: '#7', to: '#10', lineShape: 4 },
    { from: '#8', to: '#9', lineShape: 4 },
    { from: '#9', to: '#11', lineShape: 4 },
    { from: '#10', to: '#11', lineShape: 4 },
    { from: '#7', to: '#12', lineShape: 4 },
    { from: '#8', to: '#12', lineShape: 4 },
    { from: '#9', to: '#12', lineShape: 4 },
    { from: '#10', to: '#12', lineShape: 4 },
  ],
}

export const RevivalZone2026KnockoutTitleData: TitleData[] = [
  {
    left: rx - KnockoutXOffset * 3 + 20,
    top: ry - KnockoutYOffset * 1.5 - 40,
    title: '晋级名额争夺战',
    image: '/static/title_bg.png',
  },
  {
    left: rx - KnockoutXOffset * 2 + 20,
    top: ry - KnockoutYOffset * 1.8 - 40,
    title: '胜者组',
    image: '/static/title_bg.png',
  },
  {
    left: rx - KnockoutXOffset * 2 + 20,
    top: ry + KnockoutYOffset * 0.8 - 40,
    title: '败者组第一轮',
    image: '/static/title_bg.png',
  },
  {
    left: rx - KnockoutXOffset + 20,
    top: ry + KnockoutYOffset * 0.2 - 40,
    title: '败者组第二轮',
    image: '/static/title_bg.png',
  },
]
