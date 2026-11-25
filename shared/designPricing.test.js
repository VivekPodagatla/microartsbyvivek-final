// Run with: cd shared && npm test
import test from "node:test"
import assert from "node:assert/strict"

import { artPrice, priceDesign } from "./designPricing.js"
import { stripEmoji, graphemes } from "./designRules.js"

const art = (text, font, syms = []) => ({
  text,
  kind: "hex",
  color: "#d8281f",
  font,
  ends: 2,
  syms,
})

const smile = (c = null) => ({ t: "sm", c, c2: null })
const heart = (c = null) => ({ t: "h2", c, c2: null })

test("roy, regular font: $20 (minimum applies)", () => {
  const price = artPrice(art("roy", "Bebas Neue"))
  assert.equal(price.price, 20)
  assert.equal(price.minimumApplies, true)
})

test("rosy plus a plain smile, regular font: $32", () => {
  assert.equal(artPrice(art("rosy", "Anton", [smile()])).price, 32)
})

test("rosy plus a yellow smile, regular font: $34", () => {
  assert.equal(artPrice(art("rosy", "Anton", [smile("#f2c230")])).price, 34)
})

test("roy, cursive font: $40", () => {
  assert.equal(artPrice(art("roy", "Magnolia Script")).price, 40)
})

test("anna, cursive font plus a plain heart: $53", () => {
  assert.equal(artPrice(art("anna", "Permanent Marker", [heart()])).price, 53)
})

test("anna, cursive font plus a coloured heart: $56", () => {
  assert.equal(artPrice(art("anna", "Permanent Marker", [heart("#d8281f")])).price, 56)
})

test("8x10 frame with a photo, a quote, roy and rosy + smile: $72", () => {
  const design = {
    frame: { size: "8x10", orientation: "L", background: "#ffffff", thickness: 1, frameColor: "#4a2f1d" },
    items: [
      { type: "photo" },
      { type: "text" },
      { type: "pencil", p: art("roy", "Bebas Neue") },
      { type: "pencil", p: art("rosy", "Bebas Neue", [smile()]) },
    ],
  }

  const result = priceDesign(design)
  assert.deepEqual(result.lines.map((line) => line.amount), [15, 5, 20, 32])
  assert.equal(result.total, 72)
})

test("a gift the design was made from is not charged", () => {
  const design = {
    frame: { size: "8x10", orientation: "L", thickness: 1 },
    items: [{ type: "pencil", p: art("roy", "Bebas Neue") }],
  }
  const gift = { title: "Formal Gift", basePrice: 30, minimumPrice: 45 }

  const result = priceDesign(design, gift)
  assert.equal(result.total, 15 + 20)
  assert.ok(result.lines.every((line) => !line.label.includes("gift")))
})

test("spaces are not counted as characters", () => {
  assert.equal(artPrice(art("ab cd", "Bebas Neue")).characters, 4)
})

test("a Telugu letter with a vowel sign counts once", () => {
  assert.equal(graphemes("కి").length, 1)
})

test("emoji are stripped from pencil text", () => {
  assert.equal(stripEmoji("Ro❤️sy👍🏽🇮🇳"), "Rosy")
  assert.equal(stripEmoji("రోజీ 123"), "రోజీ 123")
})

test("printing is charged once however many photos and quotes", () => {
  const design = {
    frame: { size: "12x16", orientation: "P", thickness: 1 },
    items: [{ type: "photo" }, { type: "photo" }, { type: "text" }],
  }
  assert.equal(priceDesign(design).total, 25 + 10)
})
