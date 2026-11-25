import { formatMoney } from "../../../shared/designPricing.js"
import { COUNTRY_CODES } from "../../../shared/designRules.js"
import {
  S,
  designPrice,
  setContact,
  setTab,
} from "./designerStore"
import { sendDesign, startNewDesign } from "./sendDesign"

// ================= STEP 3: SEND =================

function SentMessage({ leaveDesigner }) {
  const sent = S.send.sent
  return (
    <section className="sent-message card">
      <h2>Thank you, {sent.name}!</h2>
      <p>
        Your design request has been sent
        {sent.giftTitle ? <> with your request for <b>{sent.giftTitle}</b></> : null}.
      </p>
      <p className="sent-reference">
        Reference <b>#{sent.requestId.slice(-6).toUpperCase()}</b> · Total <b>{formatMoney(sent.total)}</b>
      </p>
      <p>
        Vivek will {sent.hasWhatsapp ? "message you on WhatsApp" : "call or text you"} at{" "}
        <b>{sent.phone}</b> with your final proof and payment details.
      </p>
      <div className="sent-actions">
        <button type="button" className="cta" onClick={leaveDesigner}>
          Back to the shop
        </button>
        <button type="button" className="chip" onClick={startNewDesign}>
          Design another gift
        </button>
      </div>
    </section>
  )
}

function SendStep({ gift, artwork, leaveDesigner }) {
  if (S.send.sent) return <SentMessage leaveDesigner={leaveDesigner} />

  const { lines, total } = designPrice()
  const contact = S.contact
  const busy = S.send.busy
  const field = (key) => ({
    value: contact[key],
    disabled: busy,
    onChange: (event) => setContact(key, event.target.value),
  })

  return (
    <section className="dz-layout">

      {/* ================= SUMMARY ================= */}

      <div className="dz-preview">
        <div className="rc">
          <h2>Your order</h2>
          {lines.map((line, index) => (
            <div className="l" key={index}>
              <span>{line.label}</span>
              <span>{formatMoney(line.amount)}</span>
            </div>
          ))}
          <div className="t">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
          {gift && <small>Sent with your request for: {gift.title}. This total is your final price.</small>}
          {artwork && <small>Inspired by the artwork: {artwork.title}.</small>}
        </div>
        <button type="button" className="mini edit-design" onClick={() => setTab(1)} disabled={busy}>
          ← Edit my design
        </button>
      </div>

      {/* ================= CONTACT DETAILS ================= */}

      <form
        className="dz-controls card send-form"
        onSubmit={(event) => {
          event.preventDefault()
          sendDesign({ gift, artwork })
        }}
      >
        <h3 style={{ marginTop: 0 }}>Your details</h3>

        <label>
          Name
          <input type="text" autoComplete="name" maxLength={100} {...field("name")} />
        </label>

        {/* Phone: WhatsApp preferred, any phone number accepted. */}
        <div className="phone-group">
          <span className="phone-label">Phone number (WhatsApp preferred)</span>
          <div className="phone-row">
            <label className="country-code">
              <span className="visually-hidden">Country code</span>
              <select
                value={contact.countryCode}
                disabled={busy}
                autoComplete="tel-country-code"
                onChange={(event) => setContact("countryCode", event.target.value)}
              >
                {COUNTRY_CODES.map(([iso, name, code]) => (
                  <option key={iso} value={code}>
                    {code} {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="phone-number">
              <span className="visually-hidden">Phone number</span>
              <input
                type="tel"
                autoComplete="tel-national"
                inputMode="tel"
                placeholder="98765 43210"
                maxLength={20}
                {...field("phone")}
              />
            </label>
          </div>
          <label className="chk whatsapp-check">
            <input
              type="checkbox"
              checked={contact.hasWhatsapp}
              disabled={busy}
              onChange={(event) => setContact("hasWhatsapp", event.target.checked)}
            />
            This number is on WhatsApp
          </label>
          {!contact.hasWhatsapp && (
            <p className="hint">No problem: Vivek will call or text this number instead.</p>
          )}
        </div>

        <label>
          Email (optional)
          <input type="email" autoComplete="email" maxLength={200} {...field("email")} />
        </label>

        <label>
          Delivery address
          <textarea rows={3} autoComplete="street-address" maxLength={500} {...field("address")} />
        </label>

        <label>
          Notes or deadline (optional)
          <textarea rows={2} maxLength={1000} placeholder="Example: needed by 14 February" {...field("notes")} />
        </label>

        <label className="chk consent">
          <input
            type="checkbox"
            checked={contact.consent}
            disabled={busy}
            onChange={(event) => setContact("consent", event.target.checked)}
          />
          I agree to be contacted by WhatsApp, phone or email about this request.
        </label>

        {S.send.error && <p className="send-error" role="alert">{S.send.error}</p>}
        {S.send.status && <p className="send-status" role="status">{S.send.status}</p>}

        <button type="submit" className="cta" disabled={busy}>
          {busy
            ? "Sending..."
            : gift
              ? "Send Design with Gift Request"
              : "Send My Design Request"}
        </button>
      </form>

    </section>
  )
}

export default SendStep
