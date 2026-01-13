# LED Configuration Troubleshooting Guide

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-13
**Source:** `refloat/src/conf/datatypes.h`, `refloat/src/led_driver.c`, `refloat/src/leds.c`
**Addresses:** GAP-02 (Medium Priority)

---

## LED Mode Options

**Source:** `refloat/src/conf/datatypes.h:36-41`

```c
// From refloat/src/conf/datatypes.h:36-41
typedef enum {
    LED_MODE_OFF = 0,
    LED_MODE_INTERNAL = 0x1,
    LED_MODE_EXTERNAL = 0x2,
    LED_MODE_BOTH = 0x3,
} LedMode;
```

Refloat supports four LED modes:

| Mode | Value | Description |
|------|-------|-------------|
| **Off** | 0 | LEDs disabled |
| **Internal** | 0x1 | VESC controls LEDs directly |
| **External** | 0x2 | External LCM (LED Controller Module) controls LEDs |
| **Both** | 0x3 | Internal + External enabled |

### When to Use Each Mode

- **Off**: No LEDs, or troubleshooting overcurrent issues
- **Internal**: Standard WS2812/SK6812 LEDs connected directly to VESC
- **External**: Using LCM (common on factory boards like CBXR)
- **Both**: LCM with additional internal LEDs

---

## LED Color Orders

**Source:** `refloat/src/conf/datatypes.h:55-60`

```c
// From refloat/src/conf/datatypes.h:55-60
typedef enum {
    LED_COLOR_GRB = 0,
    LED_COLOR_GRBW,
    LED_COLOR_RGB,
    LED_COLOR_WRGB
} LedColorOrder;
```

Choose based on your LED strip type:

| Color Order | Bits | Compatible LEDs |
|-------------|------|-----------------|
| **GRB** | 24 | WS2811, WS2812, WS2812B, SK2812 |
| **GRBW** | 32 | SK6812 with white channel |
| **RGB** | 24 | Some non-standard strips |
| **WRGB** | 32 | Alternate RGBW format |

### How to Identify Your LEDs

1. **Check the LED chip markings**
2. **Test with wrong order** - if colors look swapped (red shows as green), try different order
3. **Most common**: WS2812B uses GRB

---

## Common LED Problems

### LEDs Stay On After Setting Mode to Off

**Cause:** Usually happens when migrating from Float, or when LCM is present.

**Solutions:**

1. **If you have an LCM:**
   - Set LED Mode to **External** (not Off)
   - LCM needs mode signal to control its LEDs

2. **If no LCM:**
   - Set mode to **Off**
   - Power cycle the board completely
   - Wait 10 seconds before powering on again

3. **Emergency fix** (if LEDs cause overcurrent):
   - Power on with **both footpad sensors pressed**
   - This disables LED initialization
   - Connect via VESC Tool and fix configuration

### Wrong Colors (Red Shows as Green)

**Cause:** Wrong color order setting.

**Solution:**
1. Go to **Refloat Cfg** → **LEDs**
2. Change **Color Order**:
   - If using WS2812: try GRB first
   - If colors still wrong: try RGB
3. Power cycle to apply

### LEDs Don't Work at All

**Troubleshooting steps:**

1. **Check mode setting**
   - Mode must be **Internal** or **Both**
   - **Off** or **External** won't drive internal LEDs

2. **Check wiring**
   - Data line to correct pin (B6, B7, or C9)
   - 5V power connected
   - Ground connected

3. **Check LED count**
   - Verify count matches actual number of LEDs
   - Max supported: Check your hardware

4. **Check pin configuration**
   - Go to **Refloat Cfg** → **LEDs** → **Pin**
   - Verify correct pin selected (B6, B7, C9)

### LEDs Flicker or Glitch

**Possible causes:**

1. **Power supply issue**
   - LEDs draw significant current
   - Add capacitor near LED strip (100-1000µF)
   - Use separate 5V power for many LEDs

2. **Long data wire**
   - Keep data wire short
   - Add 330Ω resistor in data line near VESC

3. **Interference**
   - Route LED wires away from motor wires
   - Use shielded cable if needed

### LEDs Don't Match Front/Rear

**Check strip configuration:**

1. **Verify LED counts**
   - Front strip count
   - Rear strip count
   - Status strip count (if separate)

2. **Check reverse settings**
   - Some strips need reversed direction
   - Try toggling "Reverse" for affected strip

3. **Verify strip order**
   - If strips are daisy-chained, order matters
   - 1st, 2nd, 3rd in physical order

---

## Migration from Float to Refloat

When migrating, LED settings may need manual adjustment:

### Common Migration Issues

| Float Setting | Refloat Setting | Notes |
|---------------|-----------------|-------|
| LED Type = 3 (External) | Mode = External (0x2) | Automatic conversion |
| LED Type = 0 (WS2812) | Mode = Internal + Color = GRB | Set manually if colors wrong |
| LED Type = 1 (SK6812) | Mode = Internal + Color = GRBW | Set manually |
| LED Type = 2 (External only) | Mode = External | Works automatically |

### After Migration Checklist

1. [ ] Verify LED Mode is correct
2. [ ] Check Color Order matches your LEDs
3. [ ] Verify LED counts for front/rear/status
4. [ ] Test all LED functions (headlights, taillights, status)
5. [ ] Power cycle after any changes

---

## LED Pin Options

Different VESC hardware uses different pins:

| Pin | Location | Typical Use |
|-----|----------|-------------|
| **B6** | Varies | Most common |
| **B7** | Varies | Secondary |
| **C9** | Varies | Alternate |

**Check your VESC hardware documentation** for which pins are available.

---

## Emergency Recovery

If LEDs cause problems that prevent connection:

### Method 1: Disable at Boot

1. Power off the board
2. **Press and hold BOTH footpad sensors**
3. Power on while holding sensors
4. LEDs will be disabled for this session
5. Connect via VESC Tool and fix settings
6. Power cycle normally

### Method 2: USB Connection

If WiFi/BLE fails due to LED issues:
1. Connect via USB cable
2. Fix LED settings
3. Write configuration
4. Disconnect USB and test

### Method 3: Reflash Package

If nothing else works:
1. Connect via USB
2. Go to **VESC Packages**
3. Remove Refloat package
4. Reinstall Refloat package
5. Reconfigure from scratch

---

## Best Practices

1. **Start with LEDs Off** when setting up new hardware
2. **Test with minimal LEDs first** - verify one strip works before adding more
3. **Document your settings** - write down working configuration
4. **Power cycle after changes** - many LED settings need restart
5. **Use appropriate power** - lots of LEDs need more current
6. **Keep wires short** - long data wires cause signal problems

---

## Status LED Patterns

Refloat uses status LEDs to show board state:

| Pattern | Meaning |
|---------|---------|
| Solid | Ready to ride |
| Pulsing | Idle/standby |
| Flashing | Warning or fault |
| Rainbow | Startup sequence |

Configure status LED behavior in **Refloat Cfg** → **LEDs** → **Status**.

---

*Content verified against refloat source code | Ready for embedding*
