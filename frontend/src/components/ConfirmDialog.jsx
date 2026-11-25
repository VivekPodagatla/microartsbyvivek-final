// ================= MICROARTS CONFIRMATION =================

function ConfirmDialog({
  confirmDialog,
  closeConfirmDialog,
}) {
  return confirmDialog && (
    <div
      className="microarts-confirm-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          closeConfirmDialog(false)
        }
      }}
    >
      <div
        className="microarts-confirm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="microarts-confirm-title"
      >
        <div className="microarts-confirm-symbol">
          ?
        </div>

        <h2 id="microarts-confirm-title">
          {confirmDialog.title}
        </h2>

        <p>
          {confirmDialog.message}
        </p>

        <div className="microarts-confirm-actions">
          <button
            type="button"
            className="microarts-confirm-cancel"
            onClick={() =>
              closeConfirmDialog(false)
            }
          >
            {confirmDialog.cancelText}
          </button>

          <button
            type="button"
            className={
              confirmDialog.danger
                ? "microarts-confirm-danger"
                : "microarts-confirm-primary"
            }
            onClick={() =>
              closeConfirmDialog(true)
            }
          >
            {confirmDialog.confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
