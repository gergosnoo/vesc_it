'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getFlowById } from '../data/flows';
import { WizardStep } from '../components/WizardStep';

export default function FlowPage() {
  const params = useParams();
  const flowId = params.flowId as string;
  const flow = useMemo(() => getFlowById(flowId), [flowId]);

  const [currentStepId, setCurrentStepId] = useState<string>(
    flow?.startStep || 'start'
  );
  const [stepHistory, setStepHistory] = useState<string[]>([]);

  if (!flow) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Flow not found</h1>
          <Link
            href="/troubleshoot"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Troubleshooting
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = flow.steps[currentStepId];

  if (!currentStep) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Step not found</h1>
          <button
            onClick={() => {
              setCurrentStepId(flow.startStep);
              setStepHistory([]);
            }}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  const handleSelectOption = (nextStep: string) => {
    setStepHistory((prev) => [...prev, currentStepId]);
    setCurrentStepId(nextStep);
  };

  const handleGoBack = () => {
    if (stepHistory.length > 0) {
      const previousStep = stepHistory[stepHistory.length - 1];
      setStepHistory((prev) => prev.slice(0, -1));
      setCurrentStepId(previousStep);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/troubleshoot"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Troubleshoot
            </Link>
            <div className="w-px h-6 bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-2xl">{flow.icon}</span>
              <h1 className="text-lg font-bold">{flow.title}</h1>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Step {stepHistory.length + 1}</span>
            <div className="flex gap-1">
              {[...Array(Math.min(stepHistory.length + 1, 5))].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === stepHistory.length
                      ? 'bg-blue-500'
                      : 'bg-slate-600'
                  }`}
                />
              ))}
              {stepHistory.length + 1 > 5 && (
                <span className="text-xs">...</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[60vh]"
        >
          <WizardStep
            step={currentStep}
            flowId={flowId}
            onSelectOption={handleSelectOption}
            stepHistory={stepHistory}
            onGoBack={handleGoBack}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Need more help?{' '}
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Ask our AI
            </Link>
          </span>
          <button
            onClick={() => {
              setCurrentStepId(flow.startStep);
              setStepHistory([]);
            }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Start over
          </button>
        </div>
      </footer>
    </div>
  );
}
