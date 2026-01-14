# GTV/XRV/PintV Power Kit Start Guide

**Source:** https://pev.dev/t/gtv-xrv-pintv-power-kit-start-guide/1616
**Views:** 12,475 (TOP #4 on pev.dev)
**Type:** Installation / Setup guide

---

## Prerequisites
- Power kit installed
- VESC Tool Mobile App (iOS/Android)
- Patience to follow detailed procedures carefully

## Step 1: Backup Configurations

"Make sure your board is powered on. In the VESC Tool app, scan for your board...find and tap the large Backup Configs button" to preserve factory settings. This acts as a failsafe for learning and troubleshooting.

## Step 2: Hall Sensor Calibration

1. Prop the board so the motor spins freely
2. Access Motor CFG tab
3. Select "Detect FOC Hall Sensors"
4. Allow the motor to slowly spin during detection
5. Apply and write the detected values

This optimizes performance for your specific motor.

## Step 3: Offset Calibration (Optional)

Disable "Run Calibration at Boot" under Motor CFG → FOC → Offsets to speed startup, since this voltage/current calibration typically only needs initial execution.

## Step 4: IMU Leveling (Optional - Angled Rails Only)

**Skip this for flat-nose rails.**

For angled rails:
1. Position the board level
2. Use Orientation Calibration
3. Skip Roll, save Pitch, skip Yaw
4. Verify readings: Roll near 0, Pitch positive (~20°)

## Step 5: Hand Test

"Before trying to mount the board, you should perform a hand test to safely test" balance. Reference the provided video demonstration for proper technique.

## Step 6: XRV/PintV Settings

These boards require additional configuration adjustments documented in a separate critical settings guide before final use.

## Troubleshooting Notes

Motor squealing indicates configuration reset—restore backups or reload XML files for Motor/App/Float configs if defaults were accidentally triggered.
