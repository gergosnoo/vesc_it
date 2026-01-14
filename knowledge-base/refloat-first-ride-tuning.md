# Refloat First Ride Tuning Guide

## Overview

**Key Terms:** Refloat tuning, first ride settings, beginner Refloat, how to tune Refloat, new rider settings, tuning progression, Float Package tuning, Onewheel tuning, PEV tuning guide

This guide walks you through tuning your Refloat/Float package from first ride to confident cruiser. Follow this progression over your first 10-20 rides.

**Source:** `refloat/src/conf/datatypes.h` (parameters), `refloat/src/main.c` (defaults: kp=8.0, kp_brake=1.0)

---

## Before Your First Ride

### Critical Safety Settings First

**DO NOT RIDE until these are set:**

1. **Motor Current Limits** (Motor Settings → General)
   - Motor Max: Start at 40-50A (conservative)
   - Motor Min (regen): -30 to -40A

2. **Battery Current Limits** (Motor Settings → General)
   - Battery Max: Match your BMS rating
   - Battery Min (regen): Match your BMS rating

3. **Voltage Cutoffs** (Motor Settings → General)
   - Start: Your pack's nominal low (e.g., 54V for 20S)
   - End: Your pack's hard minimum (e.g., 50V for 20S)

---

## Ride 1-3: Learning to Balance

### Goal: Just stay on

**Recommended Settings:**

| Parameter | Value | Why |
|-----------|-------|-----|
| **kp** | 8.0-10.0 | Softer feel, more forgiving |
| **kp_brake** | 1.0 | Gentle nose lift when slowing |
| **mahony_kp** | 1.0 | Default IMU tuning |
| **tiltback_duty** | 0.70 | Early warning before limits |
| **tiltback_duty_speed** | 3.0 | Gradual pushback |
| **startup_pitch_tolerance** | 15° | Easier mount |

### What to Feel For:
- Can you mount/dismount consistently?
- Does the board feel stable at walking speed?
- Is nose-up tiltback activating too early?

### Common Issues:
- **Board feels twitchy:** Lower kp to 7.0-8.0
- **Hard to mount:** Increase startup_pitch_tolerance to 20°
- **Nose dives when stopping:** You're leaning too far forward; practice heel lift

---

## Ride 4-7: Building Confidence

### Goal: Smooth cruising at 10-15 mph

**Adjust Based on Feel:**

| Parameter | Beginner → Intermediate |
|-----------|------------------------|
| **kp** | 8.0 → 10.0-12.0 |
| **kp_brake** | 1.0 → 1.5-2.0 |
| **tiltback_duty** | 0.70 → 0.75 |
| **booster_current** | 0 → 5-10A |
| **booster_ramp** | 0 → 5-10s |

### What to Experiment With:

**Turn Feel (Yaw/Roll)**
- **roll_steer_kp:** Higher = tighter carving (try 0.5-1.0)
- **roll_steer_erpm_kp:** Higher = more responsive at speed

**Acceleration Feel**
- **booster_current:** Adds power when leaning hard (start at 5A)
- **booster_ramp:** How fast boost engages (5-10s = gradual)

### What to Feel For:
- Does the board respond when you lean?
- Is carving smooth or jerky?
- Can you do emergency stops safely?

---

## Ride 8-15: Dialing In Your Style

### Goal: The board feels like an extension of you

**Advanced Tuning:**

| Your Style | Parameters to Adjust |
|------------|---------------------|
| **Carvy/Surfy** | Lower kp (8-10), higher roll_steer_kp (1.0+) |
| **Stable/Planted** | Higher kp (12-15), lower roll_steer_kp (0.3) |
| **Aggressive** | Higher booster_current (15-20A), higher kp_brake (2.0+) |
| **Mellow** | Lower kp (8-10), gradual tiltback (speed 2.0) |

### ATR (Angle-based Torque Response)

ATR gives more torque when leaning forward. **Source:** `refloat/src/conf/datatypes.h:279-286`

| Parameter | What It Does |
|-----------|-------------|
| **atr_strength_up** | Power added when nose down (try 0.5-1.0) |
| **atr_strength_down** | Power when nose up/braking (try 0.3-0.5) |
| **atr_threshold_up** | Angle before ATR kicks in going forward (2-3°) |
| **atr_threshold_down** | Angle before ATR kicks in braking (2-3°) |

### Torque Tilt (Speed-Adaptive)

Adds tilt compensation based on motor current. **Source:** `refloat/src/conf/datatypes.h:273-278`

| Parameter | What It Does |
|-----------|-------------|
| **torquetilt_strength** | How much tilt per amp (try 0.5-1.0) |
| **torquetilt_start_current** | Current threshold to activate |
| **torquetilt_angle_limit** | Max tilt angle allowed |

---

## Ride 16+: Fine Tuning

### Goal: Perfection

**Micro-adjustments:**
- Adjust kp by ±0.5 until it feels right
- Tweak tiltback_duty by ±0.02 based on range needs
- Fine-tune booster_current for your weight/motor

### Per-Terrain Settings

**Street/Smooth:**
- Higher kp (12-15)
- Lower mahony_kp (0.8)
- Tighter roll_steer

**Trail/Off-road:**
- Lower kp (8-10)
- Higher mahony_kp (1.5)
- Looser roll_steer
- Higher startup_pitch_tolerance (25°)

---

## Quick Tuning Reference

### "It feels too..." Solutions

| Problem | Parameter | Change |
|---------|-----------|--------|
| Twitchy/nervous | kp | Decrease by 1-2 |
| Sluggish/unresponsive | kp | Increase by 1-2 |
| Nose dives easily | tiltback_duty | Decrease by 0.05 |
| Tiltback too aggressive | tiltback_duty | Increase by 0.05 |
| Hard to carve | roll_steer_kp | Increase by 0.2-0.5 |
| Too carvy/unstable | roll_steer_kp | Decrease by 0.2-0.5 |
| Weak acceleration | booster_current | Increase by 5A |
| Jerky when stopping | kp_brake | Decrease by 0.5 |

### Parameter Safety Ranges

| Parameter | Safe Min | Safe Max | Default |
|-----------|----------|----------|---------|
| kp | 5.0 | 20.0 | 10.0 |
| kp_brake | 0.5 | 3.0 | 1.0 |
| tiltback_duty | 0.65 | 0.90 | 0.75 |
| booster_current | 0 | 30A | 0 |
| surge_duty_start | 0.75 | 0.90 | 0.85 |

---

## Golden Rules of Tuning

1. **Change ONE thing at a time** - Otherwise you won't know what helped
2. **Small increments** - kp ±1, tiltback_duty ±0.05
3. **Ride at least 5 minutes** before judging a change
4. **Backup your config** before major changes
5. **When in doubt, return to defaults**

---

## References

- Source: `refloat/refloat.c` - Default values
- Related: `refloat-setpoint-adjustment-types.md` - ATR/Booster deep dive
- Related: `refloat-hidden-modes.md` - Startup modes
- Related: `safety-critical-settings.md` - Nosedive prevention

---

*Last updated: 2026-01-14 | Beginner-friendly progression guide*
