// ================= DESIGNER FONTS =================
// Used by the customer designer and the dashboard's design view.
// Pencil fonts are self-hosted; quote fonts come from Google Fonts
// and are only loaded on these pages.

import "@fontsource/bebas-neue/400.css"
import "@fontsource/anton/400.css"
import "@fontsource/permanent-marker/400.css"
import "@fontsource/chathura/800.css"
import "./fonts.css"

import { PENCIL_FONTS } from "../../../shared/designRules.js"
import { fontCss } from "./pencilArt"
import { QUOTE_FONTS_URL } from "./designerOptions"

const LINK_ID = "designer-quote-fonts"
let quoteFontsLoading = null

// Resolves once the quote-fonts stylesheet has loaded (or failed),
// so document.fonts.load() can find those families.
export function loadQuoteFonts() {
  if (!quoteFontsLoading) {
    quoteFontsLoading = new Promise((resolve) => {
      const existing = document.getElementById(LINK_ID)
      if (existing) {
        resolve()
        return
      }
      const link = document.createElement("link")
      link.id = LINK_ID
      link.rel = "stylesheet"
      link.href = QUOTE_FONTS_URL
      link.onload = () => resolve()
      link.onerror = () => resolve()
      document.head.appendChild(link)
    })
  }
  return quoteFontsLoading
}

export const loadPencilFonts = () =>
  Promise.all(
    PENCIL_FONTS.map((font) => document.fonts.load(fontCss(font, 24), "Aaఅ").catch(() => null))
  )
