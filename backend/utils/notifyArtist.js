// =====================================================
// WHATSAPP ALERT TO THE ARTIST (CallMeBot)
// =====================================================
//
// Sends Vivek a WhatsApp message when a design request
// arrives, through CallMeBot's free API (it can only
// message the number that activated the key).
//
// Needs, in backend/.env and on Render:
//   CALLMEBOT_PHONE   Vivek's number with country code, e.g. +919876543210
//   CALLMEBOT_APIKEY  the key CallMeBot replied with
//
// Without them it does nothing. It never throws: a failed
// alert must not fail the customer's request, which is
// already saved and visible in the dashboard.

const CALLMEBOT_URL =
  "https://api.callmebot.com/whatsapp.php"


const sendWhatsAppAlert =
  async (text) => {

    const phone =
      process.env.CALLMEBOT_PHONE

    const apiKey =
      process.env.CALLMEBOT_APIKEY

    if (
      !phone ||
      !apiKey
    ) {
      return
    }


    try {

      const url =
        `${CALLMEBOT_URL}?phone=${encodeURIComponent(phone)}` +
        `&text=${encodeURIComponent(text)}` +
        `&apikey=${encodeURIComponent(apiKey)}`

      const response =
        await fetch(
          url,
          {
            signal:
              AbortSignal.timeout(15000),
          }
        )

      if (!response.ok) {
        console.error(
          "WhatsApp alert failed with status",
          response.status
        )
      }

    } catch (error) {

      console.error(
        "WhatsApp alert error:",
        error.message
      )
    }
  }


// The studio link: the first public site address in FRONTEND_URL.
// Local addresses (kept there for development) are skipped.

const LIVE_SITE =
  "https://microartsbyvivek.com"

const studioUrl =
  () => {
    const site =
      String(
        process.env.FRONTEND_URL || ""
      )
        .split(",")
        .map((origin) =>
          origin
            .trim()
            .replace(/\/$/, "")
        )
        .find((origin) =>
          origin &&
          !/\/\/(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(
            origin
          )
        )

    return `${site || LIVE_SITE}/studio`
  }


const notifyNewDesignRequest =
  (designRequest) => {

    const reference =
      String(designRequest._id)
        .slice(-6)
        .toUpperCase()

    const lines = [
      `New design request #${reference}`,
      // CallMeBot drops "$", so the currency is written out.
      `${designRequest.contact.name} - Total: ${designRequest.total} USD`,
      designRequest.gift?.title
        ? `Gift: ${designRequest.gift.title}`
        : designRequest.artwork?.title
          ? `Inspired by: ${designRequest.artwork.title}`
          : "",
      `${designRequest.contact.hasWhatsapp ? "WhatsApp" : "Phone (no WhatsApp)"}: ${designRequest.contact.phoneFull}`,
      `Open: ${studioUrl()}`,
    ].filter(Boolean)

    // Not awaited: the customer's response doesn't wait for it.
    sendWhatsAppAlert(
      lines.join("\n")
    )
  }


// =====================================================
// CUSTOM ART, CONTACT AND GIFT REQUESTS
// =====================================================

const shortReference =
  (id) =>
    String(id)
      .slice(-6)
      .toUpperCase()


// hasWhatsapp is missing on requests from pages loaded
// before the forms asked about it.

const phoneLine =
  (
    phone,
    hasWhatsapp
  ) =>
    `${
      hasWhatsapp === true
        ? "WhatsApp"
        : hasWhatsapp === false
          ? "Phone (no WhatsApp)"
          : "Phone"
    }: ${phone}`


// "Request Customized Art" and "Contact the Artist" forms.

const notifyNewCustomRequest =
  (
    request,
    artwork = null
  ) => {

    const isContact =
      request.requestType === "contact"

    const details =
      String(request.requestDetails || "").trim()

    const lines = [
      `${isContact ? "New contact message" : "New custom art request"} #${shortReference(request._id)}`,
      request.fullName,
      artwork?.title
        ? `Artwork: ${artwork.title}`
        : "",
      details
        ? `"${details.length > 160 ? details.slice(0, 157) + "..." : details}"`
        : "",
      phoneLine(
        request.phone,
        request.hasWhatsapp
      ),
      `Email: ${request.email}`,
      `Open: ${studioUrl()}`,
    ].filter(Boolean)

    sendWhatsAppAlert(
      lines.join("\n")
    )
  }


// Personalized gift requests (the cart's "Submit Request").

const notifyNewOrder =
  (order) => {

    const items =
      order.items
        .map((item) =>
          `${item.quantity} x ${item.product} - "${item.text}"`
        )

    const lines = [
      `New gift request #${shortReference(order._id)}`,
      // CallMeBot drops "$", so the currency is written out.
      `${order.fullName} - Total: ${order.totalPrice} USD`,
      ...items.slice(0, 5),
      items.length > 5
        ? `...and ${items.length - 5} more`
        : "",
      phoneLine(
        order.phone,
        order.hasWhatsapp
      ),
      `Open: ${studioUrl()}`,
    ].filter(Boolean)

    sendWhatsAppAlert(
      lines.join("\n")
    )
  }


module.exports = {
  notifyNewDesignRequest,
  notifyNewCustomRequest,
  notifyNewOrder,
}
