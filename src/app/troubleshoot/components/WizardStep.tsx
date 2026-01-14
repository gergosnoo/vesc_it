'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TroubleshootingStep, StepOption } from '../data/types';
import { InteractiveChecklist } from './InteractiveChecklist';
import { DiagramRenderer } from './DiagramRenderer';

interface WizardStepProps {
  step: TroubleshootingStep;
  flowId: string;
  onSelectOption: (nextStep: string) => void;
  stepHistory: string[];
  onGoBack: () => void;
}

export function WizardStep({
  step,
  flowId,
  onSelectOption,
  stepHistory,
  onGoBack,
}: WizardStepProps) {
  const getStepTypeStyles = () => {
    switch (step.type) {
      case 'question':
        return {
          icon: '❓',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          accentColor: 'text-blue-400',
        };
      case 'action':
        return {
          icon: '🔧',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          accentColor: 'text-orange-400',
        };
      case 'solution':
        return {
          icon: '✅',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          accentColor: 'text-green-400',
        };
      case 'escalate':
        return {
          icon: '🆘',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          accentColor: 'text-red-400',
        };
      default:
        return {
          icon: '📋',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/30',
          accentColor: 'text-slate-400',
        };
    }
  };

  const styles = getStepTypeStyles();

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Navigation breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link
          href="/troubleshoot"
          className="hover:text-white transition-colors"
        >
          Troubleshoot
        </Link>
        <span>/</span>
        <Link
          href={`/troubleshoot/${flowId}`}
          className="hover:text-white transition-colors"
        >
          {flowId.replace('-', ' ')}
        </Link>
        {stepHistory.length > 0 && (
          <>
            <span>/</span>
            <span>Step {stepHistory.length + 1}</span>
          </>
        )}
      </div>

      {/* Back button */}
      {stepHistory.length > 0 && (
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Go Back
        </button>
      )}

      {/* Step header */}
      <div className={`p-6 rounded-2xl border ${styles.bgColor} ${styles.borderColor}`}>
        <div className="flex items-start gap-4">
          <span className="text-3xl">{styles.icon}</span>
          <div>
            <h2 className={`text-2xl font-bold ${styles.accentColor}`}>
              {step.title}
            </h2>
            <p className="text-slate-300 mt-2">{step.description}</p>
          </div>
        </div>
      </div>

      {/* Diagram if present */}
      {step.diagram && (
        <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
          <DiagramRenderer diagramId={step.diagram} />
        </div>
      )}

      {/* Checklist for action steps */}
      {step.type === 'action' && step.checklist && (
        <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-orange-300">
            📋 Check each item as you complete it:
          </h3>
          <InteractiveChecklist items={step.checklist} />
        </div>
      )}

      {/* Options for navigation */}
      {step.options && step.options.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-300">
            {step.type === 'question' ? 'Select your situation:' : 'What happened?'}
          </h3>
          <div className="grid gap-3">
            {step.options.map((option: StepOption, index: number) => (
              <motion.button
                key={index}
                onClick={() => onSelectOption(option.nextStep)}
                className="w-full p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700
                           hover:border-slate-500 rounded-xl text-left transition-all duration-200
                           flex items-center justify-between group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="text-white group-hover:text-blue-300 transition-colors">
                  {option.label}
                </span>
                <svg
                  className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all"
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
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Links for solution/escalate steps */}
      {step.links && step.links.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-300">
            {step.type === 'solution' ? 'Next steps:' : 'Get help:'}
          </h3>
          <div className="grid gap-3">
            {step.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`
                  p-4 rounded-xl border flex items-center justify-between group transition-all duration-200
                  ${
                    step.type === 'solution'
                      ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                      : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                  }
                `}
              >
                <span
                  className={`font-medium ${
                    step.type === 'solution' ? 'text-green-300' : 'text-blue-300'
                  }`}
                >
                  {link.label}
                </span>
                <svg
                  className={`w-5 h-5 ${
                    step.type === 'solution' ? 'text-green-400' : 'text-blue-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Start over button for solution/escalate */}
      {(step.type === 'solution' || step.type === 'escalate') && (
        <div className="pt-6 border-t border-slate-800">
          <Link
            href="/troubleshoot"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Troubleshoot another issue
          </Link>
        </div>
      )}
    </motion.div>
  );
}
