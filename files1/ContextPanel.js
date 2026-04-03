import React from 'react';
import './ContextPanel.css';

function KesslerGauge({ value = 0.34 }) {
  // value 0-1
  const pct = Math.min(1, Math.max(0, value));
  const deg = -135 + pct * 270; // sweeps from -135 to +135 degrees
  const color = pct > 0.6 ? '#ff4444' : pct > 0.3 ? '#ffbb33' : '#00e676';
  return (
    <div className="gauge-container">
      <svg viewBox="0 0 120 80" className="gauge-svg">
        {/* Track */}
        <path d="M 15 70 A 50 50 0 1 1 105 70" fill="none" stroke="rgba(79,195,247,0.1)" strokeWidth="6" strokeLinecap="round" />
        {/* Fill */}
        <path
          d="M 15 70 A 50 50 0 1 1 105 70"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="157"
          strokeDashoffset={Math.round(157 * (1 - pct))}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s' }}
        />
        {/* Center text */}
        <text x="60" y="62" textAnchor="middle" fill={color} fontSize="18" fontWeight="700" fontFamily="Space Mono, monospace">
          {Math.round(pct * 100)}
        </text>
        <text x="60" y="74" textAnchor="middle" fill="#4a5578" fontSize="7" fontFamily="DM Sans, sans-serif" letterSpacing="0.1em">
          KESSLER INDEX
        </text>
      </svg>
    </div>
  );
}

function RegimeBar({ label, count, total, color }) {
  const pct = total > 0 ? count / total * 100 : 0;
  return (
    <div className="regime-row">
      <span className="regime-label">{label}</span>
      <div className="regime-track">
        <div className="regime-fill" style={{ width: `${pct}%`, background: color }}></div>
      </div>
      <span className="regime-count">{count}</span>
    </div>
  );
}

function ContextPanel({ stats }) {
  if (!stats) {
    return (
      <div className="ctx-panel">
        <div className="ctx-loading">Loading debris context…</div>
      </div>
    );
  }

  const regimes = stats.debris_by_regime || {};
  const totalRegime = Object.values(regimes).reduce((a, b) => a + b, 0);

  return (
    <div className="ctx-panel">
      {/* Left: Big numbers */}
      <div className="ctx-col">
        <div className="ctx-section-label">Global Debris Picture</div>
        <div className="big-stat-row">
          <div className="big-stat">
            <div className="big-num">27,000+</div>
            <div className="big-label">Tracked objects in orbit</div>
          </div>
          <div className="big-stat">
            <div className="big-num" style={{ color: '#ff8888' }}>500,000+</div>
            <div className="big-label">Objects &gt;1cm (untracked)</div>
          </div>
          <div className="big-stat">
            <div className="big-num" style={{ color: '#ffbb33' }}>170M+</div>
            <div className="big-label">Objects &gt;1mm</div>
          </div>
        </div>

        {/* Orbit regime breakdown */}
        <div className="ctx-section-label" style={{ marginTop: 12 }}>By Orbit Regime</div>
        <div className="regime-bars">
          <RegimeBar label="LEO" count={regimes.LEO || 0} total={totalRegime} color="#4fc3f7" />
          <RegimeBar label="MEO" count={regimes.MEO || 0} total={totalRegime} color="#7986cb" />
          <RegimeBar label="GEO" count={regimes.GEO || 0} total={totalRegime} color="#ffbb33" />
          <RegimeBar label="HEO" count={regimes.HEO || 0} total={totalRegime} color="#4db6ac" />
        </div>
      </div>

      {/* Center: Kessler gauge */}
      <div className="ctx-col ctx-center">
        <div className="ctx-section-label">Cascade Risk</div>
        <KesslerGauge value={stats.kessler_risk_index || 0.34} />
        <div className="kessler-desc">
          Kessler Syndrome risk index — a cascade of collisions could make LEO <em>permanently unusable</em>.
        </div>
        <div className="src-note">Source: {stats.sources}</div>
      </div>

      {/* Right: Timeline */}
      <div className="ctx-col">
        <div className="ctx-section-label">Historical Collisions</div>
        <div className="timeline">
          {(stats.historical_collisions || []).map((ev, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-year">{ev.year}</div>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-event">{ev.event}</div>
                <div className="timeline-impact">{ev.casualties}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContextPanel;
