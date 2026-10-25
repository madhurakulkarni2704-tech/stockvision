
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPricingSuggestions,
  applyPricingDiscount,
} from "../services/api";
import "./Dashboard.css";
import "./Pricing.css";

function Pricing() {
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigateTo = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPricingSuggestions();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load pricing suggestions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

  const handleApplyDiscount = async (item) => {
    try {
      setApplyingId(item.product_id);
      setError("");
      setSuccessMessage("");

      const response = await fetch("http://127.0.0.1:8000/api/pricing/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({
          product: item.product_id,
          discount_percentage: item.discount_percentage,
          discounted_price: item.suggested_price,
          is_applied: false,
        }),
      });

      let pricingRecord;

      if (response.ok) {
        pricingRecord = await response.json();
      } else if (response.status === 400) {
        const existingResponse = await fetch(
          "http://127.0.0.1:8000/api/pricing/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );

        const existingData = await existingResponse.json();

        if (!existingResponse.ok) {
          throw new Error(
            existingData.detail || "Failed to find pricing record."
          );
        }

        pricingRecord = existingData.find(
          (pricing) => pricing.product === item.product_id
        );

        if (!pricingRecord) {
          throw new Error("Unable to create or find the pricing record.");
        }
      } else {
        const data = await response.json();
        throw new Error(data.detail || JSON.stringify(data));
      }

      await applyPricingDiscount(
        pricingRecord.id,
        item.discount_percentage
      );

      setSuccessMessage(
        `${item.product_name} discount applied successfully.`
      );

      await loadSuggestions();
    } catch (err) {
      setError(err.message || "Failed to apply discount.");
    } finally {
      setApplyingId(null);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "—";

    return `₹${Number(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusClass = (status) => {
    if (status === "DO NOT SELL") return "pricing-status danger";
    if (status === "ACTIVE") return "pricing-status active";
    return "pricing-status normal";
  };

  return (
    <div className="dashboard-page pricing-layout">
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        id="dashboard-navigation"
        className={`dashboard-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
        aria-label="Main navigation"
      >
        <div className="sidebar-brand">
          <div className="sidebar-logo" aria-hidden="true">S</div>
          <div>
            <h2>StockVision</h2>
            <span>Inventory Management</span>
          </div>
        </div>

        <nav className="sidebar-navigation" aria-label="Main menu">
          <button
            type="button"
            className="sidebar-nav-item"
            onClick={() => navigateTo("/dashboard")}
          >
            <span className="sidebar-icon" aria-hidden="true">D</span>
            <span>Dashboard</span>
          </button>

          <button type="button" className="sidebar-nav-item" onClick={() => navigateTo("/products")}>
            <span className="sidebar-icon" aria-hidden="true">P</span>
            <span>Products</span>
          </button>

          <button type="button" className="sidebar-nav-item" onClick={() => navigateTo("/inventory")}>
            <span className="sidebar-icon" aria-hidden="true">I</span>
            <span>Inventory</span>
          </button>

          <button type="button" className="sidebar-nav-item" onClick={() => navigateTo("/sales")}>
            <span className="sidebar-icon" aria-hidden="true">S</span>
            <span>Sales</span>
          </button>

          <button type="button" className="sidebar-nav-item" onClick={() => navigateTo("/reports")}>
            <span className="sidebar-icon" aria-hidden="true">R</span>
            <span>Reports</span>
          </button>

          <button type="button" className="sidebar-nav-item" onClick={() => navigateTo("/expiry")}>
            <span className="sidebar-icon" aria-hidden="true">E</span>
            <span>Expiry</span>
          </button>

          <button
            type="button"
            className="sidebar-nav-item active"
            aria-current="page"
            onClick={() => navigateTo("/pricing")}
          >
            <span className="sidebar-icon" aria-hidden="true">₹</span>
            <span>Pricing</span>
          </button>

          <button type="button" className="sidebar-nav-item" onClick={() => navigateTo("/alerts")}>
            <span className="sidebar-icon" aria-hidden="true">A</span>
            <span>Alerts</span>
          </button>

          <button type="button" className="sidebar-nav-item" onClick={() => navigateTo("/profile")}>
            <span className="sidebar-icon" aria-hidden="true">U</span>
            <span>Profile</span>
          </button>
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-promo">
          <div className="promo-illustration" aria-hidden="true">
            <div className="promo-box box-one" />
            <div className="promo-box box-two" />
            <div className="promo-box box-three" />
            <div className="promo-chart">╱╲╱</div>
          </div>
          <h3>Manage your inventory smarter</h3>
          <p>Track products, stock, sales and pricing from one place.</p>
          <div className="promo-dots" aria-hidden="true">
            <span className="active" />
            <span />
            <span />
          </div>
        </div>
      </aside>

      <main className="dashboard-main pricing-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="menu-button"
              type="button"
              aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-controls="dashboard-navigation"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((open) => !open)}
            >
              {sidebarOpen ? "×" : "☰"}
            </button>
            <div><strong>Dynamic Pricing</strong></div>
          </div>

          <div className="header-right">
            <button
              type="button"
              className="header-logout"
              onClick={() => navigateTo("/dashboard")}
            >
              Dashboard
            </button>
          </div>
        </header>

        <div className="pricing-page">
          <div className="pricing-header">
            <div>
              <h1>Dynamic Pricing</h1>
              <p>
                Suggested discounts based on expiry proximity and stock
                conditions.
              </p>
            </div>

            <button
              className="pricing-refresh-button"
              onClick={loadSuggestions}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && <div className="pricing-message error" role="alert">{error}</div>}

          {successMessage && (
            <div className="pricing-message success" role="status">
              {successMessage}
            </div>
          )}

          {loading ? (
            <div className="pricing-empty">Loading pricing suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="pricing-empty">
              No pricing suggestions are available.
            </div>
          ) : (
            <div className="pricing-grid">
              {suggestions.map((item) => {
                const isExpired = item.status === "DO NOT SELL";
                const isApplying = applyingId === item.product_id;

                return (
                  <div className="pricing-card" key={item.product_id}>
                    <div className="pricing-card-header">
                      <div>
                        <h2>{item.product_name}</h2>
                        <span className="pricing-sku">SKU: {item.sku}</span>
                      </div>
                      <span className={getStatusClass(item.status)}>
                        {item.status}
                      </span>
                    </div>

                    <div className="pricing-details">
                      <div className="pricing-detail">
                        <span>Original Price</span>
                        <strong>{formatPrice(item.original_price)}</strong>
                      </div>
                      <div className="pricing-detail">
                        <span>Suggested Discount</span>
                        <strong>{Number(item.discount_percentage).toFixed(0)}%</strong>
                      </div>
                      <div className="pricing-detail">
                        <span>Suggested Price</span>
                        <strong className="suggested-price">
                          {formatPrice(item.suggested_price)}
                        </strong>
                      </div>
                      <div className="pricing-detail">
                        <span>Stock</span>
                        <strong>{item.stock_quantity}</strong>
                      </div>
                      <div className="pricing-detail">
                        <span>Days Remaining</span>
                        <strong>
                          {item.days_remaining === null
                            ? "No expiry"
                            : item.days_remaining < 0
                              ? "Expired"
                              : item.days_remaining}
                        </strong>
                      </div>
                      <div className="pricing-detail">
                        <span>Recent Stock-Outs</span>
                        <strong>{item.recent_stock_outs}</strong>
                      </div>
                    </div>

                    <div className="pricing-reason">
                      <strong>Reason:</strong> {item.reason}
                    </div>

                    {isExpired ? (
                      <div className="do-not-sell">
                        This product has expired and cannot be sold.
                      </div>
                    ) : (
                      <button
                        className="apply-discount-button"
                        onClick={() => handleApplyDiscount(item)}
                        disabled={isApplying}
                      >
                        {isApplying ? "Applying..." : "Apply Discount"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Pricing;
