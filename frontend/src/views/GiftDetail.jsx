import {
  getImageUrl,
} from "../utils/images"
import MediaGallery from "../components/MediaGallery"

// ================= PRODUCT DETAIL =================

function GiftDetail({
  setShowProduct,
  setSelectedPersonalizedProduct,
  setShowPersonalized,
  selectedPersonalizedProduct,
  customText,
  setCustomText,
  letterCount,
  addToCart,
  openDesigner,
}) {
  return (
    <section className="personalized-product-page">

      <button
        className="back-button"
        onClick={() => {
          if (window.history.state?.directEntry) {
            window.history.replaceState({ microartsView: "personalized" }, "", "/")
            setShowProduct(false)
            setSelectedPersonalizedProduct(null)
            setShowPersonalized(true)
          } else {
            window.history.back()
          }
        }}
      >
        ← Back to Personalized Gifts
      </button>

      <div className="personalized-product-detail">

        <div className="personalized-product-image">

          <MediaGallery
            item={selectedPersonalizedProduct}
            getUrl={getImageUrl}
            altText={
              selectedPersonalizedProduct.imageAlt?.trim() ||
              selectedPersonalizedProduct.title
            }
          />

        </div>


        <div className="personalized-product-info">

          <h1>
            {selectedPersonalizedProduct.title}
          </h1>

          <p className="product-description">
            {selectedPersonalizedProduct.description}
          </p>

          <div className="pricing-rule">

            <strong>
              Pricing
            </strong>

            <p>
              ${selectedPersonalizedProduct.pricePerLetter} per letter
            </p>

            <p>
              Minimum price: $
              {selectedPersonalizedProduct.minimumPrice}
            </p>

            <p>
              Spaces are not counted.
            </p>

          </div>

          {selectedPersonalizedProduct.inStock === false && (
            <p className="stock-unavailable" role="status" style={{ color: "#a12424", fontWeight: 700 }}>
              Out of Stock — Materials are currently unavailable. You can still view this artwork, but requests are temporarily closed.
            </p>
          )}

          <div className="name-input-section">

            <label htmlFor="customText">
              Enter the name or short message
            </label>

            <input
              id="customText"
              type="text"
              value={customText}
              onChange={(event) =>
                setCustomText(event.target.value)
              }
              placeholder="Example: Vivek Podagatla"
              maxLength="50"
              disabled={selectedPersonalizedProduct.inStock === false}
            />

            <p className="letter-count">
              {letterCount}{" "}
              {letterCount === 1
                ? "letter"
                : "letters"}
            </p>

          </div>

          <div className="product-price-box">

            <span>
              Price
            </span>

            <strong>
              $
              {Math.max(
                Number(
                  selectedPersonalizedProduct.minimumPrice
                ) || 0,
                Number(
                  selectedPersonalizedProduct.basePrice
                ) || 0,
                letterCount *
                  (Number(
                    selectedPersonalizedProduct.pricePerLetter
                  ) || 0)
              )}
            </strong>

          </div>

          <button
            className="add-to-cart-button"
            onClick={addToCart}
            disabled={selectedPersonalizedProduct.inStock === false}
            style={selectedPersonalizedProduct.inStock === false ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
          >
            {selectedPersonalizedProduct.inStock === false ? "Out of Stock" : "🎁 Add to Requests"}
          </button>

          {selectedPersonalizedProduct.inStock !== false && (
            <div className="gift-design-cta">
              <p>
                Want it your way? Design the pencil art and frame,
                and we'll receive your design with this gift request.
              </p>
              <button
                type="button"
                className="design-idea-button"
                onClick={() =>
                  openDesigner({
                    type: "gift",
                    slug: selectedPersonalizedProduct.slug,
                  })
                }
              >
                Design Your Gift Idea
              </button>
            </div>
          )}

        </div>

      </div>

    </section>
  )
}

export default GiftDetail
