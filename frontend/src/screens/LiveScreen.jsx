// src/screens/LiveScreen.jsx
// SAME UI as original. Static device list → live from /api/devices/

import Icon from "../components/Icon";
import useFetch from "../hooks/useFetch";
import { getDevices } from "../services/deviceService";
import { mainLogo, liveFeed, videoCam, deviceActive } from "../assets/images";

function CameraCard({ device }) {
  const isActive = device.status === "active";
  return (
    <div className="camera-card">
      <div className="camera-card-header">
        <div className="camera-title">
          <img 
            src={liveFeed} 
            alt="camera" 
            style={{ width: 18, height: 18, objectFit: "contain", marginRight: 8 }} 
          />
          {device.name}
        </div>
        <div className="offline-badge" style={isActive ? { background: "rgba(0,100,0,0.1)", color: "#004E00" } : {}}>
          <div className="offline-dot" style={isActive ? { background: "#004E00" } : {}} />
          {isActive ? "DEVICE ONLINE" : "DEVICE OFFLINE"}
        </div>
      </div>

      <div className="camera-preview">
        <img 
          src={isActive ? deviceActive : videoCam} 
          alt={isActive ? "Device Active" : "Camera Offline"}
          style={{ width: 36, height: 36, objectFit: "contain" }}
        />
        <span>{isActive ? "Device Active" : "Camera Offline"}</span>
      </div>

      <div className="camera-location">
        <Icon name="location" size={14} color="#808080" />
        {device.location || "No location set"} &nbsp;|&nbsp; ID: {device.id}
      </div>

      <button className="reconnect-btn">
        <Icon name="refresh" size={16} color="#004E00" />
        {isActive ? "Refresh" : "Reconnect"}
      </button>
    </div>
  );
}

export default function LiveScreen() {
  const { data: devices, loading, error } = useFetch(getDevices);

  const offlineCount = (devices || []).filter((d) => d.status !== "active").length;
  const onlineCount  = (devices || []).filter((d) => d.status === "active").length;

  return (
    <>
      {/* ── Connection Status Card ── */}
      <div className="info-card">
        <div className="info-row">
          <div className="info-col">
            <Icon name={offlineCount > 0 ? "noWifi" : "wifi"} size={20} color={offlineCount > 0 ? "#D32F2F" : "#004E00"} />
            <div>
              <div className="info-label">Connection Status</div>
              <div className="info-value" style={offlineCount > 0 ? { color: "#D32F2F" } : {}}>
                {loading ? "…" : `${offlineCount} Device${offlineCount !== 1 ? "s" : ""} Offline`}
              </div>
            </div>
          </div>
          <div className="info-divider" />
          <div className="info-col">
            <Icon name="time" size={18} color="#004E00" />
            <div>
              <div className="info-label">Online</div>
              <div className="info-value-lg">{loading ? "…" : onlineCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Cameras ── */}
      <div className="section-card">
        <div className="section-header">
          <span className="section-title">Active Cameras</span>
          <button className="section-link">View All ›</button>
        </div>

        {loading && <p style={{ color: "#808080", fontSize: 13 }}>Loading devices…</p>}
        {error   && <div className="error-box">⚠ {error}</div>}
        {!loading && devices?.length === 0 && (
          <p style={{ color: "#808080", fontSize: 13 }}>No devices found.</p>
        )}
        {!loading && devices?.map((d) => <CameraCard key={d.id} device={d} />)}
      </div>

      {/* ── Device Status Summary ── */}
      {!loading && devices?.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">Device Status</span>
            <button className="section-link">Details ›</button>
          </div>

          {devices.map((device, i) => (
            <div key={device.id}>
              <div className="device-row" style={{ cursor: "default" }}>
                <div className="device-icon-wrap">
                  <img 
                    src={mainLogo} 
                    alt="device" 
                    style={{ width: 28, height: 28, objectFit: "contain" }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="device-name">{device.name}</div>
                  {device.status === "active"
                    ? <div className="device-status-active">● Online</div>
                    : <div className="device-status-offline"><div className="status-dot" />Offline — No signal</div>
                  }
                </div>
                <span style={{ fontSize: 12, color: "#808080" }}>ID: {device.id}</span>
              </div>
              {i < devices.length - 1 && <div className="divider" />}
            </div>
          ))}
        </div>
      )}
    </>
  );
}