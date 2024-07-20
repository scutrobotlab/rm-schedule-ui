import {RoundOrder} from "../types/round_order";
import {
  GetPartitionKnockoutJsonData,
  PartitionGroupJsonData,
  PartitionKnockoutTitleData,
  PartitionRoundOrder
} from "./partition";
import {RepechageGroupJsonData, RepechageRoundOrder} from "./repechage";

export interface Part {
  name: string,
  type: 'group' | 'knockout',
  group: '' | 'A' | 'B',
  jsonData: any,
  extraTitleData: any,
  roundOrder: RoundOrder,
}

export interface Zone {
  id: number,
  name: string,
  disabled: boolean,
  parts: Part[],
}

export const Zones: Zone[] = [
  {
    id: 498, name: '东部赛区', disabled: false,
    parts: [
      {
        name: 'A组',
        type: 'group',
        group: 'A',
        jsonData: PartitionGroupJsonData,
        extraTitleData: null,
        roundOrder: PartitionRoundOrder
      },
      {
        name: 'B组',
        type: 'group',
        group: 'B',
        jsonData: PartitionGroupJsonData,
        extraTitleData: null,
        roundOrder: PartitionRoundOrder
      },
      {
        name: '淘汰赛',
        type: 'knockout',
        group: '',
        jsonData: GetPartitionKnockoutJsonData(498),
        extraTitleData: PartitionKnockoutTitleData,
        roundOrder: PartitionRoundOrder
      }
    ]
  },
  {
    id: 499, name: '中部赛区', disabled: false,
    parts: [
      {
        name: 'A组',
        type: 'group',
        group: 'A',
        jsonData: PartitionGroupJsonData,
        extraTitleData: null,
        roundOrder: PartitionRoundOrder
      },
      {
        name: 'B组',
        type: 'group',
        group: 'B',
        jsonData: PartitionGroupJsonData,
        extraTitleData: null,
        roundOrder: PartitionRoundOrder
      },
      {
        name: '淘汰赛',
        type: 'knockout',
        group: '',
        jsonData: GetPartitionKnockoutJsonData(499),
        extraTitleData: PartitionKnockoutTitleData,
        roundOrder: PartitionRoundOrder
      }
    ]
  },
  {
    id: 500, name: '南部赛区', disabled: false,
    parts: [
      {
        name: 'A组',
        type: 'group',
        group: 'A',
        jsonData: PartitionGroupJsonData,
        extraTitleData: null,
        roundOrder: PartitionRoundOrder
      },
      {
        name: 'B组',
        type: 'group',
        group: 'B',
        jsonData: PartitionGroupJsonData,
        extraTitleData: null,
        roundOrder: PartitionRoundOrder
      },
      {
        name: '淘汰赛',
        type: 'knockout',
        group: '',
        jsonData: GetPartitionKnockoutJsonData(500),
        extraTitleData: PartitionKnockoutTitleData,
        roundOrder: PartitionRoundOrder
      }
    ]
  },
  {
    id: 524, name: '国际赛区&复活赛第一赛段', disabled: false,
    parts: [
      {
        name: 'A组',
        type: 'group',
        group: 'A',
        jsonData: RepechageGroupJsonData,
        extraTitleData: null,
        roundOrder: RepechageRoundOrder
      },
      {
        name: 'B组',
        type: 'group',
        group: 'B',
        jsonData: RepechageGroupJsonData,
        extraTitleData: null,
        roundOrder: RepechageRoundOrder
      },
    ]
  },
  {
    id: 525, name: '复活赛第二赛段', disabled: false,
    parts: []
  },
  {
    id: 526, name: '全国赛', disabled: false,
    parts: []
  },
]
