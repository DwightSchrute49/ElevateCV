import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../auth.scss";
import OAuthButton from "../components/OAuthButton";

const apiBaseUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const startOAuthLogin = (provider) => {
    window.location.href = `${apiBaseUrl}/api/auth/oauth/${provider}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API call to backend login endpoint
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in request
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store user info if remember me is checked
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Send authenticated users to the dashboard view
      navigate("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div
            className="error-message"
            style={{ marginBottom: "20px", color: "#ff6b6b" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          <div className="divider-line"></div>
          <div className="divider-text">Or continue with</div>
          <div className="divider-line"></div>
        </div>

        <div className="social-auth">
          <OAuthButton
            provider="google"
            onClick={() => startOAuthLogin("google")}
          />
          <OAuthButton
            provider="github"
            onClick={() => startOAuthLogin("github")}
          />
        </div>

        <p className="oauth-note">
          OAuth 2.0 sign-in uses your deployed backend session.
        </p>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
