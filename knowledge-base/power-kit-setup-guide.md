# Power Kit Setup Guide (GTV/XRV/PintV)

## Overview

**Key Terms:** power kit, GTV setup, XRV setup, PintV setup, VESC power kit, hall sensor calibration, IMU leveling, hand test, power kit installation, VESC Tool mobile

This guide covers the complete setup process for power kit installations on GTV, XRV, and PintV boards, from initial backup through final testing.

**Source:** pev.dev community (12,475 views)

---

## Prerequisites

Before starting:

- ✅ Power kit physically installed
- ✅ VESC Tool Mobile App (iOS or Android)
- ✅ Board powered on and Bluetooth working
- ✅ Patience to follow procedures carefully

---

## Step 1: Backup Configurations (CRITICAL)

**This is your safety net for learning and troubleshooting.**

1. Power on the board
2. Open VESC Tool app
3. Scan and connect to your board
4. Find and tap **"Backup Configs"** button
5. Save backup to your phone

This preserves factory settings that can be restored if anything goes wrong.

---

## Step 2: Hall Sensor Calibration

Hall sensors provide smooth motor operation at low speeds. Calibration optimizes performance for your specific motor.

### Procedure

1. **Prop the board** so the wheel can spin freely
2. Navigate to **Motor CFG** tab
3. Select **"Detect FOC Hall Sensors"**
4. Allow the motor to slowly spin during detection
5. Wait for detection to complete
6. **Apply** the detected values
7. **Write** to save to controller

### What This Does

Hall sensor calibration:
- Maps sensor positions to motor phases
- Enables smooth low-speed operation
- Reduces motor noise and vibration
- Improves efficiency

---

## Step 3: Offset Calibration (Optional Speed Improvement)

By default, the VESC runs voltage/current calibration at every boot. This can be disabled after initial setup.

**Location:** Motor CFG → FOC → Offsets

**Setting:** Disable **"Run Calibration at Boot"**

### Why This Helps

- Speeds up startup time
- Calibration only needed once (after initial setup)
- Can always re-enable if problems occur

---

## Step 4: IMU Leveling

**⚠️ IMPORTANT:** This step depends on your rail type.

### Flat-Nose Rails

**Skip this step entirely.** IMU leveling is not needed for flat rails.

### Angled Rails

If you have angled (nose-up) rails, the IMU needs to know what "level" means:

1. **Position the board** on a level surface
2. Navigate to **Orientation Calibration**
3. Process:
   - **Skip** Roll calibration
   - **Save** Pitch calibration
   - **Skip** Yaw calibration
4. Verify readings:
   - Roll: Near 0°
   - Pitch: Positive value (~20° for typical angled rails)

### Why Pitch Matters

Without proper IMU leveling on angled rails:
- Board won't balance correctly
- Nose may ride too high or low
- Self-balancing algorithm confused about "level"

---

## Step 5: Hand Test (SAFETY CHECK)

**⚠️ ALWAYS perform a hand test before mounting the board.**

### Purpose

The hand test verifies that the balance system is working correctly before you put your weight on it.

### Procedure

1. Hold the board by the fender (don't touch the ground)
2. Engage the sensors with your hand
3. Observe motor response:
   - Tilting forward → Motor should engage forward
   - Tilting back → Motor should engage backward
   - Level → Motor should hold position
4. Test disengagement by releasing sensors

### What to Look For

| Behavior | Status |
|----------|--------|
| Motor responds correctly to tilt | ✅ Good |
| Motor runs away in one direction | ❌ IMU or config issue |
| Motor doesn't engage | ❌ Sensor or app issue |
| Motor squeals/grinds | ❌ Config reset (see below) |

---

## Step 6: XRV/PintV Additional Settings

**XRV and PintV boards require additional configuration adjustments.**

These are documented in detail in the separate **Critical Settings** guide:

- Voltage tiltback thresholds
- Battery cutoff values
- Battery current limits
- Field weakening limits
- IMU accelerometer confidence decay (XRV only)

**⚠️ CRITICAL:** Complete the Critical Settings guide before riding!

See: `pintv-xrv-critical-settings.md`

---

## Troubleshooting

### Motor Squealing After Setup

**Symptom:** Motor makes squealing/grinding sound, won't balance properly

**Cause:** Configuration was reset to defaults

**Fix:**
1. Restore backups (that's why Step 1 is critical!)
2. Or reload XML files for Motor/App/Float configs
3. If no backup: Manually reconfigure settings

### Board Won't Connect

**Symptoms:**
- Can't find board in Bluetooth scan
- Connection drops repeatedly

**Fixes:**
1. Ensure board is powered on
2. Move phone closer to controller
3. Close and reopen VESC Tool
4. Check if App to Use = UART (not "None")

### Hall Sensor Detection Fails

**Symptoms:**
- Detection doesn't complete
- Error messages during detection

**Fixes:**
1. Ensure wheel spins completely freely
2. Check hall sensor cable connection
3. Verify 5V power to hall sensors
4. Try detection at higher current (if available)

### IMU Readings Wrong

**Symptoms:**
- Pitch/Roll values don't match board position
- Balance feels "off"

**Fixes:**
1. Recalibrate IMU orientation
2. Check for physical IMU mounting issues
3. Verify App Cfg → IMU settings

---

## Setup Checklist

Complete setup verification:

- [ ] Backup created successfully
- [ ] Hall sensors calibrated
- [ ] Offset calibration disabled (optional)
- [ ] IMU leveled (if angled rails)
- [ ] Hand test passed
- [ ] Critical settings configured (XRV/PintV)
- [ ] First ride at low speed in safe area

---

## References

- Source: pev.dev/t/gtv-xrv-pintv-power-kit-start-guide/1616 (12,475 views)
- Related: `pintv-xrv-critical-settings.md` - Safety settings
- Related: `vesc-motor-wizard-guide.md` - Motor configuration
- Related: `vesc-error-recovery-guide.md` - Connection issues

---

*Last updated: 2026-01-14 | Source: pev.dev community content*
