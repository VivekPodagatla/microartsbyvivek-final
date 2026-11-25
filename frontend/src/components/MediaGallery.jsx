import {
  getMediaItems,
  getVideoPosterUrl,
} from "../utils/images"

// ================= MEDIA GALLERY =================
// Swipeable images and videos for the artwork and gift
// detail pages. Uses CSS scroll-snap, so it needs no state:
// a thumbnail click scrolls the track to its slide.

function MediaGallery({
  item,
  getUrl,
  altText,
}) {
  const mediaItems = getMediaItems(item)

  return (
    <div className="media-gallery">

      <div className="media-gallery-track">

        {mediaItems.map((media, index) => (

          <div
            className="media-gallery-slide"
            key={media.url}
          >

            {media.type === "video" ? (
              <video
                src={getUrl(media.url)}
                poster={getVideoPosterUrl(getUrl(media.url))}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={getUrl(media.url)}
                alt={
                  index === 0
                    ? altText
                    : `${altText} (${index + 1} of ${mediaItems.length})`
                }
                loading={index === 0 ? "eager" : "lazy"}
              />
            )}

          </div>

        ))}

      </div>


      {mediaItems.length > 1 && (

        <div className="media-gallery-thumbs">

          {mediaItems.map((media, index) => (

            <button
              type="button"
              className="media-gallery-thumb"
              key={media.url}
              aria-label={`Show ${media.type} ${index + 1} of ${mediaItems.length}`}
              onClick={(event) => {
                const track = event.currentTarget
                  .closest(".media-gallery")
                  .querySelector(".media-gallery-track")

                track.scrollTo({
                  left: index * track.clientWidth,
                  behavior: "smooth",
                })
              }}
            >
              <img
                src={
                  media.type === "video"
                    ? getVideoPosterUrl(getUrl(media.url))
                    : getUrl(media.url)
                }
                alt=""
                loading="lazy"
              />

              {media.type === "video" && (
                <span className="media-gallery-play" aria-hidden="true">
                  ▶
                </span>
              )}
            </button>

          ))}

        </div>

      )}

    </div>
  )
}

export default MediaGallery
