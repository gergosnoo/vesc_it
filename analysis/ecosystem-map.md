# VESC Ecosystem Map

## Component Relationships

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              VESC ECOSYSTEM                                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                         USER APPLICATIONS                             │ │
│  │                                                                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │ VESC Tool   │  │ Mobile Apps │  │ Custom Apps │  │ Web UIs     │ │ │
│  │  │ (Desktop)   │  │ (QML)       │  │             │  │             │ │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │ │
│  │         └────────────────┴────────────────┴────────────────┘         │ │
│  └──────────────────────────────────┬───────────────────────────────────┘ │
│                                     │                                      │
│                                     ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                      COMMUNICATION LAYER                              │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │ │
│  │  │ USB  │  │ BLE  │  │ WiFi │  │ CAN  │  │ UART │  │ TCP  │        │ │
│  │  │ CDC  │  │ GATT │  │ TCP  │  │ Bus  │  │      │  │ Hub  │        │ │
│  │  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘        │ │
│  │     └─────────┴─────────┴─────────┴─────────┴─────────┘             │ │
│  └──────────────────────────────────┬───────────────────────────────────┘ │
│                                     │                                      │
│                                     ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                        HARDWARE LAYER                                 │ │
│  │                                                                       │ │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │ │
│  │  │  VESC Motor     │◄──►│  VESC Express   │◄──►│  VESC BMS       │  │ │
│  │  │  Controller     │    │  (ESP32)        │    │  (STM32L4)      │  │ │
│  │  │  (STM32F4)      │    │                 │    │                 │  │ │
│  │  │                 │    │  • WiFi         │    │  • Cell Monitor │  │ │
│  │  │  • FOC Control  │    │  • BLE          │    │  • Balancing    │  │ │
│  │  │  • Encoders     │    │  • CAN Bridge   │    │  • Protection   │  │ │
│  │  │  • Applications │    │  • Logging      │    │  • CAN Status   │  │ │
│  │  │  • LispBM       │    │  • GNSS         │    │                 │  │ │
│  │  │  • CAN Master   │    │  • LispBM       │    │                 │  │ │
│  │  └────────┬────────┘    └─────────────────┘    └─────────────────┘  │ │
│  │           │                                                          │ │
│  │           ▼                                                          │ │
│  │  ┌─────────────────┐                                                 │ │
│  │  │  BLDC Motor     │                                                 │ │
│  │  │  (3-Phase)      │                                                 │ │
│  │  └─────────────────┘                                                 │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                       EXTENSION LAYER                                 │ │
│  │                                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│  │  │                    VESC Packages (.vescpkg)                      │ │ │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │ │ │
│  │  │  │ Balance │  │ Refloat │  │ VBMS32  │  │ LogUI   │            │ │ │
│  │  │  │         │  │         │  │         │  │         │            │ │ │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │ │ │
│  │  │                                                                  │ │ │
│  │  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │ │ │
│  │  │  │ lib_ws2812    │  │ lib_files     │  │ lib_nau7802   │       │ │ │
│  │  │  │ (LED Driver)  │  │ (Assets)      │  │ (ADC Driver)  │       │ │ │
│  │  │  └───────────────┘  └───────────────┘  └───────────────┘       │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Matrix

| From \ To | Motor VESC | Express | BMS | VESC Tool | Mobile | Packages |
|-----------|------------|---------|-----|-----------|--------|----------|
| **Motor VESC** | CAN Peer | CAN/UART | CAN Status | USB/UART | BLE | LispBM API |
| **Express** | CAN Cmd | - | CAN Relay | WiFi TCP | BLE/WiFi | - |
| **BMS** | CAN Status | CAN | - | CAN→VESC | CAN→VESC | LispBM |
| **VESC Tool** | USB/CAN | WiFi | CAN→VESC | - | - | Install |
| **Mobile** | BLE/WiFi | BLE/WiFi | BLE→VESC | - | - | Install |
| **Packages** | LispBM | - | LispBM | QML UI | QML UI | Import |

## Repository Dependency Graph

```
                    ┌──────────────────┐
                    │   vesc_tool      │
                    │  (Qt Application)│
                    └────────┬─────────┘
                             │ builds packages
                             │ uploads firmware
                             ▼
    ┌────────────────────────┴────────────────────────┐
    │                                                  │
    ▼                                                  ▼
┌──────────────────┐                      ┌──────────────────┐
│      bldc        │                      │    vesc_pkg      │
│  (Motor FW)      │ ◄────────────────────│  (Packages)      │
│                  │   packages run on    │                  │
└────────┬─────────┘                      └────────┬─────────┘
         │                                         │
         │ CAN protocol                            │ packages for
         │                                         │
         ▼                                         ▼
┌──────────────────┐                      ┌──────────────────┐
│  vesc_express    │                      │    refloat       │
│  (ESP32 FW)      │                      │ (Balance Pkg)    │
└────────┬─────────┘                      └──────────────────┘
         │
         │ CAN protocol
         ▼
┌──────────────────┐
│   vesc_bms_fw    │
│   (BMS FW)       │
└──────────────────┘
```

## Technology Stack Summary

### Motor Controller (bldc)
- **MCU:** STM32F405/407 (ARM Cortex-M4 @ 168MHz)
- **RTOS:** ChibiOS 3.0.5
- **Language:** C (C99)
- **Build:** GNU Make + ARM GCC
- **Scripting:** LispBM

### VESC Tool
- **Framework:** Qt 5.15
- **Languages:** C++11, QML, JavaScript
- **Build:** QMake
- **Platforms:** Linux, Windows, macOS, Android, iOS

### VESC Express
- **MCU:** ESP32-C3 (RISC-V @ 160MHz)
- **Framework:** ESP-IDF 5.2
- **Language:** C (C99)
- **Build:** CMake + idf.py
- **Scripting:** LispBM

### VESC BMS
- **MCU:** STM32L476 (ARM Cortex-M4 @ 168MHz)
- **RTOS:** ChibiOS 20.3.0
- **Language:** C (C99)
- **Build:** GNU Make + ARM GCC

### Packages (vesc_pkg, refloat)
- **Native:** C (ARM Cortex-M) compiled to .bin
- **Scripting:** LispBM (.lisp)
- **UI:** QML (.qml)
- **Config:** XML → C code generation
- **Build:** Make + vesc_tool

## Key Interfaces

### LispBM Extensions (Motor Controller)

| Category | Functions |
|----------|-----------|
| Motor Control | `set-duty`, `set-current`, `set-rpm`, `set-pos` |
| Motor Data | `get-vin`, `get-current-in`, `get-duty`, `get-rpm` |
| IMU | `get-imu-rpy`, `get-imu-quat`, `get-imu-acc` |
| GPIO | `gpio-configure`, `gpio-write`, `gpio-read` |
| CAN | `can-send-sid`, `can-send-eid`, `can-recv` |
| EEPROM | `eeprom-store-*`, `eeprom-read-*` |
| System | `sleep`, `spawn`, `yield`, `sysinfo` |

### VESC Interface (C/C++)

| Category | Functions |
|----------|-----------|
| Connection | `connectSerial`, `connectTcp`, `connectBle` |
| Config | `getMcconf`, `setMcconf`, `getAppConf`, `setAppConf` |
| Control | `setDutyCycle`, `setCurrent`, `setRpm`, `setPos` |
| Data | `getValues`, `getValuesSetup`, `getImuData` |
| Firmware | `fwUpload`, `fwEraseNewApp` |
| Lisp | `lispUpload`, `lispErase`, `lispSetRunning` |

### CAN Commands

| ID Range | Category |
|----------|----------|
| 0-4 | Motor Control |
| 5-15 | Status Messages |
| 16-31 | Configuration |
| 32-37 | IO Board |
| 38-68 | BMS |
| 59-62 | GNSS |

## Version Compatibility Matrix

| BLDC FW | VESC Tool | Express | BMS FW | Min Package API |
|---------|-----------|---------|--------|-----------------|
| 7.00 | 7.00 | 6.0 | 6.0 | 7.0 |
| 6.05 | 6.05 | 5.x | 5.x | 6.05 |
| 6.02 | 6.02 | 5.x | 5.x | 6.02 |
| 6.00 | 6.00 | 5.x | 5.x | 6.00 |
| 5.x | 5.x | N/A | N/A | N/A |

## File Count Summary

| Repository | C/H Files | Lisp Files | QML Files | Total LOC |
|------------|-----------|------------|-----------|-----------|
| bldc | ~200 | ~5 | 0 | ~150,000 |
| vesc_tool | ~150 | 0 | ~100 | ~100,000 |
| vesc_pkg | ~100 | ~50 | ~30 | ~50,000 |
| vesc_express | ~80 | ~10 | 0 | ~40,000 |
| vesc_bms_fw | ~60 | 0 | 0 | ~25,000 |
| refloat | ~60 | ~5 | 1 | ~20,000 |

## Communication Port Summary

| Port | Protocol | Direction | Use |
|------|----------|-----------|-----|
| USB | CDC ACM | Bidirectional | Primary config |
| UART (default) | 115200 8N1 | Bidirectional | Serial config |
| CAN | 125K-1M | Bidirectional | Multi-device |
| BLE | GATT | Bidirectional | Mobile config |
| WiFi TCP | 65102 | Bidirectional | Wireless config |
| WiFi UDP | 65109 | Outbound | Discovery |
| TCP Hub | 65101 | Bidirectional | Remote access |
