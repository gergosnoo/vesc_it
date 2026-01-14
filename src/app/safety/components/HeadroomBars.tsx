'use client';

import { motion } from 'framer-motion';
import { SafetyMargins } from '../lib/safetyCalculations';

interface Props {
  margins: SafetyMargins;
}

interface BarConfig {
  key: keyof Pick<SafetyMargins, 'dutyHeadroom' | 'currentHeadroom' | 'voltageMargin' | 'thermalMargin'>;
  label: string;
  icon: string;
  description: string;
}

const bars: BarConfig[] = [
  { key: 'dutyHeadroom', label: 'Duty Headroom', icon: '⚡', description: 'Distance from pushback' },
  { key: 'currentHeadroom', label: 'Current Reserve', icon: '💪', description: 'Motor power available' },
  { key: 'voltageMargin', label: 'Battery Level', icon: '🔋', description: 'Charge remaining' },
  { key: 'thermalMargin', label: 'Thermal Margin', icon: '🌡️', description: 'Cooling headroom' },
];

function getBarColor(value: number): string {
  if (value > 60) return '#22c55e'; // Green
  if (value > 40) return '#84cc16'; // Lime
  if (value > 25) return '#eab308'; // Yellow
  if (value > 15) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

function getBarGlow(value: number): string {
  if (value > 40) return 'none';
  if (value > 20) return '0 0 10px rgba(249, 115, 22, 0.5)';
  return '0 0 15px rgba(239, 68, 68, 0.7)';
}

export function HeadroomBars({ margins }: Props) {
  return (
    <div className="space-y-4">
      {bars.map((bar) => {
        const value = margins[bar.key];
        const color = getBarColor(value);
        const glow = getBarGlow(value);

        return (
          <motion.div
            key={bar.key}
            className="bg-slate-800/50 rounded-lg p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{bar.icon}</span>
                <div>
                  <div className="font-medium text-white">{bar.label}</div>
                  <div className="text-xs text-slate-400">{bar.description}</div>
                </div>
              </div>
              <motion.div
                className="text-2xl font-bold font-mono"
                style={{ color }}
                animate={{ color }}
                transition={{ duration: 0.3 }}
              >
                {value.toFixed(0)}%
              </motion.div>
            </div>

            {/* Bar */}
            <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
              {/* Gradient background showing zones */}
              <div className="absolute inset-0 flex">
                <div className="w-[15%] bg-red-500/20" />
                <div className="w-[10%] bg-orange-500/20" />
                <div className="w-[15%] bg-yellow-500/20" />
                <div className="w-[20%] bg-lime-500/20" />
                <div className="flex-1 bg-green-500/20" />
              </div>

              {/* Animated fill */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: glow,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, value)}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              />

              {/* Threshold markers */}
              <div className="absolute top-0 bottom-0 left-[15%] w-0.5 bg-white/30" />
              <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-white/20" />
              <div className="absolute top-0 bottom-0 left-[40%] w-0.5 bg-white/20" />
              <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-white/20" />
            </div>

            {/* Zone labels */}
            <div className="flex justify-between mt-1 text-[10px] text-slate-500">
              <span>Critical</span>
              <span>Low</span>
              <span>OK</span>
              <span>Good</span>
              <span>Safe</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
