import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getExpiryProducts,
  getExpiringSoonProducts,
  getExpiredProducts,
  getSafeProducts,
} from "../services/api";
import "./Expiry.css";

function Expiry() {
  const navigate = useNavigate();

  const [expiryProducts, setExpiryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadExpiryData() {
      try {
        setLoading(true);
        setError("");

        const data = await getExpiryProducts();
        setExpiryProducts(data);
      } catch (err) {
        setError(err.message || "Failed to load expiry data.");
      } finally {
        setLoading(false);
      }
    }

    loadExpiryData();
  }, []);

  const expiredCount = useMemo(
    () =>
      expiryProducts.filter(
        (item) => item.expiry_status === "EXPIRED"
      ).length,
    [expiryProducts]
  );

  const expiringSoonCount = useMemo(
    () =>
      expiryProducts.filter(
        (item) => item.expiry_status === "EXPIRING SOON"
      ).length,
    [expiryProducts]
  );

  const safeCount = useMemo(
    () =>
      expiryProducts.filter(
        (item) => item.expiry_status === "SAFE"
      ).length,
    [expiryProducts]
  );

  const filteredProducts = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return expiryProducts.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.name?.toLowerCase().includes(searchText) ||
        item.sku?.toLowerCase().includes(searchText) ||
        item.category?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        item.expiry_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [expiryProducts, search, statusFilter]);

  function getStatusClass(status) {
    if (status === "EXPIRED") {
      return "expiry-status expired";
    }

    if (status === "EXPIRING SOON") {
      return "expiry-status expiring-soon";
    }

    return "expiry-status safe";
  }

  function getDaysClass(daysRemaining) {
    if (daysRemaining < 0) {
      return "days-remaining expired";
    }

    if (daysRemaining <= 7) {
      return "days-remaining warning";
    }

    return "days-remaining safe";
  }

  return (
    <div className="expiry-page">

      {/* SIDEBAR */}
      <aside className="expiry-sidebar">

        <div className="expiry-brand">
          <div className="expiry-logo">
            SV
          </div>

          <div>
            <h2>StockVision</h2>
            <span>Expiry Monitoring</span>
          </div>
        </div>

        <nav className="expiry-nav">

          <button onClick={() => navigate("/dashboard")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button onClick={() => navigate("/products")}>
            <span>▣</span>
            Products
          </button>

          <button onClick={() => navigate("/inventory")}>
            <span>▤</span>
            Inventory
          </button>

          <button className="active">
            <span>◷</span>
            Expiry
          </button>

          <button onClick={() => navigate("/profile")}>
            <span>♙</span>
            Profile
          </button>

        </nav>

        <div className="expiry-sidebar-divider"></div>

        <div className="expiry-sidebar-info">

          <div className="expiry-info-symbol">
            ⚠
          </div>

          <h3>
            Stay Ahead of
            <br />
            Expiry Dates
          </h3>

          <p>
            Monitor products approaching expiry
            and reduce product waste.
          </p>

        </div>

      </aside>

      {/* MAIN */}
      <div className="expiry-main">

        {/* HEADER */}
        <header className="expiry-header">

          <div className="expiry-header-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search expiry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            className="expiry-logout"
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
        <main className="expiry-content">

          {/* TITLE */}
          <div className="expiry-title-row">

            <div>
              <span className="expiry-label">
                EXPIRY MONITORING
              </span>

              <h1>
                Expiry Dashboard
              </h1>

              <p>
                Monitor product expiry dates and identify products
                that need attention.
              </p>
            </div>

          </div>

          {/* STAT CARDS */}
          <section className="expiry-stats">

            <div className="expiry-stat-card">

              <div className="expiry-stat-icon purple">
                📦
              </div>

              <div>
                <p>Total Products</p>
                <h2>{expiryProducts.length}</h2>
                <span>Products with expiry data</span>
              </div>

            </div>

            <div className="expiry-stat-card">

              <div className="expiry-stat-icon red">
                ⚠
              </div>

              <div>
                <p>Expired</p>
                <h2>{expiredCount}</h2>
                <span>Products already expired</span>
              </div>

            </div>

            <div className="expiry-stat-card">

              <div className="expiry-stat-icon orange">
                ◷
              </div>

              <div>
                <p>Expiring Soon</p>
                <h2>{expiringSoonCount}</h2>
                <span>Within the next 7 days</span>
              </div>

            </div>

            <div className="expiry-stat-card">

              <div className="expiry-stat-icon green">
                ✓
              </div>

              <div>
                <p>Safe</p>
                <h2>{safeCount}</h2>
                <span>More than 7 days remaining</span>
              </div>

            </div>

          </section>

          {/* FILTERS */}
          <section className="expiry-toolbar">

            <div className="expiry-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search by product name, SKU or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="expiry-filter"
            >
              <option value="ALL">
                All Statuses
              </option>

              <option value="SAFE">
                Safe
              </option>

              <option value="EXPIRING SOON">
                Expiring Soon
              </option>

              <option value="EXPIRED">
                Expired
              </option>
            </select>

            <button
              type="button"
              className="expiry-clear-btn"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            >
              Clear
            </button>

          </section>

          {/* EXPIRY TABLE */}
          <section className="expiry-card">

            <div className="expiry-card-header">

              <div>
                <h2>
                  Product Expiry
                </h2>

                <p>
                  Track expiry dates, remaining days and product status.
                </p>
              </div>

              <span className="expiry-count">
                {filteredProducts.length} Items
              </span>

            </div>

            <div className="expiry-table-header">

              <span>PRODUCT</span>
              <span>SKU</span>
              <span>CATEGORY</span>
              <span>EXPIRY DATE</span>
              <span>DAYS REMAINING</span>
              <span>STATUS</span>

            </div>

            {loading ? (

              <div className="expiry-empty">
                <h3>
                  Loading expiry data...
                </h3>
              </div>

            ) : error ? (

              <div className="expiry-empty">
                <h3>
                  Unable to load expiry data
                </h3>

                <p>
                  {error}
                </p>
              </div>

            ) : filteredProducts.length === 0 ? (

              <div className="expiry-empty">

                <div className="expiry-empty-icon">
                  ◷
                </div>

                <h3>
                  No matching expiry data
                </h3>

                <p>
                  Try a different product name, SKU,
                  category or expiry status.
                </p>

              </div>

            ) : (

              <div className="expiry-table-body">

                {filteredProducts.map((item) => (

                  <div
                    className="expiry-table-row"
                    key={item.id}
                  >

                    <span className="expiry-product-name">
                      {item.name}
                    </span>

                    <span>
                      {item.sku}
                    </span>

                    <span>
                      {item.category || "—"}
                    </span>

                    <span>
                      {item.expiry_date
                        ? new Date(
                            `${item.expiry_date}T00:00:00`
                          ).toLocaleDateString()
                        : "—"}
                    </span>

                    <span>
                      <strong
                        className={getDaysClass(
                          Number(item.days_remaining)
                        )}
                      >
                        {item.days_remaining === null
                          ? "—"
                          : item.days_remaining < 0
                          ? `${Math.abs(
                              item.days_remaining
                            )} days overdue`
                          : `${item.days_remaining} days`}
                      </strong>
                    </span>

                    <span>
                      <span
                        className={getStatusClass(
                          item.expiry_status
                        )}
                      >
                        {item.expiry_status}
                      </span>
                    </span>

                  </div>

                ))}

              </div>

            )}

          </section>

          {/* WARNING CARDS */}
          <section className="expiry-warning-grid">

            <div className="expiry-warning-card expired">

              <div className="expiry-warning-icon">
                ⚠
              </div>

              <div>
                <h3>
                  Expired Products
                </h3>

                <p>
                  These products have passed their expiry date
                  and require immediate attention.
                </p>
              </div>

            </div>

            <div className="expiry-warning-card soon">

              <div className="expiry-warning-icon">
                ◷
              </div>

              <div>
                <h3>
                  Expiring Soon
                </h3>

                <p>
                  Products with 7 or fewer days remaining
                  should be reviewed and managed.
                </p>
              </div>

            </div>

            <div className="expiry-warning-card safe">

              <div className="expiry-warning-icon">
                ✓
              </div>

              <div>
                <h3>
                  Safe Products
                </h3>

                <p>
                  These products have more than 7 days
                  remaining before expiry.
                </p>
              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Expiry;