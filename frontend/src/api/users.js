import { API_URL } from "../config"

// Each function returns the raw fetch promise.
// Callers handle response.ok, response.json() and errors.

// ================= ARTIST - GET PROFILE =================

export const getProfile = (token) =>
  fetch(
    `${API_URL}/api/users/profile`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
