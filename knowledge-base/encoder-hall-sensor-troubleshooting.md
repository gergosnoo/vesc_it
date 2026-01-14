# Encoder & Hall Sensor Troubleshooting Guide

## Overview

**Key Terms:** hall sensor, encoder, Hall Error 255, fault 25, fault 26, encoder fault, magnet, hall detection, sensor calibration, AS5047, MT6816, sincos encoder

This guide covers troubleshooting hall sensors and encoders on VESC controllers, including common fault codes, detection failures, and calibration issues.

**Source:** bldc firmware - encoder.c, mcpwm_foc.c, foc_math.c, datatypes.h

---

## Hall Sensor Basics

Hall sensors detect rotor position using magnetic fields. Most hub motors use 3 hall sensors that create 6 distinct states as the motor rotates.

### How Hall Sensors Work

```
Hall sensors produce 3-bit value (0-7):
- 6 valid states (60° apart)
- 2 invalid states (all high or all low)

Motor rotation → Hall state changes → VESC tracks position
```

### Hall Sensor Wiring

| Wire Color | Signal | Notes |
|------------|--------|-------|
| Red | 5V Power | Some motors use 3.3V |
| Black | Ground | - |
| Yellow | Hall A | - |
| Green | Hall B | - |
| Blue | Hall C | - |

**Note:** Colors vary by manufacturer. Always verify with motor documentation.

---

## Common Hall Sensor Fault Codes

### Hall Error 255 (Invalid Hall State)

**What it means:** The hall table entry is 255, indicating no valid angle was detected for that hall state combination.

**Causes:**
1. **Disconnected hall sensor wire** - Check all 5 connections
2. **Damaged hall sensor** - One or more sensors failed
3. **Wrong hall sensor voltage** - Some motors need 3.3V, not 5V
4. **Motor detection failed** - Detection didn't complete properly

**Diagnosis:**
1. Go to **App Settings → General**
2. Enable **Real-Time Data**
3. Slowly rotate motor by hand
4. Watch hall sensor values - should cycle through 6 states
5. If stuck on one value or shows 0/7, sensor is faulty

**Fix:**
1. Check wiring connections
2. Verify 5V power at hall connector
3. Try swapping hall wires (A↔B, B↔C, etc.)
4. Re-run hall sensor detection
5. If one sensor dead, motor may need repair

---

### Fault 25: ENCODER_NO_MAGNET

**What it means:** The encoder sensor cannot detect the magnetic field from the rotor magnet.

**Applies to:** AS5047, AS5x47U, MT6816 encoders

**Source:** `encoder.c:611-620, 675-676`

**Causes:**
1. **Magnet missing** - Fell off or never installed
2. **Magnet too far** - Air gap too large
3. **Wrong magnet orientation** - Polarity inverted or 90° off
4. **Weak magnet** - Field strength below threshold
5. **Dirty sensor** - Debris blocking magnetic field

**Diagnosis:**
- Error rate threshold: >5% triggers fault
- Check VESC Tool → Real-Time Data → Encoder section

**Fix:**
1. Verify magnet is present and secured
2. Reduce air gap (magnet closer to sensor)
3. Check magnet polarity (N or S facing sensor)
4. Clean sensor surface
5. Replace magnet if demagnetized

---

### Fault 26: ENCODER_MAGNET_TOO_STRONG

**What it means:** The magnetic field exceeds the encoder's safe operating range.

**Applies to:** AS5047, AS5x47U encoders

**Source:** `encoder.c:612-613, 677-678`

**Causes:**
1. **Magnet too close** - Air gap too small
2. **Magnet too strong** - Wrong magnet grade
3. **Multiple magnets** - Stray magnetic fields

**Fix:**
1. Increase air gap (move magnet away)
2. Use weaker magnet (lower N grade)
3. Shield from external magnetic interference

---

### Fault 11: ENCODER_SPI

**What it means:** SPI communication errors with the encoder.

**Applies to:** AS5047, BiSSC, and other SPI encoders

**Source:** `encoder.c:600, 686`

**Causes:**
1. **Loose SPI wires** - MISO, MOSI, CLK, CS
2. **EMI interference** - Noise on SPI lines
3. **Wrong SPI speed** - Clock too fast for cable length
4. **Damaged encoder IC** - Hardware failure

**Fix:**
1. Check all SPI connections
2. Use shielded cables
3. Keep SPI wires away from motor phase wires
4. Reduce SPI clock speed in config

---

### Faults 12 & 13: SINCOS Amplitude Errors

**Fault 12:** `ENCODER_SINCOS_BELOW_MIN_AMPLITUDE`
**Fault 13:** `ENCODER_SINCOS_ABOVE_MAX_AMPLITUDE`

**What it means:** The analog sin/cos signals are outside acceptable range.

**Source:** `enc_sincos.c:35-36, 78-84`

**Thresholds:**
- Minimum amplitude: 0.7 (signal too weak)
- Maximum amplitude: 1.3 (signal too strong)

**Causes for Fault 12 (too weak):**
1. Loose cable connection
2. Corroded connector
3. Magnet too far from sensor
4. Damaged sensor

**Causes for Fault 13 (too strong):**
1. EMI interference
2. Crosstalk between sin/cos signals
3. Magnet too close
4. Wrong encoder calibration

**Fix:**
1. Check cable connections
2. Verify magnet position
3. Calibrate encoder offsets and amplitudes
4. Shield from EMI sources

---

## Hall Sensor Detection Process

The VESC detects hall sensors by rotating the motor and recording which hall state corresponds to each electrical angle.

**Source:** `mcpwm_foc.c:2341-2463`

### Detection Procedure

1. Motor locks in position
2. Current ramps from 0 to detection value over 1 second
3. Motor rotates through all 360° (3 forward + 3 reverse cycles)
4. At each degree, hall state is recorded
5. Average angle calculated for each of 8 hall states
6. Result stored in hall table (0-200 scale, 200 = 360°)

### Detection Requirements

- **Motor must spin freely** - No load, wheel off ground
- **No PPM/ADC input** - Disconnect remote during detection
- **Minimum 30 samples** per hall state
- **Exactly 2 invalid states** expected (120° spacing)

### Detection Failures

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Bad Detection Result" | Motor moved or jammed | Ensure free rotation |
| "Hall Sensor Fault" | Sensor not responding | Check wiring, power |
| Wrong direction after | Hall wires swapped | Swap any two phase wires |
| Cogging at low speed | Poor hall detection | Re-run with higher current |

---

## Hall Sensor Calibration Parameters

**Location:** Motor Settings → FOC → Hall Sensors

| Parameter | Default | Purpose |
|-----------|---------|---------|
| Hall Table | Auto-detected | Maps hall states to angles |
| Hall Interpolation ERPM | 250 | Below this, use raw hall angle |
| Sensorless ERPM | 2000 | Transition to sensorless above this |
| Extra Samples | 0 | Multi-sampling for noise (0-10) |

### Hall Interpolation Explained

**Source:** `foc_math.c:591-698`

At low speed, the VESC uses the exact hall angle without interpolation. As speed increases:

1. **Below `hall_interp_erpm`:** Use raw hall angle (prevents 60° lock-in)
2. **Between interp and sensorless:** Interpolate between hall transitions
3. **Above `sensorless_erpm`:** Use observer angle only

**Tip:** If motor cogs at low speed, try reducing `hall_interp_erpm`.

---

## Encoder Configuration

### Encoder Types Supported

| Type | Fault Mode | Error Threshold |
|------|------------|-----------------|
| AS5047 (SPI) | ENCODER_SPI | 5% |
| AS5x47U (SPI) | ENCODER_SPI | 5% |
| MT6816 (SPI) | ENCODER_NO_MAGNET | 5% |
| TLE5012 (SSC) | ENCODER_FAULT | 10% |
| AD2S1205 (Resolver) | RESOLVER_LOT/DOS/LOS | 4-5% |
| Sincos (Analog) | SINCOS_AMPLITUDE | 5% |
| BiSSC | ENCODER_SPI | 4% |

### Sincos Encoder Calibration

**Location:** Motor Settings → FOC → Encoder

| Parameter | Purpose |
|-----------|---------|
| Encoder Counts | CPR (counts per revolution) |
| Sin Offset | ADC offset for sin signal |
| Sin Amplitude | Signal amplitude normalization |
| Cos Offset | ADC offset for cos signal |
| Cos Amplitude | Signal amplitude normalization |
| Filter Constant | Low-pass filter strength |
| Phase Correction | Compensate sin/cos phase error |

**Calibration Procedure:**
1. Go to Motor Settings → FOC → Encoder
2. Click "Measure Offsets"
3. Slowly rotate motor by hand through full rotation
4. Apply measured values

---

## Troubleshooting Flowchart

```
Hall/Encoder Problem?
        │
        ▼
┌───────────────────┐
│ Check Real-Time   │
│ Data for errors   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Fault 25 or 26?   │──Yes──► Check magnet position/strength
└─────────┬─────────┘
          │No
          ▼
┌───────────────────┐
│ Fault 11 (SPI)?   │──Yes──► Check SPI wiring, reduce EMI
└─────────┬─────────┘
          │No
          ▼
┌───────────────────┐
│ Fault 12 or 13?   │──Yes──► Calibrate sincos offsets
└─────────┬─────────┘
          │No
          ▼
┌───────────────────┐
│ Hall Error 255?   │──Yes──► Check hall wiring, re-detect
└─────────┬─────────┘
          │No
          ▼
┌───────────────────┐
│ Detection fails?  │──Yes──► Free wheel, disconnect inputs
└─────────┬─────────┘
          │No
          ▼
   Check hall table values
   in Motor Settings → FOC
```

---

## Quick Fixes

### Motor Cogs at Low Speed

1. Re-run hall detection at higher current (7-10A)
2. Reduce `hall_interp_erpm` to 100-150
3. Increase `extra_samples` to 2-3 for noise filtering

### Motor Runs Backwards

1. Swap any two motor phase wires (A↔B, B↔C, or A↔C)
2. Or invert motor direction in Motor Settings

### Intermittent Faults 25/26

1. Secure magnet mounting
2. Check for loose encoder cable
3. Shield from motor EMI
4. Reduce error threshold sensitivity

### Detection Gives Wrong Hall Table

1. Ensure motor spins freely (no load)
2. Disconnect all inputs (PPM, ADC)
3. Use higher detection current
4. Check hall sensor power (5V stable)

---

## References

- Source: `bldc/datatypes.h:143-174` - Fault code definitions
- Source: `bldc/motor/mcpwm_foc.c:2341-2463` - Hall detection
- Source: `bldc/motor/foc_math.c:591-698` - Hall correction algorithm
- Source: `bldc/encoder/encoder.c:588-705` - Encoder fault checking
- Source: `bldc/encoder/enc_sincos.c:35-101` - Sincos processing
- Related: `vesc-fault-code-reference.md` - All fault codes
- Related: `motor-detection-troubleshooting.md` - Detection issues

---

*Last updated: 2026-01-14 | Source verified against bldc repository*
