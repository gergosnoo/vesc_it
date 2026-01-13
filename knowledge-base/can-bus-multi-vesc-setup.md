# CAN Bus Multi-VESC Setup Guide

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-13
**Source:** `bldc/documentation/comm_can.md`, `bldc/comm/comm_can.c`
**Addresses:** GAP-05 (High Priority)

---

## Quick Reference

### Wiring

```
VESC 1 (Master)         VESC 2 (Slave)
   CAN H ──────────────── CAN H
   CAN L ──────────────── CAN L
   GND   ──────────────── GND (recommended)
```

### Settings Checklist

| Setting | Master | Slave |
|---------|--------|-------|
| VESC ID | 0 (default) | 1, 2, 3... |
| CAN Mode | VESC | VESC |
| Baud Rate | Same on all | Same on all |
| Status Messages | Enable | Optional |

---

## Physical Wiring

### Basic Two-VESC Setup

1. **CAN H to CAN H** - Connect high pins together
2. **CAN L to CAN L** - Connect low pins together
3. **GND to GND** - Recommended for ground reference

### Wire Requirements

- Use twisted pair cable for CAN H/L
- Keep wires short (< 2m recommended)
- 22-24 AWG wire is sufficient
- Shielded cable for noisy environments

### CAN Connector Pinout (JST-PH 4-pin)

```
Pin 1: CAN H (High)
Pin 2: CAN L (Low)
Pin 3: GND
Pin 4: +5V (not used for CAN, but available)
```

---

## Termination Resistors

### When You Need Them

- Long cable runs (> 1m)
- High baud rates (500K+)
- Noisy environments
- More than 2 VESCs on bus

### How to Add

120Ω resistor between CAN H and CAN L:

```
VESC 1         VESC 2         VESC 3
  │              │              │
  ├──[120Ω]──────┼──────────────┼──[120Ω]──┤
CAN H ─────────────────────────────────────
CAN L ─────────────────────────────────────
```

**Note:** Termination resistors go at EACH END of the bus, not in the middle.

---

## Software Configuration

### Step 1: Set VESC IDs

Each VESC needs a unique ID (0-254):

1. Connect to first VESC via USB
2. Go to **App Settings** → **General**
3. Set **VESC ID** to 0 (Master)
4. Write configuration

5. Connect to second VESC via USB
6. Set **VESC ID** to 1
7. Write configuration

Repeat for additional VESCs (ID 2, 3, etc.)

### Step 2: Configure CAN Mode

On all VESCs:

1. **App Settings** → **General** → **CAN Mode**
2. Select **VESC** (default and recommended)
3. Write configuration

### Step 3: Set Baud Rate

**Source:** `bldc/datatypes.h:249-259`

```c
// From bldc/datatypes.h:249-259
typedef enum {
    CAN_BAUD_125K = 0,
    CAN_BAUD_250K,
    CAN_BAUD_500K,
    CAN_BAUD_1M,
    CAN_BAUD_10K,
    CAN_BAUD_20K,
    CAN_BAUD_50K,
    CAN_BAUD_75K,
    CAN_BAUD_100K,
} CAN_BAUD;
```

**All VESCs must use the same baud rate!**

| Rate | Enum | Use Case |
|------|------|----------|
| 125 Kbps | CAN_BAUD_125K | Long cables, basic use |
| 250 Kbps | CAN_BAUD_250K | Standard use |
| 500 Kbps | CAN_BAUD_500K | **Most common, recommended** |
| 1 Mbps | CAN_BAUD_1M | Short cables, high performance |

Configure in **App Settings** → **General** → **CAN Baud Rate**

---

## CAN Status Messages

### Enabling Status Broadcasting

To receive motor data from slave VESCs:

1. Go to **App Settings** → **General**
2. Find **CAN Status Messages Rate 1**
3. Select which status messages to broadcast
4. Set rate (e.g., 50 Hz)

### Available Status Messages

| Message | Data Included |
|---------|---------------|
| Status 1 | ERPM, Current, Duty |
| Status 2 | Ah, Ah Charged |
| Status 3 | Wh, Wh Charged |
| Status 4 | Temp FET, Temp Motor, Current In, PID Position |
| Status 5 | Tachometer, Input Voltage |
| Status 6 | ADC1, ADC2, ADC3, PPM |

### Reading Status in Master

The master VESC automatically receives status from slaves. Use **RT Data** page in VESC Tool to see all connected VESCs.

---

## Common Multi-VESC Applications

### Dual Motor (esk8, ebike)

**Wiring:**
- USB to Master (ID 0)
- CAN to Slave (ID 1)
- Same throttle input to Master only

**Settings:**
- Master: Receives throttle, forwards to slave
- Slave: CAN Status Messages enabled
- Both: Same motor and app config

### Quad Motor (4WD vehicle)

**Topology:**
```
Master (ID 0) ── Slave 1 (ID 1)
     │
     └── Slave 2 (ID 2) ── Slave 3 (ID 3)
```

Or daisy-chain all four:
```
Master (0) ── Slave (1) ── Slave (2) ── Slave (3)
```

### Multi-ESC with BMS

**Wiring:**
- VESC Master (ID 0)
- VESC Slaves (ID 1, 2...)
- VESC BMS (ID 10 or different range)

BMS broadcasts cell voltages and SOC on CAN.

---

## Troubleshooting

### CAN Not Communicating

1. **Check wiring** - H to H, L to L
2. **Verify IDs** - Must be unique
3. **Check baud rate** - Must match on all
4. **Try lower baud rate** - 125K is most reliable

### Dual Motors Lose Sync

1. Check **Timeout** setting in App Settings
2. Ensure **CAN Status Messages** enabled on slave
3. Verify cable connections
4. Try adding termination resistors

### "CAN Detection Failed" (-51)

1. Check physical connections
2. Verify both VESCs powered on
3. Check baud rates match
4. Try different CAN IDs
5. Test each VESC individually first

### Status Messages Not Received

1. Enable **CAN Status Messages** on transmitting VESC
2. Set appropriate rate (10-100 Hz)
3. Check CAN Mode is "VESC" on all devices
4. Verify CAN ID in frame matches expected

---

## CAN Forwarding in VESC Tool

VESC Tool can configure remote VESCs through CAN:

1. Connect USB to Master VESC
2. Go to **Connection** → **CAN Forward**
3. Select slave VESC ID
4. All settings now apply to that slave

This lets you configure all VESCs without physically reconnecting USB.

---

## Terminal Commands for CAN

```
# Scan for VESCs on CAN bus
can_scan

# Forward commands to specific CAN ID
can_fwd [id]

# Check CAN status
can_state

# Send raw CAN frame (debug)
can_send [id] [d0] [d1] ...
```

---

## Best Practices

1. **Use same firmware** on all VESCs
2. **Match baud rates** exactly
3. **Unique IDs** for each device
4. **Termination** for long runs
5. **Test individually** before connecting CAN
6. **Document your setup** for future reference

---

*Content verified against bldc source code | Ready for embedding*
