// ================= CONSENT =================
// Same wording as the designer's send form. Named "consent" for
// FormData forms; controlled when checked is passed.

function ConsentCheckbox({ checked, setChecked }) {
  return (
    <label className="checkbox-row consent-row">
      <input
        type="checkbox"
        name="consent"
        required
        {...(checked !== undefined
          ? {
              checked,
              onChange: (event) => setChecked(event.target.checked),
            }
          : {})}
      />
      I agree to be contacted by WhatsApp, phone or email about this request.
    </label>
  )
}

export default ConsentCheckbox
