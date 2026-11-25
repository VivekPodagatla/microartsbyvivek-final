// ================= CONTACT RULES =================
// Phone numbers for every customer form (design requests, custom
// art and contact requests, personalized gift requests). Shared by
// the frontend and the backend, so keep it free of DOM and Node APIs.

// [ISO region, name, dial code]. The region is used to pick a
// default from the visitor's browser language.
export const COUNTRY_CODES = [
  ["US", "United States / Canada", "+1"],
  ["IN", "India", "+91"],
  ["GB", "United Kingdom", "+44"],
  ["AU", "Australia", "+61"],
  ["NZ", "New Zealand", "+64"],
  ["AE", "United Arab Emirates", "+971"],
  ["SA", "Saudi Arabia", "+966"],
  ["QA", "Qatar", "+974"],
  ["KW", "Kuwait", "+965"],
  ["OM", "Oman", "+968"],
  ["BH", "Bahrain", "+973"],
  ["SG", "Singapore", "+65"],
  ["MY", "Malaysia", "+60"],
  ["IE", "Ireland", "+353"],
  ["DE", "Germany", "+49"],
  ["FR", "France", "+33"],
  ["NL", "Netherlands", "+31"],
  ["IT", "Italy", "+39"],
  ["ES", "Spain", "+34"],
  ["CH", "Switzerland", "+41"],
  ["SE", "Sweden", "+46"],
  ["NO", "Norway", "+47"],
  ["DK", "Denmark", "+45"],
  ["ZA", "South Africa", "+27"],
  ["NG", "Nigeria", "+234"],
  ["KE", "Kenya", "+254"],
  ["PK", "Pakistan", "+92"],
  ["BD", "Bangladesh", "+880"],
  ["LK", "Sri Lanka", "+94"],
  ["NP", "Nepal", "+977"],
  ["JP", "Japan", "+81"],
  ["KR", "South Korea", "+82"],
  ["CN", "China", "+86"],
  ["HK", "Hong Kong", "+852"],
  ["PH", "Philippines", "+63"],
  ["ID", "Indonesia", "+62"],
  ["TH", "Thailand", "+66"],
  ["VN", "Vietnam", "+84"],
  ["BR", "Brazil", "+55"],
  ["MX", "Mexico", "+52"],
]

export const DIAL_CODES = [...new Set(COUNTRY_CODES.map(([, , code]) => code))]

// Country code guessed from browser languages (["en-IN"] → "+91"),
// falling back to +1.
export function defaultCountryCode(languages = []) {
  const regions = languages
    .map((language) => String(language || "").split("-")[1]?.toUpperCase())
    .filter(Boolean)
  for (const region of regions) {
    const match = COUNTRY_CODES.find(([iso]) => iso === region || (region === "CA" && iso === "US"))
    if (match) return match[2]
  }
  return "+1"
}

const PHONE = /^[0-9][0-9 ()-]{3,20}$/

// The number without its country code, which is chosen separately.
// Returns { phoneFull } (e.g. "+91 98765 43210") or { error }.
export function validatePhone(countryCode, phone) {
  const code = String(countryCode ?? "").trim()
  const number = String(phone ?? "").trim()
  const digits = number.replace(/\D/g, "")
  const codeDigits = code.replace(/\D/g, "")

  if (!DIAL_CODES.includes(code)) return { error: "Please choose your country code." }
  if (
    !PHONE.test(number) ||
    digits.length < 5 ||
    digits.length + codeDigits.length < 8 ||
    digits.length + codeDigits.length > 15
  ) {
    return { error: "Please enter a valid phone number (without the country code)." }
  }
  return { phoneFull: `${code} ${number}` }
}

export const CONSENT_ERROR = "Please agree to be contacted about your request."
