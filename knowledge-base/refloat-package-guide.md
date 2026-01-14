# Refloat Package Guide

## Overview

**Key Terms:** Refloat, Float package, VESC balance package, Refloat vs Float, Refloat installation, Refloat migration, Refloat haptic feedback

Refloat is a community-developed VESC package for self-balancing boards, representing a modernized refactor of the original Float package. It was announced in March 2024 by riddimrider and has become the preferred package for DIY Onewheel builders.

**Source:** pev.dev community (8,765+ views)

---

## Why Refloat Over Float?

| Feature | Float | Refloat |
|---------|-------|---------|
| Mahony KP | Single value | Multi-axis (Pitch, Roll, Yaw) |
| LED System | Basic | Advanced (30 FPS, animations) |
| Haptic Feedback | Limited | Extensive configuration |
| Development | Stable/Legacy | Active development |
| UI | Original | Completely redesigned |

---

## Key Features

### 1. Mahony KP Separation

Refloat distinguishes between firmware-level and package-level configuration:

- **Firmware (App Config):** Uses "true pitch" with KP = 0.4
- **Package Settings:** Maintains separate KP values

**Migration Note:** When migrating from Float, values exceeding 1.0 trigger automatic adjustment to recommended parameters.

### 2. Multi-Axis Control

Instead of a single Mahony KP setting, Refloat introduces independent parameters:

| Parameter | Purpose | Tuning Tip |
|-----------|---------|------------|
| Pitch KP | Forward/back balance | Higher = more responsive |
| Roll KP | Side-to-side stability | Lower = smoother carving |
| Yaw KP | Rotation handling | Affects turn feel |

**Pro Tip:** Lower Roll KP values improve nose stability during carving maneuvers.

### 3. Advanced LED System

- Front/rear/status strip configuration
- Customizable animations
- 30 FPS refresh rate
- ~1% CPU usage

### 4. Haptic Feedback (v1.1+)

Experimental haptic system with extensive customization:

- Multiple buzz patterns from Float 2.0
- Audible vs vibrating feedback options
- Configurable frequencies
- Alternating or simultaneous tones

**Known Issue:** Certain frequencies can interfere with IMU sensor readings.

---

## Installation

### Fresh Install

1. Download Refloat from GitHub releases
2. Open VESC Tool
3. Navigate to VESC Packages tab
4. Click "Update Archive"
5. Install Refloat package
6. Disconnect and reconnect for UI updates

### Migration from Float

1. **Export XML Configuration:**
   ```
   VESC Tool > Motor Settings > Save to XML
   VESC Tool > App Settings > Save to XML
   VESC Tool > Float Cfg > Save to XML
   ```

2. **Install Refloat** (replaces Float package)

3. **Restore Configuration:**
   - Motor and App XMLs restore directly
   - Float settings migrate automatically with adjustments

**Important:** Some settings (especially Mahony KP values >1.0) will be auto-adjusted during migration.

---

## Configuration Location

All Refloat settings are found in:
```
VESC Tool > App Settings > Refloat Cfg
```

Or in the dedicated Refloat tab on the main screen.

---

## Refloat vs Float Settings Comparison

### Tiltback Settings (Same Location)

| Setting | Float Location | Refloat Location |
|---------|----------------|------------------|
| Duty Tiltback | Float Cfg → Tiltback | Refloat Cfg → Tiltback |
| Speed Tiltback | Float Cfg → Tiltback | Refloat Cfg → Tiltback |
| Surge | Float Cfg → Surge | Refloat Cfg → Surge |

### New Refloat-Only Settings

| Setting | Location | Purpose |
|---------|----------|---------|
| Pitch KP | Refloat Cfg → IMU | Forward balance responsiveness |
| Roll KP | Refloat Cfg → IMU | Carving stability |
| Yaw KP | Refloat Cfg → IMU | Turn handling |
| Haptic Buzz | Refloat Cfg → Haptic | Vibration feedback |

---

## Development Roadmap

Planned features for Refloat:

- Configurable quick-access buttons
- Multi-configuration management (multiple tunes)
- Automatic gyro calibration
- Expanded LED animations
- Protocol Buffer standardization for package communication

---

## Troubleshooting

### Issue: Board feels different after migration

**Cause:** Mahony KP values adjusted during migration

**Fix:**
1. Note your old Float KP value
2. Adjust Refloat Pitch KP to match feel
3. Fine-tune Roll KP for carving preference

### Issue: Haptic feedback affects balance

**Cause:** Frequency interference with IMU

**Fix:**
1. Try different frequency settings
2. Reduce haptic strength
3. Use audible mode instead of vibration

### Issue: LEDs not working

**Cause:** LED configuration not enabled

**Fix:**
1. Enable LED system in Refloat Cfg
2. Configure LED strip type (WS2812, etc.)
3. Set LED count for each position

---

## Community Resources

- **GitHub:** github.com/r3eckon/refloat (releases and issues)
- **pev.dev:** Primary discussion forum
- **Discord:** VESC and Onewheel builder communities

---

## References

- Source: pev.dev/t/refloat-a-new-vesc-package/1505 (8,765 views)
- Source: pev.dev/t/refloat-v1-1-feature-preview-haptic-feedback/2019
- Related: `nosedive-prevention-checklist.md` - Safety settings
- Related: `safety-critical-settings.md` - Tiltback configuration

---

*Last updated: 2026-01-14 | Source: pev.dev community content*
