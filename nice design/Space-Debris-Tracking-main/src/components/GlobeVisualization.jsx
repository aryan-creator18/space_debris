import React, { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';

export default function GlobeVisualization({ 
  satellites, 
  onSelectSatellite, 
  selectedSatellites 
}) {
  const globeRef = useRef();
  
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  // Determine paths to show (only for selected satellites)
  const pathsData = selectedSatellites.map(sat => sat.path);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        objectsData={satellites}
        objectLat="lat"
        objectLng="lng"
        objectAltitude="alt"
        objectColor={(d) => {
          let color = d.type === 'Debris' ? 'rgba(255, 50, 50, 0.8)' : 'rgba(50, 200, 255, 0.8)';
          if (selectedSatellites.find(s => s.id === d.id)) color = '#00ff00'; // Highlight selected
          return color;
        }}
        objectLabel="name"
        onObjectClick={(obj) => onSelectSatellite(obj)}
        pathsData={pathsData}
        pathPoints={d => d}
        pathPointLat="lat"
        pathPointLng="lng"
        pathPointAlt="alt"
        pathColor={() => 'rgba(0, 255, 0, 0.5)'}
        pathDashLength={0.1}
        pathDashGap={0.05}
        pathDashAnimateTime={2000}
      />
    </div>
  );
}
