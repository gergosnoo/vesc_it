# HFI (High Frequency Injection) Advanced Guide

## Overview

**Key Terms:** HFI, high frequency injection, sensorless startup, zero speed torque, saliency detection, FFT position, hfi_voltage, standstill torque, IPM motor, reluctance

This advanced guide explains HFI for expert users who need sensorless operation at zero/very low speed.

**Source:** `bldc/motor/mcpwm_foc.c:62`, `bldc/datatypes.h:486-499`

---

## What is HFI?

**HFI (High Frequency Injection)** detects rotor position by injecting a high-frequency signal and measuring the motor's response.

### Why HFI?

Standard FOC observer needs back-EMF to track position. At standstill or low speed, there's no back-EMF.

| Method | Works At | Startup | Complexity |
|--------|----------|---------|------------|
| Observer only | >500 ERPM | Open-loop | Simple |
| Hall sensors | Any speed | Reliable | Extra wiring |
| **HFI** | Any speed | Sensorless | Complex tuning |

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    HFI PRINCIPLE                         │
│                                                          │
│  1. Inject high-frequency voltage (kHz range)           │
│  2. Measure resulting current response                   │
│  3. Motor inductance varies with rotor position         │
│  4. FFT analysis extracts position from current         │
│  5. Position used for FOC commutation                   │
└─────────────────────────────────────────────────────────┘
```

**Source:** `bldc/motor/mcpwm_foc.c:133-159` - FFT bin functions

```c
// Sample size options
case HFI_SAMPLES_8:   motor->m_hfi.samples = 8;
case HFI_SAMPLES_16:  motor->m_hfi.samples = 16;
case HFI_SAMPLES_32:  motor->m_hfi.samples = 32;
```

---

## HFI Requirements

### Motor Compatibility

**HFI works best with salient motors:**

| Motor Type | Saliency | HFI Compatibility |
|------------|----------|-------------------|
| IPM (Interior PM) | High | Excellent |
| SPM (Surface PM) | Low | Poor |
| Hub motors | Usually low | Often difficult |
| Outrunners | Varies | Test required |

**Test your motor:** If Ld ≠ Lq (inductance varies with position), HFI can work.

### Hardware Requirements

- VESC with sufficient PWM frequency (30kHz+ recommended)
- Good current sensing (low noise)
- Motor with measurable saliency

---

## HFI Configuration

### Key Parameters

**Source:** `bldc/datatypes.h:489-499`

| Parameter | Description | Typical Value |
|-----------|-------------|---------------|
| `foc_hfi_voltage_start` | Injection V at startup | 3-6V |
| `foc_hfi_voltage_run` | Injection V during run | 2-4V |
| `foc_hfi_voltage_max` | Maximum injection V | 6-10V |
| `foc_hfi_gain` | Position correction gain | 0.5-2.0 |
| `foc_hfi_max_err` | Max allowed error | 0.5-1.0 |
| `foc_hfi_hyst` | Hysteresis for switching | 0.1-0.3 |
| `foc_hfi_start_samples` | Samples before handoff | 50-200 |
| `foc_hfi_samples` | FFT sample count | 8, 16, or 32 |
| `foc_hfi_obs_ovr_sec` | Observer override time | 0.05-0.2s |

### Sensor Mode Setting

**Location:** Motor Settings → FOC → Sensor Mode

| Option | Description |
|--------|-------------|
| Sensorless | Observer only (no HFI) |
| Hall Sensors | Use hall sensors |
| **HFI** | High Frequency Injection |
| HFI + Hall | HFI with hall backup |
| HFI Start | HFI at startup, observer at speed |

---

## HFI Tuning Process

### Step 1: Verify Motor Suitability

1. Run motor detection (standard)
2. Note Ld and Lq values
3. If Ld ≈ Lq, HFI will struggle

**Rule of thumb:** Need 10%+ difference between Ld and Lq.

### Step 2: Start Conservative

```
foc_hfi_voltage_start: 4V
foc_hfi_voltage_run: 3V
foc_hfi_voltage_max: 6V
foc_hfi_gain: 1.0
foc_hfi_samples: HFI_SAMPLES_16
```

### Step 3: Test at Standstill

1. Apply small torque command
2. Motor should hold position smoothly
3. Listen for noise (some audible is normal)

### Step 4: Increase Voltage if Needed

**If position tracking is poor:**
- Increase `foc_hfi_voltage_start` by 1V
- Increase `foc_hfi_voltage_run` by 0.5V
- Test again

**If motor is too noisy:**
- Decrease voltages
- Try `HFI_SAMPLES_32` (smoother but slower)

### Step 5: Tune Gain

**If response is sluggish:**
- Increase `foc_hfi_gain` by 0.2

**If oscillating:**
- Decrease `foc_hfi_gain` by 0.2

---

## Troubleshooting HFI

### Problem: Motor Shakes at Standstill

**Cause:** Incorrect position, fighting itself.

**Fixes:**
1. Increase injection voltage (+1-2V)
2. Increase gain slightly
3. Check motor saliency (may be too low)

### Problem: Audible Whine

**Cause:** Normal - HFI injects audible frequency signal.

**Mitigation:**
1. Reduce `foc_hfi_voltage_run` (trade-off with tracking)
2. Increase `foc_hfi_samples` to 32 (spreads energy)
3. Accept some noise (inherent to HFI)

### Problem: Position Jumps 180°

**Cause:** HFI has 180° ambiguity (can't distinguish N from S pole).

**Fixes:**
1. Enable `foc_hfi_amb_mode` (ambiguity resolution)
2. Use brief open-loop kick at startup
3. Use Hall sensors for initial position

### Problem: Poor Tracking Under Load

**Cause:** Injection voltage too low for current levels.

**Fixes:**
1. Increase `foc_hfi_voltage_max`
2. Check that gain isn't too low
3. Consider HFI + Hall mode for backup

### Problem: Rough Handoff to Observer

**Cause:** Observer and HFI disagree on position.

**Fixes:**
1. Increase `foc_hfi_obs_ovr_sec` (longer blend time)
2. Tune `foc_hfi_start_samples` (more samples before handoff)
3. Verify observer is well-tuned at higher speed

---

## HFI vs Other Methods

### When to Use HFI

✅ **Good for:**
- Sensorless startup without cogging
- Zero-speed holding torque
- Servo-like applications
- IPM motors

❌ **Not ideal for:**
- Non-salient motors (most hub motors)
- Applications where noise is unacceptable
- When Hall sensors are available

### Alternative: Hybrid HFI + Hall

Best of both worlds:
1. Hall sensors for reliable startup
2. HFI for smooth low-speed operation
3. Observer for efficient high-speed

---

## Diagnostic Commands

### Terminal Commands

**Source:** `bldc/motor/mcpwm_foc.c:587-590`

```
foc_plot_hfi_en 1   // Enable HFI DFT plotting
foc_plot_hfi_en 2   // Enable HFI raw plotting
foc_plot_hfi_en 0   // Disable plotting
```

### RT Data

Watch these in Real-Time Data:
- HFI angle
- HFI error
- Observer angle (compare)

---

## Quick Reference

### Typical Values by Application

| Application | Voltage Start | Voltage Run | Samples |
|-------------|---------------|-------------|---------|
| E-skateboard | 4-5V | 2-3V | 16 |
| Servo/Robot | 5-6V | 4-5V | 32 |
| Balance board | 3-4V | 2-3V | 16 |

### Tuning Priority

1. **Voltage** - Most important, start here
2. **Samples** - Trade-off speed vs smoothness
3. **Gain** - Fine-tune responsiveness
4. **Handoff** - Smooth transition to observer

---

## References

- Source: `bldc/motor/mcpwm_foc.c:62-159` - HFI implementation
- Source: `bldc/datatypes.h:486-499` - HFI parameters
- Source: `bldc/motor/foc_math.h:262` - HFI angle adjustment
- Related: `foc-observer-tuning-guide.md` - Observer tuning
- Related: `encoder-hall-sensor-troubleshooting.md` - Sensor alternatives

---

*Last updated: 2026-01-14 | Expert-level deep-dive from bldc source*
