# Critical Settings for PintV & XRV Riders

## Overview

**Key Terms:** PintV settings, XRV settings, critical VESC settings, XRV battery, PintV battery, voltage tiltback, battery cutoff, field weakening limits, XRV IMU fix, PintV nosedive prevention

⚠️ **SAFETY-CRITICAL:** This guide addresses five configuration issues that could compromise battery integrity or riding safety if left unchanged on PintV and XRV boards.

**Source:** pev.dev community (7,505 views)

---

## Why These Settings Matter

Stock PintV and XRV boards ship with VESC controllers, but some factory default values are not optimized for the stock batteries. Using incorrect settings risks:

- **Nosedives** from voltage sag
- **Battery damage** from over-discharge
- **Reduced battery lifespan** from exceeding current limits
- **Unstable handling** from incorrect IMU settings (XRV)

---

## 1. Voltage Tiltback Thresholds

**Location:** Float Cfg / Refloat Cfg > Specs > Voltage Tiltbacks

| Parameter | Recommended Value | Purpose |
|-----------|-------------------|---------|
| **High Voltage Tiltback** | 64.5V | Prevents regen damage |
| **Low Voltage Tiltback** | 45.0V | Alerts before critical discharge |

### Why This Matters

- **High Voltage:** During regenerative braking (going downhill), battery voltage rises. If voltage exceeds safe limits, the BMS or cells can be damaged.

- **Low Voltage:** This is your **first warning** that the battery is depleting. When you feel this pushback, SLOW DOWN and head home.

⚠️ **"DO NOT ignore Low Voltage Tiltback! It's your first line of defense"** for protecting both rider safety and battery health.

---

## 2. Battery Voltage Cutoff Values

**Location:** Motor Cfg > General > Voltage

| Parameter | Recommended Value | Purpose |
|-----------|-------------------|---------|
| **Cutoff Start** | 40.5V | Begins limiting current |
| **Cutoff End** | 37.5V | Hard cutoff - prevents damage |

### Alternative "Rider Safety" Approach

For those who want maximum range at the expense of battery longevity:

| Parameter | Value | Warning |
|-----------|-------|---------|
| Cutoff Start | 37.5V | Minimal protection! |
| Cutoff End | 30.0V | Absolute minimum - risks damage |

**Note:** These represent absolute minimum discharge levels. Using these values regularly will reduce battery lifespan.

### How Cutoffs Work

```
Battery depleting...
      │
      ▼
At 45.0V: Low Voltage Tiltback (first warning)
      │
      ▼
At 40.5V: Cutoff Start - Current limiting begins
      │
      ▼
At 37.5V: Cutoff End - Board stops powering motor
```

---

## 3. Battery Current Limits

**Location:** Motor Cfg > General > Current > Battery

| Parameter | Recommended Value | Factory Default |
|-----------|-------------------|-----------------|
| **Battery Max** | 30A | Higher (unsafe) |
| **Battery Max Regen** | -30A | Higher (unsafe) |

### Why Reduce From Factory Defaults

Stock PintV and XRV batteries **cannot safely handle** the higher factory default values. Running at factory settings risks:

- **Voltage sag** under load (reduced headroom = nosedive risk)
- **Pack damage** from excessive current draw
- **Reduced battery lifespan**

### Calculation Reference

For stock 15S packs:
- Cell max continuous: ~5A per cell
- 15 cells in series = 30A pack max
- Setting to 30A respects cell limits

---

## 4. Field Weakening Settings

**Location:** Motor Cfg > FOC > Field Weakening

| Parameter | Recommended Value | Factory Default |
|-----------|-------------------|-----------------|
| **Current Max** | 30A | Higher |
| **Duty Start** | 60% | Higher |
| **Ramp Time** | 500ms | - |

### What is Field Weakening?

Field weakening allows the motor to spin faster than its natural limit by reducing magnetic field strength. This increases top speed but:

- Draws more current
- Reduces efficiency
- Generates more heat

### Why Limit It

Factory values exceed safe limits for stock battery packs. At high speeds with high current draw, voltage sag becomes dangerous.

**Recommendation:** For stock batteries, limit field weakening to extend safe operating range.

---

## 5. IMU Accelerometer Confidence Decay (XRV ONLY)

**Location:** App Cfg > IMU > AHRS

| Parameter | Correct Value | XRV Factory (Incorrect) |
|-----------|---------------|-------------------------|
| **Accel Confidence Decay** | 0.02 | 0.1 |

### Why This XRV-Specific Fix Matters

The XRV ships with an incorrect value (0.1) that negatively affects:

- Board behavior during acceleration/braking
- Handling characteristics
- Overall ride feel

**Fix:** Simply change from 0.1 to 0.02 in the IMU settings.

---

## Quick Settings Checklist

### PintV Settings

| Setting | Location | Value |
|---------|----------|-------|
| High Voltage Tiltback | Refloat Cfg > Specs | 64.5V |
| Low Voltage Tiltback | Refloat Cfg > Specs | 45.0V |
| Cutoff Start | Motor Cfg > Voltage | 40.5V |
| Cutoff End | Motor Cfg > Voltage | 37.5V |
| Battery Max | Motor Cfg > Current | 30A |
| Battery Regen | Motor Cfg > Current | -30A |
| FW Current Max | Motor Cfg > FOC > FW | 30A |
| FW Duty Start | Motor Cfg > FOC > FW | 60% |

### XRV Settings (Same as PintV, plus:)

| Setting | Location | Value |
|---------|----------|-------|
| **Accel Confidence Decay** | App Cfg > IMU > AHRS | **0.02** |

---

## Summary: The 5 Critical Fixes

| # | Setting | Location | Recommended |
|---|---------|----------|-------------|
| 1 | Voltage Tiltbacks | Float/Refloat Cfg | High: 64.5V, Low: 45.0V |
| 2 | Battery Cutoffs | Motor Cfg > Voltage | Start: 40.5V, End: 37.5V |
| 3 | Battery Current | Motor Cfg > Current | Max: 30A, Regen: -30A |
| 4 | Field Weakening | Motor Cfg > FOC > FW | Max: 30A, Start: 60% |
| 5 | IMU Accel Decay (XRV) | App Cfg > IMU | 0.02 |

---

## References

- Source: pev.dev/t/critical-setting-fixes-for-pintv-xrv/1924 (7,505 views)
- Related: `nosedive-prevention-checklist.md` - Safety fundamentals
- Related: `safety-critical-settings.md` - Complete safety guide
- Related: `power-kit-setup-guide.md` - Initial setup

---

*Last updated: 2026-01-14 | Source: pev.dev community content*
