'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import * as THREE from 'three';

/**
 * Floatwheel ADV 3D Visualization
 *
 * CORRECT SPECIFICATIONS:
 * - Tire: 11" x 6.5" (Forza+ treaded)
 * - Wheel diameter: 292-300mm (~11.5")
 * - Motor: 115mm x 90mm stator
 * - Board: ~27" length, ~10" width
 *
 * Scale: 1 unit ≈ 10 inches
 */

// Treaded tire component - more realistic than torus
function TreadedTire({ radius, width, tireRef }: { radius: number; width: number; tireRef: React.RefObject<THREE.Group> }) {
  const { simulation } = usePlaygroundStore();

  // Tire color based on speed
  const tireEmissive = useMemo(() => {
    const intensity = Math.min(simulation.speed / 40, 1);
    return new THREE.Color(0.05 * intensity, 0.1 * intensity, 0.15 * intensity);
  }, [simulation.speed]);

  return (
    <group ref={tireRef}>
      {/* Main tire body - cylinder oriented along Z axis */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[radius, radius, width, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.95}
          metalness={0.05}
          emissive={tireEmissive}
        />
      </mesh>

      {/* Tire sidewalls - slightly smaller radius */}
      <mesh position={[0, width / 2 - 0.02, 0]}>
        <cylinderGeometry args={[radius * 0.95, radius, 0.04, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
      <mesh position={[0, -width / 2 + 0.02, 0]}>
        <cylinderGeometry args={[radius * 0.95, radius, 0.04, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>

      {/* Tread pattern - ridges around tire */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh
            key={`tread-${i}`}
            position={[x, 0, z]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.03, width * 0.8, 0.02]} />
            <meshStandardMaterial color="#0f0f0f" roughness={1} />
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
      {/* Motor housing - 115mm diameter */}
      <mesh>
        <cylinderGeometry args={[0.45, 0.45, 0.55, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.3}
          metalness={0.85}
        />
      </mesh>

      {/* Motor face plates */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.02, 32]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.4}
          metalness={0.9}
          emissive={isDangerZone ? '#ef4444' : '#3b82f6'}
          emissiveIntensity={isDangerZone ? 0.5 : currentIntensity * 0.3}
        />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.02, 32]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.4}
          metalness={0.9}
          emissive={isDangerZone ? '#ef4444' : '#3b82f6'}
          emissiveIntensity={isDangerZone ? 0.5 : currentIntensity * 0.3}
        />
      </mesh>

      {/* Axle - 75mm visible */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.75, 16]} />
        <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.95} />
      </mesh>

      {/* Motor cooling fins */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={`fin-${i}`}
            position={[Math.cos(angle) * 0.38, 0, Math.sin(angle) * 0.38]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.02, 0.5, 0.08]} />
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
  const tireRef = useRef<THREE.Group>(null);
  const { simulation, values } = usePlaygroundStore();

  // Get parameters for visualization
  const tiltbackDuty = values.tiltback_duty ?? 0.82;
  const isDangerZone = simulation.duty > tiltbackDuty;
  const isPushback = simulation.duty > tiltbackDuty * 0.95;

  // Animate tire rotation and board tilt
  useFrame((state, delta) => {
    // Tire rotation - spins around Y axis (perpendicular to board travel direction)
    // Positive speed = forward = clockwise rotation when viewed from right side
    if (tireRef.current) {
      const rotationSpeed = simulation.speed * 0.3;
      tireRef.current.rotation.y += rotationSpeed * delta;
    }

    // Board tilt based on pitch
    if (groupRef.current) {
      const targetRotation = THREE.MathUtils.degToRad(simulation.pitch);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        targetRotation,
        0.1
      );

      // Subtle vibration when approaching duty limit
      if (isPushback) {
        groupRef.current.rotation.z += Math.sin(state.clock.elapsedTime * 10) * 0.015;
      }
    }
  });

  // Dynamic colors based on state
  const boardColor = useMemo(() => {
    if (isDangerZone) return '#dc2626';
    return '#1e293b';
  }, [isDangerZone]);

  const currentIntensity = simulation.current / 100;

  return (
    <group ref={groupRef} position={[0, 0.6, 0]}>
      {/* === BOARD DECK === */}
      {/* Main deck - 27" x 10" x 0.5" */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[2.7, 0.05, 1.0]} />
        <meshStandardMaterial
          color={boardColor}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Grip tape surface */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[2.5, 0.01, 0.9]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} metalness={0} />
      </mesh>

      {/* === FOOTPADS === */}
      {/* Front footpad (sensor pad) */}
      <mesh position={[0.85, 0.16, 0]}>
        <boxGeometry args={[0.7, 0.015, 0.75]} />
        <meshStandardMaterial
          color="#22c55e"
          roughness={0.6}
          emissive="#22c55e"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Rear footpad */}
      <mesh position={[-0.85, 0.16, 0]}>
        <boxGeometry args={[0.7, 0.015, 0.75]} />
        <meshStandardMaterial
          color="#22c55e"
          roughness={0.6}
          emissive="#22c55e"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* === RAILS === */}
      {/* Front rail - angled */}
      <mesh position={[1.1, 0.05, 0]} rotation={[0, 0, Math.PI / 10]}>
        <boxGeometry args={[0.5, 0.08, 1.05]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Rear rail - angled */}
      <mesh position={[-1.1, 0.05, 0]} rotation={[0, 0, -Math.PI / 10]}>
        <boxGeometry args={[0.5, 0.08, 1.05]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* === WHEEL ASSEMBLY === */}
      {/* Tire + Motor group - rotated 90° so axis is along Z (perpendicular to board) */}
      <group position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Treaded tire - 11.5" diameter (0.575 radius), 6.5" width (0.65) */}
        <TreadedTire radius={0.575} width={0.65} tireRef={tireRef} />

        {/* Hub motor inside tire */}
        <HubMotor isDangerZone={isDangerZone} currentIntensity={currentIntensity} />
      </group>

      {/* === BATTERY INDICATOR LEDs === */}
      {[0, 1, 2, 3, 4].map((i) => {
        const batteryLevel = simulation.voltage / 4.2;
        const isLit = (i + 1) / 5 <= batteryLevel;
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#22c55e'];
        return (
          <mesh key={`led-${i}`} position={[-0.5 + i * 0.18, 0.18, 0.48]}>
            <sphereGeometry args={[0.025, 8, 8]} />
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

// Status display
function StatusDisplay() {
  const { simulation, values } = usePlaygroundStore();
  const tiltbackDuty = values.tiltback_duty ?? 0.82;
  const isDangerZone = simulation.duty > tiltbackDuty;

  return (
    <group position={[0, 2.2, 0]}>
      {/* Speed indicator */}
      <mesh position={[-1.2, 0, 0]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0.8} />
      </mesh>

      {/* Duty indicator */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshBasicMaterial
          color={isDangerZone ? '#7f1d1d' : '#1e293b'}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Current indicator */}
      <mesh position={[1.2, 0, 0]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Main exported component
export function BoardVisualizer3D() {
  return (
    <div className="w-full h-full min-h-[400px] bg-slate-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [3.5, 2, 3.5], fov: 45 }}
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
        <StatusDisplay />

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
