# VESC Tool

## Overview

VESC Tool is the official desktop and mobile application for configuring VESC hardware. Built with Qt, it provides:

- Motor detection and auto-configuration
- Real-time data monitoring
- Firmware upload and management
- LispBM script editing
- Package installation
- Configuration backup/restore

**Repository:** `../vesc_tool/`
**Current Version:** 7.00
**License:** GPL-3.0
**Platforms:** Linux, Windows, macOS, Android, iOS

## Key Features

### Motor Setup Wizard
- Guided configuration process
- Automatic motor detection
- Sensor configuration (Hall, encoder)
- Current and voltage limit setup

### Real-Time Monitoring
- Motor values (current, voltage, RPM)
- Temperature monitoring
- IMU data visualization
- Data logging and export

### Firmware Management
- Firmware upload/update
- Bootloader management
- Hardware-specific firmware selection

### LispBM Development
- Script editor with highlighting
- REPL interface
- Example library
- Package creation tools

## Architecture

```
┌─────────────────────────────────────┐
│            GUI Layer                │
│  MainWindow, Pages, Widgets, QML   │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│        Business Logic Layer         │
│  Setup Wizards, Code Loader         │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      Configuration Layer            │
│  ConfigParams, ConfigParam          │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      Communication Layer            │
│  VescInterface, Commands, Packet    │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│        Transport Layer              │
│  Serial, BLE, TCP, UDP, CAN         │
└─────────────────────────────────────┘
```

## Key Pages

| Page | Purpose |
|------|---------|
| Welcome | Start page, quick actions |
| Connection | Device connection management |
| Firmware | Firmware upload/update |
| Motor Settings | Motor configuration |
| App Settings | Application configuration |
| RT Data | Real-time data monitoring |
| Terminal | Debug terminal |
| Lisp | LispBM script editor |
| VESC Package | Package management |
| BMS | Battery management |

## Connection Types

| Type | Use Case |
|------|----------|
| Serial (USB) | Primary desktop connection |
| Bluetooth LE | Mobile connection |
| TCP | WiFi via Express |
| UDP | Device discovery |
| TCP Hub | Remote access |

## Key Classes

### VescInterface
Central communication manager:
- Connection management
- Config read/write
- Firmware upload
- Data retrieval

### Commands
Protocol command encoding/decoding:
- Motor control commands
- Configuration commands
- Data requests

### ConfigParams
Configuration parameter management:
- Parameter definitions
- Serialization/deserialization
- Default values

## Build Instructions

### Dependencies (Ubuntu)
```bash
sudo apt install qt5-default libqt5serialport5-dev \
    qtquickcontrols2-5-dev qtconnectivity5-dev \
    qtpositioning5-dev libqt5gamepad5-dev libqt5svg5-dev
```

### Build
```bash
qmake -config release
make -j8
./build/lin/vesc_tool
```

## CLI Options

| Option | Description |
|--------|-------------|
| `--vescPort <port>` | Specify VESC port |
| `--getMcConf <path>` | Read motor config |
| `--setMcConf <path>` | Write motor config |
| `--uploadFirmware <path>` | Upload firmware |
| `--uploadLisp <path>` | Upload Lisp script |
| `--buildPkg <args>` | Build package |
| `--tcpServer <port>` | Start TCP server |

## Resources

- [Download](https://vesc-project.com/vesc_tool)
- [GitHub Repository](https://github.com/vedderb/vesc_tool)
