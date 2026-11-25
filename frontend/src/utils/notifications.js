// ================= MICROARTS NOTIFICATIONS =================

export const classifyNotification = (message) => {
  const normalizedMessage =
    message.toLowerCase()

  if (
    normalizedMessage.includes(
      "success"
    ) ||
    normalizedMessage.includes(
      "added"
    ) ||
    normalizedMessage.includes(
      "updated"
    ) ||
    normalizedMessage.includes(
      "deleted"
    ) ||
    normalizedMessage.includes(
      "logged out"
    ) ||
    normalizedMessage.includes(
      "submitted"
    )
  ) {
    return "success"
  }

  if (
    normalizedMessage.includes(
      "please"
    ) ||
    normalizedMessage.includes(
      "empty"
    ) ||
    normalizedMessage.includes(
      "artist only"
    ) ||
    normalizedMessage.includes(
      "required"
    )
  ) {
    return "warning"
  }

  if (
    normalizedMessage.includes(
      "failed"
    ) ||
    normalizedMessage.includes(
      "unable"
    ) ||
    normalizedMessage.includes(
      "invalid"
    ) ||
    normalizedMessage.includes(
      "error"
    )
  ) {
    return "error"
  }

  return "info"
}

export const titleByType = {
  success: "Success",
  error: "Something went wrong",
  warning: "Please check",
  info: "MicroArts",
}
