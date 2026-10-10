import "./Dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getAlerts,
  getDashboard,
  getMe,
  getProfile,
  logoutUser,
} from "../services/api";


/* =========================================================
   HELPERS
   ========================================================= */

function formatCurrency(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
}


function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}


function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}


function formatMonth(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}


/* FIX: /me (the logged-in user) is checked first, then profile. */
function getDisplayName(user, profile) {
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    user?.username ||
    user?.name ||
    fullName ||
    profile?.user?.username ||
    profile?.username ||
    profile?.name ||
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "User"
  );
}


/* FIX: same (user, profile) order as getDisplayName. */
function getEmail(user, profile) {
  return user?.email || profile?.email || profile?.user?.email || "";
}


function safeArray(value) {
  return Array.isArray(value) ? value : [];
}


/* =========================================================
   COLORS
   ========================================================= */

const COLORS = {
  primary: "#6657d9",
  blue: "#3b82f6",
  green: "#16a34a",
  red: "#dc2626",
  orange: "#f59e0b",
  purple: "#8b5cf6",
  pink: "#db2777",
  teal: "#0d9488",
  cyan: "#0891b2",
  gray: "#64748b",
};


const EXPIRY_COLORS = {
  SAFE: COLORS.green,
  "EXPIRING SOON": COLORS.orange,
  EXPIRED: COLORS.red,
};


/* =========================================================
   CUSTOM TOOLTIP
   ========================================================= */

function SalesTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "10px 12px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#374151",
        }}
      >
        {label}
      </p>

      {payload.map((entry, index) => (
        <p
          key={index}
          style={{
            margin: "3px 0",
            fontSize: "11px",
            color: entry.color || "#374151",
          }}
        >
          {entry.name}:{" "}
          {entry.name === "Revenue" || entry.name === "Sales"
            ? formatCurrency(entry.value)
            : formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [analyticsPeriod, setAnalyticsPeriod] = useState("7");
  const [filterLoading, setFilterLoading] = useState(false);


  /* =======================================================
     LOAD USER + PROFILE + ALERTS
     ======================================================= */

  useEffect(() => {
    async function loadUserData() {
      /* FIX: allSettled, so one failing request (e.g. alerts or profile)
         can no longer stop /me from being saved. */
      const [meResult, profileResult, alertsResult] =
        await Promise.allSettled([getMe(), getProfile(), getAlerts()]);

      if (meResult.status === "fulfilled") {
        const meData = meResult.value;
        console.log("ME RESPONSE:", meData);
        setUser(meData?.user || meData?.data || meData);
      } else {
        console.error("getMe failed:", meResult.reason);
      }

      if (profileResult.status === "fulfilled") {
        const profileData = profileResult.value;
        console.log("PROFILE RESPONSE:", profileData);
        setProfile(profileData?.data || profileData);
      } else {
        console.error("getProfile failed:", profileResult.reason);
      }

      if (alertsResult.status === "fulfilled") {
        const alertsData = alertsResult.value;

        if (Array.isArray(alertsData)) {
          setAlerts(alertsData);
        } else if (Array.isArray(alertsData?.results)) {
          setAlerts(alertsData.results);
        } else {
          setAlerts([]);
        }
      } else {
        console.error("getAlerts failed:", alertsResult.reason);
      }
    }

    loadUserData();
  }, []);


  /* =======================================================
     LOAD DASHBOARD
     ======================================================= */

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (analyticsPeriod === "7") {
          setLoading(true);
        } else {
          setFilterLoading(true);
        }

        const data = await getDashboard(analyticsPeriod);

        setDashboard(data);
        setDashboardError("");
      } catch (error) {
        console.error("Dashboard analytics loading error:", error);

        setDashboardError(
          error?.message || "Unable to load dashboard analytics."
        );
      } finally {
        setLoading(false);
        setFilterLoading(false);
      }
    }

    loadDashboard();
  }, [analyticsPeriod]);


  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      navigate("/login");
    }
  };


  /* =======================================================
     DATA
     ======================================================= */

  /* FIX: argument order now matches the function signatures. */
  const displayName = getDisplayName(user, profile);
  const email = getEmail(user, profile);

  const statistics = dashboard?.statistics || {};
  const charts = dashboard?.charts || {};

  const dailySales = safeArray(charts.daily_sales);
  const weeklySales = safeArray(charts.weekly_sales);
  const monthlySales = safeArray(charts.monthly_sales);
  const productSales = safeArray(charts.product_sales);
  const stockTrends = safeArray(charts.stock_trends);
  const expiryTrends = safeArray(charts.expiry_trends);
  const discountUsage = safeArray(charts.discount_usage);


  /* =======================================================
     FILTER LABEL
     ======================================================= */

  const periodLabels = {
    "7": "Last 7 days",
    "30": "Last 30 days",
    "90": "Last 90 days",
    "365": "Last 365 days",
    all: "All available data",
  };


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="dashboard-page">


      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">S</div>

          <div>
            <h2>StockVision</h2>
            <span>Inventory Management</span>
          </div>

        </div>


        <nav className="sidebar-navigation">

          <button
            className="sidebar-nav-item active"
            onClick={() => navigate("/dashboard")}
          >
            <span className="sidebar-icon">D</span>
            <span>Dashboard</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => navigate("/products")}
          >
            <span className="sidebar-icon">P</span>
            <span>Products</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => navigate("/inventory")}
          >
            <span className="sidebar-icon">I</span>
            <span>Inventory</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => navigate("/sales")}
          >
            <span className="sidebar-icon">S</span>
            <span>Sales</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => navigate("/reports")}
          >
            <span className="sidebar-icon">R</span>
            <span>Reports</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => navigate("/expiry")}
          >
            <span className="sidebar-icon">E</span>
            <span>Expiry</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => navigate("/pricing")}
          >
            <span className="sidebar-icon">₹</span>
            <span>Pricing</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => navigate("/alerts")}
          >
            <span className="sidebar-icon">A</span>
            <span>Alerts</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => navigate("/profile")}
          >
            <span className="sidebar-icon">U</span>
            <span>Profile</span>
          </button>

        </nav>


        <div className="sidebar-divider"></div>


        <div className="sidebar-promo">

          <div className="promo-illustration">
            <div className="promo-box box-one"></div>
            <div className="promo-box box-two"></div>
            <div className="promo-box box-three"></div>
            <div className="promo-chart">╱╲╱</div>
          </div>

          <h3>Manage your inventory smarter</h3>

          <p>Track products, stock, sales and pricing from one place.</p>

          <div className="promo-dots">
            <span className="active"></span>
            <span></span>
            <span></span>
          </div>

        </div>

      </aside>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="dashboard-main">


        {/* ===================================================
            HEADER
            =================================================== */}

        <header className="dashboard-header">

          <div className="header-left">

            <button className="menu-button" type="button">
              ☰
            </button>

            <div>
              <strong>Dashboard</strong>
            </div>

          </div>


          <div className="header-right">

            <button
              className="notification-button"
              type="button"
              onClick={() => navigate("/alerts")}
            >
              ♧
              {alerts.length > 0 && (
                <span className="notification-dot"></span>
              )}
            </button>


            <div className="header-divider"></div>


            <div
              className="header-user"
              onClick={() => navigate("/profile")}
            >

              <div className="header-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="header-user-info">
                <strong>{displayName}</strong>
                <span>{email}</span>
              </div>

              <span className="header-arrow">⌄</span>

            </div>


            <button className="header-logout" onClick={handleLogout}>
              ↪
              <span>Logout</span>
            </button>

          </div>

        </header>


        {/* ===================================================
            CONTENT
            =================================================== */}

        <div className="dashboard-content">


          {/* =================================================
              WELCOME
              ================================================= */}

          <section className="dashboard-welcome">

            <div>

              <span className="welcome-label">
                INVENTORY MANAGEMENT
              </span>

              <h1>
                Good to see you, <span>{displayName}!</span>
              </h1>

              <p>
                Manage your products, inventory, sales and pricing from one
                place.
              </p>

            </div>

            <div className="role-badge">
              <span className="role-dot"></span>
              Inventory Manager
            </div>

          </section>


          {/* =================================================
              STATISTICS
              ================================================= */}

          <section className="dashboard-stats">

            <div className="stat-card">
              <div className="stat-icon purple">P</div>
              <div>
                <p>Total Products</p>
                <h2>{formatNumber(statistics.total_products)}</h2>
                <span>All products</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">I</div>
              <div>
                <p>Total Stock</p>
                <h2>{formatNumber(statistics.total_stock)}</h2>
                <span>Units available</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">L</div>
              <div>
                <p>Low Stock</p>
                <h2>{formatNumber(statistics.low_stock_items)}</h2>
                <span>Need attention</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">₹</div>
              <div>
                <p>Today's Sales</p>
                <h2>{formatCurrency(statistics.todays_sales)}</h2>
                <span>Today's revenue</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">E</div>
              <div>
                <p>Expiring Soon</p>
                <h2>{formatNumber(statistics.expiring_soon)}</h2>
                <span>Within 7 days</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon red">X</div>
              <div>
                <p>Expired Products</p>
                <h2>{formatNumber(statistics.expired_products)}</h2>
                <span>Expired items</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">₹</div>
              <div>
                <p>Total Sales</p>
                <h2>{formatCurrency(statistics.total_sales)}</h2>
                <span>Overall revenue</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">%</div>
              <div>
                <p>Active Discounts</p>
                <h2>{formatNumber(statistics.active_discounts)}</h2>
                <span>Active promotions</span>
              </div>
            </div>

          </section>


          {/* =================================================
              FILTER
              ================================================= */}

          <section className="dashboard-panel dashboard-filter-panel">

            <div className="dashboard-filter-content">

              <div>

                <span className="filter-label">ANALYTICS PERIOD</span>

                <h2>Dashboard Analytics</h2>

                <p>View sales and stock trends for a selected period.</p>

              </div>

              <div className="dashboard-filter-control">

                <select
                  value={analyticsPeriod}
                  onChange={(event) =>
                    setAnalyticsPeriod(event.target.value)
                  }
                  disabled={filterLoading}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last 365 days</option>
                  <option value="all">All Time</option>
                </select>

                {filterLoading && (
                  <span className="dashboard-filter-loading">
                    Updating...
                  </span>
                )}

              </div>

            </div>

            <div className="dashboard-filter-summary">

              Showing: <strong>{periodLabels[analyticsPeriod]}</strong>

              {dashboard?.filters?.start_date &&
                dashboard?.filters?.end_date && (
                  <>
                    {" "}
                    ({dashboard.filters.start_date}
                    {" → "}
                    {dashboard.filters.end_date})
                  </>
                )}

            </div>

          </section>


          {/* =================================================
              ERROR
              ================================================= */}

          {dashboardError && (
            <section className="dashboard-panel dashboard-error-panel">

              <div className="error-box">

                <div className="error-icon">!</div>

                <div>
                  <h3>Dashboard analytics unavailable</h3>
                  <p>{dashboardError}</p>
                </div>

              </div>

            </section>
          )}


          {/* =================================================
              DAILY SALES
              ================================================= */}

          <section className="dashboard-panel">

            <div className="panel-header">
              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">₹</span>
                  <h2>Daily Sales</h2>
                </div>
                <p>Sales performance for the selected period</p>
              </div>
            </div>

            <div className="analytics-chart daily-sales-recharts">

              {dailySales.length === 0 ? (

                <div className="dashboard-empty-state">
                  No sales recorded for this period.
                </div>

              ) : (

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart
                    data={dailySales}
                    margin={{ top: 15, right: 20, left: 5, bottom: 5 }}
                  >

                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis dataKey="date" tickFormatter={formatDate} />

                    <YAxis tickFormatter={(value) => `₹${value}`} />

                    <Tooltip content={<SalesTooltip />} />

                    <Bar
                      dataKey="total"
                      name="Sales"
                      fill={COLORS.primary}
                      radius={[5, 5, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              )}

            </div>

          </section>


          {/* =================================================
              WEEKLY + MONTHLY
              ================================================= */}

          <section className="dashboard-grid dashboard-module8-two-column">


            {/* WEEKLY */}

            <div className="dashboard-panel">

              <div className="panel-header">
                <div>
                  <div className="panel-title-row">
                    <span className="panel-icon">W</span>
                    <h2>Weekly Sales</h2>
                  </div>
                  <p>Weekly sales performance</p>
                </div>
              </div>

              <div className="analytics-chart">

                {weeklySales.length === 0 ? (

                  <div className="dashboard-empty-state">
                    No weekly sales data.
                  </div>

                ) : (

                  <ResponsiveContainer width="100%" height="100%">

                    <BarChart
                      data={weeklySales}
                      margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                    >

                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis dataKey="week" tickFormatter={formatDate} />

                      <YAxis tickFormatter={(value) => `₹${value}`} />

                      <Tooltip content={<SalesTooltip />} />

                      <Bar
                        dataKey="total"
                        name="Sales"
                        fill={COLORS.blue}
                        radius={[5, 5, 0, 0]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                )}

              </div>

            </div>


            {/* MONTHLY */}

            <div className="dashboard-panel">

              <div className="panel-header">
                <div>
                  <div className="panel-title-row">
                    <span className="panel-icon">M</span>
                    <h2>Monthly Sales</h2>
                  </div>
                  <p>Monthly sales performance</p>
                </div>
              </div>

              <div className="analytics-chart">

                {monthlySales.length === 0 ? (

                  <div className="dashboard-empty-state">
                    No monthly sales data.
                  </div>

                ) : (

                  <ResponsiveContainer width="100%" height="100%">

                    <LineChart
                      data={monthlySales}
                      margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                    >

                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis dataKey="month" tickFormatter={formatMonth} />

                      <YAxis tickFormatter={(value) => `₹${value}`} />

                      <Tooltip content={<SalesTooltip />} />

                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Sales"
                        stroke={COLORS.green}
                        strokeWidth={3}
                        dot={{ r: 4, fill: COLORS.green }}
                        activeDot={{ r: 6 }}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                )}

              </div>

            </div>

          </section>


          {/* =================================================
              PRODUCT SALES
              ================================================= */}

          <section className="dashboard-panel">

            <div className="panel-header">

              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">P</span>
                  <h2>Product Sales</h2>
                </div>
                <p>Sales performance by product</p>
              </div>

              <button
                className="view-profile-button"
                onClick={() => navigate("/sales")}
              >
                View Sales
              </button>

            </div>

            <div className="analytics-chart product-sales-chart">

              {productSales.length === 0 ? (

                <div className="dashboard-empty-state">
                  No product sales recorded yet.
                </div>

              ) : (

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart
                    data={productSales}
                    margin={{ top: 15, right: 20, left: 5, bottom: 45 }}
                  >

                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis
                      dataKey="product_name"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                    />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="quantity"
                      name="Quantity Sold"
                      fill={COLORS.orange}
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="total"
                      name="Revenue"
                      fill={COLORS.blue}
                      radius={[4, 4, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              )}

            </div>

          </section>


          {/* =================================================
              STOCK TRENDS
              ================================================= */}

          <section className="dashboard-panel">

            <div className="panel-header">
              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">I</span>
                  <h2>Stock Trends</h2>
                </div>
                <p>Stock movement for the selected period</p>
              </div>
            </div>

            <div className="analytics-chart">

              {stockTrends.length === 0 ? (

                <div className="dashboard-empty-state">
                  No stock movement recorded for this period.
                </div>

              ) : (

                <ResponsiveContainer width="100%" height="100%">

                  <LineChart
                    data={stockTrends}
                    margin={{ top: 15, right: 20, left: 5, bottom: 5 }}
                  >

                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis dataKey="date" tickFormatter={formatDate} />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="stock_in"
                      name="Stock In"
                      stroke={COLORS.green}
                      strokeWidth={3}
                      dot={{ r: 4, fill: COLORS.green }}
                    />

                    <Line
                      type="monotone"
                      dataKey="stock_out"
                      name="Stock Out"
                      stroke={COLORS.red}
                      strokeWidth={3}
                      dot={{ r: 4, fill: COLORS.red }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              )}

            </div>

          </section>


          {/* =================================================
              EXPIRY + DISCOUNT
              ================================================= */}

          <section className="dashboard-grid dashboard-module8-two-column">


            {/* EXPIRY */}

            <div className="dashboard-panel">

              <div className="panel-header">

                <div>
                  <div className="panel-title-row">
                    <span className="panel-icon">E</span>
                    <h2>Expiry Overview</h2>
                  </div>
                  <p>Product expiry status</p>
                </div>

                <button
                  className="view-profile-button"
                  onClick={() => navigate("/expiry")}
                >
                  View Expiry
                </button>

              </div>

              <div className="analytics-chart expiry-chart-area">

                {expiryTrends.length === 0 ? (

                  <div className="dashboard-empty-state">
                    No expiry information available.
                  </div>

                ) : (

                  <ResponsiveContainer width="100%" height="100%">

                    <PieChart>

                      <Pie
                        data={expiryTrends}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="48%"
                        outerRadius={82}
                        innerRadius={42}
                        paddingAngle={3}
                      >

                        {expiryTrends.map((entry, index) => (
                          <Cell
                            key={`expiry-${index}`}
                            fill={
                              EXPIRY_COLORS[entry.status] ||
                              [COLORS.green, COLORS.orange, COLORS.red][
                                index % 3
                              ]
                            }
                          />
                        ))}

                      </Pie>

                      <Tooltip />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                )}

              </div>

              <div className="expiry-mini-stats">

                {expiryTrends.map((item) => (
                  <div className="expiry-mini-stat" key={item.status}>
                    <span>{item.status}</span>
                    <strong>{formatNumber(item.count)}</strong>
                  </div>
                ))}

              </div>

            </div>


            {/* DISCOUNT */}

            <div className="dashboard-panel">

              <div className="panel-header">

                <div>
                  <div className="panel-title-row">
                    <span className="panel-icon">%</span>
                    <h2>Discount Usage</h2>
                  </div>
                  <p>Configured product discounts</p>
                </div>

                <button
                  className="view-profile-button"
                  onClick={() => navigate("/pricing")}
                >
                  View Pricing
                </button>

              </div>

              <div className="analytics-chart discount-chart">

                {discountUsage.length === 0 ? (

                  <div className="dashboard-empty-state">
                    No discounts configured.
                  </div>

                ) : (

                  <ResponsiveContainer width="100%" height="100%">

                    <BarChart
                      data={discountUsage}
                      margin={{ top: 15, right: 15, left: 0, bottom: 10 }}
                    >

                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis
                        dataKey="discount_percentage"
                        tickFormatter={(value) => `${value}%`}
                      />

                      <YAxis />

                      <Tooltip />

                      <Bar
                        dataKey="product_count"
                        name="Products"
                        fill={COLORS.purple}
                        radius={[5, 5, 0, 0]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                )}

              </div>

              {discountUsage.length > 0 && (
                <div className="discount-list">

                  {discountUsage.slice(0, 5).map((item, index) => (
                    <div
                      className="discount-row"
                      key={`${item.discount_percentage}-${index}`}
                    >

                      <div>
                        <strong>{item.discount_percentage}%</strong>
                        <span>
                          {item.is_applied ? "Active" : "Not applied"}
                        </span>
                      </div>

                      <span>
                        {formatNumber(item.product_count)} products
                      </span>

                    </div>
                  ))}

                </div>
              )}

            </div>

          </section>


          {/* =================================================
              LOW STOCK TABLE
              ================================================= */}

          <section className="dashboard-panel dashboard-table-panel">

            <div className="panel-header">

              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">L</span>
                  <h2>Low Stock Items</h2>
                </div>
                <p>Products that need stock attention</p>
              </div>

              <button
                className="view-profile-button"
                onClick={() => navigate("/inventory")}
              >
                View Inventory
              </button>

            </div>

            {safeArray(dashboard?.tables?.low_stock).length === 0 ? (

              <div className="dashboard-empty-state">
                No low stock items.
              </div>

            ) : (

              <div className="dashboard-table-wrapper">

                <table className="dashboard-table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Quantity</th>
                      <th>Threshold</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {safeArray(dashboard?.tables?.low_stock).map(
                      (item, index) => (
                        <tr key={item.id || item.product_id || index}>

                          <td>{item.product_name || item.name || "-"}</td>

                          <td>{item.sku || "-"}</td>

                          <td>{formatNumber(item.quantity)}</td>

                          <td>
                            {formatNumber(
                              item.low_stock_threshold ?? item.threshold
                            )}
                          </td>

                          <td>Low Stock</td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>


          {/* =================================================
              EXPIRING SOON TABLE
              ================================================= */}

          <section className="dashboard-panel dashboard-table-panel">

            <div className="panel-header">

              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">E</span>
                  <h2>Expiring Soon</h2>
                </div>
                <p>Products approaching expiry</p>
              </div>

              <button
                className="view-profile-button"
                onClick={() => navigate("/expiry")}
              >
                View Expiry
              </button>

            </div>

            {safeArray(dashboard?.tables?.expiring_soon).length === 0 ? (

              <div className="dashboard-empty-state">
                No products are expiring soon.
              </div>

            ) : (

              <div className="dashboard-table-wrapper">

                <table className="dashboard-table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Expiry Date</th>
                      <th>Days Remaining</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {safeArray(dashboard?.tables?.expiring_soon).map(
                      (item, index) => (
                        <tr key={item.id || item.product_id || index}>

                          <td>{item.product_name || item.name || "-"}</td>

                          <td>{item.sku || "-"}</td>

                          <td>{formatDate(item.expiry_date)}</td>

                          <td>{formatNumber(item.days_remaining)}</td>

                          <td>Expiring Soon</td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>


          {/* =================================================
              RECENT SALES
              ================================================= */}

          <section className="dashboard-panel dashboard-table-panel">

            <div className="panel-header">

              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">₹</span>
                  <h2>Recent Sales</h2>
                </div>
                <p>Latest recorded sales</p>
              </div>

              <button
                className="view-profile-button"
                onClick={() => navigate("/sales")}
              >
                View Sales
              </button>

            </div>

            {safeArray(dashboard?.tables?.recent_sales).length === 0 ? (

              <div className="dashboard-empty-state">
                No recent sales recorded.
              </div>

            ) : (

              <div className="dashboard-table-wrapper">

                <table className="dashboard-table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Selling Price</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>

                    {safeArray(dashboard?.tables?.recent_sales).map(
                      (item, index) => (
                        <tr key={item.id || index}>

                          <td>
                            {item.product_name || item.product || "-"}
                          </td>

                          <td>{formatNumber(item.quantity)}</td>

                          <td>{formatCurrency(item.selling_price)}</td>

                          <td>
                            {formatCurrency(
                              item.total_amount ?? item.total
                            )}
                          </td>

                          <td>
                            {formatDate(item.sale_date || item.created_at)}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>


          {/* =================================================
              ACCOUNT BANNER
              ================================================= */}

          <section className="account-banner">

            <div className="account-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="account-info">
              <h3>{displayName}</h3>
              <p>{email || "Manage your StockVision account"}</p>
            </div>

            <div className="account-role">
              <span>ACCOUNT</span>
              <strong>Active</strong>
            </div>

            <button
              className="view-profile-button"
              onClick={() => navigate("/profile")}
            >
              View Profile
            </button>

          </section>


          {/* =================================================
              RECENT ALERTS
              ================================================= */}

          <section className="dashboard-panel">

            <div className="panel-header">

              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">!</span>
                  <h2>Recent Alerts</h2>
                </div>
                <p>Stay updated with important inventory notifications.</p>
              </div>

              <button
                className="view-profile-button"
                onClick={() => navigate("/alerts")}
              >
                View All
              </button>

            </div>

            {alerts.length === 0 ? (

              <div className="dashboard-empty-state">

                <div className="chart-placeholder">

                  <div className="chart-circle">✓</div>

                  <h3>No active alerts</h3>

                  <p>Your inventory currently has no important alerts.</p>

                </div>

              </div>

            ) : (

              <div className="quick-actions">

                {alerts.slice(0, 5).map((alert, index) => (
                  <div className="quick-action" key={alert.id || index}>

                    <div className="quick-icon orange-bg">!</div>

                    <div>

                      <strong>
                        {alert.title ||
                          alert.message ||
                          alert.alert_type ||
                          "Inventory Alert"}
                      </strong>

                      <span>
                        {alert.message &&
                        alert.title &&
                        alert.message !== alert.title
                          ? alert.message
                          : "View inventory alert details"}
                      </span>

                    </div>

                  </div>
                ))}

              </div>

            )}

          </section>


        </div>

      </main>

    </div>
  );
}


export default Dashboard;
