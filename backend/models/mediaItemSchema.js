const mongoose = require("mongoose")

// One image or video in an artwork's or gift's media list.
// Shared by Artwork and PersonalizedProduct.

const mediaItemSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    // Cloudinary public ID
    publicId: {
      type: String,
      trim: true,
      default: "",
    },

    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
  },
  {
    _id: false,
  }
)

module.exports = mediaItemSchema
