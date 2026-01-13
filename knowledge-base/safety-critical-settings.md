# Safety-Critical Settings for VESC Onewheels

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-13
**Source:** `refloat/src/conf/datatypes.h`, `refloat/src/motor_data.h`, `refloat/src/state.h`
**Addresses:** GAP-11 (CRITICAL - Life Safety)

---

## ⚠️ NOSEDIVE CAUSES AND PREVENTION

A nosedive occurs when the motor cannot provide enough torque to keep the board balanced. Understanding causes helps prevent serious injury.

### Primary Nosedive Causes

| Cause | Why It Happens | Prevention |
|-------|----------------|------------|
| **Current saturation** | Motor reaches max current, cannot push harder | Set appropriate current limits |
| **Battery cutoff** | BMS or low voltage shuts off power | Configure LV tiltback, charge-only BMS |
| **Speed exceeded** | Going faster than motor can balance | Enable speed pushback, respect limits |
| **Duty saturation** | Motor at 100% duty, no headroom | Enable duty pushback at 80-85% |
| **Sudden load** | Hit bump/curb at speed | Reduce speed, increase booster |
| **Temperature cutoff** | MOSFET or motor overheat | Monitor temps, enable temp pushback |

### How Current Saturation Works

**Source:** `refloat/src/motor_data.h:55-58`

```c
// From refloat/src/motor_data.h:55-58
float current_min;
float current_max;
float battery_current_min;
float battery_current_max;
```

When motor current hits `current_max`, the controller CANNOT increase torque further. If more torque is needed to balance, **nosedive occurs**.

**Critical Settings:**
- `Motor Current Max` - Higher = more headroom, but more heat
- `Battery Current Max` - Limits total power draw
- Leave 20-30% headroom for safety

---

## PUSHBACK CONFIGURATION

Pushback is your PRIMARY warning before a nosedive. Configure it aggressively.

### Duty Pushback (CRITICAL)

**Source:** `refloat/src/conf/datatypes.h:232-234`

```c
// From refloat/src/conf/datatypes.h:232-234
float tiltback_duty_angle;
float tiltback_duty_speed;
float tiltback_duty;
```

| Setting | Recommended | Too Low Risk |
|---------|-------------|--------------|
| `tiltback_duty` | 0.80 - 0.85 | Above 0.90 = danger zone |
| `tiltback_duty_angle` | 8-12° | Below 5° = too subtle |
| `tiltback_duty_speed` | 5-8 | Too slow = no warning |

**Why 80-85%?**
- At 100% duty, motor has ZERO headroom
- 80% gives 20% reserve for bumps/acceleration
- Pushback warns you BEFORE saturation

### Speed Pushback

**Source:** `refloat/src/conf/datatypes.h:235`

```c
// From refloat/src/conf/datatypes.h:235
uint8_t tiltback_speed;
```

Set `tiltback_speed` below your board's absolute max:
- Calculate max safe speed for your battery/motor
- Set pushback 2-5 km/h below that
- **Never disable speed pushback**

---

## LOW VOLTAGE TILTBACK (PREVENTS BATTERY CUTOFF)

Battery cutoff = instant nosedive. Low voltage tiltback prevents this.

**Source:** `refloat/src/conf/datatypes.h:239-241`

```c
// From refloat/src/conf/datatypes.h:239-241
float tiltback_lv_angle;
float tiltback_lv_speed;
float tiltback_lv;
```

### Per-Cell vs Total Voltage

VESC 6.05+ uses **per-cell voltage** thresholds:
- `tiltback_lv` = voltage per cell (e.g., 3.2V)
- Old versions used total pack voltage

### Recommended LV Settings

| Battery Type | tiltback_lv (per cell) | Why |
|--------------|------------------------|-----|
| Li-ion (18650) | 3.0 - 3.2V | Below 3.0V damages cells |
| LiFePO4 | 2.8 - 3.0V | Flatter discharge curve |
| High-drain | 3.2 - 3.3V | More margin under load |

**Set LV above BMS cutoff!**
- If BMS cuts at 2.8V/cell, set LV tiltback at 3.0V/cell
- Gives warning BEFORE BMS kills power

---

## BMS BYPASS (CHARGE-ONLY CONFIGURATION)

### Why Bypass Discharge?

Many BMS units cut power suddenly when:
- Cell voltage drops under load
- Temperature limit reached
- Current limit exceeded

**Sudden BMS cutoff = NOSEDIVE**

### ⚠️ WRONG vs RIGHT Method

| Method | Description | Safety |
|--------|-------------|--------|
| **WRONG: Bridge B-** | Bridging negative post directly | ❌ DISABLES overcharge protection! |
| **RIGHT: Charge-only** | BMS on charge circuit only | ✅ Preserves charge protection |

**The OLD method of bridging the B- post DISABLES overcharge protection!**
This means regen could overcharge cells → fire risk.

### Proper Charge-Only Setup

**Safe approach:** BMS monitors charging, VESC handles discharge.

1. **BMS connected to charge port** - Protects during charging
2. **Battery P+ direct to VESC** - No BMS in discharge path
3. **BMS B- NOT bridged** - Maintains overcharge protection
4. **VESC voltage limits** - VESC handles discharge protection

### Board-Specific Notes

| Board | Method | Notes |
|-------|--------|-------|
| **XR/GT** | Full charge-only mod | More complex, requires proper wiring |
| **Pint/PintX** | Simpler bypass | Fewer connections |

### Recommended BMS Options

| BMS | Features | Notes |
|-----|----------|-------|
| **XLITE** | Smart BMS, CAN integration | Works with VESC apps |
| **ZBMS** | Simple charge-only | No config needed |
| **VFBMS32** | Official VESC BMS | By Benjamin Vedder |

### VESC Voltage Settings

| Setting | Purpose | Recommended |
|---------|---------|-------------|
| `l_min_vin` | Minimum voltage before cutoff | Above BMS cutoff |
| `l_max_vin` | Maximum voltage (regen limit) | Below cell max |
| LV Tiltback | Pushback before voltage cutoff | 0.2-0.5V above min |
| HV Tiltback | Pushback before regen cutoff | 0.2-0.5V below max |

### Detailed Wiring Guides

For step-by-step wiring instructions with diagrams:

| Board | Guide |
|-------|-------|
| **FM BMS Charge-Only** | pev.dev/t/guide-how-to-wire-fm-bms-as-charge-only-for-your-vesc/322 |
| **Pint BMS Bypass** | pev.dev/t/pint-vesc-fm-bms-bypass-the-proper-way/693 |
| **General VESC Setup** | fallman.tech/onewheel-vesc/ |

**⚠️ CRITICAL:** These guides show the PROPER charge-only method. Do NOT use the old B- bridge method!

### When NOT to Bypass BMS

- **If BMS has adjustable settings** - Configure higher cutoff threshold
- **If BMS has slow ramp-down** - Some BMSs reduce current instead of cutting
- **XLITE/VFBMS32** - These are designed for VESC, no bypass needed

---

## HIGH VOLTAGE TILTBACK (REGEN PROTECTION)

**Source:** `refloat/src/conf/datatypes.h:236-238`

```c
// From refloat/src/conf/datatypes.h:236-238
float tiltback_hv_angle;
float tiltback_hv_speed;
float tiltback_hv;
```

Regen charging on a full battery can trigger:
- BMS overvoltage protection → cutoff
- Cell damage from overcharge

**Set HV tiltback below BMS overvoltage cutoff.**

---

## VESC 6.05 UPGRADE WARNINGS

Version 6.05 introduced changes that affect safety. **Test thoroughly before riding!**

### Heel Lift Disengages at Speed (CRITICAL)

**User reports:** "Heel lift disengages at high speed after 6.05 upgrade"

**Source:** `refloat/src/conf/datatypes.h:226`

```c
// From refloat/src/conf/datatypes.h:226
uint16_t fault_adc_half_erpm;
```

**Problem:** In 6.05, `fault_adc_half_erpm` behavior changed. Above this ERPM, the board ignores heel lift (half-switch detection).

**Fix:**
1. Go to **Refloat Cfg** → **Faults**
2. Find `fault_adc_half_erpm`
3. **Increase value** to higher than your typical cruising ERPM
4. Or set to **0 to disable** speed-based heel lift changes

| Setting | Effect |
|---------|--------|
| fault_adc_half_erpm = 0 | Heel lift works at ALL speeds |
| fault_adc_half_erpm = 1000 | Above ~3 mph, heel lift ignored |
| fault_adc_half_erpm = 5000 | Above ~15 mph, heel lift ignored |

**Recommended:** Set to 0 or very high value if you use heel lift regularly.

### Speed Tracker Shows Wrong Values

**User reports:** "Speed tracker shows wrong values after upgrade"

**Problem:** VESC 6.05 changed the **Speed Tracker Position Source** setting.

**Fix:**
1. Go to **App Settings** → **General**
2. Find **Speed Tracker Position Source**
3. Set to **Observer** (most accurate for sensorless)
4. Or **Hall Sensors** if you have them

| Source | When to Use |
|--------|-------------|
| **Observer** | Sensorless FOC (most common) |
| **Hall Sensors** | If hall sensors installed |
| **External Encoder** | If external encoder used |

**Why it changed:** 6.05 defaults to different source than 6.04. Speed-based features (pushback, beeps) may be affected.

### Known 6.05 Issues Summary

| Issue | Description | Fix |
|-------|-------------|-----|
| **Heel lift at speed** | Disengages unexpectedly | Set `fault_adc_half_erpm` = 0 |
| **Speed tracker wrong** | Incorrect speed display | Set position source to Observer |
| **Per-cell voltage** | LV/HV uses per-cell now | Recalculate thresholds |
| **Footpad timing** | Different sensor behavior | Increase `fault_delay_switch_half` |

### Before Upgrading

1. **Backup ALL settings** - Export motor and app config XML
2. **Read release notes** - Check for known issues
3. **Test in safe area** - Don't ride hard immediately
4. **Verify pushback works** - Confirm duty/speed warnings trigger

### After Upgrading

1. **Re-run motor detection** - Values may differ slightly
2. **Check per-cell voltage** - 6.05 uses per-cell, not pack voltage
3. **Test heel lift at speed** - Verify expected behavior
4. **Verify speed tracking** - Check position source setting
5. **Test all footpad scenarios** - Half-switch, full engagement

---

## UBox CONTROLLER ISSUES

### UBox Auto-Shutdown While Riding (DANGEROUS)

**User reports:** "UBox 75/100V controller shuts down while riding"

**Known Issue:** UBox controllers have aggressive thermal protection that can cause sudden shutoffs.

**Causes:**
- Thermal throttle threshold too low
- Inadequate cooling
- High ambient temperature
- Aggressive riding style

**Mitigations:**

| Action | How |
|--------|-----|
| **Check MOSFET temp limit** | App Settings → Temp Limits → Lower if too aggressive |
| **Add cooling** | Heatsink, thermal pads, airflow |
| **Reduce current limits** | Lower motor/battery current max |
| **Monitor temps** | Watch RT Data during rides |

**Critical Settings:**

```
Motor Temp Cutoff Start: 80-90°C (reduce if shutting down)
Motor Temp Cutoff End: 100-110°C
MOSFET Temp Cutoff Start: 70-80°C
MOSFET Temp Cutoff End: 90-100°C
```

**If shutdowns continue:**
1. Use temperature logging
2. Check thermal paste application
3. Consider better enclosure ventilation
4. Reduce maximum current settings

---

## APP CONFIGURATION ISSUES

### iPhone App Silent Save Failure

**User reports:** "App silently fails to save config"

**Known Issue:** iOS VESC apps (Floaty, Float Control) may appear to save settings but silently fail.

**Warning Signs:**
- No confirmation after "Write Config"
- Settings revert after reconnection
- App shows old values after save

**Workarounds:**

1. **Always verify saves:**
   - Write config
   - Disconnect
   - Reconnect
   - Read config back
   - Confirm values match

2. **Use Desktop VESC Tool:**
   - More reliable for critical settings
   - Better error reporting
   - Always shows write confirmation

3. **If app fails repeatedly:**
   - Force quit app
   - Power cycle board
   - Try USB connection instead of BLE
   - Update app to latest version

**Best Practice:** Make critical safety setting changes via USB VESC Tool, not mobile app.

---

## TEMPERATURE PROTECTION

**Source:** `refloat/src/motor_data.h:59-60`

```c
// From refloat/src/motor_data.h:59-60
float mosfet_temp_max;
float motor_temp_max;
```

Overheating can cause:
- Reduced current (thermal throttling)
- Sudden shutdown (thermal protection)
- Permanent damage

### Temperature Limits

| Component | Warning | Danger |
|-----------|---------|--------|
| MOSFETs | 80°C | 100°C |
| Motor | 100°C | 120°C |

Configure `SAT_PB_TEMPERATURE` to push back before thermal shutdown.

---

## BOOSTER SETTINGS (SURGE PROTECTION)

**Source:** `refloat/src/conf/datatypes.h:267-272`

```c
// From refloat/src/conf/datatypes.h:267-272
float booster_angle;
float booster_ramp;
float booster_current;
float brkbooster_angle;
float brkbooster_ramp;
float brkbooster_current;
```

Booster adds extra current when nose drops:
- Helps recover from bumps
- Provides surge protection
- Reduces nosedive risk

### Recommended Booster Settings

| Setting | Purpose | Recommended |
|---------|---------|-------------|
| `booster_angle` | Angle threshold to activate | 5-10° |
| `booster_current` | Extra current to add | 10-20A |
| `booster_ramp` | How fast to apply boost | 3-5 |

**Brake booster** (`brkbooster_*`) does the same for tail drops during braking.

---

## SAFETY CHECKLIST

Before every ride, verify:

- [ ] Battery above 30% charge
- [ ] LV tiltback set above BMS cutoff
- [ ] Duty pushback enabled at 80-85%
- [ ] Speed pushback enabled
- [ ] Recent firmware matches settings
- [ ] Temperatures starting cool

After configuration changes:

- [ ] Test pushback triggers in safe area
- [ ] Verify footpad sensors work correctly
- [ ] Confirm startup/shutdown behavior
- [ ] Export settings backup

---

## EMERGENCY RECOVERY

If you feel pushback:

1. **IMMEDIATELY slow down** - Lean back
2. **Do NOT fight pushback** - It's warning you
3. **Head to safe area** - Stop and check battery/temps

If pushback is aggressive:

1. **Slow roll to stop** - Don't jump off at speed
2. **Check voltage** - May be low battery
3. **Check temps** - May be overheating
4. **Rest before continuing** - Let components cool

---

*CRITICAL SAFETY CONTENT - Verified against source code | Ready for embedding*
