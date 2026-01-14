'use client';

import { motion } from 'framer-motion';
import { PARAMETERS, getParametersByCategory } from '@/lib/vesc/parameters';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import { ParameterSlider } from './components/ParameterSlider';
import { BoardVisualizer } from './components/BoardVisualizer';
import { SafetyGauge } from './components/SafetyGauge';

const categories = [
  { id: 'all', label: 'All', icon: '🎛️' },
  { id: 'balance', label: 'Balance', icon: '⚖️' },
  { id: 'safety', label: 'Safety', icon: '🛡️' },
  { id: 'filter', label: 'Filter', icon: '📊' },
] as const;

export default function PlaygroundPage() {
  const {
    selectedCategory,
    setSelectedCategory,
    resetToDefaults,
    showDescriptions,
    toggleDescriptions,
  } = usePlaygroundStore();

  const filteredParameters = selectedCategory === 'all'
    ? PARAMETERS
    : getParametersByCategory(selectedCategory);

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
              <span className="text-green-400">VESC</span> Parameter Playground
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDescriptions}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showDescriptions
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {showDescriptions ? '📖 Hide Tips' : '📖 Show Tips'}
            </button>
            <button
              onClick={resetToDefaults}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Intro */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-2">
            Learn by Doing, <span className="text-green-400">Not by Crashing</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Drag the sliders to see how each VESC parameter affects your ride.
            Watch the board respond in real-time. No risk, all learning.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Visualizations */}
          <div className="space-y-6">
            {/* Board Visualizer */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-3 text-slate-300">Live Preview</h3>
              <BoardVisualizer />
            </motion.div>

            {/* Safety Gauge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SafetyGauge />
            </motion.div>
          </div>

          {/* Right: Parameters */}
          <div>
            {/* Category tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Parameter sliders */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredParameters.map((param, index) => (
                <motion.div
                  key={param.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ParameterSlider parameter={param} />
                </motion.div>
              ))}
            </motion.div>

            {/* Help text */}
            <motion.div
              className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="font-medium text-white mb-2">💡 Tips</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• <span className="text-red-400">Red dot</span> = Critical safety setting</li>
                <li>• <span className="text-orange-400">Orange dot</span> = High impact setting</li>
                <li>• Vertical line shows default value</li>
                <li>• Click Reset to restore individual settings</li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Footer link to chatbot */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-slate-400 mb-3">Have questions about a specific setting?</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 rounded-xl border border-green-500/50 hover:bg-green-500/30 transition-colors"
          >
            💬 Ask the VESC AI Chatbot
          </a>
        </motion.div>
      </main>
    </div>
  );
}
