# Refloat Package

## Overview

Advanced self-balancing package for Onewheel-style vehicles:

- PID control with Mahony AHRS
- Adaptive Torque Response (ATR)
- Comprehensive safety systems
- LED lighting control
- BMS integration
- Haptic feedback

**Repository:** `../refloat/`
**License:** GPL-3.0
**Author:** Lukas Hrazky

## Key Features

### Balance Control
- Mahony AHRS filter for orientation
- PID controller with rate term
- Asymmetric brake/accel response
- Configurable loop frequency (800-1400Hz)

### Setpoint Modifiers
| Modifier | Purpose |
|----------|---------|
| ATR | Adaptive response to terrain |
| Torque Tilt | Current-based nose angle |
| Turn Tilt | Yaw-based lean compensation |
| Brake Tilt | Nose lift during braking |
| Booster | Current boost at high pitch |
| Nose Angling | Speed-dependent tilt |

### Setpoint Adjustment Types (Full Enum)
| Type | Value | Description |
|------|-------|-------------|
| CENTERING | 0 | Return to center position |
| REVERSESTOP | 1 | Reverse stop activated |
| TILTBACK_DUTY | 2 | Duty-based tiltback |
| TILTBACK_HV | 3 | High voltage tiltback |
| TILTBACK_LV | 4 | Low voltage tiltback |
| TILTBACK_TEMP | 5 | Temperature tiltback |
| TILTBACK_SPEED | 6 | Speed-based tiltback |
| INPUTTILT | 7 | Remote input tilt |

*Source: `refloat/src/setpoint.h`*

### Safety Systems
- Pitch/roll fault detection
- Footpad sensor monitoring
- Tiltback (duty, speed, voltage)
- Wheelslip detection
- Reverse stop
- Darkride mode

### LED System
- WS2812/SK6812 support
- Status, headlight, taillight
- Multiple animation modes
- Direction-aware switching

### Haptic Feedback
- FOC tone alerts
- Motor vibration
- Speed-dependent strength

## Architecture

```
IMU Sensors
    │
    ▼
AHRS Filter ──► Pitch, Roll, Yaw
    │
    ▼
┌────────────────────────────────┐
│      Setpoint Modifiers        │
│  ATR │ Torque │ Turn │ Brake   │
└────────────────┬───────────────┘
                 │
                 ▼
         PID Controller
                 │
                 ▼
           Booster
                 │
                 ▼
      Motor Current Request
```

## Configuration

### PID Tuning
| Parameter | Description |
|-----------|-------------|
| `kp` | Proportional gain |
| `ki` | Integral gain |
| `kp2` | Rate (derivative) gain |
| `mahony_kp` | AHRS pitch KP |
| `mahony_kp_roll` | AHRS roll KP (separate from pitch) |
| `kp_brake` | Brake P scaling |

### Safety
| Parameter | Description |
|-----------|-------------|
| `fault_pitch` | Max pitch angle |
| `fault_roll` | Max roll angle |
| `fault_delay_*` | Fault delays |
| `tiltback_duty` | Duty pushback |
| `tiltback_speed` | Speed pushback |

### ATR
| Parameter | Description |
|-----------|-------------|
| `atr_strength_up/down` | ATR strength |
| `atr_threshold_up/down` | Activation threshold |
| `atr_angle_limit` | Maximum ATR angle |
| `atr_speed_boost` | Speed-based boost |

## State Machine

| State | Description |
|-------|-------------|
| DISABLED | Package disabled |
| STARTUP | IMU initializing |
| READY | Waiting for rider |
| RUNNING | Active balancing |
| HANDTEST | Bench testing mode (motor runs without footpads) |
| FLYWHEEL | Indoor training mode (spins freely for tricks) |

### Special Modes

**HANDTEST Mode:** Allows motor operation without footpad activation. Used for bench testing and diagnostics.

**FLYWHEEL Mode:** Spins the wheel freely for indoor trick practice. Useful for balance training without riding.

**Konami Sequence:** Hidden feature activated by specific footpad sensor sequence. Unlocks special modes or configurations.

### Stop Conditions
- PITCH - Pitch exceeded
- ROLL - Roll exceeded
- SWITCH_HALF - Single sensor off
- SWITCH_FULL - Both sensors off
- REVERSE_STOP - Reverse triggered
- QUICKSTOP - Quick dismount

## Build Instructions

### Requirements
- gcc-arm-embedded 13+
- make
- vesc_tool

### Build
```bash
make
# Output: refloat.vescpkg
```

## Key Files

| File | Purpose |
|------|---------|
| `src/main.c` | Main control loop |
| `src/pid.c` | PID controller |
| `src/balance_filter.c` | Mahony AHRS |
| `src/atr.c` | Adaptive Torque Response |
| `src/leds.c` | LED animations |
| `src/haptic_feedback.c` | Haptic alerts |
| `ui.qml.in` | User interface |

## Tuning Guide

### Tighter Response
- Increase `kp` for quicker response
- Increase `kp2` for more dampening
- Increase `mahony_kp` for IMU responsiveness

### Asymmetric Braking
- Set `kp_brake` > 1.0 for stronger braking
- Set `kp2_brake` > 1.0 for more brake dampening

### ATR Tuning
- Increase `atr_strength_up` for uphill/grass
- Increase `atr_strength_down` for downhill
- Adjust `atr_speed_boost` for high-speed boost

## Resources

- [GitHub Repository](https://github.com/lukash/refloat)
