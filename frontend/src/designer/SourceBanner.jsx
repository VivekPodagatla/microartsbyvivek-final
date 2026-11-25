import { getImageUrl, getArtworkImageUrl } from "../utils/images"

// ================= WHERE THIS DESIGN CAME FROM =================
// Shown when the designer was opened from a gift page
// (/design?gift=<slug>: the design is sent with a request for that
// gift, at its price) or an artwork page (/design?artwork=<slug>:
// the request mentions the artwork as inspiration, no price).

function SourceBanner({ designerSource, designerGift, designerArtwork, loading, removeSource }) {
  const isGift = designerSource.type === "gift"
  const item = isGift ? designerGift : designerArtwork

  if (!item) {
    return (
      <div className="gift-banner">
        <p className="hint">
          {loading
            ? `Loading the ${isGift ? "gift" : "artwork"} you chose...`
            : `That ${isGift ? "gift" : "artwork"} is no longer available. You can still design your own idea.`}
        </p>
        {!loading && (
          <button type="button" className="mini" onClick={removeSource}>
            Continue without it
          </button>
        )}
      </div>
    )
  }

  const imageUrl = isGift ? getImageUrl(item.image) : getArtworkImageUrl(item.image)

  return (
    <div className="gift-banner">
      {item.image && (
        <img src={imageUrl} alt={item.imageAlt?.trim() || item.title} />
      )}
      <div>
        <span className="gift-banner-label">
          {isGift ? "Designing for" : "Inspired by"}
        </span>
        <strong>{item.title}</strong>
        <p className="hint">
          {isGift
            ? "Your design will be sent with this gift request."
            : "Vivek will see this artwork with your design."}
        </p>
      </div>
      <button
        type="button"
        className="mini"
        aria-label={`Design without this ${isGift ? "gift" : "artwork"}`}
        onClick={removeSource}
      >
        ✕
      </button>
    </div>
  )
}

export default SourceBanner
