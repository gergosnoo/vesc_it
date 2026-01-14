# Critical Setting Fixes for PintV & XRV Riders

**Source:** https://pev.dev/t/critical-setting-fixes-for-pintv-xrv/1924
**Views:** 7,505 (TOP #5 on pev.dev)
**Type:** Safety-critical configuration guide

---

This safety guide addresses five critical configuration issues that could compromise battery integrity or riding safety if left unchanged.

## 1. Voltage Tiltback Thresholds

**Location:** Float Cfg/Refloat Cfg > Specs > [Voltage Tiltbacks]

- **High Voltage:** 64.5V (prevents regen damage)
- **Low Voltage:** 45.0V (alerts rider before critical discharge)

These thresholds protect against nosedives and battery damage by warning riders when voltage levels become unsafe.

## 2. Battery Voltage Cutoff Values

**Location:** Motor Cfg > General > Voltage

- **Cutoff Start:** 40.5V (begins limiting current)
- **Cutoff End:** 37.5V (prevents critical damage)

These act as backup protection when riders ignore low voltage alerts. An alternative "rider safety" approach uses 37.5V start and 30.0V end, though the guide emphasizes these represent absolute minimum discharge levels.

## 3. Battery Current Limits

**Location:** Motor Cfg > General > Current > [Battery]

- **Max:** 30A
- **Max Regen:** -30A

Stock batteries cannot safely handle the higher factory defaults, risking voltage sag and pack damage.

## 4. Field Weakening Settings

**Location:** Motor Cfg > FOC > Field Weakening

- **Current Max:** 30A
- **Duty Start:** 60%
- **Ramp Time:** 500ms

Factory values exceed safe limits for stock battery packs.

## 5. IMU Accelerometer Confidence Decay (XRV Only)

**Location:** App Cfg > IMU > [AHRS]

- **Set to:** 0.02

The XRV ships with an incorrect 0.1 value that negatively affects board behavior and handling characteristics.

---

**⚠️ Critical reminder:** "DO NOT ignore Low Voltage Tiltback! It's your first line of defense" for protecting both rider safety and battery health.
