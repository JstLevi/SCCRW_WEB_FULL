// src/screens/SettingsScreen.jsx
// SAME UI as original. supabase.auth.signOut() → clearTokens() + onLogout()

import { useState } from "react";
import Icon from "../components/Icon";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function SettingsScreen({ onLogout }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    setLoading(true);
    // Clear JWT tokens from localStorage (replaces supabase.auth.signOut())
    logoutUser();
    onLogout();
    setLoading(false);
  };

  const settingsItems = [
    { icon: "person", label: "Account"        },
    { icon: "bell",   label: "Notifications"  },
    { icon: "lock",   label: "Privacy"        },
    { icon: "help",   label: "Help & Support" },
  ];

  return (
    <>
      {/* ── User Info Card ── */}
      {user && (
        <div className="info-card" style={{ marginBottom: 20 }}>
          <div className="info-row">
            <div className="info-col">
              <div style={{
                width: 46, height: 46, borderRadius: "50%",
                background: "#004E00", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#c8e890", fontWeight: 700, fontSize: 18,
                flexShrink: 0,
              }}>
                {user.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <div className="info-value">{user.username}</div>
                <div className="info-label">{user.email || "Farm Owner"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Options ── */}
      <div className="section-card">
        {settingsItems.map((item, i) => (
          <div key={i} className="settings-row">
            <div className="settings-icon">
              <Icon name={item.icon} size={18} color="#004E00" />
            </div>
            <span className="settings-label">{item.label}</span>
            <Icon name="chevron" size={18} color="#808080" />
          </div>
        ))}
      </div>

      {/* ── Log Out Button ── */}
      <button
        className="action-btn outline"
        onClick={handleLogout}
        disabled={loading}
        style={{ marginTop: 8 }}
      >
        <Icon name="logout" size={18} color="#1a3a0d" />
        {loading ? "Logging out…" : "Log Out"}
      </button>
    </>
  );
}
