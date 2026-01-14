# VESC Firmware 6 Update Guide

**Source:** https://pev.dev/t/how-to-update-to-vesc-fw-6/454
**Views:** 6,031 (TOP #6 on pev.dev)
**Type:** Firmware update guide

---

## Prerequisites

This guide assumes you have a working VESC 5.3 setup. The process maintains motor and app configurations during the upgrade.

## Key Steps Overview

### 1. Document Current Settings

"Take note of your current Balance settings (for manual input later)" since new package configurations don't transfer automatically.

### 2. Download VESC Tool 6

Access via VESC-Project.com/vesc_tool. Log in, navigate to "Purchased Files," and download the version matching your operating system.

### 3. Backup Configurations

Create backups before flashing:
- Use the Backup Configs button on mobile
- Or access ConfBackup → Backup Configuration on desktop
- Additionally, save Motor and App XMLs individually with recognizable names

### 4. Flash Firmware

1. Navigate to Firmware menu
2. Select Included Files
3. Verify your controller model (e.g., Little_FOCer_V3_1)
4. Upload the VESC_default.bin file
5. The controller reboots automatically after ~10 seconds

### 5. Restore Configs

Use the Restore Configs button or load XMLs individually through the File menu.

## ⚠️ Critical Configuration Changes

After restoring backups, make two essential adjustments:

1. **App to Use:** Set to **UART** (not "None") under App CFG → General to preserve Bluetooth functionality
2. **Accel Lowpass Filter Z:** Set to **1.0 Hz** under App CFG → IMU (addresses nose hunting/IMU confusion)

## Package Installation

1. Access the VESC Packages tab
2. Click "Update Archive" to refresh available packages
3. Install either the "Float" or "Balance" package
4. Disconnect and reconnect for UI updates

**Note:** iOS packages tab has known bugs; use Desktop or Android for this step.

## Important Warnings

- "if you want to keep using backup for your current v6.0 config...you need to save your 5.3 configs to XML files" due to single-backup memory limitations
- Changing App to Use to "None" may disable Bluetooth permanently
- XML overwrites may fail; maintain separate folders for different tune files
