import { API_URL } from "../config"

// Each function returns the raw fetch promise.
// Callers handle response.ok, response.json() and errors.

// ================= PUBLIC - GET ACTIVE PRODUCTS =================

export const getPersonalizedProducts = () =>
  fetch(
    `${API_URL}/api/personalized-products`
  )


// ================= ARTIST - GET ALL PRODUCTS =================
// Includes inactive products

export const getArtistProducts = (token) =>
  fetch(
    `${API_URL}/api/personalized-products/artist/all`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


// ================= ARTIST - ADD PRODUCT =================
// FormData upload: no Content-Type header, so the
// browser sets the multipart boundary itself.

export const createProduct = (token, formData) =>
  fetch(
    `${API_URL}/api/personalized-products`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  )


// ================= ARTIST - UPDATE PRODUCT =================
// Used by the edit form and the stock / active toggles.
// FormData upload: no Content-Type header.

export const patchProduct = (token, productId, formData) =>
  fetch(
    `${API_URL}/api/personalized-products/${productId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  )


// ================= ARTIST - DELETE PRODUCT =================

export const deleteProductById = (token, productId) =>
  fetch(
    `${API_URL}/api/personalized-products/${productId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
