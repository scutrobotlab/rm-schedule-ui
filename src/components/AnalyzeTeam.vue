<script setup lang="ts">
import {Player} from "../types/schedule";
import axios, {AxiosResponse} from "axios";
import {RankListItem} from "../types/rank";
import {usePromotionStore} from "../stores/promotion";
import {GroupRankInfoZone} from "../types/group_rank_info";
import {computed} from "vue";

interface Props {
  zoneId: number,
  player: Player,
}

const props = defineProps<Props>()
if (!props.player || !props.player.team) {
  throw new Error('Player is required')
}

const promotionStore = usePromotionStore();

const rank = ref<RankListItem | null>(null)
axios({
  method: 'GET',
  url: '/api/rank',
  params: {school_name: props.player.team.collegeName,}
}).then((resp: AxiosResponse<RankListItem>) => {
  rank.value = resp.data
})

const groupRank = computed(() => {
  const zones = promotionStore.groupRank.zones.find((zone: GroupRankInfoZone) => {
    return zone.zoneId == props.zoneId.toString()
  })
  for (const group of zones.groups) {
    for (const players of group.groupPlayers) {
      if (players[1].itemValue['collegeName'] == props.player.team.collegeName) {
        return players
      }
    }
  }
})

function convertToOrdinal(number: number): string {
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return number + "st";
  } else if (lastDigit === 2 && lastTwoDigits !== 12) {
    return number + "nd";
  } else if (lastDigit === 3 && lastTwoDigits !== 13) {
    return number + "rd";
  } else {
    return number + "th";
  }
}
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
          <h6 v-if="rank">RoboMaster 高校积分榜第 {{ rank.rankScoreItem.rank }} 名</h6>
        </div>
      </div>
    </v-card-title>

    <v-card-text class="mt-2">
      <div v-if="rank">
        <v-chip color="blue" variant="flat" label>
          <h3>完整形态考核排名 {{ rank.completeForm.rank }}/96</h3>
        </v-chip>
        <v-list class="my-2" lines="one">
          <v-list-item-title>分数</v-list-item-title>
          <v-list-item-subtitle>{{ rank.completeForm.score }}</v-list-item-subtitle>
          <v-list-item-title>初始金币-项目文档</v-list-item-title>
          <v-list-item-subtitle>{{ rank.completeForm.initialCoinDocument }}</v-list-item-subtitle>
          <v-list-item-title> 初始金币-技术方案</v-list-item-title>
          <v-list-item-subtitle>{{ rank.completeForm.initialCoinTechnology }}</v-list-item-subtitle>
          <v-list-item-title>总初始金币</v-list-item-title>
          <v-list-item-subtitle>{{ rank.completeForm.initialCoinTotal }}</v-list-item-subtitle>
        </v-list>
      </div>

      <div class="mt-6">
        <v-chip color="blue" variant="flat" label>
          <h3>区域赛小组赛排名 {{ groupRank[0].itemValue }}/16</h3>
        </v-chip>

        <v-list class="my-2" lines="one">
          <div v-for="n in groupRank.slice(2)">
            <v-list-item-title>{{ n.itemName }}</v-list-item-title>
            <v-list-item-subtitle>{{ n.itemValue }}</v-list-item-subtitle>
          </div>
        </v-list>
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
