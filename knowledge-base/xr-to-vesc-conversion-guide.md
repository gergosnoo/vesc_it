# Onewheel XR to VESC Conversion Guide

## Overview

**Key Terms:** Onewheel XR, VESC conversion, Little FOCer, UBOX, Hypercore motor, Superflux motor, XRV, Float package, Refloat package, BMS bypass, OWIE, FM BMS, PEV, onewheel DIY, motor detection, hall sensor

This comprehensive guide covers converting a Onewheel XR (or Pint/GT) to use a VESC motor controller, unlocking higher power, better tunability, and open-source firmware.

**Sources:** pev.dev community guides, refloat/ package, bldc/ firmware

---

## Why Convert to VESC?

### Benefits Over Stock Controller

| Aspect | Stock FM | VESC |
|--------|----------|------|
| Power | Limited (750W rated) | 3-8kW depending on controller |
| Speed | Software-limited | Configurable |
| Tunability | None | Hundreds of parameters |
| Firmware | Closed source | Open source |
| Pushback | Aggressive | Fully customizable |
| Diagnostics | Basic app | Full telemetry |
| Repair | FM parts only | Community parts |

### Common Reasons to Convert

1. **More power** - Stock XR feels underpowered for heavier riders
2. **No nosedive** - Better safety margins, configurable tiltback
3. **Custom ride feel** - Tune exactly how you want
4. **Repair costs** - FM repairs expensive, VESC parts available
5. **Upgrades** - Bigger battery, better motor options

---

## Hardware Requirements

### VESC Controllers (Recommended)

#### Little FOCer (Community Favorite)

| Spec | V3.1 | V4.0 |
|------|------|------|
| Voltage | 15-84V (up to 20S) | 15-84V (up to 20S) |
| Battery Current | 100A | 100A |
| Motor Current | 250A peak | 250A peak |
| Gate Driver | DRV8301 | DRV8323S |
| IMU | Integrated | Integrated |
| Price | ~$200-250 | ~$250-300 |

**Best for:** Most builds, excellent community support

#### UBOX (Budget Option)

| Spec | 80V | 100V |
|------|-----|------|
| Voltage | Up to 80V | Up to 100V |
| Current | 100A | 100A |
| IMU | External required | External required |
| Price | ~$100-150 | ~$150-180 |

**Note:** UBOX requires 4.7kΩ pulldown resistors on footpad zones (3.3V logic).

**Best for:** Budget builds, experienced builders

#### Tronic 250R

- 15-84V, 100A battery, 250A peak motor
- Described as "Little FOCer on steroids"
- Premium option for maximum power

### Motor Options

| Motor | Diameter | Power | Best For |
|-------|----------|-------|----------|
| Hypercore (Stock) | 6" | ~1.5kW | Budget, stock feel |
| Superflux MK1/MK2 | 6" | 3-4kW | Power upgrade |
| CannonCore | 6" | 3kW | Torque-focused |
| Lencore | 6" | 4kW, 80Nm | European builds |

### Battery Configurations

| Config | Voltage | Range | Notes |
|--------|---------|-------|-------|
| 15S (Stock XR) | 54V nominal | Stock | Reuse existing |
| 16S | 57.6V | +7% | Minor upgrade |
| 18S | 64.8V | +15% | Popular upgrade |
| 20S | 72V | +25% | Maximum power |

**Popular cells:** Molicel P42A, Samsung 40T

---

## Motor Detection Settings

### Wizard Settings

1. **Motor Settings → FOC → General**
2. Set motor type: **Large Outrunner**
3. Motor poles: **30** (standard for Onewheel motors)

### Detection Parameters

| Parameter | Recommended Value |
|-----------|------------------|
| Detection Current | 10-15A |
| Min ERPM | 150 |
| Detection Duty | 0.1 (10%) |
| Sensorless ERPM | 2,000 |
| Hall Interpolation ERPM | **200-250** (NOT 500!) |

### Post-Detection Adjustments (CRITICAL)

After motor detection, you MUST adjust these values:

| Parameter | Action | Why |
|-----------|--------|-----|
| **Observer Gain** | Reduce to **HALF** of detected | Prevents oscillation |
| **Motor Resistance** | Increase by **20-25%** | Temperature compensation |
| **Zero Vector Frequency** | Set to **25-30 kHz** | Quieter operation |

### Superflux MK1 Reference Values

| Parameter | Average | Range |
|-----------|---------|-------|
| Resistance | 29.75mΩ | 27-33mΩ |
| Inductance | 108.96µH | 107-113µH |
| Flux Linkage | 24.09mWb | 23.6-24.7mWb |
| Observer Gain | 0.88 | 0.75-0.90 (HALF of detected!) |

### Current Limits

| Motor Type | Motor Max | Motor Brake | Battery Max | Battery Regen |
|------------|-----------|-------------|-------------|---------------|
| Hypercore | 120A | -100A | 45A | -25A |
| Superflux | 160-180A | -150A | 45-50A | -30A |
| CannonCore | 160-180A | -150A | 45-50A | -30A |

---

## Wiring Guide

### XR Hall Sensor Pinout

```
FM Motor Connector (6-pin):
Pin 1: Hall A
Pin 2: Hall B
Pin 3: GND
Pin 4: 5V
Pin 5: Temperature
Pin 6: Hall C
```

### VESC Hall Sensor Connection

```
VESC JST-PH 6-pin (left to right):
5V | Temp | H3 | H2 | H1 | GND
```

**Tip:** Hall order (H1/H2/H3) doesn't need to match - if motor runs backward, swap any two phase wires.

### Motor Phase Wires

- 6-pin Molex connector (3 phases doubled)
- Blue, Yellow, Green (×2 each)
- Swap any two if motor direction wrong

### Footpad Sensor

| Controller | Voltage | Notes |
|------------|---------|-------|
| Little FOCer | 3.3V native | Direct connection |
| UBOX | 3.3V | Requires 4.7kΩ pulldown per zone |

**Sensor Options:** Exile sensors, Stoked Stock, Matrix Sensor Array

---

## BMS Options

### Option 1: FM BMS (Charge-Only)

Reuse stock BMS for charging, bypass for discharge.

**Wiring:**
1. BMS monitors cells during charge
2. VESC controls discharge (no BMS protection while riding)
3. Add OWIE chip for cell monitoring

**Warning:** This disables discharge protection. VESC settings must prevent over-discharge.

### Option 2: OWIE Chip Integration

- ESP8266 WiFi module
- Reads FM BMS cell voltages
- Creates "Owie-xxx" WiFi network
- Active during charging only

**Benefits:** Cell-level monitoring, no BMS replacement needed

### Option 3: Aftermarket BMS (ENNOID XLITE)

| Feature | Value |
|---------|-------|
| Cell Support | 13S to 24S |
| VESC Integration | CAN bus native |
| Monitoring | Per-cell voltage, temp |
| Discharge Mode | Onewheel-specific |

**Best for:** New battery builds, maximum safety

---

## Balance Package Selection

### Float Package (Legacy)

- Original balance package
- Stable, well-tested
- Single Mahony KP value
- Limited development

### Refloat Package (Recommended)

| Feature | Float | Refloat |
|---------|-------|---------|
| Mahony KP | Single value | Per-axis (Pitch/Roll/Yaw) |
| Default KP | 0.2 | 0.4 |
| LED Support | ~10 FPS | 30 FPS, animations |
| Haptic | Basic | Advanced patterns |
| Development | Paused | Active |

**Migration:** Refloat 100% compatible with Float 1.3 tunes

### Installation

1. VESC Tool → Package Store
2. Search "Refloat" (or "Float")
3. Install to VESC
4. Configure via App Settings

---

## Common Conversion Pitfalls

### 1. Wrong Hall Interpolation ERPM

**Problem:** Motor stutters at low speed
**Solution:** Set to 200-250, not default 500

### 2. Skipping Observer Gain Adjustment

**Problem:** Motor oscillates or shakes
**Solution:** Reduce observer gain to HALF of detected value

### 3. UBOX Footpad Issues

**Problem:** Footpad zones don't trigger reliably
**Solution:** Add 4.7kΩ pulldown resistors to each zone

### 4. Wrong Motor Current Limits

**Problem:** Weak performance or thermal shutdowns
**Solution:** Match limits to your motor type (see table above)

### 5. BMS Misconfiguration

**Problem:** Board cuts out during ride
**Solution:** Ensure VESC voltage limits match battery, configure low-voltage cutoff

---

## Pre-Conversion Checklist

```
□ VESC controller selected (Little FOCer, UBOX, etc.)
□ Motor compatible (Hypercore, Superflux, etc.)
□ Battery plan (reuse XR 15S or upgrade)
□ BMS strategy (FM charge-only, OWIE, or aftermarket)
□ Footpad sensors (stock or upgrade)
□ Enclosure (Floatboxx or 3D printed)
□ Wiring supplies (JST connectors, XT60, etc.)
□ VESC Tool installed
□ Balance package selected (Refloat recommended)
```

---

## Quick Reference

### Recommended Starting Config

| Parameter | Value |
|-----------|-------|
| VESC | Little FOCer V3.1+ |
| Motor | Stock Hypercore or Superflux |
| Battery | Stock 15S or 18S upgrade |
| BMS | FM charge-only + OWIE |
| Package | Refloat |
| Hall Interp ERPM | 200 |
| Observer Gain | 0.75-0.90 |

### Essential Links

- pev.dev/t/xr-to-vesc-a-onewheel-conversion-guide
- pev.dev/t/superflux-mk1-reference-motor-setup-values
- pev.dev/t/motor-wizard-guide
- github.com/lukash/refloat

---

## References

- Source: `bldc/motor/mcpwm_foc.c` - FOC motor control
- Source: `refloat/` - Balance package implementation
- Related: `motor-detection-troubleshooting.md` - Detection issues
- Related: `refloat-migration-guide.md` - Float to Refloat
- Related: `vesc-hardware-compatibility-guide.md` - Controller specs

---

*Last updated: 2026-01-14 | Community-verified guide*
