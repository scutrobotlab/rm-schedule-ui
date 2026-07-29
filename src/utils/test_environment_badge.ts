function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('failed to load exported image'))
    image.src = dataUrl
  })
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
}

/** 将测试环境标记直接绘制进导出的 PNG，避免 DOM 外层角标被截图范围排除。 */
export async function addTestEnvironmentBadge(dataUrl: string): Promise<string> {
  const image = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const context = canvas.getContext('2d')
  if (!context) throw new Error('failed to create export canvas')
  context.drawImage(image, 0, 0)

  const scale = Math.max(1, Math.min(canvas.width, canvas.height) / 1080)
  const fontSize = Math.round(34 * scale)
  const horizontalPadding = Math.round(28 * scale)
  const verticalPadding = Math.round(14 * scale)
  const margin = Math.round(22 * scale)
  const borderWidth = Math.max(2, Math.round(3 * scale))
  const radius = Math.round(10 * scale)

  await document.fonts?.load(`800 ${fontSize}px MyFont`)
  context.font = `800 ${fontSize}px MyFont, sans-serif`
  context.textBaseline = 'middle'
  const text = '测试环境'
  const width = Math.ceil(context.measureText(text).width) + horizontalPadding * 2
  const height = fontSize + verticalPadding * 2
  const x = canvas.width - margin - width
  const y = canvas.height - margin - height

  context.save()
  context.globalAlpha = 0.9
  roundedRect(context, x, y, width, height, radius)
  context.fillStyle = 'rgb(194 55 24)'
  context.fill()
  context.lineWidth = borderWidth
  context.strokeStyle = '#fff'
  context.stroke()
  context.fillStyle = '#fff8dc'
  context.fillText(text, x + horizontalPadding, y + height / 2)
  context.restore()

  return canvas.toDataURL('image/png')
}
