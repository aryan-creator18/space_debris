import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const SAT_COLORS = [0xff4444, 0x4fc3f7, 0xffbb33, 0x00e676];
const SAT_COLORS_HEX = ['#ff4444', '#4fc3f7', '#ffbb33', '#00e676'];

function OrbitVisualization({ orbitData }) {
  const containerRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const earthRef = useRef();
  const earthGlowRef = useRef();
  const orbitGroupRef = useRef(new THREE.Group());
  const satelliteDotsRef = useRef([]);
  const animFrameRef = useRef();
  const stateRef = useRef({
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    theta: Math.PI / 4,
    phi: Math.PI / 4,
    radius: 28000,
  });

  const [cameraInfo, setCameraInfo] = useState({ x: 0, y: 0, z: 0 });
  const [hoverInfo, setHoverInfo] = useState(null);
  const [satProgress, setSatProgress] = useState([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Stars background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 200000;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 30, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 100, 200000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x05070f, 1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    scene.add(new THREE.AmbientLight(0x334466, 1.2));
    const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.5);
    sunLight.position.set(50000, 20000, 30000);
    scene.add(sunLight);
    const fillLight = new THREE.DirectionalLight(0x1a3a6a, 0.4);
    fillLight.position.set(-30000, -10000, -20000);
    scene.add(fillLight);

    // Earth — load texture if available, fallback to procedural
    const earthGeo = new THREE.SphereGeometry(6371, 64, 64);

    // Try to load NASA Blue Marble texture
    const textureLoader = new THREE.TextureLoader();
    let earthMat;

    // Procedural Earth fallback (works without texture files)
    earthMat = new THREE.MeshPhongMaterial({
      color: 0x1565c0,
      emissive: 0x0a1a3a,
      specular: 0x4fc3f7,
      shininess: 30,
    });

    // Try loading texture (will silently fail if not present)
    textureLoader.load(
      '/earth_daymap.jpg',
      (texture) => {
        earthMat.map = texture;
        earthMat.color.set(0xffffff);
        earthMat.needsUpdate = true;
      },
      undefined,
      () => {} // silence 404
    );

    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);
    earthRef.current = earth;

    // Earth atmosphere glow
    const glowGeo = new THREE.SphereGeometry(6600, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x1a4a8a,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    earthGlowRef.current = new THREE.Mesh(glowGeo, glowMat);
    scene.add(earthGlowRef.current);

    // Thin equatorial reference ring
    const ringGeo = new THREE.RingGeometry(6371, 6400, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x4fc3f7, side: THREE.DoubleSide, transparent: true, opacity: 0.08
    });
    const eqRing = new THREE.Mesh(ringGeo, ringMat);
    eqRing.rotation.x = Math.PI / 2;
    scene.add(eqRing);

    // Grid — subtle
    const gridHelper = new THREE.GridHelper(60000, 30, 0x1a2540, 0x0f1a2e);
    scene.add(gridHelper);

    // Distance rings
    const makeRing = (r, opacity) => {
      const g = new THREE.RingGeometry(r, r + 30, 128);
      const m = new THREE.MeshBasicMaterial({ color: 0x4fc3f7, side: THREE.DoubleSide, transparent: true, opacity });
      const mesh = new THREE.Mesh(g, m);
      mesh.rotation.x = Math.PI / 2;
      return mesh;
    };
    scene.add(makeRing(7000, 0.15));
    scene.add(makeRing(10000, 0.1));
    scene.add(makeRing(20200, 0.06)); // MEO/GPS altitude

    // Labels
    const makeLabel = (text, pos, color) => {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      c.width = 256; c.height = 48;
      ctx.fillStyle = color;
      ctx.font = '600 22px Space Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(text, 8, 32);
      const tex = new THREE.CanvasTexture(c);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      sp.position.copy(pos);
      sp.scale.set(2200, 420, 1);
      return sp;
    };
    scene.add(makeLabel('LEO  7,000km', new THREE.Vector3(7200, 0, 200), '#4fc3f7'));
    scene.add(makeLabel('MEO 10,000km', new THREE.Vector3(10200, 0, 200), '#8b9abf'));

    // Orbit lines group
    scene.add(orbitGroupRef.current);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Camera orbit controls
    const updateCamera = () => {
      const s = stateRef.current;
      const x = s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      const y = s.radius * Math.cos(s.phi);
      const z = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);
      setCameraInfo({ x: Math.round(x), y: Math.round(y), z: Math.round(z) });
    };
    updateCamera();

    const onMouseDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const s = stateRef.current;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (s.isDragging) {
        const dx = e.clientX - s.prevMouse.x;
        const dy = e.clientY - s.prevMouse.y;
        s.theta -= dx * 0.005;
        s.phi = Math.max(0.1, Math.min(Math.PI - 0.1, s.phi - dy * 0.005));
        s.prevMouse = { x: e.clientX, y: e.clientY };
        updateCamera();
      } else {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(earth);
        if (hits.length > 0) {
          const p = hits[0].point;
          const r = p.length();
          const lat = Math.asin(p.y / r) * 180 / Math.PI;
          const lon = Math.atan2(p.z, p.x) * 180 / Math.PI;
          setHoverInfo({
            x: p.x.toFixed(0), y: p.y.toFixed(0), z: p.z.toFixed(0),
            lat: lat.toFixed(2), lon: lon.toFixed(2),
            alt: (r - 6371).toFixed(0)
          });
        } else {
          setHoverInfo(null);
        }
      }
    };

    const onMouseUp = () => { stateRef.current.isDragging = false; };

    const onWheel = (e) => {
      e.preventDefault();
      stateRef.current.radius = Math.max(8000, Math.min(70000, stateRef.current.radius + e.deltaY * 15));
      updateCamera();
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animation
    let t = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      t += 0.001;
      if (earthRef.current) earth.rotation.y += 0.0003;

      // Animate satellite dots along orbits
      satelliteDotsRef.current.forEach((dot, idx) => {
        if (!dot || !dot.userData.points) return;
        const pts = dot.userData.points;
        const pIdx = Math.floor(t * 20 * (idx + 1)) % pts.length;
        const p = pts[pIdx];
        dot.position.set(p[0], p[1], p[2]);
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameRef.current);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mouseleave', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Update orbits when data changes
  useEffect(() => {
    if (!sceneRef.current) return;

    const group = orbitGroupRef.current;
    // Clear old
    while (group.children.length) group.remove(group.children[0]);
    satelliteDotsRef.current = [];

    if (!orbitData || orbitData.length === 0) return;

    orbitData.forEach((orbit, idx) => {
      if (!orbit?.orbit_points) return;
      const pts = orbit.orbit_points;
      const color = SAT_COLORS[idx % SAT_COLORS.length];

      // Orbit line
      const points = pts.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      points.push(points[0]); // close loop
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color, linewidth: 2, transparent: true, opacity: 0.8 });
      group.add(new THREE.Line(geo, mat));

      // Satellite dot (animated position)
      const dotGeo = new THREE.SphereGeometry(120, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.userData.points = pts;
      group.add(dot);
      satelliteDotsRef.current.push(dot);

      // Trail glow (small sphere at start)
      const glowGeo = new THREE.SphereGeometry(300, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.15
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.userData = { followDot: dot };
      group.add(glow);
    });

    // Draw closest approach line if 2 orbits
    if (orbitData.length >= 2) {
      const p1 = orbitData[0].orbit_points;
      const p2 = orbitData[1].orbit_points;
      if (p1 && p2) {
        // Find closest approach between two orbit arrays
        let minD = Infinity, minI = 0, minJ = 0;
        for (let i = 0; i < p1.length; i++) {
          for (let j = 0; j < p2.length; j++) {
            const d = Math.sqrt(
              (p1[i][0]-p2[j][0])**2 +
              (p1[i][1]-p2[j][1])**2 +
              (p1[i][2]-p2[j][2])**2
            );
            if (d < minD) { minD = d; minI = i; minJ = j; }
          }
        }
        // Red warning line between closest points
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...p1[minI]),
          new THREE.Vector3(...p2[minJ])
        ]);
        const lineMat = new THREE.LineDashedMaterial({
          color: 0xff4444, dashSize: 200, gapSize: 100, linewidth: 2
        });
        const approachLine = new THREE.Line(lineGeo, lineMat);
        approachLine.computeLineDistances();
        group.add(approachLine);
      }
    }
  }, [orbitData]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Camera HUD */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        background: 'rgba(11,15,30,0.85)',
        border: '1px solid rgba(79,195,247,0.15)',
        borderRadius: 8, padding: '12px 14px',
        fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#4a5578',
        backdropFilter: 'blur(8px)', minWidth: 160
      }}>
        <div style={{ color: '#4fc3f7', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Camera</div>
        {['x','y','z'].map(ax => (
          <div key={ax} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
            <span style={{ color: ax === 'x' ? '#ff8888' : ax === 'y' ? '#88ff88' : '#88aaff' }}>{ax.toUpperCase()}</span>
            <span style={{ color: '#8b9abf' }}>{cameraInfo[ax]?.toLocaleString()} km</span>
          </div>
        ))}
      </div>

      {/* Orbit legend */}
      {orbitData && orbitData.length > 0 && (
        <div style={{
          position: 'absolute', top: 16, left: 16,
          background: 'rgba(11,15,30,0.85)',
          border: '1px solid rgba(79,195,247,0.15)',
          borderRadius: 8, padding: '10px 14px',
          fontFamily: 'Space Mono, monospace', fontSize: 11,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ color: '#4fc3f7', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Orbits</div>
          {orbitData.map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 20, height: 2, background: SAT_COLORS_HEX[i % 4], borderRadius: 1 }}></div>
              <span style={{ color: '#8b9abf' }}>NORAD {o.sat_id}</span>
              {o.info?.regime && (
                <span style={{ color: '#4a5578', fontSize: 9 }}>{o.info.regime}</span>
              )}
            </div>
          ))}
          {orbitData.length >= 2 && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(79,195,247,0.1)', fontSize: 10, color: '#ff6666' }}>
              — Closest approach line
            </div>
          )}
        </div>
      )}

      {/* Hover tooltip */}
      {hoverInfo && (
        <div style={{
          position: 'absolute', bottom: 16, left: 16,
          background: 'rgba(11,15,30,0.92)',
          border: '1px solid rgba(79,195,247,0.25)',
          borderRadius: 8, padding: '12px 14px',
          fontFamily: 'Space Mono, monospace', fontSize: 11,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ color: '#4fc3f7', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Surface Point</div>
          <div style={{ color: '#8b9abf', lineHeight: 1.8 }}>
            <div>Lat: <span style={{ color: '#e8eaf6' }}>{hoverInfo.lat}°</span></div>
            <div>Lon: <span style={{ color: '#e8eaf6' }}>{hoverInfo.lon}°</span></div>
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        fontFamily: 'DM Sans, sans-serif', fontSize: 11,
        color: '#4a5578', textAlign: 'right', lineHeight: 1.8
      }}>
        <div>Drag to rotate</div>
        <div>Scroll to zoom</div>
      </div>
    </div>
  );
}

export default OrbitVisualization;
