import {
  getImageUrl,
} from "../utils/images"
import MediaFields from "./MediaFields"

// ================= PERSONALIZED PRODUCTS =================

function ProductsSection({
  showAddProductForm,
  handleAddProduct,
  personalizedProducts,
  setShowAddProductForm,
  editingProduct,
  handleEditProduct,
  setEditingProduct,
  displayedPersonalizedProducts,
  giftCategories,
  toggleProductActive,
  toggleProductStock,
  deleteProduct,
}) {
  return (
    <>
      {/* Suggests existing categories so spelling stays consistent */}
      <datalist id="product-category-options">
        {giftCategories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

      {showAddProductForm && (

        <div className="product-form-overlay">

          <div className="product-form-card">

            <h2>
              Add Personalized MicroArt
            </h2>

            <p>
              Add a new personalized artwork for customers to order.
            </p>

            <form onSubmit={handleAddProduct}>

              <div className="form-group">
                <label>Product Title</label>

                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Example: Name Carved on 0.7 mm Pencil Lead"
                />
              </div>


              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  required
                  rows="4"
                  placeholder="Describe the personalized artwork"
                />
              </div>

              <div className="form-group">
                <label>SEO Page Title (Optional)</label>

                <input
                  type="text"
                  name="seoTitle"
                  maxLength={120}
                  placeholder="Example: Personalized Pencil Carving Gift"
                />

                <small>
                  A search-friendly title for Google.
                </small>
              </div>

              <div className="form-group">
                <label>SEO Meta Description (Optional)</label>

                <textarea
                  name="seoDescription"
                  rows="3"
                  maxLength={160}
                  placeholder="Describe this personalized gift for Google search results"
                />

                <small>
                  Recommended: approximately 140–160 characters.
                </small>
              </div>

              <div className="form-group">
                <label>Google Image Alt Text (Optional)</label>

                <textarea
                  name="imageAlt"
                  rows="3"
                  maxLength={200}
                  placeholder="Describe what is visible in the product image"
                />

                <small>
                  Describe the actual artwork for Google Images
                  and accessibility. Avoid keyword stuffing.
                </small>
              </div>

              <MediaFields
                item={null}
                getUrl={getImageUrl}
              />

              <div className="form-group">
                <label htmlFor="new-product-category">Category (Optional)</label>

                <input
                  id="new-product-category"
                  type="text"
                  name="category"
                  maxLength={40}
                  list="product-category-options"
                  placeholder="Example: Pencil Carving"
                />

                <small>
                  Shown as a filter on the Personalized Gifts page.
                </small>
              </div>


              <div className="form-group">
                <label>Base Price ($)</label>

                <input
                  type="number"
                  name="basePrice"
                  min="0"
                  step="0.01"
                  required
                  placeholder="30"
                />
              </div>


              <div className="form-group">
                <label>Price Per Letter ($)</label>

                <input
                  type="number"
                  name="pricePerLetter"
                  min="0"
                  step="0.01"
                  placeholder="5"
                />
              </div>


              <div className="form-group">
                <label>Minimum Price ($)</label>

                <input
                  type="number"
                  name="minimumPrice"
                  min="0"
                  step="0.01"
                  placeholder="30"
                />
              </div>

              <div className="form-group">

                <label>
                  Display Priority
                </label>

                <input
                  type="number"
                  name="displayOrder"
                  min="1"
                  required
                  defaultValue={
                    personalizedProducts.length + 1
                  }
                />

                <small>
                  1 appears first, 2 appears second, and so on.
                </small>

              </div>

              <div className="form-group">
                <label htmlFor="new-product-stock">Material Availability</label>
                <select id="new-product-stock" name="inStock" defaultValue="true">
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>

              <div className="product-form-actions">

                <button
                  type="button"
                  onClick={() =>
                    setShowAddProductForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-button"
                >
                  Add Product
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {editingProduct && (
        <div className="product-form-overlay">
          <div className="product-form-card">
            <h2>Edit Personalized MicroArt</h2>

            <p>
              Update the product information below.
              Add new photos or videos, pick the cover,
              or remove the ones you no longer want.
            </p>

            <form onSubmit={handleEditProduct}>
              <div className="form-group">
                <label>Product Title</label>

                <input
                  type="text"
                  name="title"
                  defaultValue={editingProduct.title}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  rows="4"
                  defaultValue={editingProduct.description}
                  required
                />
              </div>

              <div className="form-group">
                <label>SEO Page Title (Optional)</label>

                <input
                  type="text"
                  name="seoTitle"
                  maxLength={120}
                  defaultValue={editingProduct.seoTitle || ""}
                  placeholder="Example: Personalized Pencil Carving Gift"
                />

                <small>
                  A search-friendly title for Google.
                </small>
              </div>

              <div className="form-group">
                <label>SEO Meta Description (Optional)</label>

                <textarea
                  name="seoDescription"
                  rows="3"
                  maxLength={160}
                  defaultValue={editingProduct.seoDescription || ""}
                  placeholder="Describe this personalized gift for Google search results"
                />

                <small>
                  Recommended: approximately 140–160 characters.
                </small>
              </div>

              <div className="form-group">
                <label>Google Image Alt Text (Optional)</label>

                <textarea
                  name="imageAlt"
                  rows="3"
                  maxLength={200}
                  defaultValue={editingProduct.imageAlt || ""}
                  placeholder="Describe what is visible in the product image"
                />

                <small>
                  Describe the actual artwork for Google Images
                  and accessibility. Avoid keyword stuffing.
                </small>
              </div>

              <MediaFields
                item={editingProduct}
                getUrl={getImageUrl}
              />

              <div className="form-group">
                <label htmlFor="edit-product-category">Category (Optional)</label>

                <input
                  id="edit-product-category"
                  type="text"
                  name="category"
                  maxLength={40}
                  list="product-category-options"
                  defaultValue={editingProduct.category || ""}
                  placeholder="Example: Pencil Carving"
                />

                <small>
                  Shown as a filter on the Personalized Gifts page.
                </small>
              </div>

              <div className="form-group">
                <label>Base Price ($)</label>

                <input
                  type="number"
                  name="basePrice"
                  min="0"
                  step="0.01"
                  defaultValue={editingProduct.basePrice}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price Per Letter ($)</label>

                <input
                  type="number"
                  name="pricePerLetter"
                  min="0"
                  step="0.01"
                  defaultValue={editingProduct.pricePerLetter}
                />
              </div>

              <div className="form-group">
                <label>Minimum Price ($)</label>

                <input
                  type="number"
                  name="minimumPrice"
                  min="0"
                  step="0.01"
                  defaultValue={editingProduct.minimumPrice}
                />
              </div>

              <div className="form-group">

                <label>
                  Display Priority
                </label>

                <input
                  type="number"
                  name="displayOrder"
                  min="1"
                  required
                  defaultValue={
                    editingProduct.displayOrder || ""
                  }
                />

                <small>
                  1 appears first, 2 appears second, and so on.
                </small>

              </div>

              <div className="form-group">
                <label htmlFor="edit-product-stock">
                  Material Availability
                </label>

                <select
                  id="edit-product-stock"
                  name="inStock"
                  defaultValue={
                    editingProduct.inStock === false
                      ? "false"
                      : "true"
                  }
                >
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>

              <div className="product-form-actions">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
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

        <h1>
          Manage Personalized MicroArts
        </h1>

        <p>
          Add, edit and manage the personalized products
          available to your customers.
        </p>

        <button
          className="add-product-button"
          onClick={() =>
            setShowAddProductForm(true)
          }
        >
          + Add New Product
        </button>

      </div>


      {personalizedProducts.length === 0 ? (

        <div className="empty-dashboard">

          <h2>
            No Personalized Products
          </h2>

          <p>
            Add your first personalized MicroArt product.
          </p>

        </div>

      ) : (

        <div className="personalized-products-admin">

          {displayedPersonalizedProducts.map((product) => (

            <article
              className="admin-product-card"
              key={product._id}
            >


              <img
                src={getImageUrl(product.image)}
                alt={product.imageAlt?.trim() || product.title}
              />


              <h2>
                {product.title}
              </h2>

              <p>
                {product.description}
              </p>

              <p>
                <strong>
                  Base Price:
                </strong>{" "}
                ${product.basePrice}
              </p>

              <p>
                <strong>
                  Price Per Letter:
                </strong>{" "}
                ${product.pricePerLetter}
              </p>

              <p>
                <strong>
                  Minimum Price:
                </strong>{" "}
                ${product.minimumPrice}
              </p>

              <p>
                <strong>Category:</strong>{" "}
                {product.category || "None"}
              </p>

              <p>
                <strong>Photos &amp; Videos:</strong>{" "}
                {product.media?.length || 1}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {product.active
                  ? "Active"
                  : "Inactive"}
              </p>
              <p>
                <strong>Material Availability:</strong>{" "}
                {product.inStock === false ? "Out of Stock" : "In Stock"}
              </p>
              <p>
                <strong>
                  Priority:
                </strong>{" "}
                {product.displayOrder || "Not set"}
              </p>

              <div className="admin-product-actions">

                <button
                  onClick={() =>
                    setEditingProduct(product)
                  }
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleProductActive(product)}
                >
                  {product.active ? "Deactivate" : "Activate"}
                </button>

                <button type="button" onClick={() => toggleProductStock(product)}>
                  {product.inStock === false ? "Mark In Stock" : "Mark Out of Stock"}
                </button>

                <button
                  onClick={() => deleteProduct(product)}
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

export default ProductsSection
