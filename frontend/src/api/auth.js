import { API_URL } from "../config"

// Each function returns the raw fetch promise.
// Callers handle response.ok, response.json() and errors.

// ================= ARTIST LOGIN =================

export const loginArtist = (identifier, password) =>
  fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    }
  )


// ================= ARTIST LOGIN - 2FA CODE =================
// Second step when the login response has twoFactorRequired.

export const verifyTwoFactorLogin = (challengeToken, code) =>
  fetch(
    `${API_URL}/api/auth/login/verify-2fa`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        challengeToken,
        code,
      }),
    }
  )


// ================= ARTIST - START 2FA SETUP =================
// Returns a QR code for the authenticator app.

export const startTwoFactorSetup = (token) =>
  fetch(
    `${API_URL}/api/auth/2fa/setup`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


// ================= ARTIST - CONFIRM 2FA SETUP =================

export const enableTwoFactor = (token, code) =>
  fetch(
    `${API_URL}/api/auth/2fa/enable`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code,
      }),
    }
  )


// ================= ARTIST - TURN OFF 2FA =================

export const disableTwoFactor = (token, password, code) =>
  fetch(
    `${API_URL}/api/auth/2fa/disable`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password,
        code,
      }),
    }
  )
