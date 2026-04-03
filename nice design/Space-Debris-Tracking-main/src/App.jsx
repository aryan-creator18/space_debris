import React, { useState, useEffect } from 'react';
import GlobeVisualization from './components/GlobeVisualization';
import SatelliteInfoPanel from './components/SatelliteInfoPanel';
import CollisionRiskPanel from './components/CollisionRiskPanel';
import { generateMockSatellites } from './data/mockSatellites';
import { Activity } from 'lucide-react';

function App() {
  const [satellites, setSatellites] = useState([]);
  const [selectedSatellites, setSelectedSatellites] = useState([]);

  useEffect(() => {
    setSatellites(generateMockSatellites(200));
  }, []);

  const handleSelectSatellite = (satellite) => {
    setSelectedSatellites((prev) => {
      // If already selected, deselect it
      if (prev.find((s) => s.id === satellite.id)) {
        return prev.filter((s) => s.id !== satellite.id);
      }
      // Keep up to 2 selected
      if (prev.length >= 2) {
        return [prev[1], satellite];
      }
      return [...prev, satellite];
    });
  };

  const handleCloseSat1 = () => {
    setSelectedSatellites(prev => [prev[1]].filter(Boolean));
  };
  
  const handleCloseRisk = () => {
    setSelectedSatellites([]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <GlobeVisualization 
        satellites={satellites} 
        onSelectSatellite={handleSelectSatellite} 
        selectedSatellites={selectedSatellites}
      />
      
      {/* Header UI */}
      <header className="glass-panel" style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px' }}>
        <Activity color="#00d8ff" size={28} />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Orbital Debris Tracker</h1>
          <p style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>Tracking {satellites.length} objects in LEO</p>
        </div>
      </header>

      {/* Panels for selection */}
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
