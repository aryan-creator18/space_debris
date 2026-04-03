import React, { useState } from 'react';
import './Sidebar.css';

const SAT_COLORS = ['#ff4444', '#4fc3f7', '#ffbb33', '#00e676'];
const SAT_LABELS = ['Alpha', 'Beta', 'Gamma', 'Delta'];

function Sidebar({ status, satellites, alerts, onSelectSatellites }) {
  const [selectedSats, setSelectedSats] = useState([]);

  const handleAdd = (e) => {
    const id = Number(e.target.value);
    if (!id || selectedSats.includes(id) || selectedSats.length >= 4) return;
    const next = [...selectedSats, id];
    setSelectedSats(next);
    onSelectSatellites(next);
    e.target.value = '';
  };

  const handleRemove = (id) => {
    const next = selectedSats.filter(s => s !== id);
    setSelectedSats(next);
    onSelectSatellites(next);
  };

  const highAlerts = alerts ? alerts.filter(a => a.risk_level === 'HIGH').length : 0;

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="brand-icon">⬡</div>
        <div className="brand-text">
          <span className="brand-title">ORBITWATCH</span>
          <span className="brand-sub">Space Debris AI</span>
        </div>
      </div>

      {/* System Status */}
      <section className="sidebar-section">
        <div className="section-label">System Status</div>
        <div className="status-row">
          <span className={`dot ${status ? 'green' : 'red'}`}></span>
          <span className="status-text">LSTM Model</span>
          <span className="status-badge">{status ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
        <div className="status-row">
          <span className={`dot ${status ? 'green' : 'red'}`}></span>
          <span className="status-text">XGBoost</span>
          <span className="status-badge">{status ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
        <div className="status-row">
          <span className={`dot ${status?.live_tle_count > 0 ? 'amber' : 'gray'}`}></span>
          <span className="status-text">Live TLEs</span>
          <span className="status-badge">{status?.live_tle_count || 0}</span>
        </div>
        {highAlerts > 0 && (
          <div className="alert-warning">
            <span className="warning-icon">⚠</span>
            {highAlerts} HIGH RISK conjunction{highAlerts > 1 ? 's' : ''} detected
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="sidebar-section">
        <div className="section-label">Dataset</div>
        <div className="stats-grid">
          <div className="stat-cell">
            <div className="stat-val">{status?.total_satellites?.toLocaleString() || '—'}</div>
            <div className="stat-lbl">Satellites</div>
          </div>
          <div className="stat-cell">
            <div className="stat-val">{status?.total_records?.toLocaleString() || '—'}</div>
            <div className="stat-lbl">Records</div>
          </div>
        </div>
        <div className="global-stat">
          <span className="global-num">27,000+</span>
          <span className="global-lbl">tracked objects in orbit (ESA)</span>
        </div>
      </section>

      {/* Satellite Selector */}
      <section className="sidebar-section" style={{flex: 1}}>
        <div className="section-label">
          Satellites
          {selectedSats.length > 0 && (
            <span className="count-badge">{selectedSats.length}/4</span>
          )}
        </div>

        <select
          className="sat-select"
          onChange={handleAdd}
          defaultValue=""
          disabled={selectedSats.length >= 4}
        >
          <option value="">Add satellite…</option>
          {satellites.filter(s => !selectedSats.includes(s)).map(s => (
            <option key={s} value={s}>NORAD {s}</option>
          ))}
        </select>

        <div className="sat-list">
          {selectedSats.length === 0 && (
            <div className="empty-list">Select up to 4 satellites to visualize their orbits</div>
          )}
          {selectedSats.map((id, idx) => (
            <div key={id} className="sat-item">
              <div className="sat-dot" style={{ background: SAT_COLORS[idx] }}></div>
              <div className="sat-info">
                <span className="sat-id">NORAD {id}</span>
                <span className="sat-label" style={{ color: SAT_COLORS[idx] }}>{SAT_LABELS[idx]}</span>
              </div>
              <button className="remove-btn" onClick={() => handleRemove(id)} title="Remove">×</button>
            </div>
          ))}
        </div>
      </section>

      <div className="sidebar-footer">
        <span>Physics: Keplerian SGP4</span>
        {status?.last_updated && (
          <span className="updated">
            ↻ {new Date(status.last_updated).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
