import {
  COUNTRY_CODES,
  defaultCountryCode,
} from "../../../shared/contactRules.js"

// ================= PHONE HELPERS =================

export { COUNTRY_CODES }

// Country code guessed from this visitor's browser language
// (en-IN → +91), falling back to +1.
// wa.me link for a stored number such as "+91 98765 43210".
export const whatsappUrl = (phone) =>
  `https://wa.me/${String(phone || "").replace(/\D/g, "")}`

export const browserCountryCode = () =>
  defaultCountryCode(
    navigator.languages?.length
      ? navigator.languages
      : [navigator.language]
  )
