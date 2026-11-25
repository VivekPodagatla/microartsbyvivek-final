import {
  getArtworkImageUrl,
} from "../utils/images"
import MediaGallery from "../components/MediaGallery"

// ================= ARTWORK DETAIL =================

function ArtworkDetail({
  backToGallery,
  selectedArtwork,
  setRequestFormType,
  setCustomRequestArtwork,
  setSelectedArtwork,
  setRequestSubmitted,
  setShowRequestForm,
  openPersonalized,
  openDesigner,
}) {
  return (
    <section className="artwork-detail">

      <button
        className="back-button"
        onClick={backToGallery}
      >
        ← Back to Gallery
      </button>

      <div className="artwork-detail-content">

        {/* ARTWORK IMAGE */}

        <div className="artwork-detail-image">

          <MediaGallery
            item={selectedArtwork}
            getUrl={getArtworkImageUrl}
            altText={selectedArtwork.imageAlt?.trim() || selectedArtwork.title}
          />

        </div>

        {/* ARTWORK INFORMATION */}

        <div className="artwork-detail-info">

          <h2>
            {selectedArtwork.title}
          </h2>

          <p className="artwork-detail-size">
            {selectedArtwork.size}
          </p>

          <div className="artwork-description">

            <h3>
              About This Artwork
            </h3>

            <p>
              {selectedArtwork.description}
            </p>

          </div>

          <div className="artwork-details">

            <h3>
              Artwork Details
            </h3>

            <p>
              <strong>
                Category:
              </strong>{" "}
              {selectedArtwork.category}
            </p>

            <p>
              <strong>
                Material:
              </strong>{" "}
              {selectedArtwork.material || "Not specified"}
            </p>

            <p>
              <strong>
                Size:
              </strong>{" "}
              {selectedArtwork.size || "Not specified"}
            </p>

            <p>
              <strong>
                Time Taken:
              </strong>{" "}
              {selectedArtwork.timeTaken || "Not specified"}
            </p>

            <p>
              <strong>
                Artist:
              </strong>{" "}
              Vivek Podagatla
            </p>

          </div>

        </div>

        {/* CUSTOM ART BOX */}

        <div className="custom-art-box">

          <div className="custom-art-content">

            <h3>
              Create Your Own MicroArt
            </h3>

            <p>
              Create personalized miniature artwork made
              especially for you. Names, messages, portraits,
              and unique miniature designs can be created as
              custom artwork.
            </p>

          </div>

          <div className="custom-art-actions">

            <button
              onClick={() => {
                setRequestFormType("custom-art")
                setCustomRequestArtwork(selectedArtwork)
                setSelectedArtwork(null)
                setRequestSubmitted(false)
                setShowRequestForm(true)
              }}
            >
              Request Customized Art
            </button>

            <button
              onClick={openPersonalized}
            >
              Explore Personalized Gifts
            </button>

            <button
              onClick={() =>
                openDesigner({
                  type: "artwork",
                  slug: selectedArtwork.slug,
                })
              }
            >
              Design Your Gift Idea
            </button>

          </div>

        </div>

      </div>

    </section>
  )
}

export default ArtworkDetail
