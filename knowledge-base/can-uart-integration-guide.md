# CAN Bus & UART Integration Guide

## Overview

**Key Terms:** CAN bus, UART, serial communication, Arduino VESC, Raspberry Pi VESC, external control, VESC protocol, CAN command, UART command, COMM_SET_CURRENT, COMM_SET_DUTY

This guide covers integrating VESC with external controllers (Arduino, Raspberry Pi, etc.) via CAN bus and UART protocols.

**Source:** bldc/comm/comm_can.c, bldc/comm/commands.c, bldc/datatypes.h

---

## Protocol Comparison

| Feature | UART | CAN Bus |
|---------|------|---------|
| Wiring | 3 wires (TX, RX, GND) | 2 wires (CAN_H, CAN_L) |
| Speed | Up to 230400 baud | Up to 1 Mbps |
| Distance | Short (<2m) | Long (>10m) |
| Multi-device | No (point-to-point) | Yes (up to 127 nodes) |
| Noise immunity | Lower | Higher |
| Complexity | Simple | More complex |
| Best for | Single VESC | Multiple VESCs |

---

## UART Communication

### Physical Connection

```
Arduino/RPi          VESC
    TX  ────────────  RX
    RX  ────────────  TX
   GND  ────────────  GND
```

**Important:** VESC UART is 3.3V! Use level shifter for 5V Arduinos.

### UART Settings

| Parameter | Value |
|-----------|-------|
| Baud Rate | 115200 (default) |
| Data Bits | 8 |
| Stop Bits | 1 |
| Parity | None |
| Flow Control | None |

### UART Packet Format

```
[START] [LENGTH] [PAYLOAD] [CRC16] [END]
```

| Field | Size | Description |
|-------|------|-------------|
| START | 1 byte | 0x02 (short), 0x03 (long), 0x04 (very long) |
| LENGTH | 1-3 bytes | Payload length |
| PAYLOAD | Variable | Command ID + data |
| CRC16 | 2 bytes | CRC16 checksum |
| END | 1 byte | 0x03 |

**Frame types:**
- `0x02`: 8-bit length (0-255 bytes)
- `0x03`: 16-bit length (256-65535 bytes)
- `0x04`: 24-bit length (>65535 bytes)

---

## CAN Bus Communication

### Physical Connection

```
Arduino/RPi + CAN Transceiver         VESC
         CAN_H  ──────────────────  CAN_H
         CAN_L  ──────────────────  CAN_L
          GND   ──────────────────   GND
```

**Requires:** MCP2515 (Arduino) or similar CAN transceiver

### CAN Settings

| Parameter | Value |
|-----------|-------|
| Baud Rate | 500 kbps (common) |
| ID Format | Extended (29-bit) |
| Frame Type | Standard data frames |

**Available baud rates:**
- 10 kbps, 20 kbps, 50 kbps, 75 kbps
- 100 kbps, 125 kbps, 250 kbps
- 500 kbps (recommended)
- 1 Mbps

### CAN ID Format

```
CAN Extended ID = (CAN_PACKET_ID << 8) | Controller_ID

Example:
  Controller ID: 0x05
  CAN_PACKET_SET_CURRENT (1):
  Final CAN ID = 0x0105
```

---

## Command Reference

### Common UART Commands (COMM_PACKET_ID)

| Command | ID | Description |
|---------|----|--------------|
| COMM_FW_VERSION | 0 | Get firmware version |
| COMM_GET_VALUES | 4 | Get motor state |
| COMM_SET_DUTY | 5 | Set duty cycle |
| COMM_SET_CURRENT | 6 | Set motor current |
| COMM_SET_CURRENT_BRAKE | 7 | Set brake current |
| COMM_SET_RPM | 8 | Set target RPM |
| COMM_SET_POS | 9 | Set position |
| COMM_SET_HANDBRAKE | 10 | Set handbrake |
| COMM_ALIVE | 30 | Keep-alive signal |
| COMM_GET_VALUES_SELECTIVE | 50 | Get specific values |
| COMM_SET_CURRENT_REL | 84 | Set relative current |

### CAN Packet Types (CAN_PACKET_ID)

| Packet | ID | Data Format |
|--------|----|--------------|
| CAN_PACKET_SET_DUTY | 0 | int32 (×100000) |
| CAN_PACKET_SET_CURRENT | 1 | int32 (×1000) |
| CAN_PACKET_SET_CURRENT_BRAKE | 2 | int32 (×1000) |
| CAN_PACKET_SET_RPM | 3 | int32 |
| CAN_PACKET_SET_POS | 4 | int32 (×1000000) |
| CAN_PACKET_STATUS | 9 | 8 bytes status |
| CAN_PACKET_SET_CURRENT_REL | 10 | int32 (×100000) |
| CAN_PACKET_SET_CURRENT_BRAKE_REL | 11 | int32 (×100000) |
| CAN_PACKET_SET_CURRENT_HANDBRAKE | 12 | int32 (×1000) |
| CAN_PACKET_PING | 17 | 0 bytes |
| CAN_PACKET_PONG | 18 | Response |

---

## Value Scaling

### Encoding Values (Sending)

| Value Type | Scale Factor | Example |
|------------|--------------|---------|
| Duty (-1.0 to 1.0) | × 100000 | 0.5 → 50000 |
| Current (Amps) | × 1000 | 15.0A → 15000 |
| RPM | × 1 | 5000 ERPM → 5000 |
| Position (degrees) | × 1000000 | 180° → 180000000 |
| Relative (-1.0 to 1.0) | × 100000 | 0.8 → 80000 |

### Decoding Values (Receiving)

| Value Type | Scale Factor | Example |
|------------|--------------|---------|
| Temperature | ÷ 10 | 450 → 45.0°C |
| Voltage | ÷ 10 | 420 → 42.0V |
| Current | ÷ 100 | 1500 → 15.0A |
| Duty | ÷ 1000 | 500 → 0.5 |

---

## Arduino Code Examples

### UART: Set Motor Current

```cpp
#include <SoftwareSerial.h>

SoftwareSerial vescSerial(10, 11); // RX, TX

void setup() {
  vescSerial.begin(115200);
}

void setMotorCurrent(float current) {
  uint8_t payload[5];
  int32_t current_scaled = (int32_t)(current * 1000.0);

  payload[0] = 6; // COMM_SET_CURRENT
  payload[1] = (current_scaled >> 24) & 0xFF;
  payload[2] = (current_scaled >> 16) & 0xFF;
  payload[3] = (current_scaled >> 8) & 0xFF;
  payload[4] = current_scaled & 0xFF;

  sendPacket(payload, 5);
}

void sendPacket(uint8_t *payload, uint8_t len) {
  uint16_t crc = crc16(payload, len);

  vescSerial.write(0x02);      // Start byte
  vescSerial.write(len);       // Length
  for (int i = 0; i < len; i++) {
    vescSerial.write(payload[i]);
  }
  vescSerial.write(crc >> 8);  // CRC high
  vescSerial.write(crc & 0xFF);// CRC low
  vescSerial.write(0x03);      // End byte
}

uint16_t crc16(uint8_t *data, uint8_t len) {
  uint16_t crc = 0;
  for (int i = 0; i < len; i++) {
    crc = crc16_ccitt(crc, data[i]);
  }
  return crc;
}

// CRC16-CCITT implementation
uint16_t crc16_ccitt(uint16_t crc, uint8_t data) {
  crc ^= (uint16_t)data << 8;
  for (int i = 0; i < 8; i++) {
    if (crc & 0x8000) {
      crc = (crc << 1) ^ 0x1021;
    } else {
      crc <<= 1;
    }
  }
  return crc;
}

void loop() {
  setMotorCurrent(5.0); // Set 5A
  delay(100);
}
```

### CAN: Set Motor Current

```cpp
#include <SPI.h>
#include <mcp_can.h>

#define CAN_CS_PIN 10
MCP_CAN CAN(CAN_CS_PIN);

#define VESC_ID 0x00  // Target VESC controller ID
#define CAN_PACKET_SET_CURRENT 1

void setup() {
  Serial.begin(115200);

  if (CAN.begin(MCP_ANY, CAN_500KBPS, MCP_8MHZ) == CAN_OK) {
    Serial.println("CAN Init OK");
  }
  CAN.setMode(MCP_NORMAL);
}

void setMotorCurrent(uint8_t vescId, float current) {
  int32_t current_scaled = (int32_t)(current * 1000.0);
  uint8_t data[4];

  data[0] = (current_scaled >> 24) & 0xFF;
  data[1] = (current_scaled >> 16) & 0xFF;
  data[2] = (current_scaled >> 8) & 0xFF;
  data[3] = current_scaled & 0xFF;

  uint32_t canId = vescId | ((uint32_t)CAN_PACKET_SET_CURRENT << 8);
  CAN.sendMsgBuf(canId, 1, 4, data); // Extended ID
}

void setMotorDuty(uint8_t vescId, float duty) {
  int32_t duty_scaled = (int32_t)(duty * 100000.0);
  uint8_t data[4];

  data[0] = (duty_scaled >> 24) & 0xFF;
  data[1] = (duty_scaled >> 16) & 0xFF;
  data[2] = (duty_scaled >> 8) & 0xFF;
  data[3] = duty_scaled & 0xFF;

  uint32_t canId = vescId | ((uint32_t)0 << 8); // CAN_PACKET_SET_DUTY = 0
  CAN.sendMsgBuf(canId, 1, 4, data);
}

void loop() {
  setMotorCurrent(VESC_ID, 10.0); // 10A
  delay(100);
}
```

---

## Raspberry Pi Code Examples

### Python UART

```python
import serial
import struct

class VESCSerial:
    def __init__(self, port='/dev/ttyUSB0', baudrate=115200):
        self.ser = serial.Serial(port, baudrate, timeout=0.1)

    def crc16(self, data):
        crc = 0
        for byte in data:
            crc ^= byte << 8
            for _ in range(8):
                if crc & 0x8000:
                    crc = (crc << 1) ^ 0x1021
                else:
                    crc <<= 1
                crc &= 0xFFFF
        return crc

    def send_packet(self, payload):
        length = len(payload)
        crc = self.crc16(payload)

        packet = bytes([0x02, length]) + payload + struct.pack('>H', crc) + bytes([0x03])
        self.ser.write(packet)

    def set_current(self, current):
        """Set motor current in Amps"""
        current_scaled = int(current * 1000)
        payload = bytes([6]) + struct.pack('>i', current_scaled)  # COMM_SET_CURRENT = 6
        self.send_packet(payload)

    def set_duty(self, duty):
        """Set duty cycle (-1.0 to 1.0)"""
        duty_scaled = int(duty * 100000)
        payload = bytes([5]) + struct.pack('>i', duty_scaled)  # COMM_SET_DUTY = 5
        self.send_packet(payload)

    def set_rpm(self, rpm):
        """Set target RPM (ERPM)"""
        payload = bytes([8]) + struct.pack('>i', int(rpm))  # COMM_SET_RPM = 8
        self.send_packet(payload)

    def send_alive(self):
        """Send keep-alive signal"""
        self.send_packet(bytes([30]))  # COMM_ALIVE = 30

# Usage
vesc = VESCSerial('/dev/ttyUSB0')
vesc.set_current(5.0)  # 5 Amps
```

### Python CAN (using python-can)

```python
import can
import struct

class VESCCAN:
    CAN_PACKET_SET_DUTY = 0
    CAN_PACKET_SET_CURRENT = 1
    CAN_PACKET_SET_CURRENT_BRAKE = 2
    CAN_PACKET_SET_RPM = 3
    CAN_PACKET_SET_POS = 4

    def __init__(self, channel='can0', bustype='socketcan', vesc_id=0):
        self.bus = can.interface.Bus(channel=channel, bustype=bustype)
        self.vesc_id = vesc_id

    def _make_can_id(self, packet_type):
        return self.vesc_id | (packet_type << 8)

    def set_current(self, current):
        """Set motor current in Amps"""
        current_scaled = int(current * 1000)
        data = struct.pack('>i', current_scaled)
        msg = can.Message(
            arbitration_id=self._make_can_id(self.CAN_PACKET_SET_CURRENT),
            data=data,
            is_extended_id=True
        )
        self.bus.send(msg)

    def set_duty(self, duty):
        """Set duty cycle (-1.0 to 1.0)"""
        duty_scaled = int(duty * 100000)
        data = struct.pack('>i', duty_scaled)
        msg = can.Message(
            arbitration_id=self._make_can_id(self.CAN_PACKET_SET_DUTY),
            data=data,
            is_extended_id=True
        )
        self.bus.send(msg)

    def set_rpm(self, rpm):
        """Set target RPM (ERPM)"""
        data = struct.pack('>i', int(rpm))
        msg = can.Message(
            arbitration_id=self._make_can_id(self.CAN_PACKET_SET_RPM),
            data=data,
            is_extended_id=True
        )
        self.bus.send(msg)

# Setup CAN interface first:
# sudo ip link set can0 type can bitrate 500000
# sudo ip link set can0 up

# Usage
vesc = VESCCAN(vesc_id=0)
vesc.set_current(10.0)  # 10 Amps
```

---

## Reading Motor Values

### GET_VALUES Response Format

Using `COMM_GET_VALUES` (ID 4), the response contains:

| Offset | Type | Scale | Description |
|--------|------|-------|-------------|
| 0-1 | uint16 | ÷10 | FET Temperature |
| 2-3 | uint16 | ÷10 | Motor Temperature |
| 4-7 | float32 | ÷100 | Average Motor Current |
| 8-11 | float32 | ÷100 | Average Input Current |
| 12-15 | float32 | | Average Id |
| 16-19 | float32 | | Average Iq |
| 20-21 | uint16 | ÷1000 | Duty Cycle |
| 22-25 | int32 | | RPM (ERPM) |
| 26-27 | uint16 | ÷10 | Input Voltage |
| 28-31 | float32 | ÷10000 | Amp Hours |
| 32-35 | float32 | ÷10000 | Amp Hours Charged |
| 36-39 | float32 | ÷10000 | Watt Hours |
| 40-43 | float32 | ÷10000 | Watt Hours Charged |
| 44-47 | int32 | | Tachometer |
| 48-51 | int32 | | Tachometer Abs |
| 52 | uint8 | | Fault Code |

### Python: Parse GET_VALUES

```python
def parse_values(data):
    values = {}
    values['temp_fet'] = struct.unpack('>H', data[0:2])[0] / 10.0
    values['temp_motor'] = struct.unpack('>H', data[2:4])[0] / 10.0
    values['current_motor'] = struct.unpack('>f', data[4:8])[0] / 100.0
    values['current_input'] = struct.unpack('>f', data[8:12])[0] / 100.0
    values['duty'] = struct.unpack('>H', data[20:22])[0] / 1000.0
    values['rpm'] = struct.unpack('>i', data[22:26])[0]
    values['voltage'] = struct.unpack('>H', data[26:28])[0] / 10.0
    values['fault'] = data[52]
    return values
```

---

## Keep-Alive / Timeout

**Important:** VESC has a safety timeout. If no command is received within timeout period, motor stops.

**Default timeout:** 1000ms (1 second)

**Solution:** Send `COMM_ALIVE` (ID 30) or any command periodically.

```python
import time
import threading

class VESCKeepAlive:
    def __init__(self, vesc, interval=0.5):
        self.vesc = vesc
        self.interval = interval
        self.running = True
        self.thread = threading.Thread(target=self._keepalive_loop)
        self.thread.start()

    def _keepalive_loop(self):
        while self.running:
            self.vesc.send_alive()
            time.sleep(self.interval)

    def stop(self):
        self.running = False
        self.thread.join()
```

---

## Troubleshooting

### UART Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| No response | Wrong TX/RX | Swap TX and RX wires |
| Garbled data | Baud rate mismatch | Check both sides use 115200 |
| Partial data | Voltage level | Use 3.3V logic or level shifter |
| CRC errors | Bad connection | Check wiring, add ground |

### CAN Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| No communication | No termination | Add 120Ω resistor |
| Intermittent | Wrong baud rate | Match baud rates |
| Packet errors | Long wires | Use twisted pair |
| No ACK | Wrong ID | Check Extended ID flag |

---

## Libraries

### Arduino

- **VescUart**: https://github.com/SolidGeek/VescUart
- **MCP_CAN**: https://github.com/coryjfowler/MCP_CAN_lib

### Python

- **PyVESC**: https://github.com/LiamBindle/PyVESC
- **python-can**: https://python-can.readthedocs.io/

### ESP32

- Built-in CAN (TWAI) driver
- ESP32 UART hardware serial

---

## References

- Source: `bldc/comm/comm_can.c` - CAN implementation
- Source: `bldc/comm/commands.c` - Command processing
- Source: `bldc/comm/packet.c` - UART packet handling
- Source: `bldc/datatypes.h:941-1130` - COMM_PACKET_ID enum
- Related: `vesc-remote-input-configuration.md` - Input setup

---

*Last updated: 2026-01-14 | Source verified against bldc repository*
