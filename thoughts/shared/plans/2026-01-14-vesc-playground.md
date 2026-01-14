# VESC Playground - Interactive Learning Hub

## Implementation Plan

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-14
**Status:** APPROVED FOR DEVELOPMENT

---

## Executive Summary

VESC Playground is an interactive web application that transforms how riders learn, configure, and troubleshoot their VESC-based personal electric vehicles. It combines three powerful tools:

1. **Parameter Playground** - Drag sliders, see instant animated visualizations
2. **Safety Visualizer** - Real-time nosedive risk gauge and margin calculator
3. **Troubleshooting Wizard** - Guided problem-solving with animations

**Target Users:** VESC Onewheel/esk8 riders from beginner to advanced
**Primary Value:** Reduce learning curve, prevent crashes, solve problems faster
**Estimated Build Time:** 6-8 weeks for full MVP

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Desired End State](#desired-end-state)
3. [What We're NOT Doing](#what-were-not-doing)
4. [Technical Architecture](#technical-architecture)
5. [Phase 1: Foundation & Parameter Playground](#phase-1-foundation--parameter-playground)
6. [Phase 2: Safety Visualizer](#phase-2-safety-visualizer)
7. [Phase 3: Troubleshooting Wizard](#phase-3-troubleshooting-wizard)
8. [Phase 4: Integration & Polish](#phase-4-integration--polish)
9. [Animation Specifications](#animation-specifications)
10. [Data Models](#data-models)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Plan](#deployment-plan)

---

## Current State Analysis

### What Exists Now

| Tool | Strengths | Weaknesses |
|------|-----------|------------|
| VESC Tool | Full configuration access | Overwhelming UI, no visualization |
| Float Control | Safety checks, sliders | iOS only, no interactive learning |
| Floaty | Good UX, stats | Limited educational content |
| Float Hub | Setup wizards | $40, not web-based |
| pev.dev guides | Comprehensive | Static text, scattered |
| YouTube tutorials | Visual | Not interactive, outdated |

### Key Problems We're Solving

1. **"What does this parameter actually DO?"** - No visual feedback for parameter changes
2. **"How close am I to nosediving?"** - No real-time safety margin visualization
3. **"My motor detection failed, now what?"** - Scattered troubleshooting, trial and error
4. **"I'm afraid to change settings"** - No safe sandbox to experiment

### Existing Assets We'll Leverage

- **Knowledge Base:** 14 docs, 4000+ lines of verified content
- **AI Chatbot:** GPT-4o-mini + Supabase pgvector (already deployed)
- **VESC Source Code:** Reference for accurate parameter behaviors
- **Community Wisdom:** pev.dev, Discord, forum knowledge

---

## Desired End State

### User Journey: Beginner

```
1. Land on vesc-playground.vercel.app
2. See friendly welcome: "Learn VESC without risking a crash"
3. Click "Parameter Playground"
4. Drag "Tiltback Duty" slider from 80% to 95%
5. SEE animated rider getting pushed back less aggressively
6. SEE danger meter turn red
7. UNDERSTAND why 80% is safer than 95%
8. Feel confident adjusting real settings
```

### User Journey: Troubleshooting

```
1. Motor detection failed with error -10
2. Open Troubleshooting Wizard
3. Select "Motor Detection Failed"
4. Enter error code: -10
5. SEE animated explanation: "Flux linkage couldn't be measured"
6. Follow interactive checklist:
   [ ] Check motor phase connections
   [ ] Verify detection current is >1A
   [ ] Try spinning motor by hand first
7. Each step has animated diagram
8. Problem solved without Discord help
```

### User Journey: Safety Check

```
1. About to try new aggressive tune
2. Open Safety Visualizer
3. Input tune parameters (or paste XML)
4. SEE: "This tune has 12% duty headroom at top speed"
5. SEE: "Nosedive risk: MEDIUM-HIGH"
6. SEE: Comparison to recommended safe values
7. Decide to keep duty pushback at 82% instead of 90%
8. Avoid potential crash
```

### Success Metrics

| Metric | Target | How We Measure |
|--------|--------|----------------|
| Weekly Active Users | 1000+ | Analytics |
| Session Duration | >3 min | Analytics |
| Troubleshooting Completion | >60% | Funnel tracking |
| Community Shares | 50+/week | Social tracking |
| Support Questions Reduced | 30% fewer | Discord comparison |

---

## What We're NOT Doing

To keep scope manageable, we explicitly exclude:

- ❌ **Mobile app** - Web only (but mobile-responsive)
- ❌ **Real-time board connection** - No BLE/USB, just simulation
- ❌ **Tune storage/accounts** - No user auth in MVP
- ❌ **Video hosting** - Link to YouTube, don't host
- ❌ **Community features** - No comments/forums
- ❌ **Monetization** - Free, open source
- ❌ **Offline mode** - Requires internet
- ❌ **Multi-language** - English only for MVP

---

## Technical Architecture

### Stack Decision

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
│  Next.js 14 (App Router) + TypeScript                   │
│  ├── Tailwind CSS (styling)                             │
│  ├── Framer Motion (animations)                         │
│  ├── Three.js + React Three Fiber (3D visualizations)  │
│  ├── Recharts (graphs/gauges)                           │
│  └── Zustand (state management)                         │
├─────────────────────────────────────────────────────────┤
│                    BACKEND                               │
│  Next.js API Routes                                      │
│  ├── Supabase (existing - KB vectors)                   │
│  ├── OpenAI API (existing - chatbot)                    │
│  └── Edge Functions (parameter calculations)            │
├─────────────────────────────────────────────────────────┤
│                    DEPLOYMENT                            │
│  Vercel (existing infrastructure)                        │
│  ├── vesc-playground.vercel.app                         │
│  └── CDN for 3D assets                                  │
└─────────────────────────────────────────────────────────┘
```

### Why This Stack

| Choice | Reason |
|--------|--------|
| Next.js 14 | Already using for chatbot, SSR for SEO |
| Three.js | Best 3D web graphics, React integration |
| Framer Motion | Declarative animations, easy spring physics |
| Zustand | Simpler than Redux, good for sliders |
| Tailwind | Rapid UI development, consistent design |
| Vercel | Zero-config deployment, existing account |

### Directory Structure

```
vesc_it/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── playground/
│   │   │   ├── page.tsx                # Parameter Playground
│   │   │   ├── components/
│   │   │   │   ├── ParameterSlider.tsx
│   │   │   │   ├── BoardVisualizer.tsx
│   │   │   │   ├── PitchAnimation.tsx
│   │   │   │   └── CurrentFlowViz.tsx
│   │   │   └── hooks/
│   │   │       └── useParameterSimulation.ts
│   │   ├── safety/
│   │   │   ├── page.tsx                # Safety Visualizer
│   │   │   ├── components/
│   │   │   │   ├── RiskGauge.tsx
│   │   │   │   ├── HeadroomBars.tsx
│   │   │   │   ├── ThresholdStack.tsx
│   │   │   │   └── ScenarioSimulator.tsx
│   │   │   └── lib/
│   │   │       └── safetyCalculations.ts
│   │   ├── troubleshoot/
│   │   │   ├── page.tsx                # Troubleshooting Wizard
│   │   │   ├── [category]/
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── WizardFlow.tsx
│   │   │   │   ├── ErrorCodeLookup.tsx
│   │   │   │   ├── AnimatedDiagram.tsx
│   │   │   │   └── ChecklistStep.tsx
│   │   │   └── data/
│   │   │       └── troubleshootingFlows.ts
│   │   └── api/
│   │       ├── chat/route.ts           # Existing chatbot
│   │       ├── simulate/route.ts       # Parameter simulation
│   │       └── parse-xml/route.ts      # XML tune parser
│   ├── components/
│   │   ├── ui/                         # Shared UI components
│   │   ├── 3d/                         # 3D model components
│   │   └── animations/                 # Reusable animations
│   ├── lib/
│   │   ├── vesc/
│   │   │   ├── parameters.ts           # Parameter definitions
│   │   │   ├── physics.ts              # Physics calculations
│   │   │   └── xmlParser.ts            # VESC XML parsing
│   │   └── constants.ts
│   └── stores/
│       ├── playgroundStore.ts
│       └── safetyStore.ts
├── public/
│   ├── models/                         # 3D models (GLTF)
│   │   ├── onewheel.glb
│   │   ├── vesc.glb
│   │   └── motor.glb
│   └── animations/                     # Lottie files
└── thoughts/shared/plans/
    └── 2026-01-14-vesc-playground.md   # This file
```

---

## Phase 1: Foundation & Parameter Playground

**Duration:** 2 weeks
**Goal:** Interactive parameter visualization with 10 key parameters

### Week 1: Foundation

#### 1.1 Project Setup

**File:** `package.json`
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "@react-three/fiber": "^8.x",
    "@react-three/drei": "^9.x",
    "three": "^0.160.x",
    "framer-motion": "^11.x",
    "zustand": "^4.x",
    "recharts": "^2.x",
    "tailwindcss": "^3.x",
    "@radix-ui/react-slider": "^1.x"
  }
}
```

#### 1.2 Parameter Definition System

**File:** `src/lib/vesc/parameters.ts`
```typescript
export interface VESCParameter {
  id: string;
  name: string;
  category: 'balance' | 'safety' | 'motor' | 'filter';
  min: number;
  max: number;
  default: number;
  unit: string;
  description: string;
  safetyImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  visualization: 'pitch' | 'current' | 'gauge' | 'graph' | 'board';
  learnMoreUrl?: string;
}

export const PARAMETERS: VESCParameter[] = [
  // BALANCE PARAMETERS
  {
    id: 'kp',
    name: 'Proportional Gain (Kp)',
    category: 'balance',
    min: 0.1,
    max: 2.0,
    default: 0.8,
    unit: '',
    description: 'How aggressively the board responds to pitch changes. Higher = stiffer, lower = floatier.',
    safetyImpact: 'medium',
    visualization: 'pitch',
  },
  {
    id: 'ki',
    name: 'Integral Gain (Ki)',
    category: 'balance',
    min: 0,
    max: 0.5,
    default: 0.005,
    unit: '',
    description: 'Accumulates error over time. Helps maintain level on hills.',
    safetyImpact: 'low',
    visualization: 'pitch',
  },
  {
    id: 'mahony_kp',
    name: 'Mahony Filter Kp',
    category: 'filter',
    min: 0.1,
    max: 1.0,
    default: 0.4,
    unit: '',
    description: 'IMU filter responsiveness. Lower = smoother, higher = quicker response.',
    safetyImpact: 'medium',
    visualization: 'board',
  },

  // SAFETY PARAMETERS
  {
    id: 'tiltback_duty',
    name: 'Duty Tiltback Threshold',
    category: 'safety',
    min: 0.7,
    max: 1.0,
    default: 0.82,
    unit: '%',
    description: 'Motor duty at which pushback activates. Lower = more safety margin.',
    safetyImpact: 'critical',
    visualization: 'gauge',
  },
  {
    id: 'tiltback_duty_angle',
    name: 'Duty Tiltback Angle',
    category: 'safety',
    min: 1,
    max: 20,
    default: 10,
    unit: '°',
    description: 'How much nose lifts when pushback activates.',
    safetyImpact: 'high',
    visualization: 'pitch',
  },
  {
    id: 'tiltback_speed',
    name: 'Speed Tiltback (km/h)',
    category: 'safety',
    min: 15,
    max: 50,
    default: 30,
    unit: 'km/h',
    description: 'Speed at which pushback activates.',
    safetyImpact: 'critical',
    visualization: 'gauge',
  },
  {
    id: 'tiltback_lv',
    name: 'Low Voltage Threshold',
    category: 'safety',
    min: 2.8,
    max: 3.4,
    default: 3.2,
    unit: 'V/cell',
    description: 'Per-cell voltage that triggers LV pushback.',
    safetyImpact: 'critical',
    visualization: 'gauge',
  },

  // ATR PARAMETERS
  {
    id: 'atr_strength_up',
    name: 'ATR Strength (Accel)',
    category: 'balance',
    min: 0,
    max: 3,
    default: 1.0,
    unit: '',
    description: 'Nose-down tilt when accelerating. Higher = more aggressive lean.',
    safetyImpact: 'medium',
    visualization: 'pitch',
  },
  {
    id: 'atr_strength_down',
    name: 'ATR Strength (Decel)',
    category: 'balance',
    min: 0,
    max: 3,
    default: 0.8,
    unit: '',
    description: 'Nose-up tilt when braking.',
    safetyImpact: 'medium',
    visualization: 'pitch',
  },

  // BOOSTER
  {
    id: 'booster_current',
    name: 'Booster Current',
    category: 'safety',
    min: 0,
    max: 30,
    default: 15,
    unit: 'A',
    description: 'Extra current when nose drops unexpectedly. Surge protection.',
    safetyImpact: 'high',
    visualization: 'current',
  },
];
```

#### 1.3 Zustand Store

**File:** `src/stores/playgroundStore.ts`
```typescript
import { create } from 'zustand';
import { PARAMETERS, VESCParameter } from '@/lib/vesc/parameters';

interface PlaygroundState {
  // Current parameter values
  values: Record<string, number>;

  // Simulation state
  simulatedPitch: number;
  simulatedSpeed: number;
  simulatedDuty: number;
  simulatedCurrent: number;

  // Animation triggers
  isAnimating: boolean;
  lastChangedParam: string | null;

  // Actions
  setParameter: (id: string, value: number) => void;
  resetToDefaults: () => void;
  setSimulationState: (state: Partial<PlaygroundState>) => void;
}

const getDefaultValues = () => {
  return PARAMETERS.reduce((acc, param) => {
    acc[param.id] = param.default;
    return acc;
  }, {} as Record<string, number>);
};

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  values: getDefaultValues(),

  simulatedPitch: 0,
  simulatedSpeed: 0,
  simulatedDuty: 0,
  simulatedCurrent: 0,

  isAnimating: false,
  lastChangedParam: null,

  setParameter: (id, value) => {
    set((state) => ({
      values: { ...state.values, [id]: value },
      lastChangedParam: id,
      isAnimating: true,
    }));

    // Trigger simulation update
    setTimeout(() => {
      set({ isAnimating: false });
    }, 500);
  },

  resetToDefaults: () => {
    set({
      values: getDefaultValues(),
      simulatedPitch: 0,
      simulatedSpeed: 0,
      simulatedDuty: 0,
      simulatedCurrent: 0,
    });
  },

  setSimulationState: (newState) => {
    set(newState);
  },
}));
```

### Week 2: Visualizations

#### 1.4 Parameter Slider Component

**File:** `src/app/playground/components/ParameterSlider.tsx`
```tsx
'use client';

import { motion } from 'framer-motion';
import * as Slider from '@radix-ui/react-slider';
import { VESCParameter } from '@/lib/vesc/parameters';
import { usePlaygroundStore } from '@/stores/playgroundStore';

interface Props {
  parameter: VESCParameter;
}

const safetyColors = {
  none: 'bg-gray-500',
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export function ParameterSlider({ parameter }: Props) {
  const { values, setParameter } = usePlaygroundStore();
  const value = values[parameter.id];

  const percentage = ((value - parameter.min) / (parameter.max - parameter.min)) * 100;

  return (
    <motion.div
      className="bg-gray-800 rounded-lg p-4 space-y-3"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-white font-medium">{parameter.name}</h3>
          <p className="text-gray-400 text-sm">{parameter.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs ${safetyColors[parameter.safetyImpact]}`}>
            {parameter.safetyImpact}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[value]}
          min={parameter.min}
          max={parameter.max}
          step={(parameter.max - parameter.min) / 100}
          onValueChange={([v]) => setParameter(parameter.id, v)}
        >
          <Slider.Track className="bg-gray-700 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-5 h-5 bg-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={parameter.name}
          />
        </Slider.Root>

        <motion.span
          className="text-white font-mono w-20 text-right"
          key={value}
          initial={{ scale: 1.2, color: '#60A5FA' }}
          animate={{ scale: 1, color: '#FFFFFF' }}
        >
          {value.toFixed(2)} {parameter.unit}
        </motion.span>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{parameter.min} {parameter.unit}</span>
        <span className="text-gray-400">Default: {parameter.default}</span>
        <span>{parameter.max} {parameter.unit}</span>
      </div>
    </motion.div>
  );
}
```

#### 1.5 3D Board Visualizer

**File:** `src/app/playground/components/BoardVisualizer.tsx`
```tsx
'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import * as THREE from 'three';

function Board() {
  const meshRef = useRef<THREE.Group>(null);
  const { values, simulatedPitch, simulatedSpeed } = usePlaygroundStore();

  // Calculate target pitch based on parameters
  const targetPitch = useMemo(() => {
    const basePitch = simulatedPitch;
    const atrEffect = values.atr_strength_up * (simulatedSpeed / 30) * 5; // degrees
    const dutyEffect = simulatedDuty > values.tiltback_duty
      ? values.tiltback_duty_angle
      : 0;

    return THREE.MathUtils.degToRad(basePitch + atrEffect + dutyEffect);
  }, [values, simulatedPitch, simulatedSpeed]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth interpolation to target pitch
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetPitch,
        values.mahony_kp * 10 * delta // KP affects smoothing speed
      );

      // Subtle hover animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Simplified board geometry - replace with GLTF model */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.15, 0.6]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Wheel */}
      <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.5, 32]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Footpads */}
      <mesh position={[0.6, 0.08, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.55]} />
        <meshStandardMaterial color="#2d2d44" />
      </mesh>
      <mesh position={[-0.6, 0.08, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.55]} />
        <meshStandardMaterial color="#2d2d44" />
      </mesh>

      {/* Rider indicator (simple cone) */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#4a9eff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#1a1a1a" />
    </mesh>
  );
}

export function BoardVisualizer() {
  return (
    <div className="w-full h-[400px] bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [3, 2, 3], fov: 50 }}
        shadows
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        <Board />
        <Ground />

        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2}
        />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
```

#### 1.6 Pitch Response Animation

**File:** `src/app/playground/components/PitchAnimation.tsx`
```tsx
'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import { useEffect, useState } from 'react';

export function PitchAnimation() {
  const { values, isAnimating, lastChangedParam } = usePlaygroundStore();
  const [scenario, setScenario] = useState<'bump' | 'accel' | 'brake' | 'idle'>('idle');

  // Spring physics based on Kp value
  const springConfig = {
    stiffness: values.kp * 300,
    damping: 30 - (values.kp * 10),
  };

  const pitch = useSpring(0, springConfig);

  // Simulate different scenarios
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (scenario === 'bump') {
      // Simulate hitting a bump
      pitch.set(-15);
      setTimeout(() => pitch.set(0), 200);
    } else if (scenario === 'accel') {
      // Simulate acceleration
      pitch.set(-5 * values.atr_strength_up);
    } else if (scenario === 'brake') {
      // Simulate braking
      pitch.set(5 * values.atr_strength_down);
    } else {
      pitch.set(0);
    }

    return () => clearInterval(interval);
  }, [scenario, values]);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-white font-medium mb-4">Pitch Response Simulator</h3>

      {/* Scenario buttons */}
      <div className="flex gap-2 mb-6">
        {(['idle', 'bump', 'accel', 'brake'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScenario(s)}
            className={`px-4 py-2 rounded ${
              scenario === s
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Visual representation */}
      <div className="relative h-48 flex items-center justify-center">
        {/* Ground line */}
        <div className="absolute w-full h-px bg-gray-600" />

        {/* Board visualization */}
        <motion.div
          className="relative"
          style={{ rotate: pitch }}
        >
          {/* Board body */}
          <div className="w-40 h-3 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full" />

          {/* Wheel */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-600" />

          {/* Rider */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 bottom-2 w-6 h-12 bg-blue-500 rounded-t-full opacity-70"
            style={{ originY: 1 }}
          />
        </motion.div>

        {/* Angle indicator */}
        <motion.div
          className="absolute right-8 top-1/2 text-white font-mono"
          style={{ y: useTransform(pitch, (p) => -p * 2) }}
        >
          <motion.span>
            {useTransform(pitch, (p) => `${p.toFixed(1)}°`)}
          </motion.span>
        </motion.div>
      </div>

      {/* Parameter effects display */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="text-gray-400">
          <span className="text-white">Kp:</span> {values.kp.toFixed(2)}
          → {values.kp > 1 ? 'Stiff' : values.kp < 0.5 ? 'Floaty' : 'Balanced'}
        </div>
        <div className="text-gray-400">
          <span className="text-white">Mahony Kp:</span> {values.mahony_kp.toFixed(2)}
          → {values.mahony_kp > 0.6 ? 'Responsive' : values.mahony_kp < 0.3 ? 'Smooth' : 'Balanced'}
        </div>
      </div>
    </div>
  );
}
```

#### 1.7 Main Playground Page

**File:** `src/app/playground/page.tsx`
```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PARAMETERS, VESCParameter } from '@/lib/vesc/parameters';
import { ParameterSlider } from './components/ParameterSlider';
import { BoardVisualizer } from './components/BoardVisualizer';
import { PitchAnimation } from './components/PitchAnimation';
import { usePlaygroundStore } from '@/stores/playgroundStore';

const categories = ['balance', 'safety', 'filter'] as const;

export default function PlaygroundPage() {
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('balance');
  const { resetToDefaults } = usePlaygroundStore();

  const filteredParams = PARAMETERS.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">VESC Parameter Playground</h1>
            <p className="text-gray-400 mt-1">
              Drag sliders. See what happens. Learn without crashing.
            </p>
          </div>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
          >
            Reset All
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Visualizations */}
          <div className="space-y-6">
            <BoardVisualizer />
            <PitchAnimation />
          </div>

          {/* Right: Parameters */}
          <div className="space-y-6">
            {/* Category tabs */}
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    activeCategory === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Parameter sliders */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {filteredParams.map((param) => (
                  <ParameterSlider key={param.id} parameter={param} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Phase 1 Success Criteria

#### Automated Verification:
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] Lighthouse performance score > 80

#### Manual Verification:
- [ ] Sliders respond instantly (< 16ms)
- [ ] 3D board rotates smoothly based on parameters
- [ ] Pitch animation demonstrates Kp differences visually
- [ ] Reset button returns all values to defaults
- [ ] Mobile responsive layout works

---

## Phase 2: Safety Visualizer

**Duration:** 2 weeks
**Goal:** Real-time safety margin gauge and scenario simulator

### Week 3: Safety Calculations & Gauge

#### 2.1 Safety Calculation Engine

**File:** `src/app/safety/lib/safetyCalculations.ts`
```typescript
export interface BoardState {
  speed: number;           // km/h
  duty: number;            // 0-1
  current: number;         // Amps
  voltage: number;         // Per-cell voltage
  mosfetTemp: number;      // Celsius
  motorTemp: number;       // Celsius
  pitch: number;           // Degrees
  incline: number;         // Degrees (hill angle)
}

export interface SafetyConfig {
  tiltback_duty: number;
  tiltback_speed: number;
  tiltback_lv: number;
  tiltback_hv: number;
  motor_current_max: number;
  battery_current_max: number;
  mosfet_temp_max: number;
  motor_temp_max: number;
  // VESC 6.05+ critical settings
  fault_adc_half_erpm: number;       // Heel lift ERPM threshold - set to 0 for consistent behavior!
  surge_duty_start: number;          // Duty cycle where surge protection activates
  simple_stop_erpm: number;          // ERPM below which simple stop engages
}

export interface SafetyMargins {
  dutyHeadroom: number;        // 0-100%
  currentHeadroom: number;     // 0-100%
  voltageMargin: number;       // 0-100%
  thermalMargin: number;       // 0-100%
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
}

export function calculateSafetyMargins(
  state: BoardState,
  config: SafetyConfig
): SafetyMargins {
  const warnings: string[] = [];

  // Duty headroom
  const dutyHeadroom = Math.max(0, (config.tiltback_duty - state.duty) / config.tiltback_duty * 100);
  if (dutyHeadroom < 15) {
    warnings.push(`Duty at ${(state.duty * 100).toFixed(0)}% - pushback imminent`);
  }

  // Current headroom (how much more can the motor give?)
  const currentHeadroom = Math.max(0, (config.motor_current_max - state.current) / config.motor_current_max * 100);
  if (currentHeadroom < 20) {
    warnings.push(`Current at ${state.current.toFixed(0)}A - near motor limit`);
  }

  // Voltage margin (distance from LV cutoff)
  const voltageRange = config.tiltback_hv - config.tiltback_lv;
  const voltagePosition = (state.voltage - config.tiltback_lv) / voltageRange;
  const voltageMargin = Math.max(0, Math.min(100, voltagePosition * 100));
  if (voltageMargin < 20) {
    warnings.push(`Voltage at ${state.voltage.toFixed(2)}V/cell - LV warning`);
  }

  // Thermal margin
  const mosfetMargin = (config.mosfet_temp_max - state.mosfetTemp) / config.mosfet_temp_max * 100;
  const motorTempMargin = (config.motor_temp_max - state.motorTemp) / config.motor_temp_max * 100;
  const thermalMargin = Math.min(mosfetMargin, motorTempMargin);
  if (thermalMargin < 20) {
    warnings.push(`Temperature critical - ${state.mosfetTemp}°C MOSFET`);
  }

  // Overall risk assessment
  const minMargin = Math.min(dutyHeadroom, currentHeadroom, voltageMargin, thermalMargin);
  let overallRisk: SafetyMargins['overallRisk'];

  if (minMargin > 50) overallRisk = 'low';
  else if (minMargin > 30) overallRisk = 'medium';
  else if (minMargin > 15) overallRisk = 'high';
  else overallRisk = 'critical';

  return {
    dutyHeadroom,
    currentHeadroom,
    voltageMargin,
    thermalMargin,
    overallRisk,
    warnings,
  };
}

// Predict safety under different scenarios
export function predictScenario(
  baseState: BoardState,
  config: SafetyConfig,
  scenario: 'hill' | 'acceleration' | 'bump' | 'headwind'
): SafetyMargins {
  const modifiedState = { ...baseState };

  switch (scenario) {
    case 'hill':
      // 10% grade increases duty by ~15%
      modifiedState.duty = Math.min(1, baseState.duty * 1.15);
      modifiedState.current = baseState.current * 1.2;
      break;
    case 'acceleration':
      modifiedState.duty = Math.min(1, baseState.duty * 1.1);
      modifiedState.current = baseState.current * 1.3;
      break;
    case 'bump':
      // Sudden load spike
      modifiedState.current = baseState.current * 1.5;
      modifiedState.duty = Math.min(1, baseState.duty * 1.2);
      break;
    case 'headwind':
      modifiedState.duty = Math.min(1, baseState.duty * 1.1);
      break;
  }

  return calculateSafetyMargins(modifiedState, config);
}
```

#### 2.2 Risk Gauge Component

**File:** `src/app/safety/components/RiskGauge.tsx`
```tsx
'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { SafetyMargins } from '../lib/safetyCalculations';

interface Props {
  margins: SafetyMargins;
}

const riskColors = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

const riskLabels = {
  low: 'SAFE',
  medium: 'CAUTION',
  high: 'WARNING',
  critical: 'DANGER',
};

export function RiskGauge({ margins }: Props) {
  const overallValue = Math.min(margins.dutyHeadroom, margins.currentHeadroom, margins.voltageMargin);

  // Animated gauge rotation (0-180 degrees)
  const rotation = useSpring(
    180 - (overallValue / 100) * 180,
    { stiffness: 100, damping: 20 }
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Safety Margin</h3>

      {/* Gauge */}
      <div className="relative w-64 h-32 mx-auto">
        {/* Background arc */}
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Gradient segments */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="33%" stopColor="#f97316" />
              <stop offset="66%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (180 - (tick / 100) * 180) * (Math.PI / 180);
            const x = 100 + Math.cos(angle) * 70;
            const y = 90 - Math.sin(angle) * 70;
            return (
              <text
                key={tick}
                x={x}
                y={y}
                fill="#9ca3af"
                fontSize="10"
                textAnchor="middle"
              >
                {tick}%
              </text>
            );
          })}
        </svg>

        {/* Needle */}
        <motion.div
          className="absolute bottom-0 left-1/2 origin-bottom w-1 h-20 bg-white rounded-full"
          style={{
            rotate: rotation,
            translateX: '-50%',
          }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
        </motion.div>

        {/* Center cap */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-700 rounded-full border-4 border-gray-600" />
      </div>

      {/* Status label */}
      <motion.div
        className="text-center mt-4"
        animate={{ scale: margins.overallRisk === 'critical' ? [1, 1.1, 1] : 1 }}
        transition={{ repeat: margins.overallRisk === 'critical' ? Infinity : 0, duration: 0.5 }}
      >
        <span
          className="text-2xl font-bold"
          style={{ color: riskColors[margins.overallRisk] }}
        >
          {riskLabels[margins.overallRisk]}
        </span>
        <p className="text-gray-400 text-sm mt-1">
          {overallValue.toFixed(0)}% headroom
        </p>
      </motion.div>

      {/* Warnings */}
      {margins.warnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {margins.warnings.map((warning, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-900/30 border border-red-500/50 rounded px-3 py-2 text-red-300 text-sm"
            >
              ⚠️ {warning}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 2.3 Headroom Bars Component

**File:** `src/app/safety/components/HeadroomBars.tsx`
```tsx
'use client';

import { motion } from 'framer-motion';
import { SafetyMargins } from '../lib/safetyCalculations';

interface Props {
  margins: SafetyMargins;
}

const metrics = [
  { key: 'dutyHeadroom', label: 'Duty', icon: '⚡' },
  { key: 'currentHeadroom', label: 'Current', icon: '🔌' },
  { key: 'voltageMargin', label: 'Voltage', icon: '🔋' },
  { key: 'thermalMargin', label: 'Thermal', icon: '🌡️' },
] as const;

function getBarColor(value: number): string {
  if (value > 50) return 'bg-green-500';
  if (value > 30) return 'bg-yellow-500';
  if (value > 15) return 'bg-orange-500';
  return 'bg-red-500';
}

export function HeadroomBars({ margins }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-4">
      <h3 className="text-xl font-bold text-white">System Headroom</h3>

      {metrics.map(({ key, label, icon }) => {
        const value = margins[key];

        return (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">
                {icon} {label}
              </span>
              <span className={`font-mono ${value < 20 ? 'text-red-400' : 'text-gray-400'}`}>
                {value.toFixed(0)}%
              </span>
            </div>

            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getBarColor(value)} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ type: 'spring', stiffness: 100 }}
              />
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded" /> Safe
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded" /> Caution
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded" /> Danger
        </span>
      </div>
    </div>
  );
}
```

#### 2.4 Scenario Simulator

**File:** `src/app/safety/components/ScenarioSimulator.tsx`
```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoardState, SafetyConfig, predictScenario, SafetyMargins } from '../lib/safetyCalculations';
import { RiskGauge } from './RiskGauge';

interface Props {
  currentState: BoardState;
  config: SafetyConfig;
  currentMargins: SafetyMargins;
}

const scenarios = [
  { id: 'current', label: 'Current State', icon: '📍', description: 'Your current safety margins' },
  { id: 'hill', label: '+10% Hill', icon: '⛰️', description: 'Climbing a moderate hill' },
  { id: 'acceleration', label: 'Hard Accel', icon: '🚀', description: 'Aggressive acceleration' },
  { id: 'bump', label: 'Hit Bump', icon: '💥', description: 'Unexpected obstacle at speed' },
  { id: 'headwind', label: 'Headwind', icon: '💨', description: '15mph wind resistance' },
] as const;

export function ScenarioSimulator({ currentState, config, currentMargins }: Props) {
  const [selectedScenario, setSelectedScenario] = useState<string>('current');

  const displayMargins = selectedScenario === 'current'
    ? currentMargins
    : predictScenario(currentState, config, selectedScenario as any);

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">What-If Scenarios</h3>
      <p className="text-gray-400 text-sm mb-4">
        See how your safety margins change in different situations
      </p>

      {/* Scenario buttons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        {scenarios.map((scenario) => (
          <motion.button
            key={scenario.id}
            onClick={() => setSelectedScenario(scenario.id)}
            className={`p-3 rounded-lg text-center transition ${
              selectedScenario === scenario.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl block">{scenario.icon}</span>
            <span className="text-xs">{scenario.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Scenario description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedScenario}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center text-gray-400 mb-4"
        >
          {scenarios.find(s => s.id === selectedScenario)?.description}
        </motion.div>
      </AnimatePresence>

      {/* Comparison display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center">
          <h4 className="text-gray-400 text-sm mb-2">Current</h4>
          <div className="text-3xl font-bold" style={{
            color: currentMargins.overallRisk === 'low' ? '#22c55e' :
                   currentMargins.overallRisk === 'medium' ? '#eab308' :
                   currentMargins.overallRisk === 'high' ? '#f97316' : '#ef4444'
          }}>
            {Math.min(currentMargins.dutyHeadroom, currentMargins.currentHeadroom).toFixed(0)}%
          </div>
        </div>

        {selectedScenario !== 'current' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <h4 className="text-gray-400 text-sm mb-2">After {scenarios.find(s => s.id === selectedScenario)?.label}</h4>
            <div className="text-3xl font-bold" style={{
              color: displayMargins.overallRisk === 'low' ? '#22c55e' :
                     displayMargins.overallRisk === 'medium' ? '#eab308' :
                     displayMargins.overallRisk === 'high' ? '#f97316' : '#ef4444'
            }}>
              {Math.min(displayMargins.dutyHeadroom, displayMargins.currentHeadroom).toFixed(0)}%
            </div>

            {/* Delta indicator */}
            <motion.div
              className={`text-sm mt-1 ${
                displayMargins.dutyHeadroom < currentMargins.dutyHeadroom
                  ? 'text-red-400'
                  : 'text-green-400'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {displayMargins.dutyHeadroom < currentMargins.dutyHeadroom ? '↓' : '↑'}
              {Math.abs(displayMargins.dutyHeadroom - currentMargins.dutyHeadroom).toFixed(0)}%
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Warning if scenario is dangerous */}
      {displayMargins.overallRisk === 'critical' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 bg-red-900/30 border border-red-500 rounded-lg p-4 text-center"
        >
          <span className="text-red-400 font-bold">⚠️ HIGH NOSEDIVE RISK</span>
          <p className="text-red-300 text-sm mt-1">
            In this scenario, you have minimal safety margin. Consider lowering speed or adjusting tunes.
          </p>
        </motion.div>
      )}
    </div>
  );
}
```

#### 2.5 Safety Page

**File:** `src/app/safety/page.tsx`
```tsx
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RiskGauge } from './components/RiskGauge';
import { HeadroomBars } from './components/HeadroomBars';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import {
  BoardState,
  SafetyConfig,
  calculateSafetyMargins
} from './lib/safetyCalculations';

export default function SafetyPage() {
  // Simulated current state (in production, this would come from real telemetry or user input)
  const [boardState, setBoardState] = useState<BoardState>({
    speed: 25,
    duty: 0.72,
    current: 35,
    voltage: 3.6,
    mosfetTemp: 45,
    motorTemp: 55,
    pitch: 2,
    incline: 0,
  });

  // Safety configuration (from tune)
  const [config, setConfig] = useState<SafetyConfig>({
    tiltback_duty: 0.82,
    tiltback_speed: 32,
    tiltback_lv: 3.2,
    tiltback_hv: 4.2,
    motor_current_max: 60,
    battery_current_max: 40,
    mosfet_temp_max: 80,
    motor_temp_max: 100,
  });

  const margins = useMemo(
    () => calculateSafetyMargins(boardState, config),
    [boardState, config]
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Safety Visualizer</h1>
          <p className="text-gray-400 mt-1">
            Understand your safety margins. Prevent nosedives.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main Gauge */}
          <div className="lg:col-span-1">
            <RiskGauge margins={margins} />
          </div>

          {/* Middle: Headroom Bars */}
          <div className="lg:col-span-1">
            <HeadroomBars margins={margins} />
          </div>

          {/* Right: Current Values */}
          <div className="lg:col-span-1 bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Current State</h3>
            <div className="grid grid-cols-2 gap-4">
              <StateInput
                label="Speed"
                value={boardState.speed}
                unit="km/h"
                onChange={(v) => setBoardState({ ...boardState, speed: v })}
              />
              <StateInput
                label="Duty"
                value={boardState.duty * 100}
                unit="%"
                onChange={(v) => setBoardState({ ...boardState, duty: v / 100 })}
              />
              <StateInput
                label="Current"
                value={boardState.current}
                unit="A"
                onChange={(v) => setBoardState({ ...boardState, current: v })}
              />
              <StateInput
                label="Voltage"
                value={boardState.voltage}
                unit="V/cell"
                onChange={(v) => setBoardState({ ...boardState, voltage: v })}
              />
              <StateInput
                label="MOSFET"
                value={boardState.mosfetTemp}
                unit="°C"
                onChange={(v) => setBoardState({ ...boardState, mosfetTemp: v })}
              />
              <StateInput
                label="Motor"
                value={boardState.motorTemp}
                unit="°C"
                onChange={(v) => setBoardState({ ...boardState, motorTemp: v })}
              />
            </div>
          </div>
        </div>

        {/* Scenario Simulator - Full Width */}
        <div className="mt-6">
          <ScenarioSimulator
            currentState={boardState}
            config={config}
            currentMargins={margins}
          />
        </div>

        {/* Educational Section */}
        <div className="mt-6 bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Understanding Your Margins</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">⚡ Duty Headroom</h4>
              <p className="text-sm">
                How much motor capacity remains before pushback. At 100% duty,
                there's ZERO reserve for bumps or acceleration. Keep 20%+ headroom.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">🔌 Current Headroom</h4>
              <p className="text-sm">
                How much torque the motor can still provide. When current hits max,
                the board can't balance you anymore. This is the nosedive point.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">🔋 Voltage Margin</h4>
              <p className="text-sm">
                Distance from low voltage cutoff. Below LV threshold, the board
                aggressively tilts back. Below BMS cutoff = instant nosedive.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">🌡️ Thermal Margin</h4>
              <p className="text-sm">
                How close to overheating. High temps reduce performance and can
                trigger thermal throttling or shutdown.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper input component
function StateInput({
  label,
  value,
  unit,
  onChange
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-gray-400 text-sm">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        <input
          type="number"
          value={value.toFixed(1)}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
        />
        <span className="text-gray-500 text-sm w-12">{unit}</span>
      </div>
    </div>
  );
}
```

### Phase 2 Success Criteria

#### Automated Verification:
- [ ] Safety calculations match expected outputs for test cases
- [ ] No layout shifts during gauge animations
- [ ] All scenarios compute in < 50ms

#### Manual Verification:
- [ ] Gauge animates smoothly as values change
- [ ] Headroom bars update in real-time
- [ ] Scenario comparisons clearly show differences
- [ ] Critical warnings are visually prominent
- [ ] Educational content is accurate

---

## Phase 3: Troubleshooting Wizard

**Duration:** 2 weeks
**Goal:** Interactive problem-solving with animated diagrams

### Week 5: Flow Definition & Components

#### 3.1 Troubleshooting Flow Data

**File:** `src/app/troubleshoot/data/troubleshootingFlows.ts`
```typescript
export interface TroubleshootingStep {
  id: string;
  type: 'question' | 'action' | 'solution' | 'escalate';
  title: string;
  description: string;
  animation?: string;  // Lottie animation ID
  diagram?: string;    // SVG diagram ID
  options?: {
    label: string;
    nextStep: string;
  }[];
  checklist?: {
    text: string;
    hint?: string;
  }[];
  links?: {
    label: string;
    url: string;
  }[];
}

export interface TroubleshootingFlow {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: Record<string, TroubleshootingStep>;
  startStep: string;
}

export const TROUBLESHOOTING_FLOWS: TroubleshootingFlow[] = [
  // MOTOR DETECTION FLOW
  {
    id: 'motor-detection',
    title: 'Motor Detection Failed',
    description: 'Solve motor detection errors step by step',
    icon: '⚙️',
    startStep: 'start',
    steps: {
      'start': {
        id: 'start',
        type: 'question',
        title: 'What error code did you get?',
        description: 'Check the error message in VESC Tool after detection failed.',
        options: [
          { label: '-10 (Flux linkage failed)', nextStep: 'flux-linkage' },
          { label: '-1 (Bad motor values)', nextStep: 'bad-motor' },
          { label: '-100 to -129 (Fault during detection)', nextStep: 'fault-during' },
          { label: 'Detection runs but motor doesn\'t spin', nextStep: 'no-spin' },
          { label: 'Other / Unknown', nextStep: 'generic' },
        ],
      },

      'flux-linkage': {
        id: 'flux-linkage',
        type: 'action',
        title: 'Flux Linkage Detection Failed (-10)',
        description: 'The VESC couldn\'t measure the motor\'s magnetic field strength. This is usually a connection or current issue.',
        animation: 'motor-phases',
        checklist: [
          { text: 'Check all 3 motor phase wires are connected', hint: 'Look for loose bullet connectors' },
          { text: 'Verify phase wires aren\'t touching each other', hint: 'Shorted phases prevent detection' },
          { text: 'Increase detection current to 5-10A', hint: 'Motor Settings > FOC > Detection Current' },
          { text: 'Try spinning the wheel by hand during detection', hint: 'Helps if motor has high cogging' },
        ],
        options: [
          { label: 'Fixed! Detection works now', nextStep: 'success' },
          { label: 'Still failing', nextStep: 'flux-advanced' },
        ],
      },

      'flux-advanced': {
        id: 'flux-advanced',
        type: 'action',
        title: 'Advanced Flux Linkage Troubleshooting',
        description: 'Let\'s try some advanced fixes.',
        checklist: [
          { text: 'Measure resistance between phase wires (should be < 1 ohm)' },
          { text: 'Check motor temperature sensor is connected correctly' },
          { text: 'Try detection with motor disconnected from wheel' },
          { text: 'Use "RL" detection first, then "Lambda"' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Still not working', nextStep: 'escalate' },
        ],
      },

      'bad-motor': {
        id: 'bad-motor',
        type: 'action',
        title: 'Bad Motor Values (-1)',
        description: 'The detected values are outside expected range.',
        diagram: 'motor-params',
        checklist: [
          { text: 'Verify motor is compatible with VESC', hint: 'Check KV rating, phase count' },
          { text: 'Try manual parameter entry if you know specs' },
          { text: 'Check for motor damage (burnt smell, visual damage)' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Values still wrong', nextStep: 'escalate' },
        ],
      },

      'fault-during': {
        id: 'fault-during',
        type: 'question',
        title: 'Fault Occurred During Detection',
        description: 'A fault code was triggered. The last two digits indicate the specific fault.',
        options: [
          { label: 'Over voltage (-101)', nextStep: 'fault-overvolt' },
          { label: 'Under voltage (-102)', nextStep: 'fault-undervolt' },
          { label: 'DRV error (-103)', nextStep: 'fault-drv' },
          { label: 'Over current (-105)', nextStep: 'fault-overcurrent' },
          { label: 'Over temp (-107 or -115)', nextStep: 'fault-temp' },
          { label: 'Other fault', nextStep: 'fault-generic' },
        ],
      },

      'fault-overvolt': {
        id: 'fault-overvolt',
        type: 'action',
        title: 'Over Voltage Fault (-101)',
        description: 'Battery voltage exceeded VESC limits during detection.',
        checklist: [
          { text: 'Check battery is not fully charged during detection' },
          { text: 'Verify voltage settings match your battery (max voltage)' },
          { text: 'Check for regen issues - wheel might have spun' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Still getting this fault', nextStep: 'escalate' },
        ],
      },

      'fault-undervolt': {
        id: 'fault-undervolt',
        type: 'action',
        title: 'Under Voltage Fault (-102)',
        description: 'Battery voltage too low during detection.',
        checklist: [
          { text: 'Charge battery before detection (50%+ recommended)' },
          { text: 'Check battery connections for high resistance' },
          { text: 'Verify min voltage setting matches your battery' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Still failing', nextStep: 'escalate' },
        ],
      },

      'fault-drv': {
        id: 'fault-drv',
        type: 'action',
        title: 'DRV Error (-103)',
        description: 'The DRV8301/8302 gate driver chip detected a problem. This is often a hardware issue.',
        diagram: 'drv-chip',
        checklist: [
          { text: 'Power cycle the VESC completely' },
          { text: 'Check for visible damage on the VESC' },
          { text: 'Verify motor phase wires aren\'t shorted' },
          { text: 'Try a different motor if available' },
        ],
        options: [
          { label: 'Cleared after power cycle', nextStep: 'success' },
          { label: 'Keeps happening', nextStep: 'drv-failure' },
        ],
      },

      'drv-failure': {
        id: 'drv-failure',
        type: 'escalate',
        title: 'Possible DRV Chip Failure',
        description: 'Repeated DRV errors usually indicate hardware damage. The VESC may need repair or replacement.',
        links: [
          { label: 'VESC Repair Services', url: 'https://pev.dev/t/vesc-repair-services/123' },
          { label: 'DRV Replacement Guide', url: 'https://www.youtube.com/watch?v=drv-repair' },
        ],
      },

      'no-spin': {
        id: 'no-spin',
        type: 'action',
        title: 'Motor Doesn\'t Spin During Detection',
        description: 'Detection runs but wheel doesn\'t move.',
        checklist: [
          { text: 'Increase detection current (try 10-15A)' },
          { text: 'Check motor phase order isn\'t reversed' },
          { text: 'Verify motor isn\'t mechanically stuck' },
          { text: 'Try "Open Loop" mode for detection' },
        ],
        options: [
          { label: 'Motor spins now', nextStep: 'success' },
          { label: 'Still no movement', nextStep: 'escalate' },
        ],
      },

      'generic': {
        id: 'generic',
        type: 'action',
        title: 'General Detection Troubleshooting',
        description: 'Try these common fixes.',
        checklist: [
          { text: 'Update VESC firmware to latest version' },
          { text: 'Reset motor config to defaults before detection' },
          { text: 'Try detection with battery power, not USB only' },
          { text: 'Check detection current is appropriate for motor (5-15A typical)' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Still having issues', nextStep: 'escalate' },
        ],
      },

      'success': {
        id: 'success',
        type: 'solution',
        title: '✅ Problem Solved!',
        description: 'Great! Your motor detection should now work. Remember to write the motor configuration after successful detection.',
        links: [
          { label: 'Next: Configure App Settings', url: '/playground' },
          { label: 'Learn about FOC tuning', url: '/knowledge/foc-advanced' },
        ],
      },

      'escalate': {
        id: 'escalate',
        type: 'escalate',
        title: 'Need More Help',
        description: 'This issue might need community support or hardware inspection.',
        links: [
          { label: 'Ask on pev.dev Forum', url: 'https://pev.dev' },
          { label: 'Join VESC Discord', url: 'https://discord.gg/vesc' },
          { label: 'Ask our AI Chatbot', url: '/chat' },
        ],
      },
    },
  },

  // CAN BUS FLOW
  {
    id: 'can-bus',
    title: 'CAN Bus Not Working',
    description: 'Troubleshoot multi-VESC communication',
    icon: '🔌',
    startStep: 'start',
    steps: {
      'start': {
        id: 'start',
        type: 'question',
        title: 'What\'s the symptom?',
        description: 'How is CAN bus failing?',
        options: [
          { label: 'No devices found on CAN scan', nextStep: 'no-devices' },
          { label: 'Intermittent connection', nextStep: 'intermittent' },
          { label: 'Slave VESC not responding', nextStep: 'slave-silent' },
          { label: 'CAN detection failed (-51)', nextStep: 'detection-failed' },
        ],
      },

      'no-devices': {
        id: 'no-devices',
        type: 'action',
        title: 'No CAN Devices Found',
        description: 'The master VESC can\'t see any slaves.',
        diagram: 'can-wiring',
        checklist: [
          { text: 'Verify CAN H to CAN H, CAN L to CAN L wiring', hint: 'Crossed wires = no communication' },
          { text: 'Check each VESC has a UNIQUE CAN ID', hint: 'App Settings > General > VESC ID' },
          { text: 'Confirm CAN baud rate matches on all VESCs', hint: 'Usually 500K' },
          { text: 'Both VESCs must be powered on' },
        ],
        options: [
          { label: 'Found devices!', nextStep: 'success' },
          { label: 'Still nothing', nextStep: 'can-hardware' },
        ],
      },

      'can-hardware': {
        id: 'can-hardware',
        type: 'action',
        title: 'Check CAN Hardware',
        description: 'Physical layer troubleshooting.',
        checklist: [
          { text: 'Add 120Ω termination resistor at each end', hint: 'Not in the middle!' },
          { text: 'Try lower baud rate (125K)' },
          { text: 'Check for cable damage or loose connectors' },
          { text: 'Test with shorter cable if possible' },
        ],
        options: [
          { label: 'Working now', nextStep: 'success' },
          { label: 'Still failing', nextStep: 'escalate' },
        ],
      },

      'success': {
        id: 'success',
        type: 'solution',
        title: '✅ CAN Bus Working!',
        description: 'Your VESCs are communicating. Don\'t forget to configure CAN status messages if you need real-time data from slaves.',
      },

      'escalate': {
        id: 'escalate',
        type: 'escalate',
        title: 'Need More Help',
        description: 'CAN issues can be tricky. Consider getting community help.',
        links: [
          { label: 'CAN Bus Guide', url: '/knowledge/can-bus' },
          { label: 'Ask Community', url: 'https://pev.dev' },
        ],
      },

      // ... more CAN steps
    },
  },

  // BMS BYPASS FLOW - CRITICAL SAFETY
  {
    id: 'bms-bypass',
    title: 'BMS Bypass Issues',
    description: 'Troubleshoot charge-only BMS configuration safely',
    icon: '🔋',
    startStep: 'start',
    steps: {
      'start': {
        id: 'start',
        type: 'question',
        title: 'What BMS issue are you experiencing?',
        description: 'Select your symptom.',
        options: [
          { label: 'Board cuts out while riding', nextStep: 'cutout' },
          { label: 'BMS not charging correctly', nextStep: 'charge-issue' },
          { label: 'Want to bypass BMS for safety', nextStep: 'bypass-guide' },
          { label: 'Already bypassed but having issues', nextStep: 'bypass-check' },
        ],
      },

      'cutout': {
        id: 'cutout',
        type: 'action',
        title: 'BMS Cutout While Riding',
        description: 'Sudden power loss from BMS protection can cause NOSEDIVE. This is why charge-only bypass exists.',
        diagram: 'bms-cutout',
        checklist: [
          { text: 'Check if BMS has discharge current limit', hint: 'Many FM BMS cut at 30-40A' },
          { text: 'Check cell voltage under load', hint: 'One weak cell can trigger cutoff' },
          { text: 'Consider charge-only bypass for safety', hint: 'Removes BMS from discharge path' },
        ],
        options: [
          { label: 'I want to bypass discharge', nextStep: 'bypass-guide' },
          { label: 'Need to diagnose further', nextStep: 'escalate' },
        ],
      },

      'bypass-guide': {
        id: 'bypass-guide',
        type: 'action',
        title: '⚠️ CRITICAL: Charge-Only Bypass',
        description: 'There is a RIGHT way and a WRONG way to bypass BMS discharge.',
        diagram: 'bms-bypass-methods',
        checklist: [
          {
            text: '❌ WRONG: Bridging B- terminal directly',
            hint: 'This DISABLES overcharge protection → FIRE RISK from regen!'
          },
          {
            text: '✅ RIGHT: Charge-only wiring',
            hint: 'BMS monitors charging, VESC handles discharge. Regen protection preserved.'
          },
          { text: 'Set VESC voltage limits to match battery', hint: 'l_min_vin above cell minimum, l_max_vin below cell max' },
          { text: 'Configure LV tiltback above BMS cutoff voltage' },
        ],
        options: [
          { label: 'Show me wiring guides', nextStep: 'wiring-links' },
          { label: 'Already done, still having issues', nextStep: 'bypass-check' },
        ],
      },

      'wiring-links': {
        id: 'wiring-links',
        type: 'solution',
        title: 'Charge-Only Wiring Guides',
        description: 'Use these guides for the CORRECT charge-only method:',
        links: [
          { label: 'FM BMS Charge-Only Guide', url: 'https://pev.dev/t/guide-how-to-wire-fm-bms-as-charge-only-for-your-vesc/322' },
          { label: 'Pint BMS Bypass (Proper Method)', url: 'https://pev.dev/t/pint-vesc-fm-bms-bypass-the-proper-way/693' },
          { label: 'General VESC Setup', url: 'https://fallman.tech/onewheel-vesc/' },
        ],
      },

      'bypass-check': {
        id: 'bypass-check',
        type: 'question',
        title: 'Checking Your Bypass',
        description: 'How did you wire the BMS bypass?',
        options: [
          { label: 'I bridged the B- terminal', nextStep: 'b-minus-warning' },
          { label: 'BMS is on charge circuit only', nextStep: 'charge-only-check' },
          { label: 'Not sure / someone else did it', nextStep: 'verify-method' },
        ],
      },

      'b-minus-warning': {
        id: 'b-minus-warning',
        type: 'escalate',
        title: '🔥 DANGER: B- Bridge Method',
        description: 'Bridging B- DISABLES overcharge protection! Regenerative braking can overcharge your cells, causing thermal runaway and FIRE.',
        links: [
          { label: '⚠️ Rewire to charge-only method', url: 'https://pev.dev/t/guide-how-to-wire-fm-bms-as-charge-only-for-your-vesc/322' },
          { label: 'Understand the risks', url: '/knowledge/safety-critical-settings#bms-bypass' },
        ],
      },

      'charge-only-check': {
        id: 'charge-only-check',
        type: 'action',
        title: 'Verifying Charge-Only Setup',
        description: 'Your method is correct. Let\'s check the configuration.',
        checklist: [
          { text: 'VESC l_min_vin set above cell minimum (e.g., 3.0V × cells)' },
          { text: 'VESC l_max_vin set below cell maximum (e.g., 4.15V × cells)' },
          { text: 'LV tiltback triggers before VESC cutoff' },
          { text: 'HV tiltback set below max to prevent regen cutoff' },
        ],
        options: [
          { label: 'All configured correctly', nextStep: 'success' },
          { label: 'Need help with settings', nextStep: 'escalate' },
        ],
      },

      'success': {
        id: 'success',
        type: 'solution',
        title: '✅ BMS Configured Safely',
        description: 'Your charge-only bypass is correctly set up. Ride safe!',
      },

      'escalate': {
        id: 'escalate',
        type: 'escalate',
        title: 'Get Expert Help',
        description: 'BMS configuration is safety-critical. Consider getting community review.',
        links: [
          { label: 'pev.dev BMS Forum', url: 'https://pev.dev/c/battery/bms' },
          { label: 'Ask our AI Chatbot', url: '/chat' },
        ],
      },
    },
  },

  // FOOTPAD SENSOR FLOW
  {
    id: 'footpad-sensor',
    title: 'Footpad Sensor Issues',
    description: 'Troubleshoot engagement, disengagement, and sensor faults',
    icon: '👟',
    startStep: 'start',
    steps: {
      'start': {
        id: 'start',
        type: 'question',
        title: 'What footpad issue are you having?',
        options: [
          { label: 'Board won\'t engage (both feet on)', nextStep: 'no-engage' },
          { label: 'Board disengages while riding', nextStep: 'disengage' },
          { label: 'Heel lift not working at speed (6.05)', nextStep: 'heel-lift-speed' },
          { label: 'Sensor readings inconsistent', nextStep: 'calibration' },
        ],
      },

      'heel-lift-speed': {
        id: 'heel-lift-speed',
        type: 'action',
        title: '⚠️ VESC 6.05 Heel Lift Issue',
        description: 'After upgrading to VESC 6.05, heel lift may stop working at higher speeds. This is due to fault_adc_half_erpm behavior change.',
        diagram: 'heel-lift-erpm',
        checklist: [
          {
            text: 'Go to Refloat Cfg → Faults',
            hint: 'Find the fault_adc_half_erpm setting'
          },
          {
            text: 'Set fault_adc_half_erpm = 0',
            hint: 'This makes heel lift work at ALL speeds'
          },
          {
            text: 'Alternative: Set to very high value (15000+)',
            hint: 'Only disables above ~45+ mph'
          },
          { text: 'Write config and test heel lift at cruising speed' },
        ],
        options: [
          { label: 'Fixed! Heel lift works now', nextStep: 'success' },
          { label: 'Still not working', nextStep: 'escalate' },
        ],
      },

      'no-engage': {
        id: 'no-engage',
        type: 'action',
        title: 'Board Won\'t Engage',
        description: 'Check sensor connectivity and thresholds.',
        checklist: [
          { text: 'Check ADC1 and ADC2 readings in App Data', hint: 'Should change when stepping on sensors' },
          { text: 'Verify sensor wires are connected correctly' },
          { text: 'Check footpad type setting matches your hardware' },
          { text: 'Adjust ADC thresholds if sensors are registering' },
        ],
        options: [
          { label: 'Working now', nextStep: 'success' },
          { label: 'Sensors not reading', nextStep: 'sensor-hardware' },
        ],
      },

      'disengage': {
        id: 'disengage',
        type: 'action',
        title: 'Unexpected Disengagement',
        description: 'Board shuts off during ride. This is dangerous!',
        checklist: [
          { text: 'Increase fault_delay_switch_half', hint: 'Adds tolerance for brief sensor loss' },
          { text: 'Check for loose sensor connections' },
          { text: 'Verify grip tape isn\'t blocking sensor' },
          { text: 'Consider sensor upgrade if stock sensors failing' },
        ],
        options: [
          { label: 'Fixed', nextStep: 'success' },
          { label: 'Still disengaging', nextStep: 'escalate' },
        ],
      },

      'success': {
        id: 'success',
        type: 'solution',
        title: '✅ Footpad Working',
        description: 'Your sensors are properly configured.',
      },

      'escalate': {
        id: 'escalate',
        type: 'escalate',
        title: 'Need More Help',
        links: [
          { label: 'Footpad Sensor Guide', url: '/knowledge/footpad-sensors' },
          { label: 'Ask Community', url: 'https://pev.dev' },
        ],
      },
    },
  },

  // WIFI/BLE CONNECTION FLOW
  {
    id: 'wifi-ble',
    title: 'WiFi/BLE Connection Issues',
    description: 'Troubleshoot VESC Express wireless connectivity',
    icon: '📶',
    startStep: 'start',
    steps: {
      'start': {
        id: 'start',
        type: 'question',
        title: 'What connection issue?',
        options: [
          { label: 'Can\'t find device in app', nextStep: 'not-found' },
          { label: 'Connection keeps dropping', nextStep: 'drops' },
          { label: 'WiFi won\'t connect to network', nextStep: 'wifi-station' },
          { label: 'BLE pairing fails', nextStep: 'ble-pair' },
        ],
      },

      'not-found': {
        id: 'not-found',
        type: 'action',
        title: 'Device Not Visible',
        checklist: [
          { text: 'Verify VESC Express is powered and LED is on' },
          { text: 'Check BLE mode is not Disabled', hint: 'VESC Express → General → BLE Mode' },
          { text: 'BLE name must be ≤8 characters' },
          { text: 'Power cycle VESC Express' },
          { text: 'Move phone closer (within 10m)' },
        ],
        options: [
          { label: 'Found it!', nextStep: 'success' },
          { label: 'Still not visible', nextStep: 'escalate' },
        ],
      },

      'drops': {
        id: 'drops',
        type: 'action',
        title: 'Connection Drops',
        checklist: [
          { text: 'Stay within 10m range' },
          { text: 'Move away from other BLE devices' },
          { text: 'Update VESC Express firmware' },
          { text: 'Try Encrypted BLE mode instead of Open' },
        ],
        options: [
          { label: 'Stable now', nextStep: 'success' },
          { label: 'Still dropping', nextStep: 'escalate' },
        ],
      },

      'wifi-station': {
        id: 'wifi-station',
        type: 'action',
        title: 'WiFi Station Mode Issues',
        checklist: [
          { text: 'Verify your network is 2.4GHz (5GHz not supported!)' },
          { text: 'Double-check SSID and password' },
          { text: 'Move closer to router' },
          { text: 'Try AP mode first to verify device works' },
        ],
        options: [
          { label: 'Connected', nextStep: 'success' },
          { label: 'Still failing', nextStep: 'escalate' },
        ],
      },

      'success': {
        id: 'success',
        type: 'solution',
        title: '✅ Connected',
        description: 'Your wireless connection is working.',
      },

      'escalate': {
        id: 'escalate',
        type: 'escalate',
        title: 'Need More Help',
        links: [
          { label: 'WiFi/BLE Setup Guide', url: '/knowledge/vesc-express-wifi-ble-setup' },
          { label: 'VESC Express Docs', url: 'https://vesc-project.com/vesc_express' },
        ],
      },
    },
  },
];

export function getFlow(id: string): TroubleshootingFlow | undefined {
  return TROUBLESHOOTING_FLOWS.find(f => f.id === id);
}
```

#### 3.2 Wizard Flow Component

**File:** `src/app/troubleshoot/components/WizardFlow.tsx`
```tsx
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TroubleshootingFlow, TroubleshootingStep } from '../data/troubleshootingFlows';
import { AnimatedDiagram } from './AnimatedDiagram';
import { ChecklistStep } from './ChecklistStep';

interface Props {
  flow: TroubleshootingFlow;
}

export function WizardFlow({ flow }: Props) {
  const [currentStepId, setCurrentStepId] = useState(flow.startStep);
  const [history, setHistory] = useState<string[]>([]);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  const currentStep = flow.steps[currentStepId];

  const goToStep = useCallback((stepId: string) => {
    setHistory(prev => [...prev, currentStepId]);
    setCurrentStepId(stepId);
    setChecklistState({});
  }, [currentStepId]);

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const prevStep = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentStepId(prevStep);
    }
  }, [history]);

  const restart = useCallback(() => {
    setHistory([]);
    setCurrentStepId(flow.startStep);
    setChecklistState({});
  }, [flow]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-gray-400 text-sm">
          Step {history.length + 1}
        </span>
        <div className="flex-1 h-1 bg-gray-700 rounded">
          <motion.div
            className="h-full bg-blue-500 rounded"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((history.length + 1) * 20, 100)}%` }}
          />
        </div>
        {history.length > 0 && (
          <button
            onClick={goBack}
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Back
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepId}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          {/* Step header */}
          <div className="mb-6">
            <StepTypeBadge type={currentStep.type} />
            <h2 className="text-2xl font-bold text-white mt-2">
              {currentStep.title}
            </h2>
            <p className="text-gray-400 mt-2">
              {currentStep.description}
            </p>
          </div>

          {/* Diagram/Animation */}
          {(currentStep.diagram || currentStep.animation) && (
            <div className="mb-6">
              <AnimatedDiagram
                diagramId={currentStep.diagram}
                animationId={currentStep.animation}
              />
            </div>
          )}

          {/* Checklist */}
          {currentStep.checklist && (
            <div className="mb-6 space-y-3">
              <h3 className="text-white font-medium">Try these fixes:</h3>
              {currentStep.checklist.map((item, index) => (
                <ChecklistStep
                  key={index}
                  text={item.text}
                  hint={item.hint}
                  checked={checklistState[index.toString()] || false}
                  onChange={(checked) =>
                    setChecklistState(prev => ({ ...prev, [index.toString()]: checked }))
                  }
                />
              ))}
            </div>
          )}

          {/* Options/Buttons */}
          {currentStep.options && (
            <div className="space-y-2">
              {currentStep.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToStep(option.nextStep)}
                  className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          )}

          {/* External links */}
          {currentStep.links && (
            <div className="mt-6 space-y-2">
              {currentStep.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg text-blue-300 hover:bg-blue-900/50 transition"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          )}

          {/* Solution celebration */}
          {currentStep.type === 'solution' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-6 text-center"
            >
              <span className="text-6xl">🎉</span>
              <button
                onClick={restart}
                className="block mx-auto mt-4 px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg"
              >
                Start New Problem
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StepTypeBadge({ type }: { type: TroubleshootingStep['type'] }) {
  const styles = {
    question: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    action: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    solution: 'bg-green-500/20 text-green-300 border-green-500/50',
    escalate: 'bg-red-500/20 text-red-300 border-red-500/50',
  };

  const labels = {
    question: '❓ Question',
    action: '🔧 Try This',
    solution: '✅ Solved',
    escalate: '🆘 Get Help',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm border ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}
```

#### 3.3 Animated Diagram Component

**File:** `src/app/troubleshoot/components/AnimatedDiagram.tsx`
```tsx
'use client';

import { motion } from 'framer-motion';

interface Props {
  diagramId?: string;
  animationId?: string;
}

// SVG diagrams for different troubleshooting scenarios
const diagrams: Record<string, React.ReactNode> = {
  'motor-phases': (
    <svg viewBox="0 0 300 200" className="w-full h-48">
      {/* VESC box */}
      <rect x="20" y="60" width="80" height="80" rx="8" fill="#374151" stroke="#60A5FA" strokeWidth="2" />
      <text x="60" y="105" textAnchor="middle" fill="white" fontSize="12">VESC</text>

      {/* Motor */}
      <circle cx="220" cy="100" r="50" fill="#374151" stroke="#60A5FA" strokeWidth="2" />
      <text x="220" y="105" textAnchor="middle" fill="white" fontSize="12">Motor</text>

      {/* Phase wires */}
      <motion.path
        d="M 100 75 Q 160 60, 180 75"
        stroke="#EF4444"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d="M 100 100 L 170 100"
        stroke="#22C55E"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.path
        d="M 100 125 Q 160 140, 180 125"
        stroke="#3B82F6"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />

      {/* Labels */}
      <text x="140" y="50" fill="#EF4444" fontSize="10">Phase A</text>
      <text x="140" y="95" fill="#22C55E" fontSize="10">Phase B</text>
      <text x="140" y="155" fill="#3B82F6" fontSize="10">Phase C</text>

      {/* Check marks / X marks */}
      <motion.circle
        cx="140"
        cy="75"
        r="8"
        fill="#22C55E"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8 }}
      />
      <motion.path
        d="M 136 75 L 139 78 L 144 72"
        stroke="white"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1 }}
      />
    </svg>
  ),

  'can-wiring': (
    <svg viewBox="0 0 300 150" className="w-full h-40">
      {/* VESC 1 */}
      <rect x="20" y="40" width="60" height="70" rx="4" fill="#374151" stroke="#60A5FA" strokeWidth="2" />
      <text x="50" y="80" textAnchor="middle" fill="white" fontSize="10">VESC 1</text>
      <text x="50" y="95" textAnchor="middle" fill="#9CA3AF" fontSize="8">ID: 0</text>

      {/* VESC 2 */}
      <rect x="220" y="40" width="60" height="70" rx="4" fill="#374151" stroke="#60A5FA" strokeWidth="2" />
      <text x="250" y="80" textAnchor="middle" fill="white" fontSize="10">VESC 2</text>
      <text x="250" y="95" textAnchor="middle" fill="#9CA3AF" fontSize="8">ID: 1</text>

      {/* CAN H wire */}
      <motion.line
        x1="80" y1="55" x2="220" y2="55"
        stroke="#F59E0B"
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      <text x="150" y="50" textAnchor="middle" fill="#F59E0B" fontSize="10">CAN H</text>

      {/* CAN L wire */}
      <motion.line
        x1="80" y1="75" x2="220" y2="75"
        stroke="#8B5CF6"
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <text x="150" y="90" textAnchor="middle" fill="#8B5CF6" fontSize="10">CAN L</text>

      {/* Termination resistors */}
      <motion.rect
        x="85" y="50" width="20" height="10"
        fill="#10B981"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      />
      <motion.rect
        x="195" y="50" width="20" height="10"
        fill="#10B981"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      />
      <text x="150" y="130" textAnchor="middle" fill="#10B981" fontSize="9">120Ω termination at each end</text>
    </svg>
  ),

  'drv-chip': (
    <svg viewBox="0 0 300 150" className="w-full h-40">
      {/* VESC board */}
      <rect x="50" y="20" width="200" height="110" rx="8" fill="#1F2937" stroke="#374151" strokeWidth="2" />

      {/* DRV chip */}
      <motion.rect
        x="100" y="50" width="40" height="40"
        fill="#374151"
        stroke="#EF4444"
        strokeWidth="2"
        animate={{
          stroke: ['#EF4444', '#F59E0B', '#EF4444'],
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <text x="120" y="75" textAnchor="middle" fill="white" fontSize="8">DRV</text>

      {/* MOSFETs */}
      {[160, 185, 210].map((x, i) => (
        <rect key={i} x={x} y="50" width="15" height="25" fill="#374151" stroke="#60A5FA" />
      ))}
      <text x="190" y="90" textAnchor="middle" fill="#9CA3AF" fontSize="8">MOSFETs</text>

      {/* Warning indicator */}
      <motion.text
        x="120"
        y="110"
        textAnchor="middle"
        fill="#EF4444"
        fontSize="10"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        ⚠️ Check this chip
      </motion.text>
    </svg>
  ),
};

export function AnimatedDiagram({ diagramId, animationId }: Props) {
  const diagram = diagramId ? diagrams[diagramId] : null;

  if (!diagram) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      {diagram}
    </div>
  );
}
```

#### 3.4 Checklist Step Component

**File:** `src/app/troubleshoot/components/ChecklistStep.tsx`
```tsx
'use client';

import { motion } from 'framer-motion';

interface Props {
  text: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ChecklistStep({ text, hint, checked, onChange }: Props) {
  return (
    <motion.label
      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
        checked ? 'bg-green-900/20 border border-green-500/30' : 'bg-gray-700 hover:bg-gray-600'
      }`}
      whileTap={{ scale: 0.98 }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 rounded border-gray-500 bg-gray-800 text-green-500 focus:ring-green-500"
      />
      <div>
        <span className={`${checked ? 'text-green-300 line-through' : 'text-white'}`}>
          {text}
        </span>
        {hint && (
          <p className="text-gray-400 text-sm mt-1">💡 {hint}</p>
        )}
      </div>
    </motion.label>
  );
}
```

### Phase 3 Success Criteria

#### Automated Verification:
- [ ] All flow paths lead to solution or escalate (no dead ends)
- [ ] Back button works correctly
- [ ] Checklist state persists within session

#### Manual Verification:
- [ ] Diagrams animate smoothly
- [ ] Flow navigation feels intuitive
- [ ] Hints are helpful and accurate
- [ ] Escalation links work

---

## Phase 4: Integration & Polish

**Duration:** 1-2 weeks
**Goal:** Navigation, chatbot integration, responsive design, performance

### 4.1 Main Navigation

**File:** `src/app/layout.tsx`
```tsx
import { Navigation } from '@/components/Navigation';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 min-h-screen">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
```

**File:** `src/components/Navigation.tsx`
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/playground', label: 'Playground', icon: '🎮' },
  { href: '/safety', label: 'Safety', icon: '🛡️' },
  { href: '/troubleshoot', label: 'Troubleshoot', icon: '🔧' },
  { href: '/chat', label: 'Ask AI', icon: '💬' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-2 md:static md:border-t-0 md:border-b z-50">
      <div className="max-w-7xl mx-auto flex justify-around md:justify-start md:gap-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs md:text-sm">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### 4.2 Chatbot Integration

The existing chatbot should be enhanced with context awareness:

**File:** `src/app/api/chat/route.ts` (enhanced)
```typescript
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  const { message, context } = await request.json();

  // Get relevant KB content
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: message,
  });

  const { data: matches } = await supabase.rpc('match_documents', {
    query_embedding: embedding.data[0].embedding,
    match_threshold: 0.7,
    match_count: 5,
  });

  // Build context from matches
  const kbContext = matches?.map((m: any) => m.content).join('\n\n') || '';

  // Add page context if provided
  let pageContext = '';
  if (context?.currentPage === 'playground') {
    pageContext = `The user is on the Parameter Playground. They may be asking about specific parameters they're experimenting with.`;
  } else if (context?.currentPage === 'safety') {
    pageContext = `The user is on the Safety Visualizer. They may have questions about their current safety margins or nosedive risk.`;
  } else if (context?.currentPage === 'troubleshoot') {
    pageContext = `The user is troubleshooting a problem. They may need specific repair guidance.`;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are VESC Helper, an expert assistant for VESC-based personal electric vehicles.

${pageContext}

Use this knowledge base content to answer:
${kbContext}

Be concise, accurate, and safety-focused. If discussing dangerous topics, always emphasize proper precautions.`,
      },
      { role: 'user', content: message },
    ],
    max_tokens: 500,
  });

  return Response.json({
    response: response.choices[0].message.content,
  });
}
```

### 4.3 Landing Page

**File:** `src/app/page.tsx`
```tsx
import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  {
    href: '/playground',
    icon: '🎮',
    title: 'Parameter Playground',
    description: 'Drag sliders, see what happens. Learn VESC parameters through interactive visualization.',
    color: 'from-blue-500 to-purple-500',
  },
  {
    href: '/safety',
    icon: '🛡️',
    title: 'Safety Visualizer',
    description: 'See your nosedive risk in real-time. Understand your safety margins before they matter.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    href: '/troubleshoot',
    icon: '🔧',
    title: 'Troubleshooting Wizard',
    description: 'Fix problems step by step with animated diagrams. No more guessing.',
    color: 'from-orange-500 to-red-500',
  },
  {
    href: '/chat',
    icon: '💬',
    title: 'Ask AI',
    description: 'Chat with our AI trained on VESC documentation. Get instant expert answers.',
    color: 'from-pink-500 to-rose-500',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero */}
      <section className="py-20 px-6 text-center">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          VESC Playground
        </motion.h1>
        <motion.p
          className="text-xl text-gray-400 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Learn VESC without risking a crash. Interactive tools for understanding,
          configuring, and troubleshooting your board.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/playground"
            className="inline-block px-8 py-4 bg-blue-500 hover:bg-blue-400 rounded-lg font-medium text-lg transition"
          >
            Start Exploring →
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="group relative overflow-hidden rounded-2xl bg-gray-800 p-8 hover:bg-gray-750 transition">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition`} />
                  <span className="text-5xl mb-4 block">{feature.icon}</span>
                  <h2 className="text-2xl font-bold mb-2">{feature.title}</h2>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-400">14</div>
            <div className="text-gray-400">KB Articles</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400">10+</div>
            <div className="text-gray-400">Parameters</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-400">5</div>
            <div className="text-gray-400">Troubleshooting Flows</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-pink-400">∞</div>
            <div className="text-gray-400">Crashes Prevented</div>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-16 px-6 bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Built for the Community</h2>
          <p className="text-gray-400 mb-8">
            VESC Playground is open source and built with love for the PEV community.
            Contribute on GitHub or join the discussion.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/gergosnoo/vesc_it"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              GitHub →
            </a>
            <a
              href="https://pev.dev"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              pev.dev →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### Phase 4 Success Criteria

#### Automated Verification:
- [ ] Lighthouse score > 90 (Performance)
- [ ] All pages load in < 3 seconds
- [ ] No console errors
- [ ] Mobile responsive (tested at 375px, 768px, 1024px)

#### Manual Verification:
- [ ] Navigation works on mobile (bottom bar)
- [ ] Navigation works on desktop (top bar)
- [ ] Chatbot has context awareness
- [ ] Landing page is compelling
- [ ] All features are discoverable

---

## Animation Specifications

### Required Animations

| Animation | Type | Duration | Trigger |
|-----------|------|----------|---------|
| Slider value change | Spring | 300ms | On drag |
| Board pitch | Spring (Kp-based) | Variable | Parameter change |
| Gauge needle | Spring | 500ms | Value change |
| Headroom bar fill | Spring | 300ms | Value change |
| Step transition | Slide + Fade | 200ms | Navigation |
| Checklist check | Scale + Color | 150ms | Click |
| Diagram drawing | Path animation | 500ms | On mount |
| Warning pulse | Infinite scale | 500ms | Risk = critical |

### Spring Physics Configuration

```typescript
// For board physics (responds to Kp setting)
const boardSpring = {
  stiffness: kp * 300,  // Higher Kp = stiffer spring
  damping: 30 - (kp * 10),  // Higher Kp = less damping
};

// For UI elements
const uiSpring = {
  stiffness: 300,
  damping: 30,
};

// For gauges
const gaugeSpring = {
  stiffness: 100,
  damping: 20,
};
```

---

## Data Models

### Parameter State
```typescript
interface ParameterState {
  values: Record<string, number>;
  dirty: boolean;  // Changed from defaults
  lastChanged: string | null;
}
```

### Board Simulation State
```typescript
interface SimulationState {
  pitch: number;
  roll: number;
  speed: number;
  duty: number;
  current: number;
  voltage: number;
  temperature: {
    mosfet: number;
    motor: number;
  };
  sat: 'none' | 'centering' | 'speed' | 'duty' | 'lv' | 'hv' | 'temp';
}
```

### Troubleshooting Session
```typescript
interface TroubleshootingSession {
  flowId: string;
  currentStepId: string;
  history: string[];
  checklistState: Record<string, boolean>;
  startedAt: Date;
  completedAt?: Date;
  outcome?: 'solved' | 'escalated' | 'abandoned';
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// Parameter calculations
describe('calculateSafetyMargins', () => {
  it('returns critical when duty > 95%', () => {
    const result = calculateSafetyMargins(
      { ...defaultState, duty: 0.96 },
      defaultConfig
    );
    expect(result.overallRisk).toBe('critical');
  });

  it('returns low risk with safe values', () => {
    const result = calculateSafetyMargins(
      { ...defaultState, duty: 0.5 },
      defaultConfig
    );
    expect(result.overallRisk).toBe('low');
  });
});

// Troubleshooting flows
describe('troubleshooting flows', () => {
  it('all flows have valid start step', () => {
    TROUBLESHOOTING_FLOWS.forEach(flow => {
      expect(flow.steps[flow.startStep]).toBeDefined();
    });
  });

  it('all options lead to valid steps', () => {
    TROUBLESHOOTING_FLOWS.forEach(flow => {
      Object.values(flow.steps).forEach(step => {
        step.options?.forEach(option => {
          expect(flow.steps[option.nextStep]).toBeDefined();
        });
      });
    });
  });
});
```

### Integration Tests

```typescript
// Playwright E2E tests
test('parameter playground slider updates visualization', async ({ page }) => {
  await page.goto('/playground');

  // Find Kp slider
  const slider = page.locator('[aria-label="Proportional Gain (Kp)"]');

  // Drag to max
  await slider.dragTo(slider.locator('..'), { targetPosition: { x: 200, y: 0 } });

  // Verify board animation responds
  await expect(page.locator('.board-visualizer')).toHaveCSS('transform', /rotate/);
});

test('safety gauge shows warning at high duty', async ({ page }) => {
  await page.goto('/safety');

  // Set duty to 90%
  await page.fill('[aria-label="Duty"]', '90');

  // Verify warning appears
  await expect(page.locator('.risk-gauge')).toContainText('WARNING');
});
```

### Manual Testing Checklist

- [ ] All sliders respond to touch on mobile
- [ ] 3D visualization renders on Chrome, Firefox, Safari
- [ ] Animations run at 60fps
- [ ] Troubleshooting wizard completes all paths
- [ ] Chatbot provides relevant context-aware responses
- [ ] Dark mode looks good (it's the only mode!)

---

## Deployment Plan

### Phase 1 Deployment (Week 2)
- Deploy Parameter Playground to `vesc-playground.vercel.app`
- Enable analytics
- Share with 10 beta testers from pev.dev

### Phase 2 Deployment (Week 4)
- Add Safety Visualizer
- Collect feedback from beta testers
- Iterate on UI based on feedback

### Phase 3 Deployment (Week 6)
- Add Troubleshooting Wizard
- Integrate all features
- Announce on pev.dev and Discord

### Phase 4 Deployment (Week 8)
- Polish based on community feedback
- Add missing troubleshooting flows
- Consider additional parameters

### Monitoring

- Vercel Analytics for page views, performance
- Error tracking with Sentry
- User feedback widget (simple form)

---

## References

- Knowledge Base: `/Users/gergokiss/work/gergo/vesc/vesc_it/knowledge-base/`
- Existing Chatbot: `vesc-it.vercel.app`
- VESC Source: `/Users/gergokiss/work/gergo/vesc/bldc/`
- Refloat Source: `/Users/gergokiss/work/gergo/vesc/refloat/`

---

## Open Questions

1. **3D Model Source**: Use simplified geometry or create detailed Onewheel GLTF?
2. **Real Telemetry**: Future integration with Floaty/Float Control for live data?
3. **Tune Import**: Should we support pasting XML configs directly?
4. **Localization**: Add i18n infrastructure even if we only ship English?

---

**Plan Status:** READY FOR DEVELOPMENT

**Estimated Total Effort:** 6-8 weeks

**Next Action:** Begin Phase 1 - Foundation & Parameter Playground
