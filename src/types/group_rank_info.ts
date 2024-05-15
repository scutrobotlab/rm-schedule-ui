export interface GroupRankInfo {
  zones: GroupRankInfoZone[]
}

export interface GroupRankInfoZone {
  zoneName: string
  zoneId: string
  groups: Group[]
}

export interface Group {
  groupName: string
  groupPlayers: GroupPlayer[][]
}

export interface GroupPlayer {
  itemName: string
  itemValue: any
}
