// ================= DESIGN PRICING (USD) =================
// The single source of prices for the designer. The browser
// uses it for the live receipt, and the server recomputes
// every submitted design with it and ignores the browser's total.

import {
  graphemes,
  isRegularFont,
  stripEmoji,
} from "./designRules.js"

export const PRICES = {
  frame: {
    "5x7": 10,
    "8x10": 15,
    "10x12": 20,
    "12x16": 25,
  },

  // Not set yet: change these when thickness prices are decided.
  thickness: {
    0.5: 0,
    1: 0,
    1.5: 0,
  },

  // One flat charge when the frame has at least one photo or quote.
  printing: {
    "5x7": 5,
    "8x10": 5,
    "10x12": 10,
    "12x16": 10,
  },

  regular: { rate: 6, min: 20 },
  special: { rate: 12, min: 40 },

  // [plain, with colour]
  symbol: {
    h1: [4, 4],
    h2: [5, 8],
    h3: [10, 13],
    sm: [8, 10],
  },
}

// The text shown and priced: emoji removed, trimmed.
// An empty text previews as "Your name" (submitting it is blocked elsewhere).
export const artText = (art) =>
  stripEmoji(art?.text).trim() || "Your name"

export function symbolPrice(symbol) {
  const [plain, colored] = PRICES.symbol[symbol.t] || [0, 0]

  if (symbol.t === "h1") {
    return plain
  }

  const hasColor = Boolean(symbol.c || (symbol.t === "h3" && symbol.c2))

  return hasColor ? colored : plain
}

// Art price = max(minimum, characters × rate + symbols).
// A character is every non-space grapheme.
export function artPrice(art) {
  const rates = isRegularFont(art.font) ? PRICES.regular : PRICES.special

  const characters = graphemes(artText(art))
    .filter((part) => !/^\s+$/.test(part))
    .length

  const symbols = (art.syms || [])
    .reduce((sum, symbol) => sum + symbolPrice(symbol), 0)

  const raw = characters * rates.rate + symbols

  return {
    characters,
    rates,
    symbols,
    raw,
    price: Math.max(rates.min, raw),
    minimumApplies: raw < rates.min,
  }
}

// Every pencil art placed in the frame is charged separately.
// Only the design is charged (frame, printing, pencil arts): when a
// design is made from a gift page, that gift is a reference and its
// own price is not added.
// Returns receipt lines ({ label, amount }) and the total.
export function priceDesign(design) {
  const frame = design.frame
  const size = frame.size
  const lines = []

  lines.push({
    label: `Frame ${size.replace("x", "×")} in, ${
      frame.orientation === "L" ? "landscape" : "portrait"
    }`,
    amount: PRICES.frame[size] ?? 0,
  })

  const thicknessPrice = PRICES.thickness[frame.thickness] || 0

  if (thicknessPrice) {
    lines.push({
      label: `Thickness ${frame.thickness} in`,
      amount: thicknessPrice,
    })
  }

  const items = design.items || []

  if (items.some((item) => item.type === "photo" || item.type === "text")) {
    lines.push({
      label: "Photo / quote printing",
      amount: PRICES.printing[size] ?? 0,
    })
  }

  items
    .filter((item) => item.type === "pencil")
    .forEach((item) => {
      const art = item.p
      const price = artPrice(art)
      const symbolCount = (art.syms || []).length

      lines.push({
        label: `Carved ${art.kind === "carp" ? "carpenter" : "hexagonal"} pencil “${artText(art)}” (${price.characters} characters${
          symbolCount ? ` + ${symbolCount} symbol${symbolCount > 1 ? "s" : ""}` : ""
        }${price.minimumApplies ? ", minimum price" : ""})`,
        amount: price.price,
      })
    })

  return {
    lines,
    total: lines.reduce((sum, line) => sum + line.amount, 0),
  }
}

export const formatMoney = (amount) => "$" + amount.toLocaleString("en-US")
