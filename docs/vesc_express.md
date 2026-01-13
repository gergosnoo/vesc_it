# VESC Express

## Overview

VESC Express is ESP32-based firmware providing wireless connectivity for VESC systems:

- WiFi (Access Point and Station modes)
- Bluetooth Low Energy
- CAN bus bridge to VESC
- Data logging with GNSS
- LispBM scripting

**Repository:** `../vesc_express/`
**Current Version:** 6.0
**License:** GPL-3.0
**Target:** ESP32-C3

## Key Features

### WiFi
- Access Point mode (creates network)
- Station mode (joins network)
- TCP server on port 65102
- TCP Hub client for remote access
- UDP broadcast for discovery

### Bluetooth LE
- GATT server for VESC Tool
- Encrypted pairing option
- Custom scripting mode

### CAN Bridge
- Forwards VESC protocol over CAN
- Status message parsing
- IO board ADC/GPIO access
- BMS data relay

### Data Logging
- SD card or NAND flash
- GNSS timestamping
- Configurable log format

## Supported Hardware

| Hardware | Description |
|----------|-------------|
| hw_xp_t | VESC Express T (main) |
| hw_devkit_c3 | ESP32-C3 DevKit |
| hw_vbms32 | VESC BMS 32 |
| hw_vdisp_* | Display modules |
| hw_scope | Oscilloscope |
| hw_stick | Remote stick |
| hw_nanolog | Nanolog |

## Architecture

```
┌─────────────────────────────────────┐
│  WiFi Stack    BLE Stack   ESP-NOW  │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│       Communication Manager         │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         LispBM Virtual Machine      │
└─────────────────┬───────────────────┘
                  │
         ┌───────┴────────┐
         │                │
         ▼                ▼
┌─────────────┐  ┌─────────────────┐
│  CAN Bridge │  │ Log/GNSS        │
└─────────────┘  └─────────────────┘
```

## Configuration

### WiFi Settings
| Parameter | Description |
|-----------|-------------|
| `wifi_mode` | Disabled/Station/AP |
| `wifi_sta_ssid` | Station SSID |
| `wifi_sta_key` | Station password |
| `wifi_ap_ssid` | AP SSID |
| `wifi_ap_key` | AP password |
| `use_tcp_local` | Enable local TCP |
| `use_tcp_hub` | Enable TCP Hub |

### BLE Settings
| Parameter | Description |
|-----------|-------------|
| `ble_mode` | Disabled/Open/Encrypted |
| `ble_name` | Device name (8 chars) |
| `ble_pin` | Pairing PIN (6 digits) |

### CAN Settings
| Parameter | Description |
|-----------|-------------|
| `controller_id` | CAN ID (1-254) |
| `can_baud_rate` | 125K-1M |
| `can_status_rate_hz` | Status rate |

## WiFi Setup Guide

### Initial Configuration (USB First)

Before WiFi works, you must configure it via USB:

1. **Connect via USB** to VESC Express
2. Open **VESC Tool** → Connect via USB serial
3. Go to **VESC Express** → **WiFi** tab

### WiFi Station Mode (Join Existing Network)

Connect VESC Express to your home/phone WiFi:

1. Set **WiFi Mode**: Station
2. Enter **SSID**: Your network name
3. Enter **Password**: Your WiFi password
4. Enable **TCP Local**: Yes
5. Click **Write** to save

**After reboot:** VESC Express joins your network and gets an IP address.

### WiFi Access Point Mode (Create Network)

VESC Express creates its own WiFi network:

1. Set **WiFi Mode**: Access Point
2. Set **AP SSID**: Custom name (e.g., "MyVESC")
3. Set **AP Password**: At least 8 characters
4. Enable **TCP Local**: Yes
5. Click **Write** to save

**Connect:** Join the network from your phone/computer, then connect VESC Tool to IP `192.168.4.1`.

### Finding the IP Address

**In Station mode:**
- Check your router's DHCP client list
- Or use VESC Tool → USB → Terminal: `net_state`

**In AP mode:**
- Always `192.168.4.1`

### Connecting VESC Tool via WiFi

1. Phone/computer on same network as VESC Express
2. Open VESC Tool → **Autoconnect** or **TCP Connection**
3. Enter IP address and port **65102**
4. Click Connect

## BLE Setup Guide

### BLE Pairing Process

1. Go to **VESC Express** → **BLE** tab
2. Set **BLE Mode**: Encrypted (recommended) or Open
3. Set **BLE Name**: 8 characters max (shown during pairing)
4. Set **BLE PIN**: 6 digits (if encrypted)
5. Click **Write** and reboot

### Connecting via BLE

**From VESC Tool Mobile:**
1. Enable Bluetooth on phone
2. Open VESC Tool → **BLE** scan
3. Select your device (matches BLE Name)
4. Enter PIN if encrypted mode
5. Connection established

**From Floaty/Float Control App:**
1. Enable Bluetooth
2. App auto-scans for VESC devices
3. Select your board
4. Enter PIN if prompted

### BLE Mode Options

| Mode | Security | Use Case |
|------|----------|----------|
| Disabled | N/A | WiFi only |
| Open | None | Quick testing |
| Encrypted | PIN required | Recommended for daily use |

## Troubleshooting Connectivity

### WiFi Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Can't connect to AP | Wrong password | Re-enter password via USB |
| No IP in station mode | Router not assigning | Check DHCP, try static IP |
| Connection drops | Signal strength | Move closer or use AP mode |
| "Connection refused" | TCP not enabled | Enable "TCP Local" setting |

### BLE Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Device not found | BLE disabled | Enable in VESC Express settings |
| Pairing fails | Wrong PIN | Verify PIN matches settings |
| Drops constantly | Phone compatibility | Try different app, disable WiFi |
| "Floaty not seeing board" | BLE mode issue | Set to "Open" for testing |

### Factory Reset

If connectivity is broken and can't configure via USB:

1. **Via USB Terminal:**
   ```
   conf_default_all
   reboot
   ```

2. **Hardware reset (if available):**
   - Hold boot button while powering on
   - May vary by hardware variant

### App Compatibility

| App | Platform | Connection |
|-----|----------|------------|
| VESC Tool | iOS/Android/Desktop | BLE, WiFi, USB |
| Floaty | iOS/Android | BLE only |
| Float Control | iOS/Android | BLE only |
| VESC Monitor | Android | BLE, WiFi |

### Recommended Setup for Onewheels

1. **Primary:** BLE Encrypted mode for mobile apps
2. **Backup:** WiFi AP mode for configuration
3. Keep USB available for troubleshooting

## Build Instructions

### Requirements
- ESP-IDF 5.2+
- CMake 3.5+

### Build
```bash
source esp-idf/export.sh
idf.py build
idf.py flash
idf.py monitor
```

## TCP Hub

Remote access through `veschub.vedder.se`:
- Port: 65101
- Auth: `VESC:<device_id>:<password>\n`
- Enables VESC Tool over internet

## LispBM Extensions

### WiFi
- Network scanning
- Connection management
- Socket operations

### BLE
- Custom GATT services
- Scanning and advertising

### CAN
- Direct frame transmission
- Motor control commands
- BMS data access

## Resources

- [GitHub Repository](https://github.com/vedderb/vesc_express)
