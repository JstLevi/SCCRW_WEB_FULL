// src/screens/LogsScreen.jsx
// SAME UI as original. Static DEVICE_LOGS → live from /api/activities/ + /api/detections/

import { useState } from "react";
import Icon from "../components/Icon";
import useFetch from "../hooks/useFetch";
import { getActivities, deleteActivity } from "../services/activityService";
import { getDetections } from "../services/detectionService";

const FILTERS = ["All", "Today", "Yesterday", "Alerts"];

function getEventColor(type) {
  switch (type) {
    case "offline": return "#D32F2F";
    case "online":  return "#004E00";
    case "bird":    return "#FFA000";
    case "battery": return "#FF6B00";
    case "motion":  return "#1976D2";
    default:        return "#004E00";
  }
}

function getEmoji(action = "") {
  const a = action.toLowerCase();
  if (a.includes("bird") || a.includes("detect"))  return "🐦";
  if (a.includes("offline") || a.includes("disconnect")) return "📵";
  if (a.includes("online") || a.includes("connect"))  return "✅";
  if (a.includes("battery")) return "🪫";
  if (a.includes("motion"))  return "▶️";
  if (a.includes("update"))  return "☁️";
  if (a.includes("snapshot") || a.includes("camera")) return "📸";
  return "📋";
}

function getType(action = "") {
  const a = action.toLowerCase();
  if (a.includes("offline") || a.includes("disconnect")) return "offline";
  if (a.includes("online") || a.includes("connect"))  return "online";
  if (a.includes("bird") || a.includes("detect"))  return "bird";
  if (a.includes("battery")) return "battery";
  if (a.includes("motion"))  return "motion";
  return "system";
}

function LogEntry({ log, onDelete }) {
  const type  = getType(log.action);
  const color = getEventColor(type);
  const emoji = getEmoji(log.action);
  const time  = log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="log-row" style={{ position: "relative" }}>
      <div className="log-icon-square" style={{ background: color + "22" }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <span className="log-device">Device #{log.device}</span>
          <span className="log-time">{time}</span>
        </div>
        <span className="log-event">{log.action}{log.description ? ` — ${log.description}` : ""}</span>
      </div>
      <button
        onClick={() => onDelete(log.id)}
        style={{ background: "none", border: "none", color: "#D32F2F", fontSize: 16, cursor: "pointer", padding: "0 4px" }}
        title="Delete"
      >×</button>
    </div>
  );
}

export default function LogsScreen() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const { data: activities, loading, error, refetch } = useFetch(getActivities);
  const { data: detections } = useFetch(getDetections);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this log entry?")) return;
    await deleteActivity(id);
    refetch();
  };

  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const filtered = (activities || []).filter((log) => {
    const logDate = log.created_at ? new Date(log.created_at).toDateString() : "";
    if (selectedFilter === "Today")     return logDate === today;
    if (selectedFilter === "Yesterday") return logDate === yesterday;
    if (selectedFilter === "Alerts")    return ["offline", "battery"].includes(getType(log.action));
    return true;
  });

  const todayLogs     = filtered.filter((l) => l.created_at && new Date(l.created_at).toDateString() === today);
  const yesterdayLogs = filtered.filter((l) => l.created_at && new Date(l.created_at).toDateString() === yesterday);
  const olderLogs     = filtered.filter((l) => {
    if (!l.created_at) return true;
    const d = new Date(l.created_at).toDateString();
    return d !== today && d !== yesterday;
  });

  // Stats
  const totalEvents   = activities?.length ?? 0;
  const alertCount    = (activities || []).filter((l) => ["offline", "battery"].includes(getType(l.action))).length;
  const offlineCount  = (activities || []).filter((l) => getType(l.action) === "offline").length;

  return (
    <>
      {/* ── Stats Summary Card ── */}
      <div className="info-card">
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-number">{loading ? "…" : totalEvents + (detections?.length ?? 0)}</div>
            <div className="stat-label">Total Events</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-number">{loading ? "…" : alertCount}</div>
            <div className="stat-label">Alerts</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-number">{loading ? "…" : offlineCount}</div>
            <div className="stat-label">Offline Events</div>
          </div>
        </div>
      </div>

      {/* ── Filter Chips ── */}
      <div className="filter-chips">
        {FILTERS.map((f) => (
          <button key={f} className={`chip${selectedFilter === f ? " active" : ""}`} onClick={() => setSelectedFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {loading && <div className="section-card" style={{ color: "#808080", fontSize: 13, textAlign: "center" }}>Loading logs…</div>}
      {error   && <div className="error-box">⚠ {error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="section-card" style={{ color: "#808080", fontSize: 13, textAlign: "center" }}>No logs found.</div>
      )}

      {/* ── Today ── */}
      {todayLogs.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">Today</span>
          </div>
          {todayLogs.map((log) => <LogEntry key={log.id} log={log} onDelete={handleDelete} />)}
        </div>
      )}

      {/* ── Yesterday ── */}
      {yesterdayLogs.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">Yesterday</span>
          </div>
          {yesterdayLogs.map((log) => <LogEntry key={log.id} log={log} onDelete={handleDelete} />)}
        </div>
      )}

      {/* ── Older ── */}
      {olderLogs.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">Older</span>
          </div>
          {olderLogs.map((log) => <LogEntry key={log.id} log={log} onDelete={handleDelete} />)}
        </div>
      )}

      <button className="action-btn">
        <Icon name="download" size={18} color="#fff" />
        Export Logs
      </button>
    </>
  );
}
