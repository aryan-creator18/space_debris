import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function CollisionRiskPanel({ sat1, sat2, onClose }) {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (!sat1 || !sat2) return;

    setLoading(true);
    axios.post('http://localhost:5000/api/predict/collision', {
      sat1_id: parseInt(sat1.id),
      sat2_id: parseInt(sat2.id)
    }).then(res => {
      setPrediction(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });

  }, [sat1, sat2]);

  if (!sat1 || !sat2) return null;

  let riskLevel = 'Low';
  let riskColor = '#00ffaa';
  let distance = 0;
  let probability = 0;

  if (prediction) {
    riskLevel = prediction.risk_level;
    riskColor = prediction.risk_color || '#00ffaa';
    distance = prediction.min_orbit_distance_km;
    probability = prediction.collision_probability_pct;
  }

  return (
    <div className="glass-panel alert-panel" style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', borderTop: `4px solid ${riskColor}`, minWidth: '450px' }}>
      <button className="close-btn" onClick={onClose}><X size={20} /></button>
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: riskColor }}>
        <AlertTriangle size={24} /> ML Collision Assessment
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
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '10px' }}>
            <Loader2 className="animate-spin" size={20} color="#00d8ff" />
            <span>Analyzing orbital vectors...</span>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>XGBoost Probability:</span>
              <strong style={{ color: riskColor }}>{probability.toFixed(4)}% ({riskLevel})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Minimum Distance (MOID):</span>
              <strong>{distance.toFixed(2)} km</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa' }}>
              <span>Backend Engine:</span>
              <span>{prediction?.analysis?.method || 'Physics + ML'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
