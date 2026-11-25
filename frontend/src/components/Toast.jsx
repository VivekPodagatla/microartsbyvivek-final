// ================= MICROARTS NOTIFICATION =================

function Toast({
  notification,
  setNotification,
}) {
  return notification && (
    <div
      className={`microarts-toast microarts-toast-${notification.type}`}
      role="status"
      aria-live="polite"
    >
      <div className="microarts-toast-icon">
        {notification.type === "success"
          ? "✓"
          : notification.type === "error"
            ? "!"
            : notification.type === "warning"
              ? "!"
              : "i"}
      </div>

      <div className="microarts-toast-content">
        <strong>
          {notification.title}
        </strong>

        <p>
          {notification.message}
        </p>
      </div>

      <button
        type="button"
        className="microarts-toast-close"
        onClick={() =>
          setNotification(null)
        }
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  )
}

export default Toast
