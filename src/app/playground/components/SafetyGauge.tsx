'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { usePlaygroundStore } from '@/stores/playgroundStore';

export function SafetyGauge() {
  const { getSafetyScore, values } = usePlaygroundStore();
  const score = getSafetyScore();

  // Animated score
  const animatedScore = useSpring(score, {
    stiffness: 50,
    damping: 20,
  });

  // Color based on score
  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e'; // Green
    if (s >= 60) return '#eab308'; // Yellow
    if (s >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const color = getColor(score);
  const rotation = useTransform(animatedScore, [0, 100], [-90, 90]);

  const getRiskLabel = (s: number) => {
    if (s >= 80) return 'LOW RISK';
    if (s >= 60) return 'MODERATE';
    if (s >= 40) return 'ELEVATED';
    return 'HIGH RISK';
  };

  const getAdvice = (s: number) => {
    if (s >= 80) return 'Your settings prioritize safety. Good for learning.';
    if (s >= 60) return 'Balanced settings. Suitable for experienced riders.';
    if (s >= 40) return 'Aggressive settings. Know your limits.';
    return 'Very aggressive. High nosedive risk!';
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4 text-center">Safety Score</h3>

      {/* Gauge */}
      <div className="relative w-48 h-24 mx-auto mb-4">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#334155"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Colored segments */}
          <path
            d="M 20 100 A 80 80 0 0 1 50 35"
            fill="none"
            stroke="#ef4444"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 50 35 A 80 80 0 0 1 100 20"
            fill="none"
            stroke="#f97316"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 100 20 A 80 80 0 0 1 150 35"
            fill="none"
            stroke="#eab308"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 150 35 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Needle */}
          <motion.g style={{ transformOrigin: '100px 100px', rotate: rotation }}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="8" fill={color} />
          </motion.g>

          {/* Center cover */}
          <circle cx="100" cy="100" r="5" fill="#1e293b" />
        </svg>

        {/* Score display */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <motion.div
            className="text-3xl font-bold"
            style={{ color }}
          >
            {Math.round(score)}
          </motion.div>
        </div>
      </div>

      {/* Risk label */}
      <motion.div
        className="text-center mb-4"
        animate={{ color }}
      >
        <span className="text-lg font-semibold">{getRiskLabel(score)}</span>
      </motion.div>

      {/* Advice */}
      <p className="text-sm text-slate-400 text-center mb-4">
        {getAdvice(score)}
      </p>

      {/* Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Duty Tiltback</span>
          <span className={values.tiltback_duty > 0.85 ? 'text-orange-400' : 'text-green-400'}>
            {((values.tiltback_duty ?? 0.82) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Speed Limit</span>
          <span className={values.tiltback_speed > 35 ? 'text-orange-400' : 'text-green-400'}>
            {values.tiltback_speed ?? 30} km/h
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Booster</span>
          <span className={values.booster_current < 10 ? 'text-orange-400' : 'text-green-400'}>
            {values.booster_current ?? 15} A
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">LV Threshold</span>
          <span className={values.tiltback_lv < 3.0 ? 'text-red-400' : 'text-green-400'}>
            {(values.tiltback_lv ?? 3.2).toFixed(1)} V
          </span>
        </div>
      </div>
    </div>
  );
}
