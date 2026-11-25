import { API_URL } from "../config"

// Each function returns the raw fetch promise.
// Callers handle response.ok, response.json() and errors.

// ================= PUBLIC - SUBMIT GIFT ORDER REQUEST =================

export const createOrder = (orderData) =>
  fetch(
    `${API_URL}/api/orders`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(orderData),
    }
  )


// ================= ARTIST - GET ALL ORDERS =================

export const getOrders = (token) =>
  fetch(
    `${API_URL}/api/orders`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )


// ================= ARTIST - UPDATE ORDER STATUS =================

export const patchOrderStatus = (token, orderId, status) =>
  fetch(
    `${API_URL}/api/orders/${orderId}/status`,
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


// ================= ARTIST - DELETE ORDER =================

export const deleteOrderById = (token, orderId) =>
  fetch(
    `${API_URL}/api/orders/${orderId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
