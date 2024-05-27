export interface RankListItem {
  rankScoreItem: RankScoreItem
  completeForm: CompleteForm
}

export interface RankScoreItem {
  rank: number
  schoolChinese: string
  schoolEnglish: string
  score: number
}

export interface CompleteForm {
  rank: number
  school: string
  team: string
  score: number
  initialCoinDocument: number
  initialCoinTechnology: number
  initialCoinTotal: number
}
