import React, { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';

export default function GlobeVisualization({ 
  satellites, 
  onSelectSatellite, 
  selectedSatellites,
  intersectionPoint,
  focusMode,
  realTimeMode
}) {
  const globeRef = useRef();
  const [frameIndex, setFrameIndex] = useState(0);
  
  // High-performance React physics animation loop
  // Maps every satellite forward along its pre-calculated Cartesian trajectory path continuously
  useEffect(() => {
    let interval;
    if (realTimeMode) {
      // Real Time: 90 minutes / 200 points = ~27 seconds per frame advance
      interval = setInterval(() => {
        setFrameIndex(prev => (prev + 1) % 200);
      }, 27000); 
    } else {
      // HyperSpeed: Relaxed simulation (10 seconds per true revolution)
      interval = setInterval(() => {
        setFrameIndex(prev => (prev + 1) % 200);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [realTimeMode]);
  
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  useEffect(() => {
    if (globeRef.current && selectedSatellites.length > 0) {
      const latest = selectedSatellites[selectedSatellites.length - 1];
      globeRef.current.pointOfView({ 
        lat: latest.lat, 
        lng: latest.lng, 
        altitude: 1.5 
      }, 1200);
    }
  }, [selectedSatellites]);

  // Determine paths to show (only for selected satellites)
  const pathsData = selectedSatellites.map(sat => sat.path);

  // Filter which objects to actually render
  const baseSatellites = (focusMode && selectedSatellites.length > 0) ? selectedSatellites : satellites;

  // Map all base satellites to their live moving coordinates based on the frame index
  const animatedSatellites = baseSatellites.map(sat => {
    if (sat.path && sat.path.length > frameIndex) {
      return { ...sat, lat: sat.path[frameIndex].lat, lng: sat.path[frameIndex].lng, alt: sat.path[frameIndex].alt };
    }
    return sat;
  });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        objectsData={animatedSatellites}
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
        // Restoring high-velocity energy trace speed
        pathColor={() => 'rgba(0, 255, 0, 0.5)'}
        pathDashLength={0.1}
        pathDashGap={0.05}
        pathDashAnimateTime={10000}
        
        // Critical collision intersection mapping
        ringsData={intersectionPoint ? [intersectionPoint] : []}
        ringLat="lat"
        ringLng="lng"
        ringAltitude="alt"
        ringColor={() => 'rgba(255, 50, 50, 0.9)'}
        ringMaxRadius={5}
        ringPropagationSpeed={3}
        ringRepeatPeriod={800}
      />
    </div>
  );
}
