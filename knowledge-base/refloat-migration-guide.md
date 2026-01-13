# Float to Refloat Migration Guide

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-13
**Source:** `refloat/package_README.md`, `refloat/ui.qml.in`
**Addresses:** GAP-01 (High Priority)

---

## Quick Summary

Refloat is the successor to Float package, created by Lukáš Hrázký based on the original Float by Mitch Lustig, Dado Mista, and Nico Aleman. Migration from Float 1.3/2.0 to Refloat is straightforward with automatic config migration.

---

## Before You Migrate

### Backup Your Current Config

Always backup before upgrading:

1. **Method 1 (Recommended):** Go to Start Page → **Backup Configs**
2. **Method 2:** In Float/Refloat Cfg page → Save XML

Store the backup file safely - you can restore if something goes wrong.

### Check Firmware Compatibility

- **Refloat 1.2+** works best with VESC firmware **6.05+**
- On firmware 6.02, you'll need to manually set voltage thresholds
- Recommended: Update firmware before installing Refloat

---

## Migration Steps

### Step 1: Install Refloat Package

1. Open VESC Tool
2. Go to **VESC Packages** → **Package Store**
3. Find **Refloat** and install it
4. The package will replace Float

### Step 2: Automatic Config Migration

When upgrading from Refloat 1.1 to 1.2:

1. An **automatic config restore dialog** will appear
2. **Confirm** to restore your settings
3. The migration system will:
   - Transfer all compatible settings
   - Adjust voltage thresholds for per-cell values (6.05+ only)
   - Handle format conversions automatically

**Important:** The automatic migration is the preferred method because it migrates changed options correctly. Manual XML restore may not handle option changes.

### Step 3: Verify Critical Settings

After migration, check these settings in Refloat Cfg:

| Setting | What to Check |
|---------|---------------|
| **Tiltback HV/LV** | On 6.05+, these are now per-cell values |
| **LED Type** | Verify correct type (WS2812/SK6812/External/None) |
| **Loop Hertz** | Should match your previous setting |
| **Mahony KP** | May need adjustment (see below) |

---

## Mahony KP: What Changes

### Automatic Handling

Refloat handles IMU filtering differently than Float. When migrating:

- If your old Mahony KP was **> 1.0**, Refloat may auto-adjust it
- New defaults are typically: **KP = 0.4**, **KI = 0**, **Decay = 0.1**

### Why This Matters

The Mahony filter in Refloat uses separate values for pitch and roll:
- `mahony_kp` - Pitch axis filter (affects response to forward/back tilt)
- `mahony_kp_roll` - Roll axis filter (affects response to side lean)

### Manual Adjustment

If your board feels different after migration:

1. Start with defaults (KP = 0.4 for pitch)
2. Increase KP for faster response (but may feel twitchy)
3. Decrease KP for smoother, more filtered feel
4. Roll KP too low can cause unwanted effects during rotations

---

## LED Configuration After Migration

### Common Issue: LEDs Stay On or Don't Work

When migrating from Float, LED settings may not transfer correctly.

### LED Type Options

| Type | Description | When to Use |
|------|-------------|-------------|
| **None** | LEDs disabled | No LEDs or external control |
| **WS2812 (GRB)** | Common addressable LEDs | WS2811, WS2812b, SK2812 |
| **SK6812 (GRBW)** | RGBW LEDs with white | SK6812 with white channel |
| **External** | External LCM control | Using external LED controller |

### Fix: "LEDs Stay On with Type NONE"

If LEDs stay on after setting type to NONE:

1. Check if you have an LCM (LED Controller Module)
2. If yes, set LED Type to **External**
3. If no LCM, power cycle the board after changing settings

### LED Color Order

Refloat supports:
- **GRB**: WS2811, WS2812b, SK2812
- **GRBW**: SK6812 (with white channel)

If colors look wrong, you may have the wrong order selected.

---

## Voltage Thresholds (6.02 vs 6.05+)

### On Firmware 6.05+

- Tiltback voltages are **per-cell values**
- No manual adjustment needed after install
- Package reads battery cells from motor config

### On Firmware 6.02

You must manually set voltage thresholds:

1. Go to **Refloat Cfg** → **Specs** tab
2. Set **Low Tiltback Voltage** (e.g., 3.2V × cells)
3. Set **High Tiltback Voltage** (e.g., 4.2V × cells)

---

## Troubleshooting Migration Issues

### Config Restore Failed

If automatic restore fails:

1. Restore manually from your XML backup
2. Check VESC Tool version matches firmware
3. Report the issue to developers

### Settings Don't Match

Some settings may have changed names or behavior:

| Old Float Setting | Refloat Equivalent | Notes |
|-------------------|-------------------|-------|
| ATR Strength | ATR Strength Up/Down | Now separate values |
| Tiltback Voltage | Tiltback HV/LV (per-cell) | Automatic on 6.05+ |

### Board Feels Different

After migration, if the ride feels different:

1. Check Mahony KP values (may have been auto-adjusted)
2. Verify loop frequency (hertz) matches previous
3. Check PID values (kp, ki, kp2)
4. Give yourself time to adjust - Refloat may feel different

---

## Resources

- [Initial Board Setup Guide (pev.dev)](https://pev.dev/t/initial-board-setup-in-vesc-tool/2190)
- [Refloat 1.2 Release Notes (pev.dev)](https://pev.dev/t/refloat-version-1-2/2795)
- [Refloat GitHub Releases](https://github.com/lukash/refloat/releases)

---

## Quick Reference Card

```
MIGRATION CHECKLIST:
□ Backup current config (Start Page → Backup Configs)
□ Update firmware to 6.05+ (recommended)
□ Install Refloat from Package Store
□ Confirm automatic config restore dialog
□ Verify LED type setting
□ Check Mahony KP if board feels different
□ Set voltage thresholds if on 6.02
□ Test ride in safe area
```

---

*Content verified against refloat source code | Ready for embedding*
