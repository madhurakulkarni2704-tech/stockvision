import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addStock,
  getInventory,
  getInventoryHistory,
  reduceStock,
} from "../services/api";
import "./Inventory.css";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedInventory, setSelectedInventory] = useState(null);
  const [history, setHistory] = useState([]);
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockAction, setStockAction] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true);
        setError("");

        const data = await getInventory();
        setInventory(data);
      } catch (err) {
        setError(err.message || "Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    }

    loadInventory();
  }, []);

  const filteredInventory = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return inventory.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.product_name?.toLowerCase().includes(searchText) ||
        item.sku?.toLowerCase().includes(searchText);

      const matchesStatus =
        filterStatus === "All" ||
        item.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, filterStatus]);

  async function handleStockAction() {
    if (!selectedInventory || !stockQuantity) {
      return;
    }

    const quantity = Number(stockQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    try {
      setError("");

      let updatedInventory;

      if (stockAction === "add") {
        updatedInventory = await addStock(
          selectedInventory.id,
          quantity
        );
      } else if (stockAction === "reduce") {
        updatedInventory = await reduceStock(
          selectedInventory.id,
          quantity
        );
      } else {
        return;
      }

      setInventory((currentInventory) =>
        currentInventory.map((item) =>
          item.id === updatedInventory.id
            ? updatedInventory
            : item
        )
      );

      setSelectedInventory(updatedInventory);
      setStockQuantity("");
      setStockAction("");

      const updatedHistory = await getInventoryHistory(
        updatedInventory.id
      );

      setHistory(updatedHistory);
    } catch (err) {
      setError(err.message || "Failed to update stock.");
    }
  }

  async function openInventory(item) {
    setSelectedInventory(item);
    setStockQuantity("");
    setStockAction("");
    setError("");

    try {
      const data = await getInventoryHistory(item.id);
      setHistory(data);
    } catch (err) {
      setHistory([]);
      setError(
        err.message || "Failed to load inventory history."
      );
    }
  }

  function closeInventoryPanel() {
    setSelectedInventory(null);
    setStockQuantity("");
    setStockAction("");
    setHistory([]);
    setError("");
  }

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

            <button
              className="stock-update-btn"
              onClick={() => {
                if (filteredInventory.length > 0) {
                  openInventory(filteredInventory[0]);
                }
              }}
            >
              + Update Stock
            </button>

          </div>


          {/* ERROR */}
          {error && (
            <div className="inventory-error">
              {error}
            </div>
          )}


          {/* STAT CARDS */}
          <section className="inventory-stats">

            <div className="inventory-stat-card">

              <div className="inventory-stat-icon purple">
                📦
              </div>

              <div>
                <p>Total Items</p>

                <h2>
                  {inventory.length}
                </h2>

                <span>
                  Inventory items
                </span>
              </div>

            </div>


            <div className="inventory-stat-card">

              <div className="inventory-stat-icon blue">
                📊
              </div>

              <div>
                <p>Stock Value</p>

                <h2>
                  ₹
                  {inventory
                    .reduce(
                      (total, item) =>
                        total +
                        Number(item.price || 0) *
                          Number(item.quantity || 0),
                      0
                    )
                    .toFixed(2)}
                </h2>

                <span>
                  Total inventory value
                </span>
              </div>

            </div>


            <div className="inventory-stat-card">

              <div className="inventory-stat-icon orange">
                ⚠
              </div>

              <div>
                <p>Low Stock</p>

                <h2>
                  {
                    inventory.filter(
                      (item) =>
                        item.status === "Low Stock"
                    ).length
                  }
                </h2>

                <span>
                  Items need attention
                </span>
              </div>

            </div>


            <div className="inventory-stat-card">

              <div className="inventory-stat-icon green">
                ✓
              </div>

              <div>
                <p>Stock Status</p>

                <h2>
                  {
                    inventory.filter(
                      (item) =>
                        item.status === "In Stock"
                    ).length
                  }
                </h2>

                <span>
                  Items in stock
                </span>
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>


            <div style={{ position: "relative" }}>

              <button
                type="button"
                className="inventory-filter-btn"
                onClick={() =>
                  setShowFilters(
                    (current) => !current
                  )
                }
              >
                ☷ Filters
              </button>


              {showFilters && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "48px",
                    zIndex: 20,
                    background: "white",
                    border: "1px solid #e5e7ed",
                    borderRadius: "9px",
                    padding: "10px",
                    minWidth: "180px",
                    boxShadow:
                      "0 8px 20px rgba(0,0,0,0.08)",
                  }}
                >

                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "#73798a",
                      fontSize: "10px",
                      fontWeight: "700",
                    }}
                  >
                    STOCK STATUS
                  </label>

                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(
                        e.target.value
                      );
                      setShowFilters(false);
                    }}
                    style={{
                      width: "100%",
                      height: "36px",
                      border:
                        "1px solid #e5e7ed",
                      borderRadius: "7px",
                      padding: "0 8px",
                      outline: "none",
                      background: "white",
                      color: "#4d5362",
                      fontSize: "11px",
                    }}
                  >

                    <option value="All">
                      All Status
                    </option>

                    <option value="In Stock">
                      In Stock
                    </option>

                    <option value="Low Stock">
                      Low Stock
                    </option>

                    <option value="Out of Stock">
                      Out of Stock
                    </option>

                  </select>

                </div>
              )}

            </div>

          </section>


          {/* ACTIVE FILTER INFORMATION */}
          {(search || filterStatus !== "All") && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "15px",
                padding: "10px 13px",
                borderRadius: "8px",
                background: "#f8f7ff",
                border: "1px solid #e5e2ff",
                color: "#6659d9",
                fontSize: "11px",
              }}
            >

              <span>
                Showing {filteredInventory.length} of{" "}
                {inventory.length} inventory items
              </span>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilterStatus("All");
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#5b4ee0",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>

            </div>
          )}


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
                {filteredInventory.length} Items
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


            {/* TABLE CONTENT */}
            {loading ? (

              <div className="inventory-empty">

                <h3>
                  Loading inventory...
                </h3>

              </div>

            ) : error ? (

              <div className="inventory-empty">

                <h3>
                  Unable to load inventory
                </h3>

                <p>
                  {error}
                </p>

              </div>

            ) : filteredInventory.length === 0 ? (

              <div className="inventory-empty">

                <div className="inventory-empty-icon">
                  📊
                </div>

                {inventory.length === 0 ? (

                  <>
                    <h3>
                      No inventory data yet
                    </h3>

                    <p>
                      Your inventory information will appear here
                      <br />
                      once products and stock data are available.
                    </p>
                  </>

                ) : (

                  <>
                    <h3>
                      No matching inventory found
                    </h3>

                    <p>
                      Try a different product name, SKU,
                      <br />
                      or stock status filter.
                    </p>
                  </>

                )}

              </div>

            ) : (

              <div className="inventory-table-body">

                {filteredInventory.map((item) => (

                  <div
                    className="inventory-table-row"
                    key={item.id}
                    onClick={() =>
                      openInventory(item)
                    }
                  >

                    <span>
                      {item.product_name}
                    </span>

                    <span>
                      {item.sku}
                    </span>

                    <span>
                      {item.quantity}
                    </span>

                    <span>
                      ₹{item.price}
                    </span>

                    <span>
                      {item.status}
                    </span>

                  </div>

                ))}

              </div>

            )}

          </section>


          {/* UPDATE STOCK PANEL */}
          {selectedInventory && (

            <section
              className="inventory-card"
              style={{
                marginTop: "20px",
              }}
            >

              <div className="inventory-card-header">

                <div>

                  <h2>
                    Update Stock
                  </h2>

                  <p>
                    {selectedInventory.product_name} (
                    {selectedInventory.sku}
                    )
                  </p>

                </div>


                <button
                  type="button"
                  className="inventory-update-close"
                  onClick={closeInventoryPanel}
                >
                  ×
                </button>

              </div>


              <div className="inventory-update-panel">

                <div className="inventory-current-stock">
                  Current quantity:{" "}
                  <strong>
                    {selectedInventory.quantity}
                  </strong>
                </div>


                <div className="inventory-action-buttons">

                  <button
                    type="button"
                    className={`inventory-action-btn ${
                      stockAction === "add"
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setStockAction("add");
                      setStockQuantity("");
                      setError("");
                    }}
                  >
                    Add Stock
                  </button>


                  <button
                    type="button"
                    className={`inventory-action-btn ${
                      stockAction === "reduce"
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setStockAction("reduce");
                      setStockQuantity("");
                      setError("");
                    }}
                  >
                    Reduce Stock
                  </button>

                </div>


                {stockAction && (

                  <div>

                    <input
                      className="inventory-quantity-input"
                      type="number"
                      min="1"
                      placeholder="Enter quantity"
                      value={stockQuantity}
                      onChange={(e) =>
                        setStockQuantity(
                          e.target.value
                        )
                      }
                    />


                    <button
                      type="button"
                      className="inventory-submit-btn"
                      onClick={handleStockAction}
                    >
                      {stockAction === "add"
                        ? "Add Stock"
                        : "Reduce Stock"}
                    </button>

                  </div>

                )}


                {/* INVENTORY HISTORY */}
                {history.length > 0 && (

                  <div className="inventory-history">

                    <h3>
                      Inventory History
                    </h3>


                    {history.map((entry) => (

                      <div
                        className="inventory-history-entry"
                        key={entry.id}
                      >

                        <strong>
                          {entry.transaction_type}
                        </strong>

                        {" — "}

                        {entry.quantity} units

                        {" — "}

                        {entry.previous_quantity}

                        {" → "}

                        {entry.new_quantity}

                        <div>
                          {new Date(
                            entry.created_at
                          ).toLocaleString()}
                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </section>

          )}


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