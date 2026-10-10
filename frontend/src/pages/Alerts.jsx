import { useCallback, useEffect, useState } from "react";
import {
  dismissAlert,
  getAlerts,
  markAlertAsRead,
} from "../services/api";
import "./Alerts.css";

const ALERT_TYPES = [
  "ALL",
  "LOW STOCK",
  "OUT OF STOCK",
  "EXPIRING SOON",
  "EXPIRED",
  "DISCOUNT REQUIRED",
];

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [readFilter, setReadFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const filters = {};

      if (readFilter === "READ") {
        filters.read = "true";
      } else if (readFilter === "UNREAD") {
        filters.read = "false";
      }

      if (filter !== "ALL") {
        filters.type = filter;
      }

      const data = await getAlerts(filters);
      setAlerts(data);
    } catch (err) {
      setError(err.message || "Unable to load alerts.");
    } finally {
      setLoading(false);
    }
  }, [filter, readFilter]);

  useEffect(() => {
    const task = Promise.resolve().then(() => loadAlerts());

    return () => {
      void task;
    };
  }, [loadAlerts]);

  const handleMarkRead = async (id) => {
    try {
      await markAlertAsRead(id);

      setAlerts((currentAlerts) =>
        currentAlerts.map((alert) =>
          alert.id === id ? { ...alert, is_read: true } : alert
        )
      );
    } catch (err) {
      setError(err.message || "Unable to mark alert as read.");
    }
  };

  const handleDismiss = async (id) => {
    try {
      await dismissAlert(id);

      setAlerts((currentAlerts) =>
        currentAlerts.filter((alert) => alert.id !== id)
      );
    } catch (err) {
      setError(err.message || "Unable to dismiss alert.");
    }
  };

  const unreadCount = alerts.filter((alert) => !alert.is_read).length;

  return (
    <div className="alerts-page">
      <div className="alerts-container">
        <div className="alerts-header">
          <div>
            <span className="alerts-label">NOTIFICATIONS</span>
            <h1>Alerts</h1>
            <p>Monitor stock, expiry, and product-related alerts.</p>
          </div>

          <div className="alerts-summary">
            <strong>{unreadCount}</strong>
            <span>Unread</span>
          </div>
        </div>

        <div className="alerts-controls">
          <div className="alert-type-filters">
            {ALERT_TYPES.map((type) => (
              <button
                key={type}
                className={`alert-filter-button ${
                  filter === type ? "active" : ""
                }`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="alert-read-filter">
            <button
              className={readFilter === "ALL" ? "active" : ""}
              onClick={() => setReadFilter("ALL")}
            >
              All
            </button>

            <button
              className={readFilter === "UNREAD" ? "active" : ""}
              onClick={() => setReadFilter("UNREAD")}
            >
              Unread
            </button>

            <button
              className={readFilter === "READ" ? "active" : ""}
              onClick={() => setReadFilter("READ")}
            >
              Read
            </button>
          </div>
        </div>

        {error && <div className="alerts-error">{error}</div>}

        {loading ? (
          <div className="alerts-state">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="alerts-empty">
            <div className="alerts-empty-icon">✓</div>
            <h2>No alerts found</h2>
            <p>There are no alerts matching the selected filters.</p>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`alert-card ${
                  alert.is_read ? "read" : "unread"
                }`}
              >
                <div className="alert-card-indicator"></div>

                <div className="alert-card-content">
                  <div className="alert-card-top">
                    <span className="alert-type">{alert.alert_type}</span>

                    {!alert.is_read && (
                      <span className="unread-badge">UNREAD</span>
                    )}
                  </div>

                  <h3>{alert.product_name}</h3>
                  <p>{alert.message}</p>

                  <span className="alert-product-sku">
                    SKU: {alert.product_sku}
                  </span>
                </div>

                <div className="alert-card-actions">
                  {!alert.is_read && (
                    <button
                      className="alert-read-button"
                      onClick={() => handleMarkRead(alert.id)}
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    className="alert-dismiss-button"
                    onClick={() => handleDismiss(alert.id)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Alerts;