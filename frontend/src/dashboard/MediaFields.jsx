import {
  getMediaItems,
  getVideoPosterUrl,
} from "../utils/images"

// ================= MEDIA FORM FIELDS =================
// Shared by the add/edit forms for artworks and gifts.
// Uncontrolled inputs, read by the form's FormData:
//   media        new image / video files
//   coverMedia   URL of the image shown first (edit only)
//   removeMedia  URLs of current media to delete (edit only)

const MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"

function MediaFields({
  item,
  getUrl,
}) {
  const mediaItems = item ? getMediaItems(item) : []

  return (
    <>
      {item && (

        <div className="form-group">

          <label>Current Photos &amp; Videos</label>

          <div className="media-editor-list">

            {mediaItems.map((media, index) => (

              <div
                className="media-editor-item"
                key={media.url}
              >

                <img
                  src={
                    media.type === "video"
                      ? getVideoPosterUrl(getUrl(media.url))
                      : getUrl(media.url)
                  }
                  alt={`${item.title} ${media.type} ${index + 1}`}
                />

                {media.type === "video" && (
                  <span className="media-editor-badge">Video</span>
                )}

                {media.type === "image" && (
                  <label className="media-editor-option">
                    <input
                      type="radio"
                      name="coverMedia"
                      value={media.url}
                      defaultChecked={index === 0}
                    />
                    Cover
                  </label>
                )}

                <label className="media-editor-option">
                  <input
                    type="checkbox"
                    name="removeMedia"
                    value={media.url}
                  />
                  Remove
                </label>

              </div>

            ))}

          </div>

          <small>
            The cover photo appears first and on the gallery card.
          </small>

        </div>

      )}

      <div className="form-group">

        <label>
          {item ? "Add Photos or Videos (Optional)" : "Photos & Videos"}
        </label>

        <input
          type="file"
          name="media"
          accept={MEDIA_ACCEPT}
          multiple
          required={!item}
        />

        <small>
          Up to 10 files. Images: JPG, PNG or WEBP up to 10 MB.
          Videos: MP4, WEBM or MOV up to 50 MB.
          {!item && " The first image is used as the cover."}
        </small>

      </div>
    </>
  )
}

export default MediaFields
