import { create } from 'zustand';
import { PARAMETERS, VESCParameter } from '@/lib/vesc/parameters';

interface SimulationState {
  pitch: number;           // Current board pitch in degrees
  speed: number;           // Current speed in km/h
  duty: number;            // Current motor duty 0-1
  current: number;         // Current motor current in A
  voltage: number;         // Per-cell voltage
  isAccelerating: boolean; // For ATR visualization
  isBraking: boolean;      // For ATR visualization
}

interface PlaygroundState {
  // Current parameter values
  values: Record<string, number>;

  // Simulation state
  simulation: SimulationState;

  // UI state
  isAnimating: boolean;
  lastChangedParam: string | null;
  selectedCategory: 'all' | 'balance' | 'safety' | 'motor' | 'filter';
  showDescriptions: boolean;

  // Actions
  setParameter: (id: string, value: number) => void;
  resetToDefaults: () => void;
  resetParameter: (id: string) => void;
  setSimulation: (state: Partial<SimulationState>) => void;
  setSelectedCategory: (category: PlaygroundState['selectedCategory']) => void;
  toggleDescriptions: () => void;

  // Computed
  getSafetyScore: () => number;
  getParameterDelta: (id: string) => number;
}

const getDefaultValues = (): Record<string, number> => {
  return PARAMETERS.reduce((acc, param) => {
    acc[param.id] = param.default;
    return acc;
  }, {} as Record<string, number>);
};

const defaultSimulation: SimulationState = {
  pitch: 0,
  speed: 0,
  duty: 0,
  current: 0,
  voltage: 3.7,
  isAccelerating: false,
  isBraking: false,
};

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  values: getDefaultValues(),
  simulation: defaultSimulation,
  isAnimating: false,
  lastChangedParam: null,
  selectedCategory: 'all',
  showDescriptions: true,

  setParameter: (id, value) => {
    const param = PARAMETERS.find(p => p.id === id);
    if (!param) return;

    // Clamp value to valid range
    const clampedValue = Math.max(param.min, Math.min(param.max, value));

    set((state) => ({
      values: { ...state.values, [id]: clampedValue },
      lastChangedParam: id,
      isAnimating: true,
    }));

    // Update simulation based on parameter change
    const state = get();
    updateSimulation(id, clampedValue, state, set);

    // Reset animation flag
    setTimeout(() => {
      set({ isAnimating: false });
    }, 500);
  },

  resetToDefaults: () => {
    set({
      values: getDefaultValues(),
      simulation: defaultSimulation,
      lastChangedParam: null,
    });
  },

  resetParameter: (id) => {
    const param = PARAMETERS.find(p => p.id === id);
    if (!param) return;

    set((state) => ({
      values: { ...state.values, [id]: param.default },
      lastChangedParam: id,
    }));
  },

  setSimulation: (newState) => {
    set((state) => ({
      simulation: { ...state.simulation, ...newState },
    }));
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  toggleDescriptions: () => {
    set((state) => ({ showDescriptions: !state.showDescriptions }));
  },

  getSafetyScore: () => {
    const { values } = get();
    let score = 100;

    // Duty tiltback - lower is safer
    const dutyDefault = 0.82;
    const dutyValue = values.tiltback_duty || dutyDefault;
    if (dutyValue > 0.90) score -= 30;
    else if (dutyValue > 0.85) score -= 15;
    else if (dutyValue < 0.80) score += 5;

    // Speed tiltback - lower is safer
    const speedValue = values.tiltback_speed || 30;
    if (speedValue > 40) score -= 20;
    else if (speedValue > 35) score -= 10;
    else if (speedValue < 25) score += 5;

    // Booster current - higher is safer
    const boosterValue = values.booster_current || 15;
    if (boosterValue < 10) score -= 15;
    else if (boosterValue > 20) score += 5;

    // LV threshold - higher is safer
    const lvValue = values.tiltback_lv || 3.2;
    if (lvValue < 3.0) score -= 20;
    else if (lvValue > 3.3) score += 5;

    return Math.max(0, Math.min(100, score));
  },

  getParameterDelta: (id) => {
    const param = PARAMETERS.find(p => p.id === id);
    if (!param) return 0;

    const { values } = get();
    const currentValue = values[id] ?? param.default;
    const range = param.max - param.min;

    return ((currentValue - param.default) / range) * 100;
  },
}));

// Helper to update simulation based on parameter changes
function updateSimulation(
  paramId: string,
  value: number,
  state: PlaygroundState,
  set: (partial: Partial<PlaygroundState>) => void
) {
  const { simulation, values } = state;

  switch (paramId) {
    case 'kp':
      // Higher Kp = quicker pitch response
      // Simulate with a small pitch oscillation
      set({
        simulation: {
          ...simulation,
          pitch: (value - 0.8) * 5, // Deviation from default
        },
      });
      break;

    case 'tiltback_duty':
      // Show duty headroom
      set({
        simulation: {
          ...simulation,
          duty: 0.75, // Show typical cruising duty
        },
      });
      break;

    case 'tiltback_speed':
      // Simulate at 80% of tiltback speed
      set({
        simulation: {
          ...simulation,
          speed: value * 0.8,
        },
      });
      break;

    case 'booster_current':
      // Show current spike when booster would activate
      set({
        simulation: {
          ...simulation,
          current: value,
        },
      });
      break;

    case 'atr_strength_up':
    case 'atr_strength_down':
      // Show ATR effect on pitch
      const atrUp = values.atr_strength_up ?? 1.0;
      const atrDown = values.atr_strength_down ?? 0.8;
      set({
        simulation: {
          ...simulation,
          pitch: paramId === 'atr_strength_up' ? -atrUp * 3 : atrDown * 3,
          isAccelerating: paramId === 'atr_strength_up',
          isBraking: paramId === 'atr_strength_down',
        },
      });
      break;
  }
}
