// ================= PENCIL ART RENDERER =================
// Port of the prototype's pencilSVG / leadMask / edt / symSVG
// (Downloads/microarts-designer.html). The geometry and the
// constants are Vivek's tuned values: change them only on purpose.
//
// The lead diameter is 4 mm = 22 SVG units (5.5 units per mm).
// Letters are silver with a thin lead outline, no shadow. Holes
// and narrow gaps behind the letters are filled with lead using
// a canvas bitmap (flood fill + morphological closing through a
// distance transform), not SVG filters, which spiked in Safari.

import { artText } from "../../../shared/designPricing.js"
import { graphemes } from "../../../shared/designRules.js"

export const LEAD = "#3a3c40"
export const INK = "#eceeef"

// Mask bitmap scale (pixels per SVG unit) and horizontal tightening.
const SC = 5
const TS = 0.95

// Per-font tuning: fs = preview size, b = outline width, wt = weight.
// Anton and Chathura get extra stroke weight; Chathura is drawn
// at 800 plus stroke to look like roughly 1100-1200.
const CFG = {
  "Magnolia Script": { fs: 20 },
  "Bebas Neue": { fs: 29 },
  "Permanent Marker": { fs: 19 },
  Anton: { fs: 22, b: 0.9 },
  Chathura: { fs: 20, wt: 800, b: 1.4 },
}

export const fontCss = (font, fs, k = 1) =>
  `${(CFG[font] || {}).wt || 400} ${fs * k}px '${font}', cursive`

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])

// One shared measuring context.
let measureContext = null

const measurer = () => {
  if (!measureContext) {
    measureContext = document.createElement("canvas").getContext("2d")
  }
  return measureContext
}

// Font size that makes the full art height (tallest letter to
// lowest tail, plus outline) equal the lead diameter.
function fitFs(font, txt, D, bw) {
  const cv = measurer()
  cv.font = fontCss(font, 40)
  const m = cv.measureText(txt)
  const a = m.actualBoundingBoxAscent ?? 28
  const d = m.actualBoundingBoxDescent ?? 0
  const fs = Math.min(40, Math.max(8, ((D - bw) * 40) / ((a + d) || 28)))
  return { fs, A: (a * fs) / 40, Dd: (d * fs) / 40 }
}

function met(font, fs, s) {
  const cv = measurer()
  cv.font = fontCss(font, fs)
  const m = cv.measureText(s)
  return { w: m.width, a: m.actualBoundingBoxAscent ?? fs * 0.7 }
}

// ================= DISTANCE TRANSFORM =================
// Exact squared Euclidean distance transform (Felzenszwalb),
// in place on f (W × H).

function edt(f, W, H) {
  const n = Math.max(W, H)
  const v = new Int32Array(n)
  const z = new Float64Array(n + 1)
  const g = new Float64Array(n)
  const o = new Float64Array(n)
  const sf = (q, p) => ((g[q] + q * q) - (g[p] + p * p)) / (2 * q - 2 * p)

  const run = (len) => {
    let k = 0
    v[0] = 0
    z[0] = -1e20
    z[1] = 1e20
    for (let q = 1; q < len; q++) {
      let s = sf(q, v[k])
      while (s <= z[k]) {
        k--
        s = sf(q, v[k])
      }
      k++
      v[k] = q
      z[k] = s
      z[k + 1] = 1e20
    }
    k = 0
    for (let q = 0; q < len; q++) {
      while (z[k + 1] < q) k++
      o[q] = (q - v[k]) * (q - v[k]) + g[v[k]]
    }
  }

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) g[y] = f[y * W + x]
    run(H)
    for (let y = 0; y < H; y++) f[y * W + x] = o[y]
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) g[x] = f[y * W + x]
    run(W)
    for (let x = 0; x < W; x++) f[y * W + x] = o[x]
  }
}

// ================= LEAD MASK =================
// Letters + every enclosed hole + narrow gaps (closing radius
// 3 units), drawn as an image behind the silver letters.
// Cached once the font has loaded.

const maskCache = new Map()

export function leadMask(word, font, fs, sw) {
  const key = [word, font, fs, sw].join("|")
  const ok = document.fonts.check(fontCss(font, fs), word)
  if (ok && maskCache.has(key)) return maskCache.get(key)

  const pad = 7
  const asc = fs * 1.3
  const desc = fs * 0.6
  const wU = met(font, fs, word).w * TS
  const W = Math.ceil((wU + 2 * pad) * SC)
  const H = Math.ceil((asc + desc + 2 * pad) * SC)
  const N = W * H

  const c = document.createElement("canvas")
  c.width = W
  c.height = H
  const x = c.getContext("2d")
  x.setTransform(TS * SC, 0, 0, SC, pad * SC, (pad + asc) * SC)
  x.font = fontCss(font, fs)
  x.textBaseline = "alphabetic"
  x.lineJoin = "round"
  x.lineWidth = sw
  x.fillStyle = x.strokeStyle = "#000"
  x.fillText(word, 0, 0)
  if (sw) x.strokeText(word, 0, 0)

  const d = x.getImageData(0, 0, W, H).data
  const A = new Uint8Array(N)
  for (let i = 0; i < N; i++) A[i] = d[i * 4 + 3] > 110 ? 1 : 0

  // Flood fill the outside; whatever is not reached is a hole.
  const O = new Uint8Array(N)
  const q = new Int32Array(N)
  let qh = 0
  let qt = 0
  const push = (i) => {
    if (!A[i] && !O[i]) {
      O[i] = 1
      q[qt++] = i
    }
  }
  for (let i = 0; i < W; i++) {
    push(i)
    push((H - 1) * W + i)
  }
  for (let j = 0; j < H; j++) {
    push(j * W)
    push(j * W + W - 1)
  }
  while (qh < qt) {
    const i = q[qh++]
    const xx = i % W
    if (xx > 0) push(i - 1)
    if (xx < W - 1) push(i + 1)
    if (i >= W) push(i - W)
    if (i < N - W) push(i + W)
  }

  // Morphological closing: dilate, then erode, radius 3 units.
  const r2 = (3 * SC) * (3 * SC)
  const F = new Float64Array(N)
  for (let i = 0; i < N; i++) F[i] = A[i] ? 0 : 1e9
  edt(F, W, H)
  for (let i = 0; i < N; i++) F[i] = F[i] <= r2 ? 1e9 : 0
  edt(F, W, H)

  const img = x.createImageData(W, H)
  const u = img.data
  for (let i = 0; i < N; i++) {
    if (A[i] || !O[i] || F[i] > r2) {
      u[i * 4] = 58
      u[i * 4 + 1] = 60
      u[i * 4 + 2] = 64
      u[i * 4 + 3] = 255
    }
  }

  const c2 = document.createElement("canvas")
  c2.width = W
  c2.height = H
  c2.getContext("2d").putImageData(img, 0, 0)

  const res = { src: c2.toDataURL("image/png"), x: -pad, y: -(pad + asc), w: W / SC, h: H / SC }
  if (ok) maskCache.set(key, res)
  return res
}

// ================= SYMBOLS =================

export const HEART_PATH =
  "M50 86C12 58 2 40 2 26 2 11 13 2 27 2 37 2 45 7 50 15 55 7 63 2 73 2 87 2 98 11 98 26 98 40 88 58 50 86Z"

// Small heart: 1.8 mm, sits at the bottom of the line.
// Others: full lead height (4 mm).
function symItem(sy, yb, D) {
  if (sy.t === "h1") {
    const H = D * 0.45
    return { sym: sy, H, w: H * 1.14, fa: H, fd: 0, la: H, ld: 0 }
  }
  const a = yb - (60 - D / 2)
  const d = 60 + D / 2 - yb
  return { sym: sy, H: D, w: sy.t === "sm" ? D : D * 1.14, fa: a, fd: d, la: a, ld: d }
}

function symSVG(it, x0, yb, D) {
  const sy = it.sym
  const H = it.H
  const s = H / 84
  const top = sy.t === "h1" ? yb - H : 60 - D / 2
  const ox = x0 - 2 * s
  const oy = top - 2 * s
  const hp = (c, sc, tx, ty, sw) =>
    `<path d="${HEART_PATH}" transform="translate(${tx},${ty}) scale(${sc})" fill="${c}" stroke="${LEAD}" stroke-width="${sw / sc}" stroke-linejoin="round" paint-order="stroke"/>`

  if (sy.t === "h1") return hp(INK, s, ox, oy, 3)
  if (sy.t === "h2") return hp(sy.c || INK, s, ox, oy, 3)
  if (sy.t === "h3") return hp(sy.c || INK, s, ox, oy, 3) + hp(sy.c2 || LEAD, s * 0.5, ox + 25 * s, oy + 20 * s, 1.6)

  const r = D / 2
  const cx = x0 + r
  const fc = sy.c || INK
  return `<circle cx="${cx}" cy="60" r="${r}" fill="${fc}" stroke="${LEAD}" stroke-width="3" paint-order="stroke"/><circle cx="${cx - r * 0.35}" cy="${60 - r * 0.2}" r="${r * 0.13}" fill="${LEAD}"/><circle cx="${cx + r * 0.35}" cy="${60 - r * 0.2}" r="${r * 0.13}" fill="${LEAD}"/><path d="M${cx - r * 0.5} ${60 + r * 0.15}Q${cx} ${60 + r * 0.75} ${cx + r * 0.5} ${60 + r * 0.15}" fill="none" stroke="${LEAD}" stroke-width="${r * 0.16}" stroke-linecap="round"/>`
}

// ================= PENCIL SVG =================
// Returns the full SVG markup for one pencil art (viewBox W × 120).

export function pencilSVG(p) {
  const cf = CFG[p.font] || CFG["Permanent Marker"]
  const txt = artText(p)
  const D = 22
  const bw = cf.b || 1.2
  const ft = fitFs(p.font, txt, D - 2.2, bw)
  const fs = ft.fs
  // B = painted wood, C = sharpened cone, N = neck
  const B = 110
  const C = 72
  const N = 22
  const E = B + C + N
  const gap = fs * 0.14

  const items = txt.split(/\s+/).map((w) => {
    const g = graphemes(w)
    const m = met(p.font, fs, w)
    const f1 = met(p.font, fs, g[0])
    const l1 = met(p.font, fs, g[g.length - 1])
    return { t: w, w: m.w * TS, fa: f1.a + bw / 2, fd: 0, la: l1.a + bw / 2, ld: 0 }
  })

  // Text vertically centred on the pencil axis.
  const yb = 60 + (ft.A - ft.Dd) / 2
  ;(p.syms || []).forEach((sy) => items.push(symItem(sy, yb, D)))

  let tw = 0
  items.forEach((it, i) => {
    it.x = tw
    tw += it.w + (i < items.length - 1 ? gap : 0)
  })

  // Necks narrow from full lead height to the first/last letter height.
  const Z = tw
  const hc = (h) => {
    const v = Math.min(D, Math.max(6, h * 0.92))
    return { t: 60 - v / 2, b: 60 + v / 2 }
  }
  const fi = items[0]
  const lt = items[items.length - 1]
  const hL = hc(fi.fa + fi.fd)
  const hR = hc(lt.la + lt.ld)
  const W = p.ends === 2 ? 2 * E + Z : E + Z + 10

  const carp = p.kind === "carp"
  const T = carp ? 22 : 28
  const Bt = carp ? 98 : 92

  const end = (x, h) => {
    const e = x + B
    const t = x + B + C
    let g = `<rect x="${x}" y="${T}" width="${B}" height="${Bt - T}" fill="${p.color}"/>`
    if (carp) {
      g += `<rect x="${x}" y="${T + 6}" width="${B}" height="10" fill="#fff" opacity=".22"/><rect x="${x}" y="${Bt - 8}" width="${B}" height="8" fill="#000" opacity=".16"/>`
    } else {
      g += `<rect x="${x}" y="44" width="${B}" height="32" fill="#fff" opacity=".16"/><rect x="${x}" y="43" width="${B}" height="2" fill="#000" opacity=".3"/><rect x="${x}" y="75" width="${B}" height="2" fill="#000" opacity=".3"/>`
    }
    g += `<polygon points="${e},${T} ${t},${60 - D / 2} ${t},${60 + D / 2} ${e},${Bt}" fill="#e8c48b"/>`
    if (!carp) {
      g += `<polygon points="${e},46 ${e + 26},60 ${e},74" fill="${p.color}"/><polygon points="${e},28 ${e + 14},35 ${e},43" fill="${p.color}"/><polygon points="${e},77 ${e + 14},85 ${e},92" fill="${p.color}"/>`
    }
    // Neck: symmetrical about the axis, tucked under the first letter.
    return g + `<polygon points="${t - 2},${60 - D / 2} ${t + N},${h.t} ${t + N + 5},${h.t} ${t + N + 5},${h.b} ${t + N},${h.b} ${t - 2},${60 + D / 2}" fill="${LEAD}"/>`
  }

  const f = `'${p.font}',cursive`
  const wa = cf.wt ? ` font-weight="${cf.wt}"` : ""

  let s = `<svg viewBox="0 0 ${W} 120" xmlns="http://www.w3.org/2000/svg">${end(0, hL)}${
    p.ends === 2
      ? `<g transform="translate(${W},0) scale(-1,1)">${end(0, hR)}</g>`
      : `<rect x="${E + Z - 3}" y="${hR.t}" width="12" height="${hR.b - hR.t}" rx="3" fill="${LEAD}"/>`
  }`

  // Lead bridge between words: height of the smaller neighbouring
  // letter, above the baseline only.
  items.forEach((it, i) => {
    const n = items[i + 1]
    if (!n) return
    const u = (it.la + it.ld) <= (n.fa + n.fd) ? { a: it.la, d: it.ld } : { a: n.fa, d: n.fd }
    s += `<rect x="${E + it.x + it.w - 5}" y="${yb - u.a}" width="${n.x - it.x - it.w + 10}" height="${u.a + u.d}" fill="${LEAD}"/>`
  })

  items.forEach((it) => {
    if (it.sym) return
    const m = leadMask(it.t, p.font, fs, bw)
    s += `<image href="${m.src}" x="${E + it.x + m.x}" y="${yb + m.y}" width="${m.w}" height="${m.h}"/>`
  })

  items.forEach((it) => {
    if (it.sym) return
    const tr = `translate(${E + it.x},${yb}) scale(${TS},1)`
    s += `<text transform="${tr}" font-family="${f}" font-size="${fs}"${wa} fill="${LEAD}" stroke="${LEAD}" stroke-width="${bw + 2.2}" stroke-linejoin="round">${esc(it.t)}</text><text transform="${tr}" font-family="${f}" font-size="${fs}"${wa} fill="${INK}" stroke="${INK}" stroke-width="${bw}" stroke-linejoin="round">${esc(it.t)}</text>`
  })

  items.forEach((it) => {
    if (it.sym) s += symSVG(it, E + it.x, yb, D)
  })

  return s + "</svg>"
}
