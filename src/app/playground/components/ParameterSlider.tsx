'use client';

import { motion } from 'framer-motion';
import * as Slider from '@radix-ui/react-slider';
import { VESCParameter } from '@/lib/vesc/parameters';
import { usePlaygroundStore } from '@/stores/playgroundStore';

interface ParameterSliderProps {
  parameter: VESCParameter;
}

const safetyColors = {
  none: 'bg-slate-500',
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const safetyBorders = {
  none: 'border-slate-500',
  low: 'border-green-500',
  medium: 'border-yellow-500',
  high: 'border-orange-500',
  critical: 'border-red-500',
};

export function ParameterSlider({ parameter }: ParameterSliderProps) {
  const { values, setParameter, resetParameter, showDescriptions, lastChangedParam } = usePlaygroundStore();
  const value = values[parameter.id] ?? parameter.default;
  const isActive = lastChangedParam === parameter.id;

  const handleChange = (newValue: number[]) => {
    setParameter(parameter.id, newValue[0]);
  };

  const handleReset = () => {
    resetParameter(parameter.id);
  };

  const percentage = ((value - parameter.min) / (parameter.max - parameter.min)) * 100;
  const isDefault = Math.abs(value - parameter.default) < parameter.step / 2;
  const delta = value - parameter.default;
  const deltaPercent = ((delta) / (parameter.max - parameter.min)) * 100;

  return (
    <motion.div
      className={`p-4 rounded-xl border transition-all duration-300 ${
        isActive
          ? `border-2 ${safetyBorders[parameter.safetyImpact]} bg-slate-800/80`
          : 'border-slate-700 bg-slate-800/50'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${safetyColors[parameter.safetyImpact]}`} />
          <h3 className="font-medium text-white">{parameter.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {!isDefault && (
            <motion.button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset
            </motion.button>
          )}
          <span className="text-lg font-mono text-white">
            {value.toFixed(parameter.step < 1 ? 2 : 0)}
            <span className="text-sm text-slate-400 ml-1">{parameter.unit}</span>
          </span>
        </div>
      </div>

      {/* Description */}
      {showDescriptions && (
        <p className="text-sm text-slate-400 mb-3">{parameter.description}</p>
      )}

      {/* Slider */}
      <div className="relative">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[value]}
          min={parameter.min}
          max={parameter.max}
          step={parameter.step}
          onValueChange={handleChange}
        >
          <Slider.Track className="bg-slate-700 relative grow rounded-full h-2">
            <Slider.Range
              className={`absolute rounded-full h-full ${
                parameter.safetyImpact === 'critical'
                  ? percentage > 85 ? 'bg-red-500' : percentage > 70 ? 'bg-orange-500' : 'bg-green-500'
                  : 'bg-gradient-to-r from-green-500 to-emerald-400'
              }`}
            />
          </Slider.Track>
          <Slider.Thumb
            className="block w-5 h-5 bg-white rounded-full shadow-lg border-2 border-green-500 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 transition-transform cursor-grab active:cursor-grabbing"
            aria-label={parameter.name}
          />
        </Slider.Root>

        {/* Default marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-slate-500"
          style={{
            left: `${((parameter.default - parameter.min) / (parameter.max - parameter.min)) * 100}%`
          }}
        />
      </div>

      {/* Range labels */}
      <div className="flex justify-between mt-1 text-xs text-slate-500">
        <span>{parameter.min}{parameter.unit}</span>
        <span className="text-slate-400">Default: {parameter.default}{parameter.unit}</span>
        <span>{parameter.max}{parameter.unit}</span>
      </div>

      {/* Delta indicator */}
      {!isDefault && (
        <motion.div
          className={`mt-2 text-xs font-medium ${delta > 0 ? 'text-orange-400' : 'text-blue-400'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {delta > 0 ? '↑' : '↓'} {Math.abs(deltaPercent).toFixed(0)}% from default
          {parameter.safetyImpact === 'critical' && delta > 0 && (
            <span className="text-red-400 ml-2">⚠️ Less safe</span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
