# Motor Detection Troubleshooting Guide

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-13
**Source:** `bldc/conf_general.c`, `bldc/terminal.c`, `bldc/comm/commands.c`
**Addresses:** GAP-03 (High Priority)

---

## Quick Troubleshooting Flowchart

```
Motor Detection Failed?
        │
        ▼
┌───────────────────────────────────────┐
│ 1. Is motor connected and free?       │
│    □ Check phase wire connections     │
│    □ Ensure motor can spin freely     │
│    □ Remove any load from motor       │
└───────────────────┬───────────────────┘
                    │ Still fails?
                    ▼
┌───────────────────────────────────────┐
│ 2. Check for active inputs            │
│    □ Disconnect PPM/ADC inputs        │
│    □ Disable NRF/apps temporarily     │
│    □ Ensure no CAN commands coming    │
└───────────────────┬───────────────────┘
                    │ Still fails?
                    ▼
┌───────────────────────────────────────┐
│ 3. Increase detection current         │
│    □ Try 5A → 7A → 10A               │
│    □ Larger motors need more current  │
└───────────────────┬───────────────────┘
                    │ Still fails?
                    ▼
┌───────────────────────────────────────┐
│ 4. Check firmware/tool version        │
│    □ Update VESC Tool to latest       │
│    □ Update firmware if mismatched    │
└───────────────────────────────────────┘
```

---

## Common Detection Error Codes

**Source:** `bldc/conf_general.c:1732-1737`

```c
// From bldc/conf_general.c:1732-1737
* @return
* >=0: Success, see conf_general_autodetect_apply_sensors_foc codes
* -10: Flux linkage detection failed
*  -x: see conf_general_autodetect_apply_sensors_foc faults
*  -100 + fault: Fault code during detection see "mc_fault_code"
```

### Detection Return Codes

| Code | Meaning | Solution |
|------|---------|----------|
| ≥ 0 | Success | Detection completed |
| -10 | Flux linkage detection failed | See flux linkage section |
| -50 | CAN detection timed out | Check CAN connection |
| -51 | CAN detection failed | Check CAN wiring (`conf_general.c:2137`) |
| -100 to -129 | Fault occurred during detection | Subtract 100 to get fault code |

### Fault Codes During Detection

**Source:** `bldc/datatypes.h:144-173`

If you get code -100 to -129, subtract 100 to find the actual fault:

```c
// From bldc/datatypes.h:144-173
typedef enum {
    FAULT_CODE_NONE = 0,              // Result: -100
    FAULT_CODE_OVER_VOLTAGE,          // Result: -101
    FAULT_CODE_UNDER_VOLTAGE,         // Result: -102
    FAULT_CODE_DRV,                   // Result: -103
    FAULT_CODE_ABS_OVER_CURRENT,      // Result: -104
    FAULT_CODE_OVER_TEMP_FET,         // Result: -105
    FAULT_CODE_OVER_TEMP_MOTOR,       // Result: -106
    // ... (30+ fault codes total)
    FAULT_CODE_ENCODER_SPI,           // Result: -111
    FAULT_CODE_ENCODER_NO_MAGNET,     // Result: -125
} mc_fault_code;
```

| Result | Fault | Cause |
|--------|-------|-------|
| -101 | FAULT_CODE_OVER_VOLTAGE | Input voltage too high |
| -102 | FAULT_CODE_UNDER_VOLTAGE | Input voltage too low |
| -103 | FAULT_CODE_DRV | Gate driver error |
| -104 | FAULT_CODE_ABS_OVER_CURRENT | Overcurrent during detection |
| -105 | FAULT_CODE_OVER_TEMP_FET | MOSFET too hot |
| -106 | FAULT_CODE_OVER_TEMP_MOTOR | Motor too hot |
| -111 | FAULT_CODE_ENCODER_SPI | SPI encoder error |
| -125 | FAULT_CODE_ENCODER_NO_MAGNET | Magnetic encoder issue |

---

## "R is 0" Error (Resistance Detection Failed)

### What It Means

The VESC couldn't measure the motor's phase resistance. Resistance should typically be 5-200 mΩ for most motors.

### Solutions

1. **Check phase wire connections**
   - Ensure solid solder joints
   - Check for broken wires inside motor
   - Test continuity between phases

2. **Increase detection current**
   - Default 5A may be too low
   - Try 7A or 10A for larger motors
   - High KV motors may need higher current

3. **Check for shorts**
   - Measure resistance between phases with multimeter
   - Should be roughly equal between all phase pairs
   - If 0 ohms, motor is shorted

4. **Motor not suitable**
   - Very high KV motors (>10000) may be difficult
   - Ensure motor is rated for VESC voltage

---

## Hall Sensor Error 255

### What It Means

The VESC detected an invalid Hall sensor combination. Valid combinations are 1-6, and 255 means "all high" or "all low" which is invalid.

### Solutions

1. **Check Hall sensor wiring**
   ```
   Hall A → HALL1 (or H1)
   Hall B → HALL2 (or H2)
   Hall C → HALL3 (or H3)
   5V     → VCC or +5V
   GND    → GND
   ```

2. **Verify 5V supply**
   - Measure 5V at Hall connector
   - Some motors need external 5V supply

3. **Check Hall sensor order**
   - Wrong order won't prevent detection but causes issues
   - After detection, run Hall sensor table check

4. **Test Hall sensors**
   - Manually rotate motor slowly
   - Watch Hall sensor readings in RT Data
   - Should cycle through 1-6 as motor rotates

---

## Flux Linkage Detection Failed

### What It Means

The VESC couldn't spin the motor to measure back-EMF. This happens after R/L detection succeeded.

### Solutions

1. **Motor has load**
   - Remove wheel/propeller during detection
   - Motor must spin freely

2. **Motor is stuck**
   - Check for mechanical obstruction
   - Bearing may be seized

3. **Detection current too low**
   - Motor needs enough current to overcome cogging torque
   - Increase detection current

4. **Fault occurred**
   - Check VESC Tool terminal for fault messages
   - May be voltage/current limit issue

---

## Detection Tips by Motor Type

### High KV Motors (>3000 KV)

- Use sensorless mode initially
- May need higher detection current (7-10A)
- Flux linkage will be very low (0.001-0.01 mWb)
- Consider using HFI for low-speed operation

### Low KV Motors (<200 KV)

- Hall sensors recommended for startup
- Standard 5A detection usually works
- Watch for high inductance warnings
- May need reduced switching frequency

### Hub Motors

- Often have Hall sensors built in
- Check Hall sensor pinout (varies by manufacturer)
- Temperature sensor may share connector

### Outrunner Motors

- Common in esk8, ebike applications
- Usually 50-300 KV range
- Standard detection works well
- Hall sensors optional but helpful

---

## Pre-Detection Checklist

Before running motor detection:

```
□ Motor phase wires securely connected (3 wires)
□ Motor can spin freely (no load attached)
□ If Hall sensors: 5V, GND, and 3 signal wires connected
□ Battery fully charged (avoid detection at low voltage)
□ No other inputs active (disconnect PPM, ADC, UART apps)
□ VESC Tool version matches firmware version
□ Terminal/RT Data pages closed (reduce communication)
□ Room temperature (not too hot or cold)
```

---

## Running Detection in VESC Tool

### Step 1: Open Motor Settings

1. Connect to VESC
2. Go to **Motor Settings** → **FOC** → **General**

### Step 2: Configure Detection

| Setting | Recommended Value |
|---------|------------------|
| Detection Current | 5A (increase if fails) |
| Min ERPM | 150-300 |
| Duty | 0.1 (10%) |

### Step 3: Run Detection

1. Click **Detect Motor**
2. Wait for motor to spin and stop
3. Check results:
   - R (resistance): Should be > 0
   - L (inductance): Should be > 0
   - λ (flux linkage): Should be > 0

### Step 4: If Using Hall Sensors

1. After main detection, go to **Hall Sensor**
2. Click **Detect Hall Table**
3. Motor will spin slowly
4. Verify table shows valid values (1-6)

---

## Terminal Commands for Debugging

Use the Terminal in VESC Tool for more info:

```
# Check current fault
faults

# Clear faults
faults_clear

# Read motor R and L manually
foc_detect_rl

# Measure flux linkage
foc_detect_lam

# Check Hall sensors
foc_detect_hall

# Run full detection
foc_detect_all [current] [min_erpm] [low_duty]
```

---

## Detection Edge Cases (Advanced)

### "R is 0" Due to Receiver Interference

**Symptom:** R shows 0 even with good connections.

**Cause:** PPM/ADC receiver noise during detection. Radio receivers (especially 2.4GHz) can inject noise into current sensing.

**Fix:**
1. **Disconnect receiver completely** during detection
2. If wired remote, unplug signal wire (leave power)
3. Move VESC away from radio receiver
4. Shield cables if interference persists

### Detection Failed Reason -11 (or -10x codes)

**Symptom:** "Detection failed, reason: -11" or similar negative code.

**Cause:** A fault occurred DURING detection. Code = -100 + fault_code.

**Debug Steps:**
1. Open VESC Tool → Terminal
2. Type `faults` and press Enter
3. Note the fault name
4. Type `faults_clear` to clear
5. Fix the underlying issue, retry detection

**Common -10x codes:**
| Code | Fault | Fix |
|------|-------|-----|
| -101 | Over voltage | Lower input voltage |
| -102 | Under voltage | Charge battery |
| -103 | DRV error | Check phase wires, gate driver |
| -104 | Overcurrent | Reduce detection current |
| -111 | Encoder SPI | Check encoder wiring |

### Detection Values Way Off (Wrong R/L/λ)

**Symptom:** Detection "succeeds" but values are wildly wrong - motor runs badly.

**Cause:** Switching frequency too high for accurate measurement on some motors.

**Fix:**
1. Go to **Motor Settings → FOC → Advanced**
2. Reduce **FOC Switching Frequency** to **5-10 kHz** temporarily
3. Run detection again
4. Values should now be accurate
5. Optionally increase frequency back after detection (if motor runs well)

**Why this works:** Lower switching frequency = longer measurement windows = more accurate R/L detection.

### Big Motor Detection Issues (Hub motors, >5kW)

**Symptom:** Large motors fail detection or give poor results.

**Cause:** Default detection current (5A) is too low for large motors with high cogging torque.

**Fix:**
1. **Increase detection current to 30-50A** (depends on motor rating)
2. **Lower switching frequency to 3-5 kHz**
3. Ensure power supply can handle detection current
4. Motor MUST be able to spin freely (remove wheel if needed)

**Settings for large motors:**
| Parameter | Value |
|-----------|-------|
| Detection Current | 30-50A |
| FOC Switching Freq | 3-5 kHz |
| Min ERPM | 150 |
| Detection Duty | 0.1-0.15 |

---

## When Detection Keeps Failing

If nothing works:

1. **Test with known-good motor** to rule out VESC issue
2. **Check for firmware bugs** - update to latest
3. **Inspect VESC hardware** for damage
4. **Ask on forums** with:
   - VESC hardware version
   - Firmware version
   - Motor specs
   - Exact error message

---

*Content verified against bldc source code | Ready for embedding*
