import { API_URL } from "../config"

// Each function returns the raw fetch promise.
// Callers handle response.ok, response.json() and errors.

// ================= PUBLIC - SUBMIT CUSTOM ART REQUEST =================
// The form reads its inputs with FormData, but the
// request itself is sent as JSON.

export const createCustomRequest = (requestData) =>
  fetch(
    `${API_URL}/api/custom-requests`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    }
  )


// ================= ARTIST - GET ALL CUSTOM REQUESTS =================

export const getCustomRequests = (token) =>
  fetch(
    `${API_URL}/api/custom-requests`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


// ================= ARTIST - UPDATE CUSTOM REQUEST STATUS =================

export const patchCustomRequestStatus = (token, requestId, status) =>
  fetch(
    `${API_URL}/api/custom-requests/${requestId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  )


// ================= ARTIST - DELETE CUSTOM REQUEST =================

export const deleteCustomRequestById = (token, requestId) =>
  fetch(
    `${API_URL}/api/custom-requests/${requestId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
