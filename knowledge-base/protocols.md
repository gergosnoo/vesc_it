# VESC Communication Protocols

## Packet Protocol

All VESC communication uses a consistent packet framing protocol.

### Frame Format

```
Short packet (payload ≤ 256 bytes):
┌──────┬────────┬─────────────┬────────┬──────┐
│ 0x02 │ Length │   Payload   │ CRC16  │ 0x03 │
│ (1)  │  (1)   │  (N bytes)  │  (2)   │ (1)  │
└──────┴────────┴─────────────┴────────┴──────┘

Long packet (payload > 256 bytes):
┌──────┬─────────┬─────────────┬────────┬──────┐
│ 0x03 │ Length  │   Payload   │ CRC16  │ 0x03 │
│ (1)  │  (2)    │  (N bytes)  │  (2)   │ (1)  │
└──────┴─────────┴─────────────┴────────┴──────┘
```

### CRC16 Calculation

```c
unsigned short crc16(const unsigned char *buf, unsigned int len) {
    unsigned short crc = 0;
    for (unsigned int i = 0; i < len; i++) {
        crc = (crc >> 8) ^ crc16_tab[(crc ^ buf[i]) & 0xff];
    }
    return crc;
}
```

## Command IDs (COMM_PACKET_ID)

### Core Commands

| ID | Name | Direction | Description |
|----|------|-----------|-------------|
| 0 | `COMM_FW_VERSION` | Request/Response | Get firmware version |
| 1 | `COMM_JUMP_TO_BOOTLOADER` | Request | Enter bootloader |
| 2 | `COMM_ERASE_NEW_APP` | Request | Erase firmware area |
| 3 | `COMM_WRITE_NEW_APP_DATA` | Request | Write firmware data |
| 4 | `COMM_GET_VALUES` | Request/Response | Get motor values |
| 5 | `COMM_SET_DUTY` | Request | Set duty cycle |
| 6 | `COMM_SET_CURRENT` | Request | Set motor current |
| 7 | `COMM_SET_CURRENT_BRAKE` | Request | Set brake current |
| 8 | `COMM_SET_RPM` | Request | Set target RPM |
| 9 | `COMM_SET_POS` | Request | Set target position |
| 10 | `COMM_SET_HANDBRAKE` | Request | Set handbrake current |

### Configuration Commands

| ID | Name | Direction | Description |
|----|------|-----------|-------------|
| 13 | `COMM_SET_MCCONF` | Request | Set motor config |
| 14 | `COMM_GET_MCCONF` | Request/Response | Get motor config |
| 15 | `COMM_GET_MCCONF_DEFAULT` | Request/Response | Get default config |
| 16 | `COMM_SET_APPCONF` | Request | Set app config |
| 17 | `COMM_GET_APPCONF` | Request/Response | Get app config |
| 18 | `COMM_GET_APPCONF_DEFAULT` | Request/Response | Get default app config |

### Terminal & Debug

| ID | Name | Direction | Description |
|----|------|-----------|-------------|
| 20 | `COMM_TERMINAL_CMD` | Request | Send terminal command |
| 21 | `COMM_TERMINAL_CMD_SYNC` | Request/Response | Sync terminal command |
| 22 | `COMM_DETECT_MOTOR_PARAM` | Request/Response | Motor detection |
| 29 | `COMM_REBOOT` | Request | Reboot controller |
| 30 | `COMM_ALIVE` | Request | Keep-alive ping |

### Data Commands

| ID | Name | Direction | Description |
|----|------|-----------|-------------|
| 50 | `COMM_GET_VALUES_SETUP` | Request/Response | Get setup values |
| 51 | `COMM_SET_MCCONF_TEMP` | Request | Temp motor config |
| 52 | `COMM_SET_MCCONF_TEMP_SETUP` | Request | Temp setup config |
| 65 | `COMM_GET_IMU_DATA` | Request/Response | Get IMU data |

### CAN Commands

| ID | Name | Direction | Description |
|----|------|-----------|-------------|
| 34 | `COMM_FORWARD_CAN` | Request | Forward to CAN device |
| 35 | `COMM_SET_CHUCK_DATA` | Request | Nunchuk data |
| 36 | `COMM_CUSTOM_APP_DATA` | Both | Custom app data |
| 37 | `COMM_NRF_START_PAIRING` | Request | NRF pairing |

### BMS Commands

| ID | Name | Direction | Description |
|----|------|-----------|-------------|
| 96 | `COMM_BMS_GET_VALUES` | Request/Response | Get BMS values |
| 97 | `COMM_BMS_SET_CHARGE_ALLOWED` | Request | Allow/deny charging |
| 98 | `COMM_BMS_SET_BALANCE_OVERRIDE` | Request | Override balancing |
| 99 | `COMM_BMS_RESET_COUNTERS` | Request | Reset Ah/Wh counters |
| 100 | `COMM_BMS_FORCE_BALANCE` | Request | Force balance on/off |
| 101 | `COMM_BMS_ZERO_CURRENT_OFFSET` | Request | Calibrate current |

### LispBM Commands

| ID | Name | Direction | Description |
|----|------|-----------|-------------|
| 130 | `COMM_LISP_READ_CODE` | Request/Response | Read Lisp code |
| 131 | `COMM_LISP_WRITE_CODE` | Request | Write Lisp code |
| 132 | `COMM_LISP_ERASE_CODE` | Request | Erase Lisp code |
| 133 | `COMM_LISP_SET_RUNNING` | Request | Start/stop Lisp |
| 134 | `COMM_LISP_GET_STATS` | Request/Response | Get Lisp stats |
| 135 | `COMM_LISP_PRINT` | Response | Lisp print output |
| 138 | `COMM_LISP_REPL_CMD` | Request | REPL command |
| 139 | `COMM_LISP_STREAM_CODE` | Request | Stream Lisp code |

## CAN Bus Protocol

### Extended ID Format (29-bit)

```
┌─────────────────────────────────────────────┐
│ 28-21 │ 20-16 │ 15-8      │ 7-0            │
│ Resv  │ Cmd   │ Dest ID   │ Source ID      │
└─────────────────────────────────────────────┘
```

### CAN Packet Types

| ID | Name | Data Format |
|----|------|-------------|
| 0 | `CAN_PACKET_SET_DUTY` | int32 duty × 100000 |
| 1 | `CAN_PACKET_SET_CURRENT` | int32 current × 1000 |
| 2 | `CAN_PACKET_SET_CURRENT_BRAKE` | int32 current × 1000 |
| 3 | `CAN_PACKET_SET_RPM` | int32 ERPM |
| 4 | `CAN_PACKET_SET_POS` | int32 position × 1000000 |
| 9 | `CAN_PACKET_STATUS` | See below |
| 14 | `CAN_PACKET_STATUS_2` | Ah used/charged |
| 15 | `CAN_PACKET_STATUS_3` | Wh used/charged |
| 16 | `CAN_PACKET_STATUS_4` | Temps, current in |
| 27 | `CAN_PACKET_STATUS_5` | Tachometer, voltage |
| 58 | `CAN_PACKET_STATUS_6` | ADC, PPM, distance |

### Status Message 1 (CAN_PACKET_STATUS)

```
Bytes 0-3: int32 ERPM
Bytes 4-5: int16 current × 10
Bytes 6-7: int16 duty × 1000
```

### Status Message 4 (CAN_PACKET_STATUS_4)

```
Byte 0-1: int16 temp FET × 10
Byte 2-3: int16 temp motor × 10
Byte 4-5: int16 current in × 10
Byte 6-7: int16 position × 50
```

### Fragmented Messages

For packets larger than 8 bytes:

1. Send `CAN_PACKET_FILL_RX_BUFFER` with fragments
2. Send `CAN_PACKET_PROCESS_RX_BUFFER` to process

```c
// Fragment header
┌──────────┬────────────────────────┐
│ Index    │ Data (up to 7 bytes)   │
│ (1 byte) │                        │
└──────────┴────────────────────────┘
```

### CAN Baud Rates

| Enum | Speed |
|------|-------|
| 0 | 125 Kbit/s |
| 1 | 250 Kbit/s |
| 2 | 500 Kbit/s |
| 3 | 1 Mbit/s |
| 4 | 10 Kbit/s |
| 5 | 20 Kbit/s |
| 6 | 50 Kbit/s |
| 7 | 75 Kbit/s |
| 8 | 100 Kbit/s |

## BLE Protocol

### GATT Service

**Service UUID:** `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`

### Characteristics

| Name | UUID | Properties |
|------|------|------------|
| RX | `6E400002-...` | Write, Write No Response |
| TX | `6E400003-...` | Notify |

### Communication Flow

1. Client writes packet to RX characteristic
2. Server processes and responds via TX notifications
3. Same packet protocol as USB/UART

## WiFi Protocol

### TCP Server

- Default port: **65102**
- Same packet protocol as USB
- Supports multiple connections

### UDP Discovery

- Port: **65109**
- Broadcast: Device info for discovery
- Response includes device UUID and name

### TCP Hub

- Server: `veschub.vedder.se:65101`
- Auth: `VESC:<device_id>:<password>\n`
- Enables remote access through NAT

## Data Structures

### MC_VALUES (COMM_GET_VALUES Response)

```c
float v_in;              // Input voltage
float temp_mos;          // MOSFET temperature
float temp_motor;        // Motor temperature
float current_motor;     // Motor current
float current_in;        // Battery current
float id, iq;            // FOC d/q currents
float rpm;               // ERPM
float duty_now;          // Duty cycle (0-1)
float amp_hours;         // Ah consumed
float amp_hours_charged; // Ah regenerated
float watt_hours;        // Wh consumed
float watt_hours_charged;// Wh regenerated
int tachometer;          // Tachometer counts
int tachometer_abs;      // Absolute tachometer
mc_fault_code fault_code;// Current fault
float position;          // Position (degrees)
uint8_t vesc_id;         // CAN ID
float temp_mos_1,2,3;    // Individual MOSFET temps
float vd, vq;            // FOC d/q voltages
bool has_timeout;        // Timeout status
bool kill_sw_active;     // Kill switch status
```

### BMS_VALUES (COMM_BMS_GET_VALUES Response)

```c
float v_tot;             // Total voltage
float i_in;              // Current
float soc;               // State of charge
float soh;               // State of health
int cell_num;            // Number of cells
float v_cells[18];       // Cell voltages
bool is_balancing[18];   // Balance status
float temps[6];          // Temperatures
float temp_ic;           // IC temperature
float humidity;          // Humidity %
float pressure;          // Pressure
```

## Error Handling

### Fault Codes

| Code | Name | Description |
|------|------|-------------|
| 0 | `FAULT_CODE_NONE` | No fault |
| 1 | `FAULT_CODE_OVER_VOLTAGE` | Input voltage too high |
| 2 | `FAULT_CODE_UNDER_VOLTAGE` | Input voltage too low |
| 3 | `FAULT_CODE_DRV` | Gate driver fault |
| 4 | `FAULT_CODE_ABS_OVER_CURRENT` | Absolute overcurrent |
| 5 | `FAULT_CODE_OVER_TEMP_FET` | MOSFET overtemp |
| 6 | `FAULT_CODE_OVER_TEMP_MOTOR` | Motor overtemp |

### Protocol Error Responses

Some commands return status bytes:
- `0x00` = Success
- `0x01` = Command not recognized
- `0x02` = Invalid parameters
- `0x03` = Device busy
