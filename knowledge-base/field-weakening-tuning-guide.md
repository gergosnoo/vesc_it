# Field Weakening Tuning Guide

## Overview

**Key Terms:** field weakening, FW, top speed, foc_fw_current_max, foc_fw_duty_start, foc_fw_ramp_time, high speed tuning, duty cycle, battery current

Field weakening allows your motor to exceed its natural top speed by reducing the magnetic field strength. This guide covers safe configuration and tuning.

**Source:** bldc firmware - foc_math.c, mcpwm_foc.c, datatypes.h

---

## What is Field Weakening?

Motors have a natural top speed limited by back-EMF (the voltage the motor generates while spinning). At high speeds, back-EMF approaches battery voltage, leaving no headroom for current.

**Field weakening** injects negative d-axis current to weaken the magnetic field, reducing back-EMF and allowing higher speeds.

```
Without FW: Max speed limited by back-EMF = battery voltage
With FW:    Reduced back-EMF → higher speed possible
Trade-off:  Higher battery current, reduced efficiency
```

---

## Field Weakening Parameters

**Location:** Motor Settings → FOC → Field Weakening

| Parameter | Default | Range | Purpose |
|-----------|---------|-------|---------|
| FW Current Max | 0A | 0 - motor max | Maximum weakening current |
| FW Duty Start | 0.8 | 0.0 - 1.0 | Duty cycle where FW begins |
| FW Ramp Time | 0.0s | 0.0+ | Time to ramp FW current |
| FW Q Current Factor | 0.1 | 0.0 - 1.0 | Torque reduction factor |

### Parameter Interactions

**Source:** `foc_math.c:702-742`

```
Duty < FW Duty Start:
    FW Current = 0 (normal operation)

Duty >= FW Duty Start:
    FW Current ramps linearly from 0 to FW Current Max
    as duty goes from FW Duty Start to 100%

Example:
    FW Duty Start = 0.8 (80%)
    FW Current Max = 30A

    At 80% duty → 0A FW
    At 90% duty → 15A FW
    At 100% duty → 30A FW
```

---

## Safety Considerations

### Battery Current Increase

**Field weakening significantly increases battery current!**

| Condition | Battery Current |
|-----------|-----------------|
| Normal operation | Motor current × duty |
| With FW active | 1.5-2× normal current |

**Why:** FW reduces motor efficiency, requiring more input power for same output.

### Recommended Safety Settings

For PintV/XRV and similar boards:

| Parameter | Safe Value | Aggressive |
|-----------|------------|------------|
| FW Current Max | 30A | 50A |
| FW Duty Start | 60% | 65% |
| FW Ramp Time | 500ms | 200ms |

**Always verify:**
- Battery current stays within pack limits
- Motor temperature doesn't exceed limits
- No voltage sag under load

---

## Tuning Guide

### Step 1: Baseline (No FW)

First, verify motor works well without FW:
1. Set **FW Current Max = 0**
2. Test top speed
3. Note maximum duty cycle reached
4. Verify no faults

### Step 2: Enable Conservative FW

Start with safe values:
```
FW Current Max: 10-15% of motor current max
FW Duty Start: 0.85-0.90 (85-90%)
FW Ramp Time: 0.3-0.5s (smooth transition)
FW Q Factor: 0.1 (default)
```

### Step 3: Test and Monitor

1. Ride to top speed
2. Watch battery current in RT Data
3. **Battery current must stay below pack limit**
4. Check motor temperature after run

### Step 4: Increase Gradually

If safe, increase FW Current Max by 5A increments:
1. Test after each change
2. Monitor battery current
3. Stop if current exceeds limits
4. Stop if motor overheats

---

## Configuration Examples

### Conservative (Beginners)

```
FW Current Max:      0 A (disabled)
FW Duty Start:       0.80
FW Ramp Time:        0.0 s
FW Q Current Factor: 0.1
```
**Result:** No speed increase, maximum torque and safety

### Moderate (PintV/XRV Stock Battery)

```
FW Current Max:      30 A
FW Duty Start:       0.60 (60%)
FW Ramp Time:        0.5 s
FW Q Current Factor: 0.1
```
**Result:** ~10-15% speed increase, respects 30A battery limit

### Aggressive (High-Power Builds)

```
FW Current Max:      50 A
FW Duty Start:       0.65 (65%)
FW Ramp Time:        0.2 s
FW Q Current Factor: 0.05
```
**Result:** Maximum speed, requires high-current battery

---

## How FW Affects Motor Currents

**Source:** `mcpwm_foc.c:3587-3588`

When FW activates:

| Current | Change | Effect |
|---------|--------|--------|
| D-axis (Id) | Decreases (negative) | Weakens magnetic field |
| Q-axis (Iq) | Slightly reduced | Less torque available |

**Q Current Factor** controls torque reduction:
- 0.1 = 10% of FW current reduces torque current
- Lower = more torque retained during FW
- Higher = smoother but less powerful

---

## Troubleshooting

### Motor Cuts Out at High Speed

**Cause:** Battery current limit exceeded

**Fix:**
1. Reduce FW Current Max
2. Increase FW Duty Start (activate later)
3. Check battery current limit settings

### Jerky Transition into FW

**Cause:** FW Ramp Time too short

**Fix:**
1. Increase FW Ramp Time to 0.3-0.5s
2. Smooth transition prevents sudden current spikes

### Motor Overheats in FW

**Cause:** FW operation is less efficient

**Fix:**
1. Reduce FW Current Max
2. Limit time spent at high speed
3. Improve motor cooling

### No Speed Increase

**Cause:** FW not activating or battery limiting

**Check:**
1. FW Current Max > 0
2. FW Duty Start is reachable
3. Battery current not limiting

---

## Quick Reference

| Goal | Adjust |
|------|--------|
| More top speed | ↑ FW Current Max |
| Earlier activation | ↓ FW Duty Start |
| Smoother transition | ↑ FW Ramp Time |
| More torque in FW | ↓ FW Q Factor |
| Less battery current | ↓ FW Current Max |
| Safer operation | ↓ FW Current Max, ↑ Duty Start |

---

## References

- Source: `bldc/motor/foc_math.c:702-742` - FW algorithm
- Source: `bldc/motor/mcpwm_foc.c:3581-3608` - Current application
- Source: `bldc/datatypes.h:509-512` - FW config structure
- Related: `pintv-xrv-critical-settings.md` - Stock battery limits
- Related: `safety-critical-settings.md` - Overall safety guide

---

*Last updated: 2026-01-14 | Source verified against bldc repository*
