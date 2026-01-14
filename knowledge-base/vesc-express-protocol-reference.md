# VESC Express Protocol Reference

## Overview

**Key Terms:** VESC Express, ESP32, BLE protocol, WiFi protocol, GATT service, Nordic UART Service, NUS, BLE UUID, MTU, packet format, comm protocol, wireless communication

This technical reference documents the VESC Express communication protocols for developers and advanced users.

**Source:** `vesc_express/main/comm_ble.c`, `vesc_express/main/comm_wifi.c`

---

## BLE Protocol

### Service UUID

**Source:** `vesc_express/main/comm_ble.c:111-114`

```c
static uint8_t ble_service_uuid128[ESP_UUID_LEN_128] = {
    0x9E, 0xCA, 0xDC, 0x24, 0x0E, 0xE5, 0xA9, 0xE0,
    0x93, 0xF3, 0xA3, 0xB5, 0x01, 0x00, 0x40, 0x6E,
};
```

**UUID (standard format):** `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`

This is the **Nordic UART Service (NUS)** - a standard BLE serial profile.

### Characteristics

| Characteristic | UUID | Properties |
|----------------|------|------------|
| TX (VESC → Phone) | 6E400002-... | Notify |
| RX (Phone → VESC) | 6E400003-... | Write |

### MTU (Maximum Transmission Unit)

**Source:** `vesc_express/main/comm_ble.c:46`

```c
#define DEFAULT_BLE_MTU 20 // 23 for default mtu and 3 bytes for ATT headers
```

| Setting | Value | Effect |
|---------|-------|--------|
| Default MTU | 20 bytes | Slow, many packets |
| Negotiated MTU | Up to 255 | Faster, fewer packets |
| Max Char Length | 255 bytes | `GATTS_CHAR_VAL_LEN_MAX` |

**Tip:** Modern phones negotiate higher MTU automatically. Older devices may be stuck at 20 bytes.

### Connection Parameters

**Source:** `vesc_express/main/comm_ble.c:122-123`

```c
.min_interval = 0x06,  // 7.5ms (0x06 * 1.25ms)
.max_interval = 0x30,  // 60ms (0x30 * 1.25ms)
```

**Connection Interval Range:** 7.5ms - 60ms

---

## WiFi Protocol

### AP Mode (Access Point)

**Default Settings:**
- SSID: `VESC_[MAC_SUFFIX]`
- Password: Configurable in Express settings
- IP: `192.168.4.1`
- Port: `65102` (TCP)

### Station Mode (Connect to Router)

**Settings in VESC Tool:**
- WiFi Mode: STA
- SSID: Your network name
- Password: Your network password
- IP: Assigned by DHCP or static

### TCP Communication

**Source:** `vesc_express/main/comm_wifi.c`

| Parameter | Value |
|-----------|-------|
| Default Port | 65102 |
| Protocol | TCP |
| Max Connections | 1 (typical) |

---

## Packet Format

### VESC Packet Structure

All communication uses the standard VESC packet format:

```
┌─────┬─────────┬──────────┬─────────┬─────┐
│ 0x02│ Length  │ Payload  │ CRC16   │ 0x03│
└─────┴─────────┴──────────┴─────────┴─────┘

Short packet (length < 256):
┌──────┬────────┬──────────┬──────────┬──────┐
│ 0x02 │ 1 byte │ Payload  │ 2 bytes  │ 0x03 │
│      │ length │          │ CRC16    │      │
└──────┴────────┴──────────┴──────────┴──────┘

Long packet (length ≥ 256):
┌──────┬────────┬──────────┬──────────┬──────┐
│ 0x03 │ 2 byte │ Payload  │ 2 bytes  │ 0x03 │
│      │ length │          │ CRC16    │      │
└──────┴────────┴──────────┴──────────┴──────┘
```

### CRC16 Calculation

**Algorithm:** CRC-16-CCITT (polynomial 0x1021)

```python
# Python example
def crc16(data):
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
```

---

## Command IDs

### Common Commands

| ID | Name | Description |
|----|------|-------------|
| 0x00 | FW_VERSION | Get firmware version |
| 0x04 | GET_VALUES | Get real-time telemetry |
| 0x05 | SET_DUTY | Set duty cycle |
| 0x06 | SET_CURRENT | Set motor current |
| 0x07 | SET_CURRENT_BRAKE | Set brake current |
| 0x08 | SET_RPM | Set motor RPM |
| 0x0E | GET_MCCONF | Get motor configuration |
| 0x0F | SET_MCCONF | Set motor configuration |
| 0x10 | GET_APPCONF | Get app configuration |
| 0x11 | SET_APPCONF | Set app configuration |
| 0x24 | REBOOT | Reboot VESC |
| 0x30 | DETECT_MOTOR | Run motor detection |

### Express-Specific Commands

| ID | Name | Description |
|----|------|-------------|
| 0x63 | PING | Ping/keepalive |
| 0x64 | GET_EXPRESS_STATE | Get Express module state |

---

## BLE Troubleshooting

### Connection Issues

**"Can't find VESC in BLE scan"**

1. **Check 5V Power**
   - Express needs stable 5V from VESC
   - Measure with multimeter: 4.8-5.2V
   - Weak 5V = Express won't start properly

2. **Check Antenna**
   - Antenna must be connected
   - Keep antenna outside metal enclosure
   - U.FL connector must be secure

3. **Verify BLE Enabled**
   - VESC Tool → App Settings → VESC Express
   - BLE: Enabled
   - BLE Name: Set a name

### MTU Issues

**"BLE very slow or packets drop"**

1. **Phone stuck at low MTU**
   - Some older phones can't negotiate higher MTU
   - Results in many small packets
   - Try different phone/app

2. **Large packets fragmented**
   - Packets > MTU are split
   - Can cause delays
   - Normal behavior, but slow

### Disconnection Issues

**"BLE disconnects randomly"**

1. **Interference**
   - Move away from WiFi routers
   - 2.4GHz congestion common
   - Motor noise can interfere

2. **Power fluctuations**
   - Large current draw = voltage sag
   - Express may brown out briefly
   - Add capacitor on 5V rail

---

## WiFi Troubleshooting

### AP Mode Issues

**"Can't connect to VESC WiFi network"**

1. **Wrong password**
   - Default: Check Express settings
   - Can be changed in VESC Tool

2. **Phone auto-reconnecting to home WiFi**
   - Disable auto-connect on home network
   - Or use "forget" on home network temporarily

3. **Express not powered properly**
   - Same 5V issue as BLE
   - Check voltage with multimeter

### Station Mode Issues

**"Express won't connect to my router"**

1. **Wrong credentials**
   - Re-enter SSID exactly (case sensitive)
   - Re-enter password

2. **2.4GHz vs 5GHz**
   - ESP32 only supports 2.4GHz
   - Make sure your SSID is 2.4GHz band

3. **Router compatibility**
   - Some enterprise/mesh routers have issues
   - Try with simple router first

---

## Developer Notes

### Building Custom Apps

**BLE Connection Flow:**
1. Scan for devices with NUS service UUID
2. Connect to device
3. Discover services and characteristics
4. Enable notifications on TX characteristic
5. Write commands to RX characteristic
6. Receive responses via notifications

### Example: Get Firmware Version

```python
# Pseudocode
packet = build_packet(command=0x00, payload=[])
ble.write(rx_characteristic, packet)
response = await ble.notification(tx_characteristic)
version = parse_fw_version(response)
```

### Rate Limiting

- Don't flood the Express with commands
- Allow ~50ms between requests
- RT Data polling: 10-20Hz recommended

---

## Quick Reference

### BLE UUIDs

| Service/Char | UUID |
|--------------|------|
| NUS Service | 6E400001-B5A3-F393-E0A9-E50E24DCCA9E |
| TX Char | 6E400002-B5A3-F393-E0A9-E50E24DCCA9E |
| RX Char | 6E400003-B5A3-F393-E0A9-E50E24DCCA9E |

### WiFi Defaults

| Setting | Value |
|---------|-------|
| AP IP | 192.168.4.1 |
| TCP Port | 65102 |
| AP Channel | Auto |

### Hardware Requirements

| Item | Requirement |
|------|-------------|
| Power | Stable 5V, 100mA+ |
| Antenna | Connected, external |
| Firmware | Latest vesc_express |

---

## References

- Source: `vesc_express/main/comm_ble.c` - BLE implementation
- Source: `vesc_express/main/comm_wifi.c` - WiFi implementation
- Related: `vesc-express-wifi-ble-setup.md` - Setup guide
- Related: `mobile-app-troubleshooting.md` - App connection issues

---

*Last updated: 2026-01-14 | Deep-dive from vesc_express source*
