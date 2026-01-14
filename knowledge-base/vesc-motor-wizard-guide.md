# VESC Motor Wizard Guide

## Overview

**Key Terms:** motor wizard, motor detection, FOC detection, motor setup, VESC motor config, hall sensor calibration, motor crunch fix, observer gain

This guide covers the complete motor wizard process for VESC controllers, including detection, configuration, and troubleshooting common issues like motor "crunch."

**Source:** pev.dev community (17,194 views - TOP post)

---

## Critical Pre-Setup Requirements

⚠️ **ALWAYS maintain backups before starting:**

```
VESC Tool > Motor Settings > Save to XML
VESC Tool > App Settings > Save to XML
```

**Important:** Settings don't transfer until explicitly written. Bluetooth disconnections can cause loss of changes. Save frequently!

---

## Motor Wizard Step-by-Step

### Step 1: Initial Motor Configuration

1. Select **"No"** for default parameters
2. Choose **"Large Outrunner"** motor type
3. Set foundational parameters:

| Parameter | Value | Notes |
|-----------|-------|-------|
| Maximum Power Loss | 400W | Heat dissipation limit |
| Open Loop ERPM | 700 | Startup threshold |
| Sensorless ERPM | 2000 | **Critical - gets adjusted later** |
| Motor Poles | 30 | Standard for hub motors |

### Step 2: Battery Configuration

Set cell count based on your pack:

| Battery Type | Cell Count | Nominal Voltage |
|--------------|------------|-----------------|
| Stock XR (64V) | 15S | 55.5V |
| CBXR/Chi Battery | 20S | 74V |
| High Voltage Pack | 24-32S | Up to 135V |

### Step 3: Run Motor Detection

1. **Lift the wheel** - Motor must spin freely
2. Click the **Detection** button
3. Allow wheel to free-spin during detection
4. Compare results against reference ranges

**Detection Results Vary:** Results depend on motor and controller specifications. Don't panic if values differ from guides - compare against similar setups.

---

## Motor Settings - General Configuration

### Current Parameters

| Motor Type | Motor Max | Brake Current |
|------------|-----------|---------------|
| Hypercore | 120A | -100A |
| Superflux/Cannon Core | 180A | -160A |

**Battery Limits (typical):**
- Maximum: 35-60A (depends on pack)
- Regen: -15A to -30A

### Voltage Settings (Per-Cell Basis)

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Cutoff Start | 2.3V/cell | Begin current limiting |
| Cutoff End | 2.0V/cell | Hard cutoff protection |

**Example for 20S pack:**
- Cutoff Start: 2.3V × 20 = 46V
- Cutoff End: 2.0V × 20 = 40V

### Temperature Protections

| Component | Start Limit | End Limit |
|-----------|-------------|-----------|
| MOSFET | 75°C | 85°C |
| Motor | 80°C | 95°C |

These trigger pushback alerts. **Exceeding these limits risks permanent damage.**

---

## FOC Motor Settings

### Observer Gain

**Critical Setting:** Set observer gain to approximately **half** the wizard-detected value.

| Detected Value | Recommended Setting |
|----------------|---------------------|
| 1.2 | 0.6 |
| 1.5 | 0.7-0.8 |
| 1.8 | 0.9 |

**Range:** 0.6 - 0.9 for most motors

### Hall Sensor Configuration

| Parameter | Recommended Value |
|-----------|-------------------|
| Hall Sensor Interpolation ERPM | 250 |
| Sensorless ERPM | 2000 |

### Field Weakening

| Parameter | Value |
|-----------|-------|
| Max Start Current | 30-50A |
| Duty Start | 60-65% |

---

## Motor "Crunch" Resolution

Motor crunch is a grinding/crunching sound, especially at low speeds. Fix systematically:

### Step-by-Step Fix Process

**Make ONE change at a time and test between each:**

1. **Reduce Observer Gain**
   - Set to half of wizard-detected value
   - Example: If wizard detected 1.5, try 0.75

2. **Verify Sensorless ERPM**
   - Must be set to **2000**
   - Lower values can cause crunch

3. **Set Hall Sensor Interpolation**
   - Set to **250 ERPM**

4. **Adjust Zero Vector Frequency**
   - Maximum value: **30**
   - Try values between 20-30

5. **Increase Motor Resistance**
   - Multiply detected resistance by **1.2×**
   - Example: If detected 0.015Ω, try 0.018Ω

### Crunch Troubleshooting Flowchart

```
Motor Crunching?
      │
      ▼
Observer Gain at half? ──No──► Reduce to 0.6-0.9
      │
      │Yes
      ▼
Sensorless ERPM = 2000? ──No──► Set to 2000
      │
      │Yes
      ▼
Hall Interpolation = 250? ──No──► Set to 250
      │
      │Yes
      ▼
Zero Vector Freq ≤30? ──No──► Reduce to 30 or below
      │
      │Yes
      ▼
Try increasing resistance by 1.2×
```

---

## Common Motor FOC Reference Values

These are typical ranges - your specific motor may vary:

| Parameter | Hypercore | Superflux | Fungineers |
|-----------|-----------|-----------|------------|
| Resistance (R) | 0.012-0.018Ω | 0.008-0.012Ω | 0.015-0.020Ω |
| Inductance (L) | 8-15μH | 6-10μH | 10-18μH |
| Flux Linkage | 0.015-0.025 Wb | 0.012-0.020 Wb | 0.018-0.028 Wb |
| Observer Gain | 0.6-0.9 | 0.5-0.8 | 0.7-1.0 |

**These are guidelines only.** Always start with detection and adjust from there.

---

## Quick Reference Checklist

Before first ride after motor wizard:

- [ ] Motor detection completed successfully
- [ ] Observer gain set to ~half detected value
- [ ] Sensorless ERPM = 2000
- [ ] Hall interpolation = 250 ERPM
- [ ] Battery cutoffs configured for your cell count
- [ ] Temperature limits set (75°C MOSFET, 80°C motor start)
- [ ] Hand test performed (balance check before mounting)

---

## References

- Source: pev.dev/t/motor-wizard-guide/486 (17,194 views)
- Related: `vesc-hardware-specific-guides.md` - Controller specs
- Related: `vesc-fault-code-reference.md` - Error troubleshooting
- Related: `vesc-error-recovery-guide.md` - Detection failures

---

*Last updated: 2026-01-14 | Source: pev.dev community content*
