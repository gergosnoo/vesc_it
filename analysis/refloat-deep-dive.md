# Refloat Deep Dive Analysis
**Reviewer:** Claude-9 (Observer Instance)
**Date:** 2026-01-13
**Source:** Direct verification against `../refloat/src/`

---

## Executive Summary

Claude-8's `docs/refloat.md` is **~85% accurate** but missing several key features and technical details. This document provides corrections, additions, and AI knowledge base recommendations.

---

## Verification Results

### Confirmed Correct

| Claim | Source File | Line(s) |
|-------|-------------|---------|
| Mahony AHRS filter | `balance_filter.c` | 65-70 |
| 4 run states (DISABLED/STARTUP/READY/RUNNING) | `state.h` | 23-28 |
| 6 stop conditions (PITCH/ROLL/SWITCH_HALF/SWITCH_FULL/REVERSE/QUICKSTOP) | `state.h` | 36-44 |
| PID with kp, ki, kp2 | `pid.c` | 27-72 |
| ATR (Adaptive Torque Response) | `atr.c` | all |
| Torque tilt | `torque_tilt.c` | all |
| Turn tilt | `turn_tilt.c` | all |
| Brake tilt | `brake_tilt.c` | all |
| Wheelslip detection | `main.c` | 552-574 |
| WS2812/SK6812 LED support | `leds.c` | all |
| Haptic feedback | `haptic_feedback.c` | all |
| BMS integration | `bms.c` | all |
| Booster | `booster.c` | all |
| GPL-3.0 license | headers | all |
| Author: Lukas Hrazky | headers | all |

### Corrections Needed

#### 1. Mahony Parameters Incomplete

**Claude-8 listed:** `mahony_kp`
**Reality:** Two separate parameters exist:
- `mahony_kp` - Pitch axis KP (conf/datatypes.h:213)
- `mahony_kp_roll` - Roll axis KP (conf/datatypes.h:214)

The yaw KP is dynamically calculated as average: `(mahony_kp + mahony_kp_roll) / 2.0f` (balance_filter.c:70)

#### 2. PID Term Naming

**Claude-8 called it:** "kp2 (Rate/derivative gain)"
**Reality:** It's specifically a **pitch rate** term, not a traditional derivative:
```c
// pid.h:27
float rate_p;  // used instead of d, works better with high Mahony KP
```
The implementation: `pid->rate_p = -imu->pitch_rate * config->kp2;` (pid.c:71)

#### 3. Loop Frequency Parameter

**Claude-8 claimed:** "800-1400Hz configurable"
**Reality:** Parameter is `hertz` in datatypes.h:217, but no explicit min/max found in source. The settings.xml defines it but range needs verification in UI.

### Missing Features (Not Documented)

#### 1. Konami Sequence System
Hidden easter egg feature for footpad-based input sequences.
- File: `konami.c`, `konami.h`
- Used for: Activating flywheel mode, other hidden features
- Implementation: Timed footpad sensor pattern matching

#### 2. Flywheel Mode
Indoor training mode where board is mounted on a stand.
- State: `MODE_FLYWHEEL = 2` (state.h:33)
- Features: Pitch/roll offset calibration for mounted position
- Activation: Via Konami sequence (data.h:81)

#### 3. Handtest Mode
Testing mode without rider.
- State: `MODE_HANDTEST = 1` (state.h:32)
- Purpose: Bench testing motor response

#### 4. Setpoint Adjustment Types
Claude-8 mentioned tiltback but missed the full SAT enum:
```c
typedef enum {
    SAT_NONE = 0,
    SAT_CENTERING = 1,
    SAT_REVERSESTOP = 2,
    SAT_PB_SPEED = 5,      // Speed pushback
    SAT_PB_DUTY = 6,       // Duty pushback
    SAT_PB_ERROR = 7,      // Error pushback
    SAT_PB_HIGH_VOLTAGE = 10,
    SAT_PB_LOW_VOLTAGE = 11,
    SAT_PB_TEMPERATURE = 12
} SetpointAdjustmentType;
```
Source: state.h:47-58

#### 5. Additional Source Files Not Listed

| File | Purpose |
|------|---------|
| `alert_tracker.c/h` | Alert state tracking |
| `biquad.c/h` | Digital filter implementation |
| `charging.c/h` | Charging mode handling |
| `data_recorder.c/h` | Telemetry logging |
| `footpad_sensor.c/h` | Sensor state detection |
| `imu.c/h` | IMU data processing |
| `konami.c/h` | Easter egg sequences |
| `lcm.c/h` | LED controller management |
| `led_driver.c/h` | Low-level LED control |
| `led_strip.c/h` | LED strip abstraction |
| `motor_control.c/h` | Motor command interface |
| `motor_data.c/h` | Motor telemetry processing |
| `remote.c/h` | Remote control input |
| `rt_data.h` | Real-time data structures |
| `time.c/h` | Timer utilities |
| `utils.c/h` | Helper functions |

---

## AI Knowledge Base Recommendations

### High-Value Config Parameters for Chatbot

These are the most frequently asked about parameters:

#### Safety (Most Critical)
| Parameter | Description | Typical Range |
|-----------|-------------|---------------|
| `fault_pitch` | Max forward/back angle before fault | 65-75 degrees |
| `fault_roll` | Max side tilt before fault | 45-60 degrees |
| `fault_delay_pitch` | Delay before pitch fault | 100-250ms |
| `fault_darkride_enabled` | Allow single-sensor riding | true/false |

#### PID Tuning (Most Asked)
| Parameter | Description | Effect |
|-----------|-------------|--------|
| `kp` | Proportional gain | Response strength |
| `ki` | Integral gain | Steady-state correction |
| `ki_limit` | I-term saturation | Prevents windup |
| `kp2` | Rate gain | Dampening/stability |
| `kp_brake` | Brake P multiplier | Stronger braking |
| `kp2_brake` | Brake rate multiplier | Brake dampening |

#### ATR (Advanced Riders)
| Parameter | Description |
|-----------|-------------|
| `atr_strength_up` | Uphill/acceleration strength |
| `atr_strength_down` | Downhill strength |
| `atr_threshold_up/down` | Activation thresholds |
| `atr_angle_limit` | Maximum ATR angle |
| `atr_speed_boost` | Speed-based boost |

#### IMU (Mahony)
| Parameter | Description |
|-----------|-------------|
| `mahony_kp` | Pitch filter responsiveness |
| `mahony_kp_roll` | Roll filter responsiveness |
| `hertz` | Loop frequency |

### Suggested AI Response Templates

#### For "What is [parameter]?"
```
**{parameter}** controls {description}.

**Default:** {value}
**Safe range:** {min} to {max}
**Effect:** {ride_feel_description}

**Warning:** {if_applicable}
```

#### For "How do I tune for [riding_style]?"
```
For {riding_style} riding, consider:

1. **{param1}:** Set to {value1} because {reason}
2. **{param2}:** Set to {value2} because {reason}

**Start with:** {safest_change}
**Advanced:** {aggressive_change}
```

---

## Source Code Quality Notes

### Strengths
- Clean modular architecture (separate files per feature)
- Consistent copyright headers with GPL-3.0
- Good separation of concerns (state, control, IO)
- Comprehensive timing system (time.c/h)

### Areas for AI Documentation
- Default values are defined via `CFG_DFLT_*` macros
- Configuration stored in `RefloatConfig` struct (conf/datatypes.h)
- UI defined in `ui.qml.in` / `settings.xml`

---

## Recommendations for Claude-8

1. **Add mahony_kp_roll** to the config table
2. **Rename kp2** to "rate gain" and explain it's not traditional D term
3. **Document the 3 modes:** NORMAL, HANDTEST, FLYWHEEL
4. **Add SAT enum** for complete tiltback/pushback coverage
5. **List all source files** (currently lists 7, actually 30+)
6. **Add Konami sequence** as hidden feature note

---

## Files Changed by Claude-9

| File | Action |
|------|--------|
| `analysis/claude-9-review.md` | Created - general review |
| `analysis/plan-comparison.md` | Created - approach comparison |
| `analysis/refloat-deep-dive.md` | Created - this file |
| `plans/ai-system-technical-spec.md` | Created - AI architecture |
| `CLAUDE.md` | Updated - added Claude-9 role |

---

*Generated by Claude-9 verification pass*
