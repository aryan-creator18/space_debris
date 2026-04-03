import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function SatelliteListPanel({ satellites, selectedSatellites, onSelectSatellite }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSatellites = satellites.filter(sat => 
    sat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sat.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel" style={{ 
      position: 'absolute', 
      top: '20px', 
      right: '20px', 
      width: '300px', 
      maxHeight: 'calc(100vh - 40px)', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '16px'
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Database ({satellites.length})</h2>
      
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <input 
          type="text" 
          placeholder="Search ID or Name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
             width: '100%',
             padding: '8px 12px 8px 36px',
             backgroundColor: 'rgba(0,0,0,0.4)',
             border: '1px solid rgba(255,255,255,0.2)',
             borderRadius: '6px',
             color: '#fff',
             outline: 'none'
          }}
        />
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#aaa' }} />
      </div>

      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px', 
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.3) transparent' }}>
        {filteredSatellites.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No results found.</div>
        ) : (
          filteredSatellites.map(sat => {
            const isSelected = selectedSatellites.some(s => s.id === sat.id);
            return (
              <div 
                key={sat.id}
                onClick={() => onSelectSatellite(sat)}
                style={{
                  padding: '10px 12px',
                  marginBottom: '8px',
                  backgroundColor: isSelected ? 'rgba(0, 216, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isSelected ? '#00d8ff' : 'transparent'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)' }}
                onMouseOut={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
              >
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: isSelected ? '#00d8ff' : '#fff' }}>
                    {sat.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>
                    {sat.type} • Alt: {(sat.alt * 6371).toFixed(0)} km
                  </div>
                </div>
                {isSelected && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00d8ff' }} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
