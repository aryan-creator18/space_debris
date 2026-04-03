import React from 'react';
import { X, Orbit, Zap, AlignCenterVertical, Rocket } from 'lucide-react';

export default function SatelliteInfoPanel({ satellite, onClose }) {
  if (!satellite) return null;

  const alt_km = satellite.alt * 6371;
  const velocity = parseFloat(satellite.velocity) || 7.5;
  const mass_kg = satellite.type === 'Debris' ? 5 : 1200; // Baseline ensemble mass
  const ke_mj = (0.5 * mass_kg * Math.pow(velocity * 1000, 2)) / 1000000;

  let decayString = '> 1000 Years (Stable)';
  let decayColor = '#00ffaa';
  if (alt_km < 300) { decayString = '< 1 Year (Critical)'; decayColor = '#ff4d4d'; }
  else if (alt_km < 450) { decayString = '1 - 5 Years'; decayColor = '#ffbb33'; }
  else if (alt_km < 600) { decayString = '5 - 25 Years'; decayColor = '#ffdd44'; }
  else if (alt_km < 800) { decayString = '25 - 100 Years'; decayColor = '#aaaaaa'; }

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
        <strong>{alt_km.toFixed(0)} km</strong>
      </div>
      
      <div className="data-row" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px' }}>
        <span style={{ color: '#aaa', fontSize: '12px' }}>Orbital Decay (Avg BC)</span>
        <strong style={{ fontSize: '13px', color: decayColor }}>{decayString}</strong>
      </div>
      
      <div className="data-row">
        <span style={{ color: '#aaa', fontSize: '12px' }}>Est. Kinetic Energy</span>
        <strong style={{ fontSize: '13px', color: '#ffbb33' }}>{ke_mj.toLocaleString(undefined, {maximumFractionDigits: 0})} MJ</strong>
      </div>
      <div className="data-row">
        <span>Risk Factor</span>
        <strong>{(satellite.riskFactor * 100).toFixed(1)}%</strong>
      </div>
    </div>
  );
}
