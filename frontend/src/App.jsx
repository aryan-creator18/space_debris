import React, { useState, useEffect } from 'react';
import GlobeVisualization from './components/GlobeVisualization';
import SatelliteInfoPanel from './components/SatelliteInfoPanel';
import CollisionRiskPanel from './components/CollisionRiskPanel';
import SatelliteListPanel from './components/SatelliteListPanel';
import TelemetryTicker from './components/TelemetryTicker';
import { Activity } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const EARTH_RADIUS_KM = 6371.0;

function cartesianToLatLngAlt(x, y, z) {
  const r = Math.sqrt(x*x + y*y + z*z);
  const alt = (r - EARTH_RADIUS_KM) / EARTH_RADIUS_KM; // fraction of Earth radius
  const lat = Math.asin(z / r) * (180 / Math.PI);
  const lng = Math.atan2(y, x) * (180 / Math.PI);
  return { lat, lng, alt };
}

function App() {
  const [satellites, setSatellites] = useState([]);
  const [selectedSatellites, setSelectedSatellites] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [intersectionPoint, setIntersectionPoint] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);

  useEffect(() => {
    fetchRealData();
  }, []);

  // Cleanup intersection point if satellites are deselected
  useEffect(() => {
    if (selectedSatellites.length < 2) {
      setIntersectionPoint(null);
    }
  }, [selectedSatellites]);

  const fetchRealData = async () => {
    try {
      // 1. Get satellite IDs list
      const res = await axios.get(`${API_URL}/satellites`);
      const satIds = res.data.satellites.slice(0, 100); // Increased limit to 100 for a denser visual field
      setTotalCount(res.data.total);

      // 2. Fetch their orbits
      const orbitReqs = satIds.map(id => axios.get(`${API_URL}/orbit/${id}`));
      const orbitResponses = await Promise.all(orbitReqs);

      // 3. Map to Globe format
      const formattedSatellites = orbitResponses.map((r, i) => {
        const data = r.data;
        // Convert the orbit paths
        const path = data.orbit_points.map(pt => cartesianToLatLngAlt(pt[0], pt[1], pt[2]));
        
        // Current position is arbitrarily the first point of the trajectory
        let currentPos = { lat: 0, lng: 0, alt: 0.1 };
        if (path.length > 0) currentPos = path[0];

        return {
          id: data.sat_id.toString(),
          name: `NORAD ${data.sat_id}`,
          type: i % 3 === 0 ? 'Debris' : 'Satellite', // Mix it up for demo since backend doesn't explicitly flag debris vs active payload yet
          lat: currentPos.lat,
          lng: currentPos.lng,
          alt: currentPos.alt,
          velocity: data.info.velocity_km_s.toFixed(2),
          riskFactor: Math.random(), // Still random until we hook up the specific pair risk from ML
          path: path,
          info: data.info
        };
      });

      setSatellites(formattedSatellites);
    } catch (err) {
      console.error('Error fetching satellite data from backend:', err);
    }
  };

  const handleSelectSatellite = (satellite) => {
    setSelectedSatellites((prev) => {
      if (prev.find((s) => s.id === satellite.id)) {
        return prev.filter((s) => s.id !== satellite.id);
      }
      if (prev.length >= 2) {
        return [prev[1], satellite];
      }
      return [...prev, satellite];
    });
  };

  const fetchAndAddGlobalSatellite = async (satelliteId) => {
    const existing = satellites.find(s => s.id === satelliteId);
    if (existing) {
      handleSelectSatellite(existing);
      return;
    }

    try {
      const { data } = await axios.get(`${API_URL}/orbit/${satelliteId}`);
      const path = data.orbit_points.map(pt => cartesianToLatLngAlt(pt[0], pt[1], pt[2]));
      let currentPos = { lat: 0, lng: 0, alt: 0.1 };
      if (path.length > 0) currentPos = path[0];

      const newSat = {
        id: data.sat_id.toString(),
        name: `NORAD ${data.sat_id}`,
        type: 'External Query',
        lat: currentPos.lat,
        lng: currentPos.lng,
        alt: currentPos.alt,
        velocity: data.info.velocity_km_s.toFixed(2),
        riskFactor: Math.min(0.99, (data.info.eccentricity * 5) + (500 / ((currentPos.alt * 6371) + 1))),
        path: path,
        info: data.info
      };

      setSatellites(prev => [...prev, newSat]);
      handleSelectSatellite(newSat);
    } catch (err) {
      console.error("Failed to fetch global satellite orbit", err);
      alert("Failed to track this object. Its real-time TLE data might be incomplete.");
    }
  };

  const handleCloseSat1 = () => setSelectedSatellites(prev => [prev[1]].filter(Boolean));
  const handleCloseRisk = () => {
    setSelectedSatellites([]);
    setIntersectionPoint(null);
  };

  const handlePredictionUpdate = (approachData) => {
    if (approachData && approachData.sat1_position) {
       const [x,y,z] = approachData.sat1_position;
       const { lat, lng, alt } = cartesianToLatLngAlt(x,y,z);
       setIntersectionPoint({ lat, lng, alt });
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <GlobeVisualization 
        satellites={satellites} 
        onSelectSatellite={handleSelectSatellite} 
        selectedSatellites={selectedSatellites}
        intersectionPoint={intersectionPoint}
        focusMode={focusMode}
        realTimeMode={realTimeMode}
      />
      
      <header className="glass-panel" style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', maxWidth: '400px' }}>
        <Activity color="#00d8ff" size={28} />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Orbital Debris Tracker</h1>
          <p style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
            Tracking {satellites.length} objects dynamically (Total DB: {totalCount})
          </p>
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#00ffaa', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            <strong>How to use:</strong> Click on the globe or use the side list to select any two objects to calculate their real-time <strong>collision risk probability</strong> and minimum trajectory distance using our ML pipeline.
            
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                  onClick={() => setFocusMode(!focusMode)}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: focusMode ? 'rgba(0, 216, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${focusMode ? '#00d8ff' : 'rgba(255, 255, 255, 0.2)'}`,
                    color: focusMode ? '#00d8ff' : '#fff',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease-in-out'
                  }}
              >
                  {focusMode ? '🎯 FOCUS MODE: ON (Isolated)' : '👁️ FOCUS MODE: OFF (All Clutter)'}
              </button>

              <button 
                  onClick={() => setRealTimeMode(!realTimeMode)}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: realTimeMode ? 'rgba(255, 170, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${realTimeMode ? '#ffaa00' : 'rgba(255, 255, 255, 0.2)'}`,
                    color: realTimeMode ? '#ffaa00' : '#fff',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease-in-out'
                  }}
              >
                  {realTimeMode ? '⏱️ REAL TIME: ON (90m/rev)' : '🚀 REAL TIME: OFF (HyperSpeed)'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Side List Panel */}
      <SatelliteListPanel 
        satellites={satellites}
        selectedSatellites={selectedSatellites}
        onSelectSatellite={handleSelectSatellite}
        onGlobalSelect={fetchAndAddGlobalSatellite}
      />

      {selectedSatellites.length === 1 && (
        <SatelliteInfoPanel satellite={selectedSatellites[0]} onClose={handleCloseSat1} />
      )}

      {selectedSatellites.length === 2 && (
        <CollisionRiskPanel 
          sat1={selectedSatellites[0]} 
          sat2={selectedSatellites[1]} 
          onClose={handleCloseRisk}
          onPredictionUpdate={handlePredictionUpdate} 
        />
      )}

      <TelemetryTicker />
    </div>
  );
}

export default App;
