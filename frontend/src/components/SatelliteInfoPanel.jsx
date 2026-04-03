import React from 'react';
import { X, Orbit, Zap, AlignCenterVertical, Rocket } from 'lucide-react';

export default function SatelliteInfoPanel({ satellite, onClose }) {
  if (!satellite) return null;

  return (
    <div className="glass-panel" style={{ position: 'absolute', bottom: '45px', left: '20px', width: '320px' }}>
      <button className="close-btn" onClick={onClose}><X size={20} /></button>
      <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Rocket size={24} color="#00d8ff" /> {satellite.name}
      </h2>
      
      <div className="data-row">
        <span><Orbit size={16}/> Type</span>
        <strong style={{ color: satellite.type === 'Debris' ? '#ff4d4d' : '#00d8ff'}}>{satellite.type}</strong>
      </div>
      <div className="data-row">
        <span><Zap size={16}/> Velocity</span>
        <strong>{satellite.velocity} km/s</strong>
      </div>
      <div className="data-row">
        <span><AlignCenterVertical size={16}/> Altitude</span>
        <strong>{(satellite.alt * 6371).toFixed(0)} km</strong>
      </div>
      <div className="data-row">
        <span>Risk Factor</span>
        <strong>{(satellite.riskFactor * 100).toFixed(1)}%</strong>
      </div>
    </div>
  );
}
