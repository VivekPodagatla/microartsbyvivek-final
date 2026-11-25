import {
  getImageUrl,
} from "../utils/images"

// ================= PERSONALIZED MICROARTS =================

function PersonalizedGallery({
  goHome,
  personalizedLoading,
  personalizedError,
  loadPersonalizedProducts,
  personalizedProducts,
  filteredPersonalizedProducts,
  giftCategories,
  giftCategoryFilter,
  setGiftCategoryFilter,
  giftSearch,
  setGiftSearch,
  setCustomText,
  setSelectedPersonalizedProduct,
  setShowProduct,
  openDesigner,
}) {
  return (
    <section className="personalized-page">

      <button
        className="back-button"
        onClick={
          goHome
        }
      >
        ← Back to Home
      </button>

      <h2>
        Personalized Gifts
      </h2>

      <p className="section-description">
        Turn a name or special message into a one-of-a-kind miniature artwork,
        handcrafted to create a gift they will always remember.
      </p>

      <div className="design-idea-row">
        <span>Have your own idea?</span>
        <button
          type="button"
          className="design-idea-button"
          onClick={openDesigner}
        >
          Design Your Gift Idea
        </button>
      </div>

      {/* ================= GIFT SEARCH ================= */}

      {personalizedProducts.length > 0 && (
        <form
          className="gift-search"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label
            htmlFor="gift-search-input"
            className="visually-hidden"
          >
            Search personalized gifts
          </label>

          <input
            id="gift-search-input"
            type="search"
            value={giftSearch}
            onChange={(event) => setGiftSearch(event.target.value)}
            placeholder="Search gifts, e.g. birthday, formal, anniversary"
            autoComplete="off"
          />

          {giftSearch && (
            <button
              type="button"
              className="gift-search-clear"
              aria-label="Clear search"
              onClick={() => setGiftSearch("")}
            >
              ×
            </button>
          )}
        </form>
      )}

      {/* ================= CATEGORY FILTER ================= */}

      {giftCategories.length > 0 && (
        <div
          className="gift-filters"
          role="group"
          aria-label="Filter gifts by category"
        >
          {["all", ...giftCategories].map((category) => (
            <button
              type="button"
              key={category}
              className={`gift-filter-chip ${
                giftCategoryFilter === category ? "active" : ""
              }`}
              aria-pressed={giftCategoryFilter === category}
              onClick={() => setGiftCategoryFilter(category)}
            >
              {category === "all" ? "All Gifts" : category}
            </button>
          ))}
        </div>
      )}

      <div className="personalized-products">


        {personalizedLoading ? (
          <div className="gallery-loading" role="status" style={{ gridColumn: "1 / -1" }}>
            <h3>Loading Personalized MicroArts...</h3>
            <p>
              Our gallery is waking up. This may take around
              60 seconds or longer.
            </p>
            <p>Your personalized artworks will appear automatically.</p>
          </div>
        ) : personalizedError ? (

          <div className="gallery-loading" role="alert" style={{ gridColumn: "1 / -1" }}>
            <h3>Unable to Load Personalized MicroArts</h3>

            <p>Please try again in a moment.</p>

            <button
              type="button"
              onClick={loadPersonalizedProducts}
            >
              Try Again
            </button>
          </div>

        ) : personalizedProducts.length === 0 ? (


          <div className="empty-personalized-products" style={{ gridColumn: "1 / -1" }}>

            <h3>
              No Personalized MicroArts Available
            </h3>

            <p>
              New personalized artworks will be
              available soon.
            </p>

          </div>

        ) : filteredPersonalizedProducts.length === 0 ? (

          <div className="empty-personalized-products" style={{ gridColumn: "1 / -1" }}>

            <h3>
              {giftSearch.trim()
                ? `No Gifts Match "${giftSearch.trim()}"`
                : "No Gifts in This Category"}
            </h3>

            <button
              type="button"
              className="gift-filter-chip"
              onClick={() => {
                setGiftSearch("")
                setGiftCategoryFilter("all")
              }}
            >
              Show All Gifts
            </button>

          </div>

        ) : (

          filteredPersonalizedProducts.map((product) => (

            <article
              className="personalized-card"
              key={product._id}
              onClick={() => {
                window.history.replaceState(
                  { ...window.history.state, microartsView: "personalized" },
                  "",
                  window.location.href
                )
                window.history.pushState(
                  { microartsView: "product" },
                  "",
                  `/gifts/${product.slug}`
                )

                setCustomText("")
                setSelectedPersonalizedProduct(product)
                setShowProduct(true)
              }}
            >


              <div className="artwork-image-container" style={{ position: "relative" }}>
                {product.inStock === false && (
                  <span className="stock-badge" style={{ position: "absolute", zIndex: 2, top: 10, left: 10, padding: "6px 10px", borderRadius: 6, background: "#7d2525", color: "white", fontWeight: 700 }}>
                    Out of Stock
                  </span>
                )}

                <img
                  src={getImageUrl(product.image)}
                  alt={product.imageAlt?.trim() || product.title}
                  loading="lazy"
                  onLoad={(event) => {
                    event.currentTarget.classList.add("image-loaded")
                  }}
                />

              </div>


              <div className="personalized-info">

                <h3>
                  {product.title}
                </h3>

                <p className="personalized-price">
                  <span>Starting at</span>
                  <strong>
                    ${Math.max(
                      product.basePrice || 0,
                      product.minimumPrice || 0
                    )}
                  </strong>
                </p>

              </div>

            </article>

          ))

        )}

      </div>

    </section>
  )
}

export default PersonalizedGallery
