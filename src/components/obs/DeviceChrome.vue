<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

/**
 * iPhone 17 Pro Max 系统 UI 覆盖层（逻辑 440×956 @3x）。
 * OBS 默认竖屏安全区 top 72pt / bottom 34pt，状态栏内容与灵动岛垂直居中同一条中线。
 */
const props = withDefaults(
  defineProps<{
    width: number
    height: number
    safeTop: number
    safeBottom: number
    /** 固定时间文本，为空则跟随本机时间 */
    time?: string
    /** 电量 0–100 */
    battery?: number
    charging?: boolean
    /** 信号格数 0–4 */
    signal?: number
    wifi?: boolean
    island?: boolean
    home?: boolean
  }>(),
  {
    time: '',
    battery: 100,
    charging: false,
    signal: 4,
    wifi: true,
    island: true,
    home: true,
  },
)

const ISLAND_W = 126
const ISLAND_H = 37
const ISLAND_Y = 11

/** 状态栏文字与图标的公共中线 */
const centerY = ISLAND_Y + ISLAND_H / 2

const islandX = computed(() => (props.width - ISLAND_W) / 2)

const liveTime = ref(formatNow())
let clockTimer: number | undefined

function formatNow(): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

const timeText = computed(() => props.time.trim() || liveTime.value)

const batteryLevel = computed(() => Math.min(100, Math.max(0, props.battery)) / 100)
const signalBars = computed(() => Math.min(4, Math.max(0, Math.round(props.signal))))

/** 右侧图标簇由右向左排布，随逻辑宽度自适应 */
const icons = computed(() => {
  const nubRight = props.width - 24.5
  const bodyW = 25
  const bodyH = 13
  const bodyRight = nubRight - 2.4
  const bodyX = bodyRight - bodyW
  const wifiCx = bodyX - 7 - 8.5
  // 无 Wi-Fi 时信号直接贴电池，不留出图标空位
  const signalRight = props.wifi ? wifiCx - 8.5 - 8 : bodyX - 8
  const signalX = signalRight - 18

  return {
    battery: {
      x: bodyX,
      y: centerY - bodyH / 2,
      w: bodyW,
      h: bodyH,
      fillW: (bodyW - 4) * batteryLevel.value,
      nubX: bodyRight + 0.8,
    },
    wifi: { cx: wifiCx, cy: centerY + 5.5 },
    signal: { x: signalX, bottom: centerY + 6 },
  }
})

const wifiArcs = computed(() => {
  const { cx, cy } = icons.value.wifi
  return [4.2, 6.9, 9.6].map((r) => {
    const dx = r * Math.SQRT1_2
    return `M ${(cx - dx).toFixed(2)} ${(cy - dx).toFixed(2)} A ${r} ${r} 0 0 1 ${(cx + dx).toFixed(2)} ${(cy - dx).toFixed(2)}`
  })
})

const signalRects = computed(() => {
  const { x, bottom } = icons.value.signal
  return [4.5, 7, 9.5, 12].map((h, index) => ({
    x: x + index * 5,
    y: bottom - h,
    h,
    active: index < signalBars.value,
  }))
})

const homeIndicator = computed(() => ({
  x: (props.width - 139) / 2,
  y: props.height - 13,
}))

onMounted(() => {
  if (props.time.trim()) return
  clockTimer = window.setInterval(() => {
    liveTime.value = formatNow()
  }, 10_000)
})

onUnmounted(() => {
  if (clockTimer !== undefined) window.clearInterval(clockTimer)
})
</script>

<template>
  <div class="device-chrome">
    <svg
      class="device-chrome__status"
      :width="width"
      :height="safeTop"
      :viewBox="`0 0 ${width} ${safeTop}`"
      aria-hidden="true"
    >
      <rect
        v-if="island"
        :x="islandX"
        :y="ISLAND_Y"
        :width="ISLAND_W"
        :height="ISLAND_H"
        :rx="ISLAND_H / 2"
        fill="#000"
      />

      <text
        class="device-chrome__time"
        :x="width * 0.173"
        :y="centerY"
        text-anchor="middle"
        dominant-baseline="central"
      >
        {{ timeText }}
      </text>

      <rect
        v-for="(bar, index) in signalRects"
        :key="index"
        :x="bar.x"
        :y="bar.y"
        width="3"
        :height="bar.h"
        rx="1"
        fill="#fff"
        :opacity="bar.active ? 1 : 0.35"
      />

      <g
        v-if="wifi"
        fill="none"
        stroke="#fff"
        stroke-width="1.7"
        stroke-linecap="round"
      >
        <path
          v-for="(arc, index) in wifiArcs"
          :key="index"
          :d="arc"
        />
      </g>
      <circle
        v-if="wifi"
        :cx="icons.wifi.cx"
        :cy="icons.wifi.cy"
        r="1.6"
        fill="#fff"
      />

      <rect
        :x="icons.battery.x"
        :y="icons.battery.y"
        :width="icons.battery.w"
        :height="icons.battery.h"
        rx="4.3"
        fill="none"
        stroke="#fff"
        stroke-width="1"
        opacity="0.38"
      />
      <rect
        :x="icons.battery.nubX"
        :y="centerY - 2.4"
        width="1.6"
        height="4.8"
        rx="0.8"
        fill="#fff"
        opacity="0.38"
      />
      <rect
        :x="icons.battery.x + 2"
        :y="centerY - 4.5"
        :width="icons.battery.fillW"
        height="9"
        rx="2.5"
        :fill="charging ? '#34c759' : '#fff'"
      />
    </svg>

    <svg
      v-if="home"
      class="device-chrome__home"
      :width="width"
      :height="safeBottom"
      :viewBox="`0 ${height - safeBottom} ${width} ${safeBottom}`"
      aria-hidden="true"
    >
      <rect
        :x="homeIndicator.x"
        :y="homeIndicator.y"
        width="139"
        height="5"
        rx="2.5"
        fill="#fff"
        opacity="0.9"
      />
    </svg>
  </div>
</template>

<style scoped lang="scss">
.device-chrome {
  position: absolute;
  inset: 0;
  /* 覆盖层只负责绘制，不吞掉指针事件 */
  pointer-events: none;

  &__status {
    position: absolute;
    top: 0;
    left: 0;
  }

  &__home {
    position: absolute;
    bottom: 0;
    left: 0;
  }

  &__time {
    font-family: -apple-system, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif;
    font-size: 17px;
    font-weight: 600;
    fill: #fff;
    font-variant-numeric: tabular-nums;
  }
}
</style>
