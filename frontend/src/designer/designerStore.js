// ================= DESIGNER STORE =================
// All designer state and behaviour, ported from the prototype's
// S object and its click/input/pointer handlers. React components
// read S and call these actions; useSyncExternalStore re-renders
// them when the version changes.
//
// refresh() works like the prototype's: it renders synchronously
// (flushSync), then fixes the board using the real element boxes:
// keepIn (nothing leaves the frame) and separate (pencil arts never
// overlap). Like the prototype, that measuring reads the DOM, so
// actions must run from event handlers, not during render.

import { flushSync } from "react-dom"

import {
  FRAME_SIZES,
  MAX_ARTS,
  MAX_PHOTOS,
  MAX_SYMBOLS,
  stripEmoji,
} from "../../../shared/designRules.js"
import { browserCountryCode } from "../utils/phone"
import {
  savePhoto,
  loadPhoto,
  deletePhoto,
  clearPhotos,
} from "./photoStore"
import {
  artText,
  priceDesign,
} from "../../../shared/designPricing.js"

// ================= STATE =================

const newArt = () => ({
  text: "Your name",
  kind: "hex",
  color: "#d8281f",
  font: "Permanent Marker",
  ends: 2,
  syms: [],
})

const withDefaults = (item) => ({
  rot: 0,
  op: 100,
  sho: 0,
  shc: "#000000",
  sha: 45,
  shb: 1.2,
  shx: 0.8,
  shy: 1.2,
  ...item,
})

const newContact = () => ({
  name: "",
  countryCode: browserCountryCode(),
  phone: "",
  hasWhatsapp: true,
  email: "",
  address: "",
  notes: "",
  consent: false,
})

const newDesign = () => ({
  arts: [{ ...newArt(), text: "Micro Arts by Vivek" }],
  frame: {
    size: "8x10",
    orientation: "L",
    background: "#ffffff",
    thickness: 1,
    frameColor: "#4a2f1d",
  },
  items: [],
})

export const S = {
  tab: 0, // 0 carve, 1 frame, 2 send
  sel: null, // selected board item id
  cur: 0, // pencil art being edited
  ss: null, // selected symbol of that art
  ...newDesign(),
  contact: newContact(),
  // Sending (step 3): { busy, status, error, sent: { requestId, total } }
  send: { busy: false, status: "", error: "", sent: null },
  toast: "",
  viewport: { w: window.innerWidth, h: window.innerHeight },
}

export const currentArt = () => S.arts[S.cur]
export const selectedItem = () => S.items.find((item) => item.id === S.sel)

// Original photo files by item id, kept for upload (Phase 2).
export const originalPhotos = new Map()

let uid = 0
let drag = null
let board = null
let version = 0
let toastTimer = null
const listeners = new Set()

export const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getVersion = () => version

export const notify = () => {
  version++
  listeners.forEach((listener) => listener())
  scheduleDraftSave()
}

// ================= DRAFT =================
// The design and contact details are saved to localStorage as the
// customer works; original photos go to IndexedDB (photoStore.js)
// and the board copies are rebuilt from them on the next visit.

const DRAFT_KEY = "microarts-design-draft"
const DRAFT_VERSION = 1
let draftTimer = null

function scheduleDraftSave() {
  clearTimeout(draftTimer)
  draftTimer = setTimeout(saveDraft, 400)
}

function saveDraft() {
  try {
    const draft = {
      v: DRAFT_VERSION,
      tab: Math.min(S.tab, 2),
      cur: S.cur,
      uid,
      arts: S.arts,
      frame: S.frame,
      // Photo pixels are not stored here, only their settings.
      items: S.items.map((item) => ({ ...item, src: undefined })),
      contact: S.contact,
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Private browsing or storage full: the design still works,
    // it just won't survive a refresh.
  }
}

function restoreDraft() {
  let draft
  try {
    draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null")
  } catch {
    return
  }
  if (!draft || draft.v !== DRAFT_VERSION || !Array.isArray(draft.items)) return

  S.arts = draft.arts?.length ? draft.arts : S.arts
  S.frame = { ...S.frame, ...draft.frame }
  S.items = draft.items
  S.contact = { ...newContact(), ...draft.contact }
  S.cur = Math.min(draft.cur || 0, S.arts.length - 1)
  S.tab = draft.tab || 0
  uid = Math.max(draft.uid || 0, ...S.items.map((item) => item.id), 0)

  // Rebuild each photo's board copy from its original file.
  S.items
    .filter((item) => item.type === "photo")
    .forEach(async (item) => {
      const file = await loadPhoto(item.id)
      if (!file) {
        S.items = S.items.filter((other) => other !== item)
        refreshLater()
        showToast("Some photos could not be restored. Please add them again.")
        return
      }
      const copy = await downscale(file).catch(() => null)
      if (!copy) return
      item.src = copy.src
      originalPhotos.set(item.id, file)
      refreshLater()
    })
}

// Restoring finishes after the first render; refresh outside React's
// render cycle.
const refreshLater = () => setTimeout(() => (board ? refresh() : notify()), 0)

// Clears the design after it was sent.
export function resetDesigner() {
  Object.assign(S, newDesign(), {
    tab: 0,
    sel: null,
    cur: 0,
    ss: null,
    contact: newContact(),
  })
  originalPhotos.clear()
  clearTimeout(draftTimer)
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // ignore
  }
  clearPhotos()
}

export function refresh() {
  flushSync(notify)
  fixBoard()
}

export const setBoard = (element) => {
  board = element
}

export function showToast(message) {
  S.toast = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    S.toast = ""
    notify()
  }, 2400)
  notify()
}

// ================= FRAME GEOMETRY =================

// [width, height] in inches as shown.
export function frameDims() {
  const [w, h] = FRAME_SIZES[S.frame.size]
  return S.frame.orientation === "P" ? [w, h] : [h, w]
}

// Matches the two-column layout in designer.css (min-width: 900px).
export const DESKTOP_MIN_WIDTH = 900

// Pixels per inch for the on-screen board.
// Phones: the prototype's limits (board pinned above the tools).
// Desktop: as large as the left column and the window height allow.
export function boardScale() {
  const [w, h] = frameDims()
  const t = S.frame.thickness
  const { w: vw, h: vh } = S.viewport
  let maxW
  let maxH

  if (vw >= DESKTOP_MIN_WIDTH) {
    // Container max 1160px, 24px side padding, 32px column gap,
    // columns 1.25fr / 1fr.
    const previewColumn = ((Math.min(vw, 1160) - 48 - 32) * 1.25) / 2.25
    maxW = previewColumn - 16
    maxH = Math.max(260, Math.min(vh - 72 - 60, 640))
  } else {
    maxW = Math.min(vw - 48, 440)
    maxH = Math.min(vh * 0.38, 360)
  }

  return Math.min(maxW / (w + 2 * t), maxH / (h + 2 * t))
}

// The design's price: frame, printing and pencil arts (a gift it was
// made from is not charged).
export const designPrice = () => priceDesign(S)

// ================= BOARD RULES (DOM) =================

const itemOf = (el) => S.items.find((item) => item.id == el.dataset.id)
const pencilElements = () => (board ? [...board.querySelectorAll(".it.pc")] : [])

// Visible pencil area: an unrotated pencil's box has 20% empty
// margin top and bottom, which must not count as overlap.
const visibleBox = (el, item) => {
  const b = el.getBoundingClientRect()
  const m = item.rot ? 0 : b.height * 0.2
  return { left: b.left, right: b.right, top: b.top + m, bottom: b.bottom - m }
}

const touch = (a, b) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

const otherPencils = (el) =>
  pencilElements()
    .filter((n) => n !== el)
    .map((n) => visibleBox(n, itemOf(n)))

export function pencilsOverlap() {
  const boxes = pencilElements().map((n) => visibleBox(n, itemOf(n)))
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      if (touch(boxes[i], boxes[j])) return true
    }
  }
  return false
}

const place = (el, item) => {
  el.style.left = item.x + "%"
  el.style.top = item.y + "%"
}

// Move any overlapping pencil art to the nearest free spot.
function separate() {
  const r = board.getBoundingClientRect()
  if (!r.width) return
  const placed = []

  pencilElements().forEach((el) => {
    const it = itemOf(el)
    const v = visibleBox(el, it)
    if (!placed.some((p) => touch(v, p))) {
      placed.push(v)
      return
    }

    const b = el.getBoundingClientRect()
    const X0 = r.left + (it.x / 100) * r.width
    const Y0 = r.top + (it.y / 100) * r.height
    const vo = { x: v.left - X0, y: v.top - Y0 }
    const bo = { x: b.left - X0, y: b.top - Y0 }
    const vw = v.right - v.left
    const vh = v.bottom - v.top
    let best = null
    let bd = 1e9

    for (let yy = 0; yy <= 100; yy += 1.5) {
      for (let xx = 0; xx <= 100; xx += 1.5) {
        const X = r.left + (xx / 100) * r.width
        const Y = r.top + (yy / 100) * r.height
        if (
          X + bo.x < r.left - 0.5 ||
          Y + bo.y < r.top - 0.5 ||
          X + bo.x + b.width > r.right + 0.5 ||
          Y + bo.y + b.height > r.bottom + 0.5
        ) continue
        const c = { left: X + vo.x, top: Y + vo.y, right: X + vo.x + vw, bottom: Y + vo.y + vh }
        if (placed.some((p) => touch(c, p))) continue
        const d = (xx - it.x) ** 2 + (yy - it.y) ** 2
        if (d < bd) {
          bd = d
          best = { xx, yy, c }
        }
      }
    }

    if (best) {
      it.x = best.xx
      it.y = best.yy
      place(el, it)
      placed.push(best.c)
    } else {
      placed.push(v)
    }
  })
}

// Pull every item back inside the frame.
export function keepIn() {
  if (!board) return
  const r = board.getBoundingClientRect()
  if (!r.width) return

  board.querySelectorAll(".it").forEach((el) => {
    const it = itemOf(el)
    if (!it) return
    const b = el.getBoundingClientRect()
    let dx = 0
    let dy = 0
    if (b.width <= r.width) {
      if (b.left < r.left) dx = r.left - b.left
      else if (b.right > r.right) dx = r.right - b.right
    } else dx = r.left - b.left
    if (b.height <= r.height) {
      if (b.top < r.top) dy = r.top - b.top
      else if (b.bottom > r.bottom) dy = r.bottom - b.bottom
    } else dy = r.top - b.top
    if (dx || dy) {
      it.x += (dx / r.width) * 100
      it.y += (dy / r.height) * 100
      place(el, it)
    }
  })
}

function fixBoard() {
  if (!board) return
  keepIn()
  separate()
}

// ================= ACTIONS: STEPS =================

export function setTab(tab) {
  S.tab = tab
  refresh()
  window.scrollTo({ top: 0, behavior: "smooth" })
}

// ================= ACTIONS: PENCIL ART =================

// kind, color, font, ends
export function setArt(key, value) {
  currentArt()[key] = value
  refresh()
}

// Emoji are stripped as the customer types or pastes.
export function setArtText(value) {
  currentArt().text = stripEmoji(value)
  notify()
}

export function selectArt(index) {
  S.cur = index
  S.ss = null
  refresh()
}

export function addArt() {
  if (S.arts.length >= MAX_ARTS) return
  S.arts.push(newArt())
  S.cur = S.arts.length - 1
  S.ss = null
  refresh()
}

export function deleteArt() {
  if (S.arts.length < 2) return
  S.arts.splice(S.cur, 1)
  S.cur = Math.max(0, S.cur - 1)
  S.ss = null
  refresh()
}

export function addSymbol(type) {
  const art = currentArt()
  if (art.syms.length < MAX_SYMBOLS) {
    art.syms.push({ t: type, c: null, c2: null })
    S.ss = art.syms.length - 1
  }
  refresh()
}

export function selectSymbol(index) {
  S.ss = index
  refresh()
}

export function deleteSymbol(index) {
  currentArt().syms.splice(index, 1)
  S.ss = null
  refresh()
}

// which: 1 = main / outer colour, 2 = inner heart colour. "" = no colour.
export function setSymbolColor(which, value) {
  const symbol = currentArt().syms[S.ss]
  if (!symbol) return
  symbol[which === 2 ? "c2" : "c"] = value || null
  refresh()
}

// ================= ACTIONS: FRAME =================

// size, orientation, background, thickness, frameColor
export function setFrame(key, value) {
  S.frame[key] = value
  refresh()
  if (["size", "orientation", "thickness"].includes(key) && pencilsOverlap()) {
    showToast("Some pencil arts now overlap. Move or shrink them.")
  }
}

// ================= ACTIONS: BOARD ITEMS =================

function addItem(item) {
  item.id = ++uid
  S.items.push(item)
  S.sel = item.id
  S.tab = 1
  refresh()
  // refresh() already moved a new pencil to the nearest free spot;
  // if it still overlaps there is no room at all.
  if (item.type === "pencil" && pencilsOverlap()) {
    S.items = S.items.filter((other) => other !== item)
    S.sel = null
    refresh()
    showToast("No room for another pencil art. Use a bigger frame or make the others smaller.")
  }
  return item
}

export function addPencil(index) {
  addItem(withDefaults({
    type: "pencil",
    n: index + 1,
    x: 15,
    y: 70,
    w: 70,
    p: JSON.parse(JSON.stringify(S.arts[index])),
  }))
}

export function addQuote() {
  addItem(withDefaults({
    type: "text",
    x: 52,
    y: 22,
    fs: 7,
    text: "Your message here",
    font: "Permanent Marker",
    color: "#222222",
    b: 0,
    i: 0,
    ls: 0,
    sw: 0,
    sc: "#000000",
    al: "left",
  }))
}

// A JPEG copy at most 900 px on the long side, for the board.
function downscale(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const s = Math.min(1, 900 / Math.max(image.width, image.height))
        const canvas = document.createElement("canvas")
        canvas.width = image.width * s
        canvas.height = image.height * s
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve({
          src: canvas.toDataURL("image/jpeg", 0.85),
          nw: canvas.width,
          nh: canvas.height,
        })
      }
      image.onerror = reject
      image.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// The board shows a copy downscaled to 900 px; the original file
// is kept (in memory and IndexedDB) for upload.
export async function addPhoto(file) {
  if (S.items.filter((item) => item.type === "photo").length >= MAX_PHOTOS) {
    showToast(`You can add up to ${MAX_PHOTOS} photos.`)
    return
  }

  const copy = await downscale(file).catch(() => null)
  if (!copy) {
    showToast("That photo could not be opened. Try a JPG or PNG.")
    return
  }

  const item = addItem(withDefaults({
    type: "photo",
    x: 6,
    y: 6,
    w: 44,
    shape: "free",
    cl: 0,
    cr: 0,
    ct: 0,
    cb: 0,
    z: 1,
    px: 50,
    py: 50,
    bd: 0,
    bc: "#ffffff",
    ...copy,
  }))
  originalPhotos.set(item.id, file)
  savePhoto(item.id, file)
}

export function deleteItem() {
  originalPhotos.delete(S.sel)
  deletePhoto(S.sel)
  S.items = S.items.filter((item) => item.id !== S.sel)
  S.sel = null
  refresh()
}

// Click-style settings: font, shape, align, bold/italic toggles.
export function setItem(key, value) {
  const item = selectedItem()
  if (!item) return
  item[key] = value
  refresh()
}

export function toggleItem(key) {
  const item = selectedItem()
  if (!item) return
  item[key] = item[key] ? 0 : 1
  refresh()
}

const NUMBER_KEYS = ["rot", "op", "shb", "shx", "shy", "sha", "sw", "bd", "ls", "z", "px", "py"]
const STRING_KEYS = ["shc", "sc", "bc", "color"]
const OPPOSITE_CROP = { cl: "cr", cr: "cl", ct: "cb", cb: "ct" }

// Sliders, colour pickers, the shadow checkbox and the quote text.
// Pencil size/rotate changes that cause overlap are refused.
export function inputItem(key, value, checked) {
  const item = selectedItem()
  if (!item) return

  const isPencil = item.type === "pencil"
  const oldValue = isPencil
    ? key === "size" ? item.w : key === "rot" ? item.rot : null
    : null

  if (key === "size") {
    if (item.type === "text") item.fs = +value
    else item.w = +value
  } else if (key === "stext") item.text = value
  else if (key === "sho") item.sho = checked ? 1 : 0
  else if (OPPOSITE_CROP[key]) item[key] = Math.min(+value / 100, 0.9 - item[OPPOSITE_CROP[key]])
  else if (NUMBER_KEYS.includes(key)) item[key] = +value
  else if (STRING_KEYS.includes(key)) item[key] = value

  refresh()

  if (oldValue !== null && pencilsOverlap()) {
    if (key === "size") item.w = oldValue
    else item.rot = oldValue
    refresh()
    showToast("Pencil arts cannot overlap.")
  }
}

// ================= ACTIONS: DRAGGING =================

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export function pointerDown(event) {
  const el = event.target.closest(".it")
  if (!el) {
    S.sel = null
    notify()
    return
  }

  const item = itemOf(el)
  S.sel = item.id
  drag = {
    item,
    el,
    sx: event.clientX,
    sy: event.clientY,
    ox: item.x,
    oy: item.y,
    r: board.getBoundingClientRect(),
    er: el.getBoundingClientRect(),
    ev: visibleBox(el, item),
    others: otherPencils(el),
    lx: 0,
    ly: 0,
  }
  el.setPointerCapture(event.pointerId)
  event.preventDefault()
  notify()
}

// Clamped to the frame. A pencil stops at contact with another
// pencil but can slide along its edge; the path is tested in
// 8 steps so a fast drag cannot jump over one.
export function pointerMove(event) {
  if (!drag) return
  const { item, el, r, er } = drag
  const lim = (d, lo, hi) => (lo <= hi ? clamp(d, lo, hi) : clamp(d, hi, lo))
  let dx = lim(event.clientX - drag.sx, r.left - er.left, r.right - er.right)
  let dy = lim(event.clientY - drag.sy, r.top - er.top, r.bottom - er.bottom)

  if (item.type === "pencil") {
    const bad = (a, c) =>
      drag.others.some((o) =>
        touch({ left: drag.ev.left + a, right: drag.ev.right + a, top: drag.ev.top + c, bottom: drag.ev.bottom + c }, o)
      )
    let a = drag.lx
    let c = drag.ly
    for (let k = 1; k <= 8; k++) {
      const na = drag.lx + ((dx - drag.lx) * k) / 8
      const nc = drag.ly + ((dy - drag.ly) * k) / 8
      if (!bad(na, nc)) {
        a = na
        c = nc
      } else if (!bad(na, c)) a = na
      else if (!bad(a, nc)) c = nc
      else break
    }
    dx = a
    dy = c
    drag.lx = a
    drag.ly = c
  }

  item.x = drag.ox + (dx / r.width) * 100
  item.y = drag.oy + (dy / r.height) * 100
  place(el, item)
}

export function pointerUp() {
  if (!drag) return
  drag = null
  notify()
}

// ================= WINDOW AND FONTS =================

export function resize() {
  S.viewport = { w: window.innerWidth, h: window.innerHeight }
  refresh()
}

// ================= CONTACT DETAILS =================

// name, countryCode, phone, hasWhatsapp, email, address, notes, consent
export function setContact(key, value) {
  S.contact[key] = value
  S.send.error = ""
  notify()
}

export { artText }


// ================= START =================

restoreDraft()
