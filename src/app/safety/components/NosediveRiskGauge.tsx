'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { SafetyMargins, getNosediveRisk } from '../lib/safetyCalculations';

interface Props {
  margins: SafetyMargins;
}

export function NosediveRiskGauge({ margins }: Props) {
  const risk = getNosediveRisk(margins);

  // Animated needle rotation (0 = safe left, 180 = danger right)
  const needleRotation = useSpring(
    (risk.probability / 100) * 180 - 90,
    { stiffness: 60, damping: 15 }
  );

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 text-center">
      <h3 className="text-lg font-semibold text-white mb-4">Nosedive Risk</h3>

      {/* Semicircle gauge */}
      <div className="relative w-64 h-32 mx-auto">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 15 100 A 85 85 0 0 1 185 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Green zone (0-20%) */}
          <path
            d="M 15 100 A 85 85 0 0 1 51 35"
            fill="none"
            stroke="#22c55e"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Yellow zone (20-40%) */}
          <path
            d="M 51 35 A 85 85 0 0 1 100 15"
            fill="none"
            stroke="#eab308"
            strokeWidth="20"
          />

          {/* Orange zone (40-60%) */}
          <path
            d="M 100 15 A 85 85 0 0 1 149 35"
            fill="none"
            stroke="#f97316"
            strokeWidth="20"
          />

          {/* Red zone (60-100%) */}
          <path
            d="M 149 35 A 85 85 0 0 1 185 100"
            fill="none"
            stroke="#ef4444"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = ((tick / 100) * 180 - 90) * (Math.PI / 180);
            const innerR = 65;
            const outerR = 75;
            const x1 = 100 + Math.cos(angle) * innerR;
            const y1 = 100 - Math.sin(angle) * innerR;
            const x2 = 100 + Math.cos(angle) * outerR;
            const y2 = 100 - Math.sin(angle) * outerR;
            return (
              <g key={tick}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#475569"
                  strokeWidth="2"
                />
                <text
                  x={100 + Math.cos(angle) * 55}
                  y={100 - Math.sin(angle) * 55}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Needle */}
          <motion.g style={{ transformOrigin: '100px 100px', rotate: needleRotation }}>
            <polygon
              points="100,25 95,100 105,100"
              fill={risk.color}
            />
            <circle cx="100" cy="100" r="12" fill={risk.color} />
            <circle cx="100" cy="100" r="6" fill="#1e293b" />
          </motion.g>
        </svg>
      </div>

      {/* Risk label */}
      <motion.div
        className="mt-4"
        animate={{ color: risk.color }}
      >
        <div className="text-3xl font-bold">{risk.probability}%</div>
        <div className="text-lg font-medium">{risk.label}</div>
      </motion.div>

      {/* Warnings */}
      {margins.warnings.length > 0 && (
        <div className="mt-4 space-y-1">
          {margins.warnings.map((warning, i) => (
            <motion.div
              key={i}
              className="text-sm text-orange-400 bg-orange-500/10 rounded px-3 py-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              ⚠️ {warning}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
