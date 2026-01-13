# VESC_IT - VESC Intelligence & Technology

An AI-powered knowledge base and development environment for the VESC (Vedder Electronic Speed Controller) ecosystem.

## Purpose

This project serves as:
1. **Knowledge Base** - Comprehensive documentation for training AI agents to become VESC experts
2. **Development Hub** - Centralized workspace for VESC-related development
3. **Improvement Tracker** - Analysis of potential enhancements to the open-source VESC ecosystem

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

## AI Agent Training

This knowledge base is designed to train AI agents to:

1. **Understand VESC Architecture**
   - Firmware structure and control loops
   - Communication protocols (CAN, USB, UART, BLE)
   - Configuration systems and parameters

2. **Assist with Development**
   - Write and debug LispBM scripts
   - Create VESC packages
   - Configure motor parameters
   - Troubleshoot issues

3. **Provide Expert Guidance**
   - Motor tuning recommendations
   - Safety parameter advice
   - Hardware selection guidance
   - Integration assistance

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
