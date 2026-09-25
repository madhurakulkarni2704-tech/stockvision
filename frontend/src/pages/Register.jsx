import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SHOPKEEPER");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.username?.[0] ||
            data.email?.[0] ||
            data.password?.[0] ||
            data.role?.[0] ||
            "Registration failed."
        );

        setLoading(false);
        return;
      }

      setMessage("Registration successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server.");
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* =====================================
          LEFT SIDE
          ===================================== */}

      <section className="register-left">

        <div className="register-brand">
          <div className="register-brand-icon">
            SV
          </div>

          <span>StockVision</span>
        </div>

        <div className="register-hero">

          <div className="register-badge">
            GET STARTED WITH STOCKVISION
          </div>

          <h1>
            Take control of
            <br />
            <span>your inventory.</span>
          </h1>

          <p>
            Create your StockVision account and start managing
            products, inventory, and your business from one
            simple platform.
          </p>

          <div className="register-features">

            <div className="register-feature">
              <div className="register-feature-icon">
                ✓
              </div>

              <div>
                <strong>Easy setup</strong>
                <p>Create your account in minutes.</p>
              </div>
            </div>

            <div className="register-feature">
              <div className="register-feature-icon">
                ✓
              </div>

              <div>
                <strong>Inventory visibility</strong>
                <p>Keep your stock information organized.</p>
              </div>
            </div>

            <div className="register-feature">
              <div className="register-feature-icon">
                ✓
              </div>

              <div>
                <strong>Built for your role</strong>
                <p>Access features based on your account role.</p>
              </div>
            </div>

          </div>

        </div>

        {/* Decorative boxes */}

        <div className="register-illustration">

          <div className="register-box register-box-one">
            📦
          </div>

          <div className="register-box register-box-two">
            📊
          </div>

          <div className="register-box register-box-three">
            ✓
          </div>

          <div className="register-platform">

            <div className="platform-line"></div>
            <div className="platform-line short"></div>
            <div className="platform-line"></div>

          </div>

        </div>

        <div className="register-footer">
          © 2026 StockVision · Inventory Management
        </div>

      </section>


      {/* =====================================
          RIGHT SIDE
          ===================================== */}

      <section className="register-right">

        <div className="register-card">

          {/* Mobile logo */}

          <div className="register-mobile-brand">

            <div className="register-brand-icon small">
              SV
            </div>

            <span>StockVision</span>

          </div>


          {/* Header */}

          <div className="register-header">

            <h2>Create your account</h2>

            <p>
              Start managing your inventory today
            </p>

          </div>


          {/* Success */}

          {message && (
            <div className="register-success">
              <span>✓</span>
              {message}
            </div>
          )}


          {/* Error */}

          {error && (
            <div className="register-error">
              <span>!</span>
              {error}
            </div>
          )}


          <form onSubmit={handleRegister}>

            {/* Username */}

            <div className="register-form-group">

              <label htmlFor="register-username">
                Username
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  👤
                </span>

                <input
                  id="register-username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  required
                  autoComplete="username"
                />

              </div>

            </div>


            {/* Email */}

            <div className="register-form-group">

              <label htmlFor="register-email">
                Email
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  ✉
                </span>

                <input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  autoComplete="email"
                />

              </div>

            </div>


            {/* Password */}

            <div className="register-form-group">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  🔒
                </span>

                <input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  autoComplete="new-password"
                />

              </div>

            </div>


            {/* Role */}

            <div className="register-form-group">

              <label htmlFor="register-role">
                Account Role
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  ◉
                </span>

                <select
                  id="register-role"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  required
                >
                  <option value="SHOPKEEPER">
                    Shopkeeper
                  </option>

                  <option value="ADMIN">
                    Admin
                  </option>
                </select>

              </div>

              <p className="role-help">
                Choose the role that matches your account.
              </p>

            </div>


            {/* Submit */}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="register-spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="register-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>


          {/* Login */}

          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
            </Link>

          </div>


          <div className="register-security">
            🔐 Your account is protected with secure authentication.
          </div>

        </div>

      </section>

    </div>
  );
}

export default Register;