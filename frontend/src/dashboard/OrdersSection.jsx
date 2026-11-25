import PhoneWithWhatsapp from "../components/PhoneWithWhatsapp"

import {
  getImageUrl,
} from "../utils/images"

// ================= CUSTOMER ORDERS =================

function OrdersSection({
  orders,
  updateOrderStatus,
  deletePersonalizedOrder,
}) {
  return (
    <>

      <div className="artist-dashboard-header">

        <h1>
          Personalized Gift Requests
        </h1>

        <p>
          Manage personalized MicroArt gift requests.
        </p>

      </div>


      {orders.length === 0 ? (

        <div className="empty-dashboard">

          <h2>
            No Personalized Gift Requests
          </h2>

          <p>
            There are currently no personalized MicroArt
            order requests.
          </p>

        </div>

      ) : (

        <div className="custom-requests-list customer-orders-list">

          {orders.map((order) => (

            <article
              className="custom-request-card"
              key={order._id}
            >

              {/* ================= DESKTOP CUSTOMER DETAILS ================= */}

              <div className="order-customer-section desktop-order-customer">

                <h2>
                  Customer Details
                </h2>

                <p>
                  <strong>Name:</strong>{" "}
                  {order.fullName}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {order.email}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  <PhoneWithWhatsapp
                    phone={order.phone}
                    hasWhatsapp={order.hasWhatsapp}
                  />
                </p>

              </div>


              <div className="order-shipping-section desktop-order-customer">

                <h3>
                  Shipping Address
                </h3>

                <p>
                  {order.address}
                </p>

              </div>


              <div className="order-date-section desktop-order-customer">

                <p>
                  <strong>Submitted:</strong>{" "}
                  {new Date(
                    order.createdAt
                  ).toLocaleString()}
                </p>

              </div>


              {/* ================= ORDER ITEMS ================= */}

              <div className="order-items">

                <h3 className="order-items-heading">
                  Ordered MicroArts
                </h3>

                {order.items.map(
                  (item, index) => (

                    <div
                      className="order-item"
                      key={`${order._id}-${index}`}
                    >

                      {item.image && (

                        <div className="order-item-image">

                          <img
                            src={getImageUrl(item.image)}
                            alt={item.product}
                          />

                        </div>

                      )}


                      <div className="order-item-details">

                        <h3>
                          {item.product}
                        </h3>

                        <p className="order-personalization">
                          <strong>
                            Personalization:
                          </strong>{" "}
                          "{item.text}"
                        </p>

                        <p className="order-item-quantity">
                          <strong>
                            Quantity:
                          </strong>{" "}
                          {item.quantity}
                        </p>

                        <p className="order-item-price">
                          <strong>
                            Price Each:
                          </strong>{" "}
                          ${Number(item.price).toFixed(2)}
                        </p>

                        <p className="order-item-subtotal">
                          <strong>
                            Item Total:
                          </strong>{" "}
                          $
                          {(
                            Number(item.price) *
                            item.quantity
                          ).toFixed(2)}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>


              {/* ================= MOBILE CUSTOMER DETAILS ================= */}

              <details className="mobile-customer-details">

                <summary>
                  Customer Details
                </summary>

                <div className="mobile-customer-details-content">

                  <p>
                    <strong>Name:</strong>{" "}
                    {order.fullName}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {order.email}
                  </p>

                  <p>
                    <strong>Phone:</strong>{" "}
                    <PhoneWithWhatsapp
                      phone={order.phone}
                      hasWhatsapp={order.hasWhatsapp}
                    />
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {order.address}
                  </p>

                </div>

              </details>


              {/* ================= ORDER MANAGEMENT ================= */}

              <div className="order-management-section">

                <div className="order-total-row">

                  <span>
                    Estimated Order Total
                  </span>

                  <strong>
                    ${Number(
                      order.totalPrice
                    ).toFixed(2)}
                  </strong>

                </div>


                <div className="order-status-control">

                  <label>
                    Order Status
                  </label>

                  <select
                    className={`order-status-select status-${order.status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    value={order.status}
                    onChange={(event) =>
                      updateOrderStatus(
                        order._id,
                        event.target.value
                      )
                    }
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Contacted">
                      Contacted
                    </option>

                    <option value="Confirmed">
                      Confirmed
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

              </div>

              <div className="request-actions">
                <button
                  type="button"
                  className="delete-request-btn"
                  onClick={() => deletePersonalizedOrder(order._id)}
                >
                  Delete Request
                </button>
              </div>

            </article>

          ))}

        </div>

      )}

    </>
  )
}

export default OrdersSection
