// ================= NAVBAR =================

function Navbar({
  setMobileMenuOpen,
  goHome,
  mobileMenuOpen,
  isLoggedIn,
  user,
  openArtistDashboard,
  handleLogout,
  openCart,
  cartItemCount,
}) {
  return (
    <nav className="navbar">

      {/* LOGO */}
      <button
        className="logo"
        onClick={() => {
          setMobileMenuOpen(false)
          goHome()
        }}
        aria-label="MicroArts by Vivek Podagatla - Home"
      >
        <img
          className="navbar-logo-image"
          src="/images/microarts-navbar-logo.png"
          alt="MicroArts by Vivek Podagatla"
        />
      </button>


      {/* MOBILE HAMBURGER */}
      <button
        className={`mobile-menu-button ${
          mobileMenuOpen ? "open" : ""
        }`}
        onClick={() =>
          setMobileMenuOpen((previous) => !previous)
        }
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>


      {/* NAVIGATION LINKS */}
      <div
        className={`nav-links ${
          mobileMenuOpen ? "nav-links-open" : ""
        }`}
      >

        <button
          onClick={() => {
            setMobileMenuOpen(false)
            goHome()
          }}
        >
          Home
        </button>


        <button
          onClick={() => {
            setMobileMenuOpen(false)

            goHome()

            setTimeout(() => {
              document
                .getElementById("gallery")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }, 50)
          }}
        >
          Gallery
        </button>


        <button
          onClick={() => {
            setMobileMenuOpen(false)

            goHome()

            setTimeout(() => {
              document
                .getElementById("about")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }, 50)
          }}
        >
          About
        </button>


        <button
          onClick={() => {
            setMobileMenuOpen(false)

            goHome()

            setTimeout(() => {
              document
                .getElementById("contact")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }, 50)
          }}
        >
          Contact
        </button>


        {/* ================= ARTIST ================= */}
        {/* The login is not linked here; it lives at /studio. */}

        {isLoggedIn && user?.role === "artist" && (
          <>
            <button
              className="artist-dashboard-button"
              onClick={() => {
                setMobileMenuOpen(false)
                openArtistDashboard()
              }}
            >
              🎨 Artist Dashboard
            </button>

            <button
              className="login-button"
              onClick={() => {
                setMobileMenuOpen(false)
                handleLogout()
              }}
            >
              Logout
            </button>
          </>
        )}


        {/* REQUESTS CART */}

        <button
          className="cart-button"
          onClick={() => {
            setMobileMenuOpen(false)
            openCart()
          }}
        >
          🎁 Requests

          {cartItemCount > 0 && (
            <span className="cart-count">
              {cartItemCount}
            </span>
          )}
        </button>

      </div>

    </nav>
  )
}

export default Navbar
