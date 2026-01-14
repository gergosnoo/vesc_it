# Common Setup Problems & Fixes

## Overview

**Key Terms:** VESC setup problems, throttle on/off, WiFi not showing, motor detection fails, BMS CAN not working, ESC powers off, motor sounds bad, firmware stuck, common VESC issues, setup troubleshooting

This guide addresses the most frequently asked setup problems from forums and community support.

**Source:** vesc-project.com forums, pev.dev, esk8 Reddit, GitHub issues

---

## Problem 1: Throttle Acts Like On/Off Switch

**Symptom:** Throttle goes from 15% to 100% instantly, no gradual control.

### Cause: Deadband or Input Range Misconfigured

**Fix 1: Check Input Range**
1. App Settings → ADC or PPM (your input type)
2. Look at **Pulsewidth** or **Voltage** readings
3. Set **Min** and **Max** to match your actual throttle range
4. Leave ~5% margin on each end

**Fix 2: Check Deadband**
```
If deadband is too high (e.g., 50%), small movements are ignored.
Recommended: 5-15% deadband
```

**Fix 3: Check Throttle Curve**
1. App Settings → [Input Type] → Throttle Curve
2. **Expo** should be 0 for linear, positive for softer start
3. **Natural** mode can feel more progressive

**Quick Test:**
- Move throttle slowly while watching RT Data → Duty Cycle
- Should increase smoothly, not jump

---

## Problem 2: VESC Express WiFi Not Showing

**Symptom:** Can't find VESC Express WiFi network on phone/computer.

### Cause: Usually 5V Power Issue

**The Fix:**

1. **Check 5V Supply**
   - VESC Express needs stable 5V from VESC
   - Measure between 5V and GND pins with multimeter
   - Should read 4.8-5.2V

2. **If No 5V:**
   - Check VESC's 5V regulator (some clones have weak ones)
   - Try powering Express from USB temporarily
   - Add external 5V regulator if VESC can't supply enough

3. **If 5V OK But Still No WiFi:**
   - Check antenna is connected
   - Verify WiFi enabled in Express settings
   - Default SSID: `VESC_[ID]`
   - Default password: in Express → App Settings

4. **Factory Reset Express:**
   - Hold boot button while powering on
   - Reflash firmware via USB

**Common Mistake:** Express connected but VESC not powered - Express needs the VESC's main power on.

---

## Problem 3: Motor Detection Values Change Wildly

**Symptom:** Running detection multiple times gives different flux linkage, resistance values.

### Causes and Fixes

**Cause 1: Loose Connections**
- Check all phase wires are tight
- Bullet connectors fully seated
- No oxidation on contacts

**Cause 2: Motor Not Secured**
- Motor must be held still during detection
- Any movement = bad readings
- Clamp or hold motor firmly

**Cause 3: Temperature Changes**
- Run detection with motor at room temp
- Hot motor = different resistance
- Wait 5 min between attempts

**Cause 4: Weak Battery**
- Detection needs stable voltage
- Charge battery above 50%
- Don't run on bench supply at limit

**Best Practice:**
1. Secure motor physically
2. Room temperature
3. Full battery
4. Run detection 3 times
5. Values should be within 5%

---

## Problem 4: Motor Won't Run with BMS via CAN

**Symptom:** Motor works without BMS, stops with BMS connected via CAN.

### Causes and Fixes

**Cause 1: CAN ID Conflict**
- VESC and BMS must have different CAN IDs
- VESC default: 0
- BMS should be: 10 or higher
- Check: App Settings → CAN → CAN ID

**Cause 2: CAN Termination**
- CAN bus needs 120Ω termination at each end
- If VESC is end of bus: enable termination
- Some BMS have built-in termination

**Cause 3: Wrong CAN Speed**
- Both devices must use same baud rate
- VESC default: 500K
- Check BMS documentation for its rate

**Cause 4: BMS Sending Shutdown Command**
- Some BMS send CAN messages that VESC interprets as shutdown
- Check: Motor Settings → General → Send CAN Status
- Try: Disable CAN status messages temporarily

**Quick Diagnosis:**
1. Disconnect BMS CAN
2. Motor works? → CAN issue
3. Motor still dead? → Power/wiring issue

---

## Problem 5: ESC Powers Off During Detection

**Symptom:** VESC turns off or resets during motor detection.

### Causes and Fixes

**Cause 1: Overcurrent Protection**
- Detection draws high current briefly
- Weak power supply trips
- **Fix:** Use battery, not bench supply

**Cause 2: BMS Cutoff**
- BMS sees current spike as fault
- **Fix:** Bypass BMS for detection OR increase BMS overcurrent threshold

**Cause 3: Voltage Sag**
- Battery can't deliver detection current
- **Fix:** Charge battery fully, check cell balance

**Cause 4: Loose Power Wires**
- Vibration during detection breaks connection
- **Fix:** Check all power connections, especially XT60/90

**Cause 5: Thermal Shutdown**
- VESC already hot from previous attempts
- **Fix:** Wait 10 minutes, ensure cooling

**Pro Tip:** Watch VESC Tool's voltage display during detection. If it drops below 30V (for 12S), power supply is the issue.

---

## Problem 6: Motor Makes Violent Sounds After FOC Config

**Symptom:** Motor worked before, now makes grinding/screeching noise after changing FOC settings.

### Causes and Fixes

**Cause 1: Wrong Motor Type**
- FOC settings don't match motor
- **Fix:** Re-run motor detection wizard

**Cause 2: Hall Sensor Issue (if sensored)**
- Hall table corrupted or sensors failed
- **Fix:** Motor Settings → FOC → Hall Sensors → Detect
- Check hall sensor wiring

**Cause 3: Observer Settings Wrong**
- Manual changes to observer gain
- **Fix:** Never manually set observer - use detection wizard

**Cause 4: Current Limits Too Low**
- Motor can't produce torque needed
- **Fix:** Increase motor current limit (within motor rating)

**Emergency Fix:**
1. Motor Settings → General → Motor Type → BLDC
2. Run BLDC detection
3. If BLDC works, problem is FOC settings
4. Re-run FOC detection from scratch

---

## Problem 7: Firmware Stuck at 2.18

**Symptom:** VESC Tool shows firmware 2.18, won't update to newer versions.

### Causes and Fixes

**Cause 1: Old Bootloader**
- Firmware 2.18 has old bootloader
- Can't jump to newer firmware
- **Fix:** Flash bootloader first

**Bootloader Update Process:**
1. Download STM32 ST-Link utility (Windows) or stm32flash (Linux/Mac)
2. Connect ST-Link programmer to VESC SWD port
3. Flash new bootloader binary
4. Then flash firmware via VESC Tool

**Cause 2: Hardware Limitation**
- Some old/clone VESCs can't run newer firmware
- Check your hardware version
- Verify firmware compatibility

**Cause 3: Corrupted Flash**
- Interrupted update corrupted firmware
- **Fix:** Use ST-Link to fully erase and reflash

**If No ST-Link:**
- Some newer VESC Tools can force bootloader via USB
- Try: Firmware → Bootloader → Upload default

**Warning:** Updating from 2.18 may reset ALL settings. Backup first (if possible via XML export).

---

## Quick Diagnostic Checklist

| Symptom | First Check | Second Check |
|---------|-------------|--------------|
| Throttle binary | Input range | Deadband value |
| No WiFi | 5V voltage | Antenna connected |
| Detection varies | Motor secured | Battery charged |
| BMS CAN fails | CAN IDs | Termination |
| Powers off | Power source | BMS settings |
| Bad sounds | Redetect motor | Hall sensors |
| Firmware stuck | Bootloader | Hardware version |

---

## References

- Related: `vesc-motor-wizard-guide.md` - Detection process
- Related: `can-uart-integration-guide.md` - CAN setup
- Related: `vesc-firmware-update-guide.md` - Update process
- Related: `throttle-curve-tuning-guide.md` - Input config
- Related: `vesc-express-wifi-ble-setup.md` - Express setup

---

*Last updated: 2026-01-14 | Community-sourced troubleshooting*
