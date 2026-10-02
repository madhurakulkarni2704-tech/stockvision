import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAlerts,
  getMe,
  getProfile,
  logoutUser,
} from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUserData() {
      try {
        const userData = await getMe();
        const profileData = await getProfile();

        setUser(userData);
        setProfile(profileData);

        try {
          const unreadData = await getAlerts({
            read: "false",
          });

          setUnreadAlerts(unreadData.length);
        } catch (alertError) {
          console.error("Unable to load alerts:", alertError);
          setUnreadAlerts(0);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-box">
          <div className="error-icon">!</div>

          <h2>{error}</h2>

          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const username = user?.username || "User";
  const email = user?.email || "No email available";
  const role = profile?.role || "USER";

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            SV
          </div>

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
            onClick={() => navigate("/expiry")}
          >
            <span className="sidebar-icon">E</span>
            <span>Expiry</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => navigate("/alerts")}
          >
            <span className="sidebar-icon">A</span>
            <span>Alerts</span>

            {unreadAlerts > 0 && (
              <span className="sidebar-alert-badge">
                {unreadAlerts}
              </span>
            )}
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

            <div className="promo-chart">
              STOCK
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

          <div className="promo-dots">
            <span className="active"></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

        </div>

      </aside>


      {/* MAIN AREA */}

      <div className="dashboard-main">

        {/* TOP HEADER */}

        <header className="dashboard-header">

          <div className="header-left">

            <button className="menu-button">
              MENU
            </button>

            <div className="search-box">
              <span>Search</span>

              <input
                type="text"
                placeholder="Search anything..."
              />
            </div>

          </div>

          <div className="header-right">

            <button
              className="notification-button"
              onClick={() => navigate("/alerts")}
            >
              Alerts

              {unreadAlerts > 0 && (
                <span className="notification-badge">
                  {unreadAlerts}
                </span>
              )}

              {unreadAlerts > 0 && (
                <span className="notification-dot"></span>
              )}
            </button>

            <div className="header-divider"></div>

            <div className="header-user">

              <div className="header-avatar">
                {username.charAt(0).toUpperCase()}
              </div>

              <div className="header-user-info">
                <strong>{username}</strong>
                <span>{role}</span>
              </div>

              <span className="header-arrow">
                &gt;
              </span>

            </div>

            <button
              className="header-logout"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </header>


        {/* CONTENT */}

        <main className="dashboard-content">

          {/* Welcome */}

          <section className="dashboard-welcome">

            <div>

              <span className="welcome-label">
                DASHBOARD
              </span>

              <h1>
                Welcome back, <span>{username}!</span>
              </h1>

              <p>
                Here's an overview of your StockVision workspace.
              </p>

            </div>

            <div className="role-badge">
              <span className="role-dot"></span>
              {role}
            </div>

          </section>


          {/* STAT CARDS */}

          <section className="dashboard-stats">

            <div className="stat-card">

              <div className="stat-icon purple">
                P
              </div>

              <div>
                <p>Products</p>
                <h2>--</h2>
                <span>Coming soon</span>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon blue">
                I
              </div>

              <div>
                <p>Inventory</p>
                <h2>--</h2>
                <span>Coming soon</span>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon orange">
                !
              </div>

              <div>
                <p>Low Stock</p>
                <h2>--</h2>
                <span>Coming soon</span>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon green">
                OK
              </div>

              <div>
                <p>Account</p>
                <h2>Active</h2>
                <span>Your account is active</span>
              </div>

            </div>

          </section>


          {/* MAIN GRID */}

          <section className="dashboard-grid">

            {/* Inventory Overview */}

            <div className="dashboard-panel overview-panel">

              <div className="panel-header">

                <div>

                  <div className="panel-title-row">

                    <span className="panel-icon">
                      DATA
                    </span>

                    <h2>
                      Inventory Overview
                    </h2>

                  </div>

                  <p>
                    Your inventory analytics will appear here.
                  </p>

                </div>

                <button className="period-button">
                  Last 7 days
                  <span>DATE</span>
                </button>

              </div>


              <div className="empty-chart">

                <div className="chart-placeholder">

                  <div className="chart-circle">
                    DATA
                  </div>

                  <h3>
                    Inventory analytics
                  </h3>

                  <p>
                    Product and stock data will be displayed
                    here once inventory management is available.
                  </p>

                </div>

              </div>

            </div>


            {/* Quick Actions */}

            <div className="dashboard-panel">

              <div className="panel-header">

                <div>

                  <div className="panel-title-row">

                    <span className="panel-icon">
                      GO
                    </span>

                    <h2>
                      Quick Actions
                    </h2>

                  </div>

                  <p>
                    Access your main workspace areas.
                  </p>

                </div>

              </div>


              <div className="quick-actions">

                <button
                  className="quick-action"
                  onClick={() => navigate("/products")}
                >

                  <div className="quick-icon purple-bg">
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

                  <div className="quick-icon blue-bg">
                    I
                  </div>

                  <div>
                    <strong>Inventory</strong>
                    <span>Monitor stock levels</span>
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
                    <span>Monitor product expiry</span>
                  </div>

                  <b>&gt;</b>

                </button>


                <button
                  className="quick-action"
                  onClick={() => navigate("/alerts")}
                >

                  <div className="quick-icon orange-bg">
                    A
                  </div>

                  <div>
                    <strong>Alerts</strong>
                    <span>
                      {unreadAlerts > 0
                        ? `${unreadAlerts} unread alert${unreadAlerts === 1 ? "" : "s"}`
                        : "View notifications"}
                    </span>
                  </div>

                  <b>&gt;</b>

                </button>


                <button
                  className="quick-action"
                  onClick={() => navigate("/profile")}
                >

                  <div className="quick-icon green-bg">
                    U
                  </div>

                  <div>
                    <strong>My Profile</strong>
                    <span>View account details</span>
                  </div>

                  <b>&gt;</b>

                </button>

              </div>

            </div>

          </section>


          {/* ACCOUNT BANNER */}

          <section className="account-banner">

            <div className="account-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="account-info">

              <h3>
                {username}
              </h3>

              <p>
                {email}
              </p>

            </div>

            <div className="account-role">

              <span>
                ACCOUNT ROLE
              </span>

              <strong>
                {role}
              </strong>

            </div>

            <button
              className="view-profile-button"
              onClick={() => navigate("/profile")}
            >
              View Profile &gt;
            </button>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;