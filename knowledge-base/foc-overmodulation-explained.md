# FOC Overmodulation Explained

## Overview

**Key Terms:** overmodulation, FOC, SVM, SVPWM, space vector modulation, third harmonic injection, duty cycle, field weakening, top speed, voltage utilization

This guide explains FOC overmodulation - a technique to extract up to 15% more voltage from your battery without the downsides of field weakening. A hot topic in 2025 as VESC 6.05+ made this accessible.

**Source:** `bldc/motor/foc_math.c`, `bldc/motor/mcpwm_foc.c`, `bldc/datatypes.h`

---

## What Is Overmodulation?

### The Basic Problem

In a 3-phase motor system, you can't use 100% of your battery voltage for motor torque. The theoretical maximum depends on the modulation technique:

| Technique | Max Voltage Utilization | Notes |
|-----------|------------------------|-------|
| Sinusoidal PWM | 86.6% (√3/2) | Traditional limit |
| SVPWM (standard) | 86.6% (√3/2) | Same limit, different approach |
| **SVPWM + Overmodulation** | **100%** | Adds 15.5% more voltage |

**Why only 86.6%?** The voltage vector must stay within an inscribed circle inside the hexagon formed by the switching states. Going outside causes distortion.

### What Overmodulation Does

Overmodulation intentionally pushes the voltage vector beyond the inscribed circle, closer to the hexagon edges. This allows:

- **15% higher motor voltage** at the same battery voltage
- **Higher top speed** without increasing battery voltage
- **Lower duty cycle** at the same speed (more headroom)

**Source:** `bldc/motor/foc_math.c:235-237`

```c
// From bldc/motor/foc_math.c:235-237
* @brief svm Space vector modulation. Magnitude must not be larger than sqrt(3)/2, or 0.866
*        to avoid overmodulation. See github.com/vedderb/bldc/pull/372#issuecomment-962499623
```

---

## How It Works Technically

### Space Vector Modulation (SVM)

**Source:** `bldc/motor/foc_math.c:245-280`

SVM divides the voltage space into 6 sectors. Each sector uses two active vectors and a zero vector:

```
       V2 (120°)
        /\
       /  \
      /    \
V3 __/  ○   \__ V1 (0°)
     \      /
      \    /
       \  /
        \/
       V4 (240°)
```

The inscribed circle (radius √3/2 ≈ 0.866) represents the maximum linear modulation region. Beyond this, waveform distortion occurs.

### The Overmodulation Factor

**Source:** `bldc/datatypes.h:515`, `bldc/motor/mcpwm_foc.c:4619`

```c
// From bldc/datatypes.h:515
float foc_overmod_factor;

// From bldc/motor/mcpwm_foc.c:4619
float max_v_mag = ONE_BY_SQRT3 * max_duty * state_m->v_bus * conf_now->foc_overmod_factor;
```

The `foc_overmod_factor` directly multiplies the maximum voltage magnitude:

| Factor | Voltage Utilization | Effect |
|--------|---------------------|--------|
| 1.00 | 57.7% × v_bus | Normal (no overmod) |
| 1.10 | 63.5% × v_bus | Mild overmodulation |
| **1.15** | **66.4% × v_bus** | **Full third harmonic** |
| 1.50 | 86.6% × v_bus | Maximum (severe distortion) |

### Default and Limits

**Source:** `bldc/motor/mcconf_default.h:505-506`, `bldc/comm/commands.c:1891`

```c
// Default (no overmodulation)
#define MCCONF_FOC_OVERMOD_FACTOR 1.0

// Valid range enforced by firmware
utils_truncate_number(&mcconf->foc_overmod_factor, 1.0, 1.5);
```

**Safe range:** 1.00 to 1.15 (third harmonic limit)
**Maximum allowed:** 1.50 (use with caution!)

---

## Overmodulation vs Field Weakening

Both increase top speed, but work very differently:

### Field Weakening

| Aspect | Details |
|--------|---------|
| How it works | Injects negative d-axis current to reduce back-EMF |
| Power consumption | Wastes power as heat (d-current × resistance) |
| Efficiency | DECREASES at high speed |
| Motor heating | INCREASES (extra current) |
| Torque at high speed | DECREASES |
| Control complexity | High (tuning required) |

### Overmodulation

| Aspect | Details |
|--------|---------|
| How it works | Extends voltage vector beyond linear region |
| Power consumption | No additional losses |
| Efficiency | Maintains or IMPROVES |
| Motor heating | No change |
| Torque at high speed | Maintained |
| Control complexity | Low (just one parameter) |

### When to Use Each

| Situation | Recommendation |
|-----------|----------------|
| Want more top speed, efficiency matters | **Overmodulation first** |
| Need even MORE top speed after overmod | Add field weakening |
| High-efficiency application (EV, ebike) | **Overmodulation** |
| Competition/racing (max performance) | Both combined |
| Motor runs hot already | **Overmodulation only** |

---

## Practical Benefits

### For Esk8/EUC/Onewheel Riders

1. **Higher top speed** - ~10-15% faster at same battery voltage
2. **Lower duty cycle at speed** - More safety margin before hitting 100%
3. **Better efficiency** - No extra heat from field weakening current
4. **More headroom** - If you're at 95% duty, overmod can drop it to 83%

### Real-World Example

| Configuration | 48V Battery, 190KV Motor |
|---------------|-------------------------|
| Without overmod | Max speed ~45 km/h at 95% duty |
| With 1.15 overmod | Max speed ~52 km/h at 83% duty |
| Benefit | +7 km/h AND more headroom |

---

## How to Enable Overmodulation

### VESC Tool Settings

1. Go to **Motor Settings** → **FOC** → **Advanced**
2. Find **Overmodulation Factor** (may be called "FOC Overmod Factor")
3. Set value between 1.00 and 1.15
4. **Write Motor Configuration**

### Recommended Values

| Use Case | Factor | Notes |
|----------|--------|-------|
| Conservative | 1.05 | Slight benefit, minimal risk |
| **Recommended** | **1.10** | Good balance |
| Aggressive | 1.15 | Full third harmonic |
| Experimental | >1.15 | Expect distortion, noise |

### Via LispBM

```lisp
; Get current value
(conf-get 'foc_overmod_factor)

; Set to 1.15 (full third harmonic)
(conf-set 'foc_overmod_factor 1.15)
```

---

## Side Effects and Warnings

### What to Expect

| Factor | Effect |
|--------|--------|
| 1.00-1.10 | Usually no noticeable difference in feel |
| 1.10-1.15 | May notice slightly different motor sound |
| >1.15 | Possible motor noise, vibration, torque ripple |

### Potential Issues

1. **Motor noise** - Higher harmonics can cause audible noise
2. **Torque ripple** - Slight unevenness at high loads
3. **Sensor issues** - Some Hall/encoder setups may be affected
4. **Heat** - Extreme values (>1.3) can increase switching losses

### When NOT to Use High Overmod

- Motors with marginal phase wiring
- VESCs near current limits already
- Applications requiring smooth torque (CNC, etc.)
- If motor detection gives unstable results

---

## Relationship to Duty Cycle

### Understanding Duty Cycle with Overmodulation

**Source:** `bldc/motor/mcpwm_foc.c:3751-3753`

```c
// Duty calculation includes overmod factor
state_now->duty_now = SIGN(state_now->vq) *
    NORM2_f(state_now->mod_d, state_now->mod_q) *
    motor_now->p_duty_norm; // p_duty_norm = TWO_BY_SQRT3 / foc_overmod_factor
```

The duty cycle display accounts for overmodulation:

| Overmod Factor | p_duty_norm | Duty at "full" voltage |
|----------------|-------------|------------------------|
| 1.00 | 1.155 | 100% |
| 1.10 | 1.050 | 91% (appears lower) |
| 1.15 | 1.004 | 87% (more headroom shown) |

### Important: Duty ≠ Voltage Utilization

With overmodulation enabled:
- Duty cycle display shows "adjusted" values
- You may see duty never exceed 85-90%
- This is NORMAL - you're still using full voltage capability

---

## Troubleshooting

### Motor Makes Strange Noise

**Symptom:** Whining or buzzing at high speed with overmod enabled.

**Cause:** High harmonic content in phase currents.

**Fix:**
1. Reduce overmod factor to 1.05-1.10
2. Check motor for mechanical issues
3. Verify phase connections are solid

### Duty Seems Limited

**Symptom:** Can't reach expected speed, duty stuck at ~85%.

**Cause:** Overmodulation is working! The duty display is normalized.

**Not a problem:** You ARE using full voltage, the display is just scaled.

### Motor Detection Fails

**Symptom:** Detection fails after changing overmod factor.

**Cause:** Detection uses different modulation settings.

**Fix:** Reset overmod to 1.0 for detection, then re-enable after.

---

## Advanced: Theory Behind Third Harmonic Injection

### The Math

Standard SVPWM produces sinusoidal phase voltages limited to v_bus × √3/2 ≈ 0.866 × v_bus.

Third harmonic injection adds a 3rd harmonic component that:
1. Cancels out in line-to-line voltage (motor doesn't see it)
2. Reduces peak phase voltage
3. Allows fundamental to increase by 2/√3 ≈ 1.155

This is mathematically equivalent to overmodulation factor = 1.15.

### Why 1.15 Specifically?

```
Maximum linear: √3/2 ≈ 0.866
With third harmonic: 1.0
Ratio: 1/0.866 = 1.155

Therefore: optimal overmod factor = 2/√3 ≈ 1.1547
```

**Source:** `bldc/util/utils_math.h:114`
```c
#define TWO_BY_SQRT3 (2.0f * 0.57735026919) // = 1.1547
```

---

## Quick Reference

### Parameter

| Item | Value |
|------|-------|
| Parameter name | `foc_overmod_factor` |
| Location | Motor Settings → FOC → Advanced |
| Default | 1.00 |
| Recommended | 1.10-1.15 |
| Maximum | 1.50 |

### Formula

```
max_voltage = (v_bus / √3) × max_duty × foc_overmod_factor
            = 0.577 × v_bus × max_duty × foc_overmod_factor
```

### Benefit Summary

| Factor | Voltage Boost | Speed Boost |
|--------|---------------|-------------|
| 1.05 | +5% | +5% |
| 1.10 | +10% | +10% |
| 1.15 | +15% | +15% |

---

## References

- Source: `bldc/motor/foc_math.c` - SVM implementation
- Source: `bldc/motor/mcpwm_foc.c` - FOC control loop
- Source: `bldc/datatypes.h` - Parameter definition
- GitHub: `vedderb/bldc/pull/372` - Original implementation discussion
- Related: `field-weakening-advanced.md` - Alternative high-speed technique
- Related: `foc-tuning-deep-dive.md` - General FOC tuning

---

*Last updated: 2026-01-14 | Source verified against bldc firmware*
