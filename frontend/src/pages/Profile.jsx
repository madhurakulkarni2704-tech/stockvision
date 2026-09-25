import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/api";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load profile.");
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return (
      <div className="profile-error-page">
        <div className="profile-error-box">
          <div className="profile-error-icon">!</div>
          <h2>{error}</h2>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  const username = profile.username || "User";
  const email = profile.email || "No email available";
  const role = profile.role || "USER";
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="profile-page">

      {/* SIDEBAR */}
      <aside className="profile-sidebar">

        <div className="profile-sidebar-brand">
          <div className="profile-sidebar-logo">
            SV
          </div>

          <div>
            <h2>StockVision</h2>
            <span>Inventory Management</span>
          </div>
        </div>

        <nav className="profile-sidebar-navigation">

          <button
            className="profile-nav-item"
            onClick={() => navigate("/dashboard")}
          >
            <span className="profile-nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            className="profile-nav-item"
            onClick={() => navigate("/products")}
          >
            <span className="profile-nav-icon">▣</span>
            <span>Products</span>
          </button>

          <button
            className="profile-nav-item"
            onClick={() => navigate("/inventory")}
          >
            <span className="profile-nav-icon">▤</span>
            <span>Inventory</span>
          </button>

          <button className="profile-nav-item active">
            <span className="profile-nav-icon">♙</span>
            <span>Profile</span>
          </button>

        </nav>

        <div className="profile-sidebar-divider"></div>

        <div className="profile-sidebar-promo">

          <div className="profile-promo-illustration">
            <div className="profile-promo-box box-one"></div>
            <div className="profile-promo-box box-two"></div>
            <div className="profile-promo-box box-three"></div>
            <div className="profile-promo-chart">▂▅▇</div>
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

          <div className="profile-promo-dots">
            <span className="active"></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

        </div>

      </aside>


      {/* MAIN */}
      <div className="profile-main">

        {/* HEADER */}
        <header className="profile-header">

          <div className="profile-header-left">

            <button className="profile-menu-button">
              ☰
            </button>

            <div className="profile-search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search anything..."
              />
            </div>

          </div>


          <div className="profile-header-right">

            <button className="profile-notification-button">
              ♧
              <span className="profile-notification-dot"></span>
            </button>

            <div className="profile-header-divider"></div>

            <div className="profile-header-user">

              <div className="profile-header-avatar">
                {initial}
              </div>

              <div className="profile-header-user-info">
                <strong>{username}</strong>
                <span>{role}</span>
              </div>

              <span className="profile-header-arrow">
                ▾
              </span>

            </div>

            <button
              className="profile-header-logout"
              onClick={() => {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                window.location.href = "/login";
              }}
            >
              <span>↪</span>
              Logout
            </button>

          </div>

        </header>


        {/* CONTENT */}
        <main className="profile-content">

          {/* PAGE HEADING */}
          <section className="profile-page-heading">

            <div>
              <span className="profile-heading-label">
                ACCOUNT SETTINGS
              </span>

              <h1>My Profile</h1>

              <p>
                View and manage your StockVision account information.
              </p>
            </div>

          </section>


          {/* PROFILE HERO */}
          <section className="profile-hero">

            <div className="profile-large-avatar">
              {initial}
            </div>

            <div className="profile-hero-info">

              <h2>{username}</h2>

              <p>{email}</p>

              <span className="profile-role-badge">
                <span></span>
                {role}
              </span>

            </div>

          </section>


          {/* PROFILE DETAILS */}
          <section className="profile-details-grid">

            <div className="profile-details-card">

              <div className="profile-card-heading">
                <div className="profile-card-icon purple">
                  👤
                </div>

                <div>
                  <h2>Personal Information</h2>
                  <p>Your account information</p>
                </div>
              </div>


              <div className="profile-information-list">

                <div className="profile-information-row">
                  <span>Username</span>
                  <strong>{username}</strong>
                </div>

                <div className="profile-information-row">
                  <span>Email Address</span>
                  <strong>{email}</strong>
                </div>

                <div className="profile-information-row">
                  <span>Account Role</span>
                  <strong>{role}</strong>
                </div>

              </div>

            </div>


            <div className="profile-details-card">

              <div className="profile-card-heading">
                <div className="profile-card-icon green">
                  ✓
                </div>

                <div>
                  <h2>Account Status</h2>
                  <p>Your StockVision account</p>
                </div>
              </div>


              <div className="profile-status-box">

                <div className="profile-status-icon">
                  ✓
                </div>

                <div>
                  <strong>Account Active</strong>

                  <p>
                    Your account is active and ready to use.
                  </p>
                </div>

              </div>


              <div className="profile-account-role">

                <span>ACCOUNT ROLE</span>

                <strong>{role}</strong>

              </div>

            </div>

          </section>


          {/* BOTTOM ACTION */}
          <section className="profile-bottom-banner">

            <div className="profile-bottom-avatar">
              {initial}
            </div>

            <div className="profile-bottom-info">
              <h3>{username}</h3>
              <p>{email}</p>
            </div>

            <button
              className="profile-dashboard-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Profile;