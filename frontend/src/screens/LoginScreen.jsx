// src/screens/LoginScreen.jsx
import { useState, useEffect } from "react";
import { loginUser } from "../services/authService";
import { fbIcon, gmailIcon, mainLogo } from "../assets/images";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ onNavigate, prefillPhone }) {
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (prefillPhone) setUsername(prefillPhone);
  }, [prefillPhone]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    
    const { data, error: loginError } = await loginUser(username.trim(), password);
    
    if (loginError) {
      setError(loginError);
      setLoading(false);
      return;
    }
    
    if (data && data.user) {
      setUser(data.user);
      setLoading(false);
      onNavigate("home");
    } else {
      setError("Login succeeded but no user data received.");
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-root"
      style={{ 
        backgroundColor: "#dce5d2",
        backgroundSize: "cover", 
        backgroundPosition: "center top" 
      }}
    >
      <div className="auth-card">
        <div className="auth-logo">
          <img 
            src={mainLogo} 
            alt="Scarecrow Logo" 
            style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 12 }} 
          />
          <div className="auth-logo-text">Scare<span>Crow</span></div>
        </div>

        <h1 className="auth-title">LOG IN NOW</h1>
        <p className="auth-subtitle">
          Please log in to your account to continue using our app
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">PHONE NUMBER</label>
            <input
              className="form-input"
              type="text"
              placeholder="(eg., 09067541234)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                  color: "#6b7c61",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // Eye-off icon (password visible → click to hide)
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  // Eye icon (password hidden → click to show)
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-box" style={{ animation: "none", opacity: 1 }}>
              {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Logging in…" : "LOG IN"}
          </button>
        </form>

        <div className="auth-footer-link">
          Don't have an account?{" "}
          <button onClick={() => onNavigate("signup")}>Sign Up</button>
        </div>

        <div className="social-section">
          <p className="social-divider">or continue with</p>
          <div className="social-buttons">
            <button className="social-btn" onClick={() => alert("Facebook login coming soon!")}>
              <img src={fbIcon} alt="Facebook" style={{ width: 20, height: 20, objectFit: "contain" }} />
            </button>
            <button className="social-btn" onClick={() => alert("Google login coming soon!")}>
              <img src={gmailIcon} alt="Google" style={{ width: 20, height: 20, objectFit: "contain" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}