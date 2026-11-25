const express = require("express")
const mongoose = require("mongoose")

const DesignRequest =
  require("../models/DesignRequest")

const {
  DESIGN_REQUEST_STATUSES,
} =
  require("../models/DesignRequest")

const PersonalizedProduct =
  require("../models/PersonalizedProduct")

const Artwork =
  require("../models/Artwork")

const authMiddleware =
  require("../middleware/authMiddleware")

const artistMiddleware =
  require("../middleware/artistMiddleware")

const {
  uploadDesignRequest,
} =
  require("../middleware/uploadMiddleware")

const {
  uploadImage,
  deleteImage,
} =
  require("../utils/cloudinaryHelpers")

const {
  loadSharedDesign,
} =
  require("../utils/sharedDesign")

const {
  notifyNewDesignRequest,
} =
  require("../utils/notifyArtist")


const router = express.Router()


// =====================================================
// HELPERS
// =====================================================

const parseJsonField =
  (value) => {
    try {
      return JSON.parse(
        String(value || "")
      )
    } catch {
      return null
    }
  }


const badRequest =
  (
    res,
    message
  ) =>
    res.status(400).json({
      success: false,
      message,
    })


const deleteUploads =
  (uploads) =>
    Promise.all(
      uploads.map((file) =>
        deleteImage(
          file.publicId
        )
      )
    )


// =====================================================
// PUBLIC - SUBMIT A DESIGN REQUEST
// No customer login required.
//
// multipart/form-data:
//   design      JSON (the designer's arts, frame and items)
//   contact     JSON (name, whatsapp, email, address, notes, consent)
//   photoIds    JSON array: the design item id of each photo,
//               in the same order as the "photos" files
//   giftSlug    optional, the gift the design was made for
//   artworkSlug optional, the artwork it was inspired by
//   photos      original photo files
//   preview     PNG of the finished frame
//
// The price is always recomputed here; the browser's
// total is never used.
// =====================================================

router.post(
  "/",
  uploadDesignRequest,
  async (req, res) => {

    const uploads = []

    try {

      const shared =
        await loadSharedDesign()


      // ================= DESIGN =================

      const designResult =
        shared.validateDesign(
          parseJsonField(
            req.body.design
          )
        )

      if (designResult.error) {
        return badRequest(
          res,
          designResult.error
        )
      }

      const design =
        designResult.design


      // ================= CONTACT =================

      const contactResult =
        shared.validateContact(
          parseJsonField(
            req.body.contact
          )
        )

      if (contactResult.error) {
        return badRequest(
          res,
          contactResult.error
        )
      }


      // ================= FILES =================

      const previewFile =
        req.files?.preview?.[0]

      const photoFiles =
        req.files?.photos || []

      if (!previewFile) {
        return badRequest(
          res,
          "The design preview is missing. Please try again."
        )
      }


      // Every photo in the design needs exactly one file.

      const photoIds =
        parseJsonField(
          req.body.photoIds
        )

      const photoItemIds =
        design.items
          .filter((item) =>
            item.type === "photo"
          )
          .map((item) =>
            item.id
          )
          .sort((a, b) => a - b)

      const sentIds =
        Array.isArray(photoIds)
          ? photoIds
              .map(Number)
              .sort((a, b) => a - b)
          : []

      if (
        sentIds.length !== photoFiles.length ||
        sentIds.join(",") !== photoItemIds.join(",")
      ) {
        return badRequest(
          res,
          "Some photos are missing. Please add them again and resend."
        )
      }


      // ================= GIFT / ARTWORK =================

      const giftSlug =
        String(req.body.giftSlug || "").trim()

      const artworkSlug =
        String(req.body.artworkSlug || "").trim()

      let gift = null
      let artwork = null

      if (giftSlug) {
        gift =
          await PersonalizedProduct.findOne({
            slug: giftSlug,
            active: true,
          })

        if (
          !gift ||
          gift.inStock === false
        ) {
          return badRequest(
            res,
            "That gift is no longer available. Remove it from your design and send again."
          )
        }
      }

      if (artworkSlug) {
        artwork =
          await Artwork.findOne({
            slug: artworkSlug,
          })
      }


      // ================= PRICE =================
      //
      // Only the design is charged (frame, printing, pencil
      // arts). The gift it was made from is a reference.

      const price =
        shared.priceDesign(
          design
        )


      // ================= UPLOAD TO CLOUDINARY =================

      const requestId =
        new mongoose.Types.ObjectId()

      const folder =
        `microarts/design-requests/${requestId}`

      const previewResult =
        await uploadImage(
          previewFile.buffer,
          folder
        )

      uploads.push({
        publicId:
          previewResult.public_id,
      })

      const photos = []

      for (
        let index = 0;
        index < photoFiles.length;
        index++
      ) {
        const result =
          await uploadImage(
            photoFiles[index].buffer,
            folder
          )

        uploads.push({
          publicId:
            result.public_id,
        })

        photos.push({
          itemId:
            Number(photoIds[index]),
          url:
            result.secure_url,
          publicId:
            result.public_id,
          width:
            result.width,
          height:
            result.height,
        })
      }


      // ================= SAVE =================

      const designRequest =
        await DesignRequest.create({
          _id:
            requestId,

          design,

          preview: {
            url:
              previewResult.secure_url,
            publicId:
              previewResult.public_id,
          },

          photos,

          gift: gift
            ? {
                productId:
                  gift._id,
                slug:
                  gift.slug,
                title:
                  gift.title,
              }
            : undefined,

          artwork: artwork
            ? {
                artworkId:
                  artwork._id,
                slug:
                  artwork.slug,
                title:
                  artwork.title,
              }
            : undefined,

          priceBreakdown:
            price.lines,

          total:
            price.total,

          contact:
            contactResult.contact,

          statusHistory: [
            {
              status: "new",
            },
          ],
        })


      notifyNewDesignRequest(
        designRequest
      )


      return res.status(201).json({
        success: true,
        message:
          "Your design request has been sent.",
        requestId:
          designRequest._id,
        total:
          designRequest.total,
      })

    } catch (error) {

      console.error(
        "Create design request error:",
        error
      )

      await deleteUploads(
        uploads
      )

      return res.status(500).json({
        success: false,
        message:
          "Your design could not be sent. Please try again.",
      })
    }
  }
)


// =====================================================
// ARTIST - LIST DESIGN REQUESTS (newest first)
// The design JSON is left out of the list.
// =====================================================

router.get(
  "/",
  authMiddleware,
  artistMiddleware,
  async (req, res) => {
    try {

      const filter = {}

      if (
        DESIGN_REQUEST_STATUSES.includes(
          req.query.status
        )
      ) {
        filter.status =
          req.query.status
      }


      const designRequests =
        await DesignRequest.find(
          filter
        )
          .select("-design")
          .sort({
            createdAt: -1,
          })


      return res.status(200).json({
        success: true,
        designRequests,
      })

    } catch (error) {

      console.error(
        "Get design requests error:",
        error
      )

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch design requests.",
      })
    }
  }
)


// =====================================================
// ARTIST - ONE DESIGN REQUEST (with the design)
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  artistMiddleware,
  async (req, res) => {
    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return badRequest(
          res,
          "Invalid design request ID."
        )
      }


      const designRequest =
        await DesignRequest.findById(
          req.params.id
        )

      if (!designRequest) {
        return res.status(404).json({
          success: false,
          message:
            "Design request not found.",
        })
      }


      return res.status(200).json({
        success: true,
        designRequest,
      })

    } catch (error) {

      console.error(
        "Get design request error:",
        error
      )

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch the design request.",
      })
    }
  }
)


// =====================================================
// ARTIST - UPDATE STATUS / NOTES
// =====================================================

router.patch(
  "/:id",
  authMiddleware,
  artistMiddleware,
  async (req, res) => {
    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return badRequest(
          res,
          "Invalid design request ID."
        )
      }


      const designRequest =
        await DesignRequest.findById(
          req.params.id
        )

      if (!designRequest) {
        return res.status(404).json({
          success: false,
          message:
            "Design request not found.",
        })
      }


      const {
        status,
        notes,
      } = req.body


      if (status !== undefined) {

        if (
          !DESIGN_REQUEST_STATUSES.includes(
            status
          )
        ) {
          return badRequest(
            res,
            "Invalid status."
          )
        }

        if (
          status !== designRequest.status
        ) {
          designRequest.status =
            status

          designRequest.statusHistory.push({
            status,
          })
        }
      }


      if (notes !== undefined) {
        designRequest.notes =
          String(notes).slice(0, 5000)
      }


      await designRequest.save()


      return res.status(200).json({
        success: true,
        message:
          "Design request updated.",
        designRequest,
      })

    } catch (error) {

      console.error(
        "Update design request error:",
        error
      )

      return res.status(500).json({
        success: false,
        message:
          "Failed to update the design request.",
      })
    }
  }
)


// =====================================================
// ARTIST - DELETE (and its Cloudinary files)
// Customers' photos are personal data.
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  artistMiddleware,
  async (req, res) => {
    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return badRequest(
          res,
          "Invalid design request ID."
        )
      }


      const designRequest =
        await DesignRequest.findById(
          req.params.id
        )

      if (!designRequest) {
        return res.status(404).json({
          success: false,
          message:
            "Design request not found.",
        })
      }


      await deleteUploads([
        designRequest.preview,
        ...designRequest.photos,
      ])

      await designRequest.deleteOne()


      return res.status(200).json({
        success: true,
        message:
          "Design request and its photos deleted.",
      })

    } catch (error) {

      console.error(
        "Delete design request error:",
        error
      )

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete the design request.",
      })
    }
  }
)


module.exports = router
