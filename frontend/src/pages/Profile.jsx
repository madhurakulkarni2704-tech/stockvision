
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/api";
import Sidebar from "../components/Sidebar";
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

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  };

  if (error) {
    return (
      <div className="profile-page">
        <Sidebar activePage="profile" />
        <main className="profile-main">
          <div className="profile-error-page">
            <div className="profile-error-box">
              <div className="profile-error-icon">!</div>
              <h2>{error}</h2>
              <button onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <Sidebar activePage="profile" />
        <main className="profile-main">
          <div className="profile-loading">
            <div className="profile-spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </main>
      </div>
    );
  }

  const username = profile.username || "User";
  const email = profile.email || "No email available";
  const role = profile.role || "USER";
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <Sidebar activePage="profile" />

      <div className="profile-main">
        <header className="profile-header">
          <div className="profile-header-left">
            <div className="profile-search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search anything..."
              />
            </div>
          </div>

          <div className="profile-header-right">
            <button
              className="profile-notification-button"
              aria-label="Notifications"
              onClick={() => navigate("/alerts")}
            >
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

              <span className="profile-header-arrow">▾</span>
            </div>

            <button
              className="profile-header-logout"
              onClick={handleLogout}
            >
              <span>↪</span>
              Logout
            </button>
          </div>
        </header>

        <main className="profile-content">
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

          <section className="profile-hero">
            <div className="profile-large-avatar">{initial}</div>

            <div className="profile-hero-info">
              <h2>{username}</h2>
              <p>{email}</p>

              <span className="profile-role-badge">
                <span></span>
                {role}
              </span>
            </div>
          </section>

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
                <div className="profile-status-icon">✓</div>

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

          <section className="profile-bottom-banner">
            <div className="profile-bottom-avatar">{initial}</div>

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
