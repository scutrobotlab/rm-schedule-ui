<script setup lang="ts">
import {Player} from "../types/schedule";
import axios, {AxiosResponse} from "axios";
import {RankListItem} from "../types/rank";

interface Props {
  player: Player,
}

const props = defineProps<Props>()

if (!props.player || !props.player.team) {
  throw new Error('Player is required')
}

let rank: RankListItem = null
axios({
  method: 'GET',
  url: '/api/rank',
  params: {school_name: props.player.team.collegeName,}
}).then((resp: AxiosResponse<RankListItem>) => {
  rank = resp.data
})
</script>

<template>
  <v-card
    v-if="player && player.team"
    class="pa-2"
  >
    <v-card-title>
      <div class="container">
        <div class="left-column">
          <v-avatar size="80">
            <v-img
              :src="player.team.collegeLogo"
              color="white"
            ></v-img>
          </v-avatar>
        </div>

        <div class="right-column ml-4">
          <h3>{{ player.team.collegeName }} {{ player.team.name }}</h3>
          <h6 v-if="rank">RoboMaster 高校积分榜第 {{ rank.Rank }} 名</h6>
        </div>
      </div>
    </v-card-title>

    <v-card-text>

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
