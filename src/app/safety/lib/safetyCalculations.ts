export interface BoardState {
  speed: number;           // km/h
  duty: number;            // 0-1
  current: number;         // Amps
  voltage: number;         // Per-cell voltage
  mosfetTemp: number;      // Celsius
  motorTemp: number;       // Celsius
  pitch: number;           // Degrees
  incline: number;         // Degrees (hill angle)
}

export interface SafetyConfig {
  tiltback_duty: number;
  tiltback_speed: number;
  tiltback_lv: number;
  tiltback_hv: number;
  motor_current_max: number;
  battery_current_max: number;
  mosfet_temp_max: number;
  motor_temp_max: number;
  // VESC 6.05+ critical settings
  fault_adc_half_erpm: number;
  surge_duty_start: number;
  simple_stop_erpm: number;
}

export interface SafetyMargins {
  dutyHeadroom: number;        // 0-100%
  currentHeadroom: number;     // 0-100%
  voltageMargin: number;       // 0-100%
  thermalMargin: number;       // 0-100%
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
}

export const DEFAULT_CONFIG: SafetyConfig = {
  tiltback_duty: 0.82,
  tiltback_speed: 30,
  tiltback_lv: 3.2,
  tiltback_hv: 4.2,
  motor_current_max: 60,
  battery_current_max: 30,
  mosfet_temp_max: 80,
  motor_temp_max: 100,
  fault_adc_half_erpm: 0,
  surge_duty_start: 0.85,
  simple_stop_erpm: 200,
};

export const DEFAULT_STATE: BoardState = {
  speed: 20,
  duty: 0.65,
  current: 25,
  voltage: 3.7,
  mosfetTemp: 45,
  motorTemp: 55,
  pitch: 0,
  incline: 0,
};

export function calculateSafetyMargins(
  state: BoardState,
  config: SafetyConfig
): SafetyMargins {
  const warnings: string[] = [];

  // Duty headroom - how far from pushback
  const dutyHeadroom = Math.max(0, ((config.tiltback_duty - state.duty) / config.tiltback_duty) * 100);
  if (dutyHeadroom < 15) {
    warnings.push(`Duty at ${(state.duty * 100).toFixed(0)}% - pushback imminent!`);
  } else if (dutyHeadroom < 25) {
    warnings.push(`Duty at ${(state.duty * 100).toFixed(0)}% - approaching limit`);
  }

  // Current headroom - how much more can the motor give?
  const currentHeadroom = Math.max(0, ((config.motor_current_max - state.current) / config.motor_current_max) * 100);
  if (currentHeadroom < 20) {
    warnings.push(`Current at ${state.current.toFixed(0)}A - near motor limit`);
  }

  // Voltage margin - distance from LV cutoff
  const voltageRange = config.tiltback_hv - config.tiltback_lv;
  const voltagePosition = (state.voltage - config.tiltback_lv) / voltageRange;
  const voltageMargin = Math.max(0, Math.min(100, voltagePosition * 100));
  if (voltageMargin < 20) {
    warnings.push(`Voltage at ${state.voltage.toFixed(2)}V/cell - LV warning!`);
  } else if (voltageMargin < 35) {
    warnings.push(`Battery at ${(voltageMargin).toFixed(0)}% - consider charging`);
  }

  // Thermal margin
  const mosfetMargin = Math.max(0, ((config.mosfet_temp_max - state.mosfetTemp) / config.mosfet_temp_max) * 100);
  const motorTempMargin = Math.max(0, ((config.motor_temp_max - state.motorTemp) / config.motor_temp_max) * 100);
  const thermalMargin = Math.min(mosfetMargin, motorTempMargin);
  if (thermalMargin < 20) {
    warnings.push(`Temperature critical - ${state.mosfetTemp}°C MOSFET`);
  }

  // Overall risk assessment
  const minMargin = Math.min(dutyHeadroom, currentHeadroom, voltageMargin, thermalMargin);
  let overallRisk: SafetyMargins['overallRisk'];

  if (minMargin > 50) overallRisk = 'low';
  else if (minMargin > 30) overallRisk = 'medium';
  else if (minMargin > 15) overallRisk = 'high';
  else overallRisk = 'critical';

  return {
    dutyHeadroom,
    currentHeadroom,
    voltageMargin,
    thermalMargin,
    overallRisk,
    warnings,
  };
}

export type Scenario = 'normal' | 'hill' | 'acceleration' | 'bump' | 'headwind' | 'lowBattery';

export interface ScenarioInfo {
  id: Scenario;
  name: string;
  icon: string;
  description: string;
}

export const SCENARIOS: ScenarioInfo[] = [
  { id: 'normal', name: 'Normal Cruise', icon: '🛹', description: 'Flat ground, steady speed' },
  { id: 'hill', name: 'Uphill', icon: '⛰️', description: '10% grade increases duty ~15%' },
  { id: 'acceleration', name: 'Hard Accel', icon: '💨', description: 'Aggressive acceleration' },
  { id: 'bump', name: 'Hit a Bump', icon: '⚡', description: 'Sudden current spike' },
  { id: 'headwind', name: 'Headwind', icon: '🌬️', description: 'Fighting the wind' },
  { id: 'lowBattery', name: 'Low Battery', icon: '🪫', description: 'Near LV threshold' },
];

export function applyScenario(
  baseState: BoardState,
  scenario: Scenario
): BoardState {
  const modifiedState = { ...baseState };

  switch (scenario) {
    case 'hill':
      modifiedState.duty = Math.min(1, baseState.duty * 1.15);
      modifiedState.current = baseState.current * 1.2;
      modifiedState.incline = 10;
      break;
    case 'acceleration':
      modifiedState.duty = Math.min(1, baseState.duty * 1.12);
      modifiedState.current = baseState.current * 1.4;
      modifiedState.pitch = -3;
      break;
    case 'bump':
      modifiedState.current = baseState.current * 1.6;
      modifiedState.duty = Math.min(1, baseState.duty * 1.25);
      modifiedState.pitch = -5;
      break;
    case 'headwind':
      modifiedState.duty = Math.min(1, baseState.duty * 1.08);
      modifiedState.current = baseState.current * 1.15;
      break;
    case 'lowBattery':
      modifiedState.voltage = 3.1;
      modifiedState.current = baseState.current * 0.9; // Less power available
      break;
    case 'normal':
    default:
      // No changes
      break;
  }

  return modifiedState;
}

export function getNosediveRisk(margins: SafetyMargins): {
  probability: number;
  label: string;
  color: string;
} {
  const minMargin = Math.min(
    margins.dutyHeadroom,
    margins.currentHeadroom,
    margins.voltageMargin
  );

  if (minMargin > 60) {
    return { probability: 5, label: 'Very Low', color: '#22c55e' };
  } else if (minMargin > 40) {
    return { probability: 15, label: 'Low', color: '#84cc16' };
  } else if (minMargin > 25) {
    return { probability: 35, label: 'Moderate', color: '#eab308' };
  } else if (minMargin > 15) {
    return { probability: 60, label: 'High', color: '#f97316' };
  } else {
    return { probability: 85, label: 'Critical', color: '#ef4444' };
  }
}
