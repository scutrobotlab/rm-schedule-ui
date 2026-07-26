export const POINTER_TAP_SLOP_PX = 10
export const POINTER_PAN_AXIS_SLOP_PX = 3
export const POINTER_PAN_X_BIAS = 1.35

export function isPointerTap(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  slop = POINTER_TAP_SLOP_PX,
): boolean {
  return Math.hypot(endX - startX, endY - startY) <= slop
}

/** 与 bracket 横向跟手手势一致：一旦达到横滑判定，就不再视为可长按。 */
export function isHorizontalPointerPan(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): boolean {
  const dx = endX - startX
  const dy = endY - startY
  if (
    Math.abs(dx) < POINTER_PAN_AXIS_SLOP_PX &&
    Math.abs(dy) < POINTER_PAN_AXIS_SLOP_PX
  ) {
    return false
  }
  return Math.abs(dx) * POINTER_PAN_X_BIAS >= Math.abs(dy)
}
