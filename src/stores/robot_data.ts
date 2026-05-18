import { defineStore } from "pinia";
import { Robot, RobotData, RobotDisplay } from "../types/robot_data";
import axios, { AxiosResponse } from "axios";

export const useRobotDataStore = defineStore("robot_data", {
  state: () => ({
    robotData: {} as RobotData,
    avgRobotData: [] as Robot[],
    maxRobotData: [] as Robot[],
    existRobotDataSet: new Set<string>(), // 存在机器人数据的集合
    robotDisplayMapRegional: new Map<string, RobotDisplay>(),
    robotDisplayMapRepechage: new Map<string, RobotDisplay>(),
    robotDisplayMapFinals: new Map<string, RobotDisplay>(),
    avgRobotDisplay: {} as RobotDisplay,
    maxRobotDisplay: {} as RobotDisplay,
  }),
  getters: {},
  actions: {
    async updateRobotData(season: number) {
      await axios({
        method: "GET",
        url: "/api/robot_data",
        params: {
          season: season,
        },
      }).then((response: AxiosResponse<any>) => {
        const newRobotData: RobotData = response.data;
        const newSumRobotData: Robot[] = [];
        const newMaxRobotData: Robot[] = [];
        const newRobotDisplayMapRegional = new Map<string, RobotDisplay>();
        const newRobotDisplayMapRepechage = new Map<string, RobotDisplay>();
        const newRobotDisplayMapFinals = new Map<string, RobotDisplay>();
        const newExistRobotDataSet = new Set<string>();
        const IgnoredKeys = ["id", "type", "robotNumber"] // 计算时忽略的键
        this.robotData = newRobotData;
        let teamCount = 0;
        for (const zone of newRobotData.zones) {
          for (const team of zone.teams) {
            newExistRobotDataSet.add(team.collegeName)
            // 国赛复活赛与区域赛分开计算，这里是临时解决方案，避免未开赛时全0数据覆盖了区域赛数据
            let avgHurtSum = 0
            for (const robot of team.robots) {
              avgHurtSum += robot.eagHurt
            }
            if (avgHurtSum === 0) {
              continue
            }

            teamCount++;
            for (const robot of team.robots) {
              robot.eaKDA = this.fixKDA(robot.eaKDA);
              robot._eaKDAScore = this.getEaKDAScore(robot);
              if (season === 2026) {
                robot._etDartWeightedScore2026 = this.getDartWeightedScore2026(robot);
              } else {
                robot._reciprocalOfAvgMineTime = this.getReciprocalOfAvgMineTime(robot);
                robot._etDartCnt = this.getDartHitCnt(robot);
                robot._etDartWeightedScore = this.getDartWeightedScore(robot);
              }
              newSumRobotData.find((r: Robot, index: number) => {
                if (r.type === robot.type) {
                  Object.keys(robot).filter(key => !IgnoredKeys.includes(key)).forEach(key => {
                    if (typeof robot[key] === "number") {
                      newSumRobotData[index][key] += robot[key];
                    }
                  })
                  return r;
                }
              }) || newSumRobotData.push({ ...robot });
              newMaxRobotData.find((r: Robot, index: number) => {
                if (r.type === robot.type) {
                  Object.keys(robot).filter(key => !IgnoredKeys.includes(key)).forEach(key => {
                    if (typeof robot[key] === "number") {
                      newMaxRobotData[index][key] = Math.max(
                        newMaxRobotData[index][key],
                        robot[key]
                      );
                    }
                  })
                  return r;
                }
              }) || newMaxRobotData.push({ ...robot });
            }
            const currentZoneId = Number(zone.zoneId)
            let targetMap = newRobotDisplayMapRegional
            if (season === 2025) {
              if (currentZoneId <= 567) targetMap = newRobotDisplayMapRegional
              else if (currentZoneId <= 571) targetMap = newRobotDisplayMapRepechage
              else if (currentZoneId === 572) targetMap = newRobotDisplayMapFinals
            } else if (zone.zoneName.includes("全国")) {
              targetMap = newRobotDisplayMapFinals
            } else if (zone.zoneName.includes("复活")) {
              targetMap = newRobotDisplayMapRepechage
            }
            targetMap.set(team.collegeName, this.extractDisplayData(team.robots, season));
          }
        }
        const newAvgRobotData: Robot[] = [];
        newSumRobotData.forEach((r: Robot) => {
          const avgRobot: Robot = {
            id: r.id,
            type: r.type,
            robotNumber: r.robotNumber,
          } as Robot;
          Object.keys(r).filter(key => !IgnoredKeys.includes(key)).forEach(key => {
            if (typeof r[key] === "number") {
              avgRobot[key] = Math.round((100 * r[key]) / teamCount) / 100;
            } else {
              avgRobot[key] = r[key];
            }
          })
          newAvgRobotData.push(avgRobot);
        })
        this.avgRobotData = newAvgRobotData;
        this.avgRobotDisplay = this.extractDisplayData(newAvgRobotData, season)
        this.maxRobotData = newMaxRobotData;
        this.maxRobotDisplay = this.extractDisplayData(newMaxRobotData, season)
        this.robotDisplayMapRegional = newRobotDisplayMapRegional;
        this.robotDisplayMapRepechage = newRobotDisplayMapRepechage;
        this.robotDisplayMapFinals = newRobotDisplayMapFinals;
        this.existRobotDataSet = newExistRobotDataSet;
      });
    },
    fixKDA(kda: string): string {
      const [kills, deaths, assists] = kda.split('/').map(part =>
        Number(parseFloat(part).toFixed(1))
      );
      return `${kills}/${deaths}/${assists}`;
    },
    getEaKDAScore(robot: Robot): number {
      const [kills, deaths, assists] = robot.eaKDA.split('/').map(part =>
        Number(parseFloat(part).toFixed(1))
      );
      return (kills + assists) / Math.max(deaths, 1);
    },
    getReciprocalOfAvgMineTime(robot: Robot): number {
      if (robot.avgMineTime === 0) {
        return 0;
      }
      return 1 / robot.avgMineTime
    },
    getDartHitCnt(robot: Robot): number {
      return robot.etDartOutpostCnt + robot.etDartFixedCnt + robot.etDartRDFixCnt + robot.etDartRDMoveCnt;
    },
    getDartWeightedScore(robot: Robot): number {
      // 2025 及之前公式
      return robot.etDartOutpostCnt +
        5 * robot.etDartFixedCnt +
        10 * robot.etDartRDFixCnt +
        25 * robot.etDartRDMoveCnt;
    },
    getDartWeightedScore2026(robot: Robot): number {
      // 2026 公式：末端移动目标 200 分，随机移动目标 100 分
      return robot.etDartOutpostCnt +
        5 * robot.etDartFixedCnt +
        10 * robot.etDartRDFixCnt +
        100 * robot.etDartRDMoveCnt +
        200 * (robot.etDartEndMoveCnt ?? 0);
    },
    extractDisplayData(robots: Robot[], season: number): RobotDisplay {
      const result = {} as RobotDisplay
      const is2026 = season === 2026
      for (const robot of robots) {
        switch (robot.type) {
          case "Hero":
            result.heroKeyDamage = robot.gkDamage
            result.heroBigHitRate = robot.eaBigHitRate
            result.heroSnipeCnt = robot.eaSnipeCnt
            break
          case "Sapper":
            // 2026 使用装配经济；2025 及之前使用兑换经济
            result.engineerEco = is2026 ? robot.eaAssembleEcon : robot.eaExchangeEcon
            break
          case "Infantry":
            result.standardDamage = robot.eagHurt
            break
          case "Airplane":
            result.aerialDamage = robot.eagHurt
            break
          case "Guard":
            result.sentryDamage = robot.eagHurt
            break
          case "Dart":
            // 2026 使用新加权公式；2025 及之前使用旧公式
            result.dartWeightedScore = is2026 ? robot._etDartWeightedScore2026 : robot._etDartWeightedScore
            break
          case "Radar":
            result.radarMarkDuration = robot.eaRadarMarkerTime
            break
        }
      }
      return result
    }
  },
})
