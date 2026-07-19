/**
 * 竞猜海报静态素材入口。
 * 用户交付正式底图/页脚/二维码后，只需替换同名文件或改这里的引用。
 *
 * 约定：
 * - background：全幅底图（建议 3840×2160，前端按 1920×1080 CSS 显示），不含动态文字
 * - header：页眉品牌/活动标题层（不含比赛元信息与截止时间）
 * - footerBanner：页脚营销横幅（奖品区 + CTA 文案；二维码可留空位）
 * - qrCode：小程序码
 */
import backgroundUrl from './background.svg'
import headerUrl from './header.svg'
import footerBannerUrl from './footer-banner.svg'
import qrCodeUrl from './qr-code.jpg'

export const forecastAssets = {
  backgroundUrl,
  headerUrl,
  footerBannerUrl,
  qrCodeUrl,
} as const
