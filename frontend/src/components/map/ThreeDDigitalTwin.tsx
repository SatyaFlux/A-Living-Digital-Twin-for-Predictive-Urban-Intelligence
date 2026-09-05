import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BuildingAsset, RoadAsset } from '../../types';
import { RotateCw, ZoomIn, ZoomOut, Layers, Info } from 'lucide-react';

interface ThreeDDigitalTwinProps {
  buildings: BuildingAsset[];
  roads: RoadAsset[];
  onSelectBuilding?: (building: BuildingAsset) => void;
}

export const ThreeDDigitalTwin: React.FC<ThreeDDigitalTwinProps> = ({
  buildings,
  roads,
  onSelectBuilding
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<BuildingAsset | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080d1a);
    scene.fog = new THREE.FogExp2(0x080d1a, 0.015);

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(40, 50, 60);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(30, 60, 40);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Ground Grid
    const gridHelper = new THREE.GridHelper(120, 40, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // Render 3D Road Corridors
    roads.forEach((r, idx) => {
      const startX = (r.start_lng - 77.21) * 3000;
      const startZ = (r.start_lat - 28.61) * 3000;
      const endX = (r.end_lng - 77.21) * 3000;
      const endZ = (r.end_lat - 28.61) * 3000;

      const curve = new THREE.LineCurve3(
        new THREE.Vector3(startX, 0.1, startZ),
        new THREE.Vector3(endX, 0.1, endZ)
      );

      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.6, 8, false);
      const roadColor = (r.current_congestion_pct || 50) > 75 ? 0xef4444 : ((r.current_congestion_pct || 50) > 50 ? 0xf59e0b : 0x10b981);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: roadColor,
        emissive: roadColor,
        emissiveIntensity: 0.4,
        roughness: 0.2
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tubeMesh);
    });

    // Render 3D Extruded Buildings
    const buildingMeshes: THREE.Mesh[] = [];
    buildings.forEach((b, idx) => {
      const x = (b.longitude - 77.21) * 3000;
      const z = (b.latitude - 28.61) * 3000;
      const height = Math.max(8, (b.floor_area_sqm / 5000) * 16);

      const geometry = new THREE.BoxGeometry(7, height, 7);
      const isAnom = b.is_anomaly;
      const color = isAnom ? 0xf43f5e : (b.building_type.includes('Data') ? 0x06b6d4 : 0x3b82f6);

      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: isAnom ? 0xf43f5e : 0x0c4a6e,
        emissiveIntensity: isAnom ? 0.8 : 0.3,
        roughness: 0.3,
        metalness: 0.5
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, height / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { building: b };
      scene.add(mesh);
      buildingMeshes.push(mesh);

      // Add wireframe edge highlight
      const edges = new THREE.EdgesGeometry(geometry);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
      );
      mesh.add(line);
    });

    // Particle Environmental Haze (AQI)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = Math.random() * 30 + 2;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.8,
      transparent: true,
      opacity: 0.4
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Raycaster for click selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingMeshes);

      if (intersects.length > 0) {
        const b = intersects[0].object.userData.building as BuildingAsset;
        setSelected(b);
        onSelectBuilding?.(b);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Animation Loop
    let animationFrameId: number;
    let angle = 0;
    const animate = () => {
      angle += 0.0015;
      camera.position.x = 65 * Math.cos(angle);
      camera.position.z = 65 * Math.sin(angle);
      camera.lookAt(0, 5, 0);

      // Pulse anomaly buildings
      buildingMeshes.forEach((mesh) => {
        if (mesh.userData.building?.is_anomaly) {
          const s = 1.0 + Math.sin(Date.now() * 0.006) * 0.08;
          mesh.scale.set(s, 1, s);
        }
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [buildings, roads, onSelectBuilding]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden glass-panel border border-slate-800/80">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
        <Layers className="w-4 h-4 text-cyan-400" />
        <span className="font-semibold text-white">Three.js 3D Digital Twin Viewport</span>
        <span className="text-[10px] text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
          WebGL Active
        </span>
      </div>

      {/* Selected Building Details Overlay */}
      {selected && (
        <div className="absolute bottom-4 left-4 z-10 max-w-sm glass-panel p-4 rounded-xl border border-cyan-500/40 bg-slate-950/90 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold">{selected.code}</span>
              <h4 className="text-sm font-bold text-white">{selected.name}</h4>
              <p className="text-xs text-slate-400">{selected.building_type}</p>
            </div>
            {selected.is_anomaly && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-500/50 animate-pulse">
                Anomaly Alert
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-500">Current Load</span>
              <p className="font-bold text-cyan-300">{selected.current_energy_kwh} kWh</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Peak Demand</span>
              <p className="font-bold text-amber-300">{selected.peak_demand_kw} kW</p>
            </div>
          </div>
        </div>
      )}

      {/* 3D Legend */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex flex-col space-y-1 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/60 text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
          <span className="text-slate-300">Data Center / Tech</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
          <span className="text-slate-300">Academic / Labs</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
          <span className="text-slate-300">Thermal / Grid Anomaly</span>
        </div>
      </div>
    </div>
  );
};
