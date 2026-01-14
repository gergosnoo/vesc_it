# BMS Cell Balancing Technical Guide

## Overview

**Key Terms:** cell balancing, passive balancing, BMS balancing, LTC6813, cell voltage drift, unbalanced cells, balance start, balance end, balance current, top balancing, bottom balancing

This technical guide explains how VESC BMS cell balancing works and how to troubleshoot balancing issues.

**Source:** `vesc_bms_fw/bms_if.c`, `vesc_bms_fw/drivers/ltc6813.c`

---

## How Cell Balancing Works

### The Problem

Lithium cells in a pack naturally drift apart over time:
- Manufacturing variations
- Temperature differences
- Self-discharge rates
- Charge/discharge cycles

**Without balancing:** Some cells hit limits before others, reducing capacity.

### VESC BMS Solution: Passive Balancing

**Source:** `vesc_bms_fw/bms_if.c:168`

The BMS uses **passive balancing** (discharge resistors) to equalize cells:

```
┌─────────────────────────────────────────────────────┐
│                  BALANCE THREAD                      │
│                                                      │
│  1. Read all cell voltages (LTC6813)                │
│  2. Find highest and lowest cell                    │
│  3. If difference > threshold:                       │
│     - Discharge cells above minimum voltage         │
│  4. Sleep and repeat                                │
└─────────────────────────────────────────────────────┘
```

### Hardware: LTC6813 Monitor IC

**Source:** `vesc_bms_fw/drivers/ltc6813.h:33-34`

```c
void ltc_set_dsc(int cell, bool set);  // Enable/disable discharge
bool ltc_get_dsc(int cell);            // Check discharge status
```

The LTC6813 chip:
- Monitors up to 18 cells per IC
- Built-in discharge switches (passive balancing)
- Temperature monitoring
- Precision voltage measurement (0.04% accuracy)

---

## Balancing Configuration

### Key Parameters

**Source:** `vesc_bms_fw/bms_if.c:250-258`

| Parameter | Description | Typical Value |
|-----------|-------------|---------------|
| `vc_balance_min` | Min cell voltage to start balancing | 3.3V |
| `vc_balance_start` | Voltage above min to enable discharge | +50mV |
| `vc_balance_end` | Hysteresis to stop discharge | +10mV |
| `balance_max_current` | Stop balancing above this current | 1.0A |
| `balance_mode` | When to balance (see modes) | 0-3 |

### Balance Modes

**Source:** `vesc_bms_fw/bms_if.c:189`

| Mode | Name | When Balancing Occurs |
|------|------|----------------------|
| 0 | Disabled | Never |
| 1 | Charging Only | When charger connected |
| 2 | Charging + Idle | Charger or low current |
| 3 | Always | Continuous (if conditions met) |

### Balancing Logic

**Source:** `vesc_bms_fw/bms_if.c:250-261`

```c
if (v_min > backup.config.vc_balance_min &&
    !is_balance_override &&
    fabsf(bms_if_get_i_in_ic()) < backup.config.balance_max_current) {
    // Balancing allowed
    for (int i = 0; i < HW_CELLS_SERIES; i++) {
        float limit = ltc_get_dsc(i) ?
            backup.config.vc_balance_end :
            backup.config.vc_balance_start;

        if (ltc_last_cell_voltage(i) >= limit) {
            ltc_set_dsc(i, true);  // Enable discharge
        }
    }
}
```

**Translation:**
1. All cells must be above `vc_balance_min`
2. Current must be below `balance_max_current`
3. Cells above start threshold get discharged
4. Discharge stops at end threshold (hysteresis)

---

## Balancing Scenarios

### Scenario 1: Normal Top Balance

**Situation:** Pack charging, cells drifting.

```
Cell 1: 4.18V ← Discharging (above start threshold)
Cell 2: 4.15V ← Discharging
Cell 3: 4.12V ← Not discharging (at target)
Cell 4: 4.12V ← Not discharging
```

**Result:** Cells 1 & 2 discharge until they match Cells 3 & 4.

### Scenario 2: One Cell Much Higher

**Situation:** One cell significantly higher than others.

```
Cell 1: 4.20V ← Discharging heavily
Cell 2: 4.05V ← Not discharging
Cell 3: 4.06V ← Not discharging
Cell 4: 4.04V ← Not discharging
```

**Result:** Cell 1 discharges until it reaches 4.06V range.

### Scenario 3: Balancing Blocked

**Situation:** High discharge current during ride.

```
Current: 30A (above balance_max_current)
Balancing: DISABLED
Reason: Accuracy compromised during high current
```

**Result:** Balancing resumes when current drops.

---

## Troubleshooting

### Problem: Cells Not Balancing

**Symptom:** Cell voltages stay unequal despite charging.

**Checks:**

1. **Verify Balance Mode**
   - VESC Tool → BMS → Configuration
   - Mode should be 1, 2, or 3 (not 0)

2. **Check `vc_balance_min`**
   - Must be below your lowest cell
   - Default 3.3V, increase if cells always below

3. **Check Current Threshold**
   - `balance_max_current` default is 1.0A
   - Must be above charger trickle current

4. **Verify Hardware**
   - LTC6813 must be working
   - Check BMS temperature sensor

### Problem: Balancing Too Slow

**Symptom:** Takes days to balance pack.

**Cause:** Passive balancing is slow (50-200mA typical).

**Solutions:**

1. **Increase Balance Time**
   - Leave charger connected longer
   - Use lower charge current at end

2. **Manual Balance Override**
   ```
   // Force balance cell 3
   bms_if_set_balance_override(3, 2);  // 2 = force ON
   ```

3. **Check Discharge Resistors**
   - Hardware may have weak resistors
   - Higher value = slower balancing

### Problem: Balancing But Cells Still Unequal

**Symptom:** Balancing indicator on, but no improvement.

**Checks:**

1. **Cell Health**
   - One cell may have internal issues
   - Check capacity test per-cell

2. **Temperature Distribution**
   - Hot cells self-discharge faster
   - Check for thermal issues

3. **Connection Quality**
   - High resistance connections cause voltage offset
   - Check all cell tap connections

---

## Advanced: Manual Balance Override

### Via Commands

**Source:** `vesc_bms_fw/commands.c:360-374`

```c
// Set balance override for cell
// 0 = auto, 1 = force OFF, 2 = force ON
bms_if_set_balance_override(cell_index, mode);

// Force balance now (ignores conditions)
bms_if_force_balance(true);
```

### Via VESC Tool

1. BMS → Cells → Select cell
2. Balance: Override ON/OFF
3. Or use "Balance All" button

**Warning:** Forcing balance during discharge can damage cells!

---

## Quick Reference

### Optimal Settings for Most Packs

| Parameter | Value | Notes |
|-----------|-------|-------|
| `balance_mode` | 2 | Charging + Idle |
| `vc_balance_min` | 3.3V | Safe minimum |
| `vc_balance_start` | 0.005V (5mV) | Start threshold |
| `vc_balance_end` | 0.002V (2mV) | Stop threshold |
| `balance_max_current` | 2.0A | Below this, balance |

### When to Check Balancing

- ✅ After every full charge
- ✅ Before storing pack
- ✅ After long storage
- ✅ If range decreases
- ✅ If cells show different temperatures

### Balance Time Estimates

| Cell Imbalance | Balance Current | Time to Balance |
|----------------|-----------------|-----------------|
| 50mV | 100mA | ~1 hour |
| 100mV | 100mA | ~2 hours |
| 200mV | 100mA | ~4 hours |
| 500mV | 100mA | ~10 hours |

---

## References

- Source: `vesc_bms_fw/bms_if.c:168-280` - Balance thread
- Source: `vesc_bms_fw/drivers/ltc6813.c` - Cell monitor
- Related: `vesc-bms-configuration-guide.md` - BMS setup
- Related: `battery-cell-configuration-guide.md` - Cell config

---

*Last updated: 2026-01-14 | Deep-dive from vesc_bms_fw source*
