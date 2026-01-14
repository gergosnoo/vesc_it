# VESC External Integration Guide

## Overview

**Key Terms:** UART, CAN bus, ADC, GPIO, LispBM, telemetry, serial communication, external sensors, throttle input, display, GPS, BMS integration, Arduino, ESP32, Raspberry Pi

This guide covers connecting external devices to VESC controllers via UART, CAN bus, ADC inputs, and LispBM scripting.

**Source:** `bldc/comm/commands.c`, `bldc/comm/comm_can.c`, `bldc/applications/app_uartcomm.c`

---

## Communication Protocols

### UART (Serial)

**Best for:** Single device, simple integration, Arduino/ESP32 projects

| Parameter | Value |
|-----------|-------|
| Default Baud | 115200 |
| Logic Level | 3.3V (use level shifter for 5V!) |
| Timeout | ~1 second (motor stops without keep-alive) |

**Packet Format:**

```
[START] [LENGTH] [PAYLOAD] [CRC16] [END]
  1B     1-3B     N bytes    2B     1B
```

| Start Byte | Length Size |
|------------|-------------|
| 0x02 | 8-bit length |
| 0x03 | 16-bit length |
| 0x04 | 24-bit length |

**Important:** Send `COMM_ALIVE` (command ID 30) periodically to prevent motor timeout!

### CAN Bus

**Best for:** Multiple devices, longer distances, robust communication

| Parameter | Recommended |
|-----------|-------------|
| Baud Rate | 500 kbps |
| ID Format | Extended 29-bit |
| Max Distance | >10 meters |
| Termination | 120Ω at each end |

**ID Format:**
```
CAN_ID = (PACKET_ID << 8) | CONTROLLER_ID
```

**Available Baud Rates:** 10k, 20k, 50k, 75k, 100k, 125k, 250k, 500k, 1M

---

## Core Commands

### Motor Control Commands

| Command | ID | Scale | Description |
|---------|-----|-------|-------------|
| `COMM_SET_DUTY` | 5 | ×100000 | Set duty cycle (-1 to 1) |
| `COMM_SET_CURRENT` | 6 | ×1000 | Set motor current (Amps) |
| `COMM_SET_CURRENT_BRAKE` | 7 | ×1000 | Set brake current |
| `COMM_SET_RPM` | 8 | ×1 | Set target RPM |
| `COMM_SET_POS` | 9 | ×1000000 | Set position (degrees) |
| `COMM_SET_HANDBRAKE` | 10 | ×1000 | Handbrake current |
| `COMM_SET_CURRENT_REL` | 84 | ×100000 | Relative current (-1 to 1) |
| `COMM_ALIVE` | 30 | - | Keep-alive signal |

### Telemetry Commands

| Command | ID | Description |
|---------|-----|-------------|
| `COMM_FW_VERSION` | 0 | Get firmware version |
| `COMM_GET_VALUES` | 4 | Get all motor telemetry |
| `COMM_GET_VALUES_SELECTIVE` | 50 | Get specific values only |
| `COMM_GET_IMU_DATA` | 65 | Get IMU/accelerometer data |

### Value Scaling Reference

| Value Type | Scale Factor | Example |
|-----------|--------------|---------|
| Duty cycle | ×100000 | 0.5 → 50000 |
| Current | ×1000 | 15A → 15000 |
| RPM/ERPM | ×1 | 5000 → 5000 |
| Position | ×1000000 | 180° → 180000000 |
| Temperature (RX) | ÷10 | 450 → 45.0°C |
| Voltage (RX) | ÷10 | 420 → 42.0V |

---

## CAN Status Messages

VESC can broadcast status at configurable rates (default 50Hz):

### STATUS Message Types

| Type | CAN ID | Contents |
|------|--------|----------|
| STATUS | 9 | RPM, Current, Duty |
| STATUS_2 | 14 | Ah used, Ah charged |
| STATUS_3 | 15 | Wh used, Wh charged |
| STATUS_4 | 16 | Temps, input current, PID pos |
| STATUS_5 | 27 | Tachometer, voltage |
| STATUS_6 | 58 | ADC1-3, PPM values |

### Enabling Status Messages

In VESC Tool: **App Settings → General → CAN Status Message Mode**

Options:
- Disabled
- CAN Status (periodic broadcast)
- CAN Status + Extra (more data)

---

## ADC Inputs

### Configuration

**Location:** App Settings → ADC

| Setting | Options |
|---------|---------|
| Control Type | Current, Duty, RPM, Position |
| Use Filter | Enable for noisy signals |
| Safe Start | Require neutral before motor |
| Voltage Range | 0-3.3V |

### ADC Control Modes

| Mode | Description |
|------|-------------|
| Current | ADC controls motor current |
| Current (Reverse) | Full reverse/forward control |
| Current (No Reverse) | Forward + brake only |
| Duty | ADC controls duty cycle |
| RPM | ADC controls target RPM |
| Position | ADC controls angle position |

### Wiring Example (Throttle)

```
Throttle     VESC
─────────────────
VCC    →    3.3V (NOT 5V!)
GND    →    GND
Signal →    ADC1
```

**Important:** Most throttles output 5V signal - use voltage divider!

```
5V Signal ──[10kΩ]──┬──[20kΩ]── GND
                    │
                    └── ADC Input (3.3V max)
```

---

## Arduino Example

### Basic UART Control

```cpp
#include <VescUart.h>

VescUart VESC;

void setup() {
    Serial1.begin(115200);
    VESC.setSerialPort(&Serial1);
}

void loop() {
    // Set motor to 50% duty
    VESC.setDuty(0.5);

    // Read telemetry
    if (VESC.getVescValues()) {
        float rpm = VESC.data.rpm;
        float voltage = VESC.data.inpVoltage;
        float current = VESC.data.avgMotorCurrent;
    }

    delay(50);  // 20Hz update rate
}
```

### Required Library

Install "VescUart" via Arduino Library Manager or:
- GitHub: https://github.com/SolidGeek/VescUart

### Wiring (Arduino → VESC)

```
Arduino     VESC
───────────────────
TX      →   RX
RX      →   TX (through level shifter!)
GND     →   GND
```

**Warning:** Arduino is 5V logic, VESC is 3.3V. Use level shifter on RX line!

---

## ESP32 Example

### Basic CAN Control

```cpp
#include <CAN.h>

void setup() {
    CAN.begin(500E3);  // 500 kbps
}

void setDuty(uint8_t vescId, float duty) {
    int32_t dutyScaled = duty * 100000;

    uint32_t canId = (0 << 8) | vescId;  // PACKET_SET_DUTY = 0

    uint8_t data[4];
    data[0] = (dutyScaled >> 24) & 0xFF;
    data[1] = (dutyScaled >> 16) & 0xFF;
    data[2] = (dutyScaled >> 8) & 0xFF;
    data[3] = dutyScaled & 0xFF;

    CAN.beginExtendedPacket(canId);
    CAN.write(data, 4);
    CAN.endPacket();
}

void loop() {
    setDuty(1, 0.25);  // VESC ID 1, 25% duty
    delay(100);
}
```

### ESP32 CAN Wiring

```
ESP32       CAN Transceiver     VESC
─────────────────────────────────────
GPIO5  →    TX
GPIO4  →    RX
            CANH         →      CANH
            CANL         →      CANL
            GND          →      GND
```

**Required:** CAN transceiver module (MCP2551, TJA1050, SN65HVD230)

---

## Python Example

### PyVESC Library

```python
import pyvesc
from pyvesc import GetValues, SetDuty

# Open serial connection
with serial.Serial('/dev/ttyUSB0', 115200) as ser:
    # Set 30% duty
    ser.write(pyvesc.encode(SetDuty(0.3)))

    # Request telemetry
    ser.write(pyvesc.encode_request(GetValues))

    # Read response
    response = ser.read(100)
    values = pyvesc.decode(response)

    if values:
        print(f"RPM: {values.rpm}")
        print(f"Voltage: {values.v_in}")
        print(f"Current: {values.avg_motor_current}")
```

### Installation

```bash
pip install pyvesc
```

---

## LispBM Integration

### Motor Control

```lisp
; Basic control
(set-duty 0.5)           ; 50% duty
(set-current 10)         ; 10A motor current
(set-rpm 3000)           ; 3000 ERPM

; Read values
(get-rpm)                ; Current RPM
(get-vin)                ; Battery voltage
(get-current)            ; Motor current
(get-duty)               ; Current duty cycle
(get-temp-fet)           ; FET temperature
```

### ADC Reading

```lisp
; Read raw ADC (0.0 to 3.3)
(get-adc 0)              ; ADC channel 0
(get-adc 1)              ; ADC channel 1

; Read decoded (0.0 to 1.0, with config applied)
(get-adc-decoded 0)
```

### CAN Bus Control

```lisp
; Control remote VESC (ID 2)
(canset-duty 2 0.5)      ; Set duty on VESC ID 2
(canset-current 2 15)    ; Set current on VESC ID 2

; Read from remote VESC
(canget-rpm 2)           ; Get RPM from VESC ID 2
(canget-current 2)       ; Get current from VESC ID 2

; List all CAN devices
(can-list-devs)          ; Returns list of responding IDs
```

### Custom CAN Messages

```lisp
; Send raw CAN message
(can-send-sid 0x123 '(1 2 3 4))      ; Standard 11-bit ID
(can-send-eid 0x12345678 '(1 2 3))   ; Extended 29-bit ID

; Receive CAN messages
(def can-data (can-recv-sid 0x123 1000))  ; 1000ms timeout
```

---

## Common External Devices

### GPS/GNSS

**CAN Packet:** `COMM_GET_GNSS` (ID 150)

**Response Contains:**
- Latitude, Longitude
- Altitude, Speed
- Fix quality, Satellites

### BMS Integration

**Via CAN Bus:**
- ENNOID XLITE: Native VESC CAN support
- DieBieMS: CAN packet protocol
- FM BMS: OWIE chip for monitoring

**Via UART:**
- JBD BMS: Serial protocol
- ANT BMS: Modbus protocol

### Display Modules

**I2C OLED:**
```lisp
; LispBM I2C example (with custom library)
(i2c-start)
(i2c-write 0x3C data)  ; OLED address 0x3C
(i2c-stop)
```

**UART Display:**
- Nextion: Serial protocol
- Custom: Parse VESC values, send formatted text

---

## Troubleshooting

### UART Not Responding

1. **Check baud rate** - Both devices must match (115200 default)
2. **Check wiring** - TX→RX, RX→TX (crossed!)
3. **Check voltage** - 3.3V logic, level shift if needed
4. **Enable UART app** - App Settings → UART

### CAN Not Working

1. **Termination** - 120Ω resistor at each end
2. **Wiring** - CANH to CANH, CANL to CANL
3. **Baud rate** - All devices same rate
4. **Controller ID** - Each VESC needs unique ID

### Motor Stops Unexpectedly

**Cause:** Timeout (no commands received for ~1 second)

**Solution:** Send keep-alive periodically:
```cpp
// Arduino - send every 500ms
VESC.sendAlive();
```

```lisp
; LispBM - not needed, built-in control
```

### ADC Values Jumping

1. **Add filter** - Enable in ADC settings
2. **Check ground** - Common ground between devices
3. **Shielded cable** - For long runs
4. **Capacitor** - 100nF across ADC input

---

## Quick Reference

### Protocol Selection

| Use Case | Protocol |
|----------|----------|
| Single device, simple | UART |
| Multiple VESCs | CAN |
| Remote control | CAN |
| Arduino/ESP32 | UART or CAN |
| Raspberry Pi | UART |
| Custom sensors | ADC + LispBM |

### Essential Commands

| Task | Command ID |
|------|------------|
| Set duty | 5 |
| Set current | 6 |
| Set brake | 7 |
| Set RPM | 8 |
| Keep alive | 30 |
| Get telemetry | 4 |

### Voltage Levels

| Device | Logic Level |
|--------|-------------|
| VESC | 3.3V |
| Arduino Uno | 5V (needs shifter!) |
| Arduino Due | 3.3V |
| ESP32 | 3.3V |
| Raspberry Pi | 3.3V |

---

## References

- Source: `bldc/comm/commands.c` - Command processing
- Source: `bldc/comm/comm_can.c` - CAN implementation
- Source: `bldc/applications/app_uartcomm.c` - UART app
- Source: `bldc/documentation/comm_can.md` - CAN protocol spec
- Related: `can-uart-integration-guide.md` - Protocol details
- Related: `lispbm-scripting-guide.md` - LispBM reference

---

*Last updated: 2026-01-14 | Source verified against bldc firmware*
