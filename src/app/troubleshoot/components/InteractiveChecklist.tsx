'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChecklistItem } from '../data/types';

interface InteractiveChecklistProps {
  items: ChecklistItem[];
  onAllChecked?: () => void;
}

export function InteractiveChecklist({
  items,
  onAllChecked,
}: InteractiveChecklistProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggleItem = (index: number) => {
    const newChecked = { ...checked, [index]: !checked[index] };
    setChecked(newChecked);

    // Check if all items are now checked
    const allChecked = items.every((_, i) => newChecked[i]);
    if (allChecked && onAllChecked) {
      onAllChecked();
    }
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = (checkedCount / items.length) * 100;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm text-slate-400">
          {checkedCount}/{items.length}
        </span>
      </div>

      {/* Checklist items */}
      {items.map((item, index) => (
        <motion.div
          key={index}
          className={`
            p-4 rounded-xl border cursor-pointer transition-all duration-200
            ${
              checked[index]
                ? 'bg-green-500/10 border-green-500/50'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }
          `}
          onClick={() => toggleItem(index)}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <div
              className={`
                w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5
                transition-all duration-200
                ${
                  checked[index]
                    ? 'bg-green-500 border-green-500'
                    : 'border-slate-500'
                }
              `}
            >
              <AnimatePresence>
                {checked[index] && (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="flex-1">
              <p
                className={`font-medium transition-colors ${
                  checked[index] ? 'text-green-300 line-through' : 'text-white'
                }`}
              >
                {item.text}
              </p>
              {item.hint && (
                <p
                  className={`text-sm mt-1 transition-colors ${
                    checked[index] ? 'text-green-400/60' : 'text-slate-400'
                  }`}
                >
                  💡 {item.hint}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* All done message */}
      <AnimatePresence>
        {checkedCount === items.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-center"
          >
            <span className="text-green-300 font-medium">
              ✅ All items checked! Select an option below to continue.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
