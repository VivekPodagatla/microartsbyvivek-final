import { API_URL } from "../config"

// ================= DESIGN REQUESTS =================

// Public: multipart FormData (design, contact, photoIds, giftSlug /
// artworkSlug, photos, preview). No Content-Type header, so the
// browser adds the multipart boundary.
export const createDesignRequest = (formData) =>
  fetch(`${API_URL}/api/design-requests`, {
    method: "POST",
    body: formData,
  })

// Used to wake the Render server before sending.
export const checkApiHealth = (signal) =>
  fetch(`${API_URL}/api/health`, { signal })

// Artist only.
export const getDesignRequests = (token, status = "") =>
  fetch(`${API_URL}/api/design-requests${status ? `?status=${encodeURIComponent(status)}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

export const getDesignRequest = (token, id) =>
  fetch(`${API_URL}/api/design-requests/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

export const updateDesignRequest = (token, id, updates) =>
  fetch(`${API_URL}/api/design-requests/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  })

export const deleteDesignRequest = (token, id) =>
  fetch(`${API_URL}/api/design-requests/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
