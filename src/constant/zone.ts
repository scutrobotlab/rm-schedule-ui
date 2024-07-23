import {RoundOrder} from "../types/round_order";
import {
  GetGroupZoneKnockoutJsonData,
  GroupZoneGroupJsonData,
  GroupZoneKnockoutTitleData,
  GroupZoneRoundOrder
} from "./group_zone";
import {
  RevivalZoneGroupJsonData,
  RevivalZoneRoundOrder
} from "./revival_zone";
import {GroupType, TitleData, ImageData, ZoneJsonData} from "../types/zone";
import {RevivalZone2GroupJsonData, RevivalZone2ImageData, RevivalZone2RoundOrder} from "./revival_zone2";
import {
  FinalZoneKnockoutJsonData,
  FinalZoneKnockoutLoserJsonData,
  FinalZoneKnockoutLoserTitleData,
  FinalZoneKnockoutTitleData
} from "./final_zone";

export interface Part {
  name: string,
  type: 'group' | 'knockout',
  group: GroupType,
  jsonData: ZoneJsonData,
  roundOrder?: RoundOrder,
  extraTitleData?: TitleData[],
  extraImageData?: ImageData[],
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
        roundOrder: GroupZoneRoundOrder
      },
      {
        name: 'B组',
        type: 'group',
        group: 'B',
        jsonData: GroupZoneGroupJsonData,
        roundOrder: GroupZoneRoundOrder
      },
      {
        name: '淘汰赛',
        type: 'knockout',
        group: 'Knockout',
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
        roundOrder: GroupZoneRoundOrder
      },
      {
        name: 'B组',
        type: 'group',
        group: 'B',
        jsonData: GroupZoneGroupJsonData,
        roundOrder: GroupZoneRoundOrder
      },
      {
        name: '淘汰赛',
        type: 'knockout',
        group: 'Knockout',
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
        roundOrder: GroupZoneRoundOrder
      },
      {
        name: 'B组',
        type: 'group',
        group: 'B',
        jsonData: GroupZoneGroupJsonData,
        roundOrder: GroupZoneRoundOrder
      },
      {
        name: '淘汰赛',
        type: 'knockout',
        group: 'Knockout',
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
        roundOrder: RevivalZoneRoundOrder
      },
      {
        name: 'B组',
        type: 'group',
        group: 'B',
        jsonData: RevivalZoneGroupJsonData,
        roundOrder: RevivalZoneRoundOrder
      },
    ]
  },
  {
    id: 525, name: '复活赛第二赛段', disabled: false,
    parts: [
      {
        name: 'C组',
        type: 'group',
        group: 'C',
        jsonData: RevivalZone2GroupJsonData,
        roundOrder: RevivalZone2RoundOrder,
        extraImageData: RevivalZone2ImageData,
      },
    ]
  },
  {
    id: 526, name: '全国赛', disabled: false,
    parts: [
      {
        name: '淘汰赛',
        type: 'knockout',
        group: 'Knockout',
        jsonData: FinalZoneKnockoutJsonData,
        extraTitleData: FinalZoneKnockoutTitleData,
        roundOrder: null, // TODO
      },
      {
        name: '败者组',
        type: 'knockout',
        group: 'Knockout',
        jsonData: FinalZoneKnockoutLoserJsonData,
        extraTitleData: FinalZoneKnockoutLoserTitleData,
        roundOrder: null, // TODO
      }
    ]
  },
]
