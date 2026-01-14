'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { usePlaygroundStore } from '@/stores/playgroundStore';

export function BoardVisualizer() {
  const { simulation, values, lastChangedParam, isAnimating } = usePlaygroundStore();

  // Spring physics for smooth animations
  const pitchSpring = useSpring(simulation.pitch, {
    stiffness: 100,
    damping: 15,
    mass: 1,
  });

  // Calculate derived values
  const kp = values.kp ?? 0.8;
  const tiltbackDuty = values.tiltback_duty ?? 0.82;
  const boosterCurrent = values.booster_current ?? 15;

  // Determine what to visualize based on last changed param
  const showDutyGauge = lastChangedParam?.includes('duty') || lastChangedParam?.includes('speed');
  const showCurrentSpike = lastChangedParam === 'booster_current';
  const showPitchResponse = lastChangedParam?.includes('kp') || lastChangedParam?.includes('atr');

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Horizon line */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-600" />

      {/* The Board */}
      <motion.div
        className="relative"
        style={{ rotateZ: pitchSpring }}
      >
        {/* Board SVG */}
        <svg
          width="300"
          height="120"
          viewBox="0 0 300 120"
          className="drop-shadow-2xl"
        >
          {/* Board deck */}
          <motion.path
            d="M 30 60 Q 50 30, 150 30 Q 250 30, 270 60 Q 250 90, 150 90 Q 50 90, 30 60"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          />

          {/* Grip tape texture */}
          <path
            d="M 50 60 Q 65 40, 150 40 Q 235 40, 250 60 Q 235 80, 150 80 Q 65 80, 50 60"
            fill="#0f172a"
            opacity="0.8"
          />

          {/* Wheel */}
          <motion.circle
            cx="150"
            cy="100"
            r="30"
            fill="#334155"
            stroke="#475569"
            strokeWidth="3"
            animate={{
              rotate: simulation.speed * 10,
            }}
            transition={{ duration: 0.1 }}
          />
          <circle cx="150" cy="100" r="15" fill="#1e293b" />
          <circle cx="150" cy="100" r="5" fill="#475569" />

          {/* Footpads */}
          <rect x="60" y="50" width="40" height="20" rx="3" fill="#22c55e" opacity="0.6" />
          <rect x="200" y="50" width="40" height="20" rx="3" fill="#22c55e" opacity="0.6" />

          {/* Rider silhouette */}
          <motion.g
            animate={{
              y: isAnimating ? [-2, 2, -2] : 0,
            }}
            transition={{ duration: 0.5, repeat: isAnimating ? Infinity : 0 }}
          >
            {/* Body */}
            <ellipse cx="150" cy="10" rx="15" ry="10" fill="#64748b" />
            {/* Legs */}
            <line x1="135" y1="20" x2="100" y2="45" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            <line x1="165" y1="20" x2="200" y2="45" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
          </motion.g>
        </svg>

        {/* Pitch indicator arc */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2">
          <svg width="40" height="80" viewBox="0 0 40 80">
            <path
              d="M 35 10 Q 5 40, 35 70"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Pitch marker */}
            <motion.circle
              cx="20"
              cy="40"
              r="6"
              fill={Math.abs(simulation.pitch) > 10 ? '#ef4444' : '#22c55e'}
              style={{
                y: useTransform(pitchSpring, [-20, 20], [-25, 25]),
              }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Info overlays */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-sm">
        {/* Speed */}
        <div className="bg-slate-800/80 px-3 py-2 rounded-lg">
          <div className="text-slate-400 text-xs">Speed</div>
          <div className="text-white font-mono">{simulation.speed.toFixed(1)} km/h</div>
        </div>

        {/* Pitch */}
        <div className="bg-slate-800/80 px-3 py-2 rounded-lg">
          <div className="text-slate-400 text-xs">Pitch</div>
          <motion.div
            className={`font-mono ${Math.abs(simulation.pitch) > 10 ? 'text-red-400' : 'text-white'}`}
          >
            {simulation.pitch > 0 ? '+' : ''}{simulation.pitch.toFixed(1)}°
          </motion.div>
        </div>

        {/* Duty */}
        <div className="bg-slate-800/80 px-3 py-2 rounded-lg">
          <div className="text-slate-400 text-xs">Duty</div>
          <div className={`font-mono ${simulation.duty > tiltbackDuty ? 'text-red-400' : 'text-white'}`}>
            {(simulation.duty * 100).toFixed(0)}%
          </div>
        </div>

        {/* Current */}
        <div className="bg-slate-800/80 px-3 py-2 rounded-lg">
          <div className="text-slate-400 text-xs">Current</div>
          <div className="text-white font-mono">{simulation.current.toFixed(0)} A</div>
        </div>
      </div>

      {/* Parameter change indicator */}
      {isAnimating && lastChangedParam && (
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500/20 border border-green-500 px-4 py-2 rounded-full"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <span className="text-green-400 text-sm font-medium">
            Adjusting: {lastChangedParam.replace(/_/g, ' ')}
          </span>
        </motion.div>
      )}

      {/* Safety warning */}
      {simulation.duty > tiltbackDuty && (
        <motion.div
          className="absolute top-4 right-4 bg-red-500/20 border border-red-500 px-3 py-2 rounded-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-red-400 text-sm font-medium">⚠️ Pushback Active</span>
        </motion.div>
      )}
    </div>
  );
}
