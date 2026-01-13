# VESC_IT - VESC Intelligence & Technology

An AI-powered knowledge base for **Onewheel-style self-balancing PEVs** using VESC and Refloat.

## Purpose

This project serves as:
1. **Knowledge Base** - Comprehensive documentation for Onewheel/Refloat configuration
2. **AI Assistant** - Chatbot that explains every config variable and tuning option
3. **Setup Guide** - Optimization notes for self-balancing vehicles

## Focus: Onewheels & Self-Balancing PEVs

Primary focus on:
- **Refloat package** - The main self-balancing firmware
- **VESC configuration** - Motor and app settings for balance boards
- **Tuning** - PID, ATR, tiltback, safety settings
- **Hardware** - Compatible VESC controllers and motors

## Repository Structure

```
vesc_it/
├── README.md                 # This file
├── docs/                     # Comprehensive documentation
│   ├── bldc.md              # VESC motor controller firmware
│   ├── vesc_tool.md         # Desktop configuration tool
│   ├── vesc_pkg.md          # Package system
│   ├── vesc_express.md      # ESP32 WiFi/BLE module
│   ├── vesc_bms_fw.md       # Battery management system
│   └── refloat.md           # Self-balancing package
├── knowledge-base/          # AI training materials
│   ├── overview.md          # VESC ecosystem overview
│   ├── protocols.md         # Communication protocols
│   └── architecture.md      # System architecture
├── analysis/                # Technical analysis
│   └── ecosystem-map.md     # Component relationships
└── improvements/            # Enhancement proposals
    └── opportunities.md     # Identified improvements
```

## Sibling Repositories

This project works alongside:
- `../bldc/` - Motor controller firmware (STM32)
- `../vesc_tool/` - Qt-based configuration application
- `../vesc_pkg/` - VESC packages and libraries
- `../vesc_express/` - ESP32 wireless module firmware
- `../vesc_bms_fw/` - Battery management firmware
- `../refloat/` - Self-balancing vehicle package

## VESC Ecosystem Overview

### Hardware Layers

| Layer | Component | MCU | Purpose |
|-------|-----------|-----|---------|
| Motor Control | BLDC Firmware | STM32F4 | FOC motor control |
| Wireless | VESC Express | ESP32-C3 | WiFi/BLE bridge |
| Battery | BMS Firmware | STM32L4 | Cell management |
| Display | Various | ESP32 | User interface |

### Software Layers

| Layer | Component | Technology | Purpose |
|-------|-----------|------------|---------|
| Firmware | BLDC | C + ChibiOS | Real-time control |
| Scripting | LispBM | Embedded Lisp | Custom logic |
| Desktop | VESC Tool | Qt/C++ | Configuration |
| Mobile | VESC Tool | QML | Mobile config |
| Packages | vesc_pkg | C + Lisp + QML | Extensions |

## AI Assistant Capabilities

The VESC AI chatbot can help with:

1. **Configuration Explanation**
   - Explain any motor.xml, app.xml, or refloat.xml variable
   - Show what each setting does and safe ranges
   - Describe how changes affect ride feel

2. **Tuning Guidance**
   - PID tuning (kp, ki, kp2) for your riding style
   - ATR setup for hills and terrain
   - Tiltback and safety configuration
   - Startup and footpad settings

3. **Troubleshooting**
   - Diagnose common issues (nosedives, wobbles)
   - Fault code explanations
   - Hardware compatibility checks

4. **Setup Optimization**
   - Motor detection settings
   - Current limits for your battery/motor
   - Temperature and voltage thresholds

## Key Technologies

- **Motor Control**: Field Oriented Control (FOC), BLDC commutation
- **MCU Platforms**: STM32F4, STM32L4, ESP32-C3
- **RTOS**: ChibiOS, FreeRTOS (ESP-IDF)
- **Scripting**: LispBM (embedded Lisp dialect)
- **Communication**: CAN bus, USB CDC, UART, BLE GATT, WiFi TCP/UDP
- **UI Framework**: Qt 5, QML

## Getting Started

### For AI Agents

Read the documentation in this order:
1. `knowledge-base/overview.md` - Ecosystem introduction
2. `knowledge-base/architecture.md` - Technical architecture
3. `docs/bldc.md` - Core firmware details
4. `docs/vesc_tool.md` - Configuration tool
5. `knowledge-base/protocols.md` - Communication details

### For Developers

1. Clone this repository and siblings
2. Review `improvements/opportunities.md` for contribution ideas
3. Check individual repo documentation for build instructions

## License

This project is licensed under GPL-3.0, consistent with the VESC ecosystem.

## Contributing

Contributions welcome! See `improvements/opportunities.md` for areas needing work.

## Contact

GitHub: [gergosnoo](https://github.com/gergosnoo)
