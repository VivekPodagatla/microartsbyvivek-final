// ================= PHOTO SHAPES =================
// Port of the prototype's SHAPES / mask / photoGeom.
// Masked shapes (heart, star, diamond, hexagon) use a CSS mask on
// the inner .ph element, so a drop shadow on the outer item still
// follows the shape. The mask url is fully encoded so quotes in the
// SVG can never break the style (an earlier bug made them blank).

import { HEART_PATH } from "./pencilArt"

const maskStyle = (svg) => {
  const url = `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, "%27")}')`
  const value = `${url} center/100% 100% no-repeat`
  return { WebkitMask: value, mask: value }
}

const sv = (viewBox, inner) =>
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBox}' preserveAspectRatio='none'>${inner}</svg>`

// a = aspect ratio (width / height); r = border-radius; m = mask style
export const SHAPES = {
  free: { n: "Free crop" },
  square: { n: "Square", a: 1 },
  round: { n: "Round", a: 1, r: "50%" },
  oval: { n: "Oval", a: 0.78, r: "50%" },
  rounded: { n: "Rounded", a: 1.33, r: "12%" },
  arch: { n: "Arch", a: 0.75, r: "50% 50% 0 0 / 40% 40% 0 0" },
  heart: { n: "Heart", a: 96 / 84, m: maskStyle(sv("2 2 96 84", `<path d='${HEART_PATH}'/>`)) },
  star: { n: "Star", a: 1, m: maskStyle(sv("0 0 100 100", "<polygon points='50,2 61,36 97,36 68,57 79,92 50,71 21,92 32,57 3,36 39,36'/>")) },
  diamond: { n: "Diamond", a: 1, m: maskStyle(sv("0 0 100 100", "<polygon points='50,0 100,50 50,100 0,50'/>")) },
  hexagon: { n: "Hexagon", a: 1.15, m: maskStyle(sv("0 0 100 87", "<polygon points='25,0 75,0 100,43.5 75,87 25,87 0,43.5'/>")) },
}

// The same masks as outlines for the canvas renderer:
// viewBox [x, y, width, height] and an SVG path, stretched to the box.
const polygonPath = (points) => "M" + points.trim().split(/\s+/).join(" L") + " Z"

export const SHAPE_OUTLINES = {
  heart: { vb: [2, 2, 96, 84], d: HEART_PATH },
  star: { vb: [0, 0, 100, 100], d: polygonPath("50,2 61,36 97,36 68,57 79,92 50,71 21,92 32,57 3,36 39,36") },
  diamond: { vb: [0, 0, 100, 100], d: polygonPath("50,0 100,50 50,100 0,50") },
  hexagon: { vb: [0, 0, 100, 87], d: polygonPath("25,0 75,0 100,43.5 75,87 25,87 0,43.5") },
}

// Aspect ratio of the visible photo box, and the img position inside it.
// Free crop: four edge crops. Fixed shapes: zoom + move.
export function photoGeom(it) {
  const nw = it.nw || 1
  const nh = it.nh || 1
  const sp = SHAPES[it.shape] || SHAPES.free

  if (!sp.a) {
    const vw = 1 - it.cl - it.cr
    const vh = 1 - it.ct - it.cb
    return {
      A: (nw * vw) / (nh * vh),
      img: {
        width: `${100 / vw}%`,
        height: `${100 / vh}%`,
        left: `${(-it.cl / vw) * 100}%`,
        top: `${(-it.ct / vh) * 100}%`,
      },
    }
  }

  const im = nw / nh
  const A = sp.a
  const bw = (im > A ? im / A : 1) * it.z
  const bh = (im > A ? 1 : A / im) * it.z

  return {
    A,
    img: {
      width: `${bw * 100}%`,
      height: `${bh * 100}%`,
      left: `${-(it.px / 100) * (bw - 1) * 100}%`,
      top: `${-(it.py / 100) * (bh - 1) * 100}%`,
    },
  }
}
