import { useNavigate } from "react-router-dom";
import "./Products.css";

function Products() {
  const navigate = useNavigate();

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
            <span>♙</span>
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
            />
          </div>

          <button
            className="products-logout"
            onClick={() => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              window.location.href = "/login";
            }}
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

            <button className="add-product-btn">
              + Add Product
            </button>
          </div>

          <div className="products-toolbar">
            <div className="products-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search by product name or SKU..."
              />
            </div>

            <button className="filter-btn">
              ☷ Filters
            </button>
          </div>

          <section className="products-card">
            <div className="products-card-header">
              <div>
                <h2>All Products</h2>
                <p>Your products will appear here.</p>
              </div>

              <span className="product-count">
                0 Products
              </span>
            </div>

            <div className="products-empty">
              <div className="empty-icon">📦</div>

              <h3>No products yet</h3>

              <p>
                You haven't added any products yet.
                <br />
                Add your first product to start managing your inventory.
              </p>

              <button className="empty-add-btn">
                + Add Your First Product
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Products;