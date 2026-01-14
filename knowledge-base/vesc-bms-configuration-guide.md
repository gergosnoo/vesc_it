# VESC BMS Configuration Guide

## Overview

The VESC Battery Management System (BMS) is an intelligent battery protection and monitoring system designed to work seamlessly with VESC motor controllers. Unlike passive BMS solutions, the VESC BMS communicates with the motor controller over CAN bus, allowing for intelligent power limiting rather than hard cutoffs.

**Key Functions:**
1. **Cell Balancing** - Equalizes cell voltages to maximize capacity and lifespan
2. **Charge Control** - Manages the charging process with temperature and voltage limits
3. **Information Provider** - Sends battery data to motor controller for intelligent power management

**Critical Difference from Consumer BMS:**
The VESC BMS does NOT cut power to the motor controller during discharge. Instead, it sends data (cell voltages, temperature, SoC) and trusts the motor controller to limit current appropriately. This prevents dangerous sudden power cuts during riding.

---

## Configuration Parameters

### Cell Configuration

| Parameter | Description | Source |
|-----------|-------------|--------|
| `cell_num` | Number of cells in series | `datatypes.h:71` |
| `cell_first_index` | Channel index of first cell (for multi-IC setups) | `datatypes.h:74` |

**Example:** For a 20S battery pack, set `cell_num = 20`.

### Balance Mode

```c
// From datatypes.h:28-33
typedef enum {
    BALANCE_MODE_DISABLED = 0,          // No balancing
    BALANCE_MODE_CHARGING_ONLY,         // Balance only while charger connected
    BALANCE_MODE_DURING_AND_AFTER_CHARGING, // Balance during and after charging
    BALANCE_MODE_ALWAYS                 // Balance anytime voltage difference exists
} BMS_BALANCE_MODE;
```

**Recommendations:**
- **Most Users:** `BALANCE_MODE_DURING_AND_AFTER_CHARGING` - Best balance of cell life and power consumption
- **High Performance:** `BALANCE_MODE_ALWAYS` - Keeps cells perfectly balanced but uses more standby power
- **Simple Charger Setup:** `BALANCE_MODE_CHARGING_ONLY`

### Balancing Parameters

| Parameter | Description | Typical Value |
|-----------|-------------|---------------|
| `vc_balance_start` | Start balancing when cell is this much above minimum (V) | 0.01 - 0.02V |
| `vc_balance_end` | Stop balancing when cell is this close to minimum (V) | 0.005V |
| `vc_balance_min` | Minimum cell voltage to allow balancing (V) | 3.0V |
| `max_bal_ch` | Maximum simultaneous balancing channels | 3-5 |
| `balance_max_current` | Only balance below this pack current (A) | 1.0A |

**Why `balance_max_current` Matters:**
Balancing should only occur when the pack is at rest or nearly idle. Balancing during high current draw leads to inaccurate readings and wasted energy.

### Charge Control Parameters

| Parameter | Description | Typical Li-ion |
|-----------|-------------|----------------|
| `vc_charge_start` | Allow charging when max cell below (V) | 4.15V |
| `vc_charge_end` | Stop charging when max cell above (V) | 4.20V |
| `vc_charge_min` | All cells must be above to allow charge (V) | 2.5V |
| `v_charge_detect` | Voltage threshold to detect charger present (V) | Pack voltage + 1V |
| `min_charge_current` | Stop charging when current drops below (A) | 0.1A |
| `max_charge_current` | Maximum allowed charge current (A) | Per cell spec |

**Temperature Limits:**

| Parameter | Description | Typical Value |
|-----------|-------------|---------------|
| `t_charge_max` | Maximum temperature to allow charging (°C) | 45°C |
| `t_charge_min` | Minimum temperature to allow charging (°C) | 0°C |
| `t_bal_lim_start` | Start reducing balance channels above (°C) | 40°C |
| `t_bal_lim_end` | Disable all balancing above (°C) | 50°C |

---

## CAN Bus Integration

The VESC BMS sends status messages over CAN bus that the motor controller uses for intelligent power limiting.

### Key CAN Message: `CAN_PACKET_BMS_SOC_SOH_TEMP_STAT`

From `datatypes.h:365`, this message contains:

| Bytes | Content | Unit |
|-------|---------|------|
| 0-1 | V_CELL_MIN | mV |
| 2-3 | V_CELL_MAX | mV |
| 4 | State of Charge (SoC) | 0-255 (0-100%) |
| 5 | State of Health (SoH) | 0-255 |
| 6 | T_CELL_MAX | °C (-128 to +127) |
| 7 | Status Flags | Bitfield |

**Status Bitfield:**
- Bit 0 (`IS_CHG`): Currently charging
- Bit 1 (`IS_BAL`): Currently balancing
- Bit 2 (`CHG_OK`): Charging is allowed

### CAN Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `controller_id` | BMS ID on CAN bus | 10 |
| `send_can_status_rate_hz` | How often to send status (Hz) | 10 |
| `can_baud_rate` | CAN bus speed | 500K |

**Available Baud Rates:** (from `datatypes.h:46-57`)
```
CAN_BAUD_125K, CAN_BAUD_250K, CAN_BAUD_500K, CAN_BAUD_1M
CAN_BAUD_10K, CAN_BAUD_20K, CAN_BAUD_50K, CAN_BAUD_75K, CAN_BAUD_100K
```

**Important:** All devices on the CAN bus must use the same baud rate!

---

## Motor Controller BMS Settings

The VESC motor controller has settings to respond to BMS data. In VESC Tool under "App Settings > General":

| Setting | Description | Recommendation |
|---------|-------------|----------------|
| BMS Type | Which BMS protocol | "VESC BMS" |
| SoC Limit Start | Start limiting power at SoC % | 20% |
| SoC Limit End | Full limit at SoC % | 10% |
| Temp Limit Start | Start limiting at temperature | 40°C |
| Temp Limit End | Full limit at temperature | 50°C |

---

## Distributed Balancing (Multi-BMS)

When connecting multiple battery packs in series or parallel, each with its own VESC BMS, distributed balancing keeps all cells balanced across all packs.

**Enable:** In VESC Tool, check "Distributed Balancing" under BMS > Balancing.

**How it Works:**
1. Each BMS broadcasts its lowest cell voltage on CAN
2. All BMSes balance down to the global minimum
3. Ensures all cells across all packs reach the same voltage

**Requirements:**
- All BMSes on same CAN bus
- Same CAN baud rate
- Unique controller IDs for each BMS

---

## BMS Fault Codes

From `datatypes.h:296-302`:

| Code | Fault | Cause |
|------|-------|-------|
| 0 | `FAULT_CODE_NONE` | No fault |
| 1 | `FAULT_CODE_CHARGE_OVERCURRENT` | Charge current exceeded limit |
| 2 | `FAULT_CODE_CHARGE_OVERTEMP` | Temperature exceeded during charge |
| 3 | `FAULT_CODE_HUMIDITY` | Humidity sensor triggered |

**Fault Indication:** Red LED blinks fault code number.

---

## Sleep Mode

The BMS enters low-power sleep when inactive to preserve battery.

| Parameter | Description |
|-----------|-------------|
| `min_current_sleep` | Enter sleep when current below (A) |
| `sleep_timeout_reset_ms` | Inactivity timer before sleep |

**Wake Events:**
- Balancing active
- Charging active
- CAN messages from VESC
- Current above threshold
- USB connected

---

## Common Issues & Solutions

### Issue: Cells Out of Balance After Charging

**Symptoms:** SoC drops quickly after charging, reduced range.

**Causes:**
1. Balance mode set to DISABLED
2. `vc_balance_start` too high (not triggering balance)
3. Charger unplugged too quickly

**Solutions:**
- Set `BALANCE_MODE_DURING_AND_AFTER_CHARGING`
- Lower `vc_balance_start` to 0.01V
- Leave charger connected until balancing LED turns off

### Issue: Charging Stops Early

**Symptoms:** Charger shows complete, but cells not at 4.20V.

**Causes:**
1. One cell reaching `vc_charge_end` before others
2. `min_charge_current` too high
3. Temperature limit reached

**Solutions:**
- Check for unbalanced cells, run manual balance
- Lower `min_charge_current` to 0.05A
- Charge in cooler environment

### Issue: BMS Not Communicating with VESC

**Symptoms:** Motor controller shows no BMS data.

**Causes:**
1. CAN wiring incorrect (H↔H, L↔L required)
2. Baud rate mismatch
3. Termination resistor missing

**Solutions:**
- Verify CAN H to CAN H, CAN L to CAN L
- Match baud rate on all devices
- Add 120Ω termination at each end of CAN bus

### Issue: Regen Overvoltage at Full Charge

**Symptoms:** Overvoltage fault when braking with full battery.

**Cause:** Regenerative braking pushes voltage above `vc_charge_end`.

**Solutions:**
- In motor controller: Set regen cutoff start/end voltages appropriately
- Don't charge to 100% before rides requiring downhill braking
- The VESC motor controller should limit regen based on BMS voltage data

---

## BMS Bypass for Onewheels (Charge-Only)

Many Onewheel builders bypass the BMS for discharge to avoid sudden cutouts. This is documented in detail in `safety-critical-settings.md`, but the key points:

**Why Bypass:**
- Consumer BMS may cut power suddenly at low voltage
- VESC BMS + motor controller communication is safer (soft limiting)
- Prevents nosedives from hard power cuts

**Safe Bypass Method (Charge-Only):**
1. BMS positive lead → charger positive terminal
2. Battery positive → motor controller positive (bypasses BMS for discharge)
3. BMS still monitors and balances cells during charging

**DANGEROUS Method (B- Bridge):**
Connecting B- to P- to bypass completely can cause fires if the BMS shorts internally. **NOT RECOMMENDED.**

---

## Quick Reference: Voltage Settings by Cell Chemistry

### Li-ion (18650, 21700)

| Parameter | Value |
|-----------|-------|
| `vc_charge_end` | 4.20V |
| `vc_charge_start` | 4.10V |
| `vc_charge_min` | 2.50V |
| `vc_balance_min` | 3.00V |

### LiFePO4 (LFP)

| Parameter | Value |
|-----------|-------|
| `vc_charge_end` | 3.65V |
| `vc_charge_start` | 3.55V |
| `vc_charge_min` | 2.50V |
| `vc_balance_min` | 2.80V |

---

## Terminal Commands

Connect via USB or VESC Tool terminal:

| Command | Description |
|---------|-------------|
| `bms` | Show current BMS status |
| `cells` | Show individual cell voltages |
| `temps` | Show temperature readings |
| `faults` | Show fault history |
| `bal` | Show balancing status |

---

## References

- Source: `vesc_bms_fw/datatypes.h` - Configuration structures
- Source: `vesc_bms_fw/bms_if.h` - BMS interface functions
- Source: `vesc_bms_fw/README.md` - Official documentation
- Hardware: STM32L476 + LTC6813 cell monitor IC

---

*Last updated: 2026-01-14 | Source verified against vesc_bms_fw repository*
