# OWIE BMS Integration Guide

## Overview

**Key Terms:** OWIE, FM BMS, Future Motion BMS, VESC BMS, Onewheel XR conversion, 15S battery, ESP8266, OWIE wiring, OWIE firmware, BMS integration, Little FOCer BMS

This guide covers integrating an OWIE (ESP8266-based WiFi module) with a Future Motion BMS and VESC controller for Onewheel XR conversions using 15S batteries.

**Source:** pev.dev community (9,254 views)

---

## ⚠️ Critical Safety Warning

**"Reusing the FM BMS as a charge-only BMS in a VESC OneWheel conversion disables safety features and by going this route you accept that risk."**

The FM BMS in this configuration:
- Acts as charge-only BMS
- Does NOT provide discharge protection
- Does NOT provide over-current protection
- Safety features are bypassed

**Proceed only if you understand and accept these risks.**

---

## What is OWIE?

OWIE is an ESP8266-based WiFi module that:
- Reads battery data from FM BMS
- Creates a WiFi network for monitoring
- Provides cell voltage information
- Works with Onewheel XR or Pint BMS modules

---

## Hardware Requirements

| Component | Purpose | Notes |
|-----------|---------|-------|
| VESC Controller | Motor control | Little FOCer 3.1 recommended |
| Future Motion BMS | Battery monitoring | XR or Pint model |
| 15S Battery Pack | Power source | Must match BMS |
| ESP8266 Chip | WiFi interface | NodeMCU or similar |
| Soldering Equipment | Wiring connections | - |
| 10A Diode | Backfeed prevention | Required for safety |
| Latching Switch | Power control | - |

---

## Firmware Installation (Windows)

### Step 1: Download Required Files

1. **OWIE Firmware:** Download latest `firmware.bin` from GitHub releases
2. **Flasher Tool:** Download `nodemcu-flasher` tool

### Step 2: Prepare Flasher

1. Extract flasher software
2. Connect ESP8266 via Micro USB
3. Launch `ESP8266Flasher.exe`

### Step 3: Configure Flash Settings

1. Go to **Advanced** tab
2. Set baud rate to **115200**
3. Select your downloaded firmware.bin file

### Step 4: Flash Firmware

1. Navigate to **Operation** tab
2. Select correct COM port from dropdown
3. Click **"Flash"** button
4. Press ESP8266's reset button when prompted

### Step 5: Verify Installation

1. Check phone WiFi networks
2. Look for **"Owie-xxx"** network
3. Connection confirms successful flash

---

## Wiring Configuration

### Power Source

| Connection | Wire | Purpose |
|------------|------|---------|
| OWIE VCC | FM BMS 5V pin | Powers the ESP8266 |
| OWIE GND | FM BMS GND pin | Ground reference |

### Data Connection

| Connection | Wire | Purpose |
|------------|------|---------|
| OWIE Rx | FM BMS white wire | Battery data signal |

### Activation Circuit

The OWIE powers on only when the FM BMS receives charging voltage through the XLR port:

| Component | Connection |
|-----------|------------|
| XLR Pin 2 (with diode) | FM BMS positive |
| OR XLR Pin 3 | FM BMS positive |
| Latching switch | In power path |
| 10A Diode | Prevents backfeed |

### Wiring Diagram (Simplified)

```
┌─────────────────────────────────────────────┐
│              BATTERY PACK (15S)             │
└─────────────┬──────────────────┬────────────┘
              │                  │
              ▼                  ▼
        ┌─────────┐        ┌─────────┐
        │  FM BMS │        │  VESC   │
        │  (XR)   │        │ (LF3.1) │
        └────┬────┘        └─────────┘
             │
    ┌────────┼────────┐
    │ 5V  GND  Data   │
    │  │    │    │    │
    │  ▼    ▼    ▼    │
    │ ┌──────────┐   │
    │ │   OWIE    │   │
    │ │ (ESP8266) │   │
    │ └──────────┘   │
    │                 │
    │   WiFi Network  │
    │   "Owie-xxx"    │
    └─────────────────┘
```

---

## Installation Options

### Option 1: Inside Battery Enclosure (Recommended)

**Advantages:**
- Short wire runs
- Protected from elements
- Clean installation

**Requirements:**
- Space in battery box
- Heat considerations

### Option 2: Inside Controller Box

**Advantages:**
- Easier access for maintenance
- Separate from battery heat

**Requirements:**
- Longer power/ground wiring
- Data wire routing

---

## Updated Method (November 2022+)

The revised wiring method improves safety:

**Key Change:** "The charge and discharge paths are no longer shared"

This means:
- FM BMS can cut power during charging if needed
- Separate paths for charge vs discharge current
- Improved safety over older bridged configuration

---

## Using OWIE

### Connecting

1. Power on board (start charging)
2. Wait for OWIE to boot (~5 seconds)
3. Connect phone to "Owie-xxx" WiFi network
4. Open browser to OWIE's IP address

### Available Data

| Information | Purpose |
|-------------|---------|
| Individual cell voltages | Balance monitoring |
| Total pack voltage | Charge level |
| Temperature (if supported) | Safety monitoring |
| Charge status | BMS state |

### Limitations

- Only shows data when charging/balancing
- No discharge protection
- No real-time riding data
- WiFi only (no Bluetooth)

---

## Troubleshooting

### OWIE WiFi Not Appearing

| Check | Solution |
|-------|----------|
| Power to ESP8266 | Verify 5V from BMS |
| Firmware flashed | Re-flash firmware |
| Charger connected | OWIE only powers during charge |

### Can't Connect to OWIE Network

| Check | Solution |
|-------|----------|
| WiFi password | Usually none/open network |
| Phone too far | Move closer to board |
| Multiple devices | Only one connection at a time |

### Wrong Cell Data

| Check | Solution |
|-------|----------|
| BMS model match | Ensure firmware matches BMS |
| Data wire connection | Check white wire solder |
| BMS communication | Verify BMS is active |

---

## Safety Reminders

1. **No Discharge Protection:** VESC handles all discharge safety
2. **Backup Configuration:** Always backup before modifications
3. **Test Thoroughly:** Verify all connections before riding
4. **Monitor Regularly:** Check cell balance periodically

---

## References

- Source: pev.dev/t/owie-wiring-fw-guide/336 (9,254 views)
- Related: `vesc-bms-configuration.md` - BMS settings
- Related: `vesc-hardware-specific-guides.md` - Controller specs
- Related: `pintv-xrv-critical-settings.md` - Safety settings

---

*Last updated: 2026-01-14 | Source: pev.dev community content*
