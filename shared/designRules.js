// ================= DESIGN RULES =================
// Options and limits for the "Design your gift idea" designer.
// Shared by the frontend (designer UI) and the backend
// (validating submitted designs), so keep it free of DOM
// and Node APIs.

export const DESIGN_VERSION = 1

export const MAX_ARTS = 6
export const MAX_ART_TEXT = 28
export const MAX_SYMBOLS = 12

// ================= PENCIL ART =================

export const PENCIL_KINDS = ["hex", "carp"]

export const PENCIL_COLORS = [
  ["Red", "#d8281f"],
  ["Blue", "#1f4fa8"],
  ["Maroon", "#7a1f33"],
  ["Teal", "#0f6b78"],
  ["Yellow", "#f2c230"],
  ["Black", "#232323"],
]

// Regular fonts use the regular price,
// cursive and special fonts the special price.
export const REGULAR_FONTS = ["Bebas Neue", "Anton"]
export const SPECIAL_FONTS = ["Magnolia Script", "Permanent Marker", "Chathura"]
export const PENCIL_FONTS = REGULAR_FONTS.concat(SPECIAL_FONTS)

// h1 = small heart, h2 = heart, h3 = heart in heart, sm = smile
export const SYMBOL_TYPES = ["h1", "h2", "h3", "sm"]

export const SYMBOL_NAMES = {
  h1: "Small ♥",
  h2: "♥",
  h3: "♥ in ♥",
  sm: "☺ Smile",
}

// ================= FRAME =================

// [width, height] in inches, portrait
export const FRAME_SIZES = {
  "5x7": [5, 7],
  "8x10": [8, 10],
  "10x12": [10, 12],
  "12x16": [12, 16],
}

export const FRAME_THICKNESSES = [0.5, 1, 1.5]

export const FRAME_COLORS = [
  ["Dark wood", "#4a2f1d"],
  ["Light oak", "#d2b48c"],
  ["White wash", "#ece6dc"],
  ["Black", "#1a1a1a"],
  ["Gold", "#c9a24b"],
  ["Silver", "#bfc3c7"],
  ["Mahogany", "#5b1f1a"],
]

// ================= FRAME ITEMS =================

// Photos per design request (each up to 10 MB).
export const MAX_PHOTOS = 8
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024
export const MAX_ITEMS = 40
export const MAX_QUOTE_TEXT = 300

export const PHOTO_SHAPES = ["free", "square", "round", "oval", "rounded", "arch", "heart", "star", "diamond", "hexagon"]

export const QUOTE_FONTS = [
  "Magnolia Script", "Dancing Script", "Great Vibes", "Pacifico", "Lobster", "Caveat", "Satisfy",
  "Sacramento", "Kaushan Script", "Courgette", "Shadows Into Light", "Amatic SC", "Playfair Display",
  "Lora", "Cinzel", "Montserrat", "Oswald", "Bebas Neue", "Anton", "Righteous", "Abril Fatface",
  "Permanent Marker", "Chathura", "Ramabhadra", "Mandali", "Gidugu", "Dhurjati", "Noto Sans Telugu",
]

// ================= PHONE COUNTRY CODES =================
// Moved to contactRules.js (used by every customer form).

export { COUNTRY_CODES, DIAL_CODES } from "./contactRules.js"

// ================= TEXT HELPERS =================

// Emojis and pictographs are never allowed in pencil art text.
// The prototype's pattern, plus skin-tone modifiers, flag
// letters and tag characters, which it left behind.
const EMOJI_PATTERN =
  /[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}‍️⃣\u{E0020}-\u{E007F}]/gu

export function stripEmoji(text) {
  return String(text ?? "").replace(EMOJI_PATTERN, "")
}

export function hasEmoji(text) {
  return stripEmoji(text) !== String(text ?? "")
}

// Grapheme clusters, so a Telugu letter with its vowel
// sign counts as one character.
export function graphemes(text) {
  try {
    return [
      ...new Intl.Segmenter(undefined, { granularity: "grapheme" })
        .segment(text),
    ].map((part) => part.segment)
  } catch {
    return Array.from(text)
  }
}

export const isRegularFont = (font) => REGULAR_FONTS.includes(font)
