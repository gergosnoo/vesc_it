'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TROUBLESHOOTING_FLOWS } from './data/flows';

export default function TroubleshootPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back
            </Link>
            <div className="w-px h-6 bg-slate-700" />
            <h1 className="text-xl font-bold">
              <span className="text-orange-400">🔧</span> Troubleshooting Wizard
            </h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/playground"
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
            >
              🎛️ Playground
            </Link>
            <Link
              href="/safety"
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
            >
              🛡️ Safety
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Intro */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold mb-3">
            Fix Problems <span className="text-orange-400">Step by Step</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Select your issue below. We&apos;ll guide you through diagnosis and
            solutions with interactive checklists and visual diagrams.
          </p>
        </motion.div>

        {/* Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TROUBLESHOOTING_FLOWS.map((flow, index) => (
            <motion.div
              key={flow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/troubleshoot/${flow.id}`}>
                <div
                  className={`
                    group relative overflow-hidden rounded-2xl border border-slate-700
                    bg-gradient-to-br ${flow.color} p-[1px]
                    hover:scale-[1.02] transition-transform duration-200
                  `}
                >
                  <div className="relative bg-slate-900 rounded-2xl p-6 h-full">
                    {/* Icon */}
                    <div className="text-4xl mb-4">{flow.icon}</div>

                    {/* Content */}
                    <h3 className="text-xl font-bold mb-2 group-hover:text-orange-300 transition-colors">
                      {flow.title}
                    </h3>
                    <p className="text-slate-400 text-sm">{flow.description}</p>

                    {/* Arrow indicator */}
                    <div className="absolute bottom-6 right-6 text-slate-500 group-hover:text-orange-400 transition-colors">
                      <svg
                        className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>

                    {/* Step count badge */}
                    <div className="absolute top-6 right-6 bg-slate-800 px-2 py-1 rounded text-xs text-slate-400">
                      {Object.keys(flow.steps).length} steps
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Help section */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-slate-400 mb-4">
            Don&apos;t see your issue? Ask our AI chatbot for personalized help.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/50 hover:bg-blue-500/30 transition-colors"
          >
            💬 Chat with AI Assistant
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
