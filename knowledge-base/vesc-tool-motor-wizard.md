# VESC Tool Motor Setup Wizard Walkthrough

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-13
**Source:** `vesc_tool/mobile/SetupWizardFoc.qml`, `vesc_tool/widgets/detectallfocdialog.cpp`
**Addresses:** Common user need - first-time setup

---

## Overview

The Motor Setup Wizard guides you through configuring your VESC for the first time. It handles motor detection, battery configuration, and application-specific settings.

---

## Before You Start

### Prerequisites

1. **Connection established** - USB, Bluetooth, or WiFi
2. **Battery connected** - Fully charged recommended
3. **Motor connected** - All 3 phase wires
4. **Motor can spin freely** - No load attached

### What You'll Configure

- Motor type and detection
- Battery cells and type
- Wheel/gear setup
- Current limits
- Application-specific settings

---

## Step 1: Select Usage Type

The wizard asks how you'll use your VESC:

| Usage Type | Description | Settings Applied |
|------------|-------------|------------------|
| **Generic** | Default settings | duty_start: 1.0, fault_stop: 500ms |
| **E-Skate** | Electric skateboard | duty_start: 0.85, HFI start enabled, fault_stop: 50ms |
| **Balance** | Onewheel/EUC | duty_start: 1.0, BMS limit disabled, fault_stop: 50ms |
| **Propeller** | Drone/boat | duty_start: 1.0, fault_stop: 500ms |

### For Onewheel/PEV Builds

**Select "Balance"** - This:
- Disables BMS limit mode (allows full current)
- Sets fast fault stop time (50ms)
- Optimizes for balance control

---

## Step 2: Load Defaults

The wizard will ask if you want to load default motor settings.

**Recommended: Click "Yes"**

This ensures a clean starting point. Your motor detection will overwrite the relevant values.

---

## Step 3: Battery Configuration

### Battery Type

| Type | Description |
|------|-------------|
| **LiFePO4** | Lithium iron phosphate (safer, lower voltage) |
| **Li-ion** | Standard lithium-ion (most common) |
| **LiPo** | Lithium polymer (high discharge) |

### Battery Cells

Enter the number of cells in series:
- **10S** = 10 cells, ~42V max
- **12S** = 12 cells, ~50.4V max
- **14S** = 14 cells, ~58.8V max

### Battery Capacity (Ah)

Enter your battery's amp-hour rating for:
- Accurate range estimation
- Watt-hour tracking

---

## Step 4: Motor Detection

**This is the most important step.**

### Detection Process

1. Click **"Detect FOC"** or **"Run Detection"**
2. Motor will:
   - Measure resistance (R)
   - Measure inductance (L)
   - Spin up to measure flux linkage (λ)
3. Wait for completion (10-30 seconds)

### Detection Parameters

| Parameter | Default | When to Change |
|-----------|---------|----------------|
| Detection Current | 5A | Increase for larger motors |
| Min ERPM | 150-300 | Lower if motor struggles |
| Duty | 0.1 | Rarely needs change |

### What Gets Set

After successful detection:
- **R** (resistance): ~5-200 mΩ typical
- **L** (inductance): ~1-100 µH typical
- **λ** (flux linkage): Motor-specific
- **Observer gain**: Calculated from λ
- **Current controller KP/KI**: Calculated from R/L

---

## Step 5: Hall Sensor Setup (If Applicable)

If your motor has Hall sensors:

1. Go to **Hall Sensor** tab
2. Click **"Detect Hall Table"**
3. Motor will spin slowly
4. Verify table shows values 1-6

### Hall Sensor Troubleshooting

- **Error 255**: Check 5V power to sensors
- **Inconsistent values**: Check wiring order
- **All same value**: Sensor not working

---

## Step 6: Wheel/Gear Configuration

For vehicles with wheels:

### Wheel Diameter

- Measure in **millimeters**
- Include tire if inflated
- Affects speed/distance calculations

### Motor Poles

- Count **magnet poles** inside motor
- Common values: 14, 20, 28
- Wrong value = wrong speed readings

### Gear Ratio

If using gears/belt:
- Enter **motor pulley** / **wheel pulley** ratio
- Direct drive = 1:1

---

## Step 7: Current Limits

### Motor Current

| Setting | Description |
|---------|-------------|
| **Max Motor Current** | Peak current for acceleration |
| **Min Motor Current** | Brake/regen current (negative) |
| **Max Battery Current** | Total input current limit |
| **Min Battery Current** | Regen charging limit |

### For Balance Applications

Typical settings:
- Motor current: 30-60A (depends on motor)
- Battery current: 20-40A
- Keep symmetric for equal acceleration/braking

---

## Step 8: Write Configuration

**Critical: Always write after changes!**

1. Click **"Write Motor Configuration"**
2. Wait for confirmation
3. Configuration is now saved to VESC

### Writing to Multiple VESCs

If you have multiple VESCs (dual motor):
1. Detection runs on all connected VESCs
2. Configuration writes to all
3. Verify each VESC ID is unique

---

## Common Wizard Problems

### "Not Connected"

- Check USB/BLE/WiFi connection
- Reconnect in VESC Tool

### Detection Fails

- See Motor Detection Troubleshooting guide
- Remove load from motor
- Increase detection current

### Wrong Values Detected

- Re-run detection
- Ensure motor can spin freely
- Check for broken wires

### Configuration Won't Write

- Check connection is stable
- Try power cycling VESC
- Reduce baud rate for serial

---

## After the Wizard

### Test Motor Direction

1. Go to **FOC** → **General**
2. Use arrow keys to test motor
3. If wrong direction, invert motor settings

### Verify Speed Readings

1. Go to **RT Data**
2. Spin motor by hand
3. Check ERPM matches rotation direction

### Set Up Application

1. Go to **App Settings**
2. Configure PPM/ADC/UART as needed
3. Write app configuration

---

## Quick Reference

```
WIZARD STEPS:
1. Select usage type (Balance for PEV)
2. Load defaults (Yes)
3. Battery cells and type
4. Run motor detection
5. Hall sensors (if present)
6. Wheel diameter, poles
7. Current limits
8. Write configuration
```

---

*Content verified against vesc_tool source code | Ready for embedding*
