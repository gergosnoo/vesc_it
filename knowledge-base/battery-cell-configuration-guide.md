# Battery Cell Configuration Guide

## Overview

**Key Terms:** battery configuration, series, parallel, cell count, BMS, voltage cutoff, 12S, 16S, 20S, battery limits, cell voltage, pack voltage, battery calculator

This guide explains battery configurations, how to match BMS settings, and calculate correct voltage cutoffs for any pack.

**Source:** bldc firmware - datatypes.h, mc_interface.c; community best practices

---

## Battery Basics

### Series vs Parallel

Batteries are configured in **series (S)** and **parallel (P)**:

```
Series (S): Increases VOLTAGE
Cell 1 ─┬─ Cell 2 ─┬─ Cell 3 = 3S
        ↓          ↓
     3.7V      + 3.7V    + 3.7V = 11.1V total

Parallel (P): Increases CAPACITY
Cell 1 ═╦═ Cell 2 ═╦═ Cell 3 = 3P
        ║          ║
    3000mAh + 3000mAh + 3000mAh = 9000mAh total
```

### Common Configurations

| Config | Cells | Nominal V | Max V | Common Use |
|--------|-------|-----------|-------|------------|
| 10S | 10 | 37.0V | 42.0V | Light EVs |
| 12S | 12 | 44.4V | 50.4V | ESK8, E-bikes |
| 13S | 13 | 48.1V | 54.6V | E-bikes (48V) |
| 15S | 15 | 55.5V | 63.0V | Onewheel XR |
| 16S | 16 | 59.2V | 67.2V | DIY Onewheel |
| 20S | 20 | 74.0V | 84.0V | High-power builds |
| 24S | 24 | 88.8V | 100.8V | Extreme builds |

### Reading Battery Notation

**Example: 20S4P**
- **20S** = 20 cells in series = 74V nominal
- **4P** = 4 parallel groups = 4× capacity

**Voltage:** Determined by S count
**Capacity:** Determined by P count
**Max Current:** Determined by P count × cell rating

---

## Cell Voltage Reference

### Lithium-Ion (Li-ion) / Lithium-Polymer (LiPo)

| State | Voltage/Cell | Notes |
|-------|--------------|-------|
| Full charge | 4.20V | Maximum safe |
| Nominal | 3.70V | Average/rated |
| Storage | 3.80V | Long-term storage |
| Low | 3.20V | Start limiting power |
| Empty | 3.00V | Minimum safe |
| Danger | <2.50V | Cell damage risk |

### LiFePO4 (LFP)

| State | Voltage/Cell | Notes |
|-------|--------------|-------|
| Full charge | 3.65V | Maximum |
| Nominal | 3.20V | Average |
| Empty | 2.50V | Minimum safe |

**Note:** LiFePO4 has flatter discharge curve but lower energy density.

---

## Calculating Voltage Cutoffs

### The Formula

```
Pack Voltage = Cell Voltage × Series Count (S)

Examples:
Low cutoff start = 3.2V × 20S = 64.0V
Low cutoff end = 3.0V × 20S = 60.0V
High cutoff = 4.2V × 20S = 84.0V
```

### VESC Cutoff Settings

**Location:** Motor Settings → General → Voltage

| Parameter | Formula | Purpose |
|-----------|---------|---------|
| Battery Cutoff Start | 3.2V × S | Begin limiting current |
| Battery Cutoff End | 3.0V × S | Hard stop (protect cells) |
| Max Input Voltage | 4.3V × S | Over-voltage protection |

### Cutoff Calculator

| Cells | Cutoff Start (3.2V) | Cutoff End (3.0V) | Max (4.2V) |
|-------|---------------------|-------------------|------------|
| 10S | 32.0V | 30.0V | 42.0V |
| 12S | 38.4V | 36.0V | 50.4V |
| 13S | 41.6V | 39.0V | 54.6V |
| 15S | 48.0V | 45.0V | 63.0V |
| 16S | 51.2V | 48.0V | 67.2V |
| 20S | 64.0V | 60.0V | 84.0V |
| 24S | 76.8V | 72.0V | 100.8V |

---

## Matching BMS to Pack

### What BMS Does

BMS (Battery Management System) provides:
1. **Cell balancing** - Equalizes cell voltages
2. **Over-charge protection** - Stops charging at max voltage
3. **Over-discharge protection** - Cuts off at low voltage
4. **Over-current protection** - Limits discharge current
5. **Temperature protection** - Monitors cell temps

### BMS Selection Criteria

| Factor | How to Match |
|--------|--------------|
| Cell count | BMS must match S count exactly |
| Max current | BMS rating ≥ peak discharge |
| Balance current | Higher = faster balancing |
| Protocol | Smart BMS can communicate with VESC |

### Common BMS Configurations

| Battery | BMS Required | Notes |
|---------|--------------|-------|
| 10S | 10S BMS | ~36V systems |
| 12S | 12S BMS | Standard ESK8 |
| 15S | 15S BMS | Onewheel XR stock |
| 16S | 16S BMS | DIY Onewheel common |
| 20S | 20S BMS | High-voltage builds |

**Warning:** Never use wrong S-count BMS - will not balance correctly!

---

## VESC Battery Current Settings

### Motor vs Battery Current

| Parameter | Purpose | Typical Values |
|-----------|---------|----------------|
| Motor Current Max | Current through motor phases | 60-150A |
| Battery Current Max | Current from battery | 30-60A |
| Battery Current Min | Regen current to battery | -15 to -30A |

**Why different?** At low speeds, motor can draw high current while battery current stays reasonable (duty cycle effect).

### Calculating Safe Battery Current

```
Safe Battery Current = Pack P × Cell Continuous Rating

Example: 20S4P with 10A cells
Max continuous = 4P × 10A = 40A
Set Battery Max = 35-40A (with headroom)
```

### Conservative vs Aggressive Settings

| Style | Battery Max | Notes |
|-------|-------------|-------|
| Conservative | 0.8× cell rating × P | Maximum lifespan |
| Balanced | 1.0× cell rating × P | Normal use |
| Aggressive | 1.2× cell rating × P | Reduced lifespan |

---

## Regenerative Braking Limits

### Why Limit Regen?

Regenerative braking charges the battery. If battery is full:
- Voltage can exceed max (dangerous)
- BMS may cut off suddenly
- Risk of over-voltage fault

### Setting Regen Cutoff

**Location:** Motor Settings → General → Voltage → Battery Cutoff Start (Regen)

| Parameter | Formula | Purpose |
|-----------|---------|---------|
| Regen Cutoff Start | 4.1V × S | Begin limiting regen |
| Regen Cutoff End | 4.2V × S | Stop all regen |

### Example: 20S Pack

```
Regen Cutoff Start = 4.1V × 20 = 82.0V
Regen Cutoff End = 4.2V × 20 = 84.0V

Behavior:
- Below 82V: Full regen available
- 82-84V: Regen gradually reduced
- Above 84V: No regen (coast only)
```

---

## Common Battery Configurations

### Onewheel XR Stock (15S2P)

```
Cells: 30 (15S2P)
Nominal: 55.5V
Max: 63.0V
Capacity: ~324Wh

VESC Settings:
Cutoff Start: 48.0V (3.2V/cell)
Cutoff End: 45.0V (3.0V/cell)
Battery Max: 30A (limited by stock BMS)
```

### DIY Onewheel (20S2P)

```
Cells: 40 (20S2P)
Nominal: 74.0V
Max: 84.0V
Capacity: ~500Wh

VESC Settings:
Cutoff Start: 64.0V (3.2V/cell)
Cutoff End: 60.0V (3.0V/cell)
Battery Max: 40-50A (depends on cells)
```

### ESK8 Standard (12S4P)

```
Cells: 48 (12S4P)
Nominal: 44.4V
Max: 50.4V
Capacity: ~400Wh

VESC Settings:
Cutoff Start: 38.4V (3.2V/cell)
Cutoff End: 36.0V (3.0V/cell)
Battery Max: 40-60A (depends on cells)
```

---

## Troubleshooting

### Voltage Sag / Early Cutoff

**Symptoms:** Board loses power before battery is empty

**Causes:**
1. Cutoff set too high
2. Weak cells in pack
3. Battery current too high for cells

**Fix:**
1. Lower cutoff start by 0.1V/cell
2. Check cell balance
3. Reduce battery current limit

### Over-Voltage Faults (Regen)

**Symptoms:** Fault when braking on full battery

**Causes:**
1. Regen cutoff not set
2. Battery fully charged before ride
3. Long downhill regenerates too much

**Fix:**
1. Set regen cutoff start/end
2. Don't charge to 100% before downhill rides
3. Reduce regen current limit

### BMS Cutting Out

**Symptoms:** Sudden power loss, BMS trips

**Causes:**
1. Battery current exceeds BMS rating
2. Cell out of balance
3. Temperature too high

**Fix:**
1. Reduce battery current to BMS rating
2. Balance charge the pack
3. Check BMS temperature limits

---

## Quick Reference Card

### Voltage Formulas

```
Nominal Voltage = 3.7V × S
Max Voltage = 4.2V × S
Cutoff Start = 3.2V × S
Cutoff End = 3.0V × S
```

### Current Formula

```
Max Battery Current = Cell Rating × P
```

### Common Values

| Config | Nominal | Max | Cutoff Start | Cutoff End |
|--------|---------|-----|--------------|------------|
| 12S | 44.4V | 50.4V | 38.4V | 36.0V |
| 15S | 55.5V | 63.0V | 48.0V | 45.0V |
| 16S | 59.2V | 67.2V | 51.2V | 48.0V |
| 20S | 74.0V | 84.0V | 64.0V | 60.0V |

---

## References

- Source: `bldc/datatypes.h` - Voltage limit definitions
- Source: `bldc/motor/mc_interface.c` - Cutoff implementation
- Related: `vesc-beginner-settings-guide.md` - Current limits
- Related: `vesc-bms-configuration-guide.md` - BMS setup
- Related: `pintv-xrv-critical-settings.md` - Stock pack limits

---

*Last updated: 2026-01-14 | Community-verified values*
