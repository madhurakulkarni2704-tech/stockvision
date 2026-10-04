import { useEffect, useState } from "react";
import {
  getPricingSuggestions,
  applyPricingDiscount,
} from "../services/api";
import "./Pricing.css";

function Pricing() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPricingSuggestions();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load pricing suggestions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleApplyDiscount = async (item) => {
    try {
      setApplyingId(item.product_id);
      setError("");
      setSuccessMessage("");

      /*
       * The apply endpoint works on an existing Pricing record.
       * Create the pricing record first when one does not already exist.
       */
      const response = await fetch(
        `http://127.0.0.1:8000/api/pricing/`,
        {
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
        }
      );

      let pricingRecord;

      if (response.ok) {
        pricingRecord = await response.json();
      } else if (response.status === 400) {
        /*
         * A Pricing record may already exist because product has a
         * OneToOne relationship with Pricing.
         */
        const existingResponse = await fetch(
          `http://127.0.0.1:8000/api/pricing/`,
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
          throw new Error(
            "Unable to create or find the pricing record."
          );
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
    if (price === null || price === undefined) {
      return "—";
    }

    return `₹${Number(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusClass = (status) => {
    if (status === "DO NOT SELL") {
      return "pricing-status danger";
    }

    if (status === "ACTIVE") {
      return "pricing-status active";
    }

    return "pricing-status normal";
  };

  return (
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

      {error && (
        <div className="pricing-message error">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="pricing-message success">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="pricing-empty">
          Loading pricing suggestions...
        </div>
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
              <div
                className="pricing-card"
                key={item.product_id}
              >
                <div className="pricing-card-header">
                  <div>
                    <h2>{item.product_name}</h2>
                    <span className="pricing-sku">
                      SKU: {item.sku}
                    </span>
                  </div>

                  <span className={getStatusClass(item.status)}>
                    {item.status}
                  </span>
                </div>

                <div className="pricing-details">
                  <div className="pricing-detail">
                    <span>Original Price</span>
                    <strong>
                      {formatPrice(item.original_price)}
                    </strong>
                  </div>

                  <div className="pricing-detail">
                    <span>Suggested Discount</span>
                    <strong>
                      {Number(item.discount_percentage).toFixed(0)}%
                    </strong>
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
  );
}

export default Pricing;