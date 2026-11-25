// ================= ACCOUNT SECURITY =================
// Turn authenticator-app two-factor authentication on or off.

function SecuritySection({
  user,
  twoFactorSetup,
  setTwoFactorSetup,
  handleStartTwoFactorSetup,
  handleEnableTwoFactor,
  handleDisableTwoFactor,
}) {
  return (
    <>

      <div className="artist-dashboard-header">

        <h1>
          Account Security
        </h1>

        <p>
          Two-factor authentication asks for a code from your
          phone after your password, so a stolen password alone
          cannot open the dashboard.
        </p>

      </div>


      <div className="security-card">

        <p>
          <strong>Two-factor authentication:</strong>{" "}
          {user?.twoFactorEnabled ? (
            <span className="security-status-on">On</span>
          ) : (
            <span className="security-status-off">Off</span>
          )}
        </p>


        {user?.twoFactorEnabled ? (

          /* ================= TURN OFF ================= */

          <form
            className="auth-form"
            onSubmit={handleDisableTwoFactor}
          >

            <p>
              To turn it off, confirm your password and a
              current code from your authenticator app.
            </p>

            <div className="form-group">
              <label htmlFor="disable-2fa-password">Password</label>
              <input
                id="disable-2fa-password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="disable-2fa-code">Authentication Code</label>
              <input
                id="disable-2fa-code"
                className="two-factor-code-input"
                type="text"
                name="code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              className="auth-submit-button"
            >
              Turn Off Two-Factor Authentication
            </button>

          </form>

        ) : twoFactorSetup ? (

          /* ================= SETUP: SCAN + CONFIRM ================= */

          <form
            className="auth-form"
            onSubmit={handleEnableTwoFactor}
          >

            <p>
              1. Open Google Authenticator, Microsoft Authenticator
              or Authy and scan this QR code.
            </p>

            <img
              className="two-factor-qr"
              src={twoFactorSetup.qrCode}
              alt="QR code for your authenticator app"
            />

            <p>
              Can't scan it? Enter this key in the app instead:
            </p>

            <code className="two-factor-secret">
              {twoFactorSetup.secret}
            </code>

            <div className="form-group">
              <label htmlFor="enable-2fa-code">
                2. Enter the 6-digit code the app shows
              </label>
              <input
                id="enable-2fa-code"
                className="two-factor-code-input"
                type="text"
                name="code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoComplete="one-time-code"
              />
            </div>

            <div className="product-form-actions">

              <button
                type="button"
                onClick={() => setTwoFactorSetup(null)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-product-button"
              >
                Turn On
              </button>

            </div>

          </form>

        ) : (

          /* ================= SETUP: START ================= */

          <button
            type="button"
            className="auth-submit-button"
            onClick={handleStartTwoFactorSetup}
          >
            Set Up Two-Factor Authentication
          </button>

        )}

      </div>

    </>
  )
}

export default SecuritySection
