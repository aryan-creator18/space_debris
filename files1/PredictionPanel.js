import React, { useState, useEffect } from 'react';
import './PredictionPanel.css';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function PredictionPanel({ satellites, selectedSats, focusSats }) {
  const [trajResult, setTrajResult] = useState(null);
  const [collResult, setCollResult] = useState(null);
  const [trajSat, setTrajSat] = useState('');
  const [collSat1, setCollSat1] = useState('');
  const [collSat2, setCollSat2] = useState('');
  const [trajLoading, setTrajLoading] = useState(false);
  const [collLoading, setCollLoading] = useState(false);
  const [orbitInfo, setOrbitInfo] = useState({});

  // Apply focusSats from alert clicks
  useEffect(() => {
    if (focusSats) {
      setCollSat1(String(focusSats.sat1));
      setCollSat2(String(focusSats.sat2));
    }
  }, [focusSats]);

  const getEffectiveSat = (val, idx) => val || (selectedSats.length > idx ? selectedSats[idx] : null);

  const fetchOrbitInfo = async (satId) => {
    if (!satId || orbitInfo[satId]) return;
    try {
      const res = await axios.get(`${API_URL}/orbit/${satId}`);
      setOrbitInfo(prev => ({ ...prev, [satId]: res.data.info }));
    } catch (e) {}
  };

  const predictTrajectory = async () => {
    const satId = getEffectiveSat(trajSat, 0);
    if (!satId) return;
    setTrajLoading(true);
    setTrajResult(null);
    try {
      const res = await axios.post(`${API_URL}/predict/trajectory`, {
        sat_id: Number(satId), hours: 24
      });
      setTrajResult(res.data);
      await fetchOrbitInfo(satId);
    } catch (err) {
      console.error(err);
    }
    setTrajLoading(false);
  };

  const predictCollision = async () => {
    const s1 = getEffectiveSat(collSat1, 0);
    const s2 = getEffectiveSat(collSat2, 1);
    if (!s1 || !s2) return;
    setCollLoading(true);
    setCollResult(null);
    try {
      const res = await axios.post(`${API_URL}/predict/collision`, {
        sat1_id: Number(s1), sat2_id: Number(s2)
      });
      setCollResult(res.data);
    } catch (err) {
      console.error(err);
    }
    setCollLoading(false);
  };

  const effTrajSat = getEffectiveSat(trajSat, 0);
  const effCollSat1 = getEffectiveSat(collSat1, 0);
  const effCollSat2 = getEffectiveSat(collSat2, 1);

  return (
    <div className="pred-panel">
      {/* Trajectory Module */}
      <div className="pred-module">
        <div className="mod-header">
          <span className="mod-icon traj-icon">◎</span>
          <div>
            <div className="mod-title">Trajectory Forecast</div>
            <div className="mod-sub">LSTM · 24h position prediction</div>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Satellite</label>
          <select
            className="pred-select"
            value={trajSat}
            onChange={e => setTrajSat(e.target.value)}
          >
            <option value="">{selectedSats.length > 0 ? `NORAD ${selectedSats[0]} (selected)` : 'Choose satellite…'}</option>
            {satellites.map(s => <option key={s} value={s}>NORAD {s}</option>)}
          </select>
        </div>

        <button
          className="pred-btn traj-btn"
          onClick={predictTrajectory}
          disabled={!effTrajSat || trajLoading}
        >
          {trajLoading ? <span className="loading-dots">Computing<span>…</span></span> : 'Predict Trajectory →'}
        </button>

        {trajLoading && <div className="skeleton-block"></div>}

        {trajResult && !trajLoading && (
          <div className="result-block">
            <div className="result-header">
              <span>NORAD {trajResult.sat_id}</span>
              <span className="result-badge traj">24h Forecast</span>
            </div>
            <div className="coord-grid">
              {['x','y','z'].map(ax => (
                <div key={ax} className="coord-cell">
                  <div className="coord-ax">{ax.toUpperCase()}</div>
                  <div className="coord-val">
                    {trajResult.predictions[23]?.[ax]?.toFixed(1)}
                  </div>
                  <div className="coord-unit">km</div>
                </div>
              ))}
            </div>
            <div className="extra-row">
              <span className="extra-label">Velocity (24h)</span>
              <span className="extra-val">
                {trajResult.predictions[23]?.velocity_km_s?.toFixed(2) || '—'} km/s
              </span>
            </div>
            <div className="extra-row">
              <span className="extra-label">Altitude (24h)</span>
              <span className="extra-val">
                {trajResult.predictions[23]?.altitude_km?.toFixed(1) || '—'} km
              </span>
            </div>
            <div className="result-meta">Model: {trajResult.model}</div>
          </div>
        )}
      </div>

      {/* Collision Module */}
      <div className="pred-module">
        <div className="mod-header">
          <span className="mod-icon coll-icon">⊗</span>
          <div>
            <div className="mod-title">Collision Risk Assessment</div>
            <div className="mod-sub">XGBoost · MOID conjunction analysis</div>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Satellite 1</label>
          <select className="pred-select" value={collSat1} onChange={e => setCollSat1(e.target.value)}>
            <option value="">{selectedSats.length > 0 ? `NORAD ${selectedSats[0]}` : 'Choose…'}</option>
            {satellites.map(s => <option key={s} value={s}>NORAD {s}</option>)}
          </select>
        </div>
        <div className="input-row">
          <label className="input-label">Satellite 2</label>
          <select className="pred-select" value={collSat2} onChange={e => setCollSat2(e.target.value)}>
            <option value="">{selectedSats.length > 1 ? `NORAD ${selectedSats[1]}` : 'Choose…'}</option>
            {satellites.map(s => <option key={s} value={s}>NORAD {s}</option>)}
          </select>
        </div>

        <button
          className="pred-btn coll-btn"
          onClick={predictCollision}
          disabled={!effCollSat1 || !effCollSat2 || effCollSat1 === effCollSat2 || collLoading}
        >
          {collLoading ? <span className="loading-dots">Analyzing<span>…</span></span> : 'Assess Conjunction Risk →'}
        </button>

        {collLoading && <div className="skeleton-block"></div>}

        {collResult && !collLoading && (
          <div className="result-block">
            <div className="result-header">
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11 }}>
                {collResult.sat1_id} × {collResult.sat2_id}
              </span>
              <span className={`result-badge ${collResult.risk_level.toLowerCase()}`}>
                {collResult.risk_level}
              </span>
            </div>

            {/* Risk meter */}
            <div className="risk-meter-container">
              <div className="risk-meter-track">
                <div
                  className={`risk-meter-fill ${collResult.risk_level.toLowerCase()}`}
                  style={{ width: `${Math.min(100, collResult.collision_probability * 100).toFixed(1)}%` }}
                ></div>
              </div>
              <div className="risk-meter-label">
                <span>Collision Probability</span>
                <span className={`risk-pct ${collResult.risk_level.toLowerCase()}`}>
                  {collResult.collision_probability_pct?.toFixed(4)}%
                </span>
              </div>
            </div>

            <div className="extra-row">
              <span className="extra-label">Min Orbit Distance (MOID)</span>
              <span className="extra-val">{collResult.min_orbit_distance_km?.toFixed(1)} km</span>
            </div>
            <div className="extra-row">
              <span className="extra-label">Altitude Difference</span>
              <span className="extra-val">{collResult.analysis?.altitude_diff_km?.toFixed(1)} km</span>
            </div>
            <div className="extra-row">
              <span className="extra-label">Inclination Difference</span>
              <span className="extra-val">{collResult.analysis?.inclination_diff_deg?.toFixed(2)}°</span>
            </div>
            <div className="result-meta">{collResult.analysis?.method}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictionPanel;
