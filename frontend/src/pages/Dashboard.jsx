import "./Dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAlerts,
  getMe,
  getProfile,
  logoutUser,
} from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [meData, profileData, alertsData] = await Promise.all([
          getMe(),
          getProfile(),
          getAlerts(),
        ]);

        setUser(meData);
        setProfile(profileData);
        setAlerts(Array.isArray(alertsData) ? alertsData : []);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

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

  const displayName =
    profile?.full_name ||
    profile?.name ||
    user?.username ||
    user?.email ||
    "User";

  const email = profile?.email || user?.email || "";

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* =========================================
          SIDEBAR
          ========================================= */}

      <aside className="dashboard-sidebar">

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            S
          </div>

          <div>
            <h2>StockVision</h2>
            <span>Inventory Management</span>
          </div>
        </div>

        {/* Navigation */}
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

          {/* Sales */}
          <button
            className="sidebar-nav-item"
            onClick={() => navigate("/sales")}
          >
            <span className="sidebar-icon">S</span>
            <span>Sales</span>
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

        {/* Sidebar Promo */}
        <div className="sidebar-promo">

          <div className="promo-illustration">
            <div className="promo-box box-one"></div>
            <div className="promo-box box-two"></div>
            <div className="promo-box box-three"></div>

            <div className="promo-chart">
              ╱╲╱
            </div>
          </div>

          <h3>
            Manage your inventory smarter
          </h3>

          <p>
            Track products, stock, sales and pricing from one place.
          </p>

          <div className="promo-dots">
            <span className="active"></span>
            <span></span>
            <span></span>
          </div>

        </div>

      </aside>


      {/* =========================================
          MAIN AREA
          ========================================= */}

      <main className="dashboard-main">

        {/* Header */}
        <header className="dashboard-header">

          <div className="header-left">

            <button
              className="menu-button"
              type="button"
            >
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

            <div className="header-user">

              <div className="header-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="header-user-info">
                <strong>{displayName}</strong>
                <span>{email}</span>
              </div>

              <span className="header-arrow">⌄</span>

            </div>

            <button
              className="header-logout"
              onClick={handleLogout}
            >
              ↪
              Logout
            </button>

          </div>

        </header>


        {/* Main Content */}
        <div className="dashboard-content">

          {/* =========================================
              WELCOME
              ========================================= */}

          <section className="dashboard-welcome">

            <div>

              <span className="welcome-label">
                INVENTORY MANAGEMENT
              </span>

              <h1>
                Good to see you,{" "}
                <span>{displayName}!</span>
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


          {/* =========================================
              STATS
              ========================================= */}

          <section className="dashboard-stats">

            <div className="stat-card">

              <div className="stat-icon purple">
                P
              </div>

              <div>
                <p>Products</p>
                <h2>—</h2>
                <span>Manage products</span>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon blue">
                I
              </div>

              <div>
                <p>Inventory</p>
                <h2>—</h2>
                <span>Track stock levels</span>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon orange">
                S
              </div>

              <div>
                <p>Sales</p>
                <h2>—</h2>
                <span>Record product sales</span>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon green">
                A
              </div>

              <div>
                <p>Active Alerts</p>
                <h2>{alerts.length}</h2>
                <span>Inventory notifications</span>
              </div>

            </div>

          </section>


          {/* =========================================
              MAIN GRID
              ========================================= */}

          <section className="dashboard-grid">

            {/* Overview */}
            <div className="dashboard-panel">

              <div className="panel-header">

                <div>

                  <div className="panel-title-row">
                    <span className="panel-icon">◈</span>

                    <h2>Inventory Overview</h2>
                  </div>

                  <p>
                    Monitor your inventory activity
                  </p>

                </div>

                <button
                  className="period-button"
                  type="button"
                >
                  This Month
                  <span>⌄</span>
                </button>

              </div>


              <div className="empty-chart">

                <div className="chart-placeholder">

                  <div className="chart-circle">
                    ◌
                  </div>

                  <h3>
                    Inventory analytics
                  </h3>

                  <p>
                    Inventory charts and analytics will appear here as your
                    inventory data grows.
                  </p>

                </div>

              </div>

            </div>


            {/* Quick Actions */}
            <div className="dashboard-panel">

              <div className="panel-header">

                <div>

                  <div className="panel-title-row">
                    <span className="panel-icon">⚡</span>

                    <h2>Quick Actions</h2>
                  </div>

                  <p>
                    Access your most-used tools
                  </p>

                </div>

              </div>


              <div className="quick-actions">

                <button
                  className="quick-action"
                  onClick={() => navigate("/products")}
                >
                  <div className="quick-icon blue-bg">
                    P
                  </div>

                  <div>
                    <strong>Products</strong>
                    <span>Manage your products</span>
                  </div>

                  <b>&gt;</b>
                </button>


                <button
                  className="quick-action"
                  onClick={() => navigate("/inventory")}
                >
                  <div className="quick-icon green-bg">
                    I
                  </div>

                  <div>
                    <strong>Inventory</strong>
                    <span>Track stock levels</span>
                  </div>

                  <b>&gt;</b>
                </button>


                {/* Sales */}
                <button
                  className="quick-action"
                  onClick={() => navigate("/sales")}
                >
                  <div className="quick-icon purple-bg">
                    S
                  </div>

                  <div>
                    <strong>Sales</strong>
                    <span>Record product sales</span>
                  </div>

                  <b>&gt;</b>
                </button>


                <button
                  className="quick-action"
                  onClick={() => navigate("/expiry")}
                >
                  <div className="quick-icon orange-bg">
                    E
                  </div>

                  <div>
                    <strong>Expiry</strong>
                    <span>Monitor expiry dates</span>
                  </div>

                  <b>&gt;</b>
                </button>


                <button
                  className="quick-action"
                  onClick={() => navigate("/pricing")}
                >
                  <div className="quick-icon yellow-bg">
                    ₹
                  </div>

                  <div>
                    <strong>Pricing</strong>
                    <span>Manage dynamic pricing</span>
                  </div>

                  <b>&gt;</b>
                </button>


                <button
                  className="quick-action"
                  onClick={() => navigate("/alerts")}
                >
                  <div className="quick-icon red-bg">
                    A
                  </div>

                  <div>
                    <strong>Alerts</strong>
                    <span>View inventory alerts</span>
                  </div>

                  <b>&gt;</b>
                </button>


                <button
                  className="quick-action"
                  onClick={() => navigate("/profile")}
                >
                  <div className="quick-icon gray-bg">
                    U
                  </div>

                  <div>
                    <strong>My Profile</strong>
                    <span>View your profile</span>
                  </div>

                  <b>&gt;</b>
                </button>

              </div>

            </div>

          </section>


          {/* =========================================
              ACCOUNT BANNER
              ========================================= */}

          <section className="account-banner">

            <div className="account-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="account-info">

              <h3>
                {displayName}
              </h3>

              <p>
                {email || "Manage your StockVision account"}
              </p>

            </div>

            <div className="account-role">

              <span>ACCOUNT</span>

              <strong>
                Active
              </strong>

            </div>

            <button
              className="view-profile-button"
              onClick={() => navigate("/profile")}
            >
              View Profile
            </button>

          </section>


          {/* =========================================
              RECENT ALERTS
              ========================================= */}

          <section className="dashboard-panel">

            <div className="panel-header">

              <div>

                <div className="panel-title-row">
                  <span className="panel-icon">!</span>

                  <h2>Recent Alerts</h2>
                </div>

                <p>
                  Stay updated with important inventory notifications.
                </p>

              </div>

              <button
                className="view-profile-button"
                onClick={() => navigate("/alerts")}
              >
                View All
              </button>

            </div>


            {alerts.length === 0 ? (

              <div className="empty-chart">

                <div className="chart-placeholder">

                  <div className="chart-circle">
                    ✓
                  </div>

                  <h3>
                    No active alerts
                  </h3>

                  <p>
                    Your inventory currently has no important alerts.
                  </p>

                </div>

              </div>

            ) : (

              <div className="quick-actions">

                {alerts.slice(0, 5).map((alert, index) => (

                  <div
                    className="quick-action"
                    key={alert.id || index}
                  >

                    <div className="quick-icon orange-bg">
                      !
                    </div>

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

                    </div>s

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