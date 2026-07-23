<script setup lang="ts">
import { computed } from 'vue'
import moment from 'moment'
import type { BracketMatchCard as MatchCard } from '../../types/bracket'
import {
  shortenBracketTitle,
  type BracketDensity,
} from '../../utils/bracket_density'
import BracketTeamRow from './BracketTeamRow.vue'

const props = withDefaults(
  defineProps<{
    item: MatchCard
    density: BracketDensity
    shortenTitle?: boolean
    showTeamName?: boolean
    showTypeTag?: boolean
  }>(),
  { shortenTitle: false, showTeamName: true, showTypeTag: true },
)

const statusLabel: Record<string, string> = {
  STARTED: '进行中',
  DONE: '已结束',
  PENDING: '',
  UNKNOWN: '',
}

const showMeta = computed(() => props.density === 'comfortable')
const displayTitle = computed(() => (
  props.shortenTitle ? shortenBracketTitle(props.item.title) : props.item.title
))
const timeText = computed(() => {
  if (!props.item.planStartedAt) return ''
  const m = moment(props.item.planStartedAt)
  return m.isValid() ? m.format('M/D HH:mm') : ''
})

/** 冠军争夺战 → 冠/亚；季军争夺战 → 季 */
const podiumKind = computed<'champion' | 'third' | null>(() => {
  const title = props.item.title || ''
  if (title.includes('季军')) return 'third'
  if (title.includes('冠军')) return 'champion'
  return null
})

const podiumTag = computed(() => {
  if (podiumKind.value === 'third') return '季军'
  if (podiumKind.value === 'champion') return '冠军'
  return null
})

const destinationTag = computed(() => {
  if (podiumTag.value) return null
  return props.item.winnerDestination || null
})

function slotMedal(
  slot: { isWinner: boolean; isLoser: boolean },
): 'gold' | 'silver' | 'bronze' | null {
  if (podiumKind.value === 'champion') {
    if (slot.isWinner) return 'gold'
    if (slot.isLoser) return 'silver'
  }
  if (podiumKind.value === 'third' && slot.isWinner) return 'bronze'
  return null
}
</script>

<template>
  <article
    class="match-card"
    :class="[
      `lane-${item.lane}`,
      `density-${density}`,
      podiumKind ? `podium-${podiumKind}` : null,
    ]"
    :data-node-id="item.nodeId"
  >
    <div
      v-if="displayTitle || (showTypeTag && (podiumTag || destinationTag))"
      class="card-head"
    >
      <span
        v-if="displayTitle"
        class="card-title"
      >{{ displayTitle }}</span>
      <span
        v-if="showTypeTag && podiumTag"
        class="type-tag"
      >{{ podiumTag }}</span>
      <span
        v-else-if="showTypeTag && destinationTag"
        class="type-tag dest-tag"
      >{{ destinationTag }}</span>
    </div>

    <div class="slot-stack">
      <BracketTeamRow
        :team="item.slots[0]"
        :score="item.redWinGames"
        :density="density"
        :show-score="true"
        :show-name="showTeamName"
        :side="podiumKind ? null : 'red'"
        :medal="slotMedal(item.slots[0])"
      />
      <BracketTeamRow
        :team="item.slots[1]"
        :score="item.blueWinGames"
        :density="density"
        :show-score="true"
        :show-name="showTeamName"
        :side="podiumKind ? null : 'blue'"
        :medal="slotMedal(item.slots[1])"
      />
    </div>

    <div
      v-if="showMeta && (statusLabel[item.status] || item.orderNumber || timeText)"
      class="card-meta"
    >
      <span v-if="statusLabel[item.status]">{{ statusLabel[item.status] }}</span>
      <span v-if="item.orderNumber">第{{ item.orderNumber }}场</span>
      <span v-if="timeText">{{ timeText }}</span>
    </div>
  </article>
</template>

<style scoped>
.match-card {
  position: relative;
  z-index: 1;
  padding: 8px;
  border-radius: 8px;
  background: rgba(4, 12, 28, 0.28);
  border: 1px solid rgba(120, 170, 220, 0.22);
  border-left-width: 3px;
  border-left-color: rgba(120, 170, 220, 0.6);
  backdrop-filter: blur(18px) saturate(1.15);
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
}

.match-card.lane-gold {
  background: rgba(40, 28, 8, 0.22);
  border-color: rgba(220, 170, 90, 0.28);
  border-left-color: #ffc857;
}

.match-card.lane-gold .card-title {
  color: #ffd56a;
  opacity: 1;
  font-weight: 600;
}

.match-card.podium-champion .type-tag {
  color: #1a1408;
  background: #ffd56a;
  opacity: 1;
  font-weight: 700;
}

.match-card.podium-third {
  border-left-color: #c8895a;
}

.match-card.podium-third .card-title {
  color: #e0a878;
}

.match-card.podium-third .type-tag {
  color: #1a120c;
  background: #c8895a;
  opacity: 1;
  font-weight: 700;
}

.match-card.density-normal {
  padding: 6px;
}

.match-card.density-compact {
  padding: 4px;
  border-radius: 6px;
}

.slot-stack {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.card-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 6px;
  max-height: 1rem;
  margin-bottom: 6px;
  overflow: hidden;
}

.card-title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 0.72rem;
  opacity: 0.72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.type-tag {
  flex: 0 0 auto;
  font-size: 0.58rem;
  padding: 1px 5px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.08);
  opacity: 0.8;
}

.dest-tag {
  color: #9fd9bc;
  background: rgba(93, 206, 160, 0.18);
  opacity: 1;
  font-weight: 600;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
  font-size: 0.66rem;
  opacity: 0.55;
}

.density-normal .card-head {
  margin-bottom: 4px;
}

.density-normal .card-title {
  font-size: 0.66rem;
}

.density-compact .card-head {
  margin-bottom: 4px;
}

.density-compact .card-title {
  font-size: 0.64rem;
}

@media (min-width: 900px) {
  .density-comfortable {
    padding: 10px;
  }

  .density-comfortable .card-title {
    font-size: 0.78rem;
  }
}
</style>
