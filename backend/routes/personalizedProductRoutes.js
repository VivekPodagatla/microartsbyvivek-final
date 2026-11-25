const express =
  require("express")

const PersonalizedProduct =
  require("../models/PersonalizedProduct")

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
// PUBLIC - GET ACTIVE PERSONALIZED PRODUCTS
// =====================================================

router.get(
  "/",
  async (req, res) => {
    try {

      const products =
        await PersonalizedProduct
          .find({
            active: true,
          })
          .sort({
            displayOrder: 1,
            createdAt: -1,
          })


      return res.json(
        products
      )

    } catch (error) {

      console.error(
        "Get personalized products error:",
        error
      )


      return res.status(500).json({
        message:
          "Failed to fetch personalized products",
      })
    }
  }
)
// =====================================================
// PUBLIC - GET PERSONALIZED PRODUCT BY SLUG
// =====================================================

router.get(
  "/slug/:slug",
  async (req, res) => {
    try {
      const product =
        await PersonalizedProduct.findOne({
          slug: req.params.slug,
          active: true,
        })

      if (!product) {
        return res.status(404).json({
          message: "Personalized product not found",
        })
      }

      return res.json(product)

    } catch (error) {
      console.error(
        "Get personalized product by slug error:",
        error
      )

      return res.status(500).json({
        message: "Failed to fetch personalized product",
      })
    }
  }
)

// =====================================================
// ARTIST - GET ALL PERSONALIZED PRODUCTS
// =====================================================

router.get(
  "/artist/all",
  authMiddleware,
  artistMiddleware,
  async (req, res) => {
    try {

      const products =
        await PersonalizedProduct
          .find()
          .sort({
            displayOrder: 1,
            createdAt: -1,
          })


      return res.json(
        products
      )

    } catch (error) {

      console.error(
        "Get artist products error:",
        error
      )


      return res.status(500).json({
        message:
          "Failed to fetch personalized products",
      })
    }
  }
)


// =====================================================
// ARTIST - ADD PERSONALIZED PRODUCT
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
        basePrice,
        seoTitle,
        seoDescription,
        imageAlt,
        category,
        pricePerLetter,
        minimumPrice,
        displayOrder,
        active,
      } = req.body


      // ================= REQUIRED FIELDS =================

      if (
        !title ||
        !description ||
        basePrice === undefined
      ) {
        return res.status(400).json({
          message:
            "Title, description and base price are required",
        })
      }


      // ================= VALIDATE MEDIA =================

      const files =
        getUploadedFiles(req)


      const mediaError =
        validateMediaFiles(files)


      if (mediaError) {
        return res.status(400).json({
          message:
            mediaError,
        })
      }


      // ================= VALIDATE PRICES =================

      const cleanBasePrice =
        Number(basePrice)

      const cleanPricePerLetter =
        Number(
          pricePerLetter || 0
        )

      const cleanMinimumPrice =
        Number(
          minimumPrice || 0
        )


      if (
        !Number.isFinite(
          cleanBasePrice
        ) ||
        cleanBasePrice < 0 ||
        !Number.isFinite(
          cleanPricePerLetter
        ) ||
        cleanPricePerLetter < 0 ||
        !Number.isFinite(
          cleanMinimumPrice
        ) ||
        cleanMinimumPrice < 0
      ) {
        return res.status(400).json({
          message:
            "Please enter valid prices.",
        })
      }


      // ================= CLOUDINARY UPLOAD =================

      uploadedMedia =
        await uploadMediaFiles(
          files,
          "microarts/products"
        )


      // ================= CREATE PRODUCT =================

      const slug = await generateUniqueSlug(
        title,
        PersonalizedProduct
      )

      const product =
        new PersonalizedProduct({
          slug,

          title:
            title.trim(),


          description:
            description.trim(),

          seoTitle:
            String(seoTitle || "").trim(),

          seoDescription:
            String(seoDescription || "").trim(),

          imageAlt:
            String(imageAlt || "").trim(),

          category:
            String(category || "").trim(),

          basePrice:
            cleanBasePrice,

          pricePerLetter:
            cleanPricePerLetter,

          minimumPrice:
            cleanMinimumPrice,

          displayOrder:
            Math.max(
              1,
              Number(
                displayOrder
              ) || 9999
            ),

          active:
            active === undefined
              ? true
              : active === "true",

          inStock:
            req.body.inStock === undefined
              ? true
              : req.body.inStock === "true",
        })


      applyMedia(
        product,
        uploadedMedia
      )


      await product.save()


      return res
        .status(201)
        .json({
          message:
            "Personalized product created successfully",

          product,
        })

    } catch (error) {

      console.error(
        "Create personalized product error:",
        error
      )


      // If upload worked but database save failed,
      // remove the unused Cloudinary media.

      await deleteMediaItems(
        uploadedMedia
      )


      return res.status(500).json({
        message:
          "Failed to create personalized product",
      })
    }
  }
)


// =====================================================
// ARTIST - EDIT PERSONALIZED PRODUCT
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

      const product =
        await PersonalizedProduct
          .findById(
            req.params.id
          )


      if (!product) {
        return res.status(404).json({
          message:
            "Product not found",
        })
      }


      // ================= TITLE =================

      if (
        req.body.title !==
        undefined
      ) {

        const cleanTitle =
          String(
            req.body.title
          ).trim()


        if (!cleanTitle) {
          return res.status(400).json({
            message:
              "Product title is required.",
          })
        }


        product.title =
          cleanTitle
      }


      // ================= DESCRIPTION =================

      if (
        req.body.description !==
        undefined
      ) {

        const cleanDescription =
          String(
            req.body.description
          ).trim()


        if (!cleanDescription) {
          return res.status(400).json({
            message:
              "Product description is required.",
          })
        }


        product.description =
          cleanDescription
      }

      // ================= SEO METADATA =================

      if (req.body.seoTitle !== undefined) {
        product.seoTitle =
          String(req.body.seoTitle).trim()
      }

      if (req.body.seoDescription !== undefined) {
        product.seoDescription =
          String(req.body.seoDescription).trim()
      }

      // ================= IMAGE ALT TEXT =================

      if (req.body.imageAlt !== undefined) {
        product.imageAlt =
          String(req.body.imageAlt).trim()
      }

      // ================= CATEGORY =================

      if (req.body.category !== undefined) {
        product.category =
          String(req.body.category).trim()
      }

      // ================= BASE PRICE =================

      if (
        req.body.basePrice !==
        undefined
      ) {

        const value =
          Number(
            req.body.basePrice
          )


        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message:
              "Invalid base price.",
          })
        }


        product.basePrice =
          value
      }


      // ================= PRICE PER LETTER =================

      if (
        req.body.pricePerLetter !==
        undefined
      ) {

        const value =
          Number(
            req.body.pricePerLetter
          )


        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message:
              "Invalid price per letter.",
          })
        }


        product.pricePerLetter =
          value
      }


      // ================= MINIMUM PRICE =================

      if (
        req.body.minimumPrice !==
        undefined
      ) {

        const value =
          Number(
            req.body.minimumPrice
          )


        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message:
              "Invalid minimum price.",
          })
        }


        product.minimumPrice =
          value
      }


      // ================= DISPLAY ORDER =================

      if (
        req.body.displayOrder !==
        undefined
      ) {

        product.displayOrder =
          Math.max(
            1,
            Number(
              req.body.displayOrder
            ) || 9999
          )
      }


      // ================= ACTIVE STATUS =================

      if (
        req.body.active !==
        undefined
      ) {

        product.active =
          req.body.active ===
          "true"
      }

      // ================= STOCK AVAILABILITY =================

      if (req.body.inStock !== undefined) {
        if (
          req.body.inStock !== "true" &&
          req.body.inStock !== "false"
        ) {
          return res.status(400).json({
            message: "Invalid stock availability.",
          })
        }

        product.inStock = req.body.inStock === "true"
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
        getMediaList(product)

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
            message:
              mediaError,
          })
        }


        uploadedMedia =
          await uploadMediaFiles(
            files,
            "microarts/products"
          )


        applyMedia(
          product,
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

      await product.save()


      // Delete removed Cloudinary media
      // only after MongoDB saves successfully.

      await deleteMediaItems(
        removedMedia
      )


      return res.json({
        message:
          "Personalized product updated successfully",

        product,
      })

    } catch (error) {

      console.error(
        "Update personalized product error:",
        error
      )


      // If new Cloudinary media uploaded
      // but saving failed, remove it.

      await deleteMediaItems(
        uploadedMedia
      )


      return res.status(500).json({
        message:
          "Failed to update personalized product",
      })
    }
  }
)


// =====================================================
// ARTIST - DELETE PERSONALIZED PRODUCT
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  artistMiddleware,

  async (req, res) => {

    try {

      const product =
        await PersonalizedProduct
          .findById(
            req.params.id
          )


      if (!product) {
        return res.status(404).json({
          message:
            "Personalized product not found",
        })
      }


      const mediaItems =
        getMediaList(product)


      // Delete database record first.
      await product.deleteOne()


      // Then remove its Cloudinary images and videos.
      await deleteMediaItems(
        mediaItems
      )


      return res.json({
        message:
          "Personalized product deleted successfully",
      })

    } catch (error) {

      console.error(
        "Delete personalized product error:",
        error
      )


      return res.status(500).json({
        message:
          "Failed to delete personalized product",
      })
    }
  }
)


module.exports =
  router