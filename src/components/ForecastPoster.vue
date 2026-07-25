<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import type { CurrentMatchForecastResp, ForecastSide } from '../types/current_match_forecast'
import {
  fetchCurrentMatchForecast,
  formatMatchMeta,
  hasValidSupportRate,
} from '../utils/current_match_forecast'
import { StaticCDN } from '../utils/cdn'
import { forecastAssets } from '@/assets/forecast'

const FORECAST_IMAGE_URL = '/api/current_match_forecast_image'
const FORECAST_IMAGE_FILENAME_FALLBACK = 'current-match-forecast.png'
/** chromedp 渲染可能较慢，下载超时放宽到 120s */
const FORECAST_IMAGE_TIMEOUT_MS = 120_000

const { backgroundUrl, schoolRedUrl, schoolBlueUrl } = forecastAssets

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
const downloading = ref(false)
const downloadError = ref('')

const isRenderMode = computed(() => String(route.query.render ?? '') === '1')
const hasMatch = computed(() => Boolean(forecast.value?.has_match))
const downloadFilename = computed(() => {
  const matchId = forecast.value?.match_id
  return typeof matchId === 'number' && Number.isFinite(matchId) && matchId > 0
    ? `current-match-forecast-${matchId}.png`
    : FORECAST_IMAGE_FILENAME_FALLBACK
})

const matchMeta = computed(() => {
  if (!forecast.value?.has_match) return ''
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

const displayPercentByTeam = computed<Record<TeamRowKey, number | null>>(() => {
  if (!forecast.value?.has_match || !supportRatesAvailable.value) {
    return { red: null, blue: null }
  }

  const red = forecast.value.red_side
  const blue = forecast.value.blue_side
  const displayed = {
    red: red.support_rate_percent,
    blue: blue.support_rate_percent,
  }
  const sum = displayed.red + displayed.blue
  if (sum === 100) return displayed

  const adjustment = sum < 100 ? 1 : -1
  const redAdjustmentError =
    Math.abs(displayed.red + adjustment - red.support_rate * 100) +
    Math.abs(displayed.blue - blue.support_rate * 100)
  const blueAdjustmentError =
    Math.abs(displayed.red - red.support_rate * 100) +
    Math.abs(displayed.blue + adjustment - blue.support_rate * 100)

  if (redAdjustmentError <= blueAdjustmentError) {
    displayed.red += adjustment
  } else {
    displayed.blue += adjustment
  }
  return displayed
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

function percentLabel(key: TeamRowKey, side: ForecastSide): string {
  if (!hasValidSupportRate(side.support_rate_percent)) return '暂无'
  return `${displayPercentByTeam.value[key] ?? side.support_rate_percent}%`
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

async function downloadPng() {
  if (downloading.value) return
  downloading.value = true
  downloadError.value = ''
  try {
    const response = await axios.get<Blob>(FORECAST_IMAGE_URL, {
      responseType: 'blob',
      timeout: FORECAST_IMAGE_TIMEOUT_MS,
    })
    const contentType = String(response.headers['content-type'] ?? '')
    if (!contentType.includes('image/png')) {
      const text = await response.data.text()
      throw new Error(text || '下载失败：响应不是 PNG')
    }
    const objectUrl = URL.createObjectURL(response.data)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = downloadFilename.value
    anchor.click()
    URL.revokeObjectURL(objectUrl)
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.code === 'ECONNABORTED') {
        downloadError.value = `下载超时（${FORECAST_IMAGE_TIMEOUT_MS / 1000}s）`
      } else if (err.response?.data instanceof Blob) {
        downloadError.value = (await err.response.data.text()) || `下载失败（HTTP ${err.response.status}）`
      } else {
        downloadError.value = err.message || '下载失败'
      }
    } else {
      downloadError.value = err instanceof Error ? err.message : String(err)
    }
  } finally {
    downloading.value = false
  }
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
      <div class="forecast-chrome__row">
        <div class="forecast-chrome__copy">
          <div class="forecast-chrome__title">王牌预言家 · 海报预览</div>
          <div class="forecast-chrome__hint">
            画幅 1920×1080 · 导出 PNG 为 3840×2160 · 状态 {{ status }}
          </div>
        </div>
        <button
          type="button"
          class="forecast-chrome__download"
          :disabled="downloading"
          @click="downloadPng"
        >
          {{ downloading ? '生成中…' : '下载 PNG' }}
        </button>
      </div>
      <div v-if="downloadError" class="forecast-chrome__error">{{ downloadError }}</div>
    </div>

    <div
      id="forecast-poster"
      ref="posterRef"
      class="forecast-poster"
      :data-status="status"
      :data-error="errorMessage || undefined"
    >
      <img class="forecast-poster__bg" :src="backgroundUrl" alt="" draggable="false" />
      <div class="forecast-poster__panel-clarifier" aria-hidden="true" />

      <div class="forecast-poster__meta">
        <div
          v-if="deadlineText"
          class="forecast-poster__deadline"
        >
          数据截止时间：{{ deadlineText }}
        </div>
        <div
          v-if="matchMeta"
          class="forecast-poster__match"
        >
          {{ matchMeta }}
        </div>
      </div>

      <div class="forecast-poster__teams">
        <div
          v-if="forecast && hasMatch && !supportRatesAvailable"
          class="forecast-poster__rate-unavailable"
        >
          支持率暂不可用
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
            {{ percentLabel(row.key, row.side) }}
          </div>
        </div>
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

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  &__copy {
    min-width: 0;
  }

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

  &__download {
    flex: 0 0 auto;
    padding: 10px 18px;
    border: 1px solid #5ec8e8;
    border-radius: 6px;
    background: rgba(94, 200, 232, 0.12);
    color: #5ec8e8;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: rgba(94, 200, 232, 0.22);
    }

    &:disabled {
      opacity: 0.55;
      cursor: wait;
    }
  }

  &__error {
    margin-top: 8px;
    color: #ff8f8f;
    font-size: 13px;
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

  &__panel-clarifier {
    position: absolute;
    top: 280px;
    right: 212px;
    bottom: 280px;
    left: 160px;
    z-index: 1;
    border-radius: 36px;
    background: rgba(255, 255, 255, 0.015);
    backdrop-filter: brightness(1.08);
    pointer-events: none;
  }

  &__meta {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  &__match {
    position: absolute;
    top: 330px;
    left: 154px;
    right: 206px;
    color: #f5bd3b;
    font-size: 34px;
    font-weight: 700;
    letter-spacing: 1px;
    line-height: 1.3;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__deadline {
    position: absolute;
    top: 197px;
    left: 980px;
    right: 180px;
    color: #d7dde8;
    font-size: 32px;
    font-weight: 500;
    line-height: 1.3;
    text-align: right;
    white-space: nowrap;
  }

  &__teams {
    position: absolute;
    top: 361px;
    bottom: 299px;
    left: calc(50% - 26px);
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 76px;
    width: min(1480px, calc(100% - 200px));
    transform: translateX(-50%);
  }

  &__rate-unavailable {
    color: #c5a35a;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: -32px;
    width: 100%;
    text-align: center;
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
  --logo-column-width: 124px;
  --name-column-width: 336px;
  --bar-column-width: 700px;
  --percent-column-width: 100px;
  display: grid;
  grid-template-columns:
    var(--logo-column-width)
    var(--name-column-width)
    var(--bar-column-width)
    var(--percent-column-width);
  align-items: center;
  justify-content: center;
  column-gap: 24px;
  width: 100%;
  max-width: 1332px;
  height: 124px;

  &--red {
    transform: translateY(20px);
  }

  &.is-placeholder {
    .forecast-team__college,
    .forecast-team__team {
      color: #8b93a3;
    }
  }

  &__logo-wrap {
    width: var(--logo-column-width);
    height: var(--logo-column-width);
  }

  &__logo {
    width: var(--logo-column-width);
    height: var(--logo-column-width);
    border-radius: 50%;
    object-fit: contain;
    background: #fff;
  }

  &__names {
    width: var(--name-column-width);
    min-width: var(--name-column-width);
    max-width: var(--name-column-width);
    overflow: visible;
  }

  &__college {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.25;
    white-space: nowrap;
  }

  &__team {
    margin-top: 6px;
    font-size: 25px;
    color: #b7c0cf;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  &__bar-track {
    --bar-cut: 34px;
    position: relative;
    width: var(--bar-column-width);
    min-width: var(--bar-column-width);
    max-width: var(--bar-column-width);
    height: 42px;
    background: rgba(143, 144, 146, 0.65);
    overflow: hidden;
    justify-self: center;
    /* 右下角切角直至上边：从右上角斜切到下边 */
    clip-path: polygon(0 0, 100% 0, calc(100% - var(--bar-cut)) 100%, 0 100%);

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
    background: rgba(245, 189, 59, 0.9);
    /* 与底轨同切角尺寸/角度，斜边落在当前进度右端 */
    clip-path: polygon(0 0, 100% 0, calc(100% - var(--bar-cut)) 100%, 0 100%);

    &.is-animated {
      transition: width 0.6s ease;
    }
  }

  &__bar-unavailable {
    font-size: 16px;
    color: #8b93a3;
    letter-spacing: 2px;
  }

  &__percent {
    width: var(--percent-column-width);
    min-width: var(--percent-column-width);
    max-width: var(--percent-column-width);
    text-align: right;
    font-size: 34px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: #f2f4f7;

    &.is-unavailable {
      font-size: 30px;
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
