const {
  uploadImage,
  deleteImage,
} =
  require("./cloudinaryHelpers")

const {
  isVideoFile,
  isTooLarge,
  MAX_MEDIA_FILES,
} =
  require("../middleware/uploadMiddleware")


// =====================================================
// SHARED MEDIA LOGIC FOR ARTWORKS AND GIFTS
// =====================================================
//
// Each item stores a `media` list of images and videos.
// `image` / `imagePublicId` are kept as the cover
// (the first image in `media`) because cards, the cart,
// order emails and the SEO pages read them.


// ================= CURRENT MEDIA =================
//
// Older items only have `image`, so they are treated
// as a one-image media list.

const getMediaList =
  (item) => {

    if (
      Array.isArray(item.media) &&
      item.media.length > 0
    ) {
      return item.media.map(
        (media) => ({
          url:
            media.url,

          publicId:
            media.publicId || "",

          type:
            media.type,
        })
      )
    }


    if (!item.image) {
      return []
    }


    return [
      {
        url:
          item.image,

        publicId:
          item.imagePublicId || "",

        type:
          "image",
      },
    ]
  }


// ================= FORM LIST VALUES =================
//
// Multer gives one string for a single value
// and an array for repeated values.

const toList =
  (value) => {

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return []
    }


    return (
      Array.isArray(value)
        ? value
        : [value]
    )
      .map((entry) =>
        String(entry).trim()
      )
      .filter(Boolean)
  }


// ================= VALIDATE NEW FILES =================
//
// Returns an error message, or null when valid.

const validateMediaFiles =
  (
    files,
    keptMedia = []
  ) => {

    const oversizedImage =
      files.find(isTooLarge)


    if (oversizedImage) {
      return `"${oversizedImage.originalname}" is larger than 10 MB. Images must be 10 MB or smaller.`
    }


    if (
      keptMedia.length +
        files.length >
      MAX_MEDIA_FILES
    ) {
      return `You can add up to ${MAX_MEDIA_FILES} images and videos.`
    }


    const hasImage =
      keptMedia.some(
        (media) =>
          media.type === "image"
      ) ||
      files.some(
        (file) =>
          !isVideoFile(file)
      )


    if (!hasImage) {
      return "At least one image is required. It is used as the cover photo."
    }


    return null
  }


// ================= UPLOAD NEW FILES =================
//
// Uploads one at a time to keep memory use low.
// If any upload fails, the ones that already
// uploaded are removed before the error is thrown.

const uploadMediaFiles =
  async (
    files,
    folder
  ) => {

    const uploaded =
      []


    try {

      for (const file of files) {

        const type =
          isVideoFile(file)
            ? "video"
            : "image"


        const result =
          await uploadImage(
            file.buffer,
            folder,
            type
          )


        uploaded.push({
          url:
            result.secure_url,

          publicId:
            result.public_id,

          type,
        })
      }

    } catch (error) {

      await deleteMediaItems(
        uploaded
      )


      throw error
    }


    return uploaded
  }


// ================= DELETE MEDIA =================

const deleteMediaItems =
  async (
    mediaItems
  ) => {

    for (const media of mediaItems) {

      await deleteImage(
        media.publicId,
        media.type
      )
    }
  }


// ================= MOVE COVER FIRST =================

const moveCoverFirst =
  (
    mediaItems,
    coverUrl
  ) => {

    const cover =
      mediaItems.find(
        (media) =>
          media.url === coverUrl &&
          media.type === "image"
      )


    if (!cover) {
      return mediaItems
    }


    return [
      cover,
      ...mediaItems.filter(
        (media) =>
          media !== cover
      ),
    ]
  }


// ================= APPLY MEDIA TO ITEM =================

const applyMedia =
  (
    item,
    mediaItems
  ) => {

    const cover =
      mediaItems.find(
        (media) =>
          media.type === "image"
      )


    item.media =
      mediaItems

    item.image =
      cover.url

    item.imagePublicId =
      cover.publicId
  }


module.exports = {
  getMediaList,
  toList,
  validateMediaFiles,
  uploadMediaFiles,
  deleteMediaItems,
  moveCoverFirst,
  applyMedia,
}
