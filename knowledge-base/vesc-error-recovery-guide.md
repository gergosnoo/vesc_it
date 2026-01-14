# VESC Error Recovery Guide

## Overview

This guide covers how to recover from common VESC errors, connection issues, and fault conditions. When your VESC stops working or shows errors, follow these procedures to diagnose and recover safely.

---

## Quick Troubleshooting Flowchart

```
VESC Not Responding
        │
        ▼
┌─────────────────┐
│ Can you connect │──No──► Check USB cable, try different port
│ via VESC Tool?  │        Check if VESC powers on (LEDs?)
└────────┬────────┘
         │Yes
         ▼
┌─────────────────┐
│ Are there faults│──Yes──► See "Fault Recovery" section
│ showing?        │
└────────┬────────┘
         │No
         ▼
┌─────────────────┐
│ Does motor spin │──No──► See "Motor Won't Spin" section
│ with controls?  │
└────────┬────────┘
         │Yes
         ▼
    System OK!
```

---

## Connection Issues

### "RT Data Shows No Connection" (But USB Connected)

**Symptoms:**
- VESC Tool connects but Real-Time Data shows "No Connection"
- Can't read motor data
- Commands don't seem to work

**Causes:**
1. **Wrong serial port selected**
2. **Baud rate mismatch**
3. **USB cable is charge-only** (no data lines)
4. **Driver issues** (Windows)
5. **Firmware crashed** but bootloader responding

**Recovery Steps:**

1. **Check USB Cable:**
   - Try a different USB cable (not all cables have data lines)
   - Use a short, quality cable
   - Connect directly to computer (not through hub)

2. **Check Port Selection:**
   - In VESC Tool: Connection > Serial Port
   - Look for new port appearing when you plug in VESC
   - On Mac: `/dev/cu.usbmodem*` or `/dev/tty.usbserial*`
   - On Linux: `/dev/ttyACM0` or `/dev/ttyUSB0`
   - On Windows: `COM3`, `COM4`, etc.

3. **Try Manual Connection:**
   ```
   VESC Tool > Connection > Connect (don't use Auto-connect)
   Select the correct port manually
   Click Connect
   ```

4. **Check Baud Rate:**
   - Default is 115200
   - Go to Connection Settings and verify

5. **Install/Reinstall Drivers (Windows):**
   - Download STM32 Virtual COM Port driver
   - Or use Zadig to install WinUSB driver

6. **Power Cycle:**
   - Disconnect USB
   - Power off VESC completely (disconnect battery)
   - Wait 10 seconds
   - Reconnect battery, then USB

---

### "USB Disconnects Randomly"

**Causes:**
1. **Loose USB connection**
2. **EMI interference** from motor
3. **USB power management** (sleep mode)
4. **Damaged USB port** on VESC

**Solutions:**

1. **Improve USB Connection:**
   - Use ferrite core on USB cable
   - Use shorter cable
   - Secure cable so it doesn't move

2. **Disable USB Power Saving (Windows):**
   ```
   Device Manager > Universal Serial Bus controllers
   Right-click each USB Hub > Properties > Power Management
   Uncheck "Allow computer to turn off this device"
   ```

3. **Shield USB Cable:**
   - Keep USB cable away from motor phase wires
   - Use shielded USB cable

---

### "Can't Connect After Firmware Update"

**Symptoms:**
- VESC worked before update
- Now won't connect at all

**Recovery:**

1. **Wait 30 seconds** - Firmware may still be flashing
2. **Power cycle completely** - Remove all power, wait, reconnect
3. **Try bootloader mode:**
   - Hold VESC reset button while connecting USB
   - VESC Tool should detect bootloader
   - Re-flash firmware

4. **Use ST-Link programmer** (advanced):
   - If bootloader corrupted, you need SWD programmer
   - Connect to debug pins
   - Reflash bootloader then firmware

---

## Fault Recovery

### General Fault Recovery Procedure

When VESC shows a fault, follow this procedure:

1. **Read the Fault:**
   ```
   VESC Tool > Terminal
   Type: faults
   Press Enter
   ```
   This shows fault history with timestamps.

2. **Understand the Fault:**
   - See `vesc-fault-code-reference.md` for all fault codes
   - Note what you were doing when fault occurred

3. **Address Root Cause:**
   - Don't just clear the fault and try again
   - Fix what caused it first

4. **Power Cycle:**
   - Disconnect battery
   - Wait 10 seconds
   - Reconnect

5. **Verify Recovery:**
   - Check `fault` command shows `FAULT_CODE_NONE`
   - Test at low power before full operation

---

### VESC Freewheels After Fault

**Symptoms:**
- Motor was running, then suddenly freewheels
- VESC shows fault
- Won't respond to throttle

**Immediate Steps:**

1. **Stay Safe:** If on a vehicle, coast to a stop safely

2. **Check Fault Type:**
   - Connect to VESC Tool
   - Terminal: `faults`
   - Note the fault code

3. **Common Causes & Fixes:**

| Fault | Likely Cause | Fix |
|-------|--------------|-----|
| OVER_VOLTAGE | Hard braking with full battery | Lower regen, set regen cutoff |
| UNDER_VOLTAGE | Empty battery | Charge battery |
| OVER_TEMP_FET | Overheating | Wait to cool, improve cooling |
| ABS_OVER_CURRENT | Phase short or spike | Check wiring, redetect motor |
| DRV | Hardware issue | Check phase wires, may need repair |

4. **Recovery After Fixing:**
   ```
   Power cycle VESC
   Connect to VESC Tool
   Terminal: fault (verify shows NONE)
   Test at low power first
   ```

---

### Fault Won't Clear

**Problem:** Fault keeps coming back after power cycle.

**Diagnosis:**

1. **Persistent fault = ongoing issue** - The cause still exists

2. **Check these in order:**
   - Battery voltage within limits?
   - Temperature reasonable?
   - Motor connections secure?
   - No phase wire shorts?

3. **Fault-specific checks:**

   **OVER_VOLTAGE keeps returning:**
   - Battery voltage too high for `l_max_vin` setting
   - Fix: Increase `l_max_vin` or use appropriate battery

   **DRV keeps returning:**
   - Hardware damage likely
   - Check for burnt components
   - Test with different motor

   **OVER_TEMP keeps returning:**
   - Inadequate cooling
   - Ambient temperature too high
   - Reduce current limits

4. **Factory Reset (last resort):**
   ```
   VESC Tool > Motor Settings
   Click "Reset to Default" or "Load Default"
   Rerun motor detection
   Reconfigure all settings
   ```

---

## Motor Won't Spin

### After Motor Detection Failed

**Symptoms:**
- Motor detection failed
- Motor won't spin after detection

**Recovery:**

1. **Ensure Detection Prerequisites:**
   - ✅ Motor disconnected from wheel/load (can spin freely)
   - ✅ No PPM/ADC input active during detection
   - ✅ Battery voltage stable and sufficient
   - ✅ Correct motor type selected

2. **Pre-Detection Checklist:**
   ```
   1. Lift wheel off ground OR disconnect motor from drivetrain
   2. In VESC Tool: App Settings > General > App to Use: No App
   3. Disconnect remote/throttle input
   4. Ensure motor phases connected correctly (A, B, C)
   ```

3. **Run Detection:**
   ```
   Motor Settings > FOC > General > Run Detection
   Wait for completion (may take 30-60 seconds)
   If it fails, note the error message
   ```

4. **If Detection Fails:**

   **"R is 0" or very low:**
   - Motor may be shorted
   - Try increasing detection current (5A → 10A)
   - Check phase wire connections

   **"Bad Detection Result":**
   - Motor moved during detection
   - Motor has too much friction
   - Try with motor off the vehicle

   **"Hall Sensor Error 255":**
   - Hall sensor wiring issue
   - Check hall sensor cable
   - Verify 5V supply to hall sensors

5. **Manual Fallback (Advanced):**
   - If detection won't work, you can enter motor parameters manually
   - Get values from motor datasheet or another VESC that detected successfully
   - Enter: Resistance, Inductance, Flux Linkage

---

### Motor Spins But Vehicle Doesn't Move

**Symptoms:**
- Motor spins in VESC Tool testing
- Remote/throttle doesn't work
- App seems unresponsive

**Recovery:**

1. **Check App Settings:**
   ```
   App Settings > General > App to Use
   - For remote: PPM
   - For UART throttle: UART
   - For Nunchuk: Nunchuk
   ```

2. **Calibrate Input:**
   ```
   App Settings > [Your App] > Run Detection
   Move throttle full forward, full brake, center
   Apply
   ```

3. **Check Real-Time Data:**
   ```
   Real Time Data > [Your App Type]
   Move throttle - do values change?
   If not, check wiring
   ```

4. **Verify No Timeout:**
   - If timeout is active, motor won't respond
   - Check remote is connected and charged
   - Check timeout settings aren't too aggressive

---

## Recovering from Firmware Issues

### Firmware Update Failed Mid-Flash

**Symptoms:**
- Power lost during firmware update
- VESC Tool crashed during update
- VESC now unresponsive

**Recovery:**

1. **Try Normal Connection:**
   - Sometimes partial flash still boots
   - Try connecting normally first

2. **Enter Bootloader Mode:**
   - Disconnect battery
   - Hold reset button on VESC (or short BOOT pins)
   - Connect USB
   - Release reset after 2 seconds
   - VESC Tool should show "Bootloader" in status

3. **Re-flash Firmware:**
   ```
   Firmware > Custom File (or Official)
   Select appropriate firmware for your hardware
   Upload
   Wait for completion (DO NOT INTERRUPT)
   ```

4. **After Successful Flash:**
   - Power cycle VESC
   - Connect and verify firmware version
   - Rerun motor detection (settings may be lost)

---

### Settings Corrupted / Strange Behavior

**Symptoms:**
- VESC acts strangely
- Settings don't match what you configured
- "Flash Corruption" faults

**Recovery:**

1. **Backup Current Config (if possible):**
   ```
   Motor Settings > Save Configuration to File
   App Settings > Save Configuration to File
   ```

2. **Reset to Defaults:**
   ```
   Motor Settings > Reset to Default
   App Settings > Reset to Default
   ```

3. **Reconfigure:**
   - Rerun motor detection
   - Reenter current limits
   - Reconfigure app settings
   - Save to VESC

4. **If Corruption Persists:**
   - Reflash firmware (this resets flash)
   - May indicate flash memory wear

---

## Terminal Commands for Recovery

| Command | Description |
|---------|-------------|
| `fault` | Show current fault code |
| `faults` | Show fault history with conditions |
| `reboot` | Reboot VESC (soft reset) |
| `conf_default_mc` | Reset motor config to default |
| `conf_default_app` | Reset app config to default |
| `hw_status` | Show hardware status |
| `can_scan` | Scan CAN bus for devices |
| `help` | List all terminal commands |

**Source:** `bldc/terminal.c:131-1182`

---

## Prevention: Avoiding Errors

### Electrical Precautions

1. **Secure Connections:**
   - Use proper connectors (XT60, XT90)
   - Solder joints (don't just twist wires)
   - Heat shrink all exposed connections

2. **Protect from Shorts:**
   - Keep phase wires separated
   - No exposed copper
   - Use wire loom/sleeve

3. **Protect from Water:**
   - Conformal coat PCB
   - Seal enclosure
   - Use waterproof connectors

### Configuration Precautions

1. **Set Conservative Limits First:**
   - Start with lower current limits
   - Increase gradually after testing

2. **Always Set Safety Limits:**
   - Battery cutoff voltages
   - Temperature limits
   - Regen cutoff

3. **Save Working Config:**
   - After tuning, save config to file
   - Keep backup on computer
   - Name it with date and description

---

## When to Seek Help

**Get Professional Help If:**
- DRV faults repeatedly with no obvious cause
- Smoke or burning smell from VESC
- Physical damage visible
- Fault codes you don't understand after consulting documentation
- Unable to connect even after all troubleshooting

**Resources:**
- VESC Project Forum: https://vesc-project.com/forum
- Endless Sphere: endless-sphere.com
- esk8.news forums
- Specific controller Discord/communities (UBOX, Little FOCer, etc.)

---

## Quick Reference: Recovery Checklist

```
□ 1. Identify the problem (fault code, behavior)
□ 2. Ensure safety (power off if needed)
□ 3. Connect to VESC Tool
□ 4. Run 'faults' command to see history
□ 5. Address root cause (see specific sections)
□ 6. Power cycle VESC
□ 7. Verify fault cleared ('fault' shows NONE)
□ 8. Test at low power before full operation
□ 9. Save working configuration
```

---

## References

- Source: `bldc/motor/mc_interface.c:2555` - Fault clearing logic
- Source: `bldc/motor/mc_interface.c:2561` - Fault stop time handling
- Source: `bldc/timeout.c` - Timeout and watchdog implementation
- Source: `bldc/terminal.c:131-137` - Fault command implementation

---

*Last updated: 2026-01-14 | Source verified against bldc repository*
