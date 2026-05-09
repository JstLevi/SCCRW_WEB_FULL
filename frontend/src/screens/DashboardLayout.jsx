// src/screens/DashboardLayout.jsx
// SAME UI as original. userName now comes from AuthContext (real Django user).

import { useState, useRef } from "react";
import Icon from "../components/Icon";
import { mainLogo } from "../assets/images";
import HomeScreen from "./HomeScreen";
import LiveScreen from "./LiveScreen";
import LogsScreen from "./LogsScreen";
import SettingsScreen from "./SettingsScreen";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { id: "home", label: "Home", icon: "home", topbarSub: "Welcome back" },
  { id: "live", label: "Live Feed", icon: "video", topbarSub: "Monitor your scarecrows in real-time" },
  { id: "logs", label: "Activity Logs", icon: "logs", topbarSub: "Device history and events" },
  { id: "settings", label: "Settings", icon: "settings", topbarSub: "Manage your account & preferences" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth(); // Get logout directly from context
  const [activeTab, setActiveTab] = useState("home");
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Refs to trigger functions in child components
  const homeScreenRef = useRef();
  const liveScreenRef = useRef();
  const logsScreenRef = useRef();

  // Prioritize full_name over username
  const userName = user?.full_name || user?.username || "Farm Owner";
  const currentTab = TABS.find((t) => t.id === activeTab);
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  function renderScreen() {
    switch (activeTab) {
      case "home":
        return <HomeScreen ref={homeScreenRef} />;
      case "live":
        return <LiveScreen ref={liveScreenRef} />;
      case "logs":
        return <LogsScreen ref={logsScreenRef} />;
      case "settings":
        return <SettingsScreen />;
      default:
        return <HomeScreen ref={homeScreenRef} />;
    }
  }

  // Add Device Handler
  const handleAddDevice = () => {
    setShowAddDeviceModal(true);
  };

  const handleCloseAddDeviceModal = () => {
    setShowAddDeviceModal(false);
  };

  const handleSubmitDevice = async (deviceData) => {
    try {
      console.log('Attempting to add device:', deviceData);
      
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        alert('You must be logged in to add a device.');
        return;
      }
      
      const payload = {
        name: deviceData.name,
        location: deviceData.location,
      };
      
      const response = await fetch('http://127.0.0.1:8000/api/devices/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        console.log('Device added successfully');
        if (homeScreenRef.current && homeScreenRef.current.refreshDevices) {
          await homeScreenRef.current.refreshDevices();
        }
        setShowAddDeviceModal(false);
        alert('Device added successfully!');
      } else {
        const responseText = await response.text();
        alert(`Failed to add device: ${responseText}`);
      }
    } catch (error) {
      console.error('Error adding device:', error);
      alert(`Error adding device: ${error.message}`);
    }
  };

  // Refresh Handler
  const handleRefresh = () => {
    switch (activeTab) {
      case "home":
        if (homeScreenRef.current && homeScreenRef.current.refreshData) {
          homeScreenRef.current.refreshData();
        }
        break;
      case "live":
        if (liveScreenRef.current && liveScreenRef.current.refreshFeed) {
          liveScreenRef.current.refreshFeed();
        }
        break;
      case "logs":
        if (logsScreenRef.current && logsScreenRef.current.refreshLogs) {
          logsScreenRef.current.refreshLogs();
        }
        break;
      default:
        break;
    }
  };

  // Filter Handler
  const handleFilter = () => {
    setShowFilterModal(true);
  };

  const handleCloseFilterModal = () => {
    setShowFilterModal(false);
  };

  const handleApplyFilter = (filterData) => {
    switch (activeTab) {
      case "logs":
        if (logsScreenRef.current && logsScreenRef.current.applyFilter) {
          logsScreenRef.current.applyFilter(filterData);
        }
        break;
      default:
        break;
    }
    setShowFilterModal(false);
  };

  // Logout handler
  const handleLogout = () => {
    logout(); // This will clear tokens and user data
  };

  return (
    <div className="dash-root">
      {/* ── Sidebar ── */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <img
            src={mainLogo}
            alt="Scarecrow Logo"
            style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }}
          />
          <div className="sidebar-logo-text">Scare<span>Crow</span></div>
        </div>

        {TABS.map((tab) => (
          <div
            key={tab.id}
            className={`nav-item${activeTab === tab.id ? " active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon} size={20} color="currentColor" />
            <span>{tab.label}</span>
          </div>
        ))}

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">Farm Owner</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <Icon name="logout" size={18} color="currentColor" />
            <span>Log Out</span>
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main
        className="main"
        style={{
          backgroundColor: "#ffffff",
        }}
      >
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">{currentTab.label}</div>
            <div className="topbar-subtitle">
              {activeTab === "home"
                ? `Welcome back, ${userName}`
                : currentTab.topbarSub}
            </div>
          </div>
          <div className="topbar-right">
            {activeTab === "home" && (
              <button className="icon-btn" title="Add Device" onClick={handleAddDevice}>
                <Icon name="plus" size={20} color="#fff" />
              </button>
            )}
            {activeTab === "live" && (
              <button className="icon-btn" title="Refresh" onClick={handleRefresh}>
                <Icon name="refresh" size={18} color="#fff" />
              </button>
            )}
            {activeTab === "logs" && (
              <button className="icon-btn" title="Filter" onClick={handleFilter}>
                <Icon name="filter" size={18} color="#fff" />
              </button>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content" key={activeTab}>
          {renderScreen()}
        </div>
      </main>

      {/* Add Device Modal */}
      {showAddDeviceModal && (
        <div className="modal-overlay" onClick={handleCloseAddDeviceModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Device</h2>
              <button className="modal-close" onClick={handleCloseAddDeviceModal}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSubmitDevice({
                name: formData.get('deviceName'),
                location: formData.get('deviceLocation'),
              });
            }}>
              <div className="form-group">
                <label className="form-label">Device Name</label>
                <input
                  className="form-input"
                  name="deviceName"
                  placeholder="e.g., North Field Scarecrow"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  name="deviceLocation"
                  placeholder="e.g., North Field"
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={handleCloseAddDeviceModal}>Cancel</button>
                <button type="submit" className="btn-primary">Add Device</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="modal-overlay" onClick={handleCloseFilterModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filter Activity Logs</h2>
              <button className="modal-close" onClick={handleCloseFilterModal}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleApplyFilter({
                dateRange: formData.get('dateRange'),
                birdSpecies: formData.get('birdSpecies'),
                device: formData.get('device'),
              });
            }}>
              <div className="form-group">
                <label className="form-label">Date Range</label>
                <select className="form-input" name="dateRange" defaultValue="all">
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bird Species</label>
                <input
                  className="form-input"
                  name="birdSpecies"
                  placeholder="Filter by bird species"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Device</label>
                <input
                  className="form-input"
                  name="device"
                  placeholder="Filter by device name"
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => {
                  handleApplyFilter({});
                }}>Clear Filters</button>
                <button type="submit" className="btn-primary">Apply Filters</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          color: #004E00;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #666;
        }
        .modal-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }
        .btn-secondary {
          padding: 8px 16px;
          background: #f0f0f0;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-primary {
          padding: 8px 16px;
          background: #004E00;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: #006600;
        }
      `}</style>
    </div>
  );
}