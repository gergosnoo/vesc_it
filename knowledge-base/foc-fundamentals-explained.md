# FOC Fundamentals Explained

## Overview

**Key Terms:** FOC, Field Oriented Control, BLDC vs FOC, sensorless FOC, sensored FOC, how FOC works, FOC explained, vector control, space vector modulation, why use FOC

This guide explains what FOC is, how it works, and why it matters for your VESC-powered vehicle.

**Source:** bldc/motor/mcpwm_foc.c, bldc/motor/foc_math.c

---

## What is FOC?

**FOC (Field Oriented Control)** is an advanced motor control algorithm that treats a brushless motor like a simpler DC motor by mathematically transforming the three-phase currents.

### Simple Analogy

Imagine pushing a merry-go-round:
- **BLDC mode:** You push at fixed points as it spins (sometimes pushing with it, sometimes against)
- **FOC mode:** You always push exactly perpendicular to the rotation, maximizing efficiency

FOC ensures the magnetic field in the motor is always optimally positioned for maximum torque.

---

## FOC vs BLDC Mode

| Feature | BLDC (Trapezoidal) | FOC (Sinusoidal) |
|---------|-------------------|------------------|
| Efficiency | ~85% | ~95% |
| Smoothness | Cogging at low RPM | Silky smooth |
| Torque at low speed | Poor | Excellent |
| Noise | Audible whine | Near silent |
| Complexity | Simple | Complex |
| Heat generation | Higher | Lower |

**Bottom line:** FOC is better in almost every way. Use it unless your hardware doesn't support it.

---

## How FOC Works (Simplified)

### The Three Transformations

FOC uses mathematical transforms to simplify motor control:

```
3-Phase Currents (Ia, Ib, Ic)
         ↓
    Clark Transform
         ↓
2-Phase Currents (i_alpha, i_beta)    ← foc_math.h:45-46
         ↓
    Park Transform
         ↓
DC-like Currents (Id, Iq)             ← foc_math.h:148-149 (m_id_set, m_iq_set)
         ↓
    Control Loop
         ↓
    Inverse Transforms
         ↓
PWM Signals to Motor
```

**Source:** `bldc/motor/foc_math.h` defines the state variables:
```c
float i_alpha;    // Line 45 - Alpha axis current
float i_beta;     // Line 46 - Beta axis current
float m_id_set;   // Line 148 - Direct current setpoint
float m_iq_set;   // Line 149 - Quadrature current setpoint
```

### What Id and Iq Mean

- **Id (Direct current):** Creates magnetic field aligned with rotor - usually kept at 0
- **Iq (Quadrature current):** Creates torque - this is what moves your vehicle

**Key insight:** By controlling Iq (`m_iq_set`), you directly control torque. This is why FOC feels so responsive.

---

## Sensorless vs Sensored FOC

### Sensored FOC (Hall Sensors)

**How it works:** Hall effect sensors detect rotor position magnetically.

**Pros:**
- Reliable startup from standstill
- Works at zero RPM
- Consistent performance

**Cons:**
- Requires sensor wiring
- Sensors can fail
- Extra cost/complexity

**Best for:** Onewheel/self-balancing (need torque at standstill)

### Sensorless FOC (Observer-based)

**How it works:** Software estimates rotor position from back-EMF voltage.

**Pros:**
- No extra wiring
- No sensors to fail
- Cleaner installation

**Cons:**
- Needs minimum RPM to work (~500-1000 ERPM)
- Startup can be rough
- Observer tuning required

**Best for:** E-skate, e-bike (always moving when under load)

### Hybrid Mode

VESC supports **sensored startup + sensorless running:**
1. Uses Hall sensors for smooth startup
2. Switches to sensorless at higher RPM
3. Best of both worlds

---

## Key FOC Parameters

### Observer Gain

**What it does:** How aggressively the software tracks rotor position.

**Source:** `bldc/motor/foc_math.c:25` - `foc_observer_update()` function uses observer gain to estimate rotor angle from back-EMF.

| Value | Effect |
|-------|--------|
| Too low | Sluggish response, position lag |
| Just right | Smooth, accurate tracking |
| Too high | Oscillation, noise, instability |

**Default:** Set by motor detection wizard. Don't change unless needed.

### Flux Linkage

**What it is:** Magnetic strength of your motor's permanent magnets.

**How it's used:** Calculates back-EMF for sensorless operation.

**Rule:** Always run motor detection - never guess this value.

### Current Controller Gains (Kp, Ki)

**What they do:** Control how quickly motor current responds to commands.

| Gain | Effect |
|------|--------|
| Kp (Proportional) | Immediate response strength |
| Ki (Integral) | Eliminates steady-state error |

**Default:** Calculated from motor resistance/inductance. Usually don't touch.

---

## Why FOC Matters for Your Vehicle

### For Onewheel/Self-Balancing

- **Instant torque response** keeps you balanced
- **Smooth low-speed** operation for tricks
- **Efficient** = more range from same battery

### For E-Skateboard

- **Silent operation** (no motor whine)
- **Better hill climbing** (low-speed torque)
- **Regenerative braking** works smoothly

### For E-Bike

- **Natural pedal assist** feel
- **Efficient** = less heat, longer motor life
- **Smooth power delivery** at any cadence

---

## Common FOC Issues

### Motor Makes Noise/Vibrates

**Likely cause:** Observer gain too high or wrong flux linkage.

**Fix:** Re-run motor detection wizard.

### Poor Startup (Sensorless)

**Likely cause:** Observer can't track at low RPM.

**Fix:**
1. Increase openloop ERPM threshold
2. Use sensored mode if available
3. Check motor detection values

### Oscillation at High Speed

**Likely cause:** Current controller gains too aggressive.

**Fix:** Reduce Kp slightly, re-run detection.

---

## Quick Reference

### When to Use FOC

✅ Always, if your hardware supports it

### When to Re-run Motor Detection

- After changing motor
- After firmware update
- If behavior changes suddenly
- If you see FOC-related faults

### Parameters to NEVER Guess

- Observer gain
- Flux linkage
- Motor resistance/inductance
- Current controller gains

**Always use the motor detection wizard.**

---

## References

- Source: `bldc/motor/mcpwm_foc.c` - FOC implementation
- Source: `bldc/motor/foc_math.c` - Transform math
- Related: `field-weakening-tuning-guide.md` - Advanced FOC
- Related: `vesc-motor-wizard-guide.md` - Detection process
- Related: `encoder-hall-sensor-troubleshooting.md` - Sensor issues

---

*Last updated: 2026-01-14 | Educational content for intermediate users*
