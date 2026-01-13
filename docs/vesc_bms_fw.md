# VESC BMS Firmware

## Overview

Battery Management System firmware for lithium battery packs:

- Cell voltage monitoring (up to 18S)
- Active cell balancing
- Temperature monitoring
- Charge control with safety
- CAN bus integration
- Low-power sleep mode

**Repository:** `../vesc_bms_fw/`
**Current Version:** 6.0
**License:** GPL-3.0
**Target:** STM32L476

## Key Features

### Cell Management
- LTC6813 cell monitor IC
- 0.1mV voltage resolution
- Up to 18 cells in series
- Distributed balancing support

### Balancing Modes
| Mode | Description |
|------|-------------|
| Disabled | No balancing |
| Charging Only | Balance during charge |
| During & After | Balance during and after charge |
| Always | Continuous balancing |

### Protection
- Over/under voltage
- Over temperature
- Overcurrent detection
- Humidity monitoring

### Communication
- CAN bus status broadcast
- USB configuration
- VESC protocol compatible

## Architecture

```
┌─────────────────────────────────────┐
│  LTC6813     Temp Sensors  Current  │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│            BMS Interface            │
│  Balance │ Charge │ Protection      │
└─────────────────┬───────────────────┘
                  │
         ┌───────┴───────┐
         │               │
         ▼               ▼
┌─────────────┐  ┌─────────────┐
│     CAN     │  │     USB     │
└─────────────┘  └─────────────┘
```

## Supported Hardware

| Hardware | Cells | Description |
|----------|-------|-------------|
| hw_12s7p_v1 | 12S | 12 series, 7 parallel |
| hw_18s_light | 18S | 18 series light |
| hw_stormcore_bms | Variable | StormCore BMS |
| hw_rbat | Variable | RBAT |
| hw_lb | Variable | LB (default) |

## Configuration

### Balance Settings
| Parameter | Description |
|-----------|-------------|
| `balance_mode` | Balancing mode |
| `vc_balance_start` | Start delta (V) |
| `vc_balance_end` | Stop delta (V) |
| `vc_balance_min` | Minimum voltage |
| `max_bal_ch` | Max balance channels |

### Charge Settings
| Parameter | Description |
|-----------|-------------|
| `vc_charge_start` | Charge start voltage |
| `vc_charge_end` | Charge end voltage |
| `vc_charge_min` | Minimum charge voltage |
| `max_charge_current` | Max current (A) |
| `t_charge_max` | Max temperature (°C) |
| `t_charge_min` | Min temperature (°C) |

### CAN Settings
| Parameter | Description |
|-----------|-------------|
| `controller_id` | CAN ID |
| `can_baud_rate` | Baud rate |
| `send_can_status_rate_hz` | Status rate |

## CAN Status Messages

| Packet | Content |
|--------|---------|
| BMS_V_TOT | Total voltage |
| BMS_I | Current |
| BMS_AH_WH | Ah/Wh counters |
| BMS_V_CELL | Cell voltages |
| BMS_BAL | Balance state |
| BMS_TEMPS | Temperatures |
| BMS_SOC_SOH | State of charge/health |

## Build Instructions

```bash
# Standard build
make

# Upload via ST-Link
make upload

# Mass erase
make mass_erase
```

## Resources

- [GitHub Repository](https://github.com/vedderb/vesc_bms_fw)
