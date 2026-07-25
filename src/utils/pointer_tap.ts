export const POINTER_TAP_SLOP_PX = 10

export function isPointerTap(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  slop = POINTER_TAP_SLOP_PX,
): boolean {
  return Math.hypot(endX - startX, endY - startY) <= slop
}
