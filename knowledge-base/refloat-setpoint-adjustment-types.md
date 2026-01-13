# Refloat Setpoint Adjustment Types (SAT)

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-13
**Source:** `refloat/src/state.h`, `refloat/src/main.c`
**Addresses:** GAP-08 (Medium Priority)

---

## Overview

Setpoint Adjustment Type (SAT) indicates why Refloat is adjusting the balance setpoint. This affects how the board tilts and at what speed.

---

## SAT Types Reference

**Source:** `refloat/src/state.h:46-58`

```c
// From refloat/src/state.h:46-58
// leaving gaps for more states inbetween the different "classes" of the types
// (normal / warning / error)
typedef enum {
    SAT_NONE = 0,
    SAT_CENTERING = 1,
    SAT_REVERSESTOP = 2,
    SAT_PB_SPEED = 5,
    SAT_PB_DUTY = 6,
    SAT_PB_ERROR = 7,
    SAT_PB_HIGH_VOLTAGE = 10,
    SAT_PB_LOW_VOLTAGE = 11,
    SAT_PB_TEMPERATURE = 12
} SetpointAdjustmentType;
```

| SAT | Value | Meaning | When Active |
|-----|-------|---------|-------------|
| **SAT_NONE** | 0 | Normal operation | Riding normally, no adjustments |
| **SAT_CENTERING** | 1 | Startup centering | Finding level after mount |
| **SAT_REVERSESTOP** | 2 | Reverse stop active | Reversing at low speed |
| **SAT_PB_SPEED** | 5 | Speed pushback | Approaching speed limit |
| **SAT_PB_DUTY** | 6 | Duty pushback | High motor duty cycle |
| **SAT_PB_ERROR** | 7 | Error condition | Fault occurred |
| **SAT_PB_HIGH_VOLTAGE** | 10 | High voltage tiltback | Battery overvoltage |
| **SAT_PB_LOW_VOLTAGE** | 11 | Low voltage tiltback | Battery undervoltage |
| **SAT_PB_TEMPERATURE** | 12 | Temperature tiltback | Motor/MOSFET overheat |

Note: Values 3-4 and 8-9 are reserved for future use as the source comment indicates.

---

## Detailed Behavior

### SAT_NONE (0) - Normal Operation

- No setpoint adjustment active
- Board balances at configured angle
- Uses `tiltback_return_step_size` for any angle corrections
- Goal state during normal riding

### SAT_CENTERING (1) - Startup Centering

**When triggered:**
- After mounting the board
- Transitioning from ready to running state

**Behavior:**
- Gradually centers the board
- Uses `startup_step_size` for smooth transition
- Clears automatically when target reached

**Purpose:** Prevents sudden movements when stepping on.

### SAT_REVERSESTOP (2) - Reverse Stop

**When triggered:**
- ERPM < -200 (moving backwards)
- `fault_reversestop_enabled` is true
- Not in darkride mode

**Behavior:**
- Tilts nose up to slow reverse motion
- Uses `reverse_stop_step_size`
- Accumulates reverse ERPM to track distance

**Purpose:** Prevents uncontrolled backwards rolling.

### SAT_PB_SPEED (5) - Speed Pushback

**When triggered:**
- Speed exceeds `tiltback_speed` setting
- Only in normal mode (not flywheel)

**Behavior:**
- Tilts back at `tiltback_duty_step_size`
- Angle set by `tiltback_speed_angle`
- Generates warning beep (BEEP_SPEED)

**Purpose:** Warns rider of approaching speed limit.

### SAT_PB_DUTY (6) - Duty Pushback

**When triggered:**
- Duty cycle exceeds `tiltback_duty` setting
- Motor working near maximum capacity

**Behavior:**
- Uses `tiltback_duty_step_size`
- Angle based on `tiltback_duty_angle`
- Only in normal mode (not flywheel)

**Purpose:** Prevents motor/controller overload.

### SAT_PB_ERROR (7) - Error Condition

**When triggered:**
- Various fault conditions
- Encoding/communication errors

**Behavior:**
- Uses `tiltback_hv_step_size` (same as HV)
- Forces rider to slow down

**Purpose:** Safety response to system errors.

### SAT_PB_HIGH_VOLTAGE (10) - High Voltage

**When triggered:**
- Battery voltage > `hv_threshold` (per-cell on 6.05+)
- Usually during regen braking with full battery

**Behavior:**
- Uses `tiltback_hv_step_size`
- Tilts to `tiltback_hv_angle`
- Takes priority over most other conditions

**Purpose:** Protects battery from overcharge.

### SAT_PB_LOW_VOLTAGE (11) - Low Voltage

**When triggered:**
- Battery voltage < `lv_threshold` (per-cell on 6.05+)
- Battery running low

**Behavior:**
- Uses `tiltback_lv_step_size`
- Tilts to `tiltback_lv_angle`
- Warning to find charger

**Purpose:** Protects battery from deep discharge.

### SAT_PB_TEMPERATURE (12) - Temperature Pushback

**When triggered:**
- MOSFET temp > `mosfet_temp_max`
- Motor temp > `motor_temp_max`
- Motor temp > `atr_motor_temp_abort`

**Behavior:**
- Uses `tiltback_hv_step_size`
- Tilts to `tiltback_lv_angle`
- Slower adjustment than speed pushback

**Purpose:** Protects electronics from heat damage.

---

## Step Size Settings

Each SAT type uses specific step sizes for smooth transitions:

| Step Size Setting | Used By | Effect |
|-------------------|---------|--------|
| `tiltback_return_step_size` | SAT_NONE | Return to normal angle |
| `startup_step_size` | SAT_CENTERING | Startup smoothness |
| `reverse_stop_step_size` | SAT_REVERSESTOP | Reverse stop aggression |
| `tiltback_duty_step_size` | SAT_PB_DUTY, SAT_PB_SPEED | Duty/speed warning rate |
| `tiltback_hv_step_size` | SAT_PB_HIGH_VOLTAGE, SAT_PB_ERROR, SAT_PB_TEMPERATURE | Critical warning rate |
| `tiltback_lv_step_size` | SAT_PB_LOW_VOLTAGE | Low battery warning rate |

**Higher step size = faster angle change**

---

## Priority Order

When multiple conditions occur, this is the priority:

1. **SAT_REVERSESTOP** - Takes priority during reverse
2. **SAT_PB_ERROR** - Safety takes precedence
3. **SAT_PB_HIGH_VOLTAGE** - Battery protection
4. **SAT_PB_LOW_VOLTAGE** - Battery protection
5. **SAT_PB_TEMPERATURE** - Thermal protection
6. **SAT_PB_DUTY** - Duty limit
7. **SAT_PB_SPEED** - Speed limit
8. **SAT_CENTERING** - Startup only
9. **SAT_NONE** - Normal operation

---

## Apps and SAT

Mobile apps (Floaty, Float Control) can read SAT to show:
- Current board state indicator
- Warning type icons
- Safety condition alerts

The SAT value is included in real-time data packets.

---

*Content verified against refloat source code | Ready for embedding*
