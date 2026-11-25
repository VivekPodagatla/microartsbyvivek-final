// ================= DESIGN REQUEST ADMIN HELPERS =================

import {
  FRAME_COLORS,
  FRAME_SIZES,
  PENCIL_COLORS,
  REGULAR_FONTS,
  SYMBOL_NAMES,
} from "../../../../shared/designRules.js"
import { photoGeom } from "../photoShapes"

export const STATUS_LABELS = {
  new: "New",
  proof_sent: "Proof sent",
  paid: "Paid",
  carving: "Carving",
  shipped: "Shipped",
  cancelled: "Cancelled",
}

export const reference = (request) => String(request._id).slice(-6).toUpperCase()

// The customer's number for display, and its digits for links.
// Older requests only have the single "whatsapp" field.
export const contactPhone = (contact) =>
  contact.phoneFull || contact.whatsapp || ""

export const contactPhoneDigits = (contact) =>
  (contact.phoneFull ? `${contact.countryCode}${contact.phone}` : contact.whatsapp || "").replace(/\D/g, "")

export const formatDate = (value) =>
  new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })

// ================= COLOUR NAMES =================

const NAMED_COLORS = new Map([
  ...PENCIL_COLORS.map(([name, hex]) => [hex, name]),
  ...FRAME_COLORS.map(([name, hex]) => [hex, name]),
  ["#f2c230", "Yellow"],
  ["#d8281f", "Red"],
  ["#e8508a", "Pink"],
  ["#1f4fa8", "Blue"],
  ["#0f6b78", "Teal"],
  ["#2e9e5b", "Green"],
  ["#7a1f33", "Maroon"],
  ["#232323", "Black"],
  ["#ffffff", "White"],
  ["#f3ecdc", "Cream"],
  ["#f4d6d6", "Blush"],
  ["#cfe0cf", "Sage"],
  ["#1d2b4a", "Navy"],
  ["#1c1c1e", "Charcoal"],
])

export const colorName = (hex) => {
  if (!hex) return "No colour (carved silver)"
  if (hex === "transparent") return "Clear glass"
  const name = NAMED_COLORS.get(hex.toLowerCase())
  return name ? `${name} (${hex})` : hex
}

// ================= CARVING DETAILS =================

export const fontLabel = (font) =>
  `${font === "Chathura" ? "Chathura (Telugu)" : font} · ${REGULAR_FONTS.includes(font) ? "regular" : "cursive / special"}`

export const symbolLabel = (symbol) => {
  const name = SYMBOL_NAMES[symbol.t]
  if (symbol.t === "h1") return `${name} (carved, no colour)`
  if (symbol.t === "h3") return `${name}: outer ${colorName(symbol.c)}, inner ${symbol.c2 ? colorName(symbol.c2) : "lead colour"}`
  return `${name}: ${colorName(symbol.c)}`
}

// ================= FRAME =================

// [width, height] of the art area in inches, as placed.
export const artSize = (frame) => {
  const [w, h] = FRAME_SIZES[frame.size]
  return frame.orientation === "P" ? [w, h] : [h, w]
}

// ================= PHOTOS =================

// Cloudinary URL that downloads instead of opening.
export const downloadUrl = (url) => url.replace("/upload/", "/upload/fl_attachment/")

// Cloudinary URL resized to at most `width` px wide (for quick views).
export const resizedUrl = (url, width) => url.replace("/upload/", `/upload/w_${width},c_limit/`)

// Effective print resolution of each photo at its placed size.
// Below about 150 DPI it will look soft when printed.
export function photoResolution(request) {
  const [artWidth] = artSize(request.design.frame)
  return request.design.items
    .filter((item) => item.type === "photo")
    .map((item, index) => {
      const photo = request.photos.find((p) => p.itemId === item.id)
      const boxInches = (item.w / 100) * artWidth
      const imageFraction = parseFloat(photoGeom(item).img.width) / 100
      const dpi = photo?.width ? Math.round(photo.width / (imageFraction * boxInches)) : null
      return { item, photo, index: index + 1, dpi, low: dpi !== null && dpi < 150 }
    })
}

// ================= FILES =================

const safe = (text) =>
  String(text || "").normalize("NFKD").replace(/[^\w-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase()

export const printFileName = (request, extension) =>
  `${reference(request).toLowerCase()}-${safe(request.contact.name) || "customer"}-${request.design.frame.size}-print.${extension}`

export function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

// ================= PNG DPI =================
// Adds a pHYs chunk (pixels per metre) after IHDR so print
// software opens the PNG at its real size.

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

const crc32 = (bytes) => {
  let c = 0xffffffff
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

export async function withPngDpi(blob, dpi) {
  const png = new Uint8Array(await blob.arrayBuffer())
  const ppm = Math.round(dpi / 0.0254)
  const chunk = new Uint8Array(21)
  const view = new DataView(chunk.buffer)
  view.setUint32(0, 9)
  chunk.set([0x70, 0x48, 0x59, 0x73], 4) // "pHYs"
  view.setUint32(8, ppm)
  view.setUint32(12, ppm)
  chunk[16] = 1 // unit: metre
  view.setUint32(17, crc32(chunk.subarray(4, 17)))

  // 8-byte signature + IHDR (4 length + 4 type + 13 data + 4 crc)
  const at = 8 + 25
  const out = new Uint8Array(png.length + chunk.length)
  out.set(png.subarray(0, at), 0)
  out.set(chunk, at)
  out.set(png.subarray(at), at + chunk.length)
  return new Blob([out], { type: "image/png" })
}
