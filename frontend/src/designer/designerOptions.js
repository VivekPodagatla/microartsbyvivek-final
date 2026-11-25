// ================= DESIGNER UI OPTIONS =================
// Display-only choices (the priced and validated ones live in
// shared/designRules.js).

// Yellow first: it is the preferred smile colour.
export const SYMBOL_COLORS = ["#f2c230", "#d8281f", "#e8508a", "#1f4fa8", "#0f6b78", "#2e9e5b", "#7a1f33", "#232323", "#ffffff"]

export const BACKGROUNDS = ["#ffffff", "#f3ecdc", "#f4d6d6", "#cfe0cf", "#1d2b4a", "#1c1c1e"]

export { QUOTE_FONTS } from "../../../shared/designRules.js"

// Shown as "తెలుగు" in the font pickers.
export const TELUGU_FONTS = ["Chathura", "Ramabhadra", "Mandali", "Gidugu", "Dhurjati", "Noto Sans Telugu"]

// Quote fonts from Google Fonts, loaded only on the designer page.
// The pencil fonts (Bebas Neue, Anton, Permanent Marker, Chathura,
// Magnolia Script) are self-hosted instead.
export const QUOTE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Pacifico&family=Lobster&family=Caveat:wght@400;700&family=Satisfy&family=Sacramento&family=Kaushan+Script&family=Courgette&family=Shadows+Into+Light&family=Amatic+SC:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&family=Cinzel:wght@400;700&family=Montserrat:wght@400;700&family=Oswald:wght@400;700&family=Righteous&family=Abril+Fatface&family=Ramabhadra&family=Mandali&family=Gidugu&family=Dhurjati&family=Noto+Sans+Telugu:wght@400;700&display=swap"

export const SYMBOL_PRICE_HINT =
  "Small ♥ $4 · ♥ $5 ($8 with colour) · ♥ in ♥ $10 ($13 with colour) · ☺ $8 ($10 with colour)"

export const rgba = (hex, alpha) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha / 100})`
}
