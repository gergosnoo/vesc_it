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
