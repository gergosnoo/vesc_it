# Configuration Backup & Restore Guide

## Overview

**Key Terms:** backup configuration, restore configuration, save settings, export XML, import XML, VESC backup, configuration file, settings backup, firmware update backup, config restore

This guide covers how to backup, restore, and manage VESC configurations in VESC Tool.

**Source:** vesc_tool/vescinterface.cpp, vesc_tool/configparams.cpp

---

## Why Backup Your Configuration?

**Backup before:**
- Firmware updates (settings may reset)
- Trying new parameters
- Sharing your setup
- Hardware changes

**Backups save:**
- Motor configuration (current limits, FOC settings)
- App configuration (input modes, CAN settings)
- Custom configuration (Refloat parameters, etc.)

---

## Quick Backup Methods

### Method 1: Built-in Backup (Recommended)

**Location:** Tools → Backup Configuration

**Steps:**
1. Connect to VESC
2. Go to **Tools → Backup Configuration**
3. Enter optional name (e.g., "Working 2024-01-15")
4. Click OK

**What it saves:**
- Motor config (all parameters)
- App config (all parameters)
- Custom config (if available)
- Linked to your VESC's UUID

**Restore:**
1. Connect to VESC
2. Go to **Tools → Restore Configuration**
3. Backup automatically matched by UUID

### Method 2: XML Export

**Location:** File menu or toolbar

**For Motor Configuration:**
1. Go to **Motor Settings** tab
2. Click **File → Save Motor Configuration** (or toolbar icon)
3. Choose location and filename
4. Saved as `.xml` file

**For App Configuration:**
1. Go to **App Settings** tab
2. Click **File → Save App Configuration**
3. Choose location and filename
4. Saved as `.xml` file

---

## Detailed Backup Procedures

### Full Backup (All Settings)

**Best practice before firmware update:**

1. **Motor Config:**
   - Motor Settings → File → Save Motor Configuration
   - Name: `motor_YYYY-MM-DD.xml`

2. **App Config:**
   - App Settings → File → Save App Configuration
   - Name: `app_YYYY-MM-DD.xml`

3. **Package Config (if using Float/Refloat):**
   - VESC Packages → Your Package → Export Settings
   - Or screenshot all values

4. **Built-in Backup:**
   - Tools → Backup Configuration
   - Name with date for reference

### Quick Backup (Built-in Only)

For routine changes:
1. Tools → Backup Configuration
2. Enter descriptive name
3. Done (stored in VESC Tool settings)

---

## Restoring Configurations

### From Built-in Backup

**Steps:**
1. Connect to VESC
2. Go to **Tools → Restore Configuration**
3. If backup exists for this VESC, it auto-restores
4. Verify settings loaded correctly

**If backup doesn't match:**
- Built-in backup is UUID-specific
- Use XML restore instead

### From XML Files

**Motor Configuration:**
1. Go to **Motor Settings** tab
2. Click **File → Load Motor Configuration**
3. Select your `.xml` file
4. Click **Write Motor Configuration** (M button)

**App Configuration:**
1. Go to **App Settings** tab
2. Click **File → Load App Configuration**
3. Select your `.xml` file
4. Click **Write App Configuration** (A button)

**Important:** Always click **Write** after loading XML!

---

## Backup After Firmware Update

### Pre-Update Checklist

1. ✅ Export Motor XML
2. ✅ Export App XML
3. ✅ Screenshot package settings
4. ✅ Create built-in backup
5. ✅ Note firmware version

### Post-Update Steps

1. **Do NOT immediately restore old config**
2. Run **Motor Wizard** to detect motor
3. Verify detection results
4. **Then** load your old XML files
5. Compare critical values:
   - Current limits
   - Voltage cutoffs
   - FOC settings

### Why Not Direct Restore?

Some parameters change between firmware versions:
- New parameters added
- Old parameters deprecated
- Default values improved

**Safe approach:** Motor wizard first, then selectively restore.

---

## Managing Multiple VESCs

### CAN Bus Multi-Backup

**Backup all connected VESCs:**
1. Tools → Backup Configuration (All VESCs over CAN)
2. Each VESC backed up with its UUID
3. Names can be added for each

**Restore all:**
1. Tools → Restore Configuration (All VESCs over CAN)
2. Each VESC gets its matching backup

### Per-VESC XML Files

**Organization suggestion:**
```
vesc_configs/
├── front_motor/
│   ├── motor_2024-01-15.xml
│   └── app_2024-01-15.xml
├── rear_motor/
│   ├── motor_2024-01-15.xml
│   └── app_2024-01-15.xml
└── README.txt (notes about setup)
```

---

## Configuration File Format

### XML Structure

Motor config (`MCConfiguration`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<MCConfiguration>
  <ConfigVersion>5</ConfigVersion>
  <l_current_max>60.000000</l_current_max>
  <l_current_min>-60.000000</l_current_min>
  <l_in_current_max>40.000000</l_in_current_max>
  <!-- ... more parameters ... -->
</MCConfiguration>
```

App config (`APPConfiguration`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<APPConfiguration>
  <ConfigVersion>5</ConfigVersion>
  <app_to_use>3</app_to_use>
  <can_baud_rate>2</can_baud_rate>
  <!-- ... more parameters ... -->
</APPConfiguration>
```

### Built-in Backup Format

Stored in VESC Tool settings:
- Compressed with LZO algorithm
- Base64 encoded
- Keyed by VESC UUID

---

## Version Compatibility

### Same Major Version

Example: 5.3 → 5.4
- Usually compatible
- Load XML directly
- Verify new parameters

### Major Version Change

Example: 5.x → 6.x
- Run motor wizard first
- Selectively restore values
- Check for deprecated parameters

### Parameter Migration

Some parameters renamed between versions:

| Old (5.x) | New (6.x) | Action |
|-----------|-----------|--------|
| `foc_duty_dowmramp_kp` | `foc_duty_downramp_kp` | Typo fixed |
| Various | Various | Check release notes |

---

## Troubleshooting Restore Issues

### "Configuration doesn't match firmware"

**Cause:** XML from different firmware version

**Fix:**
1. Load XML anyway (values that exist will load)
2. Run motor detection
3. Verify critical parameters manually

### "No backup found for this VESC"

**Cause:** Built-in backup is UUID-specific

**Fix:**
1. Use XML restore instead
2. Or manually copy values from old backup

### "Motor behaves differently after restore"

**Causes:**
1. Motor wizard not run after firmware update
2. Flux linkage changed
3. Observer gain needs recalibration

**Fix:**
1. Run motor wizard
2. Manually tune observer if needed
3. Compare with previous working config

### "App settings not taking effect"

**Cause:** Didn't click Write button

**Fix:**
1. Load XML
2. Click **Write App Configuration** button
3. Verify with Read button

---

## Best Practices

### Backup Naming Convention

```
motor_[board]_[date]_[notes].xml
app_[board]_[date]_[notes].xml

Examples:
motor_ow_2024-01-15_working.xml
motor_ow_2024-01-20_testing-foc.xml
app_ow_2024-01-15_ppm-remote.xml
```

### When to Backup

- ✅ Before any firmware update
- ✅ After successful tuning
- ✅ Before experimenting
- ✅ Monthly routine backup
- ✅ Before sharing board

### What to Document

Keep a text file with:
- Firmware version
- Hardware (VESC model)
- Motor specs
- Battery configuration
- Any special notes

### Backup Storage

- Store XML files in cloud (Dropbox, Google Drive)
- Keep multiple versions
- Don't delete old working configs
- Share with community (anonymize if needed)

---

## Quick Reference

### Backup Shortcuts

| Action | Location |
|--------|----------|
| Quick backup | Tools → Backup Configuration |
| Motor XML | Motor Settings → File → Save |
| App XML | App Settings → File → Save |
| Package settings | Screenshot or export |

### Restore Shortcuts

| Action | Location |
|--------|----------|
| Quick restore | Tools → Restore Configuration |
| Motor XML | Motor Settings → File → Load → Write |
| App XML | App Settings → File → Load → Write |

### Critical Parameters to Verify

After any restore, check:
- [ ] Motor current limits
- [ ] Battery current limits
- [ ] Voltage cutoffs
- [ ] FOC settings (if manually tuned)
- [ ] Input configuration

---

## References

- Source: `vesc_tool/vescinterface.cpp:4483-4810` - Backup/restore logic
- Source: `vesc_tool/configparams.cpp:1023-1245` - XML serialization
- Related: `vesc-firmware-update-guide.md` - Update procedure
- Related: `vesc-beginner-settings-guide.md` - Parameter reference

---

*Last updated: 2026-01-14 | Source verified against vesc_tool repository*
