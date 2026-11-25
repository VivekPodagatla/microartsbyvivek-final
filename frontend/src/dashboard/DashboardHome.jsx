// ================= DASHBOARD HOME =================

function DashboardHome({
  setArtistDashboardSection,
  customRequests,
  orders,
  personalizedProducts,
  artworks,
  user,
}) {
  return (
    <>

      <div className="artist-dashboard-header">

        <h1>
          Artist Dashboard
        </h1>

        <p>
          Manage your MicroArts products and customer requests.
        </p>

      </div>


      <div className="dashboard-options">

        <button
          className="dashboard-option-card"
          onClick={() =>
            setArtistDashboardSection("requests")
          }
        >

          <span className="dashboard-option-icon">
            📩
          </span>

          <h2>
            Customized Art Requests
          </h2>

          <p>
            View customer requests, contact details,
            artwork information and update request status.
          </p>

          <strong>
            {customRequests.length} Requests →
          </strong>

        </button>


        {/* ================= DESIGN REQUESTS ================= */}

        <button
          className="dashboard-option-card"
          onClick={() =>
            setArtistDashboardSection("designs")
          }
        >

          <span className="dashboard-option-icon">
            ✏️
          </span>

          <h2>
            Design Requests
          </h2>

          <p>
            Designs customers made in "Design Your Gift Idea":
            the full design, carving details, photos and print file.
          </p>

          <strong>
            View Design Requests →
          </strong>

        </button>


        {/* ================= CUSTOMER ORDERS ================= */}

        <button
          className="dashboard-option-card"
          onClick={() =>
            setArtistDashboardSection("orders")
          }
        >

          <span className="dashboard-option-icon">
            🛒
          </span>

          <h2>
            Personalized Gift Requests
          </h2>

          <p>
            View personalized MicroArt requests,
            customer contact details, shipping information
            and update order status.
          </p>

          <strong>
            {orders.length} Requests →
          </strong>

        </button>


        <button
          className="dashboard-option-card"
          onClick={() =>
            setArtistDashboardSection("products")
          }
        >

          <span className="dashboard-option-icon">
            🛍️
          </span>

          <h2>
            Manage Personalized Arts
          </h2>

          <p>
            Add, edit, deactivate or delete personalized
            MicroArt products and manage pricing.
          </p>

          <strong>
            {personalizedProducts.length} Products →
          </strong>

        </button>


        <button
          className="dashboard-option-card"
          onClick={() =>
            setArtistDashboardSection("artworks")
          }
        >

          <span className="dashboard-option-icon">
            🖼️
          </span>

          <h2>
            Manage Featured Arts
          </h2>

          <p>
            Add or edit gallery artworks and choose which
            artworks are pinned to the top of Featured MicroArts.
          </p>

          <strong>
            {artworks.length} Artworks →
          </strong>

        </button>


        {/* ================= ACCOUNT SECURITY ================= */}

        <button
          className="dashboard-option-card"
          onClick={() =>
            setArtistDashboardSection("security")
          }
        >

          <span className="dashboard-option-icon">
            🔒
          </span>

          <h2>
            Account Security
          </h2>

          <p>
            Require a code from your authenticator app
            when signing in.
          </p>

          <strong>
            {user?.twoFactorEnabled
              ? "Two-factor is on →"
              : "Two-factor is off. Set it up →"}
          </strong>

        </button>

      </div>

    </>
  )
}

export default DashboardHome
