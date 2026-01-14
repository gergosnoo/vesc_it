# VESC Beginner Settings Guide

## Introduction

This guide explains the most important VESC settings for new users. We'll demystify concepts like Motor Amps vs Battery Amps, explain how to calculate safe limits from your battery specs, and provide recommended defaults.

---

## The Most Common Question: Motor Amps vs Battery Amps

### What's the Difference?

This is the #1 source of confusion for new VESC users. Here's the simple explanation:

| Setting | What It Controls | VESC Tool Name |
|---------|------------------|----------------|
| **Motor Amps** | Current flowing through motor windings | Motor Current Max |
| **Battery Amps** | Current drawn from/to battery | Battery Current Max |

**Key Insight:** Motor Amps and Battery Amps are NOT the same thing!

### Why They're Different: The Power Equation

```
Power (Watts) = Voltage × Current
```

At low speeds, the motor needs high current to produce torque, but the duty cycle is low. The VESC acts like a buck converter:

```
Battery Power = Motor Power (conservation of energy)
Battery Volts × Battery Amps = Motor Volts × Motor Amps

At 50% duty cycle:
48V × 20A (battery) = 24V × 40A (motor)
```

**Practical Example:**
- Climbing a hill at 10 km/h (low speed, high torque)
- Motor needs 80A to produce torque
- But at 25% duty cycle, battery only supplies 20A
- Motor Amps: 80A | Battery Amps: 20A

### How to Set These Values

#### Motor Current (l_current_max / l_current_min)

**Maximum Motor Current (`l_current_max`):**
- Determines torque and acceleration capability
- Limited by motor's thermal rating and VESC hardware
- Higher = more torque, but more heat

**Minimum Motor Current (`l_current_min`):** (Negative = regen braking)
- Determines braking strength
- Usually set to negative of max (symmetric)

**Source:** `bldc/datatypes.h:388-389`

**Recommendations:**

| VESC Hardware | Safe Motor Current Range |
|---------------|-------------------------|
| VESC 4.12 | 50-60A |
| VESC 6 (standard) | 80-100A |
| VESC 6 MkIII | 100-150A |
| Stormcore | 80-120A |
| Little Focer | 60-80A |
| UBOX | 100-150A (field weakening concerns) |

#### Battery Current (l_in_current_max / l_in_current_min)

**Maximum Battery Current (`l_in_current_max`):**
- Limits current drawn FROM battery during acceleration
- MUST be calculated from your battery's discharge rating

**Minimum Battery Current (`l_in_current_min`):** (Negative = regen to battery)
- Limits current pushed TO battery during braking
- MUST be calculated from your battery's charge rating

**Source:** `bldc/datatypes.h:390-391`

---

## Calculating Battery Limits from Cell Specs

### Step 1: Know Your Cells

Every lithium cell has these ratings:
- **Capacity** (mAh or Ah): How much energy it holds
- **Max Continuous Discharge** (A): Safe sustained current
- **Max Charge Rate** (C): Safe charging speed

**Common 18650/21700 Examples:**

| Cell | Capacity | Max Discharge | Max Charge |
|------|----------|---------------|------------|
| Samsung 30Q | 3000mAh | 15A | 4A (1.3C) |
| Sony VTC6 | 3000mAh | 20A | 4A |
| Samsung 40T | 4000mAh | 35A | 6A |
| Molicel P42A | 4200mAh | 45A | 6A |
| Samsung 50S | 5000mAh | 25A | 4.9A |

### Step 2: Calculate Parallel Groups (P-count)

Your battery's P-count determines total current capacity:

```
Battery Type: 12S4P means 12 cells in series, 4 in parallel
P-count = 4 (four cells share the current)
```

### Step 3: Calculate Safe Battery Current

```
Max Battery Discharge = Cell Max Discharge × P-count

Example: 12S4P with Samsung 30Q
Max Discharge = 15A × 4 = 60A
```

```
Max Battery Regen = Cell Max Charge × P-count

Example: 12S4P with Samsung 30Q
Max Regen = 4A × 4 = 16A
```

### Step 4: Set VESC Battery Limits

**Always leave a safety margin!** Set to 80-90% of calculated max.

```
l_in_current_max = 60A × 0.85 = ~50A
l_in_current_min = -16A × 0.85 = ~-14A
```

### Quick Reference Table

| Battery Config | Cell | Discharge Setting | Regen Setting |
|---------------|------|-------------------|---------------|
| 12S2P 30Q | Samsung 30Q | 25A | -7A |
| 12S4P 30Q | Samsung 30Q | 50A | -14A |
| 12S3P 40T | Samsung 40T | 90A | -15A |
| 20S2P P42A | Molicel P42A | 75A | -10A |

---

## Voltage Cutoff Settings

### Battery Cutoff (l_battery_cut_start / l_battery_cut_end)

These settings prevent over-discharging your battery:

| Parameter | Description | Source |
|-----------|-------------|--------|
| `l_battery_cut_start` | Start reducing power at this voltage | `datatypes.h:402` |
| `l_battery_cut_end` | Full power cutoff at this voltage | `datatypes.h:403` |

**How to Calculate:**

For Li-ion (3.0V safe minimum per cell):
```
l_battery_cut_end = Cell Count × 3.0V
l_battery_cut_start = Cell Count × 3.2V

Example 12S battery:
l_battery_cut_end = 12 × 3.0 = 36.0V
l_battery_cut_start = 12 × 3.2 = 38.4V
```

**Quick Reference:**

| Cells (S) | Cut Start | Cut End |
|-----------|-----------|---------|
| 10S | 32V | 30V |
| 12S | 38.4V | 36V |
| 13S | 41.6V | 39V |
| 14S | 44.8V | 42V |
| 20S | 64V | 60V |

### Regen Cutoff (l_battery_regen_cut_start / l_battery_regen_cut_end)

Prevents overcharging during regenerative braking:

```
l_battery_regen_cut_start = Cell Count × 4.15V
l_battery_regen_cut_end = Cell Count × 4.25V

Example 12S battery:
l_battery_regen_cut_start = 12 × 4.15 = 49.8V
l_battery_regen_cut_end = 12 × 4.25 = 51.0V
```

**Source:** `bldc/datatypes.h:404-405`

---

## Temperature Limits

### FET Temperature (l_temp_fet_start / l_temp_fet_end)

Protects the VESC's MOSFETs from overheating:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `l_temp_fet_start` | Start reducing power | 85°C |
| `l_temp_fet_end` | Full cutoff | 100°C |

**Source:** `bldc/datatypes.h:407-408`

### Motor Temperature (l_temp_motor_start / l_temp_motor_end)

Requires a temperature sensor in the motor:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `l_temp_motor_start` | Start reducing power | 85°C |
| `l_temp_motor_end` | Full cutoff | 100°C |

**Source:** `bldc/datatypes.h:409-410`

---

## Throttle/PPM Calibration

### PPM (Pulse Position Modulation) Remotes

Most wireless remotes use PPM. Calibration ensures full throttle range.

**Steps in VESC Tool:**
1. Go to **App Settings > PPM**
2. Click **Start Detection**
3. Move throttle to full forward, full brake, and center
4. Click **Apply**

**Key Settings:**

| Parameter | Description | Typical Range |
|-----------|-------------|---------------|
| `ppm_ctrl_type` | Control mode (Current, Duty, etc.) | Current |
| `ppm_pulse_start` | Pulse width at brake/reverse | 1.0 ms |
| `ppm_pulse_center` | Pulse width at neutral | 1.5 ms |
| `ppm_pulse_end` | Pulse width at full throttle | 2.0 ms |

**Common Issues:**
- **Jerky throttle:** Increase `ppm_ramp_time_pos` and `ppm_ramp_time_neg`
- **Deadband too large:** Decrease center tolerance
- **Motor spins at neutral:** Recalibrate center point

---

## Safe Starting Defaults

### For Electric Skateboard (12S, 6374 motor)

| Setting | Value |
|---------|-------|
| Motor Current Max | 60A |
| Motor Current Min | -60A |
| Battery Current Max | 40A |
| Battery Current Min | -20A |
| Battery Cutoff Start | 38.4V |
| Battery Cutoff End | 36V |
| Regen Cutoff Start | 49.8V |
| Regen Cutoff End | 51V |

### For Onewheel (20S, hub motor)

| Setting | Value |
|---------|-------|
| Motor Current Max | 80A |
| Motor Current Min | -80A |
| Battery Current Max | 30A |
| Battery Current Min | -15A |
| Battery Cutoff Start | 64V |
| Battery Cutoff End | 60V |
| Regen Cutoff Start | 83V |
| Regen Cutoff End | 85V |

### For E-bike (48V, 3000W motor)

| Setting | Value |
|---------|-------|
| Motor Current Max | 80A |
| Motor Current Min | -50A |
| Battery Current Max | 60A |
| Battery Current Min | -25A |
| Battery Cutoff Start | 42V |
| Battery Cutoff End | 39V |

---

## ESC Fault Time

The `fault_stop_time_ms` parameter controls how long the VESC waits before restarting after a fault.

**Default:** 500ms (0.5 seconds)

**When to Adjust:**
- **Too short:** VESC may restart during a short-circuit, causing damage
- **Too long:** Delays recovery after benign faults

**Recommendation:** Keep at 500ms unless you have specific reasons to change.

---

## Common Beginner Mistakes

### Mistake 1: Motor Amps = Battery Amps

**Wrong:** Setting both to the same value (e.g., 60A motor, 60A battery)
**Problem:** At low speeds, you'll hit battery limit before motor can deliver full torque
**Correct:** Motor amps typically 1.5-3× higher than battery amps

### Mistake 2: Setting Battery Current Too High

**Wrong:** "My battery is 12S4P with 30Q, so 60A!"
**Problem:** No safety margin, cells stressed at peak
**Correct:** 60A × 0.85 = 50A max

### Mistake 3: Ignoring Regen Limits

**Wrong:** Setting regen to match discharge current
**Problem:** Cells can't charge as fast as they discharge
**Correct:** Check cell charging specs, typically 1/3 to 1/4 of discharge rate

### Mistake 4: Voltage Cutoffs Too Aggressive

**Wrong:** Setting cutoff end to 2.5V per cell
**Problem:** Cells may be damaged at this voltage
**Correct:** 3.0V per cell minimum (3.2V for longevity)

### Mistake 5: Running Motor Detection with Load

**Wrong:** Trying to detect motor while wheel touches ground
**Problem:** Detection fails, incorrect parameters
**Correct:** Always detect with wheel free-spinning

---

## Troubleshooting Common Issues

### "Fault: ABS Over Current"

**Cause:** Motor current exceeded `l_abs_current_max`
**Fix:**
1. Check motor phase wires (short circuit?)
2. Increase `l_abs_current_max` if you're sure wiring is correct
3. Run motor detection again

### "Fault: Over Voltage"

**Cause:** Voltage exceeded max during regen braking
**Fix:**
1. Lower regen current limits
2. Increase `l_max_vin` if your battery is higher voltage
3. Set proper regen cutoff voltages

### "Fault: DRV" or "DRV8302"

**Cause:** Driver chip error (often hardware damage)
**Fix:**
1. Check for shorts in motor phase wires
2. Check for water damage
3. May require VESC repair/replacement

### Motor Won't Spin

**Checklist:**
1. ✅ Motor detection completed?
2. ✅ PPM/ADC calibrated?
3. ✅ App selected (PPM, ADC, etc.)?
4. ✅ Timeout not active? (check remote connection)
5. ✅ No faults showing?

---

## Glossary

| Term | Meaning |
|------|---------|
| **S** | Series - cells wired in series (adds voltage) |
| **P** | Parallel - cells wired in parallel (adds capacity/current) |
| **Duty Cycle** | Percentage of max voltage applied to motor |
| **ERPM** | Electrical RPM = Mechanical RPM × Motor Pole Pairs |
| **FOC** | Field Oriented Control - advanced motor control mode |
| **Regen** | Regenerative braking - returns energy to battery |
| **Cutoff** | Voltage at which power is reduced or stopped |

---

## References

- Source: `bldc/datatypes.h:386-420` - Motor configuration structure
- Source: `bldc/mc_interface.c` - Motor control implementation
- VESC Project Wiki: https://vesc-project.com/

---

*Last updated: 2026-01-14 | Source verified against bldc repository*
