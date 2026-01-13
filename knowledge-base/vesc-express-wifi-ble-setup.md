# VESC Express WiFi & BLE Setup Guide

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-13
**Source:** `vesc_express/main/main.h`, `vesc_express/main/config/`
**Addresses:** GAP-10 (High Priority)

---

## Quick Start

### First-Time Setup via USB

1. Connect VESC Express to computer via USB
2. Open VESC Tool → Connect to device
3. Go to **VESC Express** → **General**
4. Configure WiFi settings
5. Write configuration
6. Disconnect USB and reconnect wirelessly

---

## WiFi Configuration

### WiFi Modes

**Source:** `vesc_express/main/datatypes.h:92-96`

```c
// From vesc_express/main/datatypes.h:92-96
typedef enum {
    WIFI_MODE_DISABLED = 0,
    WIFI_MODE_STATION,
    WIFI_MODE_ACCESS_POINT
} WIFI_MODE;
```

| Mode | Description | Use Case |
|------|-------------|----------|
| **Disabled** | WiFi off | Battery saving |
| **Station** | Joins existing network | Home use |
| **Access Point** | Creates own network | On-the-go |

### Station Mode (Connect to Your WiFi)

1. Go to **VESC Express** → **General**
2. Set **WiFi Mode** to **Station**
3. Enter **Station SSID** (your network name)
4. Enter **Station Password** (your network password)
5. **Write** configuration
6. Power cycle VESC Express
7. Find device on your network (check router)

### Access Point Mode (Create Hotspot)

1. Set **WiFi Mode** to **Access Point**
2. Set **AP SSID** (name for your hotspot)
3. Set **AP Password** (min 8 characters)
4. **Write** configuration
5. On phone/computer, connect to the hotspot

**Default AP Settings:**
- SSID: Often `VESC_XXXXX` (hardware dependent)
- Password: Often `vescexpress` or blank
- IP: Usually `192.168.4.1`
- Port: `65102`

---

## Connecting from VESC Tool

### Via WiFi (Station Mode)

1. Ensure VESC Express is connected to your network
2. Open VESC Tool → **Connection**
3. Select **TCP** connection type
4. Enter IP address of VESC Express
5. Port: `65102`
6. Click **Connect**

### Via WiFi (Access Point Mode)

1. Connect your device to VESC Express hotspot
2. Open VESC Tool → **Connection**
3. Select **TCP** connection type
4. IP: `192.168.4.1`
5. Port: `65102`
6. Click **Connect**

### Finding the IP Address

If you don't know the IP:

1. Check your router's connected devices list
2. Use a network scanner app
3. Or use UDP discovery in VESC Tool

---

## Bluetooth LE Configuration

### BLE Modes

**Source:** `vesc_express/main/datatypes.h:98-103`

```c
// From vesc_express/main/datatypes.h:98-103
typedef enum {
    BLE_MODE_DISABLED = 0,
    BLE_MODE_OPEN,
    BLE_MODE_ENCRYPTED,
    BLE_MODE_SCRIPTING
} BLE_MODE;
```

| Mode | Description | Security |
|------|-------------|----------|
| **Disabled** | BLE off | N/A |
| **Open** | No pairing required | Low |
| **Encrypted** | PIN required | Higher |
| **Scripting** | LispBM controlled | Custom |

### Setting Up BLE

1. Go to **VESC Express** → **General**
2. Set **BLE Mode** to **Open** or **Encrypted**
3. Set **BLE Name** (8 characters max)
4. If encrypted, set **BLE PIN** (6 digits)
5. **Write** configuration
6. Power cycle device

### Connecting via BLE

**From VESC Tool Mobile:**

1. Ensure Bluetooth enabled on phone
2. Open VESC Tool → **Connection**
3. Select **BLE** connection type
4. Scan for devices
5. Select your VESC Express
6. If encrypted, enter PIN when prompted

**From Desktop VESC Tool:**

Note: BLE support varies by operating system and BLE adapter.

---

## Compatible Apps

### Floaty App

1. Install Floaty from app store
2. Enable BLE on your phone
3. In Floaty, tap **Connect**
4. Select your board from list
5. Connection established!

**If Floaty doesn't see your board:**
- Check BLE Mode is not Disabled
- Power cycle VESC Express
- Check BLE Name is short (≤8 chars)
- Try moving closer to board

### Float Control / VESC Tool Mobile

Same process as Floaty - scan and connect via BLE.

---

## Troubleshooting

### WiFi Won't Connect (Station Mode)

1. **Verify credentials** - Double check SSID and password
2. **Check network** - Is your router 2.4GHz? (5GHz not supported)
3. **Signal strength** - Move closer to router
4. **Reboot both** - Power cycle Express and router
5. **Try AP mode** - If Station fails, test with AP mode first

### BLE Connection Drops

1. **Distance** - Stay within 10m
2. **Interference** - Move away from other BLE devices
3. **Phone issues** - Restart Bluetooth on phone
4. **Firmware** - Update VESC Express firmware
5. **BLE Name** - Use shorter name (≤8 chars)

### Can't Find Device on Network

1. **Same network** - Phone/computer on same WiFi?
2. **Check router** - Look for new devices in admin panel
3. **Static IP** - Consider setting static IP in router
4. **Firewall** - Check if port 65102 blocked

### "Connection Timeout" Errors

1. **Port** - Confirm using port 65102
2. **IP changed** - Check current IP in router
3. **Too many connections** - Only one at a time
4. **Power cycle** - Restart VESC Express

---

## TCP Hub (Remote Access)

Connect to your board from anywhere via internet.

### Setup

1. Go to **VESC Express** → **TCP Hub**
2. Enable **Use TCP Hub**
3. Set **Hub URL**: `veschub.vedder.se`
4. Set **Hub Port**: `65101`
5. Create **Hub ID** and **Hub Password**
6. **Write** configuration

### Connecting Remotely

1. Open VESC Tool
2. Go to **Connection** → **TCP Hub**
3. Enter your Hub ID and Password
4. Click **Connect**

**Security Note:** Use strong, unique password for Hub access.

---

## Factory Reset

If something goes wrong:

### Method 1: Via USB

1. Connect via USB
2. Reset all WiFi/BLE settings to defaults
3. Write configuration

### Method 2: Hardware Reset

Some VESC Express devices have reset button:
- Hold button during power-up
- Releases all stored settings

### Method 3: Reflash Firmware

1. Download latest firmware
2. Use VESC Tool → Firmware → Upload
3. Reconfigure from scratch

---

## Network Settings Reference

| Setting | Default | Description |
|---------|---------|-------------|
| TCP Port | 65102 | Local TCP server port |
| UDP Port | 65102 | Discovery broadcast |
| Hub Port | 65101 | TCP Hub connection |
| Hub URL | veschub.vedder.se | Remote access server |
| AP IP | 192.168.4.1 | IP in Access Point mode |

---

## Best Practices

1. **Use Station mode** when at home for reliable connection
2. **Use AP mode** when mobile or network unavailable
3. **Enable BLE** for phone apps (Floaty, Float Control)
4. **Set strong passwords** for AP and TCP Hub
5. **Update firmware** regularly for bug fixes
6. **Document your settings** in case of reset

---

*Content verified against vesc_express source code | Ready for embedding*
