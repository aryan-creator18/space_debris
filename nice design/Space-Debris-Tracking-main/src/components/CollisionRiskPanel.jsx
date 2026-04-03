import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function CollisionRiskPanel({ sat1, sat2, onClose }) {
  if (!sat1 || !sat2) return null;

  const combinedRisk = ((sat1.riskFactor + sat2.riskFactor) / 2) * 100;
  const distance = Math.abs(sat1.alt - sat2.alt) * 6371 + (Math.random() * 50);

  let riskLevel = 'Low';
  let riskColor = '#00ffaa';
  if (combinedRisk > 60) {
    riskLevel = 'High';
    riskColor = '#ff4d4d';
  } else if (combinedRisk > 30) {
    riskLevel = 'Medium';
    riskColor = '#ffb84d';
  }

  return (
    <div className="glass-panel alert-panel" style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', borderTop: `4px solid ${riskColor}`, minWidth: '400px' }}>
      <button className="close-btn" onClick={onClose}><X size={20} /></button>
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: riskColor }}>
        <AlertTriangle size={24} /> Collision Assessment
      </h2>
      
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '12px' }}>Object 1</div>
          <div style={{ fontWeight: 'bold' }}>{sat1.name}</div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', margin: '0 16px' }}>VS</div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '12px' }}>Object 2</div>
          <div style={{ fontWeight: 'bold' }}>{sat2.name}</div>
        </div>
      </div>

      <div style={{ marginTop: '24px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Risk Probability:</span>
          <strong style={{ color: riskColor }}>{combinedRisk.toFixed(1)}% ({riskLevel})</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Minimum Distance:</span>
          <strong>{distance.toFixed(2)} km</strong>
        </div>
      </div>
    </div>
  );
}
