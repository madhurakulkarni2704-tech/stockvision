import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSalesReport,
  getInventoryReport,
  getExpiryReport,
  getLowStockReport,
  getDiscountReport,
  downloadSalesReport,
  getProducts,
} from "../services/api";
import "./Reports.css";

const REPORTS = [
  { id: "sales", label: "Sales", description: "Sales transactions and revenue" },
  { id: "inventory", label: "Inventory", description: "Current inventory levels" },
  { id: "expiry", label: "Expiry", description: "Products with expiry dates" },
  { id: "low-stock", label: "Low Stock", description: "Items at or below their threshold" },
  { id: "discount", label: "Discounts", description: "Applied product discounts" },
];

const EMPTY_FILTERS = {
  start_date: "",
  end_date: "",
  product_id: "",
};

const MONEY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatMoney(value) {
  const number = Number(value);
  return MONEY.format(Number.isFinite(number) ? number : 0);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRows(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.report)) return response.report;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

function getProductOptions(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.products)) return response.products;
  return [];
}

function ReportTable({ columns, rows, emptyMessage }) {
  if (!rows.length) {
    return (
      <div className="report-empty">
        <span className="report-empty-icon">✓</span>
        <h3>No records found</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="report-table-wrap">
      <table className="report-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? `${row.product_id ?? "row"}-${index}`}>
              {columns.map((column, columnIndex) => (
                <td key={`${column.key}-${columnIndex}`}>
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Reports() {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState("sales");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      const response = await getProducts();
      setProducts(getProductOptions(response));
    } catch {
      setProducts([]);
    }
  }, []);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const requestFilters = {
        product_id: appliedFilters.product_id,
      };

      let response;

      if (activeReport === "sales") {
        response = await getSalesReport({
          ...requestFilters,
          start_date: appliedFilters.start_date,
          end_date: appliedFilters.end_date,
        });
        setSummary(response?.summary ?? {});
      } else if (activeReport === "inventory") {
        response = await getInventoryReport(requestFilters);
        setSummary({});
      } else if (activeReport === "expiry") {
        response = await getExpiryReport(requestFilters);
        setSummary({});
      } else if (activeReport === "low-stock") {
        response = await getLowStockReport(requestFilters);
        setSummary({});
      } else {
        response = await getDiscountReport(requestFilters);
        setSummary({});
      }

      setReportData(getRows(response));
    } catch (requestError) {
      setReportData([]);
      setSummary({});
      setError(
        requestError?.message ||
          "Unable to load this report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [activeReport, appliedFilters]);

  useEffect(() => {
    void Promise.resolve().then(() => loadProducts());
  }, [loadProducts]);

  useEffect(() => {
    void Promise.resolve().then(() => loadReport());
  }, [loadReport]);

  const columns = useMemo(() => {
    switch (activeReport) {
      case "sales":
        return [
          { key: "date", label: "Date", render: formatDate },
          { key: "product", label: "Product" },
          { key: "quantity", label: "Quantity" },
          { key: "selling_price", label: "Selling price", render: formatMoney },
          { key: "total_amount", label: "Total amount", render: formatMoney },
        ];
      case "inventory":
        return [
          { key: "product", label: "Product" },
          { key: "sku", label: "SKU" },
          { key: "quantity", label: "Available quantity" },
          { key: "low_stock_threshold", label: "Low-stock threshold" },
          { key: "updated_at", label: "Last updated", render: formatDate },
        ];
      case "expiry":
        return [
          { key: "product", label: "Product" },
          { key: "sku", label: "SKU" },
          { key: "expiry_date", label: "Expiry date", render: formatDate },
          {
            key: "status",
            label: "Status",
            render: (value) => (
              <span className="report-status">{value || "—"}</span>
            ),
          },
        ];
      case "low-stock":
        return [
          { key: "product", label: "Product" },
          { key: "sku", label: "SKU" },
          { key: "quantity", label: "Current quantity" },
          { key: "low_stock_threshold", label: "Minimum threshold" },
          {
            key: "stock_status",
            label: "Stock status",
            render: () => (
              <span className="report-status report-status-warning">
                Low stock
              </span>
            ),
          },
        ];
      default:
        return [
          { key: "product", label: "Product" },
          { key: "sku", label: "SKU" },
          {
            key: "discount_percentage",
            label: "Discount",
            render: (value) => `${value ?? 0}%`,
          },
          {
            key: "discounted_price",
            label: "Discounted price",
            render: formatMoney,
          },
          {
            key: "is_applied",
            label: "Status",
            render: (value) => (
              <span
                className={`report-status ${
                  value ? "report-status-success" : ""
                }`}
              >
                {value ? "Applied" : "Not applied"}
              </span>
            ),
          },
        ];
    }
  }, [activeReport]);

  const activeDetails = REPORTS.find((item) => item.id === activeReport);
  const isSales = activeReport === "sales";

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();

    if (
      filters.start_date &&
      filters.end_date &&
      filters.start_date > filters.end_date
    ) {
      setError("Start date must be on or before the end date.");
      return;
    }

    setAppliedFilters({ ...filters });
  }

  function resetFilters() {
    setFilters({ ...EMPTY_FILTERS });
    setAppliedFilters({ ...EMPTY_FILTERS });
  }

  async function handleExport(format) {
    setExporting(format);
    setError("");

    try {
      await downloadSalesReport(format, {
        start_date: appliedFilters.start_date,
        end_date: appliedFilters.end_date,
        product_id: appliedFilters.product_id,
      });
    } catch (exportError) {
      setError(
        exportError?.message || `Unable to export ${format.toUpperCase()}.`
      );
    } finally {
      setExporting("");
    }
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  }

  const totalSales = Number(summary.total_sales ?? 0);
  const totalQuantity = Number(summary.total_quantity ?? 0);
  const totalAmount = Number(summary.total_amount ?? 0);

  return (
    <div className="reports-layout">
      <aside className="reports-sidebar">
        <div className="reports-brand">
          <span className="reports-brand-mark">S</span>
          <span>StockVision</span>
        </div>

        <div className="reports-nav-label">WORKSPACE</div>
        <nav className="reports-nav">
          {[
            { label: "Dashboard", path: "/dashboard", icon: "⌂" },
            { label: "Products", path: "/products", icon: "▦" },
            { label: "Inventory", path: "/inventory", icon: "▤" },
            { label: "Sales", path: "/sales", icon: "↗" },
            { label: "Reports", path: "/reports", icon: "▥" },
            { label: "Profile", path: "/profile", icon: "◉" },
          ].map((item) => (
            <button
              type="button"
              key={item.path}
              className={`reports-nav-item ${
                item.path === "/reports" ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="reports-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="reports-sidebar-bottom">
          <div className="reports-help">
            <span className="reports-help-icon">?</span>
            <div>
              <strong>Need help?</strong>
              <p>Manage your stock with confidence.</p>
            </div>
          </div>
          <button type="button" className="reports-logout" onClick={logout}>
            <span>↪</span> Log out
          </button>
        </div>
      </aside>

      <main className="reports-main">
        <header className="reports-topbar">
          <div className="reports-breadcrumb">
            Workspace <span>/</span> Reports
          </div>
          <div className="reports-topbar-right">
            <span className="reports-live-dot" />
            <span>Inventory insights</span>
            <div className="reports-avatar">SV</div>
          </div>
        </header>

        <section className="reports-content">
          <div className="reports-heading-row">
            <div>
              <div className="reports-eyebrow">ANALYTICS &amp; INSIGHTS</div>
              <h1>Reports</h1>
              <p className="reports-subtitle">
                Understand sales performance, inventory health, and product
                pricing.
              </p>
            </div>
            <div className="reports-heading-icon">▥</div>
          </div>

          <div
            className="reports-tabs"
            role="tablist"
            aria-label="Report type"
          >
            {REPORTS.map((report) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeReport === report.id}
                key={report.id}
                className={`reports-tab ${
                  activeReport === report.id ? "active" : ""
                }`}
                onClick={() => setActiveReport(report.id)}
              >
                {report.label}
              </button>
            ))}
          </div>

          <section className="reports-section-intro">
            <div>
              <h2>{activeDetails?.label} report</h2>
              <p>{activeDetails?.description}</p>
            </div>
            <span className="reports-record-count">
              {reportData.length}{" "}
              {reportData.length === 1 ? "record" : "records"}
            </span>
          </section>

          <form className="reports-filters" onSubmit={applyFilters}>
            {isSales && (
              <>
                <label>
                  Start date
                  <input
                    type="date"
                    value={filters.start_date}
                    max={filters.end_date || undefined}
                    onChange={(event) =>
                      updateFilter("start_date", event.target.value)
                    }
                  />
                </label>
                <label>
                  End date
                  <input
                    type="date"
                    value={filters.end_date}
                    min={filters.start_date || undefined}
                    onChange={(event) =>
                      updateFilter("end_date", event.target.value)
                    }
                  />
                </label>
              </>
            )}

            <label className="reports-product-filter">
              Product
              <select
                value={filters.product_id}
                onChange={(event) =>
                  updateFilter("product_id", event.target.value)
                }
              >
                <option value="">All products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name ||
                      product.product_name ||
                      `Product ${product.id}`}
                  </option>
                ))}
              </select>
            </label>

            <div className="reports-filter-actions">
              <button
                className="reports-button reports-button-primary"
                type="submit"
              >
                Apply filters
              </button>
              <button
                className="reports-button reports-button-secondary"
                type="button"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
          </form>

          {isSales && (
            <div className="reports-summary-grid">
              <article className="reports-summary-card">
                <div className="reports-summary-top">
                  <span>Total revenue</span>
                  <span className="reports-summary-icon revenue">₹</span>
                </div>
                <strong>{formatMoney(totalAmount)}</strong>
                <p>Revenue for the selected filters</p>
              </article>

              <article className="reports-summary-card">
                <div className="reports-summary-top">
                  <span>Transactions</span>
                  <span className="reports-summary-icon transactions">↗</span>
                </div>
                <strong>{totalSales.toLocaleString("en-IN")}</strong>
                <p>Total recorded sales</p>
              </article>

              <article className="reports-summary-card">
                <div className="reports-summary-top">
                  <span>Units sold</span>
                  <span className="reports-summary-icon units">▤</span>
                </div>
                <strong>{totalQuantity.toLocaleString("en-IN")}</strong>
                <p>Units across matching sales</p>
              </article>
            </div>
          )}

          <section className="reports-data-card">
            <div className="reports-data-card-header">
              <div>
                <h2>{activeDetails?.label} data</h2>
                <p>Results from your StockVision workspace</p>
              </div>

              {isSales && (
                <div className="reports-export-actions">
                  <button
                    type="button"
                    className="reports-button reports-button-export"
                    disabled={Boolean(exporting)}
                    onClick={() => handleExport("csv")}
                  >
                    {exporting === "csv" ? "Preparing…" : "↓ CSV"}
                  </button>
                  <button
                    type="button"
                    className="reports-button reports-button-export"
                    disabled={Boolean(exporting)}
                    onClick={() => handleExport("excel")}
                  >
                    {exporting === "excel" ? "Preparing…" : "↓ Excel"}
                  </button>
                  <button
                    type="button"
                    className="reports-button reports-button-export"
                    disabled={Boolean(exporting)}
                    onClick={() => handleExport("pdf")}
                  >
                    {exporting === "pdf" ? "Preparing…" : "↓ PDF"}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="reports-error" role="alert">
                <span>{error}</span>
                <button type="button" onClick={loadReport}>
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="reports-loading">
                <span className="reports-spinner" /> Loading report…
              </div>
            ) : (
              <ReportTable
                columns={columns}
                rows={reportData}
                emptyMessage="Try changing your filters or select another report."
              />
            )}

            <div className="reports-data-footer">
              <span>
                Showing {loading ? "…" : reportData.length} records
              </span>
              <span>Data updates when you apply filters</span>
            </div>
          </section>

          <footer className="reports-footer">
            <span>StockVision Reports</span>
            <span>Inventory clarity, at a glance.</span>
          </footer>
        </section>
      </main>
    </div>
  );
}