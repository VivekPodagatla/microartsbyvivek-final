import {
  getArtworkImageUrl,
} from "../utils/images"

// ================= HOME =================

function Home({
  openPersonalized,
  artworksLoading,
  artworksError,
  loadArtworks,
  displayedArtworks,
  openArtwork,
  setRequestFormType,
  setCustomRequestArtwork,
  setRequestSubmitted,
  setShowRequestForm,
  openDesigner,
}) {
  return (
    <>

      {/* HERO */}

      <section className="hero">

        <div className="hero-container">

          <div className="hero-content">

            <p className="hero-label">
              HANDCRAFTED MINIATURE ART
            </p>

            <h1>
              Art Beyond the
              Limits of Size
            </h1>

            <p className="hero-description">
              Extraordinary handmade artwork
              created at an extraordinary
              miniature scale.
            </p>

            <div className="hero-gift-cta">

              <p className="hero-gift-text">
                Gift your loved ones in a unique way.
              </p>

              <button
                className="hero-button"
                onClick={openPersonalized}
              >
                Explore Personalized Gifts
              </button>

              <button
                type="button"
                className="design-idea-button"
                onClick={openDesigner}
              >
                Design Your Gift Idea
              </button>

            </div>

          </div>

          <div className="hero-image">

            <img
              src="/images/couple-under-umbrella-hero.jpg"
              alt="Miniature couple under an umbrella carved from a pencil"
              draggable="false"
            />



          </div>

        </div>

      </section>


      {/* ================= GALLERY ================= */}

      <section
        id="gallery"
        className="section gallery-section"
      >
        <h2>Featured MicroArts</h2>

        <p className="section-description">
          Explore miniature artworks created
          with precision, patience and creativity.
        </p>

        <div className="products">

          {artworksLoading ? (

            <div className="gallery-loading" role="status" style={{ gridColumn: "1 / -1" }}>
              <h3>Loading Miniature Artworks...</h3>

              <p>
                Our gallery is waking up. This may take around
                60 seconds or longer.
              </p>

              <p>
                Your artworks will appear automatically.
              </p>
            </div>

          ) : artworksError ? (


            <div className="gallery-loading" role="alert" style={{ gridColumn: "1 / -1" }}>
              <h3>Unable to Load Artworks</h3>

              <p>Please try again in a moment.</p>

              <button
                type="button"
                onClick={loadArtworks}
              >
                Try Again
              </button>
            </div>


          ) : displayedArtworks.length === 0 ? (

            <div className="gallery-loading" style={{ gridColumn: "1 / -1" }}>
              <h3>No Artworks Available</h3>
            </div>

          ) : (

            displayedArtworks.map((artwork) => (

              <article
                className="product-card"
                key={artwork._id}
                onClick={() => openArtwork(artwork)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault()
                    openArtwork(artwork)
                  }
                }}
              >

                <div className="artwork-image-container">
                  <img
                    src={getArtworkImageUrl(artwork.image)}
                    alt={artwork.imageAlt?.trim() || artwork.title}
                    loading="lazy"
                    onLoad={(event) => {
                      event.currentTarget.classList.add("image-loaded")
                    }}
                  />
                </div>

                <div className="product-info">

                  <h3>{artwork.title}</h3>

                  <p className="product-size">
                    {artwork.size}
                  </p>

                </div>

              </article>

            ))

          )}

        </div>

      </section>



      {/* CUSTOMIZED ART */}

      <section
        id="custom"
        className="section custom-section"
      >

        <div className="custom-content">

          <h2>
            Create a Customized MicroArt
          </h2>

          <p>
            Have a unique idea?
            I can create a miniature
            artwork based on your concept.
          </p>

          <button
            onClick={() => {
              setRequestFormType("custom-art")
              setCustomRequestArtwork(null)
              setRequestSubmitted(false)
              setShowRequestForm(true)
            }}
          >
            Request Customized Art
          </button>

        </div>

      </section>




      {/* ABOUT */}

      <section
        id="about"
        className="section about-section"
      >

        <h2>
          About
        </h2>

        <p>
          I’m Vivek Podagatla, a miniature artist
          creating handcrafted artworks on tiny
          surfaces with patience, precision, and creativity.
        </p>

        <p>
          Each piece is carefully handcrafted to
          capture fine details, creativity, and character.
        </p>

        <p>
          The goal of MicroArts is to show how much
          creativity can exist in even the smallest
          possible space.
        </p>

      </section>


      {/* CONTACT */}

      <section
        id="contact"
        className="section contact-section"
      >

        <h2>
          Contact
        </h2>

        <p>
          Interested in a personalized
          or customized MicroArt?
        </p>

        <button
          onClick={() => {
            setRequestFormType("contact")
            setCustomRequestArtwork(null)
            setRequestSubmitted(false)
            setShowRequestForm(true)
          }}
        >
          Contact the Artist
        </button>
        <div className="contact-socials">

          <a
            href="https://www.instagram.com/microarts__vivek?stkn=MWZ4d21tMHpuNnF1Yg%3D%3D&utm_source=qr"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            title="Instagram"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm0 2h10c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3zm10.25 1.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
            </svg>
          </a>

          <a
            href="https://www.facebook.com/share/1ESu6uJaPq/?mibextid=wwXIfr"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            title="Facebook"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M13.5 22v-9h3l.5-3.5h-3.5V7.25c0-1 .28-1.75 1.8-1.75H17V2.38C16.7 2.34 15.67 2.25 14.45 2.25c-2.55 0-4.3 1.56-4.3 4.42V9.5H7.25V13h2.9v9h3.35z" />
            </svg>
          </a>
          {/* YouTube */}
          <a
            href="https://youtube.com/@microartsvivek1657"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            title="YouTube"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@vivekmicroartist"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            title="TikTok"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M16.6 1h-3.4v14.3a3.3 3.3 0 1 1-2.9-3.3V8.5a6.8 6.8 0 1 0 6.3 6.8V8.1a8.7 8.7 0 0 0 5.1 1.6V6.3A5.2 5.2 0 0 1 16.6 1Z" />
            </svg>
          </a>

        </div>

      </section>

    </>
  )
}

export default Home
