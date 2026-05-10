import { defineStore } from "pinia";
import { ScheduleData, MatchNode, ZoneNode, Player } from "../types/schedule";
import axios, { AxiosResponse } from "axios";
import { GroupRankInfo } from "../types/group_rank_info";
import { MpMatch, MpMatchRoot } from "../types/mp_match";
import { BilibiliReplay } from "../types/bilibili_replay";
import { TeamInfo } from "../types/team_info";

export interface Schedule {
  data: ScheduleData;
}

export const usePromotionStore = defineStore("promotion", {
  state: () => ({
    season: 0 as number,
    zoneId: 0 as number,
    schedule: {} as Schedule,
    groupRank: {} as GroupRankInfo,
    mpMatchMap: new Map<string, MpMatch>(),
    selectedPlayer: null as Player | null,
    selectedMatch: null as MatchNode | null,
    suggestionEnabled: false as boolean,
    bilibiliReplay: null as BilibiliReplay | null,
    teamInfo: null as TeamInfo | null,
  }),
  getters: {
    backgroundImageOpacity(state): number {
      switch (state.season) {
        case 2024:
          if (state.zoneId >= 524) {
            // 全国赛
            return 1.0;
          } else {
            // 区域赛
            return 0.5;
          }
        case 2025:
        case 2026:
          return 0.5;
      }

      return 1.0;
    },
    backgroundImage(state): string {
      const isMobile = window.innerWidth < window.innerHeight;
      switch (state.season) {
        case 2024:
          if (state.zoneId >= 524) {
            // 全国赛
            return "/background/2024_final.png";
          } else {
            // 区域赛
            return "/background/2024_group.jpg";
          }
        case 2025:
          if (state.zoneId >= 570) {
            // 全国赛
            return "/background/2025_final.png";
          } else {
            // 区域赛
            if (isMobile) return "/background/2025_group_mobile.png";
            else return "/background/2025_group.jpg";
          }
        case 2026:
          // 区域赛
          return "/background/2026_group.jpg";
      }

      return "/background/2024_final.png";
    },
  },
  actions: {
    async updateSchedule() {
      await axios({
        method: "GET",
        url: "/api/schedule",
        params: {
          season: this.season,
        },
      }).then(async (response: AxiosResponse<Schedule>) => {
        this.schedule = response.data;
      });
    },
    async updateGroupRank() {
      await axios({
        method: "GET",
        url: "/api/group_rank_info",
        params: {
          season: this.season,
        },
      }).then((response: AxiosResponse<any>) => {
        this.groupRank = response.data;
      });
    },
    async updateMpMatch(matchIds: number[]) {
      if (matchIds.length === 0) return;
      axios({
        method: "GET",
        url: "/api/mp/match",
        params: {
          season: this.season,
          match_ids: matchIds.join(","),
        },
      }).then((res: AxiosResponse<MpMatchRoot>) => {
        res.data.list.forEach((match: MpMatch) => {
          this.mpMatchMap.set(match.matchId.toString(), match);
        });
      });
    },
    getZone(zoneId: number): ZoneNode {
      return this.schedule.data.event.zones.nodes.find(
        (zone: ZoneNode) => zone.id == zoneId.toString()
      );
    },
    getCurrentZone(): ZoneNode {
      return this.getZone(this.zoneId);
    },
    getMatchByOrder(
      zoneId: number,
      orderNumber: number,
      planGameCount: number = 3
    ): MatchNode | undefined {
      const zone = this.getZone(zoneId);
      let node = zone.groupMatches.nodes.find(
        (match: MatchNode) =>
          match.orderNumber == orderNumber &&
          match.planGameCount == planGameCount
      );
      if (node) return node;
      node = zone.knockoutMatches.nodes.find(
        (match: MatchNode) => match.orderNumber == orderNumber
      );
      if (node) return node;
      return undefined;
    },
    getMpMatch(matchId: string): MpMatch {
      return this.mpMatchMap.get(matchId) as MpMatch;
    },
  },
});
