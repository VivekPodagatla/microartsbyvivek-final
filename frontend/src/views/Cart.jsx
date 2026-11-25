import {
  getImageUrl,
} from "../utils/images"

// ================= REQUESTS CART =================

function Cart({
  openPersonalized,
  cartItemCount,
  cart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  cartTotal,
  setShowCheckout,
  setShowCart,
}) {
  return (
    <section className="cart-page">

      <button
        className="back-button"
        onClick={
          openPersonalized
        }
      >
        ← Back to Gifts
      </button>

      <div className="cart-header">

        <h1>
          Your Requests Cart
        </h1>

        <p>
          {cartItemCount}{" "}
          {cartItemCount ===
          1
            ? "item"
            : "items"}{" "}
          in your requests cart
        </p>

      </div>

      {cart.length === 0 ? (

        <div className="empty-cart">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h2>
            Your requests cart is empty
          </h2>

          <p>
            Explore our personalized
            MicroArts and create
            something unique.
          </p>

          <button
            className="continue-shopping-button"
            onClick={
              openPersonalized
            }
          >
            Explore Personalized MicroArts
          </button>

        </div>

      ) : (

        <div className="cart-layout">

          <div className="cart-items">

            {cart.map(
              (item) => (

                <article
                  className="cart-item"
                  key={item.id}
                >

                  <div className="cart-item-image">

                  <img
                    src={getImageUrl(item.image)}
                    alt={item.product}
                  />

                  </div>

                  <div className="cart-item-info">

                    <h3>
                      {
                        item.product
                      }
                    </h3>

                    <p className="cart-custom-text">
                      Custom text:{" "}
                      <strong>
                        "{item.text}"
                      </strong>
                    </p>

                    <p className="cart-item-price">
                      $
                      {
                        item.price
                      }{" "}
                      each
                    </p>

                    <div className="quantity-controls">

                      <button
                        onClick={() =>
                          decreaseQuantity(
                            item.id
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {
                          item.quantity
                        }
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(
                            item.id
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                    <button
                      className="remove-cart-item"
                      onClick={() =>
                        removeFromCart(
                          item.id
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                  <div className="cart-item-total">

                    $
                    {(
                      item.price *
                      item.quantity
                    ).toFixed(
                      2
                    )}

                  </div>

                </article>

              )
            )}

          </div>

          <aside className="cart-summary">

            <h2>
              Order Summary
            </h2>

            <div className="summary-row">

              <span>
                Items
              </span>

              <span>
                {
                  cartItemCount
                }
              </span>

            </div>

            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <span>
                $
                {cartTotal.toFixed(
                  2
                )}
              </span>

            </div>

            <div className="summary-row">

              <span>
                Shipping
              </span>

              <span>
                Will be confirmed by artist
              </span>

            </div>

            <hr />

            <div className="summary-total">

              <span>
                Confirmed by artist
              </span>

              <strong>
                $
                {cartTotal.toFixed(
                  2
                )}
              </strong>

            </div>

            <button
              className="checkout-button"
              onClick={() => {
                setShowCheckout(true)
                setShowCart(false)

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }}
            >
              Proceed to Request
            </button>

          </aside>

        </div>

      )}

    </section>
  )
}

export default Cart
