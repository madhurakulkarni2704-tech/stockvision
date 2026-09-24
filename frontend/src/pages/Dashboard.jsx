import { useEffect, useState } from "react";
import { getMe, getProfile, logoutUser } from "../services/api";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUserData() {
      try {
        const userData = await getMe();
        const profileData = await getProfile();

        setUser(userData);
        setProfile(profileData);
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
      <div style={styles.center}>
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div>
          <h2 style={styles.logo}>StockVision</h2>
          <p style={styles.subtitle}>Inventory Management</p>
        </div>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </nav>

      <main style={styles.container}>
        <section style={styles.welcomeCard}>
          <div>
            <p style={styles.smallText}>Welcome back 👋</p>

            <h1 style={styles.heading}>
              {user?.username || "User"}
            </h1>

            <p style={styles.role}>
              Role: {profile?.role || "User"}
            </p>
          </div>
        </section>

        <section style={styles.cards}>
          <div style={styles.card}>
            <div style={styles.icon}>📦</div>
            <h3>Products</h3>
            <p>Manage your inventory and products.</p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>📊</div>
            <h3>Inventory</h3>
            <p>Monitor your current stock levels.</p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>👤</div>
            <h3>Profile</h3>
            <p>View and manage your account details.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ecfeff 100%)",
    fontFamily: "Arial, sans-serif",
  },

  navbar: {
    padding: "20px 40px",
    background: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },

  logo: {
    margin: 0,
    color: "#4f46e5",
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  logoutButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "10px",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  container: {
    padding: "40px",
    maxWidth: "1200px",
    margin: "auto",
  },

  welcomeCard: {
    padding: "35px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "white",
    boxShadow: "0 15px 35px rgba(79,70,229,0.25)",
  },

  smallText: {
    margin: 0,
    opacity: 0.85,
  },

  heading: {
    margin: "8px 0",
    fontSize: "36px",
  },

  role: {
    margin: 0,
    opacity: 0.9,
  },

  cards: {
    marginTop: "30px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "20px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  },

  icon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default Dashboard;