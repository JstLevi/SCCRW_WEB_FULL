import { useState } from "react";
import { registerUser } from "../services/authService";
import { mainLogo } from "../assets/images";

export default function SignupScreen({ onNavigate }) {
  const [form, setForm] = useState({
    name: "",
    contactNumber: "",
    province: "",
    municipality: "",
    barangay: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ separate toggles (same behavior as LoginScreen)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    const {
      name,
      contactNumber,
      province,
      municipality,
      barangay,
      password,
      confirmPassword,
    } = form;

    if (!name || !contactNumber || !province || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (contactNumber.length < 10) {
      setError("Please enter a valid contact number (at least 10 digits).");
      return;
    }

    setLoading(true);

    const registrationData = {
      username: contactNumber.trim(),
      password: password,
      full_name: name.trim(),
      contact_number: contactNumber.trim(),
      province: province.trim(),
      municipality: municipality.trim(),
      barangay: barangay.trim(),
    };

    const { error: regError } = await registerUser(registrationData);

    if (regError) {
      setError(regError);
      setLoading(false);
      return;
    }

    onNavigate("login", { phone: contactNumber.trim() });
    setLoading(false);
  };

  return (
    <div
      className="auth-root"
      style={{
        backgroundColor: "#dce5d2",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      <div
        className="auth-card"
        style={{ maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="auth-logo">
          <img
            src={mainLogo}
            alt="Scarecrow Logo"
            style={{
              width: 52,
              height: 52,
              objectFit: "contain",
              borderRadius: 12,
            }}
          />
          <div className="auth-logo-text">
            Scare<span>Crow</span>
          </div>
        </div>

        <h1 className="auth-title">SIGN UP</h1>
        <p className="auth-subtitle">Please fill in the details</p>

        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              placeholder="(eg., Juan Dela Cruz)"
              value={form.name}
              onChange={set("name")}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number *</label>
            <input
              className="form-input"
              type="tel"
              placeholder="(e.g., 09123456789)"
              value={form.contactNumber}
              onChange={set("contactNumber")}
              disabled={loading}
              required
            />
            {form.contactNumber.length > 0 && (
              <p className="form-hint">
                You'll use {form.contactNumber} to log in
              </p>
            )}
          </div>

          <div className="form-section-label">Address</div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Province *</label>
              <input
                className="form-input"
                placeholder="PROVINCE"
                value={form.province}
                onChange={set("province")}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Municipality / City</label>
              <input
                className="form-input"
                placeholder="(Optional)"
                value={form.municipality}
                onChange={set("municipality")}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Barangay</label>
            <input
              className="form-input"
              placeholder=" (Optional)"
              value={form.barangay}
              onChange={set("barangay")}
              disabled={loading}
            />
          </div>

          {/* CREATE PASSWORD */}
          <div className="form-group">
            <label className="form-label">Create Password *</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="CREATE PASSWORD (min. 6 characters)"
                value={form.password}
                onChange={set("password")}
                autoComplete="new-password"
                disabled={loading}
                required
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
              >
                {showPassword ? (
                  // eye-off
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  // eye
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="CONFIRM PASSWORD"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                autoComplete="new-password"
                disabled={loading}
                required
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
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
              >
                {showConfirmPassword ? (
                  // eye-off
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  // eye
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {form.confirmPassword &&
              form.password !== form.confirmPassword && (
                <p className="form-hint" style={{ color: "red" }}>
                  Passwords do not match
                </p>
              )}
          </div>

          {error && (
            <div className="error-box" style={{ marginTop: 16 }}>
              ⚠ {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "SIGN UP"}
          </button>
        </form>

        <div className="auth-footer-link">
          Already have an account?{" "}
          <button onClick={() => onNavigate("login")}>Log In</button>
        </div>
      </div>
    </div>
  );
}