const mongoose = require("mongoose")


// =====================================================
// DESIGN REQUEST
// =====================================================
//
// A customer's "Design Your Gift Idea" submission:
// the design JSON (as validated by shared/designValidation.js),
// the preview and original photos on Cloudinary, the price
// the server computed, and the contact details.

const DESIGN_REQUEST_STATUSES = [
  "new",
  "proof_sent",
  "paid",
  "carving",
  "shipped",
  "cancelled",
]


const uploadedFileSchema =
  new mongoose.Schema(
    {
      url: {
        type: String,
        required: true,
      },

      publicId: {
        type: String,
        required: true,
      },
    },
    {
      _id: false,
    }
  )


const designRequestSchema =
  new mongoose.Schema(
    {
      // Versioned design JSON, stored as submitted (after cleaning).
      design: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },

      preview: {
        type: uploadedFileSchema,
        required: true,
      },

      // Original photos, by the id of their item in the design.
      photos: [
        {
          itemId: {
            type: Number,
            required: true,
          },

          url: {
            type: String,
            required: true,
          },

          publicId: {
            type: String,
            required: true,
          },

          width: Number,

          height: Number,

          _id: false,
        },
      ],

      // The gift the design was made for. Only the design is charged;
      // "price" is only on older requests, which included the gift.
      gift: {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PersonalizedProduct",
        },

        slug: String,

        title: String,

        price: Number,
      },

      // The artwork the design was inspired by (no price).
      artwork: {
        artworkId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Artwork",
        },

        slug: String,

        title: String,
      },

      priceBreakdown: [
        {
          label: String,

          amount: Number,

          _id: false,
        },
      ],

      total: {
        type: Number,
        required: true,
      },

      contact: {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        // Phone number: country code chosen separately.
        // Checked on submit (shared/designValidation.js), not here,
        // so older requests without these fields can still be saved.
        countryCode: {
          type: String,
          trim: true,
        },

        phone: {
          type: String,
          trim: true,
        },

        // "+91 98765 43210", for display and links.
        phoneFull: {
          type: String,
          trim: true,
        },

        // WhatsApp is preferred; false means call or text instead.
        hasWhatsapp: {
          type: Boolean,
          default: true,
        },

        // Requests sent before the phone fields existed
        // kept the whole number here.
        whatsapp: {
          type: String,
          trim: true,
        },

        email: {
          type: String,
          trim: true,
          lowercase: true,
          default: "",
        },

        address: {
          type: String,
          trim: true,
          default: "",
        },

        notes: {
          type: String,
          trim: true,
          default: "",
        },

        consent: {
          type: Boolean,
          required: true,
        },
      },

      status: {
        type: String,
        enum: DESIGN_REQUEST_STATUSES,
        default: "new",
      },

      statusHistory: [
        {
          status: {
            type: String,
            enum: DESIGN_REQUEST_STATUSES,
          },

          at: {
            type: Date,
            default: Date.now,
          },

          _id: false,
        },
      ],

      // Vivek's private notes.
      notes: {
        type: String,
        trim: true,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  )


const DesignRequest =
  mongoose.model(
    "DesignRequest",
    designRequestSchema
  )


module.exports = DesignRequest
module.exports.DESIGN_REQUEST_STATUSES = DESIGN_REQUEST_STATUSES
