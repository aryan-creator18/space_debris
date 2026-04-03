import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import OrbitVisualization from './components/OrbitVisualization';
import PredictionPanel from './components/PredictionPanel';
import ContextPanel from './components/ContextPanel';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [status, setStatus] = useState(null);
  const [satellites, setSatellites] = useState([]);
  const [selectedSats, setSelectedSats] = useState([]);
  const [orbitData, setOrbitData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [debrisStats, setDebrisStats] = useState(null);
  const [focusSats, setFocusSats] = useState(null); // {sat1, sat2} from alert click
  const [activePanel, setActivePanel] = useState('predict'); // 'predict' | 'alerts' | 'context'

  useEffect(() => {
    fetchStatus();
    fetchSatellites();
    fetchAlerts();
    fetchDebrisStats();
    // Refresh alerts every 60s
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/status`);
      setStatus(res.data);
    } catch (err) {
      console.error('Status fetch failed:', err);
    }
  };

  const fetchSatellites = async () => {
    try {
      const res = await axios.get(`${API_URL}/satellites`);
      setSatellites(res.data.satellites);
    } catch (err) {
      console.error('Satellites fetch failed:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${API_URL}/conjunction-alerts`);
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error('Alerts fetch failed:', err);
    }
  };

  const fetchDebrisStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/debris-stats`);
      setDebrisStats(res.data);
    } catch (err) {
      console.error('Debris stats fetch failed:', err);
    }
  };

  const handleSatellitesSelect = useCallback(async (satIds) => {
    setSelectedSats(satIds);
    if (satIds.length === 0) { setOrbitData([]); return; }
    try {
      const results = await Promise.all(
        satIds.map(id => axios.get(`${API_URL}/orbit/${id}`))
      );
      setOrbitData(results.map(r => r.data));
    } catch (err) {
      console.error('Orbit fetch failed:', err);
    }
  }, []);

  const handleAlertClick = useCallback((alert) => {
    setFocusSats({ sat1: alert.sat1_id, sat2: alert.sat2_id });
    setActivePanel('predict');
    // Auto-select those satellites in the sidebar
    const newSats = [alert.sat1_id, alert.sat2_id].filter(
      id => !selectedSats.includes(id)
    );
    if (newSats.length > 0) {
      handleSatellitesSelect([...selectedSats, ...newSats].slice(0, 4));
    }
  }, [selectedSats, handleSatellitesSelect]);

  return (
    <div className="app">
      <Sidebar
        status={status}
        satellites={satellites}
        alerts={alerts}
        onSelectSatellites={handleSatellitesSelect}
      />

      <div className="main-content">
        <div className="visualization-container">
          <OrbitVisualization orbitData={orbitData} />
        </div>

        <div className="bottom-panels">
          <div className="panel-tabs">
            <button
              className={activePanel === 'predict' ? 'tab active' : 'tab'}
              onClick={() => setActivePanel('predict')}
            >
              ML Predictions
            </button>
            <button
              className={activePanel === 'alerts' ? 'tab active' : 'tab'}
              onClick={() => setActivePanel('alerts')}
            >
              Conjunction Alerts
              {alerts.filter(a => a.risk_level === 'HIGH').length > 0 && (
                <span className="alert-badge">
                  {alerts.filter(a => a.risk_level === 'HIGH').length}
                </span>
              )}
            </button>
            <button
              className={activePanel === 'context' ? 'tab active' : 'tab'}
              onClick={() => setActivePanel('context')}
            >
              Debris Context
            </button>
          </div>

          {activePanel === 'predict' && (
            <PredictionPanel
              satellites={satellites}
              selectedSats={selectedSats}
              focusSats={focusSats}
            />
          )}
          {activePanel === 'alerts' && (
            <div className="alerts-panel">
              {alerts.length === 0 ? (
                <div className="no-alerts">Scanning for conjunctions...</div>
              ) : (
                <div className="alerts-grid">
                  {alerts.map((alert, i) => (
                    <div
                      key={i}
                      className={`alert-card risk-${alert.risk_level.toLowerCase()}`}
                      onClick={() => handleAlertClick(alert)}
                    >
                      <div className="alert-sats">
                        NORAD {alert.sat1_id} × {alert.sat2_id}
                      </div>
                      <div className="alert-dist">{alert.min_distance_km} km min distance</div>
                      <div className="alert-meta">
                        <span className={`risk-pill ${alert.risk_level.toLowerCase()}`}>
                          {alert.risk_level}
                        </span>
                        <span className="alert-prob">{alert.probability_pct.toFixed(3)}%</span>
                        <span className="alert-tca">TCA: {alert.time_to_closest_approach_h}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activePanel === 'context' && (
            <ContextPanel stats={debrisStats} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
