// ================= ORDER SUCCESS =================

function OrderSuccess({
  submittedOrder,
  setOrderSubmitted,
  setSubmittedOrder,
  goHome,
}) {
  return (
    <section className="checkout-page">

      <div className="checkout-container">

        <div className="checkout-form-section order-success-card">

          <div className="order-success-icon">
            ✓
          </div>

          <h1>
            Request Submitted!
          </h1>

          <p>
            Thank you, {submittedOrder.fullName}.
            Your personalized MicroArt request
            has been received successfully.
          </p>

          <p>
            The artist will contact you using the
            phone number or email you provided to
            confirm the request details.
          </p>

          <div className="order-confirmation-details">

            <h2>
              Request Details
            </h2>

            <div className="confirmation-row">
              <span>Status</span>

              <strong className="order-status-badge">
                {submittedOrder.status}
              </strong>
            </div>

            <div className="confirmation-row">
              <span>Estimated Total</span>

              <strong className="confirmation-total">
                $
                {Number(
                  submittedOrder.totalPrice
                ).toFixed(2)}
              </strong>
            </div>

          </div>

          <div className="success-button-container">
            <button
              className="checkout-button"
              onClick={() => {
                setOrderSubmitted(false)
                setSubmittedOrder(null)
                goHome()
              }}
            >
              Continue to Home
            </button>
          </div>

        </div>

      </div>

    </section>
  )
}

export default OrderSuccess
