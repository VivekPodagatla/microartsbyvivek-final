import {
  getArtworkImageUrl,
} from "../utils/images"
import MediaFields from "./MediaFields"

// ================= MANAGE FEATURED ARTS =================

function FeaturedArtsSection({
  showAddArtworkForm,
  handleAddArtwork,
  setShowAddArtworkForm,
  editingArtwork,
  handleEditArtwork,
  setEditingArtwork,
  artworks,
  displayedArtworks,
  toggleArtworkFeatured,
  deleteArtwork,
}) {
  return (
    <>

      {showAddArtworkForm && (
        <div className="product-form-overlay">
          <div className="product-form-card">

            <h2>Add New Artwork</h2>

            <form onSubmit={handleAddArtwork}>

              <div className="form-group">
                <label>Artwork Title</label>
                <input
                  type="text"
                  name="title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="4"
                  required
                />
              </div>

              {/* ================= ARTWORK SEO ================= */}

              <div className="form-group">
                <label>SEO Page Title (Optional)</label>
                <input
                  type="text"
                  name="seoTitle"
                  maxLength={120}
                  placeholder="Example: Couple Pencil Carving | Miniature Art"
                />
                <small>
                  Appears in Google search results. Aim for a clear,
                  descriptive title around 50–60 characters.
                </small>
              </div>

              <div className="form-group">
                <label>SEO Meta Description (Optional)</label>
                <textarea
                  name="seoDescription"
                  rows="3"
                  maxLength={160}
                  placeholder="Describe the artwork using natural keywords such as pencil carving, miniature art, or handmade gifts."
                />
                <small>
                  Write a unique description of approximately 140–160
                  characters. Leave blank to use the artwork description.
                </small>
              </div>

              <div className="form-group">
                <label>Image Alt Text (Optional)</label>
                <textarea
                  name="imageAlt"
                  rows="3"
                  maxLength={200}
                  placeholder="Example: Miniature couple sharing an umbrella, hand-carved from a single pencil."
                />
                <small>
                  Describe what is visible in the artwork image.
                  This helps Google understand the image and
                  improves accessibility. Keep it natural and accurate.
                </small>
              </div>



              <div className="form-group">
                <label>Size</label>
                <input
                  type="text"
                  name="size"
                  placeholder="Example: 2 mm"
                />
              </div>

              <div className="form-group">
                <label>Material</label>
                <input
                  type="text"
                  name="material"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  required
                />
              </div>

              <div className="form-group">
                <label>Time Taken</label>
                <input
                  type="text"
                  name="timeTaken"
                  placeholder="Example: 8 Hours"
                />
              </div>

              <MediaFields
                item={null}
                getUrl={getArtworkImageUrl}
              />

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    value="true"
                  />{" "}
                  Pin this artwork to the top
                </label>
              </div>

              <div className="form-group">
                <label>Featured Priority</label>
                <input
                  type="number"
                  name="featuredOrder"
                  min="1"
                  defaultValue="1"
                />
                <small>
                  1 appears first, 2 appears second, and so on.
                </small>
              </div>

              <div className="product-form-actions">
                <button
                  type="button"
                  onClick={() =>
                    setShowAddArtworkForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-button"
                >
                  Add Artwork
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {editingArtwork && (
        <div className="product-form-overlay">
          <div className="product-form-card">

            <h2>Edit Artwork</h2>

            <form onSubmit={handleEditArtwork}>

              <div className="form-group">
                <label>Artwork Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingArtwork.title}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="4"
                  defaultValue={editingArtwork.description}
                  required
                />
              </div>

              {/* ================= ARTWORK SEO ================= */}

              <div className="form-group">
                <label>SEO Page Title (Optional)</label>
                <input
                  type="text"
                  name="seoTitle"
                  maxLength={120}
                  defaultValue={editingArtwork.seoTitle || ""}
                  placeholder="Example: Couple Pencil Carving | Miniature Art"
                />
                <small>
                  Write a unique, descriptive SEO title.
                  Aim for approximately 50–60 characters.
                </small>
              </div>

              <div className="form-group">
                <label>SEO Meta Description (Optional)</label>
                <textarea
                  name="seoDescription"
                  rows="3"
                  maxLength={160}
                  defaultValue={editingArtwork.seoDescription || ""}
                  placeholder="Describe this artwork using natural, relevant search terms."
                />
                <small>
                  Aim for approximately 140–160 characters.
                  Leave blank to use the artwork description.
                </small>
              </div>


              <div className="form-group">
                <label>Image Alt Text (Optional)</label>
                <textarea
                  name="imageAlt"
                  rows="3"
                  maxLength={200}
                  defaultValue={editingArtwork.imageAlt || ""}
                  placeholder="Example: Miniature couple sharing an umbrella, hand-carved from a single pencil."
                />
                <small>
                  Describe what is visible in the artwork image.
                  This helps Google understand the image and
                  improves accessibility.
                </small>
              </div>



              <div className="form-group">
                <label>Size</label>
                <input
                  type="text"
                  name="size"
                  defaultValue={editingArtwork.size || ""}
                />
              </div>

              <div className="form-group">
                <label>Material</label>
                <input
                  type="text"
                  name="material"
                  defaultValue={editingArtwork.material || ""}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  defaultValue={editingArtwork.category || ""}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time Taken</label>
                <input
                  type="text"
                  name="timeTaken"
                  defaultValue={editingArtwork.timeTaken || ""}
                />
              </div>

              <MediaFields
                item={editingArtwork}
                getUrl={getArtworkImageUrl}
              />

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    value="true"
                    defaultChecked={Boolean(editingArtwork.featured)}
                  />{" "}
                  Pin this artwork to the top
                </label>
              </div>

              <div className="form-group">
                <label>Featured Priority</label>
                <input
                  type="number"
                  name="featuredOrder"
                  min="1"
                  defaultValue={editingArtwork.featuredOrder || 1}
                />
                <small>
                  1 appears first, 2 appears second, and so on.
                </small>
              </div>

              <div className="product-form-actions">
                <button
                  type="button"
                  onClick={() => setEditingArtwork(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-button"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      <div className="artist-dashboard-header">

        <h1>Manage Featured Arts</h1>

        <p>
          Add and edit gallery artworks. Pin selected artworks
          to the top and use priority 1, 2, 3... to control their order.
        </p>

        <button
          className="add-product-button"
          onClick={() =>
            setShowAddArtworkForm(true)
          }
        >
          + Add New Artwork
        </button>

      </div>


      {artworks.length === 0 ? (

        <div className="empty-dashboard">
          <h2>No Artworks</h2>
          <p>Add your first gallery artwork.</p>
        </div>

      ) : (

        <div className="personalized-products-admin">

          {displayedArtworks.map((artwork) => (

            <article
              className="admin-product-card"
              key={artwork._id}
            >


              <img
                src={getArtworkImageUrl(artwork.image)}
                alt={artwork.imageAlt?.trim() || artwork.title}
              />


              <h2>{artwork.title}</h2>

              <p>{artwork.description}</p>

              <p>
                <strong>Category:</strong>{" "}
                {artwork.category || "—"}
              </p>

              <p>
                <strong>Featured:</strong>{" "}
                {artwork.featured ? "Yes" : "No"}
              </p>

              {artwork.featured && (
                <p>
                  <strong>Priority:</strong>{" "}
                  {artwork.featuredOrder || 1}
                </p>
              )}

              <div className="admin-product-actions">

                <button
                  onClick={() =>
                    setEditingArtwork(artwork)
                  }
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    toggleArtworkFeatured(artwork)
                  }
                >
                  {artwork.featured
                    ? "Unpin from Top"
                    : "Pin to Top"}
                </button>

                <button
                  onClick={() =>
                    deleteArtwork(artwork)
                  }
                >
                  Delete
                </button>

              </div>

            </article>

          ))}

        </div>

      )}

    </>
  )
}

export default FeaturedArtsSection
