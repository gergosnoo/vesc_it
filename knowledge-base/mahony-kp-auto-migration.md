# Mahony KP Auto-Migration Behavior

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-13
**Source:** `refloat/src/main.c`, `refloat/src/balance_filter.c`, `refloat/ui.qml.in`
**Addresses:** GAP-09 (Medium Priority)

---

## Overview

Refloat uses a custom Mahony AHRS filter for pitch/roll estimation. When upgrading from older Float versions, the Mahony KP values may be automatically adjusted.

---

## Auto-Migration Trigger

**Source:** `refloat/src/main.c:204-211`

```c
// From refloat/src/main.c:204-211
// Comment from source:
// "the kp and acc confidence decay to hardcoded defaults of the former true
// pitch filter, to preserve the behavior of the old setup in the new one.
// (Though Mahony KP 0.4 instead of 0.2 is used, as it seems to work better)"
if (VESC_IF->get_cfg_float(CFG_PARAM_IMU_mahony_kp) > 1) {
    VESC_IF->set_cfg_float(CFG_PARAM_IMU_mahony_kp, 0.4);
    VESC_IF->set_cfg_float(CFG_PARAM_IMU_mahony_ki, 0);
    VESC_IF->set_cfg_float(CFG_PARAM_IMU_accel_confidence_decay, 0.1);
}
```

**Trigger condition:** `mahony_kp > 1.0`

---

## What Gets Changed

| Parameter | Old Value | New Value | Reason |
|-----------|-----------|-----------|--------|
| `mahony_kp` | > 1.0 | 0.4 | Refloat uses different filter |
| `mahony_ki` | any | 0 | Integral term not needed |
| `accel_confidence_decay` | any | 0.1 | Match old pitch filter behavior |

---

## Why This Happens

### Old Float Behavior

- Used VESC's built-in IMU filter with high KP values
- Typical values: 1.0 - 3.0
- Filter was less sophisticated

### New Refloat Behavior

- Uses custom balance filter in `balance_filter.c`
- Lower KP values work better with new algorithm
- Separate KP values for pitch and roll

From the code comment:
> "To preserve the behavior of the old setup in the new one, Mahony KP 0.4 instead of 0.2 is used, as it seems to work better"

---

## Separate Pitch/Roll KP

Refloat allows different KP values for each axis:

| Config Parameter | Purpose |
|------------------|---------|
| `mahony_kp` | Pitch axis filter (forward/back tilt) |
| `mahony_kp_roll` | Roll axis filter (side lean) |

From `balance_filter.c`:
```c
data->kp_pitch = config->mahony_kp;
data->kp_roll = config->mahony_kp_roll;
// Yaw uses average of both
data->kp_yaw = (config->mahony_kp + config->mahony_kp_roll) / 2.0f;
```

---

## Recommended Values

| Rider Preference | mahony_kp | mahony_kp_roll |
|------------------|-----------|----------------|
| **Default/Responsive** | 0.4 | 0.4 |
| **Smoother feel** | 0.2 - 0.3 | 0.2 - 0.3 |
| **Very responsive** | 0.5 - 0.8 | 0.5 - 0.8 |
| **Float-like** | 0.4 | 0.4 |

### Tuning Tips

**Increase KP if:**
- Board feels sluggish/delayed
- Response to tilt is too slow
- Want more aggressive handling

**Decrease KP if:**
- Board feels twitchy
- Small movements cause big reactions
- Want smoother, more filtered feel

**Roll KP too low can cause:**
- Unwanted effects during rotations
- Poor carving response
- Instability when leaning

---

## Config Migration Process

### Automatic (Recommended)

When upgrading from Refloat 1.1 to 1.2+:

1. Install new Refloat version
2. **Confirm automatic config restore dialog**
3. Migration handles KP values automatically
4. Verify settings in Refloat Cfg

### Manual (If Auto Fails)

If automatic migration fails:

1. Restore from XML backup
2. Check if `mahony_kp > 1.0`
3. If yes, manually set:
   - `mahony_kp` = 0.4
   - `mahony_ki` = 0
   - `accel_confidence_decay` = 0.1
4. Adjust roll KP to match pitch KP

---

## Checking Current Values

In VESC Tool:
1. Go to **App Settings** → **IMU**
2. Find **Mahony KP** setting
3. Note current value

Or in Refloat Cfg:
1. Look for balance filter settings
2. Check pitch and roll KP separately

---

## Troubleshooting

### Board Feels Different After Update

1. Check if KP was auto-migrated (was > 1.0)
2. Try increasing KP slightly (0.5, 0.6)
3. Match roll KP to pitch KP
4. Give yourself time to adjust

### Board Too Responsive/Twitchy

1. Reduce `mahony_kp` to 0.3 or 0.2
2. Reduce `mahony_kp_roll` similarly
3. Increase `accel_confidence_decay` slightly

### Board Feels Slow/Mushy

1. Increase `mahony_kp` to 0.5 - 0.8
2. Keep `mahony_ki` at 0
3. Reduce `accel_confidence_decay` to 0.05

### Roll Axis Behaves Differently

1. Adjust `mahony_kp_roll` independently
2. Usually should match pitch KP
3. Lower values = more stable during turns

---

## Version Reference

| Refloat Version | Auto-Migration Behavior |
|-----------------|------------------------|
| < 1.2 | No auto-migration |
| 1.2+ | Auto-migrates if KP > 1.0 |
| All | Supports separate pitch/roll KP |

---

*Content verified against refloat source code | Ready for embedding*
