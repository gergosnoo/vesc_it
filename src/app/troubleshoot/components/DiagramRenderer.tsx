'use client';

import { motion } from 'framer-motion';

interface DiagramRendererProps {
  diagramId: string;
}

export function DiagramRenderer({ diagramId }: DiagramRendererProps) {
  const diagrams: Record<string, React.ReactNode> = {
    'motor-phases': <MotorPhasesDiagram />,
    'motor-params': <MotorParamsDiagram />,
    'drv-chip': <DrvChipDiagram />,
    'can-wiring': <CanWiringDiagram />,
    'bms-cutout': <BmsCutoutDiagram />,
    'bms-bypass-methods': <BmsBypassDiagram />,
    'heel-lift-erpm': <HeelLiftDiagram />,
  };

  const diagram = diagrams[diagramId];

  if (!diagram) {
    return (
      <div className="text-center text-slate-400 py-8">
        <span className="text-4xl block mb-2">📊</span>
        <span>Diagram: {diagramId}</span>
      </div>
    );
  }

  return <>{diagram}</>;
}

function MotorPhasesDiagram() {
  return (
    <div className="relative">
      <h4 className="text-sm font-medium text-slate-400 mb-4">Motor Phase Connections</h4>
      <svg viewBox="0 0 400 200" className="w-full max-w-md mx-auto">
        {/* VESC box */}
        <motion.rect
          x="20"
          y="60"
          width="100"
          height="80"
          rx="8"
          fill="#1e293b"
          stroke="#3b82f6"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <text x="70" y="105" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">
          VESC
        </text>

        {/* Motor circle */}
        <motion.circle
          cx="320"
          cy="100"
          r="50"
          fill="#1e293b"
          stroke="#22c55e"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
        <text x="320" y="105" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">
          Motor
        </text>

        {/* Phase wires */}
        {[
          { y: 75, color: '#ef4444', label: 'A' },
          { y: 100, color: '#eab308', label: 'B' },
          { y: 125, color: '#3b82f6', label: 'C' },
        ].map((phase, i) => (
          <g key={phase.label}>
            <motion.line
              x1="120"
              y1={phase.y}
              x2="270"
              y2={phase.y}
              stroke={phase.color}
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
            />
            <text x="195" y={phase.y - 8} textAnchor="middle" fill={phase.color} fontSize="12">
              Phase {phase.label}
            </text>
          </g>
        ))}

        {/* Check marks */}
        <text x="200" y="170" textAnchor="middle" fill="#94a3b8" fontSize="11">
          ✓ Check all 3 connections are secure
        </text>
      </svg>
    </div>
  );
}

function MotorParamsDiagram() {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-slate-400">Expected Motor Parameters</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-slate-900 rounded-lg">
          <span className="text-slate-400">Resistance (R)</span>
          <p className="text-white font-mono">0.01 - 1.0 Ω</p>
        </div>
        <div className="p-3 bg-slate-900 rounded-lg">
          <span className="text-slate-400">Inductance (L)</span>
          <p className="text-white font-mono">5 - 500 µH</p>
        </div>
        <div className="p-3 bg-slate-900 rounded-lg">
          <span className="text-slate-400">Flux Linkage (λ)</span>
          <p className="text-white font-mono">1 - 50 mWb</p>
        </div>
        <div className="p-3 bg-slate-900 rounded-lg">
          <span className="text-slate-400">Pole Pairs</span>
          <p className="text-white font-mono">1 - 30</p>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Values outside these ranges indicate detection or motor issues
      </p>
    </div>
  );
}

function DrvChipDiagram() {
  return (
    <div className="relative">
      <h4 className="text-sm font-medium text-slate-400 mb-4">DRV8301/8302 Gate Driver</h4>
      <svg viewBox="0 0 400 150" className="w-full max-w-md mx-auto">
        {/* VESC board */}
        <rect x="50" y="20" width="300" height="110" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />

        {/* DRV chip */}
        <motion.rect
          x="150"
          y="50"
          width="80"
          height="50"
          rx="4"
          fill="#0f172a"
          stroke="#ef4444"
          strokeWidth="2"
          initial={{ scale: 0.9 }}
          animate={{ scale: [0.9, 1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <text x="190" y="80" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">
          DRV8301
        </text>

        {/* Warning indicator */}
        <circle cx="260" cy="75" r="15" fill="#ef4444" opacity="0.2" />
        <text x="260" y="80" textAnchor="middle" fill="#ef4444" fontSize="14">
          ⚠️
        </text>

        {/* Labels */}
        <text x="200" y="140" textAnchor="middle" fill="#94a3b8" fontSize="11">
          DRV errors often indicate hardware damage
        </text>
      </svg>
    </div>
  );
}

function CanWiringDiagram() {
  return (
    <div className="relative">
      <h4 className="text-sm font-medium text-slate-400 mb-4">CAN Bus Wiring</h4>
      <svg viewBox="0 0 400 180" className="w-full max-w-md mx-auto">
        {/* VESC 1 */}
        <rect x="30" y="40" width="80" height="60" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
        <text x="70" y="75" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">
          VESC 1
        </text>
        <text x="70" y="90" textAnchor="middle" fill="#3b82f6" fontSize="10">
          ID: 0
        </text>

        {/* VESC 2 */}
        <rect x="290" y="40" width="80" height="60" rx="6" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
        <text x="330" y="75" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">
          VESC 2
        </text>
        <text x="330" y="90" textAnchor="middle" fill="#22c55e" fontSize="10">
          ID: 1
        </text>

        {/* CAN wires */}
        <line x1="110" y1="55" x2="290" y2="55" stroke="#eab308" strokeWidth="3" />
        <line x1="110" y1="85" x2="290" y2="85" stroke="#06b6d4" strokeWidth="3" />

        {/* Labels */}
        <text x="200" y="50" textAnchor="middle" fill="#eab308" fontSize="11">
          CAN H (High)
        </text>
        <text x="200" y="100" textAnchor="middle" fill="#06b6d4" fontSize="11">
          CAN L (Low)
        </text>

        {/* Termination resistors */}
        <rect x="115" y="62" width="25" height="12" rx="2" fill="#f97316" />
        <text x="127" y="72" textAnchor="middle" fill="white" fontSize="8">
          120Ω
        </text>
        <rect x="260" y="62" width="25" height="12" rx="2" fill="#f97316" />
        <text x="272" y="72" textAnchor="middle" fill="white" fontSize="8">
          120Ω
        </text>

        {/* Note */}
        <text x="200" y="140" textAnchor="middle" fill="#94a3b8" fontSize="10">
          Termination resistors at EACH END of bus
        </text>
        <text x="200" y="155" textAnchor="middle" fill="#f97316" fontSize="10">
          ⚠️ Each VESC needs UNIQUE ID
        </text>
      </svg>
    </div>
  );
}

function BmsCutoutDiagram() {
  return (
    <div className="relative">
      <h4 className="text-sm font-medium text-slate-400 mb-4">BMS Cutout During Ride</h4>
      <svg viewBox="0 0 400 180" className="w-full max-w-md mx-auto">
        {/* Battery */}
        <rect x="30" y="50" width="70" height="80" rx="4" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
        <text x="65" y="95" textAnchor="middle" fill="#94a3b8" fontSize="11">
          Battery
        </text>

        {/* BMS in path - danger */}
        <motion.rect
          x="140"
          y="60"
          width="60"
          height="60"
          rx="4"
          fill="#1e293b"
          stroke="#ef4444"
          strokeWidth="2"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <text x="170" y="95" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">
          BMS
        </text>
        <text x="170" y="108" textAnchor="middle" fill="#ef4444" fontSize="9">
          CUTOUT!
        </text>

        {/* VESC */}
        <rect x="240" y="50" width="60" height="80" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
        <text x="270" y="95" textAnchor="middle" fill="#94a3b8" fontSize="11">
          VESC
        </text>

        {/* Motor */}
        <circle cx="350" cy="90" r="30" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
        <text x="350" y="95" textAnchor="middle" fill="#94a3b8" fontSize="10">
          Motor
        </text>

        {/* Current flow */}
        <line x1="100" y1="90" x2="135" y2="90" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
        <line x1="205" y1="90" x2="235" y2="90" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />

        {/* Warning */}
        <text x="200" y="160" textAnchor="middle" fill="#ef4444" fontSize="11">
          ⚡ BMS current limit triggers → NOSEDIVE
        </text>

        <defs>
          <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function BmsBypassDiagram() {
  return (
    <div className="space-y-6">
      <h4 className="text-sm font-medium text-slate-400">BMS Bypass Methods</h4>

      {/* WRONG method */}
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-red-400 font-bold">❌ WRONG: B- Bridge</span>
        </div>
        <svg viewBox="0 0 350 100" className="w-full max-w-sm">
          <rect x="20" y="30" width="50" height="40" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
          <text x="45" y="55" textAnchor="middle" fill="#94a3b8" fontSize="9">Battery</text>

          <rect x="100" y="30" width="50" height="40" rx="4" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
          <text x="125" y="50" textAnchor="middle" fill="#ef4444" fontSize="9">BMS</text>
          <text x="125" y="62" textAnchor="middle" fill="#ef4444" fontSize="7">BYPASSED</text>

          {/* Jumper wire */}
          <path d="M95,50 Q85,20 75,50" stroke="#eab308" strokeWidth="3" fill="none" />
          <text x="85" y="15" textAnchor="middle" fill="#eab308" fontSize="8">B- jumper</text>

          <rect x="180" y="30" width="50" height="40" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
          <text x="205" y="55" textAnchor="middle" fill="#94a3b8" fontSize="9">VESC</text>

          <text x="280" y="55" textAnchor="middle" fill="#ef4444" fontSize="10">🔥 FIRE</text>
          <text x="280" y="70" textAnchor="middle" fill="#ef4444" fontSize="8">RISK!</text>
        </svg>
        <p className="text-red-300 text-xs mt-2">
          Disables overcharge protection! Regen can cause thermal runaway.
        </p>
      </div>

      {/* RIGHT method */}
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-green-400 font-bold">✅ RIGHT: Charge-Only</span>
        </div>
        <svg viewBox="0 0 350 120" className="w-full max-w-sm">
          <rect x="20" y="40" width="50" height="40" rx="4" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
          <text x="45" y="65" textAnchor="middle" fill="#94a3b8" fontSize="9">Battery</text>

          {/* Charge path through BMS */}
          <rect x="100" y="10" width="50" height="30" rx="4" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
          <text x="125" y="28" textAnchor="middle" fill="#22c55e" fontSize="8">BMS</text>
          <text x="125" y="50" textAnchor="middle" fill="#22c55e" fontSize="7">Charge path</text>

          {/* Discharge path bypasses */}
          <line x1="70" y1="60" x2="180" y2="60" stroke="#3b82f6" strokeWidth="2" />
          <text x="125" y="80" textAnchor="middle" fill="#3b82f6" fontSize="7">Discharge direct</text>

          <rect x="180" y="40" width="50" height="40" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
          <text x="205" y="65" textAnchor="middle" fill="#94a3b8" fontSize="9">VESC</text>

          <text x="280" y="55" textAnchor="middle" fill="#22c55e" fontSize="10">✓ Safe</text>
          <text x="280" y="70" textAnchor="middle" fill="#22c55e" fontSize="8">Method</text>
        </svg>
        <p className="text-green-300 text-xs mt-2">
          BMS protects during charging, VESC handles discharge limits.
        </p>
      </div>
    </div>
  );
}

function HeelLiftDiagram() {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-slate-400">VESC 6.05 Heel Lift Issue</h4>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="text-center mb-2">
            <span className="text-red-400 font-bold text-sm">❌ Default (6.05)</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>fault_adc_half_erpm = 1000</p>
            <p className="text-red-300">Heel lift disabled above ~5 km/h</p>
          </div>
        </div>

        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="text-center mb-2">
            <span className="text-green-400 font-bold text-sm">✅ Fixed</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>fault_adc_half_erpm = 0</p>
            <p className="text-green-300">Heel lift works at ALL speeds</p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-800 rounded-lg text-xs text-slate-400">
        <strong>Location:</strong> Refloat Cfg → Faults → fault_adc_half_erpm
      </div>
    </div>
  );
}
