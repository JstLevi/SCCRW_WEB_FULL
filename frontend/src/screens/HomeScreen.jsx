// src/screens/HomeScreen.jsx
// SAME UI as original. Static data → live from Django REST API.

import { useState } from "react";
import Icon from "../components/Icon";
import useFetch from "../hooks/useFetch";
import { getDevices, deleteDevice, updateDevice } from "../services/deviceService";
import { getDetections } from "../services/detectionService";
import { mainLogo, birdIcon } from "../assets/images";

// Loading skeleton that matches card style
function LoadingCard() {
  return (
    <div className="section-card" style={{ color: "#808080", fontSize: 13, textAlign: "center", padding: 24 }}>
      Loading…
    </div>
  );
}

// Error inline display
function InlineError({ msg }) {
  return (
    <div className="error-box" style={{ marginBottom: 16 }}>⚠ {msg}</div>
  );
}

export default function HomeScreen() {
  // GET /api/devices/
  const { data: devicesData, loading: devLoading, error: devError, refetch: refetchDevices } = useFetch(getDevices, []);
  // GET /api/detections/
  const { data: detections, loading: detLoading, error: detError } = useFetch(getDetections, []);
  
  const [showManageModal, setShowManageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", location: "" });
  const [updating, setUpdating] = useState(false);

  // Extract devices from the paginated response (results array)
  const devices = devicesData?.results || devicesData || [];
  
  // Count detections per species for the bird stats grid
  const speciesCount = {};
  (detections || []).forEach((d) => {
    const s = d.bird_species || "Unknown";
    speciesCount[s] = (speciesCount[s] || 0) + 1;
  });
  const speciesEntries = Object.entries(speciesCount).slice(0, 4);

  // Today's detections
  const today = new Date().toDateString();
  const todayDetections = (detections || []).filter(
    (d) => d.detected_at && new Date(d.detected_at).toDateString() === today
  );

  // Recent activity log from detections (last 5)
  const recentLogs = (detections || [])
    .slice()
    .sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at))
    .slice(0, 5);

  const firstDevice = devices?.[0];

  const handleDeleteClick = async (device) => {
    if (window.confirm(`Are you sure you want to delete "${device.name}"? This action cannot be undone.`)) {
      const { error } = await deleteDevice(device.id);
      if (error) {
        alert(`Failed to delete device: ${error}`);
      } else {
        alert(`Device "${device.name}" deleted successfully`);
        await refetchDevices();
      }
    }
  };

  const handleEditClick = (device) => {
    setDeviceToEdit(device);
    setEditForm({ name: device.name, location: device.location });
    setShowEditModal(true);
  };

  const handleUpdateDevice = async (e) => {
    e.preventDefault();
    if (!deviceToEdit) return;
    
    setUpdating(true);
    const { error } = await updateDevice(deviceToEdit.id, editForm);
    
    if (error) {
      alert(`Failed to update device: ${error}`);
    } else {
      alert(`Device "${deviceToEdit.name}" updated successfully`);
      await refetchDevices();
      setShowEditModal(false);
      setDeviceToEdit(null);
    }
    
    setUpdating(false);
  };

  return (
    <>
      {/* ── Connection Card ── */}
      <div className="info-card">
        <div className="info-row">
          <div className="info-col">
            <Icon name="wifi" size={20} color="#004E00" />
            <div>
              <div className="info-label">Connected to</div>
              <div className="info-value">
                {devLoading ? "…" : firstDevice ? firstDevice.name : "No devices"}
              </div>
            </div>
          </div>
          <div className="info-divider" />
          <div className="info-col">
            <Icon name="location" size={18} color="#004E00" />
            <div>
              <div className="info-label">Total Devices</div>
              <div className="info-value-lg">
                {devLoading ? "…" : devices?.length ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Device Overview ── */}
      {devLoading && <LoadingCard />}
      {devError   && <InlineError msg={devError} />}

      {!devLoading && (
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">Device Overview</span>
            <button className="section-link" onClick={() => setShowManageModal(true)}>Manage ›</button>
          </div>

          {devices?.length === 0 && (
            <p style={{ color: "#808080", fontSize: 13 }}>No devices registered yet.</p>
          )}

          {devices?.map((device) => (
            <div key={device.id} className="device-row">
              <div className="device-icon-wrap">
                <img src={mainLogo} alt="device" style={{ width: 28, height: 28, objectFit: "contain" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="device-name">{device.name}</div>
                {device.status === "active"
                  ? <div className="device-status-active">● Active</div>
                  : <div className="device-status-offline"><div className="status-dot" />Inactive</div>
                }
              </div>
              <Icon name="chevron" size={18} color="#004E00" />
            </div>
          ))}

          {/* Bird Detection Banner — live counts */}
          {!detLoading && (
            <div className="bird-banner">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src={birdIcon} alt="bird" style={{ width: 22, height: 22, objectFit: "contain" }} />
                <span>
                  <span className="bird-count-bold">{todayDetections.length} Birds</span> Today
                </span>
              </div>
              <span>
                <span className="bird-count-bold">{detections?.length ?? 0}</span> Total
              </span>
            </div>
          )}

          {/* Species Cards — live from API */}
          {speciesEntries.length > 0 && (
            <div className="species-grid">
              {speciesEntries.map(([species, count]) => (
                <div key={species} className="species-card">
                  <img src={birdIcon} alt="bird" style={{ width: 20, height: 20, objectFit: "contain" }} />
                  <div>
                    <div className="species-count">{count} {species}</div>
                    <div className="species-sub">Detected</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Recent Activity Log ── */}
      {!detLoading && recentLogs.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">Recent Activity Log</span>
            <button className="section-link">View All ›</button>
          </div>

          {recentLogs.map((log, i) => (
            <div key={i} className="log-row">
              <div className="log-icon-circle">
                <img src={birdIcon} alt="bird" style={{ width: 18, height: 18, objectFit: "contain" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="log-time">
                    {log.detected_at ? new Date(log.detected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </span>
                  <span className="log-label">{log.bird_species || "Bird"} Detected</span>
                </div>
                <div className="log-ago">
                  {log.detected_at ? new Date(log.detected_at).toLocaleDateString() : ""}
                </div>
              </div>
              <Icon name="chevron" size={16} color="#004E00" />
            </div>
          ))}
        </div>
      )}

      {!detLoading && detError && <InlineError msg={detError} />}

      {/* Manage Devices Modal */}
      {showManageModal && (
        <div className="modal-overlay" onClick={() => setShowManageModal(false)}>
          <div className="modal-content manage-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Devices</h2>
              <button className="modal-close" onClick={() => setShowManageModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {devices?.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#808080' }}>No devices available.</p>
              ) : (
                <div className="devices-list">
                  {devices.map((device) => (
                    <div key={device.id} className="manage-device-item">
                      <div className="device-info">
                        <div className="device-name">{device.name}</div>
                        <div className="device-location">{device.location}</div>
                        <div className="device-status-badge">
                          {device.status === "active" ? "🟢 Active" : "⚫ Inactive"}
                        </div>
                      </div>
                      <div className="device-actions">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => {
                            setShowManageModal(false);
                            handleEditClick(device);
                          }}
                        >
                          EDIT
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => {
                            setShowManageModal(false);
                            handleDeleteClick(device);
                          }}
                        >
                            DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Device Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Device</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateDevice}>
              <div className="form-group">
                <label className="form-label">Device Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={updating}>
                  {updating ? 'Updating...' : 'Update Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Styles */}
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
        .manage-modal {
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
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
        .modal-body {
          margin-bottom: 20px;
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
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }
        .form-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        .form-input:focus {
          outline: none;
          border-color: #004E00;
        }
        .devices-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .manage-device-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f9f9f9;
        }
        .device-info {
          flex: 1;
        }
        .device-info .device-name {
          font-size: 16px;
          font-weight: bold;
          color: #004E00;
          margin-bottom: 4px;
        }
        .device-location {
          font-size: 13px;
          color: #666;
          margin-bottom: 4px;
        }
        .device-status-badge {
          font-size: 12px;
          margin-top: 4px;
        }
        .device-actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .edit-btn {
          background: #2196F3;
          color: white;
        }
        .edit-btn:hover {
          background: #1976D2;
        }
        .delete-btn {
          background: #ff4444;
          color: white;
        }
        .delete-btn:hover {
          background: #cc0000;
        }
      `}</style>
    </>
  );
}