/**
 * 竞猜海报静态素材入口。
 *
 * 约定：
 * - background：全幅底图（当前 4106×2284，前端按 1920×1080 CSS 居中裁切显示）
 *   须包含左上/右上首行品牌区与底部横幅等静态视觉；动态层只叠元信息与对阵行
 * - schoolRed / schoolBlue：无比赛或缺校徽时的默认占位
 */
import backgroundUrl from './background.jpg'
import schoolRedUrl from '../school_red.png'
import schoolBlueUrl from '../school_blue.png'

export const forecastAssets = {
  backgroundUrl,
  schoolRedUrl,
  schoolBlueUrl,
} as const
