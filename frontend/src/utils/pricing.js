// ================= PERSONALIZED PRICING =================
// Mirrors the server-side calculation in backend/routes/orderRoutes.js

export const calculatePersonalizedPrice = (product, text) => {
  if (!product) {
    return 0
  }

  const letters = text.replace(/\s/g, "").length

  const basePrice =
    Number(product.basePrice) || 0

  const minimumPrice =
    Number(product.minimumPrice) || 0

  const pricePerLetter =
    Number(product.pricePerLetter) || 0

  return Math.max(
    basePrice,
    minimumPrice,
    letters * pricePerLetter
  )
}