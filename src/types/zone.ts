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
}

export interface ZoneNodeData {
  title: string;
  titleColor: string;
  titleImage: string;
  borderColor: string;
  collegeNameColor?: string;
  rankColor?: string;
  round: number;
  type: string;
  zones: ZoneZoneData[];
}

export interface ZoneZoneData {
  matches: number[];
  winners: number[];
  losers: number[];
  text: string[];
  forecasts?: ZoneForecastData[];
}

export interface ZoneForecastData {
  red: number;
  blue: number;
}
