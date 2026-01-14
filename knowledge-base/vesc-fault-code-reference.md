# VESC Fault Code Reference

## Overview

When something goes wrong, the VESC triggers a **fault** and stops the motor to protect hardware and rider. This guide explains every fault code, what causes it, and how to fix it.

**Source:** `bldc/datatypes.h:143-174` and `bldc/motor/mc_interface.c`

---

## Quick Reference Table

| Code | Fault Name | Severity | Common Cause |
|------|-----------|----------|--------------|
| 0 | NONE | - | No fault |
| 1 | OVER_VOLTAGE | HIGH | Regen with full battery |
| 2 | UNDER_VOLTAGE | HIGH | Battery empty or disconnected |
| 3 | DRV | CRITICAL | Hardware failure or short |
| 4 | ABS_OVER_CURRENT | HIGH | Current spike exceeded limit |
| 5 | OVER_TEMP_FET | MEDIUM | VESC overheating |
| 6 | OVER_TEMP_MOTOR | MEDIUM | Motor overheating |
| 7 | GATE_DRIVER_OVER_VOLTAGE | CRITICAL | Gate driver supply too high |
| 8 | GATE_DRIVER_UNDER_VOLTAGE | CRITICAL | Gate driver supply too low |
| 9 | MCU_UNDER_VOLTAGE | CRITICAL | MCU power supply issue |
| 10 | BOOTING_FROM_WATCHDOG | MEDIUM | Firmware crash/restart |
| 11 | ENCODER_SPI | MEDIUM | Encoder communication error |
| 12-13 | ENCODER_SINCOS | MEDIUM | Sin/Cos encoder amplitude issue |
| 14 | FLASH_CORRUPTION | HIGH | Config data corrupted |
| 15-17 | HIGH_OFFSET_CURRENT | MEDIUM | Current sensor calibration issue |
| 18 | UNBALANCED_CURRENTS | MEDIUM | Phase current mismatch |
| 19 | BRK | HIGH | Brake resistor fault |
| 20-22 | RESOLVER | MEDIUM | Resolver encoder errors |
| 23-24 | FLASH_CORRUPTION_CFG | HIGH | App/Motor config corrupted |
| 25-26 | ENCODER_MAGNET | MEDIUM | Magnetic encoder issues |
| 27 | PHASE_FILTER | MEDIUM | Phase filter fault |
| 28 | ENCODER_FAULT | MEDIUM | General encoder error |
| 29 | LV_OUTPUT_FAULT | MEDIUM | Low voltage output issue |

---

## Detailed Fault Explanations

### FAULT_CODE_NONE (0)
**Meaning:** No fault present.

---

### FAULT_CODE_OVER_VOLTAGE (1)

**What It Means:** Battery voltage exceeded `l_max_vin` limit.

**Common Causes:**
1. **Regenerative braking with full battery** - Most common! When you brake, energy goes back to the battery. If battery is full, voltage spikes.
2. **Battery voltage higher than configured limit**
3. **Voltage spike during hard braking**

**Source:** `mc_interface.c:1896` - Triggers when `input_voltage > l_max_vin`

**Solutions:**
1. **Set proper regen cutoff voltages:**
   - `l_battery_regen_cut_start` = Cell count × 4.15V
   - `l_battery_regen_cut_end` = Cell count × 4.25V
2. **Don't charge to 100%** before rides with downhill braking
3. **Increase `l_max_vin`** if your battery really is higher voltage
4. **Reduce regen current limit** (`l_in_current_min`)

**Example:**
```
12S battery at 4.2V/cell = 50.4V
If l_max_vin = 50V, regen will trigger over-voltage
Fix: Set l_max_vin = 52V or higher
```

---

### FAULT_CODE_UNDER_VOLTAGE (2)

**What It Means:** Battery voltage dropped below `l_min_vin` limit.

**Common Causes:**
1. **Battery completely empty**
2. **Battery disconnected momentarily** (loose connector)
3. **BMS cutoff** (BMS disconnected pack)
4. **High current draw** causing voltage sag

**Source:** `mc_interface.c:1896` - Triggers when `input_voltage < l_min_vin`

**Solutions:**
1. **Charge your battery!**
2. **Check battery connections** - Wiggle test while powered on
3. **Check BMS settings** - Is BMS cutting off too early?
4. **Lower `l_min_vin`** if you're sure battery can handle it safely
5. **Reduce current limits** if voltage sag is the issue

**Danger:** Riding with under-voltage can damage Li-ion cells!

---

### FAULT_CODE_DRV (3)

**What It Means:** The DRV8301/8302/8303 gate driver chip reported a fault.

**This is often HARDWARE DAMAGE.**

**Common Causes:**
1. **Motor phase short circuit** (wires touching)
2. **Water damage** to VESC
3. **MOSFET failure** (burnt FET)
4. **DRV chip failure**
5. **ESD damage** during handling

**Source:** `mc_interface.c:1985`

**Diagnosis Steps:**
1. **Visual inspection** - Look for burnt components, water stains
2. **Check phase wires** - Disconnect motor, check for shorts between phases
3. **Measure phase resistance** - Should be equal between all three phases
4. **Check for water** - Open VESC, look for corrosion

**Solutions:**
1. **If phase wire short:** Fix wiring, heat shrink exposed wires
2. **If water damage:** Clean with isopropyl alcohol, let dry completely
3. **If DRV/MOSFET failure:** VESC needs repair/replacement

**Warning:** Don't keep trying to run if you get DRV faults repeatedly - you may cause more damage!

---

### FAULT_CODE_ABS_OVER_CURRENT (4)

**What It Means:** Motor current exceeded `l_abs_current_max` limit.

**Common Causes:**
1. **Motor phase short** (most common)
2. **Motor detection values wrong**
3. **Sudden load spike**
4. **`l_abs_current_max` set too low**

**Source:** `mc_interface.c:1968-1972`

**Solutions:**
1. **Check motor phase wires** for shorts
2. **Re-run motor detection** with wheel off ground
3. **Increase `l_abs_current_max`** if you're sure wiring is correct
4. **Reduce motor current limits** if motor can't handle it

**Default `l_abs_current_max`:** Usually 150A (hardware dependent)

---

### FAULT_CODE_OVER_TEMP_FET (5)

**What It Means:** MOSFET temperature exceeded `l_temp_fet_end` limit.

**Common Causes:**
1. **Prolonged high current use** (hill climbing, heavy rider)
2. **Poor ventilation** (enclosed case, blocked airflow)
3. **High ambient temperature**
4. **Inadequate heatsinking**

**Source:** `mc_interface.c:2325` - Triggers when FET temp > `l_temp_fet_end`

**Solutions:**
1. **Wait for VESC to cool down**
2. **Improve cooling** - Better heatsink, thermal paste, fans
3. **Reduce current limits** for your riding style
4. **Increase temperature limits** (NOT recommended - risk of damage)

**Defaults:**
- `l_temp_fet_start`: 85°C (power reduction begins)
- `l_temp_fet_end`: 100°C (full cutoff)

---

### FAULT_CODE_OVER_TEMP_MOTOR (6)

**What It Means:** Motor temperature exceeded `l_temp_motor_end` limit.

**Requires:** Temperature sensor in motor.

**Common Causes:**
1. **Motor overworked** (sustained high current)
2. **Poor motor ventilation**
3. **Undersized motor for application**

**Source:** `mc_interface.c:2351`

**Solutions:**
1. **Wait for motor to cool down**
2. **Reduce motor current limits**
3. **Upgrade to larger motor**
4. **Add motor cooling** (vents, fans)

---

### FAULT_CODE_GATE_DRIVER_OVER_VOLTAGE (7)

**What It Means:** Gate driver supply voltage too high.

**Common Causes:**
1. **Hardware fault** in gate driver supply circuit
2. **Voltage regulator failure**

**Source:** `mc_interface.c:2000`

**Solutions:**
1. **Hardware inspection required** - Check voltage regulators
2. **May require VESC repair**

---

### FAULT_CODE_GATE_DRIVER_UNDER_VOLTAGE (8)

**What It Means:** Gate driver supply voltage too low.

**Common Causes:**
1. **Low battery voltage** affecting gate driver supply
2. **Voltage regulator failure**
3. **Heavy load on 5V/3.3V rail**

**Source:** `mc_interface.c:2004`

**Solutions:**
1. **Check battery voltage**
2. **Reduce load on auxiliary outputs**
3. **Check voltage regulators**

---

### FAULT_CODE_MCU_UNDER_VOLTAGE (9)

**What It Means:** Microcontroller supply voltage dropped too low.

**Common Causes:**
1. **Severe battery undervoltage**
2. **Power supply issue**
3. **Brown-out during high current draw**

**Source:** `irq_handlers.c:69`

**Solutions:**
1. **Charge battery**
2. **Check power supply circuit**
3. **Reduce current limits**

---

### FAULT_CODE_BOOTING_FROM_WATCHDOG_RESET (10)

**What It Means:** Firmware crashed and was reset by watchdog timer.

**Common Causes:**
1. **Firmware bug** (rare)
2. **EMI interference** causing MCU glitch
3. **Corrupted firmware upload**

**Source:** `mcpwm_foc.c:583`, `mcpwm.c:445`

**Solutions:**
1. **Note when it happens** - Specific conditions?
2. **Re-flash firmware**
3. **Check for EMI sources** (poor shielding)
4. **Report to VESC community** if reproducible

---

### FAULT_CODE_ENCODER_SPI (11)

**What It Means:** SPI communication with encoder failed.

**Common Causes:**
1. **Loose encoder cable**
2. **EMI interference** on encoder wires
3. **Damaged encoder**
4. **Wrong encoder settings**

**Source:** `encoder/encoder.c:601-687` (multiple trigger points)

**Solutions:**
1. **Check encoder cable connections**
2. **Use shielded encoder cable**
3. **Route encoder cable away from motor wires**
4. **Verify encoder type setting**

---

### FAULT_CODE_ENCODER_SINCOS_BELOW_MIN_AMPLITUDE (12)

**What It Means:** Sin/Cos encoder signal amplitude too low.

**Common Causes:**
1. **Encoder too far from magnet**
2. **Weak magnet**
3. **Dirty encoder**

**Source:** `encoder/encoder.c:637`

**Solutions:**
1. **Reduce gap between encoder and magnet**
2. **Replace magnet with stronger one**
3. **Clean encoder surface**

---

### FAULT_CODE_ENCODER_SINCOS_ABOVE_MAX_AMPLITUDE (13)

**What It Means:** Sin/Cos encoder signal amplitude too high.

**Common Causes:**
1. **Encoder too close to magnet**
2. **Magnet too strong**

**Source:** `encoder/encoder.c:640`

**Solutions:**
1. **Increase gap between encoder and magnet**
2. **Use weaker magnet**

---

### FAULT_CODE_FLASH_CORRUPTION (14)

**What It Means:** Flash memory data is corrupted.

**Common Causes:**
1. **Power loss during config write**
2. **Flash wear** (after many writes)
3. **Firmware bug**

**Solutions:**
1. **Restore default settings**
2. **Re-flash firmware**
3. **Check power supply stability**

---

### FAULT_CODE_HIGH_OFFSET_CURRENT_SENSOR_1/2/3 (15-17)

**What It Means:** Current sensor offset calibration out of range.

**Common Causes:**
1. **Damaged current sensor**
2. **DC offset on current sensor**
3. **Calibration performed with motor spinning**

**Source:** `mc_interface.c:2665-2672`

**Solutions:**
1. **Recalibrate** - In VESC Tool: Motor Settings > General > Measure Current Offset
2. **Ensure motor is stationary** during calibration
3. **Check current sensor hardware**

---

### FAULT_CODE_UNBALANCED_CURRENTS (18)

**What It Means:** Phase currents are not balanced (one phase drawing more/less than others).

**Common Causes:**
1. **Motor phase wire issue** (loose connection, high resistance)
2. **Motor winding damage**
3. **Current sensor mismatch**

**Source:** `mc_interface.c:2689`

**Solutions:**
1. **Check all phase wire connections**
2. **Measure resistance of each motor phase**
3. **Re-run motor detection**
4. **Test with different motor if available**

---

### FAULT_CODE_BRK (19)

**What It Means:** Brake resistor fault detected.

**Common Causes:**
1. **Brake resistor disconnected**
2. **Brake resistor damaged**
3. **Brake resistor overheated**

**Source:** `mc_interface.c:1991`

**Solutions:**
1. **Check brake resistor connection**
2. **Test brake resistor** (should have specified resistance)
3. **Replace brake resistor if damaged**

---

### FAULT_CODE_RESOLVER_LOT/DOS/LOS (20-22)

**What It Means:** Resolver encoder errors.

| Code | Meaning |
|------|---------|
| LOT | Loss of Tracking |
| DOS | Degraded Operation Status |
| LOS | Loss of Signal |

**Source:** `encoder/encoder.c:646-652`

**Solutions:**
1. **Check resolver wiring**
2. **Verify resolver type settings**
3. **Replace resolver if damaged**

---

### FAULT_CODE_FLASH_CORRUPTION_APP_CFG (23)

**What It Means:** Application configuration data corrupted.

**Solutions:**
1. **Restore default app settings** in VESC Tool
2. **Re-configure app settings**
3. **Re-flash firmware if persistent**

---

### FAULT_CODE_FLASH_CORRUPTION_MC_CFG (24)

**What It Means:** Motor configuration data corrupted.

**Solutions:**
1. **Restore default motor settings** in VESC Tool
2. **Re-run motor detection**
3. **Re-flash firmware if persistent**

---

### FAULT_CODE_ENCODER_NO_MAGNET (25)

**What It Means:** Magnetic encoder cannot detect magnet.

**Common Causes:**
1. **Magnet fell off**
2. **Encoder too far from magnet**
3. **Wrong encoder type selected**

**Source:** `encoder/encoder.c:611-676`

**Solutions:**
1. **Check magnet is present and attached**
2. **Reduce gap between encoder and magnet**
3. **Verify encoder type setting**

---

### FAULT_CODE_ENCODER_MAGNET_TOO_STRONG (26)

**What It Means:** Magnet field saturating the encoder.

**Source:** `encoder/encoder.c:613-678`

**Solutions:**
1. **Increase gap between encoder and magnet**
2. **Use weaker magnet**

---

### FAULT_CODE_PHASE_FILTER (27)

**What It Means:** Phase filter fault detected.

**Source:** `mcpwm_foc.c:5105`

**Solutions:**
1. **Check phase filter components**
2. **Hardware inspection required**

---

### FAULT_CODE_ENCODER_FAULT (28)

**What It Means:** General encoder error.

**Source:** `encoder/encoder.c:627-697`

**Solutions:**
1. **Check encoder wiring**
2. **Try different encoder mode**
3. **Replace encoder if damaged**

---

### FAULT_CODE_LV_OUTPUT_FAULT (29)

**What It Means:** Low voltage output fault.

**Source:** `mc_interface.c:2010`

**Solutions:**
1. **Check LV output circuit**
2. **Reduce load on LV output**
3. **Hardware inspection may be needed**

---

## Viewing Faults in VESC Tool

### Real-Time Data
1. Connect to VESC
2. Go to **Real Time Data > General**
3. **Fault Code** shows current fault (if any)

### Fault History
1. Connect to VESC
2. Open **Terminal**
3. Type `faults` and press Enter
4. Shows history of faults with timestamps

### Sample at Fault
1. Go to **Motor Settings > Additional Info**
2. Enable **Trigger Sampled at Fault**
3. When fault occurs, view **Real Time Data > Sampled Data**
4. Shows motor state at moment of fault

---

## Recovery After Faults

After a fault, the VESC stops the motor. To recover:

1. **Fix the underlying issue** (see solutions above)
2. **Power cycle the VESC** (off then on)
3. **Clear faults** (some VESCs require this)

**Automatic Recovery:**
Some faults allow automatic recovery after `fault_stop_time_ms` (default 500ms). Others require power cycle.

---

## Hardware-Specific Notes

### VESC 6.x / VESC 6 MkIII
- More robust gate driver than 4.x
- DRV faults less common

### UBOX
- Watch for over-temp (enclosed design)
- Field weakening can trigger ABS_OVER_CURRENT

### Little FOCer
- Lower current handling than full VESC
- Temperature limits more important

### FSESC
- Quality varies by version
- 4.12 clones: Watch for DRV issues
- 6.x clones: Generally more reliable

---

## References

- Source: `bldc/datatypes.h:143-174` - Fault code definitions
- Source: `bldc/motor/mc_interface.c` - Fault triggering logic
- Source: `bldc/encoder/encoder.c` - Encoder fault handling
- Source: `bldc/irq_handlers.c` - MCU fault handling

---

*Last updated: 2026-01-14 | Source verified against bldc repository*
