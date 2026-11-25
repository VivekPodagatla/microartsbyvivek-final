import {
  COUNTRY_CODES,
  browserCountryCode,
} from "../utils/phone"

// ================= PHONE FIELDS =================
// Country code dropdown + number + "This number is on WhatsApp",
// as in the designer's send form. The inputs are named countryCode,
// phone and hasWhatsapp, so FormData forms can read them.
// Controlled when countryCode is passed (with the three setters);
// otherwise uncontrolled, starting from the visitor's country code.

function PhoneFields({
  countryCode,
  setCountryCode,
  phone,
  setPhone,
  hasWhatsapp,
  setHasWhatsapp,
}) {
  const controlled = countryCode !== undefined

  return (
    <div className="form-group phone-fields">

      <label htmlFor="phone-number">
        Phone Number (WhatsApp preferred)
      </label>

      <div className="phone-input-row">

        <select
          name="countryCode"
          className="country-code-select"
          aria-label="Country code"
          autoComplete="tel-country-code"
          required
          {...(controlled
            ? {
                value: countryCode,
                onChange: (event) => setCountryCode(event.target.value),
              }
            : { defaultValue: browserCountryCode() })}
        >
          {COUNTRY_CODES.map(([iso, name, code]) => (
            <option key={iso} value={code}>
              {code} {name}
            </option>
          ))}
        </select>

        <input
          id="phone-number"
          type="tel"
          name="phone"
          required
          inputMode="tel"
          maxLength="20"
          placeholder="Number without country code"
          autoComplete="tel-national"
          {...(controlled
            ? {
                value: phone,
                onChange: (event) => setPhone(event.target.value),
              }
            : {})}
        />

      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          name="hasWhatsapp"
          {...(controlled
            ? {
                checked: hasWhatsapp,
                onChange: (event) => setHasWhatsapp(event.target.checked),
              }
            : { defaultChecked: true })}
        />
        This number is on WhatsApp
      </label>

      <p className="field-hint">
        No WhatsApp? Untick this and Vivek will call or text you instead.
      </p>

    </div>
  )
}

export default PhoneFields
