const rx = 0;
const ry = 0;

const nodeWidth = 350;

export const PartitionGroupJsonData = {
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
      y: ry - 140,
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
      y: ry + 100,
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
      y: ry + 10,
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

export const PartitionKnockoutYOffset = 50;

export const PartitionKnockoutOrderNumbers = {
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

export const PartitionKnockoutTitleData = [
  {
    left: `${rx - nodeWidth * 3 - 180 + 20}`,
    top: `${ry - PartitionKnockoutYOffset * 7 - 40}`,
    title: '16进8淘汰赛',
    image: 'src/assets/title_bg.png',
  },
  {
    left: `${rx - nodeWidth * 2 - 120 + 20}`,
    top: `${ry - PartitionKnockoutYOffset * 6 - 40}`,
    title: '8进4淘汰赛',
    image: 'src/assets/title_bg.png',
  },
  {
    left: `${rx - nodeWidth - 60 + 20}`,
    top: `${ry - PartitionKnockoutYOffset * 4 - 40}`,
    title: '半决赛',
    image: 'src/assets/title_bg.png',
  },
  {
    left: `${rx + 20}`,
    top: `${ry + PartitionKnockoutYOffset * 2 - 40}`,
    title: '季军争夺战',
    image: 'src/assets/title_bg.png',
  },
  {
    left: `${rx + 20}`,
    top: `${ry - PartitionKnockoutYOffset * 2 - 40}`,
    title: '冠军争夺战',
    image: 'src/assets/title_bg.png',
  },
]

export const GetPartitionKnockoutJsonData = (zoneId: number): any => {
  return {
    rootId: '#16',
    nodes: [
      {
        id: '#1',
        text: '16进8淘汰赛 第1场',
        x: rx - nodeWidth * 3 - 180,
        y: ry - PartitionKnockoutYOffset * 7,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][1]],
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
        x: rx - nodeWidth * 3 - 180,
        y: ry - PartitionKnockoutYOffset * 5,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][2]],
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
        x: rx - nodeWidth * 3 - 180,
        y: ry - PartitionKnockoutYOffset * 3,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][3]],
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
        x: rx - nodeWidth * 3 - 180,
        y: ry - PartitionKnockoutYOffset,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][4]],
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
        x: rx - nodeWidth * 3 - 180,
        y: ry + PartitionKnockoutYOffset,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][5]],
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
        x: rx - nodeWidth * 3 - 180,
        y: ry + PartitionKnockoutYOffset * 3,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][6]],
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
        x: rx - nodeWidth * 3 - 180,
        y: ry + PartitionKnockoutYOffset * 5,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][7]],
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
        x: rx - nodeWidth * 3 - 180,
        y: ry + PartitionKnockoutYOffset * 7,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][8]],
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
        x: rx - nodeWidth * 2 - 120,
        y: ry - PartitionKnockoutYOffset * 6,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][9]],
              winners: [PartitionKnockoutOrderNumbers[zoneId][2], PartitionKnockoutOrderNumbers[zoneId][1]],
              losers: [],
              text: [`第${PartitionKnockoutOrderNumbers[zoneId][2]}场 胜者`, `第${PartitionKnockoutOrderNumbers[zoneId][1]}场 胜者`]
            },
          ]
        }
      },
      {
        id: '#10',
        text: '8进4淘汰赛 第2场',
        x: rx - nodeWidth * 2 - 120,
        y: ry - PartitionKnockoutYOffset * 2,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][10]],
              winners: [PartitionKnockoutOrderNumbers[zoneId][3], PartitionKnockoutOrderNumbers[zoneId][4]],
              losers: [],
              text: [`第${PartitionKnockoutOrderNumbers[zoneId][3]}场 胜者`, `第${PartitionKnockoutOrderNumbers[zoneId][4]}场 胜者`]
            },
          ]
        }
      },
      {
        id: '#11',
        text: '8进4淘汰赛 第3场',
        x: rx - nodeWidth * 2 - 120,
        y: ry + PartitionKnockoutYOffset * 2,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][11]],
              winners: [PartitionKnockoutOrderNumbers[zoneId][6], PartitionKnockoutOrderNumbers[zoneId][5]],
              losers: [],
              text: [`第${PartitionKnockoutOrderNumbers[zoneId][6]}场 胜者`, `第${PartitionKnockoutOrderNumbers[zoneId][5]}场 胜者`]
            },
          ]
        }
      },
      {
        id: '#12',
        text: '8进4淘汰赛 第4场',
        x: rx - nodeWidth * 2 - 120,
        y: ry + PartitionKnockoutYOffset * 6,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][12]],
              winners: [PartitionKnockoutOrderNumbers[zoneId][7], PartitionKnockoutOrderNumbers[zoneId][8]],
              losers: [],
              text: [`第${PartitionKnockoutOrderNumbers[zoneId][7]}场 胜者`, `第${PartitionKnockoutOrderNumbers[zoneId][8]}场 胜者`]
            },
          ]
        }
      },
      {
        id: '#13',
        text: '半决赛 第1场',
        x: rx - nodeWidth - 60,
        y: ry - PartitionKnockoutYOffset * 4,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][13]],
              winners: [PartitionKnockoutOrderNumbers[zoneId][9], PartitionKnockoutOrderNumbers[zoneId][11]],
              losers: [],
              text: [`第${PartitionKnockoutOrderNumbers[zoneId][9]}场 胜者`, `第${PartitionKnockoutOrderNumbers[zoneId][11]}场 胜者`]
            },
          ]
        }
      },
      {
        id: '#14',
        text: '半决赛 第2场',
        x: rx - nodeWidth - 60,
        y: ry + PartitionKnockoutYOffset * 4,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][14]],
              winners: [PartitionKnockoutOrderNumbers[zoneId][10], PartitionKnockoutOrderNumbers[zoneId][12]],
              losers: [],
              text: [`第${PartitionKnockoutOrderNumbers[zoneId][10]}场 胜者`, `第${PartitionKnockoutOrderNumbers[zoneId][12]}场 胜者`]
            },
          ]
        }
      },
      {
        id: '#15',
        text: '季军争夺战',
        x: rx,
        y: ry + PartitionKnockoutYOffset * 2,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][15]],
              winners: [],
              losers: [PartitionKnockoutOrderNumbers[zoneId][13], PartitionKnockoutOrderNumbers[zoneId][14]],
              text: [`第${PartitionKnockoutOrderNumbers[zoneId][13]}场 败者`, `第${PartitionKnockoutOrderNumbers[zoneId][14]}场 败者`]
            },
          ]
        }
      },
      {
        id: '#16',
        text: '冠军争夺战',
        x: rx,
        y: ry - PartitionKnockoutYOffset * 2,
        data: {
          title: '',
          titleColor: '#FFFFFF',
          round: -1,
          type: 'match',
          zones: [
            {
              matches: [PartitionKnockoutOrderNumbers[zoneId][16]],
              winners: [PartitionKnockoutOrderNumbers[zoneId][13], PartitionKnockoutOrderNumbers[zoneId][14]],
              losers: [],
              text: [`第${PartitionKnockoutOrderNumbers[zoneId][13]}场 胜者`, `第${PartitionKnockoutOrderNumbers[zoneId][14]}场 胜者`]
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

}

export const PartitionRoundOrder = {
  'A': [1, 17, 33, 46],
  'B': [9, 25, 39, 46],
}