const express =
  require("express")

const mongoose =
  require("mongoose")

const Artwork =
  require("../models/Artwork")
const { generateUniqueSlug } =
  require("../utils/productSlug")

const authMiddleware =
  require("../middleware/authMiddleware")

const artistMiddleware =
  require("../middleware/artistMiddleware")

const {
  uploadMedia,
  getUploadedFiles,
} =
  require("../middleware/uploadMiddleware")

const {
  getMediaList,
  toList,
  validateMediaFiles,
  uploadMediaFiles,
  deleteMediaItems,
  moveCoverFirst,
  applyMedia,
} =
  require("../utils/mediaHelpers")


const router =
  express.Router()


// =====================================================
// PUBLIC - GET ALL ARTWORKS
// =====================================================

router.get(
  "/",
  async (req, res) => {
    try {

      const artworks =
        await Artwork.find()
          .sort({
            featured: -1,
            featuredOrder: 1,
            createdAt: -1,
          })


      return res.json({
        success: true,
        artworks,
      })

    } catch (error) {

      console.error(
        "Get artworks error:",
        error
      )


      return res.status(500).json({
        success: false,
        message:
          "Server error",
      })
    }
  }
)


// =====================================================
// PUBLIC - GET FEATURED ARTWORKS
// =====================================================

router.get(
  "/featured",
  async (req, res) => {
    try {

      const artworks =
        await Artwork.find({
          featured: true,
        }).sort({
          featuredOrder: 1,
          createdAt: -1,
        })


      return res.json({
        success: true,
        artworks,
      })

    } catch (error) {

      console.error(
        "Get featured artworks error:",
        error
      )


      return res.status(500).json({
        success: false,
        message:
          "Server error",
      })
    }
  }
)

// =====================================================
// PUBLIC - GET ARTWORK BY SLUG
// =====================================================

router.get(
  "/slug/:slug",
  async (req, res) => {
    try {

      const artwork =
        await Artwork.findOne({
          slug: req.params.slug,
        })

      if (!artwork) {
        return res.status(404).json({
          success: false,
          message: "Artwork not found",
        })
      }

      return res.json({
        success: true,
        artwork,
      })

    } catch (error) {

      console.error(
        "Get artwork by slug error:",
        error
      )

      return res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  }
)

// =====================================================
// PUBLIC - GET ONE ARTWORK
// =====================================================

router.get(
  "/:id",
  async (req, res) => {
    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid artwork.",
        })
      }


      const artwork =
        await Artwork.findById(
          req.params.id
        )


      if (!artwork) {
        return res.status(404).json({
          success: false,
          message:
            "Artwork not found",
        })
      }


      return res.json({
        success: true,
        artwork,
      })

    } catch (error) {

      console.error(
        "Get artwork error:",
        error
      )


      return res.status(500).json({
        success: false,
        message:
          "Server error",
      })
    }
  }
)


// =====================================================
// ARTIST - CREATE ARTWORK
// =====================================================

router.post(
  "/",
  authMiddleware,
  artistMiddleware,
  uploadMedia,

  async (req, res) => {

    let uploadedMedia =
      []


    try {

      const {
        title,
        description,
        size,
        seoTitle,
        seoDescription,
        imageAlt,
        material,
        category,
        timeTaken,
        featured,
        featuredOrder,
      } = req.body


      if (
        !title ||
        !description ||
        !category
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, description, category and image are required",
        })
      }


      // ================= VALIDATE MEDIA =================

      const files =
        getUploadedFiles(req)


      const mediaError =
        validateMediaFiles(files)


      if (mediaError) {
        return res.status(400).json({
          success: false,
          message:
            mediaError,
        })
      }


      const cleanTitle =
        String(title).trim()

      const cleanDescription =
        String(description).trim()

      const cleanCategory =
        String(category).trim()


      if (
        !cleanTitle ||
        !cleanDescription ||
        !cleanCategory
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, description and category are required",
        })
      }


      const isFeatured =
        featured === "true"


      // ================= CLOUDINARY UPLOAD =================

      uploadedMedia =
        await uploadMediaFiles(
          files,
          "microarts/artworks"
        )


      // ================= CREATE ARTWORK =================

      const slug = await generateUniqueSlug(
        cleanTitle,
        Artwork
      )

      const artwork =
        new Artwork({

          title:
            cleanTitle,

          slug,

          description:
            cleanDescription,

          seoTitle:
            String(seoTitle || "").trim(),


          seoDescription:
            String(seoDescription || "").trim(),

          imageAlt:
            String(imageAlt || "").trim(),

          size:
            String(size || "").trim(),

          material:
            String(material || "").trim(),

          category:
            cleanCategory,

          timeTaken:
            String(timeTaken || "").trim(),

          featured:
            isFeatured,

          featuredOrder:
            isFeatured
              ? Math.max(
                  1,
                  Number(
                    featuredOrder
                  ) || 1
                )
              : 9999,
        })


      applyMedia(
        artwork,
        uploadedMedia
      )


      await artwork.save()


      return res
        .status(201)
        .json({
          success: true,

          message:
            "Artwork created successfully",

          artwork,
        })

    } catch (error) {

      console.error(
        "Create artwork error:",
        error
      )


      // If Cloudinary upload succeeded
      // but MongoDB save failed,
      // remove the unused media.

      await deleteMediaItems(
        uploadedMedia
      )


      return res.status(500).json({
        success: false,
        message:
          "Server error",
      })
    }
  }
)


// =====================================================
// ARTIST - UPDATE ARTWORK
// =====================================================

router.patch(
  "/:id",
  authMiddleware,
  artistMiddleware,
  uploadMedia,

  async (req, res) => {

    let uploadedMedia =
      []


    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid artwork.",
        })
      }


      const artwork =
        await Artwork.findById(
          req.params.id
        )


      if (!artwork) {
        return res.status(404).json({
          success: false,
          message:
            "Artwork not found",
        })
      }


      const {
        title,
        description,
        size,
        seoTitle,
        seoDescription,
        imageAlt,
        material,
        category,
        timeTaken,
        featured,
        featuredOrder,
      } = req.body


      // ================= TITLE =================

      if (
        title !== undefined
      ) {

        const cleanTitle =
          String(title).trim()


        if (!cleanTitle) {
          return res.status(400).json({
            success: false,
            message:
              "Artwork title is required.",
          })
        }


        artwork.title =
          cleanTitle
      }


      // ================= DESCRIPTION =================

      if (
        description !== undefined
      ) {

        const cleanDescription =
          String(
            description
          ).trim()


        if (!cleanDescription) {
          return res.status(400).json({
            success: false,
            message:
              "Artwork description is required.",
          })
        }


        artwork.description =
          cleanDescription
      }


      // ================= SEO METADATA =================

      if (seoTitle !== undefined) {
        artwork.seoTitle = String(seoTitle).trim()
      }

      if (seoDescription !== undefined) {
        artwork.seoDescription = String(seoDescription).trim()
      }

      if (imageAlt !== undefined) {
        artwork.imageAlt = String(imageAlt).trim()
      }


      // ================= SIZE =================

      if (
        size !== undefined
      ) {
        artwork.size =
          String(size).trim()
      }


      // ================= MATERIAL =================

      if (
        material !== undefined
      ) {
        artwork.material =
          String(material).trim()
      }


      // ================= CATEGORY =================

      if (
        category !== undefined
      ) {

        const cleanCategory =
          String(category).trim()


        if (!cleanCategory) {
          return res.status(400).json({
            success: false,
            message:
              "Artwork category is required.",
          })
        }


        artwork.category =
          cleanCategory
      }


      // ================= TIME TAKEN =================

      if (
        timeTaken !== undefined
      ) {
        artwork.timeTaken =
          String(
            timeTaken
          ).trim()
      }


      // ================= FEATURED SETTINGS =================

      if (
        featured !== undefined
      ) {

        artwork.featured =
          featured === "true"


        artwork.featuredOrder =
          artwork.featured
            ? Math.max(
                1,
                Number(
                  featuredOrder
                ) || 1
              )
            : 9999
      }


      // ================= MEDIA =================
      //
      // removeMedia: URLs of current media to delete
      // coverMedia:  URL of the image to show first
      // media:       new files, added after the current ones

      const files =
        getUploadedFiles(req)

      const removeUrls =
        toList(
          req.body.removeMedia
        )

      const coverUrl =
        String(
          req.body.coverMedia || ""
        ).trim()

      const currentMedia =
        getMediaList(artwork)

      const removedMedia =
        currentMedia.filter(
          (media) =>
            removeUrls.includes(
              media.url
            )
        )


      if (
        files.length > 0 ||
        removedMedia.length > 0 ||
        coverUrl
      ) {

        const keptMedia =
          currentMedia.filter(
            (media) =>
              !removeUrls.includes(
                media.url
              )
          )


        const mediaError =
          validateMediaFiles(
            files,
            keptMedia
          )


        if (mediaError) {
          return res.status(400).json({
            success: false,
            message:
              mediaError,
          })
        }


        uploadedMedia =
          await uploadMediaFiles(
            files,
            "microarts/artworks"
          )


        applyMedia(
          artwork,
          moveCoverFirst(
            [
              ...keptMedia,
              ...uploadedMedia,
            ],
            coverUrl
          )
        )
      }


      // ================= SAVE =================

      await artwork.save()


      // Delete removed Cloudinary media
      // only after MongoDB saves successfully.

      await deleteMediaItems(
        removedMedia
      )


      return res.json({
        success: true,

        message:
          "Artwork updated successfully",

        artwork,
      })

    } catch (error) {

      console.error(
        "Update artwork error:",
        error
      )


      // If new Cloudinary media uploaded,
      // but saving failed, remove it.

      await deleteMediaItems(
        uploadedMedia
      )


      return res.status(500).json({
        success: false,
        message:
          "Server error",
      })
    }
  }
)


// =====================================================
// ARTIST - DELETE ARTWORK
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
        return res.status(400).json({
          success: false,
          message:
            "Invalid artwork.",
        })
      }


      const artwork =
        await Artwork.findById(
          req.params.id
        )


      if (!artwork) {
        return res.status(404).json({
          success: false,
          message:
            "Artwork not found",
        })
      }


      const mediaItems =
        getMediaList(artwork)


      // Delete MongoDB record first.

      await artwork.deleteOne()


      // Then delete Cloudinary images and videos.

      await deleteMediaItems(
        mediaItems
      )


      return res.json({
        success: true,

        message:
          "Artwork deleted successfully",
      })

    } catch (error) {

      console.error(
        "Delete artwork error:",
        error
      )


      return res.status(500).json({
        success: false,
        message:
          "Server error",
      })
    }
  }
)


module.exports =
  router