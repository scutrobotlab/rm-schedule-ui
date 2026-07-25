<script setup lang="ts">
import { computed } from 'vue'
import type { BracketColumn, BracketInfoCard, BracketMatchCard } from '../../types/bracket'
import type {
  BracketDensity,
  BracketTitleShortenLevel,
} from '../../utils/bracket_density'
import BracketMatchCardView from './BracketMatchCard.vue'
import BracketInfoCardView from './BracketInfoCard.vue'

const props = defineProps<{
  column: BracketColumn
  density: BracketDensity
  visibleSpan: number
  /** 0=不缩；1=≥3；2=≥4；3=≥5；4=≥6 */
  titleShortenLevel?: BracketTitleShortenLevel
  /** ≥6 列时为 false，隐藏校名 */
  showTeamName?: boolean
  /** ≥5 列时为 false，仅隐藏未确定席位的占位比分 */
  showPendingScore?: boolean
  /** ≥6 列时为 true，强制展示未确定席位的来源文字 */
  forcePendingName?: boolean
  /** ≥4 列时为 false，隐藏未确定队伍的红蓝 R */
  showPlaceholderLogo?: boolean
  /** ≥4 列时为 false，隐藏右上角类型/去向标签 */
  showTypeTag?: boolean
  /** 小组赛单列时展示胜场数 / 对手分 */
  showGroupStats?: boolean
  groupName?: string
  /** 淘汰赛树形布局：节点 offsetTop；null 表示普通堆叠 */
  treeTops?: Record<string, number> | null
  treeHeight?: number | null
}>()

const useTree = computed(
  () => props.treeTops != null && Object.keys(props.treeTops).length > 0,
)

const itemsStyle = computed(() => {
  if (!useTree.value || props.treeHeight == null) return undefined
  return { height: `${Math.max(props.treeHeight, 0)}px` }
})

function itemStyle(nodeId: string): Record<string, string> | undefined {
  if (!useTree.value || !props.treeTops) return undefined
  const top = props.treeTops[nodeId]
  if (top == null) return undefined
  return { top: `${top}px` }
}

function isMatch(item: BracketMatchCard | BracketInfoCard): item is BracketMatchCard {
  return item.kind === 'match'
}
</script>

<template>
  <section
    class="bracket-column"
    :class="[`density-${density}`, { 'bracket-column--tree': useTree }]"
    :data-column-index="column.index"
  >
    <div
      class="column-items"
      :style="itemsStyle"
    >
      <div
        v-for="item in column.items"
        :key="item.id"
        class="column-item"
        :style="itemStyle(item.nodeId)"
      >
        <BracketMatchCardView
          v-if="isMatch(item)"
          :item="item"
          :density="density"
          :visible-span="visibleSpan"
          :title-shorten-level="titleShortenLevel ?? 0"
          :show-team-name="showTeamName !== false"
          :show-pending-score="showPendingScore !== false"
          :force-pending-name="forcePendingName === true"
          :show-placeholder-logo="showPlaceholderLogo !== false"
          :show-type-tag="showTypeTag !== false"
          :show-group-stats="showGroupStats === true"
          :group-name="groupName"
        />
        <BracketInfoCardView
          v-else
          :item="item"
          :density="density"
          :visible-span="visibleSpan"
          :title-shorten-level="titleShortenLevel ?? 0"
          :show-team-name="showTeamName !== false"
          :show-pending-score="showPendingScore !== false"
          :force-pending-name="forcePendingName === true"
          :show-placeholder-logo="showPlaceholderLogo !== false"
          :show-type-tag="showTypeTag !== false"
          :show-group-stats="showGroupStats === true"
          :group-name="groupName"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.bracket-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.column-items {
  display: flex;
  flex-direction: column;
  gap: calc(
    8px
    - 2px * var(--bracket-normal-progress, 0)
    - 2px * var(--bracket-compact-progress, 0)
  );
  flex: 1 1 auto;
}

.bracket-column--tree .column-items {
  position: relative;
  gap: 0;
  flex: 0 0 auto;
}

.bracket-column--tree .column-item {
  position: absolute;
  left: 0;
  right: 0;
}

.bracket-column--tree.density-normal .column-items,
.bracket-column--tree.density-compact .column-items,
.bracket-column--tree.density-comfortable .column-items {
  gap: 0;
}

@media (min-width: 900px) {
  .column-items {
    gap: calc(
      12px
      - 6px * var(--bracket-normal-progress, 0)
      - 2px * var(--bracket-compact-progress, 0)
    );
  }
}
</style>
