import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail || "Invalid username or password."
        );
        setLoading(false);
        return;
      }

      // Store JWT tokens
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      setMessage("Login successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server.");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
      <section className="login-left">

        <div className="brand">
          <div className="brand-icon">
            SV
          </div>

          <span>StockVision</span>
        </div>

        <div className="hero-content">

          <div className="hero-badge">
            SMART INVENTORY MANAGEMENT
          </div>

          <h1>
            Manage your stock.
            <br />
            <span>Grow your business.</span>
          </h1>

          <p className="hero-description">
            Keep track of your inventory, monitor stock levels,
            and make smarter decisions with StockVision.
          </p>

          <div className="feature-list">

            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <strong>Real-time inventory</strong>
                <p>Know exactly what is in stock.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <strong>Simple management</strong>
                <p>Manage products from one place.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <strong>Better decisions</strong>
                <p>Turn inventory data into insights.</p>
              </div>
            </div>

          </div>

        </div>

        {/* Decorative inventory illustration */}
        <div className="inventory-illustration">

          <div className="floating-box box-one">
            📦
          </div>

          <div className="floating-box box-two">
            📦
          </div>

          <div className="dashboard-window">

            <div className="window-header">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="chart-area">

              <div className="chart-title">
                Inventory Overview
              </div>

              <div className="chart-bars">
                <div className="bar bar-one"></div>
                <div className="bar bar-two"></div>
                <div className="bar bar-three"></div>
                <div className="bar bar-four"></div>
                <div className="bar bar-five"></div>
                <div className="bar bar-six"></div>
              </div>

            </div>

          </div>

        </div>

        <div className="left-footer">
          © 2026 StockVision · Inventory Management
        </div>

      </section>


      {/* RIGHT SIDE */}
      <section className="login-right">

        <div className="login-card">

          <div className="mobile-brand">
            <div className="brand-icon small">
              SV
            </div>
            <span>StockVision</span>
          </div>

          <div className="login-header">

            <h2>Welcome back</h2>

            <p>
              Sign in to continue to your dashboard
            </p>

          </div>


          {/* Success message */}
          {message && (
            <div className="success-message">
              <span>✓</span>
              {message}
            </div>
          )}


          {/* Error message */}
          {error && (
            <div className="error-message">
              <span>!</span>
              {error}
            </div>
          )}


          <form onSubmit={handleLogin}>

            {/* Username */}
            <div className="form-group">

              <label htmlFor="username">
                Username
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  👤
                </span>

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  required
                  autoComplete="username"
                />

              </div>

            </div>


            {/* Password */}
            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  autoComplete="current-password"
                />

              </div>

            </div>


            {/* Login button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="button-arrow">→</span>
                </>
              )}

            </button>

          </form>


          {/* Register */}
          <div className="register-section">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>


          <div className="login-security">
            🔐 Your account is protected with secure authentication.
          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;