// ================= DESIGN VALIDATION =================
// Checks a submitted design and returns a clean copy that keeps
// only known fields. The server stores that copy, and the designer
// runs the same check before sending.

import {
  DESIGN_VERSION,
  FRAME_SIZES,
  FRAME_THICKNESSES,
  MAX_ART_TEXT,
  MAX_ARTS,
  MAX_ITEMS,
  MAX_PHOTOS,
  MAX_QUOTE_TEXT,
  MAX_SYMBOLS,
  PENCIL_FONTS,
  PENCIL_KINDS,
  PHOTO_SHAPES,
  QUOTE_FONTS,
  SYMBOL_TYPES,
  hasEmoji,
} from "./designRules.js"
import { validatePhone, CONSENT_ERROR } from "./contactRules.js"

const HEX = /^#[0-9a-f]{6}$/i

class DesignError extends Error {}

const fail = (message) => {
  throw new DesignError(message)
}

const color = (value, label) => {
  if (typeof value !== "string" || !HEX.test(value)) fail(`${label} is not a valid colour.`)
  return value.toLowerCase()
}

const optionalColor = (value, label) =>
  value === null || value === undefined || value === "" ? null : color(value, label)

const number = (value, min, max, label) => {
  const n = Number(value)
  if (!Number.isFinite(n) || n < min || n > max) fail(`${label} is out of range.`)
  return n
}

const flag = (value) => (value ? 1 : 0)

const oneOf = (value, list, label) => {
  if (!list.includes(value)) fail(`${label} is not allowed.`)
  return value
}

// ================= PENCIL ART =================

function cleanArt(art, label) {
  if (!art || typeof art !== "object") fail(`${label} is missing.`)

  const text = String(art.text ?? "").trim()
  if (!text) fail(`${label} needs a name or message.`)
  if ([...text].length > MAX_ART_TEXT) fail(`${label} text is longer than ${MAX_ART_TEXT} characters.`)
  if (hasEmoji(text)) fail(`${label} text cannot contain emoji.`)

  const syms = Array.isArray(art.syms) ? art.syms : []
  if (syms.length > MAX_SYMBOLS) fail(`${label} has more than ${MAX_SYMBOLS} symbols.`)

  return {
    text,
    kind: oneOf(art.kind, PENCIL_KINDS, `${label} pencil type`),
    color: color(art.color, `${label} pencil colour`),
    font: oneOf(art.font, PENCIL_FONTS, `${label} font`),
    ends: oneOf(Number(art.ends), [1, 2], `${label} carving style`),
    syms: syms.map((sym) => {
      const t = oneOf(sym?.t, SYMBOL_TYPES, `${label} symbol`)
      return {
        t,
        // Small hearts have no colour; only "heart in heart" has an inner colour.
        c: t === "h1" ? null : optionalColor(sym.c, `${label} symbol colour`),
        c2: t === "h3" ? optionalColor(sym.c2, `${label} inner heart colour`) : null,
      }
    }),
  }
}

// ================= FRAME ITEMS =================

function cleanItem(item, index) {
  const label = `Item ${index + 1}`
  if (!item || typeof item !== "object") fail(`${label} is missing.`)

  const base = {
    id: number(item.id, 1, 1e9, `${label} id`),
    type: oneOf(item.type, ["photo", "text", "pencil"], `${label} type`),
    x: number(item.x, -100, 200, `${label} position`),
    y: number(item.y, -100, 200, `${label} position`),
    rot: number(item.rot ?? 0, -180, 180, `${label} rotation`),
  }

  if (base.type === "pencil") {
    return {
      ...base,
      n: number(item.n ?? 1, 1, MAX_ARTS, `${label} number`),
      w: number(item.w, 1, 100, `${label} size`),
      p: cleanArt(item.p, `Pencil art ${item.n ?? ""}`.trim()),
    }
  }

  const styled = {
    ...base,
    op: number(item.op ?? 100, 10, 100, `${label} opacity`),
    sho: flag(item.sho),
    shc: color(item.shc ?? "#000000", `${label} shadow colour`),
    sha: number(item.sha ?? 45, 0, 100, `${label} shadow opacity`),
    shb: number(item.shb ?? 1.2, 0, 6, `${label} shadow blur`),
    shx: number(item.shx ?? 0.8, -5, 5, `${label} shadow`),
    shy: number(item.shy ?? 1.2, -5, 5, `${label} shadow`),
  }

  if (base.type === "text") {
    const text = String(item.text ?? "")
    if (!text.trim()) fail("A quote is empty. Type a message or remove it.")
    if (text.length > MAX_QUOTE_TEXT) fail(`A quote is longer than ${MAX_QUOTE_TEXT} characters.`)

    return {
      ...styled,
      text,
      font: oneOf(item.font, QUOTE_FONTS, `${label} font`),
      fs: number(item.fs, 3, 20, `${label} size`),
      color: color(item.color, `${label} text colour`),
      b: flag(item.b),
      i: flag(item.i),
      ls: number(item.ls ?? 0, -0.5, 3, `${label} letter spacing`),
      sw: number(item.sw ?? 0, 0, 1, `${label} outline width`),
      sc: color(item.sc ?? "#000000", `${label} outline colour`),
      al: oneOf(item.al ?? "left", ["left", "center", "right"], `${label} alignment`),
    }
  }

  return {
    ...styled,
    w: number(item.w, 1, 100, `${label} size`),
    shape: oneOf(item.shape, PHOTO_SHAPES, `${label} shape`),
    cl: number(item.cl ?? 0, 0, 0.9, `${label} crop`),
    cr: number(item.cr ?? 0, 0, 0.9, `${label} crop`),
    ct: number(item.ct ?? 0, 0, 0.9, `${label} crop`),
    cb: number(item.cb ?? 0, 0, 0.9, `${label} crop`),
    z: number(item.z ?? 1, 1, 3, `${label} zoom`),
    px: number(item.px ?? 50, 0, 100, `${label} position`),
    py: number(item.py ?? 50, 0, 100, `${label} position`),
    bd: number(item.bd ?? 0, 0, 3, `${label} border`),
    bc: color(item.bc ?? "#ffffff", `${label} border colour`),
    // Size of the photo the customer placed (for aspect ratio).
    nw: number(item.nw, 1, 100000, `${label} photo size`),
    nh: number(item.nh, 1, 100000, `${label} photo size`),
  }
}

// ================= WHOLE DESIGN =================

// Returns { design } (clean copy) or { error } (message for the customer).
export function validateDesign(input) {
  try {
    if (!input || typeof input !== "object") fail("The design is missing.")

    const frame = input.frame || {}
    const cleanFrame = {
      size: oneOf(frame.size, Object.keys(FRAME_SIZES), "Frame size"),
      orientation: oneOf(frame.orientation, ["L", "P"], "Frame orientation"),
      background: frame.background === "transparent"
        ? "transparent"
        : color(frame.background, "Background"),
      thickness: oneOf(Number(frame.thickness), FRAME_THICKNESSES, "Frame thickness"),
      frameColor: color(frame.frameColor, "Frame colour"),
    }

    const arts = Array.isArray(input.arts) ? input.arts : []
    if (arts.length > MAX_ARTS) fail(`A design can have up to ${MAX_ARTS} pencil arts.`)

    const items = Array.isArray(input.items) ? input.items : []
    if (!items.length) fail("Your frame is empty. Add a pencil art, photo or quote.")
    if (items.length > MAX_ITEMS) fail(`A frame can hold up to ${MAX_ITEMS} items.`)

    const cleanItems = items.map(cleanItem)

    if (cleanItems.filter((item) => item.type === "photo").length > MAX_PHOTOS) {
      fail(`A design can have up to ${MAX_PHOTOS} photos.`)
    }
    if (new Set(cleanItems.map((item) => item.id)).size !== cleanItems.length) {
      fail("The design has duplicate items.")
    }

    return {
      design: {
        version: DESIGN_VERSION,
        // Arts not placed in the frame are kept for reference,
        // but only placed pencils are priced and carved.
        arts: arts.map((art, index) => {
          try {
            return cleanArt(art, `Pencil art ${index + 1}`)
          } catch {
            return null
          }
        }).filter(Boolean),
        frame: cleanFrame,
        items: cleanItems,
      },
    }
  } catch (error) {
    if (error instanceof DesignError) return { error: error.message }
    throw error
  }
}

// ================= CONTACT DETAILS =================

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone: a country code (chosen separately) plus the number.
// WhatsApp is preferred; hasWhatsapp says whether this number has it,
// so Vivek knows to message on WhatsApp or to call / text.
// Returns { contact } (with phoneFull, e.g. "+91 98765 43210") or { error }.
export function validateContact(input) {
  const contact = {
    name: String(input?.name ?? "").trim(),
    countryCode: String(input?.countryCode ?? "").trim(),
    phone: String(input?.phone ?? "").trim(),
    hasWhatsapp: input?.hasWhatsapp !== false,
    email: String(input?.email ?? "").trim().toLowerCase(),
    address: String(input?.address ?? "").trim(),
    notes: String(input?.notes ?? "").trim(),
    consent: Boolean(input?.consent),
  }

  if (!contact.name) return { error: "Please enter your name." }
  if (contact.name.length > 100) return { error: "Your name is too long." }
  const phone = validatePhone(contact.countryCode, contact.phone)
  if (phone.error) return { error: phone.error }
  contact.phoneFull = phone.phoneFull
  if (contact.email && (!EMAIL.test(contact.email) || contact.email.length > 200)) {
    return { error: "Please enter a valid email address, or leave it empty." }
  }
  if (!contact.address) return { error: "Please enter your delivery address." }
  if (contact.address.length > 500) return { error: "Your address is too long." }
  if (contact.notes.length > 1000) return { error: "Your notes are too long." }
  if (!contact.consent) return { error: CONSENT_ERROR }

  return { contact }
}
