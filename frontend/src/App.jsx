import React, { useState, useEffect } from 'react';
import GlobeVisualization from './components/GlobeVisualization';
import SatelliteInfoPanel from './components/SatelliteInfoPanel';
import CollisionRiskPanel from './components/CollisionRiskPanel';
import SatelliteListPanel from './components/SatelliteListPanel';
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

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      // 1. Get satellite IDs list
      const res = await axios.get(`${API_URL}/satellites`);
      const satIds = res.data.satellites.slice(0, 30); // Limiting to 30 for performance
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

  const handleCloseSat1 = () => setSelectedSatellites(prev => [prev[1]].filter(Boolean));
  const handleCloseRisk = () => setSelectedSatellites([]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <GlobeVisualization 
        satellites={satellites} 
        onSelectSatellite={handleSelectSatellite} 
        selectedSatellites={selectedSatellites}
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
          </div>
        </div>
      </header>

      {/* Side List Panel */}
      <SatelliteListPanel 
        satellites={satellites}
        selectedSatellites={selectedSatellites}
        onSelectSatellite={handleSelectSatellite}
      />

      {selectedSatellites.length === 1 && (
        <SatelliteInfoPanel satellite={selectedSatellites[0]} onClose={handleCloseSat1} />
      )}

      {selectedSatellites.length === 2 && (
        <CollisionRiskPanel sat1={selectedSatellites[0]} sat2={selectedSatellites[1]} onClose={handleCloseRisk} />
      )}
    </div>
  );
}

export default App;
