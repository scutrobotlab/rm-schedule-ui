<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { CurrentMatchForecastResp, ForecastSide } from '../types/current_match_forecast'
import {
  fetchCurrentMatchForecast,
  formatMatchMeta,
  hasValidSupportRate,
} from '../utils/current_match_forecast'
import { StaticCDN } from '../utils/cdn'
import { forecastAssets } from '@/assets/forecast'

const {
  backgroundUrl,
  headerUrl,
  footerBannerUrl,
  qrCodeUrl,
  schoolRedUrl,
  schoolBlueUrl,
} = forecastAssets

const READY_TIMEOUT_MS = 12_000

type PosterStatus = 'pending' | 'ready' | 'error'
type TeamRowKey = 'red' | 'blue'

interface TeamRow {
  key: TeamRowKey
  side: ForecastSide
  /** 无真实比赛数据时的骨架占位行 */
  placeholder: boolean
  logoUrl: string
  collegeName: string
  teamName: string
}

const PLACEHOLDER_SIDE: ForecastSide = {
  support_rate: -1,
  support_rate_percent: -1,
  team_info: {
    team_id: '',
    team_name: '',
    college_logo: '',
    college_name: '',
  },
}

const route = useRoute()
const posterRef = ref<HTMLElement | null>(null)
const status = ref<PosterStatus>('pending')
const errorMessage = ref('')
const forecast = ref<CurrentMatchForecastResp | null>(null)

const isRenderMode = computed(() => String(route.query.render ?? '') === '1')
const hasMatch = computed(() => Boolean(forecast.value?.has_match))

const matchMeta = computed(() => {
  if (!forecast.value) return '加载中…'
  if (!forecast.value.has_match) return '<< 暂无进行中比赛'
  return formatMatchMeta(forecast.value)
})

const deadlineText = computed(() => {
  if (!forecast.value?.has_match) return ''
  const raw = forecast.value.support_rate_deadline?.trim() ?? ''
  if (!raw) return ''
  // 展示到分钟，与参考海报一致
  return raw.length >= 16 ? raw.slice(0, 16) : raw
})

const supportRatesAvailable = computed(() => {
  if (!forecast.value?.has_match) return false
  return (
    hasValidSupportRate(forecast.value.red_side.support_rate) &&
    hasValidSupportRate(forecast.value.blue_side.support_rate) &&
    hasValidSupportRate(forecast.value.red_side.support_rate_percent) &&
    hasValidSupportRate(forecast.value.blue_side.support_rate_percent)
  )
})

const teamRows = computed((): TeamRow[] => {
  const defaultLogo = (key: TeamRowKey) => (key === 'red' ? schoolRedUrl : schoolBlueUrl)

  if (!forecast.value?.has_match) {
    return ([
      {
        key: 'red',
        side: PLACEHOLDER_SIDE,
        placeholder: true,
        logoUrl: schoolRedUrl,
        collegeName: '红方学校',
        teamName: '红方战队',
      },
      {
        key: 'blue',
        side: PLACEHOLDER_SIDE,
        placeholder: true,
        logoUrl: schoolBlueUrl,
        collegeName: '蓝方学校',
        teamName: '蓝方战队',
      },
    ] satisfies TeamRow[])
  }

  return ([
    {
      key: 'red',
      side: forecast.value.red_side,
      placeholder: false,
      logoUrl: logoSrc(forecast.value.red_side.team_info.college_logo) || defaultLogo('red'),
      collegeName: forecast.value.red_side.team_info.college_name || '红方学校',
      teamName: forecast.value.red_side.team_info.team_name || '红方战队',
    },
    {
      key: 'blue',
      side: forecast.value.blue_side,
      placeholder: false,
      logoUrl: logoSrc(forecast.value.blue_side.team_info.college_logo) || defaultLogo('blue'),
      collegeName: forecast.value.blue_side.team_info.college_name || '蓝方学校',
      teamName: forecast.value.blue_side.team_info.team_name || '蓝方战队',
    },
  ] satisfies TeamRow[])
})

function logoSrc(url: string): string {
  if (!url) return ''
  return StaticCDN(url)
}

function percentLabel(side: ForecastSide): string {
  if (!hasValidSupportRate(side.support_rate_percent)) return '暂无'
  const n = side.support_rate_percent
  // 整数不显示小数，避免 71.0% 噪音；仍保留一位精度（如 62.3）
  return Number.isInteger(n) ? `${n}%` : `${n.toFixed(1)}%`
}

function sideHasRate(side: ForecastSide): boolean {
  return hasValidSupportRate(side.support_rate) && hasValidSupportRate(side.support_rate_percent)
}

function barWidth(side: ForecastSide): string {
  return `${Math.min(100, Math.max(0, side.support_rate * 100))}%`
}

function setError(message: string) {
  status.value = 'error'
  errorMessage.value = message
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function imageLabel(img: HTMLImageElement): string {
  return img.currentSrc || img.getAttribute('src') || '(empty)'
}

async function waitForImage(img: HTMLImageElement, deadline: number): Promise<void> {
  if (img.complete) {
    if (img.naturalWidth === 0) {
      throw new Error(`图片加载失败: ${imageLabel(img)}`)
    }
    if (typeof img.decode === 'function') {
      await img.decode().catch(() => undefined)
    }
    return
  }
  await new Promise<void>((resolve, reject) => {
    let timer: number | undefined
    const cleanup = () => {
      img.removeEventListener('load', onLoad)
      img.removeEventListener('error', onError)
      if (timer !== undefined) window.clearTimeout(timer)
    }
    const onLoad = () => {
      cleanup()
      if (img.naturalWidth === 0) {
        reject(new Error(`图片加载失败: ${imageLabel(img)}`))
        return
      }
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error(`图片加载失败: ${imageLabel(img)}`))
    }
    img.addEventListener('load', onLoad)
    img.addEventListener('error', onError)
    const remain = deadline - Date.now()
    if (remain <= 0) {
      cleanup()
      reject(new Error('图片加载超时'))
      return
    }
    timer = window.setTimeout(() => {
      cleanup()
      reject(new Error(`图片加载超时: ${imageLabel(img)}`))
    }, remain)
  })
  if (typeof img.decode === 'function') {
    await img.decode().catch(() => undefined)
  }
}

async function waitForFonts(timeoutMs: number): Promise<void> {
  let timer: number | undefined
  try {
    await Promise.race([
      document.fonts.ready.then(() => undefined),
      new Promise<void>((_, reject) => {
        timer = window.setTimeout(() => {
          reject(new Error('字体加载超时（12s）'))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timer !== undefined) window.clearTimeout(timer)
  }
}

async function waitUntilReady(): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS
  await waitForFonts(READY_TIMEOUT_MS)

  await nextTick()
  const root = posterRef.value
  if (!root) {
    throw new Error('海报根节点未挂载')
  }

  const images = Array.from(root.querySelectorAll('img')) as HTMLImageElement[]
  const pending = images.filter((img) => {
    const src = img.currentSrc || img.getAttribute('src') || ''
    return Boolean(src)
  })

  await Promise.all(pending.map((img) => waitForImage(img, deadline)))

  // 再轮询一轮，覆盖 decode 后仍未 complete 的边缘情况
  while (Date.now() < deadline) {
    const still = pending.filter((img) => !img.complete || img.naturalWidth === 0)
    if (still.length === 0) return
    await wait(50)
  }
  throw new Error('资源加载超时（12s）')
}

onMounted(async () => {
  try {
    const data = await fetchCurrentMatchForecast()
    forecast.value = data
    await nextTick()
    await waitUntilReady()
    status.value = 'ready'
  } catch (err) {
    setError(err instanceof Error ? err.message : String(err))
  }
})
</script>

<template>
  <div class="forecast-page" :class="{ 'is-render': isRenderMode }">
    <div v-if="!isRenderMode" class="forecast-chrome">
      <div class="forecast-chrome__title">王牌预言家 · 海报预览</div>
      <div class="forecast-chrome__hint">画幅 1920×1080 · 导出 PNG 为 3840×2160 · 状态 {{ status }}</div>
    </div>

    <div
      id="forecast-poster"
      ref="posterRef"
      class="forecast-poster"
      :data-status="status"
      :data-error="errorMessage || undefined"
    >
      <img class="forecast-poster__bg" :src="backgroundUrl" alt="" draggable="false" />
      <img class="forecast-poster__header" :src="headerUrl" alt="" draggable="false" />

      <div class="forecast-poster__meta">
        <div
          class="forecast-poster__match"
          :class="{ 'is-placeholder': !hasMatch }"
        >
          {{ matchMeta }}
        </div>
        <div
          v-if="deadlineText"
          class="forecast-poster__deadline"
        >
          数据截止时间：{{ deadlineText }}
        </div>
        <div
          v-else
          class="forecast-poster__deadline forecast-poster__deadline--empty"
        >
          数据截止时间：暂无
        </div>
      </div>

      <div class="forecast-poster__teams">
        <div
          v-if="forecast && (!hasMatch || !supportRatesAvailable)"
          class="forecast-poster__rate-unavailable"
        >
          {{ hasMatch ? '支持率暂不可用' : '暂无进行中比赛' }}
        </div>
        <div
          v-for="row in teamRows"
          :key="row.key"
          class="forecast-team"
          :class="[
            `forecast-team--${row.key}`,
            { 'is-placeholder': row.placeholder },
          ]"
        >
          <div class="forecast-team__logo-wrap">
            <img
              class="forecast-team__logo"
              :src="row.logoUrl"
              alt=""
              draggable="false"
            />
          </div>
          <div class="forecast-team__names">
            <div class="forecast-team__college">{{ row.collegeName }}</div>
            <div class="forecast-team__team">{{ row.teamName }}</div>
          </div>
          <div
            class="forecast-team__bar-track"
            :class="{ 'is-unavailable': !sideHasRate(row.side) }"
          >
            <div
              v-if="sideHasRate(row.side)"
              class="forecast-team__bar-fill"
              :class="{ 'is-animated': !isRenderMode }"
              :style="{ width: barWidth(row.side) }"
            />
            <span v-else class="forecast-team__bar-unavailable">暂无</span>
          </div>
          <div
            class="forecast-team__percent"
            :class="{ 'is-unavailable': !sideHasRate(row.side) }"
          >
            {{ percentLabel(row.side) }}
          </div>
        </div>
      </div>

      <div class="forecast-poster__footer">
        <img class="forecast-poster__footer-banner" :src="footerBannerUrl" alt="" draggable="false" />
        <img class="forecast-poster__qr" :src="qrCodeUrl" alt="" draggable="false" />
      </div>

      <div v-if="status === 'error'" class="forecast-poster__error">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.forecast-page {
  min-height: 100vh;
  box-sizing: border-box;
  background: #0e1116;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px 16px 48px;
  gap: 16px;

  &.is-render {
    min-height: 1080px;
    padding: 0;
    background: #000;
    align-items: flex-start;
    justify-content: flex-start;
  }
}

.forecast-chrome {
  width: min(1920px, 100%);
  color: #c5ccd8;
  font-family: 'Noto Sans SC', sans-serif;

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: #f2f4f7;
  }

  &__hint {
    margin-top: 4px;
    font-size: 13px;
    opacity: 0.8;
  }
}

.forecast-poster {
  position: relative;
  width: 1920px;
  height: 1080px;
  flex: 0 0 auto;
  overflow: hidden;
  color: #f2f4f7;
  font-family: 'Noto Sans SC', 'MyFont', sans-serif;
  background: #151920;
  transform-origin: top left;

  &__bg,
  &__header,
  &__footer-banner,
  &__qr,
  &__logo {
    display: block;
    user-select: none;
    -webkit-user-drag: none;
  }

  &__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__header {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px;
    height: 220px;
    object-fit: fill;
    pointer-events: none;
  }

  &__meta {
    position: absolute;
    top: 200px;
    left: 72px;
    right: 72px;
    z-index: 2;
    text-align: right;
  }

  &__match {
    color: #5ec8e8;
    font-size: 34px;
    font-weight: 600;
    letter-spacing: 1px;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.is-placeholder {
      color: #9aa3b2;
    }
  }

  &__deadline {
    margin-top: 10px;
    color: #d7dde8;
    font-size: 28px;
    font-weight: 500;

    &--empty {
      opacity: 0.75;
    }
  }

  &__teams {
    position: absolute;
    top: 340px;
    left: 120px;
    right: 120px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 56px;
  }

  &__rate-unavailable {
    color: #c5a35a;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: -24px;
  }

  &__footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 220px;
    z-index: 2;
  }

  &__footer-banner {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
  }

  &__qr {
    position: absolute;
    right: 72px;
    top: 50%;
    transform: translateY(-50%);
    width: 168px;
    height: 168px;
    border-radius: 50%;
    object-fit: cover;
    background: #fff;
    box-shadow: 0 0 0 6px #fff;
  }

  &__error {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
    text-align: center;
    background: rgba(10, 12, 16, 0.82);
    color: #ff8f8f;
    font-size: 32px;
    line-height: 1.4;
  }
}

.forecast-team {
  display: grid;
  grid-template-columns: 120px 320px 1fr 160px;
  align-items: center;
  column-gap: 36px;
  min-height: 120px;

  &.is-placeholder {
    .forecast-team__college,
    .forecast-team__team {
      color: #8b93a3;
    }
  }

  &__logo-wrap {
    width: 120px;
    height: 120px;
  }

  &__logo {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: contain;
    background: #fff;
  }

  &__names {
    min-width: 0;
  }

  &__college {
    font-size: 36px;
    font-weight: 700;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__team {
    margin-top: 6px;
    font-size: 28px;
    color: #b7c0cf;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__bar-track {
    position: relative;
    height: 28px;
    border-radius: 4px;
    background: #3a4252;
    overflow: hidden;

    &.is-unavailable {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2a3140;
    }
  }

  &__bar-fill {
    height: 100%;
    width: 0;
    background: #f0c94d;
    border-radius: 4px;

    &.is-animated {
      transition: width 0.6s ease;
    }
  }

  &__bar-unavailable {
    font-size: 18px;
    color: #8b93a3;
    letter-spacing: 2px;
  }

  &__percent {
    text-align: right;
    font-size: 48px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #f2f4f7;

    &.is-unavailable {
      font-size: 36px;
      color: #8b93a3;
      font-weight: 600;
    }
  }
}

/* 预览页在窄屏下整体缩小，不改变海报逻辑像素 */
@media (max-width: 1960px) {
  .forecast-page:not(.is-render) {
    .forecast-poster {
      transform: scale(min(1, calc((100vw - 32px) / 1920)));
      margin-bottom: calc((1080px * min(1, calc((100vw - 32px) / 1920))) - 1080px);
    }
  }
}
</style>
