'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import * as THREE from 'three';

/**
 * Floatwheel ADV 3D Visualization
 *
 * EXACT SPECIFICATIONS (from claude-9 research):
 * - Board: 30" × 9.5" (76cm × 24cm)
 * - Wheel: 11.5" diameter × 6.5" wide (29cm × 16.5cm)
 * - Hub/Rim: 6" diameter
 * - Motor: 115mm × 90mm stator
 *
 * ORIENTATION:
 * - Board nose points toward +Z (forward)
 * - Wheel axis along X (left-right)
 * - Tire rotates around X for forward travel
 *
 * Scale: 1 unit ≈ 10 inches
 */

// Treaded tire component
function TreadedTire({ radius, width }: { radius: number; width: number }) {
  const { simulation } = usePlaygroundStore();

  const tireEmissive = useMemo(() => {
    const intensity = Math.min(simulation.speed / 40, 1);
    return new THREE.Color(0.05 * intensity, 0.1 * intensity, 0.15 * intensity);
  }, [simulation.speed]);

  return (
    <group>
      {/* Main tire body - cylinder with axis along X */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, width, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.95}
          metalness={0.05}
          emissive={tireEmissive}
        />
      </mesh>

      {/* Tire sidewalls */}
      <mesh position={[width / 2 - 0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.92, radius, 0.04, 32]} />
        <meshStandardMaterial color="#252525" roughness={0.9} />
      </mesh>
      <mesh position={[-width / 2 + 0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.92, radius, 0.04, 32]} />
        <meshStandardMaterial color="#252525" roughness={0.9} />
      </mesh>

      {/* Tread pattern - ridges around tire circumference */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const y = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh
            key={`tread-${i}`}
            position={[0, y, z]}
            rotation={[angle, 0, 0]}
          >
            <boxGeometry args={[width * 0.85, 0.025, 0.04]} />
            <meshStandardMaterial color="#0a0a0a" roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

// Hub motor component
function HubMotor({ isDangerZone, currentIntensity }: { isDangerZone: boolean; currentIntensity: number }) {
  return (
    <group>
      {/* Motor housing - axis along X */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.30, 0.30, 0.55, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.3}
          metalness={0.85}
        />
      </mesh>

      {/* Motor face plates - on left and right */}
      <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.02, 32]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.4}
          metalness={0.9}
          emissive={isDangerZone ? '#ef4444' : '#3b82f6'}
          emissiveIntensity={isDangerZone ? 0.5 : currentIntensity * 0.3}
        />
      </mesh>
      <mesh position={[-0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.02, 32]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.4}
          metalness={0.9}
          emissive={isDangerZone ? '#ef4444' : '#3b82f6'}
          emissiveIntensity={isDangerZone ? 0.5 : currentIntensity * 0.3}
        />
      </mesh>

      {/* Axle - 75mm visible, extends along X */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.70, 16]} />
        <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.95} />
      </mesh>

      {/* Motor cooling fins - around the housing */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={`fin-${i}`}
            position={[0, Math.cos(angle) * 0.26, Math.sin(angle) * 0.26]}
            rotation={[angle, 0, 0]}
          >
            <boxGeometry args={[0.45, 0.02, 0.06]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

// Main Floatwheel board component
function FloatwheelBoard() {
  const groupRef = useRef<THREE.Group>(null);
  const wheelRef = useRef<THREE.Group>(null);
  const { simulation, values } = usePlaygroundStore();

  const tiltbackDuty = values.tiltback_duty ?? 0.82;
  const isDangerZone = simulation.duty > tiltbackDuty;
  const isPushback = simulation.duty > tiltbackDuty * 0.95;

  // Animate wheel rotation and board pitch
  useFrame((state, delta) => {
    // Wheel rotation around X axis for forward travel (+Z direction)
    if (wheelRef.current) {
      const rotationSpeed = simulation.speed * 0.3;
      wheelRef.current.rotation.x -= rotationSpeed * delta; // Negative for forward
    }

    // Board pitch (nose up/down) - rotation around X axis
    if (groupRef.current) {
      const targetPitch = THREE.MathUtils.degToRad(simulation.pitch);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetPitch,
        0.1
      );

      // Vibration warning near duty limit
      if (isPushback) {
        groupRef.current.rotation.x += Math.sin(state.clock.elapsedTime * 10) * 0.012;
      }
    }
  });

  const boardColor = useMemo(() => {
    if (isDangerZone) return '#dc2626';
    return '#1e293b';
  }, [isDangerZone]);

  const currentIntensity = simulation.current / 100;

  // Board dimensions: 30" × 9.5" → 3.0 × 0.95 units
  // Board extends along Z (nose toward +Z)
  return (
    <group ref={groupRef} position={[0, 0.6, 0]}>
      {/* === BOARD DECK === */}
      {/* Main deck - 30" long (Z) × 9.5" wide (X) */}
      <mesh position={[0, 0.10, 0]}>
        <boxGeometry args={[0.95, 0.05, 3.0]} />
        <meshStandardMaterial
          color={boardColor}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Grip tape surface */}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.85, 0.01, 2.8]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} metalness={0} />
      </mesh>

      {/* === FOOTPADS === */}
      {/* Front footpad - toward +Z (nose) */}
      <mesh position={[0, 0.14, 0.95]}>
        <boxGeometry args={[0.72, 0.015, 0.65]} />
        <meshStandardMaterial
          color="#22c55e"
          roughness={0.6}
          emissive="#22c55e"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Rear footpad - toward -Z (tail) */}
      <mesh position={[0, 0.14, -0.95]}>
        <boxGeometry args={[0.72, 0.015, 0.65]} />
        <meshStandardMaterial
          color="#22c55e"
          roughness={0.6}
          emissive="#22c55e"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* === RAILS === */}
      {/* Front rail */}
      <mesh position={[0, 0.04, 1.25]} rotation={[Math.PI / 12, 0, 0]}>
        <boxGeometry args={[1.0, 0.07, 0.45]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Rear rail */}
      <mesh position={[0, 0.04, -1.25]} rotation={[-Math.PI / 12, 0, 0]}>
        <boxGeometry args={[1.0, 0.07, 0.45]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* === WHEEL ASSEMBLY === */}
      {/* Wheel group - centered, axis along X */}
      <group ref={wheelRef} position={[0, -0.18, 0]}>
        {/* Treaded tire - 11.5" diameter (0.575 radius), 6.5" width (0.65) */}
        <TreadedTire radius={0.575} width={0.65} />

        {/* Hub motor inside tire */}
        <HubMotor isDangerZone={isDangerZone} currentIntensity={currentIntensity} />
      </group>

      {/* === BATTERY INDICATOR LEDs === */}
      {[0, 1, 2, 3, 4].map((i) => {
        const batteryLevel = simulation.voltage / 4.2;
        const isLit = (i + 1) / 5 <= batteryLevel;
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#22c55e'];
        return (
          <mesh key={`led-${i}`} position={[0.45, 0.16, -0.4 + i * 0.18]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial
              color={isLit ? colors[i] : '#1e293b'}
              emissive={isLit ? colors[i] : '#000000'}
              emissiveIntensity={isLit ? 0.7 : 0}
            />
          </mesh>
        );
      })}

      {/* === DANGER GLOW === */}
      {isDangerZone && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.8, 16, 16]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.08 + Math.sin(Date.now() / 80) * 0.04}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}

// Ground with grid
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      <gridHelper args={[20, 40, '#334155', '#1e293b']} position={[0, 0, 0]} />
    </>
  );
}

// Main exported component
export function BoardVisualizer3D() {
  return (
    <div className="w-full h-full min-h-[400px] bg-slate-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [2.5, 1.8, 3.5], fov: 45 }}
        shadows
        gl={{ antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 4, -3]} intensity={0.3} />
        <pointLight position={[0, 3, 0]} intensity={0.2} color="#3b82f6" />

        {/* Scene */}
        <FloatwheelBoard />
        <Ground />

        {/* Environment and shadows */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
        <Environment preset="city" />

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
}
