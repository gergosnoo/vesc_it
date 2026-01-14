/**
 * VESC/Refloat Parameter Database
 * Top 10 Parameters for Onewheel Simulator MVP
 *
 * Priority order based on:
 * 1. User interaction frequency
 * 2. Impact on ride feel/safety
 * 3. Common misconfiguration issues
 * 4. Clear cause-effect visualization potential
 */

export interface ParameterRange {
  min: number;
  max: number;
  default: number;
  step: number;
}

export interface SkillRanges {
  beginner: [number, number];
  intermediate: [number, number];
  advanced: [number, number];
}

export interface CauseEffect {
  increase: string;
  decrease: string;
}

export interface Parameter {
  id: string;
  name: string;
  shortName: string;
  category: 'feel' | 'safety' | 'engagement' | 'tuning';
  location: string;
  unit: string;

  // Core explanation
  whatItDoes: string;
  whyItMatters: string;
  feelDescription: string;

  // Cause-effect
  causeEffect: CauseEffect;

  // Ranges
  range: ParameterRange;
  safeRanges: SkillRanges;
  dangerZone?: string;

  // Relationships
  relatedParams: string[];
  affectedBy: string[];

  // Visualization
  visualEffect: string;
  animationKey: string;
}

// ============================================================
// TOP 10 PARAMETERS (Priority Order)
// ============================================================

export const TOP_10_PARAMETERS: Parameter[] = [
  // #1 - TILTBACK DUTY (Safety Critical)
  {
    id: 'tiltback_duty',
    name: 'Tiltback Duty',
    shortName: 'Duty TB',
    category: 'safety',
    location: 'Refloat Cfg → Tiltback → Duty',
    unit: '%',

    whatItDoes:
      'Sets the motor duty cycle where tiltback warning begins.',
    whyItMatters:
      'This is your primary nosedive prevention. At 100% duty, the motor has nothing left. Tiltback warns you BEFORE you hit that wall.',
    feelDescription:
      'When activated, the nose gently rises, pushing you to slow down. It\'s the board saying "I\'m working hard."',

    causeEffect: {
      increase:
        'Higher top speed before warning, BUT less safety margin. Above 90% is dangerous - only 10% headroom for hills/bumps.',
      decrease:
        'Earlier warning, more safety margin. 80% gives you 20% headroom for surprises. Recommended for most riders.',
    },

    range: { min: 0.7, max: 0.95, default: 0.82, step: 0.01 },
    safeRanges: {
      beginner: [0.75, 0.80],
      intermediate: [0.80, 0.85],
      advanced: [0.82, 0.88],
    },
    dangerZone:
      'Above 90%: HIGH nosedive risk! Almost no headroom for unexpected demands.',

    relatedParams: ['tiltback_hv', 'tiltback_lv', 'haptic_buzz_duty'],
    affectedBy: ['battery_voltage'],

    visualEffect: 'duty_gauge_fill',
    animationKey: 'noseTiltUp',
  },

  // #2 - KP (Ride Feel)
  {
    id: 'kp',
    name: 'Kp (Proportional Gain)',
    shortName: 'Kp',
    category: 'feel',
    location: 'Refloat Cfg → Tune → Kp',
    unit: '',

    whatItDoes:
      'Controls how strongly the board reacts to being off-balance.',
    whyItMatters:
      'This is the primary "feel" of your board. It determines whether the ride feels snappy or floaty.',
    feelDescription:
      'Like steering sensitivity in a car. High Kp = sports car (instant response). Low Kp = truck (slower, forgiving).',

    causeEffect: {
      increase:
        'Board reacts faster, feels snappier and more responsive. Great for carving. Can feel twitchy if too high.',
      decrease:
        'Board feels more relaxed and forgiving. Good for beginners. Too low = sluggish, hard to control.',
    },

    range: { min: 0.1, max: 10, default: 1.5, step: 0.1 },
    safeRanges: {
      beginner: [0.5, 1.2],
      intermediate: [1.0, 3.0],
      advanced: [2.0, 6.0],
    },
    dangerZone:
      'Above 7: Extremely twitchy, may oscillate. Below 0.3: Too slow to recover from bumps.',

    relatedParams: ['kd', 'mahony_kp'],
    affectedBy: ['current_limit'],

    visualEffect: 'tilt_response_speed',
    animationKey: 'boardTiltSpeed',
  },

  // #3 - KD (Ride Smoothness)
  {
    id: 'kd',
    name: 'Kd (Derivative Gain)',
    shortName: 'Kd',
    category: 'feel',
    location: 'Refloat Cfg → Tune → Kd',
    unit: '',

    whatItDoes:
      'Dampens oscillations and smooths out the board\'s corrections.',
    whyItMatters:
      'Works with Kp to prevent wobbles. Think of it as the "shock absorber" of your tune.',
    feelDescription:
      'High Kd = stable, planted feel. Low Kd = more lively but can wobble at speed.',

    causeEffect: {
      increase:
        'Smoother, more stable corrections. Helps prevent speed wobbles. Too high = sluggish response.',
      decrease:
        'More lively feel, but less damping. Can develop oscillations at high speed or with high Kp.',
    },

    range: { min: 0, max: 1, default: 0.1, step: 0.01 },
    safeRanges: {
      beginner: [0.05, 0.15],
      intermediate: [0.08, 0.25],
      advanced: [0.1, 0.4],
    },
    dangerZone:
      'Rule of thumb: Kd ≈ Kp/10 to Kp/15. If Kd is too low relative to Kp, expect wobbles.',

    relatedParams: ['kp'],
    affectedBy: ['kp'],

    visualEffect: 'oscillation_damping',
    animationKey: 'wobbleDamping',
  },

  // #4 - MAHONY KP (Level Finding)
  {
    id: 'mahony_kp',
    name: 'Mahony Kp',
    shortName: 'Mahony',
    category: 'feel',
    location: 'Refloat Cfg → Tune → Mahony Kp',
    unit: '',

    whatItDoes:
      'Controls how quickly the board determines what "level" is.',
    whyItMatters:
      'Affects how the board tracks your stance. Higher = adapts faster to your position.',
    feelDescription:
      'Low Mahony = board remembers level longer (stable reference). High = adapts to your current stance quickly.',

    causeEffect: {
      increase:
        'Board adapts faster to terrain changes. Good for trails. Can feel "drifty" if too high.',
      decrease:
        'More stable level reference. Nose stays where you set it. Can feel "stubborn" on varied terrain.',
    },

    range: { min: 0.1, max: 3, default: 0.4, step: 0.1 },
    safeRanges: {
      beginner: [0.3, 0.5],
      intermediate: [0.3, 1.0],
      advanced: [0.2, 2.0],
    },

    relatedParams: ['kp', 'remote_tilt'],
    affectedBy: [],

    visualEffect: 'level_tracking_speed',
    animationKey: 'levelAdaptation',
  },

  // #5 - SURGE DUTY START (Hill Safety)
  {
    id: 'surge_duty_start',
    name: 'Surge Duty Start',
    shortName: 'Surge',
    category: 'safety',
    location: 'Refloat Cfg → Surge → Duty Start',
    unit: '%',

    whatItDoes:
      'Duty level where surge protection (temporary power boost) activates.',
    whyItMatters:
      'Prevents nosedives on hills by providing extra power when motor is under heavy load.',
    feelDescription:
      'When you hit a hill and surge kicks in, you feel extra push keeping you balanced. It\'s your "hill assist".',

    causeEffect: {
      increase:
        'Surge activates later (at higher duty). Less intervention, more natural feel. But less protection.',
      decrease:
        'Surge activates earlier. More safety margin on hills. Can feel "boosty" on flat ground.',
    },

    range: { min: 0.6, max: 0.95, default: 0.85, step: 0.01 },
    safeRanges: {
      beginner: [0.75, 0.85],
      intermediate: [0.80, 0.90],
      advanced: [0.85, 0.92],
    },
    dangerZone:
      'Should always be BELOW tiltback_duty. If surge starts after tiltback, it\'s useless.',

    relatedParams: ['tiltback_duty', 'surge_scaler'],
    affectedBy: ['battery_voltage'],

    visualEffect: 'power_boost_indicator',
    animationKey: 'surgeBoost',
  },

  // #6 - TILTBACK SPEED (Speed Limit)
  {
    id: 'tiltback_speed',
    name: 'Tiltback Speed',
    shortName: 'Speed TB',
    category: 'safety',
    location: 'Refloat Cfg → Tiltback → Speed',
    unit: 'km/h',

    whatItDoes:
      'Speed at which tiltback warning begins, regardless of duty cycle.',
    whyItMatters:
      'Your personal speed limiter. Even if duty is low, this caps your speed for safety.',
    feelDescription:
      'Hit this speed and the nose rises. Unlike duty tiltback, this is absolute - doesn\'t depend on battery or load.',

    causeEffect: {
      increase:
        'Higher top speed allowed. Make sure your battery and settings support it safely.',
      decrease:
        'Lower speed cap. Good for learning or riding in crowded areas.',
    },

    range: { min: 10, max: 50, default: 30, step: 1 },
    safeRanges: {
      beginner: [15, 25],
      intermediate: [25, 35],
      advanced: [30, 45],
    },
    dangerZone:
      'Setting this higher than your battery can safely deliver = false confidence. Know your limits.',

    relatedParams: ['tiltback_duty'],
    affectedBy: ['battery_voltage', 'motor_kv'],

    visualEffect: 'speedometer_limit',
    animationKey: 'speedTiltback',
  },

  // #7 - STARTUP PITCH TOLERANCE (Engagement)
  {
    id: 'startup_pitch_tolerance',
    name: 'Startup Pitch Tolerance',
    shortName: 'Pitch Tol',
    category: 'engagement',
    location: 'Refloat Cfg → Startup → Pitch Tolerance',
    unit: '°',

    whatItDoes:
      'How level the board must be to engage when you step on.',
    whyItMatters:
      'Prevents accidental engagement on uneven ground. Too tight = frustrating. Too loose = unexpected starts.',
    feelDescription:
      'Tight tolerance = board only starts when very level. Loose = easier to start on hills but can surprise you.',

    causeEffect: {
      increase:
        'Easier to engage on slopes. But might start unexpectedly when picking up the board.',
      decrease:
        'Must be more level to start. Safer, but annoying on uneven terrain.',
    },

    range: { min: 5, max: 45, default: 20, step: 1 },
    safeRanges: {
      beginner: [15, 25],
      intermediate: [20, 35],
      advanced: [25, 45],
    },

    relatedParams: ['startup_speed', 'roll_tolerance'],
    affectedBy: [],

    visualEffect: 'level_indicator_threshold',
    animationKey: 'engagementZone',
  },

  // #8 - SIMPLE STOP ERPM (Dismount)
  {
    id: 'simple_stop_erpm',
    name: 'Simple Stop ERPM',
    shortName: 'Stop ERPM',
    category: 'engagement',
    location: 'Refloat Cfg → Stop → Simple Stop ERPM',
    unit: 'ERPM',

    whatItDoes:
      'Motor speed below which the board auto-disengages when lifting heel.',
    whyItMatters:
      'Controls when you can do a "simple stop" by just lifting your heel. Higher = works at faster speeds.',
    feelDescription:
      'At low speed, lift your heel and board gently stops. This sets how slow "low speed" is.',

    causeEffect: {
      increase:
        'Can simple-stop at higher speeds. More convenient but can disengage unexpectedly.',
      decrease:
        'Must be going slower to simple-stop. Safer but requires more complete stop.',
    },

    range: { min: 500, max: 5000, default: 2000, step: 100 },
    safeRanges: {
      beginner: [1500, 2500],
      intermediate: [2000, 3500],
      advanced: [2500, 4500],
    },

    relatedParams: ['fault_adc_half_erpm'],
    affectedBy: [],

    visualEffect: 'dismount_speed_threshold',
    animationKey: 'simpleStopZone',
  },

  // #9 - ATR STRENGTH (Advanced Riding)
  {
    id: 'atr_strength',
    name: 'ATR Strength',
    shortName: 'ATR',
    category: 'tuning',
    location: 'Refloat Cfg → ATR → Strength',
    unit: '',

    whatItDoes:
      'Adjusts nose angle based on speed. Higher speed = more nose-up at cruise.',
    whyItMatters:
      'Creates a more natural riding position at speed. Without it, you lean forward too much at higher speeds.',
    feelDescription:
      'As you speed up, the board subtly raises the nose so you stand more upright. Feels like "auto-trim".',

    causeEffect: {
      increase:
        'More nose-up at speed. Feels like riding uphill at cruise. Good for aggressive riders.',
      decrease:
        'Less speed-based adjustment. Nose stays flatter. Some prefer this for consistency.',
    },

    range: { min: 0, max: 2, default: 0.5, step: 0.1 },
    safeRanges: {
      beginner: [0, 0.5],
      intermediate: [0.3, 1.0],
      advanced: [0.5, 1.5],
    },

    relatedParams: ['atr_speed_boost', 'atr_angle_limit'],
    affectedBy: ['speed'],

    visualEffect: 'nose_angle_vs_speed',
    animationKey: 'atrNoseRise',
  },

  // #10 - HAPTIC BUZZ DUTY (Warning Feedback)
  {
    id: 'haptic_buzz_duty',
    name: 'Haptic Buzz Duty',
    shortName: 'Haptic',
    category: 'safety',
    location: 'Refloat Cfg → Alerts → Haptic Buzz Duty',
    unit: '%',

    whatItDoes:
      'Duty level where haptic (vibration) warning activates.',
    whyItMatters:
      'Secondary warning system. If you don\'t feel tiltback, the buzz is your backup alert.',
    feelDescription:
      'Board vibrates through your feet when you\'re pushing too hard. Hard to ignore.',

    causeEffect: {
      increase:
        'Buzz comes later, at higher duty. More "quiet time" but less warning before limit.',
      decrease:
        'Earlier buzz warning. More intrusive but safer - gives more reaction time.',
    },

    range: { min: 0.7, max: 0.95, default: 0.85, step: 0.01 },
    safeRanges: {
      beginner: [0.75, 0.82],
      intermediate: [0.80, 0.88],
      advanced: [0.82, 0.90],
    },
    dangerZone:
      'Should be at or slightly below tiltback_duty. Buzz should come BEFORE or WITH tiltback, not after.',

    relatedParams: ['tiltback_duty', 'haptic_buzz_strength'],
    affectedBy: [],

    visualEffect: 'vibration_indicator',
    animationKey: 'hapticPulse',
  },
];

// ============================================================
// PARAMETER CONNECTION GRAPH
// ============================================================

export interface ParameterConnection {
  from: string;
  to: string;
  relationship: 'affects' | 'works_with' | 'must_be_less_than' | 'must_be_more_than' | 'ratio';
  description: string;
}

export const PARAMETER_CONNECTIONS: ParameterConnection[] = [
  // Safety Chain
  {
    from: 'surge_duty_start',
    to: 'tiltback_duty',
    relationship: 'must_be_less_than',
    description: 'Surge should activate BEFORE tiltback to provide boost first',
  },
  {
    from: 'haptic_buzz_duty',
    to: 'tiltback_duty',
    relationship: 'must_be_less_than',
    description: 'Buzz warning should come at or before tiltback',
  },
  {
    from: 'tiltback_duty',
    to: 'tiltback_speed',
    relationship: 'works_with',
    description: 'Both provide speed limiting - duty is dynamic, speed is absolute',
  },

  // Feel Chain
  {
    from: 'kp',
    to: 'kd',
    relationship: 'ratio',
    description: 'Kd should be Kp/10 to Kp/15 for stability',
  },
  {
    from: 'kp',
    to: 'mahony_kp',
    relationship: 'works_with',
    description: 'Both affect responsiveness - tune together for consistent feel',
  },

  // Engagement Chain
  {
    from: 'startup_pitch_tolerance',
    to: 'simple_stop_erpm',
    relationship: 'works_with',
    description: 'Start and stop behavior should match your riding style',
  },

  // Advanced
  {
    from: 'atr_strength',
    to: 'kp',
    relationship: 'affects',
    description: 'ATR changes nose angle, Kp determines how quickly board responds',
  },
];

// ============================================================
// CATEGORY METADATA
// ============================================================

export const CATEGORIES = {
  feel: {
    name: 'How It Feels',
    description: 'Parameters that change the ride character',
    icon: '🎯',
    color: 'blue',
  },
  safety: {
    name: 'Safety Systems',
    description: 'Warnings and limits that prevent crashes',
    icon: '🛡️',
    color: 'red',
  },
  engagement: {
    name: 'Start & Stop',
    description: 'How the board activates and deactivates',
    icon: '👟',
    color: 'green',
  },
  tuning: {
    name: 'Fine Tuning',
    description: 'Advanced parameters for experienced riders',
    icon: '⚙️',
    color: 'purple',
  },
} as const;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getParameterById(id: string): Parameter | undefined {
  return TOP_10_PARAMETERS.find((p) => p.id === id);
}

export function getParametersByCategory(
  category: Parameter['category']
): Parameter[] {
  return TOP_10_PARAMETERS.filter((p) => p.category === category);
}

export function getRelatedParameters(parameterId: string): Parameter[] {
  const param = getParameterById(parameterId);
  if (!param) return [];

  return param.relatedParams
    .map((id) => getParameterById(id))
    .filter((p): p is Parameter => p !== undefined);
}

export function getConnectionsForParameter(
  parameterId: string
): ParameterConnection[] {
  return PARAMETER_CONNECTIONS.filter(
    (c) => c.from === parameterId || c.to === parameterId
  );
}
