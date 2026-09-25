import { useNavigate } from "react-router-dom";
import "./Inventory.css";

function Inventory() {
  const navigate = useNavigate();

  return (
    <div className="inventory-page">

      {/* SIDEBAR */}
      <aside className="inventory-sidebar">

        <div className="inventory-brand">
          <div className="inventory-logo">
            SV
          </div>

          <div>
            <h2>StockVision</h2>
            <span>Inventory Management</span>
          </div>
        </div>

        <nav className="inventory-nav">

          <button
            onClick={() => navigate("/dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            onClick={() => navigate("/products")}
          >
            <span>▣</span>
            Products
          </button>

          <button className="active">
            <span>▤</span>
            Inventory
          </button>

          <button
            onClick={() => navigate("/profile")}
          >
            <span>♙</span>
            Profile
          </button>

        </nav>

        <div className="inventory-sidebar-divider"></div>

        <div className="inventory-sidebar-promo">

          <div className="inventory-promo-illustration">

            <div className="inventory-promo-box box-one"></div>
            <div className="inventory-promo-box box-two"></div>
            <div className="inventory-promo-box box-three"></div>

            <div className="inventory-promo-chart">
              ▂▅▇
            </div>

          </div>

          <h3>
            Manage Smarter
            <br />
            Grow Faster
          </h3>

          <p>
            Track inventory, manage products
            and keep your business organized.
          </p>

          <div className="inventory-promo-dots">
            <span className="active"></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

        </div>

      </aside>


      {/* MAIN */}
      <div className="inventory-main">

        {/* HEADER */}
        <header className="inventory-header">

          <div className="inventory-header-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search inventory..."
            />

          </div>

          <button
            className="inventory-logout"
            onClick={() => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>

        </header>


        {/* CONTENT */}
        <main className="inventory-content">

          {/* TITLE */}
          <div className="inventory-title-row">

            <div>

              <span className="inventory-label">
                INVENTORY MANAGEMENT
              </span>

              <h1>
                Inventory
              </h1>

              <p>
                Monitor your stock levels and keep your inventory organized.
              </p>

            </div>

            <button className="stock-update-btn">
              + Update Stock
            </button>

          </div>


          {/* STAT CARDS */}
          <section className="inventory-stats">

            <div className="inventory-stat-card">

              <div className="inventory-stat-icon purple">
                📦
              </div>

              <div>
                <p>Total Items</p>
                <h2>--</h2>
                <span>Coming soon</span>
              </div>

            </div>


            <div className="inventory-stat-card">

              <div className="inventory-stat-icon blue">
                📊
              </div>

              <div>
                <p>Stock Value</p>
                <h2>--</h2>
                <span>Coming soon</span>
              </div>

            </div>


            <div className="inventory-stat-card">

              <div className="inventory-stat-icon orange">
                ⚠
              </div>

              <div>
                <p>Low Stock</p>
                <h2>--</h2>
                <span>Coming soon</span>
              </div>

            </div>


            <div className="inventory-stat-card">

              <div className="inventory-stat-icon green">
                ✓
              </div>

              <div>
                <p>Stock Status</p>
                <h2>Ready</h2>
                <span>Inventory system ready</span>
              </div>

            </div>

          </section>


          {/* TOOLBAR */}
          <section className="inventory-toolbar">

            <div className="inventory-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search by product name or SKU..."
              />

            </div>

            <button className="inventory-filter-btn">
              ☷ Filters
            </button>

          </section>


          {/* INVENTORY TABLE */}
          <section className="inventory-card">

            <div className="inventory-card-header">

              <div>

                <h2>
                  Stock Inventory
                </h2>

                <p>
                  Monitor product quantities and stock status.
                </p>

              </div>

              <span className="inventory-count">
                0 Items
              </span>

            </div>


            {/* TABLE HEADER */}
            <div className="inventory-table-header">

              <span>PRODUCT</span>
              <span>SKU</span>
              <span>QUANTITY</span>
              <span>PRICE</span>
              <span>STATUS</span>

            </div>


            {/* EMPTY STATE */}
            <div className="inventory-empty">

              <div className="inventory-empty-icon">
                📊
              </div>

              <h3>
                No inventory data yet
              </h3>

              <p>
                Your inventory information will appear here
                <br />
                once products and stock data are available.
              </p>

              <button className="inventory-empty-btn">
                + Add Inventory
              </button>

            </div>

          </section>


          {/* INFORMATION CARDS */}
          <section className="inventory-info-grid">

            <div className="inventory-info-card">

              <div className="inventory-info-icon purple">
                📦
              </div>

              <div>

                <h3>
                  Stock Tracking
                </h3>

                <p>
                  Keep track of available product quantities
                  in your inventory.
                </p>

              </div>

            </div>


            <div className="inventory-info-card">

              <div className="inventory-info-icon orange">
                ⚠
              </div>

              <div>

                <h3>
                  Low Stock Alerts
                </h3>

                <p>
                  Identify products that need to be restocked
                  before they run out.
                </p>

              </div>

            </div>


            <div className="inventory-info-card">

              <div className="inventory-info-icon blue">
                📊
              </div>

              <div>

                <h3>
                  Inventory Analytics
                </h3>

                <p>
                  Inventory analytics and stock reports will
                  be available here.
                </p>

              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Inventory;