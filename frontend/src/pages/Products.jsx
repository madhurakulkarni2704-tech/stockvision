import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createProduct,
  deleteProduct,
  getProducts,
  getProfile,
  updateProduct,
} from "../services/api";
import "./Products.css";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    description: "",
    price: "",
    unit: "",
    status: "ACTIVE",
    image: null,
  });

  useEffect(() => {
  loadProducts();
  loadUserProfile();
}, []);


async function loadUserProfile() {
  try {
    const profile = await getProfile();

    setIsAdmin(profile?.role === "ADMIN");
  } catch (err) {
    setIsAdmin(false);
  }
}
  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      setProducts(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      sku: "",
      category: "",
      description: "",
      price: "",
      unit: "",
      status: "ACTIVE",
      image: null,
    });

    setEditingProduct(null);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;

    setFormData((previous) => ({
      ...previous,
      image: file,
    }));
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
    setError("");
  }

  function openEditForm(product) {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      description: product.description || "",
      price: product.price || "",
      unit: product.unit || "",
      status: product.status || "ACTIVE",
      image: null,
    });

    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  function buildFormData() {
    const data = new FormData();

    data.append("name", formData.name.trim());
    data.append("sku", formData.sku.trim());
    data.append("category", formData.category.trim());
    data.append("description", formData.description.trim());
    data.append("price", formData.price);
    data.append("unit", formData.unit.trim());
    data.append("status", formData.status);

    if (formData.image) {
      data.append("image", formData.image);
    }

    return data;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");

      const data = buildFormData();

      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }

      await loadProducts();
      closeForm();
    } catch (err) {
      setError(err.message || "Failed to save product.");
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProduct(product.id);

      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );
    } catch (err) {
      setError(err.message || "Failed to delete product.");
    }
  }

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(search) ||
        product.sku?.toLowerCase().includes(search) ||
        product.category?.toLowerCase().includes(search)
      );
    });
  }, [products, searchTerm]);

  function handleLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  }

  return (
    <div className="products-page">
      <aside className="products-sidebar">
        <div className="products-brand">
          <div className="products-logo">SV</div>

          <div>
            <h2>StockVision</h2>
            <span>Inventory Management</span>
          </div>
        </div>

        <nav className="products-nav">
          <button onClick={() => navigate("/dashboard")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button className="active">
            <span>▣</span>
            Products
          </button>

          <button onClick={() => navigate("/inventory")}>
            <span>▤</span>
            Inventory
          </button>

          <button onClick={() => navigate("/profile")}>
            <span>◉</span>
            Profile
          </button>
        </nav>
      </aside>

      <div className="products-main">
        <header className="products-header">
          <div className="products-header-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <button
            className="products-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <main className="products-content">
          <div className="products-title-row">
            <div>
              <span className="products-label">
                PRODUCT MANAGEMENT
              </span>

              <h1>Products</h1>

              <p>
                Manage and organize your products in StockVision.
              </p>
            </div>

{isAdmin && (
  <button
    className="add-product-btn"
    onClick={openAddForm}
  >
    + Add Product
  </button>
)}
          </div>

          {error && (
            <div className="products-error">
              {error}
            </div>
          )}

          <div className="products-toolbar">
            <div className="products-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search by product name, SKU or category..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <section className="products-card">
            <div className="products-card-header">
              <div>
                <h2>All Products</h2>

                <p>
                  {loading
                    ? "Loading products..."
                    : "Your products are listed below."}
                </p>
              </div>

              <span className="product-count">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "Product"
                  : "Products"}
              </span>
            </div>

            {loading ? (
              <div className="products-loading">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="products-empty">
                <div className="empty-icon">▣</div>

                <h3>
                  {products.length === 0
                    ? "No products yet"
                    : "No products found"}
                </h3>

                <p>
                  {products.length === 0 ? (
                    <>
                      You haven't added any products yet.
                      <br />
                      Add your first product to start managing
                      your inventory.
                    </>
                  ) : (
                    "Try changing your search."
                  )}
                </p>

                {products.length === 0 && isAdmin && (
  <button
    className="empty-add-btn"
    onClick={openAddForm}
  >
    + Add Your First Product
  </button>
)}
              </div>
            ) : (
              <div className="products-table-wrapper">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Unit</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-name-cell">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="product-image"
                              />
                            ) : (
                              <div className="product-image-placeholder">
                                {product.name
                                  ?.charAt(0)
                                  .toUpperCase() || "P"}
                              </div>
                            )}

                            <div>
                              <strong>{product.name}</strong>

                              {product.description && (
                                <small>
                                  {product.description}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>{product.sku}</td>

                        <td>
                          {product.category || "-"}
                        </td>

                        <td>
                          ₹{Number(product.price).toFixed(2)}
                        </td>

                        <td>
                          {product.unit || "-"}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              product.status === "ACTIVE"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {product.status === "ACTIVE"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
  {isAdmin && (
    <div className="product-actions">
      <button
        className="edit-btn"
        onClick={() =>
          openEditForm(product)
        }
      >
        Edit
      </button>

      <button
        className="delete-btn"
        onClick={() =>
          handleDelete(product)
        }
      >
        Delete
      </button>
    </div>
  )}
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {showForm && (
        <div className="product-modal-overlay">
          <div className="product-modal">
            <div className="product-modal-header">
              <div>
                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p>
                  {editingProduct
                    ? "Update the product information."
                    : "Add a new product to StockVision."}
                </p>
              </div>

              <button
                className="modal-close-btn"
                onClick={closeForm}
                type="button"
              >
                ×
              </button>
            </div>

            <form
              className="product-form"
              onSubmit={handleSubmit}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    Product Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sku">
                    SKU *
                  </label>

                  <input
                    id="sku"
                    name="sku"
                    type="text"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">
                    Category
                  </label>

                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">
                    Price *
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="unit">
                    Unit
                  </label>

                  <input
                    id="unit"
                    name="unit"
                    type="text"
                    placeholder="pcs, kg, box..."
                    value={formData.unit}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">
                  Product Image
                </label>

                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {formData.image && (
                  <small>
                    Selected: {formData.image.name}
                  </small>
                )}
              </div>

              <div className="product-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-btn"
                >
                  {editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;