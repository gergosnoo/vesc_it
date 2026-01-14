# VESC Firmware Updates: The SAFE Way

**Source:** https://pev.dev/t/vesc-firmware-updates-how-to-perform-updates-the-safe-way/2194
**Type:** Safety guide / Best practices

---

## Prerequisites

Before updating, gather these essentials:
- Compatible VESC firmware files (verified from official sources)
- Stable Bluetooth connection
- Latest VESC App version

## ⚠️ Key Safety Warnings

Firmware updates can introduce bugs affecting specific hardware. For instance, "firmware version 6.5 brought issues for users with Spintend controllers" and momentary switches. Community testing before upgrading is strongly recommended.

## Backup & Preparation Steps

1. **Connection verification:** Ensure you're connected to the controller itself, not the BMS or VESC Express. Check for the AppUI tab visibility.

2. **Configuration backup:** Save motor, app, and package configurations through VESC Tool, ensuring (Re)Float CFG tabs are visible before backing up.

3. **Disable packages:** Go to Float Cfg and enable "Disable Package" setting.

4. **Switch consideration:** UBOX users should use latching switches during updates to prevent accidental interruptions.

## Update Process

1. Download the correct firmware file for your hardware
2. Verify file integrity and consider renaming for clarity
3. Update bootloader if necessary using VESC Tool
4. Connect and initiate firmware upload
5. **CRITICAL:** Do not interrupt the update process, as this risks corrupting firmware

## Post-Update Verification

- Confirm VESC Tool displays the correct new firmware version
- Rerun motor wizard or manual calibration
- Update (Re)Float package to latest version
- Restore your backed-up configurations
