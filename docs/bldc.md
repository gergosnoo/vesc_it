# VESC BLDC Firmware

## Overview

The VESC BLDC firmware is the core motor controller firmware for VESC hardware. It runs on STM32F4 microcontrollers and provides:

- Field Oriented Control (FOC) for BLDC and PMSM motors
- BLDC trapezoidal commutation
- DC motor control
- Multiple sensor modes (sensorless, Hall, encoder)
- CAN bus networking
- LispBM scripting
- Extensive configuration options

**Repository:** `../bldc/`
**Current Version:** 7.00
**License:** GPL-3.0

## Key Features

### Motor Control Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| FOC | Field Oriented Control | Best efficiency, smooth operation |
| BLDC | Trapezoidal commutation | Simple, robust |
| DC | Direct current control | DC motors |

### Sensor Modes

| Mode | Description |
|------|-------------|
| Sensorless | Back-EMF observer |
| Hall | Hall effect sensors |
| Encoder ABI | Incremental encoder |
| Encoder AS5047 | Magnetic encoder (SPI) |
| Resolver | AD2S1205 resolver |
| Sin/Cos | Analog encoder |
| HFI | High Frequency Injection |

### FOC Observer Types

- Ortega Original
- Mxlemming
- Ortega Lambda Comp
- Mxlemming Lambda Comp
- MXV variants

## Architecture

```
┌─────────────────────────────────────────────┐
│                 main.c                       │
│            (Entry Point)                     │
└─────────────────┬───────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│mc_inter │ │commands │ │   app   │
│face     │ │         │ │         │
└────┬────┘ └─────────┘ └─────────┘
     │
     ▼
┌─────────┐
│mcpwm_foc│
│         │
└─────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `main.c` | Entry point, initialization |
| `motor/mcpwm_foc.c` | FOC control implementation |
| `motor/mc_interface.c` | Motor control API |
| `comm/commands.c` | Packet command handling |
| `comm/comm_can.c` | CAN bus communication |
| `applications/app.c` | Input application manager |
| `datatypes.h` | All data structures |
| `conf_general.h/c` | Configuration management |

## Configuration Parameters

### Current Limits
- `l_current_max` - Maximum motor current (A)
- `l_current_min` - Maximum regen current (A)
- `l_in_current_max` - Maximum battery current (A)
- `l_in_current_min` - Maximum battery regen (A)
- `l_abs_current_max` - Absolute maximum current (A)

### Voltage Limits
- `l_min_vin` - Minimum input voltage (V)
- `l_max_vin` - Maximum input voltage (V)
- `l_battery_cut_start` - Battery cutoff start (V)
- `l_battery_cut_end` - Battery cutoff end (V)

### Temperature Limits
- `l_temp_fet_start` - MOSFET temp limit start (°C)
- `l_temp_fet_end` - MOSFET temp limit end (°C)
- `l_temp_motor_start` - Motor temp limit start (°C)
- `l_temp_motor_end` - Motor temp limit end (°C)

### FOC Parameters
- `foc_current_kp` - Current controller P gain
- `foc_current_ki` - Current controller I gain
- `foc_motor_l` - Motor inductance (H)
- `foc_motor_r` - Motor resistance (Ω)
- `foc_motor_flux_linkage` - Flux linkage (Wb)
- `foc_observer_gain` - Observer gain

## Hardware Support

### Official TRAMPA
- VESC 6 (MK1-MK6)
- VESC 60/75, 75/300
- VESC 100/250, 100/500
- HD Series

### Third-Party
- Flipsky variants
- Stormcore series
- MakerBase MKS
- Ubox controllers
- Many others

## Build System

```bash
# Install toolchain
make arm_sdk_install

# List available targets
make

# Build specific hardware
make fw_60

# Flash via OpenOCD
make fw_60_flash

# Build all variants
make all_fw
```

## Communication

### USB
- CDC ACM class
- Primary configuration interface
- Full command set

### CAN Bus
- 125K to 1M baud
- Multi-device networking
- Status broadcasting
- Command forwarding

### UART
- Configurable baud rate
- Secondary interface

## LispBM Scripting

The firmware includes a full LispBM interpreter for custom logic:

```lisp
; Set motor current
(set-current 10.0)

; Read input voltage
(get-vin)

; Control GPIO
(gpio-configure 'pin-rx 'pin-mode-out)
(gpio-write 'pin-rx 1)

; CAN communication
(can-send-sid 0x100 (list 1 2 3 4))
```

## Fault Codes

| Code | Name | Cause |
|------|------|-------|
| 0 | None | No fault |
| 1 | Over Voltage | Input voltage too high |
| 2 | Under Voltage | Input voltage too low |
| 3 | DRV | Gate driver fault |
| 4 | Abs Over Current | Absolute overcurrent |
| 5 | Over Temp FET | MOSFET overtemperature |
| 6 | Over Temp Motor | Motor overtemperature |

## Resources

- [VESC Project Website](https://vesc-project.com/)
- [Forum](https://vesc-project.com/forum)
- [GitHub Repository](https://github.com/vedderb/bldc)
