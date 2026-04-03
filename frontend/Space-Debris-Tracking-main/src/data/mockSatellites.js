export const generateMockSatellites = (count = 100) => {
  const satellites = [];
  for (let i = 0; i < count; i++) {
    const isDebris = Math.random() > 0.7;
    const lat = (Math.random() - 0.5) * 180;
    const lng = (Math.random() - 0.5) * 360;
    const alt = Math.random() * 0.4 + 0.1; // Altitude scaled for Globe (0.1 to 0.5 Earth radii)
    
    // Generate a simple circular path representation
    const path = [];
    const numPoints = 60;
    const radiusLat = Math.random() * 20 + 10;
    const radiusLng = Math.random() * 20 + 10;
    for (let p = 0; p < numPoints; p++) {
      const angle = (p / numPoints) * Math.PI * 2;
      path.push({
        lat: lat + Math.sin(angle) * radiusLat, 
        lng: lng + Math.cos(angle) * radiusLng,
        alt: alt
      });
    }

    satellites.push({
      id: `sat-${i}`,
      name: isDebris ? `Debris Obj-${Math.floor(Math.random() * 9000) + 1000}` : `Sat-${Math.floor(Math.random() * 9000) + 1000}`,
      type: isDebris ? 'Debris' : 'Satellite',
      lat,
      lng,
      alt,
      velocity: (Math.random() * 7 + 3).toFixed(2), // km/s
      riskFactor: Math.random(), // 0 to 1
      path
    });
  }
  return satellites;
};
