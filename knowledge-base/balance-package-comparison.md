# Balance Package Comparison: Float vs Refloat vs Balance

## Overview

**Key Terms:** Float package, Refloat package, Balance package, VESC package, self-balancing, Onewheel, which package, Float vs Refloat, package migration

This guide compares the three main self-balancing packages for VESC: Float, Refloat, and Balance.

---

## Quick Comparison

| Feature | Float | Refloat | Balance |
|---------|-------|---------|---------|
| Status | Legacy (stable) | Active development | Built-in (basic) |
| Best For | Proven setups | New builds, features | Simple testing |
| Haptic Feedback | Basic | Advanced | None |
| LED Support | Basic | Advanced (30 FPS) | None |
| Multi-axis IMU | Single KP | Pitch/Roll/Yaw KP | Basic |
| Community | Large | Growing | Minimal |
| Documentation | Extensive | Good | Limited |

---

## Float Package

### Overview

Float is the original self-balancing package, developed by surfdado. It's mature, well-documented, and has the largest community.

### Pros

- ✅ **Proven reliability** - Years of real-world use
- ✅ **Extensive documentation** - Guides, videos, forums
- ✅ **Large community** - Easy to find help
- ✅ **Stable codebase** - Fewer bugs
- ✅ **Known tuning recipes** - Community presets available

### Cons

- ❌ **Limited development** - Few new features
- ❌ **Single Mahony KP** - Less tuning flexibility
- ❌ **Basic LED support** - Simple patterns only
- ❌ **Legacy codebase** - Harder to modify

### Best For

- Users who want stability over features
- Existing builds with working Float configs
- Riders who prefer "set and forget"

---

## Refloat Package

### Overview

Refloat is a modernized fork of Float, developed by riddimrider. It focuses on improved architecture, new features, and active development.

### Pros

- ✅ **Active development** - Regular updates
- ✅ **Multi-axis Mahony KP** - Separate Pitch/Roll/Yaw
- ✅ **Advanced haptic feedback** - Customizable buzz patterns
- ✅ **Advanced LED system** - 30 FPS, animations
- ✅ **Cleaner codebase** - Easier to extend
- ✅ **Better UI** - Redesigned configuration screens

### Cons

- ❌ **Newer = less tested** - More potential bugs
- ❌ **Smaller community** - Less help available
- ❌ **Migration required** - Settings may change
- ❌ **Documentation catching up** - Still being written

### Key Differences from Float

| Feature | Float | Refloat |
|---------|-------|---------|
| Mahony KP | Single value | Pitch, Roll, Yaw separate |
| LED refresh | ~10 FPS | 30 FPS |
| Haptic buzz | On/Off | Configurable patterns |
| Config UI | Original | Redesigned |

### Best For

- New builds starting fresh
- Users wanting latest features
- Riders who like to tinker/customize
- Those with LCM or LED setups

---

## Balance Package (Built-in)

### Overview

Balance is the basic self-balancing implementation included in VESC firmware. It's minimal but functional.

### Pros

- ✅ **Always available** - Built into firmware
- ✅ **Simple** - Easy to understand
- ✅ **No external package** - Less to install
- ✅ **Good for testing** - Verify hardware works

### Cons

- ❌ **Very basic** - Minimal features
- ❌ **No haptic feedback** - No warnings
- ❌ **No LED support** - No light control
- ❌ **Limited tuning** - Few parameters
- ❌ **No community support** - You're on your own

### Best For

- Initial hardware testing
- Simple projects
- Learning how self-balancing works
- When Float/Refloat won't install

---

## Feature Comparison Table

| Feature | Balance | Float | Refloat |
|---------|---------|-------|---------|
| **Basic Balance** | ✅ | ✅ | ✅ |
| **Tiltback (Speed)** | Basic | ✅ | ✅ |
| **Tiltback (Duty)** | Basic | ✅ | ✅ |
| **Tiltback (Voltage)** | ❌ | ✅ | ✅ |
| **Surge Protection** | ❌ | ✅ | ✅ |
| **ATR (Torque Response)** | ❌ | ✅ | ✅ |
| **Turn Tiltback** | ❌ | ✅ | ✅ |
| **Haptic Feedback** | ❌ | Basic | Advanced |
| **LED Control** | ❌ | Basic | Advanced |
| **Multi-axis IMU** | ❌ | ❌ | ✅ |
| **Remote Tilt** | ❌ | ✅ | ✅ |
| **Dirty Landings** | ❌ | ✅ | ✅ |
| **Konami Codes** | ❌ | ❌ | ✅ |

---

## When to Use Which

### Use Float When:

- You have a working Float setup
- You prioritize stability over features
- You're following an older build guide
- Community support is important to you

### Use Refloat When:

- Starting a new build
- You want multi-axis Mahony tuning
- You need advanced haptic/LED features
- You're comfortable with newer software

### Use Balance When:

- Testing if your hardware works
- Float/Refloat won't install
- Building a simple proof-of-concept
- Learning VESC self-balancing basics

---

## Migration: Float to Refloat

### Before Migration

1. **Backup everything:**
   ```
   VESC Tool → Backup Configs
   Export Motor XML
   Export App XML
   Export Float XML (screenshot values)
   ```

2. **Note critical values:**
   - Mahony KP
   - All tiltback settings
   - LED configuration
   - Surge settings

### Migration Process

1. Install Refloat from Package Store
2. Refloat offers to restore Float config
3. Accept automatic migration
4. **Verify these settings manually:**
   - LED type (may need adjustment)
   - Voltage thresholds
   - Mahony KP values (>1.0 get adjusted)

### After Migration

1. Hand test first (verify balance works)
2. Short test ride in safe area
3. Fine-tune Mahony KP if feel is different:
   - Separate Pitch KP and Roll KP
   - Lower Roll KP = stiffer turns

### Settings That Change

| Float | Refloat | Notes |
|-------|---------|-------|
| mahony_kp | mahony_kp + mahony_kp_roll | Split into two |
| LED type | LED type | May need reset |
| Voltage thresholds | Auto-calculated on 6.05+ | Verify correct |

---

## Recommended Choice

### For New DIY Onewheel Build (2024+)

**Use Refloat**
- Latest features
- Active development
- Best haptic feedback
- Superior LED support

### For Existing Float Build

**Stay on Float** unless you need:
- Multi-axis Mahony tuning
- Advanced haptic patterns
- Better LED animations

### For Quick Hardware Test

**Use Balance**
- Verify motor spins
- Verify IMU works
- Then install Float/Refloat

---

## Package Installation

### Installing Float

1. VESC Tool → VESC Packages
2. Click "Update Archive"
3. Find "Float" in list
4. Click Install
5. Reconnect to VESC

### Installing Refloat

1. VESC Tool → VESC Packages
2. Click "Update Archive"
3. Find "Refloat" in list
4. Click Install
5. Reconnect to VESC

### Switching Between Packages

Packages replace each other - you can only have one balance package installed. To switch:

1. Install new package (old one is replaced)
2. Reconfigure settings
3. Settings don't transfer between packages

---

## References

- Source: github.com/vedderb/vesc_pkg - Float package
- Source: github.com/r3eckon/refloat - Refloat package
- Related: `refloat-package-guide.md` - Refloat features
- Related: `refloat-migration-guide.md` - Detailed migration
- Related: `safety-critical-settings.md` - Tiltback settings

---

*Last updated: 2026-01-14 | Community-verified information*
