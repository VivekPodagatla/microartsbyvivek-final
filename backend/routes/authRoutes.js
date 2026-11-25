const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { authenticator } = require("otplib")
const QRCode = require("qrcode")
const User = require("../models/User")
const authMiddleware = require("../middleware/authMiddleware")
const artistMiddleware = require("../middleware/artistMiddleware")

const router = express.Router()


// ================= HELPERS =================

const normalizePhone = (phone = "") => {
  return phone.replace(/\D/g, "")
}


const TWO_FACTOR_LOGIN_PURPOSE = "2fa-login"

const TWO_FACTOR_ISSUER = "MicroArts by Vivek"


// Accept the previous and next 30-second code as well,
// to allow for small clock differences on the phone.
authenticator.options = {
  window: 1,
}


const isValidTwoFactorCode = (code, secret) => {
  const cleanCode =
    String(code || "").replace(/\s/g, "")

  if (
    !secret ||
    !/^\d{6}$/.test(cleanCode)
  ) {
    return false
  }

  try {
    return authenticator.verify({
      token: cleanCode,
      secret,
    })
  } catch {
    return false
  }
}


const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone:
    user.phone || "",
  role: user.role,
  twoFactorEnabled:
    Boolean(user.twoFactorEnabled),
})


// ================= ISSUE DASHBOARD TOKEN =================

const sendArtistSession = (res, user) => {
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: "artist",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  )

  return res.status(200).json({
    success: true,

    message:
      "Artist login successful.",

    token,

    user: toPublicUser(user),
  })
}


// ================= PUBLIC REGISTRATION DISABLED =================

router.post("/register", (req, res) => {
  return res.status(403).json({
    success: false,
    message:
      "Public account registration is not available.",
  })
})


// ================= ARTIST LOGIN =================

router.post("/login", async (req, res) => {
  try {
    const {
      identifier,
      password,
    } = req.body


    // ================= VALIDATE INPUT =================

    if (
      !identifier ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      })
    }


    const cleanIdentifier =
      String(identifier).trim()


    if (!cleanIdentifier) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      })
    }


    let user = null


    // ================= FIND ARTIST BY EMAIL =================

    if (
      cleanIdentifier.includes("@")
    ) {
      const cleanEmail =
        cleanIdentifier.toLowerCase()

      user = await User.findOne({
        email: cleanEmail,
        role: "artist",
      })
    }


    // ================= FIND ARTIST BY PHONE =================
    // Kept for compatibility if you ever want
    // to sign in using your phone number.

    else {
      const cleanPhone =
        normalizePhone(
          cleanIdentifier
        )

      if (
        cleanPhone.length >= 7 &&
        cleanPhone.length <= 15
      ) {
        user = await User.findOne({
          phone: cleanPhone,
          role: "artist",
        })


        // Try final 10 digits only if an exact
        // artist phone number was not found.
        if (!user && cleanPhone.length >= 10) {
          const last10Digits =
            cleanPhone.slice(-10)

          const matchingArtists =
            await User.find({
              role: "artist",
              phone: {
                $regex:
                  `${last10Digits}$`,
              },
            })


          if (
            matchingArtists.length === 1
          ) {
            user =
              matchingArtists[0]
          }
        }
      }
    }


    // ================= ARTIST NOT FOUND =================

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid artist email or password.",
      })
    }


    // ================= SAFETY ROLE CHECK =================

    if (user.role !== "artist") {
      return res.status(403).json({
        success: false,
        message:
          "Artist access required.",
      })
    }


    // ================= CHECK PASSWORD =================

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      )


    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid artist email or password.",
      })
    }


    // ================= CHECK JWT SECRET =================

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not configured."
      )

      return res.status(500).json({
        success: false,
        message:
          "Server configuration error.",
      })
    }


    // ================= TWO-FACTOR CHALLENGE =================
    // Password is correct, but the dashboard token is only
    // issued after a valid authenticator code.

    if (user.twoFactorEnabled) {
      const challengeToken = jwt.sign(
        {
          userId: user._id.toString(),
          purpose: TWO_FACTOR_LOGIN_PURPOSE,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "5m",
        }
      )

      return res.status(200).json({
        success: true,

        twoFactorRequired: true,

        challengeToken,

        message:
          "Enter the 6-digit code from your authenticator app.",
      })
    }


    return sendArtistSession(
      res,
      user
    )

  } catch (error) {
    console.error(
      "Artist login error:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Unable to log in. Please try again.",
    })
  }
})


// ================= ARTIST LOGIN - VERIFY 2FA CODE =================

router.post("/login/verify-2fa", async (req, res) => {
  try {
    const {
      challengeToken,
      code,
    } = req.body


    if (!challengeToken || !code) {
      return res.status(400).json({
        success: false,
        message:
          "Authentication code is required.",
      })
    }


    // ================= CHECK CHALLENGE TOKEN =================

    let decoded = null

    try {
      decoded = jwt.verify(
        challengeToken,
        process.env.JWT_SECRET
      )
    } catch {
      decoded = null
    }


    if (
      !decoded ||
      decoded.purpose !== TWO_FACTOR_LOGIN_PURPOSE ||
      !decoded.userId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Your sign-in attempt expired. Please enter your email and password again.",
      })
    }


    // ================= CHECK CODE =================

    const user = await User.findById(
      decoded.userId
    ).select("+twoFactorSecret")


    if (
      !user ||
      user.role !== "artist" ||
      !user.twoFactorEnabled
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Your sign-in attempt expired. Please enter your email and password again.",
      })
    }


    if (
      !isValidTwoFactorCode(
        code,
        user.twoFactorSecret
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication code.",
      })
    }


    return sendArtistSession(
      res,
      user
    )

  } catch (error) {
    console.error(
      "Two-factor login error:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Unable to log in. Please try again.",
    })
  }
})


// ================= 2FA SETUP - START =================
// Creates a new secret and returns it as a QR code.
// 2FA is not on until /2fa/enable confirms a code.

router.post(
  "/2fa/setup",
  authMiddleware,
  artistMiddleware,
  async (req, res) => {
    try {
      if (req.user.twoFactorEnabled) {
        return res.status(400).json({
          success: false,
          message:
            "Two-factor authentication is already on.",
        })
      }


      const secret =
        authenticator.generateSecret()

      const otpauthUrl =
        authenticator.keyuri(
          req.user.email,
          TWO_FACTOR_ISSUER,
          secret
        )

      const qrCode =
        await QRCode.toDataURL(
          otpauthUrl
        )


      await User.updateOne(
        { _id: req.user._id },
        { twoFactorPendingSecret: secret }
      )


      return res.status(200).json({
        success: true,
        qrCode,
        secret,
      })

    } catch (error) {
      console.error(
        "Two-factor setup error:",
        error
      )

      return res.status(500).json({
        success: false,
        message:
          "Unable to start two-factor setup.",
      })
    }
  }
)


// ================= 2FA SETUP - CONFIRM =================

router.post(
  "/2fa/enable",
  authMiddleware,
  artistMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user._id
      ).select("+twoFactorPendingSecret")


      if (!user.twoFactorPendingSecret) {
        return res.status(400).json({
          success: false,
          message:
            "Start the setup again to get a new QR code.",
        })
      }


      if (
        !isValidTwoFactorCode(
          req.body.code,
          user.twoFactorPendingSecret
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "That code did not match. Check the time on your phone and try the newest code.",
        })
      }


      await User.updateOne(
        { _id: user._id },
        {
          twoFactorSecret:
            user.twoFactorPendingSecret,
          twoFactorPendingSecret: "",
          twoFactorEnabled: true,
        }
      )

      user.twoFactorEnabled = true


      return res.status(200).json({
        success: true,
        message:
          "Two-factor authentication is now on.",
        user: toPublicUser(user),
      })

    } catch (error) {
      console.error(
        "Two-factor enable error:",
        error
      )

      return res.status(500).json({
        success: false,
        message:
          "Unable to turn on two-factor authentication.",
      })
    }
  }
)


// ================= 2FA - TURN OFF =================
// Needs both the password and a current code.

router.post(
  "/2fa/disable",
  authMiddleware,
  artistMiddleware,
  async (req, res) => {
    try {
      const {
        password,
        code,
      } = req.body


      const user = await User.findById(
        req.user._id
      ).select("+twoFactorSecret")


      if (!user.twoFactorEnabled) {
        return res.status(400).json({
          success: false,
          message:
            "Two-factor authentication is already off.",
        })
      }


      const passwordMatches =
        Boolean(password) &&
        await bcrypt.compare(
          String(password),
          user.password
        )


      if (
        !passwordMatches ||
        !isValidTwoFactorCode(
          code,
          user.twoFactorSecret
        )
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Incorrect password or authentication code.",
        })
      }


      await User.updateOne(
        { _id: user._id },
        {
          twoFactorSecret: "",
          twoFactorPendingSecret: "",
          twoFactorEnabled: false,
        }
      )

      user.twoFactorEnabled = false


      return res.status(200).json({
        success: true,
        message:
          "Two-factor authentication is now off.",
        user: toPublicUser(user),
      })

    } catch (error) {
      console.error(
        "Two-factor disable error:",
        error
      )

      return res.status(500).json({
        success: false,
        message:
          "Unable to turn off two-factor authentication.",
      })
    }
  }
)


module.exports = router