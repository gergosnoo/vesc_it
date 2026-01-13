# VESC Ecosystem Overview

## What is VESC?

VESC (Vedder Electronic Speed Controller) is an open-source motor controller platform created by Benjamin Vedder. It has evolved into a comprehensive ecosystem for controlling brushless motors in various applications:

- Electric skateboards and longboards
- Electric bicycles (e-bikes)
- Electric scooters
- Self-balancing vehicles (Onewheel-style)
- Robotics and industrial applications
- Electric boats and underwater vehicles
- DIY electric vehicles

## Core Components

### 1. BLDC Firmware (`../bldc/`)

The heart of the VESC system - firmware running on STM32F4 microcontrollers.

**Key Features:**
- Field Oriented Control (FOC) for efficient, smooth motor operation
- BLDC and DC motor support
- Multiple sensor modes (Hall, encoder, sensorless)
- CAN bus networking for multi-motor setups
- LispBM scripting for custom logic
- Extensive configuration options

**Version:** 7.00 (current)

### 2. VESC Tool (`../vesc_tool/`)

Desktop and mobile application for configuring VESC hardware.

**Key Features:**
- Motor detection wizards
- Real-time data monitoring
- Firmware upload/update
- LispBM script editor
- Configuration backup/restore
- Package management

**Platforms:** Linux, Windows, macOS, Android, iOS

### 3. VESC Packages (`../vesc_pkg/`)

Extension system for adding functionality without firmware modification.

**Package Types:**
- **Applications**: Balance boards, DPV control, BMS management
- **Libraries**: LED drivers, sensors, utilities
- **UI Extensions**: Custom dashboards and controls

**Notable Packages:**
- `balance` - Self-balancing board control
- `refloat` - Advanced balance package
- `vbms32` - 32-cell BMS management
- `lib_ws2812` - Addressable LED control

### 4. VESC Express (`../vesc_express/`)

ESP32-based wireless communication module.

**Key Features:**
- WiFi access point and station modes
- Bluetooth Low Energy (BLE) connectivity
- CAN bus bridge to VESC
- Data logging with GNSS
- LispBM scripting
- Remote access via TCP Hub

### 5. VESC BMS Firmware (`../vesc_bms_fw/`)

Battery Management System firmware for lithium battery packs.

**Key Features:**
- Cell voltage monitoring (up to 18S)
- Active cell balancing
- Temperature monitoring
- Charge control with safety limits
- CAN bus integration with VESC
- Low-power sleep modes

### 6. Refloat (`../refloat/`)

Premium self-balancing package for Onewheel-style boards.

**Key Features:**
- Advanced PID control with Mahony AHRS
- Adaptive Torque Response (ATR)
- Comprehensive safety systems
- LED lighting control
- BMS integration
- Haptic feedback

## Communication Architecture

```
                    ┌─────────────────┐
                    │   VESC Tool     │
                    │  (Desktop/Mobile)│
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │ USB               │ WiFi/BLE          │ TCP Hub
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  VESC Motor     │  │  VESC Express   │  │  Internet       │
│  Controller     │◄─┤  (ESP32)        │  │  (Remote)       │
│  (STM32)        │  └─────────────────┘  └─────────────────┘
└────────┬────────┘
         │ CAN Bus
         │
    ┌────┴────┬─────────────┬─────────────┐
    │         │             │             │
    ▼         ▼             ▼             ▼
┌───────┐ ┌───────┐   ┌───────────┐ ┌───────────┐
│ VESC  │ │ VESC  │   │  VESC     │ │   Other   │
│ Motor │ │ Motor │   │  BMS      │ │   Devices │
│ #2    │ │ #3    │   │           │ │           │
└───────┘ └───────┘   └───────────┘ └───────────┘
```

## Protocol Summary

| Interface | Protocol | Speed | Use Case |
|-----------|----------|-------|----------|
| USB | CDC ACM | Variable | Primary config |
| CAN | VESC Protocol | 125K-1M | Multi-device |
| UART | Packet Protocol | 115200 | Serial config |
| BLE | GATT | ~100KB/s | Mobile config |
| WiFi TCP | Packet Protocol | Variable | Remote access |

## Configuration Hierarchy

1. **Hardware Config** - Board-specific settings (compiled in)
2. **Motor Config** - Motor parameters (stored in flash)
3. **App Config** - Application settings (stored in flash)
4. **Custom Config** - Package-specific (stored in flash)
5. **Runtime Config** - Temporary settings (RAM only)

## Firmware Versions

| Component | Current | Min Compatible |
|-----------|---------|----------------|
| BLDC | 7.00 | 6.00 |
| VESC Tool | 7.00 | 6.00 |
| Express | 6.0 | 5.0 |
| BMS | 6.0 | 5.0 |
| Packages | Variable | 6.02+ |

## Supported Hardware

### Official TRAMPA Hardware
- VESC 6 (MK1-MK6)
- VESC 75/300, 100/250, 100/500
- VESC HD series
- Express T, Express Display

### Third-Party Compatible
- Flipsky VESC variants
- Stormcore series
- MakerBase MKS series
- Ubox controllers
- Many others via custom hwconf

## Key Concepts for AI Agents

### Motor Control
- **ERPM** = Electrical RPM = Mechanical RPM × Pole Pairs
- **Duty Cycle** = PWM percentage (0-100%)
- **FOC Current** = Id (flux) + Iq (torque) components
- **Flux Linkage** = Motor magnetic strength parameter

### Safety Parameters
- `l_current_max` - Maximum motor current
- `l_in_current_max` - Maximum battery current
- `l_min_vin` / `l_max_vin` - Voltage limits
- `l_temp_fet_start` - MOSFET temp limit
- `l_temp_motor_start` - Motor temp limit

### Common Issues
1. **Motor detection fails** - Check connections, power
2. **Overtemp faults** - Reduce current limits
3. **DRV faults** - Gate driver issue (usually hardware)
4. **CAN issues** - Check termination, baud rate

## Learning Path

1. **Beginner**: Motor basics, VESC Tool UI, basic config
2. **Intermediate**: FOC theory, tuning, CAN networking
3. **Advanced**: LispBM scripting, package development
4. **Expert**: Firmware modification, hardware design
