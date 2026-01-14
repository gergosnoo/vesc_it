export interface VESCParameter {
  id: string;
  name: string;
  category: 'balance' | 'safety' | 'motor' | 'filter';
  min: number;
  max: number;
  default: number;
  step: number;
  unit: string;
  description: string;
  safetyImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  visualization: 'pitch' | 'current' | 'gauge' | 'graph' | 'board';
  learnMoreUrl?: string;
}

export const PARAMETERS: VESCParameter[] = [
  // BALANCE PARAMETERS
  {
    id: 'kp',
    name: 'Proportional Gain (Kp)',
    category: 'balance',
    min: 0.1,
    max: 2.0,
    default: 0.8,
    step: 0.05,
    unit: '',
    description: 'How aggressively the board responds to pitch changes. Higher = stiffer, lower = floatier.',
    safetyImpact: 'medium',
    visualization: 'pitch',
  },
  {
    id: 'ki',
    name: 'Integral Gain (Ki)',
    category: 'balance',
    min: 0,
    max: 0.5,
    default: 0.005,
    step: 0.001,
    unit: '',
    description: 'Accumulates error over time. Helps maintain level on hills.',
    safetyImpact: 'low',
    visualization: 'pitch',
  },
  {
    id: 'mahony_kp',
    name: 'Mahony Filter Kp',
    category: 'filter',
    min: 0.1,
    max: 1.0,
    default: 0.4,
    step: 0.05,
    unit: '',
    description: 'IMU filter responsiveness. Lower = smoother, higher = quicker response.',
    safetyImpact: 'medium',
    visualization: 'board',
  },

  // SAFETY PARAMETERS
  {
    id: 'tiltback_duty',
    name: 'Duty Tiltback Threshold',
    category: 'safety',
    min: 0.7,
    max: 1.0,
    default: 0.82,
    step: 0.01,
    unit: '%',
    description: 'Motor duty at which pushback activates. Lower = more safety margin.',
    safetyImpact: 'critical',
    visualization: 'gauge',
  },
  {
    id: 'tiltback_duty_angle',
    name: 'Duty Tiltback Angle',
    category: 'safety',
    min: 1,
    max: 20,
    default: 10,
    step: 1,
    unit: '°',
    description: 'How much nose lifts when pushback activates.',
    safetyImpact: 'high',
    visualization: 'pitch',
  },
  {
    id: 'tiltback_speed',
    name: 'Speed Tiltback (km/h)',
    category: 'safety',
    min: 15,
    max: 50,
    default: 30,
    step: 1,
    unit: 'km/h',
    description: 'Speed at which pushback activates.',
    safetyImpact: 'critical',
    visualization: 'gauge',
  },
  {
    id: 'tiltback_lv',
    name: 'Low Voltage Threshold',
    category: 'safety',
    min: 2.8,
    max: 3.4,
    default: 3.2,
    step: 0.1,
    unit: 'V/cell',
    description: 'Per-cell voltage that triggers LV pushback.',
    safetyImpact: 'critical',
    visualization: 'gauge',
  },

  // ATR PARAMETERS
  {
    id: 'atr_strength_up',
    name: 'ATR Strength (Accel)',
    category: 'balance',
    min: 0,
    max: 3,
    default: 1.0,
    step: 0.1,
    unit: '',
    description: 'Nose-down tilt when accelerating. Higher = more aggressive lean.',
    safetyImpact: 'medium',
    visualization: 'pitch',
  },
  {
    id: 'atr_strength_down',
    name: 'ATR Strength (Decel)',
    category: 'balance',
    min: 0,
    max: 3,
    default: 0.8,
    step: 0.1,
    unit: '',
    description: 'Nose-up tilt when braking.',
    safetyImpact: 'medium',
    visualization: 'pitch',
  },

  // BOOSTER
  {
    id: 'booster_current',
    name: 'Booster Current',
    category: 'safety',
    min: 0,
    max: 30,
    default: 15,
    step: 1,
    unit: 'A',
    description: 'Extra current when nose drops unexpectedly. Surge protection.',
    safetyImpact: 'high',
    visualization: 'current',
  },
];

export const getParameterById = (id: string): VESCParameter | undefined => {
  return PARAMETERS.find(p => p.id === id);
};

export const getParametersByCategory = (category: VESCParameter['category']): VESCParameter[] => {
  return PARAMETERS.filter(p => p.category === category);
};

export const getSafetyParameters = (): VESCParameter[] => {
  return PARAMETERS.filter(p => p.safetyImpact === 'critical' || p.safetyImpact === 'high');
};
