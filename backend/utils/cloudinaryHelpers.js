const cloudinary =
  require("../config/cloudinary")


// =====================================================
// UPLOAD IMAGE / VIDEO
// =====================================================
//
// resourceType is "image" or "video".

const uploadImage =
  (
    imageBuffer,
    folder,
    resourceType = "image"
  ) => {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type:
                resourceType,
            },

            (
              error,
              result
            ) => {

              if (error) {
                return reject(
                  error
                )
              }


              return resolve(
                result
              )
            }
          )


        uploadStream.end(
          imageBuffer
        )
      }
    )
  }


// =====================================================
// DELETE IMAGE / VIDEO
// =====================================================

const deleteImage =
  async (
    publicId,
    resourceType = "image"
  ) => {

    if (!publicId) {
      return
    }


    try {

      await cloudinary
        .uploader
        .destroy(
          publicId,
          {
            resource_type:
              resourceType,

            invalidate:
              true,
          }
        )

    } catch (error) {

      console.error(
        "Cloudinary image deletion error:",
        error.message
      )
    }
  }


// =====================================================

module.exports = {
  uploadImage,
  deleteImage,
}
