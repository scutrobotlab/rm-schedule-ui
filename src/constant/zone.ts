import {RoundOrder} from "../types/round_order";
import {
  GetGroupZoneKnockoutJsonData,
  GroupZoneGroupJsonData,
  GroupZoneKnockoutTitleData,
  GroupZoneRoundOrder
} from "./group_zone";
import {RevivalZoneGroupJsonData, RevivalZoneRoundOrder} from "./revival_zone";

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
        jsonData: GroupZoneGroupJsonData,
        extraTitleData: null,
        roundOrder: GroupZoneRoundOrder
      },
      {
        name: 'B组',
        type: 'group',
        group: 'B',
        jsonData: GroupZoneGroupJsonData,
        extraTitleData: null,
        roundOrder: GroupZoneRoundOrder
      },
      {
        name: '淘汰赛',
        type: 'knockout',
        group: '',
        jsonData: GetGroupZoneKnockoutJsonData(498),
        extraTitleData: GroupZoneKnockoutTitleData,
        roundOrder: GroupZoneRoundOrder
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
        jsonData: GroupZoneGroupJsonData,
        extraTitleData: null,
        roundOrder: GroupZoneRoundOrder
      },
      {
        name: 'B组',
        type: 'group',
        group: 'B',
        jsonData: GroupZoneGroupJsonData,
        extraTitleData: null,
        roundOrder: GroupZoneRoundOrder
      },
      {
        name: '淘汰赛',
        type: 'knockout',
        group: '',
        jsonData: GetGroupZoneKnockoutJsonData(499),
        extraTitleData: GroupZoneKnockoutTitleData,
        roundOrder: GroupZoneRoundOrder
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
        jsonData: GroupZoneGroupJsonData,
        extraTitleData: null,
        roundOrder: GroupZoneRoundOrder
      },
      {
        name: 'B组',
        type: 'group',
        group: 'B',
        jsonData: GroupZoneGroupJsonData,
        extraTitleData: null,
        roundOrder: GroupZoneRoundOrder
      },
      {
        name: '淘汰赛',
        type: 'knockout',
        group: '',
        jsonData: GetGroupZoneKnockoutJsonData(500),
        extraTitleData: GroupZoneKnockoutTitleData,
        roundOrder: GroupZoneRoundOrder
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
        jsonData: RevivalZoneGroupJsonData,
        extraTitleData: null,
        roundOrder: RevivalZoneRoundOrder
      },
      {
        name: 'B组',
        type: 'group',
        group: 'B',
        jsonData: RevivalZoneGroupJsonData,
        extraTitleData: null,
        roundOrder: RevivalZoneRoundOrder
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
