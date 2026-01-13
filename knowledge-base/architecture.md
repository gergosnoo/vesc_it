# VESC System Architecture

## Hardware Architecture

### Motor Controller (BLDC Firmware)

```
┌─────────────────────────────────────────────────────────────────┐
│                     STM32F4 MCU (168 MHz)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   FOC       │  │   Encoder   │  │    IMU      │             │
│  │   Control   │  │   Interface │  │   Driver    │             │
│  │   Loop      │  │             │  │             │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Motor Interface (mc_interface)          │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Application Layer (app.c)               │   │
│  │    PPM │ ADC │ UART │ Nunchuk │ NRF │ PAS │ Custom      │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  LispBM Virtual Machine                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌───────────┬───────────┬───────────┬───────────┐             │
│  │    USB    │    CAN    │   UART    │    NRF    │             │
│  │   (CDC)   │  (TWAI)   │           │   Radio   │             │
│  └───────────┴───────────┴───────────┴───────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Wireless Module (VESC Express)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESP32-C3 (RISC-V 160 MHz)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   WiFi      │  │    BLE      │  │   ESP-NOW   │             │
│  │   Stack     │  │   Stack     │  │             │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Communication Manager                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  LispBM Virtual Machine                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌───────────┬───────────┬───────────┬───────────┐             │
│  │    CAN    │   UART    │    Log    │   GNSS    │             │
│  │  Bridge   │           │  (SD/NAD) │           │             │
│  └───────────┴───────────┴───────────┴───────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### BMS (Battery Management System)

```
┌─────────────────────────────────────────────────────────────────┐
│                   STM32L476 MCU (168 MHz)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  LTC6813    │  │  Temp/Hum   │  │   Current   │             │
│  │  Cell Mon   │  │   Sensors   │  │   Sensing   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    BMS Interface                         │   │
│  │   Balance │ Charge Control │ Protection │ Sleep         │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌───────────┬───────────┐                                     │
│  │    CAN    │    USB    │                                     │
│  │           │   (CDC)   │                                     │
│  └───────────┴───────────┘                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Software Architecture

### BLDC Firmware Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    User Applications                         │
│  (VESC Tool, Mobile Apps, Custom Software)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Communication Layer                       │
│  commands.c, packet.c, comm_*.c                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  app.c, app_ppm.c, app_adc.c, app_uart.c, LispBM           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Motor Control Layer                       │
│  mc_interface.c, mcpwm_foc.c, encoder.c                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Hardware Abstraction                      │
│  hw.h, hw_*.c, STM32 HAL                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ChibiOS RTOS                              │
│  Threads, Mutexes, Timers, HAL                              │
└─────────────────────────────────────────────────────────────┘
```

### VESC Tool Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         GUI Layer                            │
│  MainWindow, Pages, Widgets, QML (Mobile)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  Setup Wizards, Code Loader, Firmware Manager               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Configuration Layer                         │
│  ConfigParams, ConfigParam, Settings                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Communication Layer                        │
│  VescInterface, Commands, Packet                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Transport Layer                           │
│  Serial, BLE, TCP, UDP, CAN                                 │
└─────────────────────────────────────────────────────────────┘
```

### Package System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Package (.vescpkg)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    pkgdesc.qml                       │   │
│  │  (Metadata, Compatibility, Dependencies)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │   Native Code   │  │         LispBM Code             │ │
│  │   (.bin ARM)    │  │         (.lisp)                 │ │
│  └────────┬────────┘  └────────────────┬────────────────┘ │
│           │                            │                   │
│           ▼                            ▼                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              LispBM Runtime on VESC                  │   │
│  │   load-native-lib → C functions available in Lisp   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    QML UI (ui.qml)                   │   │
│  │              Runs in VESC Tool                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Configuration (settings.xml)            │   │
│  │         → confparser.h, datatypes.h                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Control Loop Architecture

### FOC Control Loop (mcpwm_foc.c)

```
┌─────────────────────────────────────────────────────────────┐
│                    High-Frequency ISR (~20-40 kHz)          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. ADC Sample Complete Interrupt                           │
│     │                                                       │
│     ▼                                                       │
│  2. Current Measurement                                     │
│     ├── Phase A current                                     │
│     ├── Phase B current                                     │
│     └── Phase C current (calculated)                        │
│     │                                                       │
│     ▼                                                       │
│  3. Clarke Transform (ABC → αβ)                             │
│     │                                                       │
│     ▼                                                       │
│  4. Position Estimation / Reading                           │
│     ├── Sensorless (observer)                               │
│     ├── Hall sensors                                        │
│     ├── Encoder (ABI, SPI)                                  │
│     └── HFI (High Frequency Injection)                      │
│     │                                                       │
│     ▼                                                       │
│  5. Park Transform (αβ → dq)                                │
│     │                                                       │
│     ▼                                                       │
│  6. Current Controllers (PI)                                │
│     ├── Id controller (flux)                                │
│     └── Iq controller (torque)                              │
│     │                                                       │
│     ▼                                                       │
│  7. Inverse Park Transform (dq → αβ)                        │
│     │                                                       │
│     ▼                                                       │
│  8. Space Vector Modulation                                 │
│     │                                                       │
│     ▼                                                       │
│  9. PWM Update                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Balance Package Control Loop (Refloat)

```
┌─────────────────────────────────────────────────────────────┐
│              Balance Control Loop (~800-1400 Hz)            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. IMU Read                                                │
│     ├── Accelerometer (ax, ay, az)                          │
│     └── Gyroscope (gx, gy, gz)                              │
│     │                                                       │
│     ▼                                                       │
│  2. AHRS Filter (Mahony)                                    │
│     ├── Quaternion update                                   │
│     └── Pitch/Roll extraction                               │
│     │                                                       │
│     ▼                                                       │
│  3. State Machine Check                                     │
│     ├── Footpad sensors                                     │
│     ├── Fault conditions                                    │
│     └── State transitions                                   │
│     │                                                       │
│     ▼                                                       │
│  4. Setpoint Calculation                                    │
│     ├── ATR (Adaptive Torque Response)                      │
│     ├── Torque Tilt                                         │
│     ├── Turn Tilt                                           │
│     ├── Brake Tilt                                          │
│     ├── Nose Angling                                        │
│     └── Remote Input                                        │
│     │                                                       │
│     ▼                                                       │
│  5. PID Controller                                          │
│     ├── P: setpoint - pitch                                 │
│     ├── I: integral with limit                              │
│     └── D: pitch rate (kp2)                                 │
│     │                                                       │
│     ▼                                                       │
│  6. Current Booster                                         │
│     │                                                       │
│     ▼                                                       │
│  7. Soft Start Limiting                                     │
│     │                                                       │
│     ▼                                                       │
│  8. Motor Current Request                                   │
│     └── VESC_IF->set_current(current)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Memory Architecture

### BLDC Firmware Memory Map (STM32F405)

```
┌───────────────────────────────────────┐ 0x0810_0000
│           User Firmware Area          │
│           (up to 384KB)               │
├───────────────────────────────────────┤ 0x0804_0000
│           LispBM Code/Data            │
│           (128KB)                     │
├───────────────────────────────────────┤ 0x0802_0000
│           Main Firmware               │
│           (up to 128KB)               │
├───────────────────────────────────────┤ 0x0800_8000
│           Bootloader                  │
│           (32KB)                      │
└───────────────────────────────────────┘ 0x0800_0000

┌───────────────────────────────────────┐ 0x2002_0000
│           CCMRAM (64KB)               │
│           (Fast access data)          │
├───────────────────────────────────────┤ 0x2001_0000
│           SRAM2 (16KB)                │
├───────────────────────────────────────┤ 0x2000_C000
│           SRAM1 (112KB)               │
│           (Main RAM)                  │
└───────────────────────────────────────┘ 0x2000_0000
```

### Configuration Storage

```
Flash Sectors:
┌───────────────────────────────────────┐
│  Sector 10: Motor Config              │
│  Sector 11: Motor Config Backup       │
├───────────────────────────────────────┤
│  Sector 9: App Config                 │
│  Sector 8: App Config Backup          │
├───────────────────────────────────────┤
│  Sector 7: LispBM Code                │
│  Sector 6: LispBM Code (cont)         │
├───────────────────────────────────────┤
│  Sector 5: Custom Config              │
└───────────────────────────────────────┘
```

## Thread Architecture

### BLDC Firmware Threads

| Thread | Priority | Stack | Purpose |
|--------|----------|-------|---------|
| Main | NORMALPRIO | 2048 | Config, terminal |
| Timer | NORMALPRIO+4 | 256 | System tick |
| CAN RX | NORMALPRIO+1 | 256 | CAN reception |
| CAN Process | NORMALPRIO | 512 | CAN processing |
| USB | NORMALPRIO | 512 | USB CDC |
| LispBM Eval | NORMALPRIO-1 | 4096 | Lisp execution |
| ADC/FOC | ISR (highest) | - | Motor control |

### VESC Express Threads

| Thread | Priority | Stack | Purpose |
|--------|----------|-------|---------|
| Main | NORM | 4096 | Init, config |
| TCP Local | NORM | 4096 | TCP server |
| TCP Hub | NORM | 4096 | Hub client |
| UDP Broadcast | NORM | 2048 | Discovery |
| CAN RX | NORM+1 | 2048 | CAN reception |
| CAN Process | NORM | 2048 | CAN processing |
| CAN Status | NORM | 2048 | Status TX |
| LispBM | NORM-1 | 8192 | Lisp execution |
| BLE | NORM | 4096 | BLE GATT |

## Data Flow

### Motor Control Data Flow

```
Input Sources                    Control Path                    Output
─────────────                    ────────────                    ──────
                                      │
PPM ────────────┐                     │
                │                     ▼
ADC ────────────┼──► Application ──► Motor Interface
                │    Layer             │
UART ───────────┤      │               ▼
                │      │          FOC/BLDC ──────────► PWM ──► Motor
Nunchuk ────────┤      │          Control
                │      ▼               │
NRF ────────────┤   LispBM            │
                │   Override          │
CAN ────────────┘      │               ▼
                       └──────────► Telemetry ──► CAN/USB/UART
```

### Communication Data Flow

```
VESC Tool                         VESC                           Other
─────────                         ────                           ─────
    │                               │                               │
    │ USB/BLE/WiFi                  │ CAN                           │
    │                               │                               │
    ▼                               ▼                               │
┌───────┐                     ┌───────────┐                    ┌────┴────┐
│Packet │ ◄────────────────► │ commands.c│ ◄───────────────► │VESC #2  │
│Handler│                     └───────────┘                    └─────────┘
└───────┘                           │                               │
    │                               ▼                               │
    │                         ┌───────────┐                    ┌────┴────┐
    │                         │ Forward   │ ◄───────────────► │VESC BMS │
    │                         │ to CAN    │                    └─────────┘
    │                         └───────────┘                         │
    │                               │                               │
    │                               ▼                          ┌────┴────┐
    │                         ┌───────────┐                    │Express  │
    │                         │ Config/   │                    │         │
    └────────────────────────►│ Control   │◄───────────────────┴─────────┘
                              └───────────┘
```
