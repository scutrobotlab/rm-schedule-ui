<script setup lang="ts">

import { computed } from "vue";
import { Team } from "../types/robot_data";
import { useRobotDataStore } from "../stores/robot_data";
import RobotDataProgress from "./RobotDataProgress.vue";

interface Props {
  robotDataLeft: Team
  robotDataRight?: Team
  season?: number
}

const props = defineProps<Props>()
const robotDataStore = useRobotDataStore();
const robotDataLeft = computed(() => props.robotDataLeft)
const robotDataRight = computed(() => props.robotDataRight)

interface DataField {
  th: string; // 表头
  td: string; // 数据字段
  tdShow: string; // 显示字段
  hint?: string | unknown; // 提示
}

interface RobotTypeConfig {
  type: string; // 机器人类型中文名
  dataFields: DataField[];
}

type SeasonRobotDataMap = { [robotType: string]: RobotTypeConfig }

// ── 2025 冻结基线，禁止修改 ─────────────────────────────────────
const ROBOT_DATA_MAP_2025: SeasonRobotDataMap = {
  "Hero": {
    type: "英雄",
    dataFields: [
      { th: "局均42mm弹丸命中率(%)", td: "eaBigHitRate", tdShow: "eaBigHitRate" },
      { th: "局均部署命中数", td: "eaSnipeCnt", tdShow: "eaSnipeCnt" },
      { th: "局均关键伤害", td: "gkDamage", tdShow: "gkDamage" },
      { th: "局均KDA", td: "_eaKDAScore", tdShow: "eaKDA", hint: '排名依据 (Kill + Assist) / Max(Death, 1)' },
    ]
  },
  "Infantry": {
    type: "步兵",
    dataFields: [
      { th: "局均17mm弹丸命中率(%)", td: "eaSmallHitRate", tdShow: "eaSmallHitRate" },
      { th: "局均总伤害", td: "eagHurt", tdShow: "eagHurt" },
      { th: "局均关键伤害", td: "gkDamage", tdShow: "gkDamage" },
      { th: "大能量机关平均激活环数", td: "matchLargeEnergyActRoundsAvg", tdShow: "matchLargeEnergyActRoundsAvg" },
      { th: "局均KDA", td: "_eaKDAScore", tdShow: "eaKDA", hint: '排名依据 (Kill + Assist) / Max(Death, 1)' },
    ]
  },
  "Sapper": {
    type: "工程",
    dataFields: [
      { th: "局均兑换难度", td: "avgMineDiff", tdShow: "avgMineDiff" },
      { th: "局均兑换时间", td: "_reciprocalOfAvgMineTime", tdShow: "avgMineTime", hint: '排名依据 1 / 局均兑换时间' },
      { th: "局均兑换经济", td: "eaExchangeEcon", tdShow: "eaExchangeEcon" },
      { th: "局均KDA", td: "_eaKDAScore", tdShow: "eaKDA", hint: '排名依据 (Kill + Assist) / Max(Death, 1)' },
    ]
  },
  "Airplane": {
    type: "无人机",
    dataFields: [
      { th: "局均17mm弹丸命中率(%)", td: "eaSmallHitRate", tdShow: "eaSmallHitRate" },
      { th: "局均发弹量", td: "avgShootNum", tdShow: "avgShootNum" },
      { th: "局均总伤害", td: "eagHurt", tdShow: "eagHurt" },
      { th: "局均关键伤害", td: "gkDamage", tdShow: "gkDamage" },
      { th: "局均KDA", td: "_eaKDAScore", tdShow: "eaKDA", hint: '排名依据 (Kill + Assist) / Max(Death, 1)' },
    ]
  },
  "Guard": {
    type: "哨兵",
    dataFields: [
      { th: "局均17mm弹丸命中率(%)", td: "eaSmallHitRate", tdShow: "eaSmallHitRate" },
      { th: "局均总伤害", td: "eagHurt", tdShow: "eagHurt" },
      { th: "局均关键伤害", td: "gkDamage", tdShow: "gkDamage" },
      { th: "局均KDA", td: "_eaKDAScore", tdShow: "eaKDA", hint: '排名依据 (Kill + Assist) / Max(Death, 1)' },
    ]
  },
  "Dart": {
    type: "飞镖",
    dataFields: [
      { th: "累计命中前哨站数", td: "etDartOutpostCnt", tdShow: "etDartOutpostCnt" },
      { th: "累计命中基地固定目标数", td: "etDartFixedCnt", tdShow: "etDartFixedCnt" },
      { th: "累计命中基地随机固定目标数", td: "etDartRDFixCnt", tdShow: "etDartRDFixCnt" },
      { th: "累计命中基地随机移动目标数", td: "etDartRDMoveCnt", tdShow: "etDartRDMoveCnt" },
      { th: "局均KDA", td: "_eaKDAScore", tdShow: "eaKDA", hint: '排名依据 (Kill + Assist) / Max(Death, 1)' },
    ]
  },
  "Radar": {
    type: "雷达",
    dataFields: [
      { th: "局均额外伤害", td: "eaRadarDebuffDmg", tdShow: "eaRadarDebuffDmg" },
      { th: "局均易伤时间", td: "eaRadarMarkerTime", tdShow: "eaRadarMarkerTime" },
    ]
  },
}

// ── 2026 独立配置，不复用 2025 字段定义 ────────────────────────
const ROBOT_DATA_MAP_2026: SeasonRobotDataMap = {
  "Hero": {
    type: "英雄",
    dataFields: [
      { th: "局均42mm弹丸命中率(%)", td: "eaBigHitRate", tdShow: "eaBigHitRate" },
      { th: "局均部署命中数", td: "eaSnipeCnt", tdShow: "eaSnipeCnt" },
      { th: "局均关键伤害", td: "gkDamage", tdShow: "gkDamage" },
      { th: "局均KDA", td: "_eaKDAScore", tdShow: "eaKDA", hint: '排名依据 (Kill + Assist) / Max(Death, 1)' },
    ]
  },
  "Infantry": {
    type: "步兵",
    dataFields: [
      { th: "局均17mm弹丸命中率(%)", td: "eaSmallHitRate", tdShow: "eaSmallHitRate" },
      { th: "局均总伤害", td: "eagHurt", tdShow: "eagHurt" },
      { th: "局均关键伤害", td: "gkDamage", tdShow: "gkDamage" },
      { th: "大能量机关平均激活环数", td: "matchLargeEnergyActRoundsAvg", tdShow: "matchLargeEnergyActRoundsAvg" },
      { th: "局均KDA", td: "_eaKDAScore", tdShow: "eaKDA", hint: '排名依据 (Kill + Assist) / Max(Death, 1)' },
    ]
  },
  "Sapper": {
    type: "工程",
    dataFields: [
      { th: "次均装配难度", td: "avgAssembleDiff", tdShow: "avgAssembleDiff" },
      { th: "局均成功装配次数", td: "eaAssembleSuccCnt", tdShow: "eaAssembleSuccCnt" },
      { th: "局均装配经济", td: "eaAssembleEcon", tdShow: "eaAssembleEcon" },
      { th: "局均KDA", td: "_eaKDAScore", tdShow: "eaKDA", hint: '排名依据 (Kill + Assist) / Max(Death, 1)' },
    ]
  },
  "Airplane": {
    type: "无人机",
    dataFields: [
      { th: "局均17mm弹丸命中率(%)", td: "eaSmallHitRate", tdShow: "eaSmallHitRate" },
      { th: "局均发弹量", td: "avgShootNum", tdShow: "avgShootNum" },
      { th: "局均总伤害", td: "eagHurt", tdShow: "eagHurt" },
      { th: "局均关键伤害", td: "gkDamage", tdShow: "gkDamage" },
      { th: "局均KDA", td: "_eaKDAScore", tdShow: "eaKDA", hint: '排名依据 (Kill + Assist) / Max(Death, 1)' },
    ]
  },
  "Guard": {
    type: "哨兵",
    dataFields: [
      { th: "局均17mm弹丸命中率(%)", td: "eaSmallHitRate", tdShow: "eaSmallHitRate" },
      { th: "局均总伤害", td: "eagHurt", tdShow: "eagHurt" },
      { th: "局均关键伤害", td: "gkDamage", tdShow: "gkDamage" },
      { th: "局均KDA", td: "_eaKDAScore", tdShow: "eaKDA", hint: '排名依据 (Kill + Assist) / Max(Death, 1)' },
    ]
  },
  "Dart": {
    type: "飞镖",
    dataFields: [
      { th: "累计命中前哨站数", td: "etDartOutpostCnt", tdShow: "etDartOutpostCnt" },
      { th: "累计命中基地固定目标数", td: "etDartFixedCnt", tdShow: "etDartFixedCnt" },
      { th: "累计命中基地随机固定目标数", td: "etDartRDFixCnt", tdShow: "etDartRDFixCnt" },
      { th: "累计命中基地随机移动目标数", td: "etDartRDMoveCnt", tdShow: "etDartRDMoveCnt" },
      { th: "累计命中基地末端移动目标数", td: "etDartEndMoveCnt", tdShow: "etDartEndMoveCnt" },
    ]
  },
  "Radar": {
    type: "雷达",
    dataFields: [
      { th: "局均易伤时间", td: "eaRadarMarkerTime", tdShow: "eaRadarMarkerTime" },
      { th: "局均解析成功次数", td: "eaRadarParseSuccCnt", tdShow: "eaRadarParseSuccCnt" },
      { th: "局均反制时间", td: "eaRadarCounterTime", tdShow: "eaRadarCounterTime" },
    ]
  },
}

// ── 按赛季注册表，未来 2027 只新增一个条目即可 ──────────────────
// 未注册赛季 fallback 到 ROBOT_DATA_MAP_2025（兼容兜底，不代表字段规则相同）
const ROBOT_DATA_MAP_BY_SEASON: { [season: number]: SeasonRobotDataMap } = {
  2025: ROBOT_DATA_MAP_2025,
  2026: ROBOT_DATA_MAP_2026,
}

function getRobotDataMap(season?: number): SeasonRobotDataMap {
  if (season !== undefined && ROBOT_DATA_MAP_BY_SEASON[season]) {
    return ROBOT_DATA_MAP_BY_SEASON[season]
  }
  return ROBOT_DATA_MAP_2025
}

const robotDataMap = computed(() => getRobotDataMap(props.season))

function maxRobotData(type: string, field: string): number {
  return robotDataStore.maxRobotData.find((n) => n.type === type)![field]
}

const nameWidth = computed(() => robotDataRight.value ? 'width: 16%' : 'width: 35%')
const valueWidth = computed(() => robotDataRight.value ? 'width: 12%' : 'width: 15%')
const progressWidth = computed(() => robotDataRight.value ? 'width: 30%' : 'width: 50%')
</script>

<template>
  <div v-if="robotDataLeft">
    <v-chip class="mb-2" color="info" variant="flat" label>
      <h3>机器人数据</h3>
    </v-chip>

    <div v-for="(robotLeft, index) in robotDataLeft.robots"
         :key="robotLeft.robotNumber">
      <div v-if="robotDataMap[robotLeft.type]" class="mt-2">
        <v-table density="compact">
          <thead>
          <tr>
            <v-chip color="info" variant="tonal" label size="small">
              <h3>{{ robotDataMap[robotLeft.type].type }}</h3>
            </v-chip>
          </tr>
          </thead>
          <tbody>
          <tr v-for="field in robotDataMap[robotLeft.type].dataFields"
              :key="field.td">
            <td :style="nameWidth">
              <span>{{ field.th }}</span>
              <v-tooltip v-if="field.hint" bottom>
                <template #activator="{ props }">
                  <v-icon v-bind="props" class="ml-1">mdi-information</v-icon>
                </template>
                <span>{{ field.hint || '无提示信息' }}</span>
              </v-tooltip>
            </td>
            <td :style="valueWidth"><span>{{ robotLeft[field.tdShow] }}</span></td>
            <td :style="progressWidth">
              <RobotDataProgress
                :value="robotLeft[field.td]"
                :max-value="maxRobotData(robotLeft.type, field.td)"
                :disabled="robotDataRight ? robotLeft[field.td] < robotDataRight.robots[index][field.td] : false"
              />
            </td>
            <td v-if="robotDataRight" :style="progressWidth">
              <RobotDataProgress
                :value="robotDataRight.robots[index][field.td]"
                :max-value="maxRobotData(robotLeft.type, field.td)"
                :disabled="robotDataRight.robots[index][field.td] < robotLeft[field.td]"
              />
            </td>
            <td v-if="robotDataRight" :style="valueWidth">
              <span>{{ robotDataRight.robots[index][field.tdShow] }}</span>
            </td>
          </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
