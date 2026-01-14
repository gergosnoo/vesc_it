# Conservative Beginner Settings Guide

## Overview

**Key Terms:** beginner settings, safe settings, first time setup, starting configuration, what to change, safe current, conservative tuning, new builder, VESC first setup, safe defaults

This guide provides safe starting points for first-time VESC builders, what NOT to change, and a gradual tuning progression.

**Source:** Community best practices, bldc firmware defaults

---

## The Golden Rule

**Start conservative, increase gradually.**

It's always safer to start with lower limits and increase them after confirming everything works. You can't un-crash.

---

## Phase 1: Safe Starting Settings

### Motor Current Limits

**Location:** Motor Settings → General → Current

| Parameter | Safe Start | Why |
|-----------|------------|-----|
| Motor Current Max | 40A | Plenty for testing |
| Motor Current Min (Brake) | -30A | Gentle braking |
| Absolute Maximum | 100A | Safety limit |

**Rule of thumb:** Start at 50% of your motor's rated current.

### Battery Current Limits

**Location:** Motor Settings → General → Current

| Parameter | Formula | Example (10S4P) |
|-----------|---------|-----------------|
| Battery Current Max | Cells_P × 0.8 × Cell_Rating | 4 × 0.8 × 10A = 32A |
| Battery Current Min (Regen) | -15A to -20A | Start conservative |

**Why conservative?**
- Protects battery from overcurrent
- Reduces heat in controller
- Allows testing without stress

### Voltage Cutoffs

**Location:** Motor Settings → General → Voltage

| Parameter | Formula | 10S Example | 12S Example |
|-----------|---------|-------------|-------------|
| Cutoff Start | 3.3V × S | 33.0V | 39.6V |
| Cutoff End | 3.1V × S | 31.0V | 37.2V |
| Max Input | 4.25V × S | 42.5V | 51.0V |

**Start higher than minimum** to protect cells while learning.

---

## Phase 2: What NOT to Change (Yet)

### Do NOT Touch These Initially

| Setting | Why Leave Default |
|---------|-------------------|
| **FOC Observer Gain** | Requires tuning expertise |
| **Motor Flux Linkage** | Set by motor wizard |
| **Switching Frequency** | Affects efficiency, heat |
| **Current Controller Gains** | Can cause instability |
| **Sensorless ERPM** | Can cause startup issues |
| **Field Weakening** | Can damage motor/controller |

### Leave at Default Until Comfortable

| Setting | Default | When to Change |
|---------|---------|----------------|
| FOC Sensor Mode | HFI | After motor detection works |
| Observer Gain | 4e7 to 9e7 | After rides confirm stability |
| Current Ramp Step | 0.01 | If startup feels harsh |
| Openloop ERPM | 500-700 | If motor won't start |

---

## Phase 3: Safe First Test Procedure

### Step 1: Bench Test (Motor Off Ground)

1. Secure board so wheel spins freely
2. Connect VESC Tool
3. Motor wizard → Run Detection
4. Watch for errors/faults
5. Slowly apply throttle
6. Verify smooth acceleration/braking

### Step 2: Hand Test (Balance Boards Only)

For Onewheel/self-balancing:
1. Hold board at comfortable angle
2. Tilt forward → wheel should spin forward
3. Tilt back → wheel should spin backward
4. Release foot pads → wheel should stop
5. Check nose/tail response matches expectation

### Step 3: Parking Lot Test

1. Find empty, flat area
2. Ride slowly in straight line
3. Test braking gently
4. Check for unusual sounds/vibrations
5. Monitor temperatures (VESC Tool mobile)

---

## Phase 4: Gradual Tuning Progression

### Week 1: Learning Phase

**Settings to use:**
```
Motor Current Max: 40A
Battery Current Max: 30A
Speed Limit: 15 km/h (if applicable)
```

**Goal:** Learn the board, verify everything works

### Week 2-3: Comfort Phase

**If Week 1 was successful:**
```
Motor Current Max: 50-60A
Battery Current Max: 35-40A
Speed Limit: 20 km/h
```

**What to observe:**
- Temperature under load
- Any new vibrations
- Throttle response feel

### Week 4+: Optimization Phase

**Only after you're comfortable:**
```
Motor Current Max: Your motor's rating
Battery Current Max: Your pack's rating
Remove speed limit (if desired)
```

**Now you can tune:**
- Throttle curves
- Tiltback settings
- Observer gain (carefully)

---

## Application-Specific Beginner Settings

### E-Skateboard (First Build)

```
Motor Settings:
  Motor Current Max: 40A per motor
  Motor Current Min: -25A per motor
  Battery Current Max: 25A per motor (50A total)
  Battery Current Min: -10A per motor

App Settings (PPM Remote):
  Control Type: Current No Reverse Brake
  Throttle Exp: 1.5 (soft start)
  Ramp Time Pos: 0.5s
  Ramp Time Neg: 0.3s
```

### Onewheel / Self-Balancing (First Build)

```
Motor Settings:
  Motor Current Max: 50A
  Motor Current Min: -50A
  Battery Current Max: 30A
  Battery Current Min: -15A

Float/Refloat Settings:
  Startup Speed: 3 (gentle)
  Tiltback Speed: 20 km/h (conservative)
  Tiltback High Voltage: ON
  Tiltback Low Voltage: ON
```

### E-Bike (First Build)

```
Motor Settings:
  Motor Current Max: 30A
  Motor Current Min: -20A
  Battery Current Max: 25A
  Battery Current Min: -10A

App Settings (PAS/Throttle):
  Control Type: Current
  Throttle Exp: 2.0 (smooth)
  Speed Limit: 25 km/h (legal in many regions)
```

---

## Common Beginner Mistakes

### Mistake 1: Too Much Current

**Symptom:** Controller overheats, shuts down

**Fix:** Reduce Motor Current Max by 20A, add heatsink

### Mistake 2: Wrong Voltage Cutoffs

**Symptom:** Board dies suddenly OR battery damaged

**Fix:** Calculate cutoffs correctly:
```
Cutoff Start = 3.3V × Series_Count
Cutoff End = 3.1V × Series_Count
```

### Mistake 3: Skipping Motor Detection

**Symptom:** Motor stutters, won't spin, makes noise

**Fix:** Always run motor wizard before riding

### Mistake 4: Changing FOC Observer Gain

**Symptom:** Erratic behavior, loss of control

**Fix:** Reset to motor wizard value, don't touch until experienced

### Mistake 5: No Ramp Time

**Symptom:** Jerky acceleration, wheel slip

**Fix:** Set Ramp Time Pos to 0.3-0.5s

---

## Safety Checklist Before First Ride

### Hardware Checks

- [ ] All connections secure (no loose wires)
- [ ] Motor phases correctly connected
- [ ] Hall sensors working (if applicable)
- [ ] Battery fully charged
- [ ] Controller has heatsink/airflow
- [ ] Enclosure properly sealed

### Software Checks

- [ ] Motor detection completed successfully
- [ ] No fault codes present
- [ ] Voltage cutoffs match battery
- [ ] Current limits are conservative
- [ ] Throttle responds correctly in both directions

### Environment Checks

- [ ] Flat, open area for testing
- [ ] No traffic or obstacles
- [ ] Dry conditions
- [ ] Wearing protective gear

---

## When to Ask for Help

### Stop and Ask If:

1. Motor makes grinding/screeching noise
2. Controller gets very hot quickly
3. Motor detection fails repeatedly
4. VESC Tool shows fault codes
5. Behavior is erratic or unpredictable

### Where to Ask:

- VESC Project Forum: https://vesc-project.com/forum
- Reddit: r/ElectricSkateboarding, r/onewheel
- Discord: VESC community servers
- GitHub Issues: For firmware bugs

### What Information to Provide:

1. Hardware (VESC model, motor specs)
2. Firmware version
3. Settings (screenshot or XML export)
4. Exact symptoms
5. What you've tried

---

## Settings Progression Summary

| Phase | Motor Max | Battery Max | Duration |
|-------|-----------|-------------|----------|
| Testing | 30A | 20A | First day |
| Learning | 40A | 30A | Week 1 |
| Comfort | 50-60A | 35-40A | Week 2-3 |
| Optimized | Motor rating | Pack rating | Week 4+ |

---

## Quick Reference Card

### Must-Set Parameters

```
1. Battery Cutoff Start: 3.3V × S
2. Battery Cutoff End: 3.1V × S
3. Motor Current Max: 50% of motor rating
4. Battery Current Max: 80% of pack rating
```

### Must-Not-Touch (Initially)

```
1. FOC Observer Gain
2. FOC Flux Linkage
3. Switching Frequency
4. Field Weakening settings
5. Current Controller Gains
```

### Must-Do Before Riding

```
1. Run Motor Detection
2. Verify no fault codes
3. Bench test with wheel off ground
4. Check temperatures during test
```

---

## References

- Related: `vesc-beginner-settings-guide.md` - Complete settings reference
- Related: `vesc-motor-wizard-guide.md` - Motor detection guide
- Related: `battery-cell-configuration-guide.md` - Battery setup
- Related: `vesc-hardware-compatibility-guide.md` - Hardware selection

---

*Last updated: 2026-01-14 | Community best practices*
