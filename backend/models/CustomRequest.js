const mongoose = require("mongoose")

const customRequestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Country code chosen separately; phone above holds the full
    // number ("+91 98765 43210") so older screens keep working.
    countryCode: {
      type: String,
      trim: true,
    },

    // WhatsApp preferred; false means call or text instead.
    // Missing on requests sent before this was asked.
    hasWhatsapp: {
      type: Boolean,
    },

    consent: {
      type: Boolean,
    },

    requestDetails: {
      type: String,
      trim: true,
      default: "",
    },

    requestType: {
      type: String,
      enum: [
        "custom-art",
        "contact",
      ],
      default: "custom-art",
    },

    artworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artwork",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model(
  "CustomRequest",
  customRequestSchema
)