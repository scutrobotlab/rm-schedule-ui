<script setup lang="ts">
import { computed } from 'vue'
import moment from 'moment'
import type { BracketInfoCard as InfoCard, BracketMatchSummary } from '../../types/bracket'
import {
  shortenBracketTitle,
  type BracketDensity,
  type BracketTitleShortenLevel,
} from '../../utils/bracket_density'
import BracketTeamRow from './BracketTeamRow.vue'

const props = withDefaults(
  defineProps<{
    item: InfoCard
    density: BracketDensity
    titleShortenLevel?: BracketTitleShortenLevel
    showTeamName?: boolean
    showPlaceholderLogo?: boolean
    showTypeTag?: boolean
  }>(),
  {
    titleShortenLevel: 0,
    showTeamName: true,
    showPlaceholderLogo: true,
    showTypeTag: true,
  },
)

const nodeTypeLabel: Record<string, string> = {
  promote: '晋级',
  eliminate: '淘汰',
  groupLoop: '小组',
  matchGroup: '对阵',
}

const statusLabel: Record<string, string> = {
  STARTED: '进行中',
  DONE: '已结束',
  PENDING: '',
  UNKNOWN: '',
}

/** 多场对阵按场次完整展示；纵向席位/场次一律不截断 */
const showAsMatches = computed(
  () => props.item.nodeType === 'matchGroup' && props.item.matches.length > 0,
)

const showMeta = computed(() => props.density === 'comfortable')
const displayTitle = computed(() => (
  shortenBracketTitle(props.item.title, props.titleShortenLevel)
))

function matchTimeText(m: BracketMatchSummary): string {
  if (!m.planStartedAt) return ''
  const parsed = moment(m.planStartedAt)
  return parsed.isValid() ? parsed.format('M/D HH:mm') : ''
}

function hasMatchMeta(m: BracketMatchSummary): boolean {
  return Boolean(statusLabel[m.status] || m.orderNumber || matchTimeText(m))
}
</script>

<template>
  <article
    class="info-card"
    :class="[`lane-${item.lane}`, `node-${item.nodeType}`, `density-${density}`]"
    :data-node-id="item.nodeId"
  >
    <div class="card-head">
      <span class="card-title">{{ displayTitle }}</span>
      <span
        v-if="showTypeTag"
        class="type-tag"
      >{{ nodeTypeLabel[item.nodeType] || '说明' }}</span>
    </div>

    <div
      v-if="showAsMatches"
      class="match-list"
    >
      <div
        v-for="(m, mi) in item.matches"
        :key="`${item.id}-match-${m.orderNumber}-${mi}`"
        class="mini-match"
      >
        <div class="slot-stack">
          <BracketTeamRow
            :team="m.slots[0]"
            :score="m.redWinGames"
            :density="density"
            :show-score="true"
            :show-name="showTeamName"
            side="red"
            :finalized="m.status === 'DONE'"
            :match-source-shorten-level="
              (titleShortenLevel ?? 0) >= 2 ? 2 : (titleShortenLevel ?? 0) >= 1 ? 1 : 0
            "
            :show-placeholder-logo="showPlaceholderLogo"
          />
          <BracketTeamRow
            :team="m.slots[1]"
            :score="m.blueWinGames"
            :density="density"
            :show-score="true"
            :show-name="showTeamName"
            side="blue"
            :finalized="m.status === 'DONE'"
            :match-source-shorten-level="
              (titleShortenLevel ?? 0) >= 2 ? 2 : (titleShortenLevel ?? 0) >= 1 ? 1 : 0
            "
            :show-placeholder-logo="showPlaceholderLogo"
          />
        </div>
        <div
          v-if="showMeta && hasMatchMeta(m)"
          class="card-meta"
        >
          <span v-if="statusLabel[m.status]">{{ statusLabel[m.status] }}</span>
          <span v-if="m.orderNumber">第{{ m.orderNumber }}场</span>
          <span v-if="matchTimeText(m)">{{ matchTimeText(m) }}</span>
        </div>
      </div>
    </div>

    <div
      v-else
      class="slot-list"
    >
      <BracketTeamRow
        v-for="(slot, si) in item.slots"
        :key="`${item.id}-slot-${si}`"
        :team="slot"
        :score="null"
        :density="density"
        :show-score="false"
        :show-name="showTeamName"
        :match-source-shorten-level="(titleShortenLevel ?? 0) >= 2 ? 2 : 0"
        :show-placeholder-logo="showPlaceholderLogo"
      />
    </div>
  </article>
</template>

<style scoped>
.info-card {
  position: relative;
  z-index: 1;
  padding: 8px;
  border-radius: 8px;
  background: rgba(4, 12, 28, 0.24);
  border: 1px solid rgba(120, 170, 220, 0.18);
  border-left-width: 3px;
  border-left-color: rgba(120, 170, 220, 0.45);
  backdrop-filter: blur(18px) saturate(1.15);
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
}

.info-card.lane-gold {
  border-left-color: #ffc857;
}

.info-card.lane-gold .card-title {
  color: #ffd56a;
  opacity: 1;
  font-weight: 600;
}

.info-card.node-promote {
  background: rgba(40, 28, 8, 0.22);
  border-color: rgba(220, 170, 90, 0.28);
  border-left-color: #ffc857;
}

.info-card.node-promote .card-title {
  color: #ffd56a;
  opacity: 1;
  font-weight: 600;
}

.info-card.node-promote .type-tag {
  color: #1a1408;
  background: #ffd56a;
  opacity: 1;
  font-weight: 700;
}

.info-card.node-eliminate {
  background: rgba(18, 18, 22, 0.24);
  border-color: rgba(120, 120, 130, 0.25);
}

.info-card.node-eliminate :deep(.rank-badge) {
  background: #6b6f76;
  color: rgba(255, 255, 255, 0.85);
}

.info-card.density-normal {
  padding: 6px;
}

.info-card.density-compact {
  padding: 4px;
  border-radius: 6px;
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
  opacity: 0.78;
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

.match-list,
.slot-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* 多场纵向分割：仅用上下间距与分隔线，不挤占水平内容区 */
.match-list {
  gap: 0;
}

.mini-match {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.mini-match:first-child {
  padding-top: 0;
}

.mini-match:last-child {
  padding-bottom: 0;
}

.mini-match + .mini-match {
  border-top: 1px solid rgba(120, 170, 220, 0.2);
}

.slot-stack {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
  font-size: 0.66rem;
  opacity: 0.55;
}

.density-normal .mini-match {
  padding: 6px 0;
}

.density-compact .mini-match {
  padding: 5px 0;
}

.density-compact .mini-match + .mini-match {
  border-top-color: rgba(120, 170, 220, 0.14);
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

  .density-comfortable .mini-match {
    padding: 10px 0;
  }
}
</style>
