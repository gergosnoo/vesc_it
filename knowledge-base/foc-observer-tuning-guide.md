# FOC Observer Tuning & Troubleshooting Guide

## Overview

**Key Terms:** observer, sensorless FOC, observer gain, flux linkage, lambda, position estimation, back-EMF, HFI, observer not tracking, motor cogging, erratic behavior, low speed issues

This guide explains how the FOC observer works and how to troubleshoot common observer issues.

**Source:** `bldc/motor/foc_math.c:25` - Observer implementation based on IEEE 2010 paper by Lee, Hong, Nam, Ortega, Praly, Astolfi

---

## What is the Observer?

The FOC observer is software that **estimates rotor position** without physical sensors by analyzing motor voltages and currents.

### How It Works (Simplified)

```
Motor Currents (measured)     Motor Voltages (known)
        │                            │
        ▼                            ▼
   ┌────────────────────────────────────────┐
   │           FOC OBSERVER                  │
   │                                         │
   │  Uses motor model (R, L, λ) to          │
   │  predict what currents SHOULD be        │
   │                                         │
   │  Error between predicted vs actual      │
   │  currents reveals rotor position        │
   └────────────────────────────────────────┘
                     │
                     ▼
            Estimated Rotor Angle (θ)
```

**Source:** `bldc/motor/foc_math.c:25-26`
```c
void foc_observer_update(float v_alpha, float v_beta, float i_alpha, float i_beta,
    float dt, observer_state *state, float *phase, motor_all_state_t *motor)
```

### Observer State Variables

**Source:** `bldc/motor/mcpwm_foc.c:2823-2825`

| Variable | Meaning | Terminal Command |
|----------|---------|------------------|
| `x1` | Alpha-axis flux estimate | Shown in RT data |
| `x2` | Beta-axis flux estimate | Shown in RT data |
| `lambda_est` | Estimated flux linkage | Should match detection |

---

## Key Observer Parameters

### Observer Gain

**Location:** Motor Settings → FOC → Sensorless → Observer Gain

**What it does:** How aggressively the observer corrects its estimate.

| Value | Effect |
|-------|--------|
| Too Low | Slow tracking, position lag, poor low-speed |
| Just Right | Smooth, accurate position tracking |
| Too High | Oscillation, noise, instability |

**Rule:** Set by motor detection. Don't change unless you know what you're doing.

### Flux Linkage (λ / Lambda)

**Location:** Motor Settings → FOC → General → Flux Linkage

**What it is:** Magnetic strength of permanent magnets (Wb or Vs).

**Why it matters:**
- Observer uses λ to calculate back-EMF
- Wrong λ = wrong position estimate
- **Always run motor detection** - never guess

**Typical values:**
- Small hub motors: 0.005 - 0.015 Wb
- Large outrunners: 0.02 - 0.05 Wb
- High-torque motors: 0.05 - 0.1 Wb

### Motor Resistance & Inductance

**Also critical for observer:**
- **R (resistance):** Affects voltage drop calculation
- **L (inductance):** Affects current rate of change

**Source:** `bldc/motor/mcpwm_foc.c:2032`
```c
// The observer is more stable when the inductance is underestimated
// compared to overestimated
```

---

## Observer Modes

### Sensorless Only

**When to use:** Motor has no Hall sensors.

**How it works:**
1. Open-loop startup (motor spins blindly)
2. Observer takes over at ~500-1000 ERPM
3. Tracks position from back-EMF

**Settings:**
- Sensor Mode: Sensorless
- Openloop ERPM: 500-1500 (depends on motor)

### Sensored + Observer (Hybrid)

**When to use:** Motor has Hall sensors but you want smooth high-speed.

**How it works:**
1. Hall sensors used at low speed (reliable startup)
2. Observer takes over at higher speed (smoother)
3. Seamless handoff

**Settings:**
- Sensor Mode: Hall Sensors
- FOC Sensor Mode: Combined (HFI or observer blend)

**Source:** `bldc/motor/mcpwm_foc.c:3463`
```c
state_now->phase = foc_correct_hall(motor_now->m_phase_now_observer, dt, motor_now, ...);
```

### HFI (High Frequency Injection)

**When to use:** Need sensorless at zero/very low speed.

**How it works:**
- Injects high-frequency signal
- Measures response to find rotor position
- Works at standstill

**Settings:**
- FOC Sensor Mode: HFI
- HFI Voltage: Start at 3-5V

---

## Troubleshooting Observer Issues

### Problem: Motor Cogging/Jerking at Low Speed

**Symptom:** Motor runs rough below ~1000 ERPM.

**Cause:** Observer can't track at low back-EMF.

**Fixes:**
1. **Increase Openloop ERPM**
   - Motor Settings → FOC → Sensorless → Openloop ERPM
   - Try 1000 → 1500 → 2000

2. **Use Hall Sensors (if available)**
   - Add Hall sensor wiring
   - Set Sensor Mode to Hall

3. **Try HFI Mode**
   - Motor Settings → FOC → Sensor Mode → HFI
   - Set HFI Voltage to 3-5V

### Problem: Motor Oscillates/Vibrates

**Symptom:** Motor hums or shakes, especially at constant speed.

**Cause:** Observer gain too high or wrong motor parameters.

**Fixes:**
1. **Re-run Motor Detection**
   - Motor Settings → FOC → Detect Motor (or wizard)
   - Ensures R, L, λ are correct

2. **Reduce Observer Gain**
   - Current value shown in Motor Settings
   - Try reducing by 20-30%
   - Must be done manually

3. **Check for Loose Motor Mount**
   - Mechanical vibration can feed back
   - Secure motor firmly

### Problem: Motor Runs But Position Tracking Poor

**Symptom:** Sluggish response, feels like it's "searching".

**Cause:** Flux linkage mismatch.

**Fixes:**
1. **Verify Flux Linkage**
   - Compare detected λ with motor specs
   - ±20% variation is normal

2. **Check Temperature**
   - Hot motor = different characteristics
   - Detection at room temp, verify when hot

3. **Increase Current During Detection**
   - Motor Settings → FOC → Detection Current
   - Try +50% if detection values vary

### Problem: Observer Fails at High Speed

**Symptom:** Motor cuts out or faults above certain RPM.

**Cause:** Observer can't keep up with rate of change.

**Fixes:**
1. **Check PWM Frequency**
   - Higher PWM = more samples for observer
   - Try 30kHz → 40kHz

2. **Verify Inductance**
   - Very low inductance motors are tricky
   - May need manual tuning

3. **Enable Field Weakening Properly**
   - High speed needs correct FW setup
   - See field-weakening-tuning-guide.md

---

## Diagnostic Commands

### Terminal Commands in VESC Tool

**View Observer State:**
```
foc
```
Shows x1, x2, lambda_est, phase angles.

**Compare Observer vs Hall:**
```
plot_pos
```
Graphs observer angle vs Hall angle (if sensored).

**Real-time Observer Values:**
- RT Data → Phase Observer angle
- RT Data → Observer x1, x2

---

## Observer Tuning Process

### Step 1: Run Motor Detection

**Always start here:**
1. Motor Settings → FOC → General → Detect Motor
2. Or use Motor Wizard
3. Record detected values (R, L, λ, Observer Gain)

### Step 2: Verify at Low Speed

**Test:**
1. Spin motor at minimum working RPM
2. Check for cogging/roughness
3. Increase Openloop ERPM if needed

### Step 3: Verify at High Speed

**Test:**
1. Gradually increase to max RPM
2. Watch for oscillation or cutouts
3. Check temperature

### Step 4: Fine-tune If Needed

**Only if problems persist:**
1. Observer Gain: ±20% adjustments
2. Openloop ERPM: Match motor characteristics
3. Consider HFI for zero-speed needs

---

## Quick Reference

### Parameter Checklist

| Parameter | Set By | Change Manually? |
|-----------|--------|------------------|
| Flux Linkage (λ) | Detection | No - re-detect |
| Observer Gain | Detection | Rarely - careful |
| Motor R | Detection | No - re-detect |
| Motor L | Detection | No - re-detect |
| Openloop ERPM | Detection | Yes - safe to adjust |
| HFI Voltage | Manual | Yes - if using HFI |

### When to Re-run Detection

- ✅ After changing motor
- ✅ After firmware update
- ✅ If behavior changes suddenly
- ✅ If observer faults occur
- ✅ At different temperature (optional)

---

## References

- Source: `bldc/motor/foc_math.c:25` - Observer algorithm
- Source: `bldc/motor/mcpwm_foc.c:3432-3650` - Observer integration
- Paper: IEEE 2010 by Lee, Hong, Nam, Ortega, Praly, Astolfi
- Related: `foc-fundamentals-explained.md` - FOC basics
- Related: `encoder-hall-sensor-troubleshooting.md` - Sensor issues
- Related: `field-weakening-tuning-guide.md` - High speed

---

*Last updated: 2026-01-14 | Deep-dive from bldc/ source code*
