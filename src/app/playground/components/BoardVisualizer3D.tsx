'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import * as THREE from 'three';

// Onewheel-style board component
function FloatwheelBoard() {
  const groupRef = useRef<THREE.Group>(null);
  const tireRef = useRef<THREE.Mesh>(null);
  const motorRef = useRef<THREE.Mesh>(null);
  const { simulation, values } = usePlaygroundStore();

  // Get parameters for visualization
  const tiltbackDuty = values.tiltback_duty ?? 0.82;
  const isDangerZone = simulation.duty > tiltbackDuty;
  const isPushback = simulation.duty > tiltbackDuty * 0.95;

  // Animate tire rotation based on speed
  useFrame((state, delta) => {
    if (tireRef.current) {
      // Tire rotates based on speed (radians per second)
      const rotationSpeed = simulation.speed * 0.5; // Adjust multiplier for visual effect
      tireRef.current.rotation.z += rotationSpeed * delta;
    }

    if (motorRef.current) {
      // Motor rotates with the tire
      motorRef.current.rotation.z += simulation.speed * 0.5 * delta;
    }

    // Board tilt based on pitch
    if (groupRef.current) {
      // Smooth interpolation to target pitch
      const targetRotation = THREE.MathUtils.degToRad(simulation.pitch);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotation,
        0.1
      );

      // Add subtle pushback tilt when approaching duty limit
      if (isPushback) {
        groupRef.current.rotation.x += Math.sin(state.clock.elapsedTime * 8) * 0.02;
      }
    }
  });

  // Dynamic colors based on state
  const boardColor = useMemo(() => {
    if (isDangerZone) return '#ef4444'; // Red danger
    return '#1e293b'; // Normal dark
  }, [isDangerZone]);

  const tireEmissive = useMemo(() => {
    const intensity = Math.min(simulation.speed / 40, 1);
    return new THREE.Color(0.1 * intensity, 0.2 * intensity, 0.3 * intensity);
  }, [simulation.speed]);

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* Board Deck */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[2.4, 0.1, 0.9]} />
        <meshStandardMaterial
          color={boardColor}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Grip Tape (top surface) */}
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[2.2, 0.02, 0.8]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Front Footpad */}
      <mesh position={[0.7, 0.23, 0]}>
        <boxGeometry args={[0.6, 0.02, 0.7]} />
        <meshStandardMaterial
          color="#22c55e"
          roughness={0.6}
          emissive="#22c55e"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Rear Footpad */}
      <mesh position={[-0.7, 0.23, 0]}>
        <boxGeometry args={[0.6, 0.02, 0.7]} />
        <meshStandardMaterial
          color="#22c55e"
          roughness={0.6}
          emissive="#22c55e"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Front Rail */}
      <mesh position={[0.9, 0.08, 0]} rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[0.6, 0.08, 0.95]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Rear Rail */}
      <mesh position={[-0.9, 0.08, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <boxGeometry args={[0.6, 0.08, 0.95]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Center Hub/Motor Housing */}
      <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.6, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Tire - Rotates based on speed */}
      <mesh ref={tireRef} position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.2, 16, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.9}
          metalness={0.1}
          emissive={tireEmissive}
        />
      </mesh>

      {/* Motor Core (visible through tire) */}
      <mesh ref={motorRef} position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.55, 8]} />
        <meshStandardMaterial
          color="#475569"
          roughness={0.5}
          metalness={0.7}
          emissive={isDangerZone ? '#ef4444' : '#3b82f6'}
          emissiveIntensity={isDangerZone ? 0.5 : simulation.current / 100}
        />
      </mesh>

      {/* Motor Spokes */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[0, -0.1, 0]}
          rotation={[Math.PI / 2, 0, (i * Math.PI) / 3]}
        >
          <boxGeometry args={[0.02, 0.5, 0.4]} />
          <meshStandardMaterial
            color="#64748b"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Battery Indicator Lights (on rail) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const batteryLevel = simulation.voltage / 4.2; // Normalized 0-1
        const isLit = (i + 1) / 5 <= batteryLevel;
        return (
          <mesh key={`led-${i}`} position={[-0.6 + i * 0.15, 0.26, 0.4]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color={isLit ? '#22c55e' : '#1e293b'}
              emissive={isLit ? '#22c55e' : '#000000'}
              emissiveIntensity={isLit ? 0.8 : 0}
            />
          </mesh>
        );
      })}

      {/* Danger glow effect */}
      {isDangerZone && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.1 + Math.sin(Date.now() / 100) * 0.05}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1e293b" roughness={1} />
    </mesh>
  );
}

// Stats overlay
function StatsOverlay() {
  const { simulation, values } = usePlaygroundStore();
  const tiltbackDuty = values.tiltback_duty ?? 0.82;
  const isDanger = simulation.duty > tiltbackDuty;

  return (
    <group position={[0, 2, 0]}>
      <Text
        position={[-1.5, 0, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="left"
      >
        {`Speed: ${simulation.speed.toFixed(1)} km/h`}
      </Text>
      <Text
        position={[-1.5, -0.3, 0]}
        fontSize={0.2}
        color={isDanger ? '#ef4444' : '#94a3b8'}
        anchorX="left"
      >
        {`Duty: ${(simulation.duty * 100).toFixed(0)}%`}
      </Text>
      <Text
        position={[0.5, 0, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="left"
      >
        {`Pitch: ${simulation.pitch > 0 ? '+' : ''}${simulation.pitch.toFixed(1)}°`}
      </Text>
      <Text
        position={[0.5, -0.3, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="left"
      >
        {`Current: ${simulation.current.toFixed(0)}A`}
      </Text>
    </group>
  );
}

// Main 3D visualizer component
export function BoardVisualizer3D() {
  const { simulation, values, isAnimating, lastChangedParam } = usePlaygroundStore();
  const tiltbackDuty = values.tiltback_duty ?? 0.82;

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
      <Canvas
        camera={{ position: [3, 2, 3], fov: 50 }}
        shadows
        dpr={[1, 2]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <spotLight
          position={[5, 10, 5]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
          shadow-mapSize={1024}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* The board */}
        <FloatwheelBoard />

        {/* Ground with shadows */}
        <Ground />
        <ContactShadows
          position={[0, -0.19, 0]}
          opacity={0.5}
          scale={10}
          blur={2}
          far={4}
        />

        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          autoRotate={!isAnimating}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* UI Overlays */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-sm">
        {/* Speed */}
        <div className="bg-slate-800/80 backdrop-blur px-3 py-2 rounded-lg">
          <div className="text-slate-400 text-xs">Speed</div>
          <div className="text-white font-mono">{simulation.speed.toFixed(1)} km/h</div>
        </div>

        {/* Pitch */}
        <div className="bg-slate-800/80 backdrop-blur px-3 py-2 rounded-lg">
          <div className="text-slate-400 text-xs">Pitch</div>
          <div className={`font-mono ${Math.abs(simulation.pitch) > 10 ? 'text-red-400' : 'text-white'}`}>
            {simulation.pitch > 0 ? '+' : ''}{simulation.pitch.toFixed(1)}°
          </div>
        </div>

        {/* Duty */}
        <div className="bg-slate-800/80 backdrop-blur px-3 py-2 rounded-lg">
          <div className="text-slate-400 text-xs">Duty</div>
          <div className={`font-mono ${simulation.duty > tiltbackDuty ? 'text-red-400' : 'text-white'}`}>
            {(simulation.duty * 100).toFixed(0)}%
          </div>
        </div>

        {/* Current */}
        <div className="bg-slate-800/80 backdrop-blur px-3 py-2 rounded-lg">
          <div className="text-slate-400 text-xs">Current</div>
          <div className="text-white font-mono">{simulation.current.toFixed(0)} A</div>
        </div>
      </div>

      {/* Parameter change indicator */}
      {isAnimating && lastChangedParam && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500/20 border border-green-500 px-4 py-2 rounded-full">
          <span className="text-green-400 text-sm font-medium">
            Adjusting: {lastChangedParam.replace(/_/g, ' ')}
          </span>
        </div>
      )}

      {/* Safety warning */}
      {simulation.duty > tiltbackDuty && (
        <div className="absolute top-4 right-4 bg-red-500/20 border border-red-500 px-3 py-2 rounded-lg animate-pulse">
          <span className="text-red-400 text-sm font-medium">⚠️ Pushback Active</span>
        </div>
      )}

      {/* 3D badge */}
      <div className="absolute top-4 left-4 bg-blue-500/20 border border-blue-500 px-3 py-1 rounded-full">
        <span className="text-blue-400 text-xs font-medium">3D View</span>
      </div>
    </div>
  );
}
