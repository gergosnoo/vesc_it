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

| Type | Enum Value | Description |
|------|------------|-------------|
| Ortega Original | 0 | Original Ortega observer |
| Mxlemming | 1 | Mxlemming improved observer |
| Ortega Lambda Comp | 2 | Ortega with lambda compensation |
| Mxlemming Lambda Comp | 3 | Mxlemming with lambda compensation |
| MXV | 4 | MXV observer |
| MXV Lambda Comp | 5 | MXV with lambda compensation |
| MXV Lambda Comp Lin | 6 | MXV with linear lambda compensation |

*Source: `bldc/datatypes.h:128-134`*

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
| 7 | Gate Driver Over Voltage | Gate driver supply too high |
| 8 | Gate Driver Under Voltage | Gate driver supply too low |
| 9 | MCU Under Voltage | MCU voltage brownout |
| 10 | Watchdog Reset | System reset from watchdog |
| 11 | Encoder SPI | SPI encoder communication error |
| 12 | Encoder Sin/Cos Low | Sin/cos amplitude too low |
| 13 | Encoder Sin/Cos High | Sin/cos amplitude too high |
| 14 | Flash Corruption | Flash memory CRC error |
| 15-17 | Current Sensor Offset | Current sensor offset too high |
| 18 | Unbalanced Currents | Phase currents unbalanced |
| 19 | BRK | Brake resistor fault |
| 20-22 | Resolver Faults | Resolver LOT/DOS/LOS errors |
| 25 | Encoder No Magnet | Magnetic encoder lost magnet |
| 26 | Encoder Magnet Strong | Magnetic encoder field too strong |
| 27 | Phase Filter | Phase filter fault |
| 29 | LV Output Fault | Low voltage output fault |

*Source: `bldc/datatypes.h:144-173`*

## Motor Detection Troubleshooting

### Detection Flowchart

```
Motor Detection Failed?
         │
         ▼
    ┌────────────────┐
    │ Motor spinning │──No──► Check: Motor connected?
    │   at all?      │        Phase wires secure?
    └───────┬────────┘
            │ Yes
            ▼
    ┌────────────────┐
    │ "R is 0" or    │──Yes─► Increase detection current
    │ "Bad detection"│        (5A → 10A → 15A)
    └───────┬────────┘
            │ No
            ▼
    ┌────────────────┐
    │ Hall Error 255 │──Yes─► Check Hall sensor wiring
    │                │        (5V, GND, H1, H2, H3)
    └───────┬────────┘
            │ No
            ▼
    ┌────────────────┐
    │ Detection runs │──Yes─► Remove load from motor
    │ but fails?     │        (belt, wheel, gear)
    └───────┬────────┘
            │ No
            ▼
    ┌────────────────┐
    │ PPM/ADC input  │──Yes─► Disable inputs before
    │ configured?    │        detection (App → General)
    └───────┬────────┘
            │ No
            ▼
    ┌────────────────┐
    │ VESC Tool and  │──No──► Update both to same
    │ FW versions    │        version (e.g., both 6.05)
    │ match?         │
    └───────┬────────┘
            │ Yes
            ▼
       Try different
       sensor mode
```

### Common Detection Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "R is 0" | Motor not spinning during RL measurement | Increase detection current (Motor → FOC → Detection Current) |
| "Bad detection result" | Insufficient current or load on motor | Remove belt/wheel, increase current to 10-15A |
| "Hall Error 255" | Hall sensor wiring issue | Check 5V, GND, and signal wires; verify sensor type |
| "Detection timeout" | Motor stuck or shorted | Check for mechanical binding; verify phase connections |
| "λ too low/high" | Incorrect motor parameters | Try different motor type preset; manual flux linkage entry |

### Detection Current Guidelines

| Motor Type | Recommended Current |
|------------|---------------------|
| Small hub motors | 3-5A |
| Mid-size hub motors | 5-10A |
| Large outrunners | 10-15A |
| High-power motors | 15-20A |

**Rule of thumb:** Start at 5A, increase by 5A increments if detection fails.

### Pre-Detection Checklist

Before running motor detection:
- [ ] Motor is disconnected from load (no belt/wheel tension)
- [ ] All three phase wires securely connected
- [ ] Hall sensors wired correctly (if using)
- [ ] No PPM/ADC/UART inputs active
- [ ] Battery fully charged (stable voltage)
- [ ] VESC Tool version matches firmware version

### Hall Sensor Wiring

Standard 6-pin JST connector:
```
Pin 1: 5V (Red)
Pin 2: H1 (Yellow)
Pin 3: H2 (Green)
Pin 4: H3 (Blue)
Pin 5: Temperature (optional)
Pin 6: GND (Black)
```

**Note:** Wire colors vary by manufacturer. Use multimeter to verify 5V and GND.

### Sensorless Detection Tips

For sensorless FOC detection:
1. Ensure motor can spin freely
2. Use higher detection current (10A+)
3. Motor will spin briefly during detection
4. If it fails, try "Measure Flux Linkage" separately

## Resources

- [VESC Project Website](https://vesc-project.com/)
- [Forum](https://vesc-project.com/forum)
- [GitHub Repository](https://github.com/vedderb/bldc)
