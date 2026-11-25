// Run with: cd shared && npm test
import test from "node:test"
import assert from "node:assert/strict"

import { validateDesign, validateContact } from "./designValidation.js"

const art = (text = "roy") => ({ text, kind: "hex", color: "#d8281f", font: "Bebas Neue", ends: 2, syms: [] })

const design = (items) => ({
  arts: [art()],
  frame: { size: "8x10", orientation: "L", background: "#ffffff", thickness: 1, frameColor: "#4a2f1d" },
  items,
})

const pencil = (id, text = "roy") => ({ id, type: "pencil", n: 1, x: 15, y: 70, w: 70, rot: 0, p: art(text) })

test("a valid design is cleaned, keeping only known fields", () => {
  const input = design([{ ...pencil(1), src: "data:huge", extra: "x" }])
  const { design: clean, error } = validateDesign(input)
  assert.equal(error, undefined)
  assert.equal(clean.version, 1)
  assert.equal(clean.items[0].src, undefined)
  assert.equal(clean.items[0].extra, undefined)
})

test("a placed pencil art with empty text is refused", () => {
  assert.match(validateDesign(design([pencil(1, "   ")])).error, /needs a name/)
})

test("emoji in pencil text is refused", () => {
  assert.match(validateDesign(design([pencil(1, "roy😀")])).error, /emoji/)
})

test("an unknown font is refused", () => {
  const item = pencil(1)
  item.p.font = "Comic Sans MS"
  assert.match(validateDesign(design([item])).error, /font/)
})

test("an empty frame is refused", () => {
  assert.match(validateDesign(design([])).error, /empty/)
})

test("more than 8 photos is refused", () => {
  const photos = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1, type: "photo", x: 0, y: 0, w: 20, shape: "free", nw: 100, nh: 100,
  }))
  assert.match(validateDesign(design(photos)).error, /8 photos/)
})

test("contact needs name, phone, address and consent; email is optional", () => {
  const ok = { name: "Priya", countryCode: "+91", phone: "98765 43210", hasWhatsapp: true, address: "Hyderabad", consent: true }
  const { contact, error } = validateContact(ok)
  assert.equal(error, undefined)
  assert.equal(contact.phoneFull, "+91 98765 43210")
  assert.equal(contact.hasWhatsapp, true)
  assert.equal(validateContact({ ...ok, hasWhatsapp: false }).contact.hasWhatsapp, false)
  assert.match(validateContact({ ...ok, phone: "123" }).error, /phone number/)
  assert.match(validateContact({ ...ok, countryCode: "+999" }).error, /country code/)
  assert.match(validateContact({ ...ok, email: "not-an-email" }).error, /email/)
  assert.match(validateContact({ ...ok, consent: false }).error, /agree/)
  assert.match(validateContact({ ...ok, address: "" }).error, /address/)
})
