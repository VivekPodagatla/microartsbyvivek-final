// ================= SEND A DESIGN REQUEST =================
// 1. Check the design and contact details (same rules as the server).
// 2. Wake the Render server if it is asleep, retrying for ~2 minutes.
// 3. Render the preview PNG from the design (renderDesign.js).
// 4. Upload the original photos, the preview and the design.
// The draft stays saved until the server confirms, so nothing is
// lost if anything fails.

import {
  MAX_PHOTO_BYTES,
  FRAME_SIZES,
} from "../../../shared/designRules.js"
import {
  validateDesign,
  validateContact,
} from "../../../shared/designValidation.js"
import {
  createDesignRequest,
  checkApiHealth,
} from "../api/designRequests"
import { renderDesign, canvasToBlob, loadImage } from "./renderDesign"
import {
  S,
  notify,
  originalPhotos,
  resetDesigner,
} from "./designerStore"

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]
const WAKE_TIMEOUT_MS = 120000

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const setSend = (changes) => {
  S.send = { ...S.send, ...changes }
  notify()
}

async function waitForServer() {
  const started = Date.now()
  let attempt = 0

  while (Date.now() - started < WAKE_TIMEOUT_MS) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    try {
      const response = await checkApiHealth(controller.signal)
      if (response.ok) return true
    } catch {
      // asleep or offline: try again
    } finally {
      clearTimeout(timer)
    }

    attempt++
    if (attempt === 1) {
      setSend({
        status: "Our gallery server is waking up. This can take up to a minute. Please keep this page open.",
      })
    }
    await wait(3000)
  }
  return false
}

// The file to upload for a photo: the original when it is a
// JPG/PNG/WEBP within the size limit, otherwise a high-quality JPEG
// (at most 5000 px), or the board copy if the original is gone.
async function photoFile(item) {
  const original = originalPhotos.get(item.id)

  if (original && PHOTO_TYPES.includes(original.type) && original.size <= MAX_PHOTO_BYTES) {
    return original
  }

  const source = original ? URL.createObjectURL(original) : item.src
  try {
    const image = await loadImage(source)
    const scale = Math.min(1, 5000 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(image.naturalWidth * scale)
    canvas.height = Math.round(image.naturalHeight * scale)
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height)
    let quality = 0.92
    let blob = await canvasToBlob(canvas, "image/jpeg", quality)
    while (blob.size > MAX_PHOTO_BYTES && quality > 0.5) {
      quality -= 0.1
      blob = await canvasToBlob(canvas, "image/jpeg", quality)
    }
    return new File([blob], `photo-${item.id}.jpg`, { type: "image/jpeg" })
  } finally {
    if (original) URL.revokeObjectURL(source)
  }
}

// gift / artwork: the loaded item the designer was opened from, or null.
export async function sendDesign({ gift, artwork }) {
  if (S.send.busy) return

  // ================= CHECK =================

  const designResult = validateDesign({ arts: S.arts, frame: S.frame, items: S.items })
  if (designResult.error) {
    setSend({ error: designResult.error })
    return
  }

  const contactResult = validateContact(S.contact)
  if (contactResult.error) {
    setSend({ error: contactResult.error })
    return
  }

  const photoItems = S.items.filter((item) => item.type === "photo")
  if (photoItems.some((item) => !item.src && !originalPhotos.get(item.id))) {
    setSend({ error: "Your photos are still loading. Please wait a moment and try again." })
    return
  }

  setSend({ busy: true, error: "", status: "Connecting to our gallery..." })

  try {
    // ================= WAKE THE SERVER =================

    if (!(await waitForServer())) {
      setSend({
        busy: false,
        status: "",
        error: "Our server did not respond. Your design is saved on this device; please try again in a few minutes.",
      })
      return
    }

    // ================= PREVIEW =================

    setSend({ status: "Preparing your design preview..." })
    const [pw, ph] = FRAME_SIZES[S.frame.size]
    const longSide = Math.max(pw, ph) + 2 * S.frame.thickness
    const canvas = await renderDesign(
      { ...designResult.design, items: designResult.design.items.map((item) => ({ ...item, src: S.items.find((other) => other.id === item.id)?.src })) },
      { ppi: Math.round(1800 / longSide) }
    )
    const preview = await canvasToBlob(canvas, "image/png")

    // ================= UPLOAD =================

    setSend({ status: "Uploading your photos and design..." })
    const formData = new FormData()
    formData.append("design", JSON.stringify(designResult.design))
    formData.append("contact", JSON.stringify(contactResult.contact))
    formData.append("photoIds", JSON.stringify(photoItems.map((item) => item.id)))
    if (gift) formData.append("giftSlug", gift.slug)
    if (artwork) formData.append("artworkSlug", artwork.slug)
    for (const item of photoItems) {
      formData.append("photos", await photoFile(item))
    }
    formData.append("preview", preview, "preview.png")

    const response = await createDesignRequest(formData)
    const data = await response.json().catch(() => ({}))

    if (!response.ok || !data.success) {
      setSend({
        busy: false,
        status: "",
        error: data.message || "Your design could not be sent. Please try again.",
      })
      return
    }

    // ================= DONE =================

    const sent = {
      requestId: String(data.requestId),
      total: data.total,
      name: contactResult.contact.name,
      phone: contactResult.contact.phoneFull,
      hasWhatsapp: contactResult.contact.hasWhatsapp,
      giftTitle: gift?.title || "",
    }
    resetDesigner()
    S.tab = 2
    setSend({ busy: false, status: "", error: "", sent })
  } catch (error) {
    console.error("Send design error:", error)
    setSend({
      busy: false,
      status: "",
      error: "Something went wrong while sending. Your design is saved; please try again.",
    })
  }
}

// After a sent request: start a fresh design.
export function startNewDesign() {
  S.tab = 0
  setSend({ sent: null, error: "", status: "" })
}
