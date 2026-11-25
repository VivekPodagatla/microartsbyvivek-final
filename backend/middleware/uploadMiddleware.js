const multer =
  require("multer")


// =====================================================
// MEMORY STORAGE
// =====================================================
//
// Images and videos are temporarily kept in memory,
// then uploaded to Cloudinary.
//
// Nothing is permanently saved to backend/uploads.

const storage =
  multer.memoryStorage()


// =====================================================
// MEDIA LIMITS
// =====================================================

const MAX_MEDIA_FILES =
  10

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024

const MAX_VIDEO_SIZE =
  50 * 1024 * 1024

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

const VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
]

const MEDIA_TYPE_ERROR =
  "Only JPG, PNG, WEBP images and MP4, WEBM, MOV videos are allowed"


// =====================================================
// MEDIA VALIDATION
// =====================================================

const fileFilter =
  (
    req,
    file,
    callback
  ) => {

    if (
      IMAGE_TYPES.includes(
        file.mimetype
      ) ||
      VIDEO_TYPES.includes(
        file.mimetype
      )
    ) {
      return callback(
        null,
        true
      )
    }


    return callback(
      new Error(
        MEDIA_TYPE_ERROR
      ),
      false
    )
  }


// =====================================================
// MULTER
// =====================================================
//
// Multer only supports one size limit, so it is set
// to the video limit. Images are checked against the
// smaller image limit in isTooLarge().

const upload =
  multer({
    storage,

    fileFilter,

    limits: {
      fileSize:
        MAX_VIDEO_SIZE,

      files:
        MAX_MEDIA_FILES,
    },
  })


// =====================================================
// HELPERS
// =====================================================

const isVideoFile =
  (file) =>
    VIDEO_TYPES.includes(
      file.mimetype
    )

const isTooLarge =
  (file) =>
    !isVideoFile(file) &&
    file.size > MAX_IMAGE_SIZE


// Accepts new "media" files and the older single
// "image" field, so cached frontends keep working.

const uploadMedia =
  upload.fields([
    {
      name: "media",
      maxCount:
        MAX_MEDIA_FILES,
    },
    {
      name: "image",
      maxCount: 1,
    },
  ])


const getUploadedFiles =
  (req) => [
    ...(req.files?.image || []),
    ...(req.files?.media || []),
  ]


// =====================================================
// DESIGN REQUEST UPLOADS
// =====================================================
//
// Customer photos (JPG / PNG / WEBP, up to 10 MB each)
// and one PNG preview of the finished frame.
// Keep MAX_DESIGN_PHOTOS in sync with MAX_PHOTOS in
// shared/designRules.js.

const MAX_DESIGN_PHOTOS =
  8

const DESIGN_PHOTO_TYPE_ERROR =
  "Photos must be JPG, PNG or WEBP images"


const designFileFilter =
  (
    req,
    file,
    callback
  ) => {

    if (
      file.fieldname === "preview" &&
      file.mimetype === "image/png"
    ) {
      return callback(
        null,
        true
      )
    }


    if (
      file.fieldname === "photos" &&
      IMAGE_TYPES.includes(
        file.mimetype
      )
    ) {
      return callback(
        null,
        true
      )
    }


    return callback(
      new Error(
        DESIGN_PHOTO_TYPE_ERROR
      ),
      false
    )
  }


const uploadDesignRequest =
  multer({
    storage,

    fileFilter:
      designFileFilter,

    limits: {
      fileSize:
        MAX_IMAGE_SIZE,

      files:
        MAX_DESIGN_PHOTOS + 1,

      // The design JSON is a text field.
      fieldSize:
        512 * 1024,
    },
  }).fields([
    {
      name: "photos",
      maxCount:
        MAX_DESIGN_PHOTOS,
    },
    {
      name: "preview",
      maxCount: 1,
    },
  ])


module.exports = {
  upload,
  uploadMedia,
  uploadDesignRequest,
  getUploadedFiles,
  isVideoFile,
  isTooLarge,
  MAX_MEDIA_FILES,
  MAX_DESIGN_PHOTOS,
  MEDIA_TYPE_ERROR,
  DESIGN_PHOTO_TYPE_ERROR,
}
