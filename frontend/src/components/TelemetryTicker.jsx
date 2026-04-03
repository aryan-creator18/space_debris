import React, { useState, useEffect } from 'react';

export default function TelemetryTicker() {
  const [tickerHtml, setTickerHtml] = useState('');

  useEffect(() => {
    const generateLogs = () => {
      let logs = '';
      for (let i = 0; i < 20; i++) {
        const id = Math.floor(Math.random() * 40000) + 10000;
        const events = ['ORBIT NOMINAL', 'DEBRIS TRAJECTORY UPDATED', 'CONJUNCTION RISK ASSESSED', 'TELEMETRY SYNCED', 'THREAT LEVEL LOW'];
        const evt = events[Math.floor(Math.random() * events.length)];
        const time = new Date(Date.now() - Math.random() * 10000000).toISOString().split('T')[1].substring(0, 8);
        logs += ` /// [UTC ${time}] NORAD ${id} - ${evt} `;
      }
      return logs + logs;
    };
    
    setTickerHtml(generateLogs());
  }, []);

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100vw',
      height: '30px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderTop: '1px solid rgba(0, 216, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      zIndex: 10,
      color: '#00d8ff',
      fontFamily: 'monospace',
      fontSize: '12px',
      whiteSpace: 'nowrap'
    }}>
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-content {
            display: inline-block;
            animation: marquee 60s linear infinite;
          }
        `}
      </style>
      <div className="ticker-content" style={{ fontWeight: 'bold', letterSpacing: '1px' }}>
        {tickerHtml}
      </div>
    </div>
  );
}
