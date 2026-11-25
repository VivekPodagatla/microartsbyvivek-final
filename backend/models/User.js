const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "artist"],
      default: "customer",
    },

    // ================= TWO-FACTOR AUTHENTICATION =================
    // TOTP secrets for authenticator apps. Never returned
    // unless a query explicitly selects them.

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
      default: "",
      select: false,
    },

    // Set during setup, moved to twoFactorSecret once
    // the first code from the app is confirmed.
    twoFactorPendingSecret: {
      type: String,
      default: "",
      select: false,
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model(
  "User",
  userSchema
)

module.exports = User