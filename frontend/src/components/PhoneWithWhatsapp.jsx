import { whatsappUrl } from "../utils/phone"

// ================= PHONE (DASHBOARD) =================
// A customer's number with whether it is on WhatsApp and a chat
// link. Requests from before the forms asked show just the number.

function PhoneWithWhatsapp({ phone, hasWhatsapp }) {
  return (
    <>
      <a href={`tel:+${String(phone || "").replace(/\D/g, "")}`}>
        {phone}
      </a>

      {hasWhatsapp === true && (
        <>
          {" "}
          <a
            className="whatsapp-chat-link"
            href={whatsappUrl(phone)}
            target="_blank"
            rel="noreferrer"
          >
            Chat on WhatsApp
          </a>
        </>
      )}

      {hasWhatsapp === false && (
        <span className="no-whatsapp-note"> (no WhatsApp: call or text)</span>
      )}
    </>
  )
}

export default PhoneWithWhatsapp
