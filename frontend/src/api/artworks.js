import { API_URL } from "../config"

// Each function returns the raw fetch promise.
// Callers handle response.ok, response.json() and errors.

// ================= PUBLIC - GET ARTWORKS =================

export const getArtworks = () =>
  fetch(`${API_URL}/api/artworks`)


// ================= ARTIST - ADD ARTWORK =================
// FormData upload: no Content-Type header, so the
// browser sets the multipart boundary itself.

export const createArtwork = (token, formData) =>
  fetch(
    `${API_URL}/api/artworks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  )


// ================= ARTIST - UPDATE ARTWORK =================
// Used by the edit form and the featured toggle.
// FormData upload: no Content-Type header.

export const patchArtwork = (token, artworkId, formData) =>
  fetch(
    `${API_URL}/api/artworks/${artworkId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  )


// ================= ARTIST - DELETE ARTWORK =================

export const deleteArtworkById = (token, artworkId) =>
  fetch(
    `${API_URL}/api/artworks/${artworkId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
