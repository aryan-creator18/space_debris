import React, { useState } from 'react';
import { Search, Globe, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function SatelliteListPanel({ satellites, selectedSatellites, onSelectSatellite, onGlobalSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [globalResults, setGlobalResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter already loaded local satellites
  const filteredSatellites = satellites.filter(sat => 
    sat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sat.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGlobalSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      let queryUrl = '';
      if (!isNaN(searchTerm)) {
        queryUrl = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${searchTerm}&FORMAT=json`;
      } else {
        queryUrl = `https://celestrak.org/NORAD/elements/gp.php?NAME=${encodeURIComponent(searchTerm)}&FORMAT=json`;
      }
      
      const res = await axios.get(queryUrl);
      let formattedResults = [];
      if (res.data && Array.isArray(res.data)) {
        formattedResults = res.data.slice(0, 10).map(obj => ({
          id: obj.NORAD_CAT_ID.toString(),
          name: obj.OBJECT_NAME || `NORAD ${obj.NORAD_CAT_ID}`,
          type: 'Live Browser Fetch',
          _tlePayload: obj
        }));
      }
      setGlobalResults(formattedResults);
    } catch (err) {
      console.error("Global search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="glass-panel" style={{ 
      position: 'absolute', 
      top: '20px', 
      right: '20px', 
      width: '320px', 
      maxHeight: 'calc(100vh - 40px)', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '16px'
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Database ({satellites.length})</h2>
      
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <input 
          type="text" 
          placeholder="Search ID (e.g. 25544) or Name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
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

      <button 
        onClick={handleGlobalSearch}
        style={{
          width: '100%', padding: '6px', marginBottom: '16px',
          backgroundColor: 'rgba(0, 216, 255, 0.1)', border: '1px solid #00d8ff',
          color: '#00d8ff', borderRadius: '4px', cursor: 'pointer',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
          fontSize: '13px'
        }}
      >
        {isSearching ? <Loader2 size={14} className="spin" /> : <Globe size={14} />} 
        Search Global Space Track API
      </button>

      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px', 
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.3) transparent' }}>
        
        {/* Render Global Results if they exist */}
        {globalResults.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#00ffaa', marginBottom: '8px', fontWeight: 'bold' }}>Global Matches</div>
            {globalResults.map(res => (
              <div 
                key={`global-${res.id}`}
                onClick={() => {
                  onGlobalSelect(res._tlePayload ? res : res.id);
                  // Optional: clear search after picking
                  // setGlobalResults([]);
                }}
                style={{
                  padding: '10px 12px', marginBottom: '8px',
                  backgroundColor: 'rgba(0, 255, 170, 0.1)', border: '1px dashed #00ffaa',
                  borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column'
                }}
              >
                  <strong style={{ fontSize: '14px', color: '#fff' }}>{res.name}</strong>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>NORAD {res.id} • {res.type} </span>
                  <div style={{ fontSize: '11px', color: '#00d8ff', marginTop: '4px' }}>+ Track Orbit</div>
              </div>
            ))}
          </div>
        )}

        {/* Existing Local Array Map */}
        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#aaa', marginBottom: '8px', fontWeight: 'bold' }}>Currently Tracked</div>
        {filteredSatellites.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No localized matches.</div>
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
