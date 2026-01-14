# VESC Firmware Update Guide

## Overview

**Key Terms:** VESC firmware update, VESC FW6, firmware upgrade, VESC 5.3 to 6, update VESC safely, firmware flash, bootloader, VESC Tool update

This guide covers safely updating VESC firmware, specifically the upgrade process from version 5.3 to 6.x. The process maintains motor and app configurations during the upgrade.

**Source:** pev.dev community (6,031 views)

---

## Prerequisites

Before starting:

- ✅ Working VESC 5.3 setup (or current firmware)
- ✅ VESC Tool matching your current firmware
- ✅ VESC Tool for target firmware version
- ✅ USB connection (more reliable than Bluetooth)
- ✅ Time to complete the process without interruption

---

## Step 1: Document Current Settings

**⚠️ CRITICAL:** Balance package settings (Float/Refloat) don't transfer automatically to new packages.

Before updating, manually note these settings:

| Setting Category | What to Record |
|------------------|----------------|
| Balance Settings | All Float/Refloat tune parameters |
| Tiltback Values | Speed, duty, strength |
| Current Limits | Motor and battery limits |
| Any Custom Tunes | Save screenshots or write down values |

---

## Step 2: Download VESC Tool 6

1. Go to **VESC-Project.com/vesc_tool**
2. Log in to your account
3. Navigate to **"Purchased Files"**
4. Download version matching your operating system:
   - Windows: .exe installer
   - macOS: .dmg file
   - Linux: AppImage

---

## Step 3: Create Backups (ESSENTIAL)

**Multiple backup methods for safety:**

### Method 1: Backup Button (Mobile)

1. Open VESC Tool Mobile
2. Connect to your board
3. Tap **"Backup Configs"** button
4. Save backup to device

### Method 2: Configuration Backup (Desktop)

1. Open VESC Tool Desktop
2. Connect to VESC
3. Go to **ConfBackup → Backup Configuration**
4. Save to a known location

### Method 3: Individual XML Files (Recommended)

Save each configuration type separately:

```
Motor Settings > File > Save Motor Configuration XML
App Settings > File > Save App Configuration XML
Float/Refloat Cfg > Export to XML (if available)
```

**Pro Tip:** Name files with date and description:
- `motor_20260114_pre-fw6.xml`
- `app_20260114_pre-fw6.xml`

---

## Step 4: Flash Firmware

**⚠️ DO NOT INTERRUPT THIS PROCESS**

1. Navigate to **Firmware** menu
2. Select **Included Files**
3. Verify your controller model:
   - Little_FOCer_V3_1
   - UBOX_75V
   - etc.
4. Select **VESC_default.bin** file
5. Click **Upload**
6. Wait for completion (~10 seconds)
7. Controller reboots automatically

### What Happens During Flash

```
Uploading firmware...
[████████████████████] 100%
Rebooting controller...
Reconnecting...
Done!
```

---

## Step 5: Restore Configurations

### Option 1: Restore Button

1. Click **"Restore Configs"** button
2. Select your backup
3. Wait for restore to complete

### Option 2: Load XMLs Individually

1. **Motor Settings:** File → Load Motor Configuration XML
2. **App Settings:** File → Load App Configuration XML
3. Write each to VESC after loading

---

## ⚠️ Critical Post-Update Adjustments

**After restoring backups, make these two ESSENTIAL changes:**

### 1. App to Use Setting

**Location:** App CFG → General → App to Use

**Set to:** **UART** (NOT "None")

**Why:** Setting to "None" can permanently disable Bluetooth connectivity.

### 2. Accelerometer Lowpass Filter Z

**Location:** App CFG → IMU

**Set to:** **1.0 Hz**

**Why:** Addresses nose hunting and IMU confusion issues in FW6.

---

## Step 6: Install Balance Package

The Float/Refloat package must be reinstalled after firmware update:

1. Go to **VESC Packages** tab
2. Click **"Update Archive"** to refresh available packages
3. Select either:
   - **Float** (original package)
   - **Refloat** (recommended successor)
4. Click **Install**
5. Disconnect and reconnect for UI updates

### Platform Notes

| Platform | Status |
|----------|--------|
| Desktop | ✅ Recommended |
| Android | ✅ Works |
| iOS | ⚠️ Known bugs - use Desktop instead |

---

## Step 7: Restore Balance Settings

After package installation:

1. Re-enter your documented tune settings
2. Or import Float/Refloat XML if you exported it
3. Verify all values match your pre-update configuration

---

## Important Warnings

### Single Backup Memory

**Issue:** "If you want to keep using backup for your current v6.0 config...you need to save your 5.3 configs to XML files"

**Why:** The VESC only stores one backup. New FW6 backup overwrites old 5.3 backup.

**Solution:** Always save XML files in addition to using backup button.

### App to Use = None Danger

**Issue:** Changing App to Use to "None" may disable Bluetooth permanently

**Prevention:** Always set to **UART** after updates

### XML Overwrites May Fail

**Issue:** Sometimes XML imports don't apply all settings

**Solution:** Maintain separate folders for different tune files. Verify settings after import.

---

## Troubleshooting

### Can't Connect After Update

1. Wait 30 seconds - firmware may still be initializing
2. Power cycle the board completely
3. Try different USB port/cable
4. Check if bootloader mode accessible

### Motor Won't Spin After Update

1. Re-run motor detection
2. Verify motor XML was restored
3. Check App to Use = UART

### Balance Package Won't Install

1. Click "Update Archive" first
2. Try Desktop instead of Mobile
3. Check internet connection
4. Verify firmware compatibility

### Bluetooth Stopped Working

1. Check App to Use is not "None"
2. Set to UART
3. Power cycle board
4. If still broken, may need re-flash

---

## Update Checklist

| Step | Status |
|------|--------|
| Document balance settings | ☐ |
| Download new VESC Tool | ☐ |
| Create full backup | ☐ |
| Save XML files separately | ☐ |
| Flash firmware | ☐ |
| Restore configurations | ☐ |
| Set App to Use = UART | ☐ |
| Set Accel Lowpass = 1.0 Hz | ☐ |
| Install balance package | ☐ |
| Restore balance settings | ☐ |
| Test ride (careful!) | ☐ |

---

## References

- Source: pev.dev/t/how-to-update-to-vesc-fw-6/454 (6,031 views)
- Related: `vesc-error-recovery-guide.md` - Connection issues
- Related: `vesc-motor-wizard-guide.md` - Motor detection
- Related: `refloat-package-guide.md` - Package settings

---

*Last updated: 2026-01-14 | Source: pev.dev community content*
