// ================= DESIGN RENDERER =================
// One pure function that draws a stored design on a canvas, with
// no reads from the page. It is used for:
//   - the preview PNG sent with a request (frame and pencils on),
//   - the dashboard's overall view (Phase 3),
//   - the print file (Phase 3: frame and pencils off, 300 DPI).
// It mirrors the board's CSS: positions in % of the board, sizes in
// cqw (1% of the board width), layers photos < quotes < pencils,
// rotation about each item's centre, shadow then opacity.
// Pencils are drawn from their SVG with a small built-in SVG painter
// (not as an <img>), so web fonts and the lead fill always appear.

import { FRAME_SIZES } from "../../../shared/designRules.js"
import { pencilSVG, fontCss } from "./pencilArt"
import { SHAPES, SHAPE_OUTLINES, photoGeom } from "./photoShapes"
import { rgba } from "./designerOptions"

const LAYER = { photo: 1, text: 2, pencil: 3 }

// ================= HELPERS =================

const makeCanvas = (width, height) => {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.ceil(width))
  canvas.height = Math.max(1, Math.ceil(height))
  return canvas
}

const imageCache = new Map()

export function loadImage(src) {
  if (!imageCache.has(src)) {
    imageCache.set(src, new Promise((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = "anonymous"
      image.onload = () => resolve(image)
      image.onerror = () => {
        imageCache.delete(src)
        reject(new Error("Image failed to load"))
      }
      image.src = src
    }))
  }
  return imageCache.get(src)
}

const percent = (value) => parseFloat(value) / 100

// CSS border-radius ("50%", "12%", "50% 50% 0 0 / 40% 40% 0 0")
// as [rx, ry] for the corners TL, TR, BR, BL.
function cornerRadii(radius, w, h) {
  if (!radius) return [[0, 0], [0, 0], [0, 0], [0, 0]]
  const [horizontal, vertical = horizontal] = radius.split("/").map((part) => part.trim().split(/\s+/))
  const expand = (list) => [0, 1, 2, 3].map((i) => list[i] ?? list[i % 2] ?? list[0])
  const hx = expand(horizontal)
  const vy = expand(vertical)
  return [0, 1, 2, 3].map((i) => [percent(hx[i]) * w, percent(vy[i]) * h])
}

function roundedRectPath(x, y, w, h, radii) {
  const [[tlx, tly], [trx, try_], [brx, bry], [blx, bly]] = radii
  const path = new Path2D()
  path.moveTo(x + tlx, y)
  path.lineTo(x + w - trx, y)
  path.ellipse(x + w - trx, y + try_, trx, try_, 0, -Math.PI / 2, 0)
  path.lineTo(x + w, y + h - bry)
  path.ellipse(x + w - brx, y + h - bry, brx, bry, 0, 0, Math.PI / 2)
  path.lineTo(x + blx, y + h)
  path.ellipse(x + blx, y + h - bly, blx, bly, 0, Math.PI / 2, Math.PI)
  path.lineTo(x, y + tly)
  path.ellipse(x + tlx, y + tly, tlx, tly, 0, Math.PI, Math.PI * 1.5)
  path.closePath()
  return path
}

// ================= SVG PAINTER (pencil art) =================
// Supports exactly what pencilSVG emits: g, rect, polygon, path,
// circle, image and text, with translate/scale transforms,
// fill, stroke, opacity and paint-order.

function applyTransform(ctx, transform) {
  if (!transform) return
  for (const [, name, args] of transform.matchAll(/(translate|scale)\(([^)]*)\)/g)) {
    const [a, b] = args.trim().split(/[\s,]+/).map(Number)
    if (name === "translate") ctx.translate(a, b || 0)
    else ctx.scale(a, b ?? a)
  }
}

function paint(ctx, el, drawFill, drawStroke) {
  const fill = el.getAttribute("fill") ?? "#000"
  const stroke = el.getAttribute("stroke")
  const strokeWidth = Number(el.getAttribute("stroke-width") ?? 1)
  const strokeFirst = el.getAttribute("paint-order") === "stroke"
  ctx.lineJoin = el.getAttribute("stroke-linejoin") || "miter"
  ctx.lineCap = el.getAttribute("stroke-linecap") || "butt"

  const doFill = () => {
    if (fill === "none") return
    ctx.fillStyle = fill
    drawFill()
  }
  const doStroke = () => {
    if (!stroke || stroke === "none" || !strokeWidth) return
    ctx.strokeStyle = stroke
    ctx.lineWidth = strokeWidth
    drawStroke()
  }

  if (strokeFirst) {
    doStroke()
    doFill()
  } else {
    doFill()
    doStroke()
  }
}

function drawSvgNode(ctx, el, images) {
  ctx.save()
  applyTransform(ctx, el.getAttribute("transform"))
  const opacity = el.getAttribute("opacity")
  if (opacity !== null) ctx.globalAlpha *= Number(opacity)
  const num = (name) => Number(el.getAttribute(name) || 0)

  switch (el.tagName) {
    case "svg":
    case "g":
      for (const child of el.children) drawSvgNode(ctx, child, images)
      break
    case "rect": {
      const path = new Path2D()
      const rx = num("rx")
      if (rx) path.roundRect(num("x"), num("y"), num("width"), num("height"), rx)
      else path.rect(num("x"), num("y"), num("width"), num("height"))
      paint(ctx, el, () => ctx.fill(path), () => ctx.stroke(path))
      break
    }
    case "polygon": {
      const path = new Path2D("M" + el.getAttribute("points").trim().split(/\s+/).join(" L") + " Z")
      paint(ctx, el, () => ctx.fill(path), () => ctx.stroke(path))
      break
    }
    case "path": {
      const path = new Path2D(el.getAttribute("d"))
      paint(ctx, el, () => ctx.fill(path), () => ctx.stroke(path))
      break
    }
    case "circle": {
      const path = new Path2D()
      path.arc(num("cx"), num("cy"), num("r"), 0, Math.PI * 2)
      paint(ctx, el, () => ctx.fill(path), () => ctx.stroke(path))
      break
    }
    case "image": {
      const image = images.get(el.getAttribute("href"))
      if (image) ctx.drawImage(image, num("x"), num("y"), num("width"), num("height"))
      break
    }
    case "text": {
      const text = el.textContent
      ctx.font = `${el.getAttribute("font-weight") || 400} ${el.getAttribute("font-size")}px ${el.getAttribute("font-family")}`
      ctx.textBaseline = "alphabetic"
      ctx.textAlign = "start"
      paint(ctx, el, () => ctx.fillText(text, 0, 0), () => ctx.strokeText(text, 0, 0))
      break
    }
    default:
      break
  }

  ctx.restore()
}

// Draws pencil art p into a box `width` px wide; returns its height.
async function drawPencil(ctx, art, width) {
  const svg = new DOMParser().parseFromString(pencilSVG(art), "image/svg+xml").documentElement
  const viewWidth = Number(svg.getAttribute("viewBox").split(" ")[2])
  const hrefs = [...svg.querySelectorAll("image")].map((image) => image.getAttribute("href"))
  const images = new Map(await Promise.all(hrefs.map(async (href) => [href, await loadImage(href)])))

  ctx.save()
  ctx.scale(width / viewWidth, width / viewWidth)
  drawSvgNode(ctx, svg, images)
  ctx.restore()
  return (width * 120) / viewWidth
}

// ================= ITEMS =================

// Each item is drawn unrotated into its own canvas (box + pad),
// then shadowed, rotated and faded onto the board like CSS does.
async function renderItem(item, cq, photoSource) {
  const pad = Math.ceil(cq * 3)

  if (item.type === "pencil") {
    const width = (item.w / 100) * cq * 100
    const probe = makeCanvas(1, 1)
    const height = await drawPencil(probe.getContext("2d"), item.p, width)
    const canvas = makeCanvas(width + pad * 2, height + pad * 2)
    const ctx = canvas.getContext("2d")
    ctx.translate(pad, pad)
    await drawPencil(ctx, item.p, width)
    return { canvas, pad, width, height }
  }

  if (item.type === "photo") {
    const image = await loadImage(photoSource(item))
    const shape = SHAPES[item.shape] || SHAPES.free
    const geom = photoGeom(item)
    const width = (item.w / 100) * cq * 100
    const height = width / geom.A
    const canvas = makeCanvas(width + pad * 2, height + pad * 2)
    const ctx = canvas.getContext("2d")
    ctx.translate(pad, pad)

    // Content box inside the border (masked shapes have no border).
    const border = shape.m ? 0 : item.bd * cq
    const inner = { x: border, y: border, w: width - border * 2, h: height - border * 2 }

    ctx.save()
    if (shape.m) {
      const outline = SHAPE_OUTLINES[item.shape]
      const [vx, vy, vw, vh] = outline.vb
      const sx = width / vw
      const sy = height / vh
      // The mask is stretched to the box (preserveAspectRatio none).
      const path = new Path2D()
      path.addPath(new Path2D(outline.d), new DOMMatrix([sx, 0, 0, sy, -vx * sx, -vy * sy]))
      ctx.clip(path)
    } else {
      const outer = cornerRadii(shape.r, width, height)
      if (border > 0) {
        ctx.fillStyle = item.bc
        ctx.fill(roundedRectPath(0, 0, width, height, outer))
      }
      const innerRadii = outer.map(([rx, ry]) => [Math.max(0, rx - border), Math.max(0, ry - border)])
      ctx.clip(roundedRectPath(inner.x, inner.y, inner.w, inner.h, innerRadii))
    }

    ctx.drawImage(
      image,
      inner.x + percent(geom.img.left) * inner.w,
      inner.y + percent(geom.img.top) * inner.h,
      percent(geom.img.width) * inner.w,
      percent(geom.img.height) * inner.h,
    )
    ctx.restore()
    return { canvas, pad, width, height }
  }

  // Quote: white-space: pre, line-height 1.15, text-align in its box.
  const fontPx = item.fs * cq
  const font = `${item.i ? "italic " : ""}${item.b ? 700 : 400} ${fontPx}px '${item.font}', cursive`
  const lines = item.text.split("\n")
  const measure = makeCanvas(1, 1).getContext("2d")
  measure.font = font
  if ("letterSpacing" in measure) measure.letterSpacing = `${item.ls * cq}px`
  const widths = lines.map((line) => measure.measureText(line).width)
  const metrics = measure.measureText("Hg")
  const ascent = metrics.fontBoundingBoxAscent ?? fontPx * 0.8
  const descent = metrics.fontBoundingBoxDescent ?? fontPx * 0.2
  const lineHeight = fontPx * 1.15
  const width = Math.max(1, ...widths)
  const height = lineHeight * lines.length
  const textPad = pad + Math.ceil(fontPx * 0.5 + item.sw * cq)

  const canvas = makeCanvas(width + textPad * 2, height + textPad * 2)
  const ctx = canvas.getContext("2d")
  ctx.translate(textPad, textPad)
  ctx.font = font
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${item.ls * cq}px`
  ctx.textBaseline = "alphabetic"
  ctx.fillStyle = item.color
  ctx.strokeStyle = item.sc
  ctx.lineWidth = item.sw * cq
  ctx.lineJoin = "round"

  lines.forEach((line, index) => {
    const x = item.al === "center" ? (width - widths[index]) / 2 : item.al === "right" ? width - widths[index] : 0
    const y = index * lineHeight + (lineHeight - (ascent + descent)) / 2 + ascent
    // paint-order: stroke fill
    if (item.sw > 0) ctx.strokeText(line, x, y)
    ctx.fillText(line, x, y)
  })

  return { canvas, pad: textPad, width, height }
}

// ================= WHOLE DESIGN =================

// design: { frame, items } as stored (validated).
// options:
//   ppi              pixels per inch of the output
//   includeFrame     draw the frame moulding around the art
//   includePencils   draw the pencil arts
//   includeBackground draw the background colour
//   clearAs          "checker" (preview) or "transparent" (print)
//   photoSource      item => image URL for that photo
export async function renderDesign(design, {
  ppi = 120,
  includeFrame = true,
  includePencils = true,
  includeBackground = true,
  clearAs = "checker",
  photoSource = (item) => item.src,
} = {}) {
  const { frame } = design
  const [pw, ph] = FRAME_SIZES[frame.size]
  const [w, h] = frame.orientation === "P" ? [pw, ph] : [ph, pw]
  const t = includeFrame ? frame.thickness : 0

  const canvas = makeCanvas((w + 2 * t) * ppi, (h + 2 * t) * ppi)
  const ctx = canvas.getContext("2d")
  const ox = t * ppi
  const oy = t * ppi
  const boardW = w * ppi
  const boardH = h * ppi
  const cq = boardW / 100
  const hairline = Math.max(1, boardW / 300)

  // Fonts must be ready before measuring or drawing text.
  const fonts = new Set()
  design.items.forEach((item) => {
    if (item.type === "text") fonts.add(`${item.b ? 700 : 400} 24px '${item.font}'`)
    if (item.type === "pencil") fonts.add(fontCss(item.p.font, 24))
  })
  await Promise.all([...fonts].map((font) => document.fonts.load(font, "Aaఅ").catch(() => null)))

  if (includeFrame) {
    ctx.fillStyle = frame.frameColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "rgba(0,0,0,0.35)"
    ctx.lineWidth = hairline
    ctx.strokeRect(hairline / 2, hairline / 2, canvas.width - hairline, canvas.height - hairline)
  }

  ctx.save()
  ctx.beginPath()
  ctx.rect(ox, oy, boardW, boardH)
  ctx.clip()

  // ================= BACKGROUND =================

  if (frame.background === "transparent") {
    if (clearAs === "checker") {
      const tile = boardW / 30
      for (let y = 0; y * tile < boardH; y++) {
        for (let x = 0; x * tile < boardW; x++) {
          ctx.fillStyle = (x + y) % 2 ? "#f2f2f2" : "#c9c9c9"
          ctx.fillRect(ox + x * tile, oy + y * tile, tile, tile)
        }
      }
    }
  } else if (includeBackground) {
    ctx.fillStyle = frame.background
    ctx.fillRect(ox, oy, boardW, boardH)
  }

  // ================= ITEMS =================

  const items = design.items
    .filter((item) => includePencils || item.type !== "pencil")
    .map((item, index) => ({ item, index }))
    .sort((a, b) => LAYER[a.item.type] - LAYER[b.item.type] || a.index - b.index)
    .map(({ item }) => item)

  for (const item of items) {
    const drawn = await renderItem(item, cq, photoSource)
    let source = drawn.canvas
    let offset = drawn.pad

    // drop-shadow / text-shadow: in the item's own (unrotated) space.
    if (item.sho && item.type !== "pencil") {
      const margin = Math.ceil(item.shb * cq * 2 + Math.max(Math.abs(item.shx), Math.abs(item.shy)) * cq + 2)
      const shadowed = makeCanvas(source.width + margin * 2, source.height + margin * 2)
      const sctx = shadowed.getContext("2d")
      sctx.shadowColor = rgba(item.shc, item.sha)
      sctx.shadowBlur = item.shb * cq
      sctx.shadowOffsetX = item.shx * cq
      sctx.shadowOffsetY = item.shy * cq
      sctx.drawImage(source, margin, margin)
      source = shadowed
      offset += margin
    }

    const x = ox + (item.x / 100) * boardW
    const y = oy + (item.y / 100) * boardH
    ctx.save()
    ctx.translate(x + drawn.width / 2, y + drawn.height / 2)
    ctx.rotate(((item.rot || 0) * Math.PI) / 180)
    ctx.globalAlpha = item.type === "pencil" ? 1 : item.op / 100
    ctx.drawImage(source, -drawn.width / 2 - offset, -drawn.height / 2 - offset)
    ctx.restore()
  }

  // Glass sheen over a clear background, like the board.
  if (frame.background === "transparent" && clearAs === "checker") {
    const angle = (115 * Math.PI) / 180
    const dx = Math.sin(angle)
    const dy = -Math.cos(angle)
    const half = (Math.abs(boardW * dx) + Math.abs(boardH * dy)) / 2
    const cx = ox + boardW / 2
    const cy = oy + boardH / 2
    const sheen = ctx.createLinearGradient(cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half)
    sheen.addColorStop(0, "rgba(255,255,255,0.45)")
    sheen.addColorStop(0.4, "rgba(255,255,255,0)")
    ctx.fillStyle = sheen
    ctx.fillRect(ox, oy, boardW, boardH)
  }

  ctx.restore()

  if (includeFrame) {
    ctx.strokeStyle = "rgba(0,0,0,0.28)"
    ctx.lineWidth = hairline * 2
    ctx.strokeRect(ox + hairline, oy + hairline, boardW - hairline * 2, boardH - hairline * 2)
  }

  return canvas
}

export const canvasToBlob = (canvas, type = "image/png", quality) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create the image"))), type, quality)
  )
