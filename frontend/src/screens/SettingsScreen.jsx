// src/screens/SettingsScreen.jsx
// SAME UI as original. supabase.auth.signOut() → clearTokens() + onLogout()

import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";

export default function SettingsScreen() {
  const { user } = useAuth();


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
      
    </>
  );
}
