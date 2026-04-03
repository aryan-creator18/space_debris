import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Loader2, Radio } from 'lucide-react';
import axios from 'axios';

export default function CollisionRiskPanel({ sat1, sat2, onClose, onPredictionUpdate }) {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [maneuverState, setManeuverState] = useState('idle');

  useEffect(() => {
    if (!sat1 || !sat2) return;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    setLoading(true);
    setManeuverState('idle');
    axios.post(`${API_URL}/predict/collision`, {
      sat1_id: parseInt(sat1.id),
      sat2_id: parseInt(sat2.id)
    }).then(res => {
      setPrediction(res.data);
      if (res.data.closest_approach && onPredictionUpdate) {
         onPredictionUpdate(res.data.closest_approach);
      }
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

  // Artificial UI Override to simulate successful hackathon maneuver
  if (maneuverState === 'cleared') {
    riskLevel = 'CLEARED';
    riskColor = '#00ffaa';
    distance = distance + 500.5; // Simulate shifting away
    probability = 0.0000;
  }

  const executeManeuver = () => {
    setManeuverState('transmitting');
    setTimeout(() => {
      setManeuverState('cleared');
    }, 1500);
  };

  return (
    <div className="glass-panel alert-panel" style={{ position: 'absolute', bottom: '45px', left: '20px', borderTop: `4px solid ${riskColor}`, minWidth: '450px' }}>
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
            <Loader2 className="spin" size={20} color="#00d8ff" />
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

            {/* Vibe Coding Interactivity Feature */}
            {maneuverState === 'idle' && probability > 0.05 && (
              <button 
                onClick={executeManeuver} 
                style={{
                  width: '100%', marginTop: '16px', padding: '10px',
                  backgroundColor: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444',
                  color: '#ff4444', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                }}
              >
                <Radio size={16} /> [ TRANSMIT AVOIDANCE MANEUVER ]
              </button>
            )}

            {maneuverState === 'transmitting' && (
              <div style={{ marginTop: '16px', textAlign: 'center', color: '#ffbb33', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <Loader2 className="spin" size={16} /> Uplinking thruster vectors...
              </div>
            )}

            {maneuverState === 'cleared' && (
              <div style={{ marginTop: '16px', textAlign: 'center', color: '#00ffaa', fontWeight: 'bold' }}>
                SUCCESS: Orbit shifted. Collision avoided.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
