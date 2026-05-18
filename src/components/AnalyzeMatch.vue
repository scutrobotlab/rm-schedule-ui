<script setup lang="ts">
import { MatchNode, Player } from "../types/schedule";
import { usePromotionStore } from "../stores/promotion";
import { useRobotDataStore } from "../stores/robot_data";
import { computed, ref } from "vue";
import { RankListItem } from "../types/rank";
import axios from "axios";
import TeamHeader from "./TeamHeader.vue";
import RobotDataTable from "./RobotDataTable.vue";
import { Team } from "../types/robot_data";
import RobotDataRadar from "./RobotDataRadar.vue";
import HistoryMatch from "./HistoryMatch.vue";

interface Props {
  zoneId: number,
  match: MatchNode | null,
}

const props = defineProps<Props>()
const redPlayer = props.match.redSide.player
const bluePlayer = props.match.blueSide.player

if (!redPlayer) {
  throw new Error("Red player is required");
}
if (!bluePlayer) {
  throw new Error("Blue player is required");
}

const promotionStore = usePromotionStore();
const robotDataStore = useRobotDataStore();

const loading = ref(true)

const fetchTeamRank = async (collegeName: string): Promise<RankListItem> => {
  const rankRef = ref<RankListItem | null>(null);
  const resp = await axios({
    method: 'GET',
    url: '/api/rank',
    params: {
      season: promotionStore.season,
      school_name: collegeName,
    }
  });
  rankRef.value = resp.data;
  return rankRef.value;
};

const redRank = ref<RankListItem | null>(null);
const blueRank = ref<RankListItem | null>(null);
const updateRedRank = fetchTeamRank(redPlayer.team.collegeName).then((data) => {
  redRank.value = data;
});
const updateBlueRank = fetchTeamRank(bluePlayer.team.collegeName).then((data) => {
  blueRank.value = data;
});
Promise.all([updateRedRank, updateBlueRank]).finally(() => {
  loading.value = false;
});

function getRobotData(player: Player): Team {
  return robotDataStore.robotData.zones.find((zone) => {
    return Number(zone.zoneId) == props.zoneId
  })?.teams.find((team) => {
    return team.collegeName == player.team?.collegeName
  })
}

const showRobotDataRadar = computed(() => {
  if (promotionStore.season === 2024) return false
  return robotDataStore.existRobotDataSet.has(redPlayer.team.collegeName) &&
    robotDataStore.existRobotDataSet.has(bluePlayer.team.collegeName)
})

const redSideRobotData = computed(() => getRobotData(redPlayer))
const blueSideRobotData = computed(() => getRobotData(bluePlayer))
</script>

<template>
  <v-card
    v-if="redPlayer?.team && bluePlayer?.team"
    class="pa-2 pt-4"
  >
    <v-row>
      <v-col md="6" cols="12">
        <v-card-title>
          <TeamHeader
            :player="redPlayer"
            :rank="redRank"/>
        </v-card-title>
      </v-col>
      <v-col md="6" cols="12">
        <v-card-title>
          <TeamHeader
            :player="bluePlayer"
            :rank="blueRank"
            :right="true"/>
        </v-card-title>
      </v-col>
    </v-row>

    <v-card-text class="mt-2">
      <v-row>
        <v-col v-if="showRobotDataRadar" md="6" cols="12">
          <RobotDataRadar
            :players="[redPlayer, bluePlayer]"
            :season="promotionStore.season"/>
        </v-col>

        <v-col md="6" cols="12">
          <HistoryMatch
            :red-player="redPlayer"
            :blue-player="bluePlayer">
          </HistoryMatch>
        </v-col>

        <v-col v-if="redSideRobotData" md="12" cols="12">
          <RobotDataTable
            :robot-data-left="redSideRobotData"
            :robot-data-right="blueSideRobotData"
            :season="promotionStore.season"/>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  width: 100%; /* 确保容器宽度 */
}
</style>
