// Always load backend/.env, whatever directory the script is run from
require("dotenv").config({
  path:
    require("path").join(
      __dirname,
      "..",
      ".env"
    ),
})

const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const User = require("../models/User")


// ================= SAFETY SETTINGS =================

const REQUIRED_DATABASE_NAME =
  "microarts_test"


// ================= TEST ARTIST =================
// The User model has no username field,
// so "testartist" is stored as the name.
// Login accepts the email (or phone digits).

const TEST_ARTIST = {
  name: "testartist",
  email: "test@example.com",
  phone: "0000000000",
  password: "test1234",
  role: "artist",
}

// Any bcrypt cost works with bcrypt.compare in authRoutes
const SALT_ROUNDS = 10


// ================= DATABASE NAME FROM URI =================
// Reads the path segment of a mongodb:// or
// mongodb+srv:// URI, e.g. ".../microarts_test?retryWrites=true"

const getDatabaseName = (uri) => {
  const withoutScheme =
    uri.replace(
      /^mongodb(\+srv)?:\/\//,
      ""
    )

  // Not a MongoDB connection string
  if (withoutScheme === uri) {
    return ""
  }

  const slashIndex =
    withoutScheme.indexOf("/")

  if (slashIndex === -1) {
    return ""
  }

  return decodeURIComponent(
    withoutScheme
      .slice(slashIndex + 1)
      .split("?")[0]
  )
}


const seedTestArtist = async () => {
  try {

    // ================= CHECK ENVIRONMENT =================

    const uri =
      process.env.MONGODB_URI

    if (!uri) {
      console.error(
        "MONGODB_URI is missing from backend/.env"
      )

      process.exitCode = 1
      return
    }

    const databaseName =
      getDatabaseName(uri)

    if (databaseName !== REQUIRED_DATABASE_NAME) {
      console.error(
        `Refusing to run: MONGODB_URI must point to the "${REQUIRED_DATABASE_NAME}" database (found "${databaseName || "none"}").`
      )

      process.exitCode = 1
      return
    }


    // ================= CONNECT =================

    await mongoose.connect(uri)

    // Double-check the database actually in use before writing
    if (mongoose.connection.name !== REQUIRED_DATABASE_NAME) {
      console.error(
        `Refusing to run: connected to "${mongoose.connection.name}", not "${REQUIRED_DATABASE_NAME}".`
      )

      process.exitCode = 1
      return
    }

    console.log(
      `Connected to MongoDB (${mongoose.connection.name})`
    )


    // ================= SKIP IF ALREADY PRESENT =================
    // email and phone are both unique in the User model

    const existingUser =
      await User.findOne({
        $or: [
          { email: TEST_ARTIST.email },
          { phone: TEST_ARTIST.phone },
        ],
      })

    if (existingUser) {
      console.log(
        `Test artist already exists (${existingUser.email}). Nothing to do.`
      )

      return
    }


    // ================= CREATE ARTIST =================

    const hashedPassword =
      await bcrypt.hash(
        TEST_ARTIST.password,
        SALT_ROUNDS
      )

    const user = await User.create({
      name: TEST_ARTIST.name,
      email: TEST_ARTIST.email,
      phone: TEST_ARTIST.phone,
      password: hashedPassword,
      role: TEST_ARTIST.role,
    })

    console.log(
      `Created test artist ${user.email} (log in with this email and "${TEST_ARTIST.password}")`
    )

  } catch (error) {
    console.error(
      "Seeding test artist failed:",
      error
    )

    process.exitCode = 1

  } finally {
    await mongoose.disconnect()
  }
}

seedTestArtist()
