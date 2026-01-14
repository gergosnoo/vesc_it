'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as Slider from '@radix-ui/react-slider';
import {
  BoardState,
  SafetyConfig,
  Scenario,
  DEFAULT_CONFIG,
  DEFAULT_STATE,
  calculateSafetyMargins,
  applyScenario,
} from './lib/safetyCalculations';
import { HeadroomBars } from './components/HeadroomBars';
import { ScenarioSelector } from './components/ScenarioSelector';
import { NosediveRiskGauge } from './components/NosediveRiskGauge';

export default function SafetyPage() {
  const [config, setConfig] = useState<SafetyConfig>(DEFAULT_CONFIG);
  const [baseState, setBaseState] = useState<BoardState>(DEFAULT_STATE);
  const [scenario, setScenario] = useState<Scenario>('normal');

  // Apply scenario to get current state
  const currentState = useMemo(
    () => applyScenario(baseState, scenario),
    [baseState, scenario]
  );

  // Calculate safety margins
  const margins = useMemo(
    () => calculateSafetyMargins(currentState, config),
    [currentState, config]
  );

  // Compare with base state
  const baseMargins = useMemo(
    () => calculateSafetyMargins(baseState, config),
    [baseState, config]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-slate-400 hover:text-white transition-colors">
              ← Back
            </a>
            <div className="w-px h-6 bg-slate-700" />
            <h1 className="text-xl font-bold">
              <span className="text-red-400">🛡️</span> Safety Visualizer
            </h1>
          </div>
          <a
            href="/playground"
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
          >
            🎛️ Parameter Playground
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Intro */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-2">
            Know Your <span className="text-red-400">Margins</span>, Avoid the Crash
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            See exactly how much headroom you have before a nosedive.
            Simulate different scenarios to understand your limits.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Inputs */}
          <div className="space-y-6">
            {/* Riding State */}
            <motion.div
              className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-lg font-semibold mb-4">Current Riding State</h3>

              {/* Speed */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Speed</span>
                  <span className="font-mono">{baseState.speed} km/h</span>
                </div>
                <Slider.Root
                  className="relative flex items-center w-full h-5"
                  value={[baseState.speed]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={([v]) => setBaseState(s => ({ ...s, speed: v }))}
                >
                  <Slider.Track className="bg-slate-700 relative grow rounded-full h-2">
                    <Slider.Range className="absolute h-full rounded-full bg-blue-500" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg" />
                </Slider.Root>
              </div>

              {/* Duty */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Motor Duty</span>
                  <span className="font-mono">{(baseState.duty * 100).toFixed(0)}%</span>
                </div>
                <Slider.Root
                  className="relative flex items-center w-full h-5"
                  value={[baseState.duty * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => setBaseState(s => ({ ...s, duty: v / 100 }))}
                >
                  <Slider.Track className="bg-slate-700 relative grow rounded-full h-2">
                    <Slider.Range className={`absolute h-full rounded-full ${baseState.duty > 0.82 ? 'bg-red-500' : 'bg-green-500'}`} />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg" />
                </Slider.Root>
              </div>

              {/* Current */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Motor Current</span>
                  <span className="font-mono">{baseState.current} A</span>
                </div>
                <Slider.Root
                  className="relative flex items-center w-full h-5"
                  value={[baseState.current]}
                  min={0}
                  max={80}
                  step={1}
                  onValueChange={([v]) => setBaseState(s => ({ ...s, current: v }))}
                >
                  <Slider.Track className="bg-slate-700 relative grow rounded-full h-2">
                    <Slider.Range className="absolute h-full rounded-full bg-yellow-500" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg" />
                </Slider.Root>
              </div>

              {/* Voltage */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Cell Voltage</span>
                  <span className="font-mono">{baseState.voltage.toFixed(2)} V</span>
                </div>
                <Slider.Root
                  className="relative flex items-center w-full h-5"
                  value={[baseState.voltage * 100]}
                  min={280}
                  max={420}
                  step={1}
                  onValueChange={([v]) => setBaseState(s => ({ ...s, voltage: v / 100 }))}
                >
                  <Slider.Track className="bg-slate-700 relative grow rounded-full h-2">
                    <Slider.Range className={`absolute h-full rounded-full ${baseState.voltage < 3.2 ? 'bg-orange-500' : 'bg-green-500'}`} />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg" />
                </Slider.Root>
              </div>
            </motion.div>

            {/* Scenario Selector */}
            <motion.div
              className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-4">What If... Scenario</h3>
              <ScenarioSelector selected={scenario} onSelect={setScenario} />

              {scenario !== 'normal' && (
                <motion.div
                  className="mt-4 p-3 bg-slate-900 rounded-lg text-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className="text-slate-400 mb-1">Scenario effect:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      Duty: {(baseState.duty * 100).toFixed(0)}% → <span className={currentState.duty > baseState.duty ? 'text-red-400' : 'text-green-400'}>{(currentState.duty * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      Current: {baseState.current}A → <span className={currentState.current > baseState.current ? 'text-orange-400' : 'text-green-400'}>{currentState.current.toFixed(0)}A</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Middle column: Nosedive Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NosediveRiskGauge margins={margins} />

            {/* Quick tips */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <h4 className="font-medium text-white mb-2">💡 Stay Safe</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Keep duty headroom above 20%</li>
                <li>• Slow down before hills</li>
                <li>• Charge before long rides</li>
                <li>• Enable booster for surge protection</li>
              </ul>
            </div>
          </motion.div>

          {/* Right column: Headroom Bars */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">Safety Margins</h3>
            <HeadroomBars margins={margins} />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-slate-400 mb-3">Want to understand the parameters better?</p>
          <div className="flex justify-center gap-4">
            <a
              href="/playground"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 rounded-xl border border-green-500/50 hover:bg-green-500/30 transition-colors"
            >
              🎛️ Parameter Playground
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              💬 Ask the AI
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
