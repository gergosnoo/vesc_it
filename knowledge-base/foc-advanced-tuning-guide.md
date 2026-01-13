# FOC Advanced Tuning Guide

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-13
**Source:** `bldc/datatypes.h`, `bldc/motor/mcconf_default.h`, `bldc/motor/foc_math.c`
**Addresses:** GAP-04 (Medium Priority)

---

## Overview

Field Oriented Control (FOC) is the default motor control mode in VESC. This guide covers advanced tuning options beyond basic motor detection.

---

## Observer Types

**Source:** `bldc/datatypes.h:127-135`

```c
// From bldc/datatypes.h:127-135
typedef enum {
    FOC_OBSERVER_ORTEGA_ORIGINAL = 0,
    FOC_OBSERVER_MXLEMMING,
    FOC_OBSERVER_ORTEGA_LAMBDA_COMP,
    FOC_OBSERVER_MXLEMMING_LAMBDA_COMP,
    FOC_OBSERVER_MXV,
    FOC_OBSERVER_MXV_LAMBDA_COMP,
    FOC_OBSERVER_MXV_LAMBDA_COMP_LIN,
} mc_foc_observer_type;
```

| Observer | Enum Value | Best For |
|----------|------------|----------|
| **Ortega Original** | 0 | General use, proven stable |
| **mxlemming** | 1 | High KV motors |
| **Ortega Lambda Comp** | 2 | Motors with saturation |
| **mxlemming Lambda Comp** | 3 | High KV + saturation |
| **MXV** | 4 | Latest development |
| **MXV Lambda Comp** | 5 | High performance |
| **MXV Lambda Comp Lin** | 6 | Linear saturation model |

### When to Change Observer

**Keep default (Ortega Original) if:**
- Motor detection succeeded
- Motor runs smoothly
- No issues at low speed

**Try mxlemming/MXV if:**
- High KV motor (>3000 KV)
- Cogging at low speed
- Observer tracking issues
- Running high switching frequencies

---

## Observer Gain Tuning

### What It Does

Observer gain affects how quickly the position estimate responds. Formula:

```
Gain ≈ 500,000 / (flux_linkage²)
```

Higher gain = faster response but more noise
Lower gain = smoother but slower response

### Settings

**Source:** `bldc/motor/mcconf_default.h:298-305`

```c
// From bldc/motor/mcconf_default.h:298-305
#define MCCONF_FOC_OBSERVER_GAIN        9e7   // Can be ~600 / L
#define MCCONF_FOC_OBSERVER_GAIN_SLOW   0.05  // Scale at minimum duty
#define MCCONF_FOC_OBSERVER_OFFSET      -1.0  // Phase compensation
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `foc_observer_gain` | 9e7 | Main gain value |
| `foc_observer_gain_slow` | 0.05 | Multiplier at min duty |
| `foc_observer_offset` | -1.0 | Phase compensation |

### Observer Gain at Minimum Duty

**Source:** `bldc/motor/mcpwm_foc.c:4085-4086`

```c
// From bldc/motor/mcpwm_foc.c:4085-4086
if (gamma_tmp < (conf_now->foc_observer_gain_slow * conf_now->foc_observer_gain)) {
    gamma_tmp = conf_now->foc_observer_gain_slow * conf_now->foc_observer_gain;
}
```

`foc_observer_gain_slow` scales the observer gain at low duty cycles:
- Value of 0.05 means gain drops to 5% at minimum duty
- Helps reduce noise when motor is barely driven
- Increase (toward 1.0) if motor has trouble starting

---

## Saturation Compensation

Motors become magnetically saturated at high currents, reducing effective inductance and flux linkage.

### Modes

| Mode | Description | When to Use |
|------|-------------|-------------|
| **Disabled** | No compensation | Simple/small motors |
| **Factor** | Linear reduction by current ratio | Most motors |
| **Lambda** | Uses estimated lambda | IPM motors |
| **Lambda and Factor** | Combines both methods | Heavy saturation |

### How Factor Mode Works

From `foc_math.c`:
```c
comp_fact = foc_sat_comp * (i_abs / l_current_max);
L -= L * comp_fact;
lambda -= lambda * comp_fact;
```

With `foc_sat_comp = 0.3` at 50% current:
- Inductance reduced by 15%
- Flux linkage reduced by 15%

### Recommended Values

| Motor Type | foc_sat_comp |
|------------|--------------|
| Outrunner (esk8) | 0.0 - 0.2 |
| Hub motor | 0.1 - 0.3 |
| High-power motors | 0.2 - 0.5 |

---

## Cross-Coupling Decoupling

D and Q axis currents interact. Decoupling modes compensate for this.

| Mode | Description |
|------|-------------|
| **Disabled** | No compensation |
| **Cross** | Compensates cross-coupling term |
| **BEMF** | Compensates back-EMF |
| **Cross + BEMF** | Full compensation |

### When to Enable

- **Disabled**: Works for most motors
- **Cross**: High-speed motors, better current tracking
- **BEMF**: Motors with strong back-EMF effects
- **Cross + BEMF**: Maximum performance, may cause instability

**Start with Disabled**, only enable if you have current control issues.

---

## Ld/Lq Difference (IPM Motors)

Some motors (Interior Permanent Magnet) have different inductances in D and Q axes.

### Detection

VESC Tool shows `ld_lq_diff` during R/L detection:
```
Inductance: 12.5 uH (Lq-Ld: 3.2 uH)
```

### Configuration

Set `foc_motor_ld_lq_diff` if motor has significant saliency:
- Positive value: Lq > Ld (common)
- Zero: Assume Ld = Lq (default)
- Used for MTPA (Maximum Torque Per Amp) control

Most outrunner motors: **Leave at 0**

---

## Sensorless ERPM Settings

These control the transition between sensored and sensorless modes.

| Setting | Default | Description |
|---------|---------|-------------|
| `foc_sl_erpm` | 3500 | ERPM above which only observer used |
| `foc_sl_erpm_start` | 2500 | Start blending sensors with observer |
| `foc_openloop_rpm` | 1500 | Openloop ERPM for startup |

### Calculating Sensorless ERPM

For motor with 14 poles:
```
Electrical RPM = Mechanical RPM × (poles / 2)
Mechanical RPM = ERPM × (2 / poles)
```

Example: `foc_sl_erpm = 3500` with 14 poles:
- Sensorless above: 3500 × (2/14) = 500 mechanical RPM

### Tuning

**Decrease `foc_sl_erpm` if:**
- Motor has strong magnets (good back-EMF)
- Need sensorless at lower speeds
- Sensors are noisy

**Increase `foc_sl_erpm` if:**
- High KV motor (weak back-EMF)
- Observer unstable at low speed
- Motor stalls during transitions

---

## Current Controller Tuning

### PI Controller Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `foc_current_kp` | 0.03 | Proportional gain |
| `foc_current_ki` | 50.0 | Integral gain |
| `foc_current_filter_const` | 1.0 | Current filter (0-1) |

### Manual Tuning (Rarely Needed)

Detection calculates optimal KP/KI based on:
```
kp = L × bandwidth
ki = R × bandwidth
```

Only adjust if:
- Current oscillation in RT Data
- Audible ringing at certain speeds
- Detection gave wrong values

---

## Terminal Commands for Debugging

```
# Measure R and L manually
foc_detect_rl

# Measure flux linkage
foc_detect_lam

# Open loop test (bypass observer)
foc_openloop [current] [erpm]

# Open loop with duty
foc_openloop_duty [duty] [erpm]

# View current motor config
foc_state
```

---

## Troubleshooting

### Motor Cogging at Low Speed

1. Increase `foc_sl_erpm` to use sensors longer
2. Try different observer type (mxlemming)
3. Reduce `foc_observer_gain_slow`
4. Use Hall sensors if available

### Current Oscillation

1. Reduce `foc_current_kp` by 10-20%
2. Reduce switching frequency
3. Check for loose phase wires

### Observer Tracking Lost

1. Increase `foc_observer_gain`
2. Try "Lambda Comp" observer
3. Check flux linkage value (re-detect)
4. Reduce maximum ERPM

### Motor Jerks During Speed Changes

1. Enable saturation compensation (Factor mode)
2. Adjust `foc_sat_comp` value
3. Check for mechanical issues

---

## Best Practices

1. **Start with detection results** - Only change if problems occur
2. **Change one parameter at a time** - Easier to identify effects
3. **Test under load** - Behavior differs from no-load
4. **Document changes** - Write down what works
5. **Monitor RT Data** - Watch currents and temperatures

---

*Content verified against bldc source code | Ready for embedding*
