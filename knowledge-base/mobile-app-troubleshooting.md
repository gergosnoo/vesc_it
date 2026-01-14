# Mobile App Troubleshooting Guide

## Overview

**Key Terms:** VESC app, iPhone app, Android app, Bluetooth not connecting, BLE pairing, Floaty app, Float Control, mobile app not working, app not seeing board, settings not saving, iOS VESC, Android VESC

This guide covers troubleshooting common issues with VESC mobile apps on iOS and Android.

**Source:** Community reports, vesc_express firmware, app documentation

---

## Common Apps

| App | Platform | Purpose |
|-----|----------|---------|
| VESC Tool Mobile | iOS/Android | Official configuration |
| Floaty | iOS | Float/Refloat monitoring |
| Float Control | Android | Float/Refloat monitoring |
| VESC Gauge | iOS/Android | Simple telemetry display |

---

## Connection Issues

### "App Not Seeing Board"

**Symptoms:**
- No devices in Bluetooth scan
- Scan completes but board not listed
- "No VESC found" message

**Fixes:**

1. **Check Bluetooth is ON**
   - Phone Settings → Bluetooth → ON
   - Also check app has Bluetooth permission

2. **Board Must Be ON**
   - VESC needs power to advertise BLE
   - Check battery voltage

3. **Correct BLE Module**
   - Needs VESC Express (ESP32) or NRF module
   - Standard VESC has no Bluetooth

4. **Distance and Interference**
   - Stay within 5 meters
   - Move away from WiFi routers
   - Avoid metal enclosures blocking signal

5. **Restart Everything**
   ```
   1. Force close app
   2. Turn off phone Bluetooth
   3. Power cycle board
   4. Turn on phone Bluetooth
   5. Open app and scan
   ```

### "Connection Drops Frequently"

**Causes:**
- Weak BLE signal
- Phone power saving
- Interference

**Fixes:**

1. **Disable phone battery optimization for app**
   - Android: Settings → Apps → [App] → Battery → Unrestricted
   - iOS: Generally not needed

2. **Check antenna connection**
   - VESC Express antenna must be connected
   - Antenna should not be inside metal box

3. **Update firmware**
   - Old BLE firmware may have bugs
   - Update VESC Express to latest

---

## iOS-Specific Issues

### "iPhone VESC App Silently Fails to Save"

**Symptom:** Tap Write/Save, no error shown, but settings don't persist.

**Causes:**
1. Bluetooth permission revoked
2. App backgrounded during write
3. Connection lost during write

**Fixes:**

1. **Check Bluetooth Permission**
   - Settings → Privacy → Bluetooth → [App] → ON

2. **Keep App in Foreground**
   - Don't switch apps during write
   - Keep phone awake
   - Wait for confirmation message

3. **Verify Write Completed**
   - After write, tap Read to verify
   - If values changed back, write failed

4. **Force Reconnect**
   ```
   1. In app: Disconnect
   2. Force close app (swipe up)
   3. Reopen app
   4. Reconnect to board
   5. Try write again
   ```

### "Floaty App Not Connecting"

**iOS Requirements:**
- iOS 14.0 or later
- Bluetooth permission granted
- Location permission (required for BLE scanning on iOS)

**Troubleshooting:**

1. **Grant Location Permission**
   - Settings → Privacy → Location Services → [App] → While Using

2. **Check Board has Float/Refloat**
   - Floaty only works with Float package installed
   - Verify in VESC Tool: VESC Packages → Float or Refloat

3. **BLE Must Be Enabled in Float Config**
   - VESC Tool → Float/Refloat → App CFG
   - Enable "BLE" or "UART" output

4. **Reset Bluetooth**
   ```
   Settings → Bluetooth → OFF
   Wait 10 seconds
   Settings → Bluetooth → ON
   Rescan in app
   ```

### "iOS App Shows Wrong Values"

**Cause:** Cached data or sync issue

**Fix:**
1. Force close app
2. Reopen and reconnect
3. Pull down to refresh (if available)
4. Delete and reinstall app as last resort

---

## Android-Specific Issues

### "Float Control Not Seeing Board"

**Permissions Required:**
- Bluetooth (always)
- Location (required for BLE scanning)
- Nearby Devices (Android 12+)

**Check Permissions:**
1. Settings → Apps → Float Control → Permissions
2. Enable: Bluetooth, Location, Nearby Devices
3. Restart app

### "Android App Disconnects When Screen Off"

**Cause:** Aggressive battery optimization

**Fix:**
1. Settings → Apps → [App] → Battery
2. Select "Unrestricted" or "Don't optimize"
3. Also disable "Adaptive Battery" for this app

### "BLE Scan Shows Nothing"

**Android 12+ Requirements:**

1. **Nearby Devices Permission**
   - New permission in Android 12
   - Settings → Apps → [App] → Permissions → Nearby Devices → Allow

2. **Location Mode**
   - Location services must be ON for BLE scanning
   - Even if app doesn't need location data

3. **Check BLE vs Classic Bluetooth**
   - VESC uses BLE (Bluetooth Low Energy)
   - Regular Bluetooth pairing won't work
   - Don't pair in phone settings - use app

### "App Crashes on Launch"

**Fixes:**
1. Clear app cache:
   - Settings → Apps → [App] → Storage → Clear Cache

2. Update app:
   - Play Store → [App] → Update

3. Reinstall:
   - Uninstall app
   - Reinstall from Play Store

---

## BLE Pairing Issues

### "Board Shows in Scan but Won't Connect"

**Causes:**
1. Old pairing data
2. Board connected to different phone
3. Firmware mismatch

**Fixes:**

1. **Remove Old Pairing**
   - Phone Settings → Bluetooth → [Board] → Forget
   - Then scan fresh in app

2. **Check Other Connected Devices**
   - Only one phone can connect at a time
   - Disconnect from other phone first

3. **Restart Board**
   - Power cycle the board
   - Try connecting immediately after power on

### "Pairing Fails with Error"

**Generic troubleshooting:**

1. **Update Everything**
   - Update phone OS
   - Update app
   - Update VESC/Express firmware

2. **Reset BLE on Board**
   - VESC Tool (USB) → App Settings → BLE
   - Reset to defaults
   - Change BLE name if needed

3. **Try Different Phone**
   - Rules out phone-specific issues
   - If works on other phone, phone issue

---

## App Settings Issues

### "Settings Don't Save to Board"

**Verify Save Process:**
1. Change setting in app
2. Tap Write/Save button
3. Wait for confirmation
4. Tap Read to verify
5. If different, save failed

**Common Causes:**
1. Disconnected during write
2. App doesn't have write capability
3. Board in locked state

### "App Shows Different Values Than VESC Tool"

**Causes:**
1. Different config read
2. Stale data in app
3. Unit conversion difference

**Fix:**
1. In app: Force reconnect
2. Compare exact parameter names
3. Some apps show processed values

---

## VESC Express WiFi Issues

### "Can't Connect via WiFi"

**Check These:**

1. **WiFi Enabled on VESC Express**
   - VESC Tool → App Settings → VESC Express
   - WiFi: ON

2. **Correct Network**
   - Express creates AP: "VESC_[ID]"
   - Connect phone to this network
   - Default password in Express settings

3. **IP Address**
   - Default: 192.168.4.1
   - Connect via browser or app

### "WiFi Connected but No Response"

**Fixes:**
1. Disable mobile data on phone
2. Use browser: http://192.168.4.1
3. Check VESC Express is powered
4. Restart Express module

---

## Recommended Troubleshooting Order

### For Any Connection Issue

```
1. Restart phone Bluetooth
2. Power cycle board
3. Force close app
4. Reopen app and scan
5. If still failing:
   - Check permissions
   - Try different app
   - Connect via USB to verify board works
```

### For iOS

```
1. Check Bluetooth permission
2. Check Location permission (for BLE scan)
3. Remove old pairing in Settings
4. Restart phone
5. Reinstall app
```

### For Android

```
1. Check all permissions (Bluetooth, Location, Nearby Devices)
2. Disable battery optimization
3. Enable Location Services
4. Clear app cache
5. Reinstall app
```

---

## Quick Reference

### Permission Checklist

| Permission | iOS | Android | Purpose |
|------------|-----|---------|---------|
| Bluetooth | Required | Required | BLE communication |
| Location | Required for scan | Required for scan | BLE discovery |
| Nearby Devices | N/A | Android 12+ | BLE discovery |
| Background Refresh | Optional | Via battery settings | Background connection |

### Common Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| "No devices found" | BLE scan empty | Check board on, permissions |
| "Connection failed" | Can't establish link | Restart both, check distance |
| "Write failed" | Settings not saved | Stay connected, retry |
| "Timeout" | Board not responding | Power cycle, check connection |

---

## References

- Source: `vesc_express/` - ESP32 BLE/WiFi firmware
- Source: Community reports from pev.dev, Reddit
- Related: `vesc-express-wifi-ble-setup.md` - BLE setup guide
- Related: `can-uart-integration-guide.md` - Wired alternatives

---

*Last updated: 2026-01-14 | Community-verified troubleshooting*
