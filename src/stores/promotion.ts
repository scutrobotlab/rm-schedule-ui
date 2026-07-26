import { defineStore } from "pinia";
import { ScheduleData, MatchNode, ZoneNode, Player } from "../types/schedule";
import axios, { AxiosResponse } from "axios";
import { GroupRankInfo } from "../types/group_rank_info";
import { MpMatch, MpMatchRoot } from "../types/mp_match";
import { BilibiliReplay } from "../types/bilibili_replay";
import { TeamInfo } from "../types/team_info";
import type { TeamAbbreviation } from "../utils/bracket_density";

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
    teamAbbreviations: {} as Record<string, TeamAbbreviation>,
    teamAbbreviationsLoaded: false as boolean,
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
            return "/background/2025_final.jpg";
          } else {
            // 区域赛
            if (isMobile) return "/background/2025_group_mobile.png";
            else return "/background/2025_group.jpg";
          }
        case 2026:
          if (state.zoneId >= 617) {
            // 复活赛 / 全国赛
            return "/background/2026_final.jpg";
          } else {
            // 区域赛
            if (isMobile) return "/background/2026_group_mobile.jpg";
            else return "/background/2026_group.jpg";
          }
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
    async updateTeamAbbreviations() {
      if (this.teamAbbreviationsLoaded) return;
      this.teamAbbreviationsLoaded = true;
      const response: AxiosResponse<Record<string, TeamAbbreviation>> = await axios({
        method: "GET",
        url: "/api/team_abbreviations",
      });
      this.teamAbbreviations = response.data;
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
    findPlayerById(playerId: string): Player | undefined {
      const zone = this.schedule.data?.event?.zones?.nodes?.find(
        (item: ZoneNode) => item.id == this.zoneId.toString()
      );
      if (!zone) return undefined;

      for (const group of zone.groups.nodes) {
        const player = group.players.nodes.find((item) => item.id === playerId);
        if (player) return player;
      }

      for (const match of [...zone.groupMatches.nodes, ...zone.knockoutMatches.nodes]) {
        if (match.redSide.player?.id === playerId) return match.redSide.player;
        if (match.blueSide.player?.id === playerId) return match.blueSide.player;
      }
      return undefined;
    },
    toggleSelectedPlayerById(playerId: string): boolean {
      if (this.selectedPlayer?.id === playerId) {
        this.selectedPlayer = null;
        return true;
      }

      const player = this.findPlayerById(playerId);
      if (!player) return false;
      this.selectedPlayer = player;
      return true;
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
