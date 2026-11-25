// ================= ARTIST LOGIN =================
// Opened only from /studio. Two steps when 2FA is on:
// email + password, then the authenticator app code.

function Login({
  goHome,
  handleLogin,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  twoFactorChallenge,
  handleVerifyTwoFactor,
  loginCode,
  setLoginCode,
  cancelTwoFactorLogin,
}) {
  return (
    <section className="auth-page">

      <div className="auth-card">

        <button
          className="back-button"
          onClick={goHome}
        >
          ← Back to Home
        </button>

        {twoFactorChallenge ? (
          <>

            <h1>
              Two-Factor Authentication
            </h1>

            <p className="auth-description">
              Open your authenticator app and enter the
              6-digit code for MicroArts by Vivek.
            </p>

            <form
              className="auth-form"
              onSubmit={handleVerifyTwoFactor}
            >

              <div className="form-group">

                <label htmlFor="login-code">
                  Authentication Code
                </label>

                <input
                  id="login-code"
                  className="two-factor-code-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoFocus
                  value={loginCode}
                  onChange={(event) =>
                    setLoginCode(
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="123456"
                  autoComplete="one-time-code"
                />

              </div>

              <button
                className="auth-submit-button"
                type="submit"
              >
                Verify
              </button>

            </form>

            <button
              type="button"
              className="auth-link-button"
              onClick={cancelTwoFactorLogin}
            >
              Use a different account
            </button>

          </>
        ) : (
          <>

            <h1>
              Artist Login
            </h1>

            <p className="auth-description">
              Sign in to manage MicroArts.
            </p>

            <form
              className="auth-form"
              onSubmit={handleLogin}
            >

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(event) =>
                    setLoginEmail(
                      event.target.value
                    )
                  }
                  placeholder="Enter your email"
                  autoComplete="username"
                />

              </div>

              <div className="form-group">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(event) =>
                    setLoginPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

              </div>

              <button
                className="auth-submit-button"
                type="submit"
              >
                Artist Login
              </button>

            </form>

          </>
        )}

      </div>

    </section>
  )
}

export default Login
