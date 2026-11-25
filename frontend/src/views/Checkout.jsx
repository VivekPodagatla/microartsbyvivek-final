import PhoneFields from "../components/PhoneFields"
import ConsentCheckbox from "../components/ConsentCheckbox"

// ================= CHECKOUT =================

function Checkout({
  setShowCheckout,
  setShowCart,
  handleSubmitOrder,
  checkoutName,
  setCheckoutName,
  checkoutEmail,
  setCheckoutEmail,
  checkoutCountryCode,
  setCheckoutCountryCode,
  checkoutPhone,
  setCheckoutPhone,
  checkoutHasWhatsapp,
  setCheckoutHasWhatsapp,
  checkoutConsent,
  setCheckoutConsent,
  checkoutAddress,
  setCheckoutAddress,
  isSubmittingOrder,
  cart,
  cartItemCount,
  cartTotal,
}) {
  return (
    <section className="checkout-page">

      <button
        className="back-button"
        onClick={() => {
          setShowCheckout(false)
          setShowCart(true)
        }}
      >
        ← Back to Requests Cart
      </button>

      <div className="checkout-container">

        <div className="checkout-form-section">

          <h1>Submit Request</h1>

          <p>
            Enter your contact and shipping information.
            The artist will contact you to confirm your
            personalized MicroArt request.
          </p>

          <form
            className="checkout-form"
            onSubmit={handleSubmitOrder}
          >

            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                required
                minLength="2"
                maxLength="100"
                value={checkoutName}
                onChange={(event) =>
                  setCheckoutName(event.target.value)
                }
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>


            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                required
                maxLength="150"
                value={checkoutEmail}
                onChange={(event) =>
                  setCheckoutEmail(event.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>


            <PhoneFields
              countryCode={checkoutCountryCode}
              setCountryCode={setCheckoutCountryCode}
              phone={checkoutPhone}
              setPhone={setCheckoutPhone}
              hasWhatsapp={checkoutHasWhatsapp}
              setHasWhatsapp={setCheckoutHasWhatsapp}
            />


            <div className="form-group">
              <label>Shipping Address</label>

              <textarea
                required
                minLength="10"
                maxLength="500"
                rows="5"
                value={checkoutAddress}
                onChange={(event) =>
                  setCheckoutAddress(event.target.value)
                }
                placeholder="Street address, apartment/unit, city, state, ZIP code, country"
                autoComplete="street-address"
              />
            </div>

            <ConsentCheckbox
              checked={checkoutConsent}
              setChecked={setCheckoutConsent}
            />

            <button
              type="submit"
              className="checkout-button"
              disabled={isSubmittingOrder}
            >
              {isSubmittingOrder
                ? "Submitting..."
                : "Submit Request"}
            </button>

          </form>

        </div>


        {/* ================= ORDER SUMMARY ================= */}

        <aside className="cart-summary">

          <h2>Request Summary</h2>

          {cart.map((item) => (

            <div
              className="checkout-summary-item"
              key={item.id}
            >

              <strong>
                {item.quantity} × {item.product}
              </strong>

              <p>
                Personalization: "{item.text}"
              </p>

              <p>
                $
                {(
                  item.price * item.quantity
                ).toFixed(2)}
              </p>

            </div>

          ))}

          <hr />

          <div className="summary-row">
            <span>Items</span>

            <span>
              {cartItemCount}
            </span>
          </div>

          <div className="summary-total">

            <span>
              Estimated Total
            </span>

            <strong>
              ${cartTotal.toFixed(2)}
            </strong>

          </div>

          <p>
            No payment is collected online.
            The artist will contact you to confirm
            the order details.
          </p>

        </aside>

      </div>

    </section>
  )
}

export default Checkout
