<script setup lang="ts">
import { Player } from "../types/schedule";
import axios, { AxiosResponse } from "axios";
import { RankListItem } from "../types/rank";
import { usePromotionStore } from "../stores/promotion";
import { computed, ref } from "vue";

import MatchRecord from "./MatchRecord.vue";
import GroupMatchData from "./GroupMatchData.vue";
import CompleteFormRank from "./CompleteFormRank.vue";
import RobotDataTable from "./RobotDataTable.vue";
import RobotDataRadar from "./RobotDataRadar.vue";
import { useRobotDataStore } from "../stores/robot_data";
import TeamHeader from "./TeamHeader.vue";

interface Props {
  zoneId: number,
  player: Player,
}

const props = defineProps<Props>()
if (!props.player || !props.player.team) {
  throw new Error('Player is required')
}

const promotionStore = usePromotionStore();
const robotDataStore = useRobotDataStore();

const loading = ref(true)

const rank = ref<RankListItem | null>(null)
axios({
  method: 'GET',
  url: '/api/rank',
  params: {
    season: promotionStore.season,
    school_name: props.player.team.collegeName,
  }
}).then((resp: AxiosResponse<RankListItem>) => {
  rank.value = resp.data
}).finally(() => {
  loading.value = false
})

const groupRank = computed(() => {
  for (const zone of promotionStore.groupRank.zones ?? []) {
    for (const group of zone.groups) {
      for (const players of group.groupPlayers) {
        if (players[1].itemValue['collegeName'] == props.player.team.collegeName) {
          return players
        }
      }
    }
  }
  return []
})

const showRobotDataRadar = computed(() => {
  if (promotionStore.season === 2024) return false
  return robotDataStore.existRobotDataSet.has(props.player.team.collegeName)
})

const robotData = computed(() => {
  return robotDataStore.robotData.zones?.find((zone) => {
    return Number(zone.zoneId) == props.zoneId
  })?.teams.find((team) => {
    return team.collegeName == props.player.team.collegeName
  })
})
</script>

<template>
  <v-card
    v-if="props.player && props.player.team"
    class="pa-2 pt-4"
  >
    <v-card-title>
      <TeamHeader v-if="rank" :player="props.player" :rank="rank"/>
    </v-card-title>

    <v-card-text class="mt-2">
      <div v-if="loading">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </div>

      <div v-else>
        <div v-if="rank">
          <v-row>
            <v-col md="6" cols="12">
              <MatchRecord :player="props.player"/>
            </v-col>

            <v-col v-if="groupRank.length > 0"
                   md="6" cols="12">
              <GroupMatchData group-rank="groupRank"/>
            </v-col>

            <v-col md="6" cols="12">
              <CompleteFormRank :rank="rank"/>
            </v-col>

            <v-col v-if="robotData" md="6" cols="12">
              <RobotDataTable :robot-data-left="robotData" :season="promotionStore.season"/>
            </v-col>

            <v-col v-if="showRobotDataRadar" md="6" cols="12">
              <RobotDataRadar
                :players="[props.player]"
                :season="promotionStore.season"/>
            </v-col>
          </v-row>
        </div>
        <div v-else>
          <v-alert
            variant="tonal"
            color="error"
          >
            <v-icon left>mdi-alert</v-icon>
            未找到该队伍的信息
          </v-alert>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  width: 100%; /* 确保容器宽度 */
}

.left-column {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: center;
}

.right-column {
  flex: 1; /* 占据剩余的空间 */
  display: flex;
  justify-content: center;
  flex-direction: column;
}
</style>
