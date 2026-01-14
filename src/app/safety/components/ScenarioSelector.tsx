'use client';

import { motion } from 'framer-motion';
import { Scenario, SCENARIOS } from '../lib/safetyCalculations';

interface Props {
  selected: Scenario;
  onSelect: (scenario: Scenario) => void;
}

export function ScenarioSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {SCENARIOS.map((scenario) => {
        const isSelected = selected === scenario.id;

        return (
          <motion.button
            key={scenario.id}
            onClick={() => onSelect(scenario.id)}
            className={`p-4 rounded-xl text-left transition-all ${
              isSelected
                ? 'bg-green-500/20 border-2 border-green-500'
                : 'bg-slate-800/50 border border-slate-700 hover:border-slate-500'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-2xl mb-1">{scenario.icon}</div>
            <div className={`font-medium ${isSelected ? 'text-green-400' : 'text-white'}`}>
              {scenario.name}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {scenario.description}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
