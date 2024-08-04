export type GroupType = 'A' | 'B' | 'C' | 'QW' | 'Knockout';

export interface ZoneJsonData {
  rootId: string;
  nodes: ZoneNodeJsonData[];
  lines: ZoneLineJsonData[];
}

export interface ZoneNodeJsonData {
  id: string;
  text: string;
  x: number;
  y: number;
  data: ZoneNodeData;
}

export interface ZoneLineJsonData {
  from: string;
  to: string;
  lineShape?: number;
}

export interface ZoneNodeData {
  title: string;
  titleColor: string;
  titleImage?: string;
  borderColor?: string;
  collegeNameColor?: string;
  rankColor?: string;
  round: number;
  type: 'match' | 'promote' | 'eliminate' | 'groupLoop';
  zones: ZoneZoneData[];
}

export interface ZoneZoneData {
  matches: number[];
  winners: number[];
  losers: number[];
  text: string[];
  forecasts?: ZoneForecastData[];
  group?: 'Q' | 'W';
  groupRank?: number[];
}

export interface ZoneForecastData {
  red: number;
  blue: number;
}

export interface TitleData {
  left: number,
  top: number,
  title: string,
  image: string,
}

export interface ImageData {
  id: number,
  left: number,
  top: number,
  image: string,
}
