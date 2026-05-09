// src/App.jsx
import { useState, useEffect } from "react";
import LoginScreen    from "./screens/LoginScreen";
import SignupScreen   from "./screens/SignupScreen";
import DashboardLayout from "./screens/DashboardLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./index.css";

function AppInner() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("login");
  const [prefillPhone, setPrefill] = useState("");
  
  // Listen for storage changes (for logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = localStorage.getItem('user');
      if (!currentUser && user) {
        setPage("login");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#f0f7e8",
        fontFamily: "Poppins, sans-serif", color: "#004E00", fontSize: 16,
      }}>
        🌾 Loading…
      </div>
    );
  }

  const handleNavigate = (destination, params = {}) => {
    if (params.phone) setPrefill(params.phone);
    else setPrefill("");
    setPage(destination);
  };

  // If user is logged in, show dashboard
  if (user) {
    return <DashboardLayout />;
  }

  if (page === "login") {
    return <LoginScreen onNavigate={handleNavigate} prefillPhone={prefillPhone} />;
  }

  if (page === "signup") {
    return <SignupScreen onNavigate={handleNavigate} />;
  }

  return <LoginScreen onNavigate={handleNavigate} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}