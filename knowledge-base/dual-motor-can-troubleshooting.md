# Dual Motor CAN Bus Troubleshooting

## Overview

**Key Terms:** dual motor, both motors not spinning, CAN bus motor, CAN ID, traction control, motor sync, VESC dual, CAN timeout, slave VESC, master VESC, dual drive, AWD

This guide solves the most common dual motor CAN bus problems.

**Source:** `bldc/comm/can/comm_can.c`, `bldc/app/app.c`, community troubleshooting

---

## Quick Diagnosis

### "Only One Motor Spins"

```
Check in order:
1. CAN wires connected? (CANH, CANL, GND)
2. Different CAN IDs? (Master=0, Slave=1+)
3. CAN termination correct?
4. Same CAN baud rate?
5. Slave set to "CAN" app mode?
```

### "Both Motors Don't Spin"

```
Check in order:
1. Is MASTER VESC working alone? (disconnect slave)
2. Is throttle input reaching master?
3. Check for faults on both VESCs
4. Power supply strong enough for both?
```

---

## Setup Checklist

### Wiring Requirements

**CAN Bus Connections:**
```
Master VESC          Slave VESC
    CANH  ─────────────  CANH
    CANL  ─────────────  CANL
    GND   ─────────────  GND  (recommended)
```

**Termination:**
- 120Ω resistor at each END of CAN bus
- Most VESCs have built-in termination (check jumper)
- If 2 VESCs: both need termination enabled
- If 3+ VESCs: only first and last

### CAN ID Configuration

**On Each VESC:**
1. App Settings → General → CAN ID
2. **Master:** ID 0 (receives throttle input)
3. **Slave 1:** ID 1
4. **Slave 2:** ID 2 (if AWD)
5. Each VESC must have UNIQUE ID

**Source:** `bldc/comm/can/comm_can.c:65` - CAN ID range 0-253

### Slave VESC App Mode

**Critical Setting:**
1. Connect to SLAVE VESC
2. App Settings → General → App to Use
3. Select: **No App** or **CAN**

**Why:** Slave should ONLY listen to CAN commands from master, not its own inputs.

---

## Common Problems & Fixes

### Problem 1: Slave Motor Won't Spin

**Symptom:** Master spins, slave does nothing.

**Fixes in order:**

1. **Check CAN Wiring**
   - Swap CANH/CANL (some cables are crossed)
   - Check for loose connections
   - Measure continuity

2. **Verify CAN IDs Are Different**
   ```
   Master: 0
   Slave: 1 or higher
   ```
   Same ID = they fight, neither works.

3. **Check Slave App Mode**
   - Must be "No App" or "CAN"
   - NOT PPM, ADC, or UART

4. **Send CAN Status from Master**
   - Motor Settings → General → Send CAN Status
   - Rate: 50Hz or higher
   - Mode: CAN_STATUS_MODE_1 or higher

5. **Check CAN Baud Rate Matches**
   - App Settings → CAN → CAN Baud Rate
   - Both VESCs must use same rate
   - Default: 500K (CAN_BAUD_500K)

### Problem 2: CAN Timeout Errors

**Symptom:** Fault code "CAN" or intermittent motor dropouts.

**Fixes:**

1. **Reduce CAN Cable Length**
   - Under 2 meters recommended
   - Use twisted pair (CANH/CANL twisted together)

2. **Add Termination Resistors**
   - 120Ω between CANH and CANL
   - At each end of bus

3. **Shield CAN Cable**
   - Keep away from motor phase wires
   - Use shielded cable for long runs

4. **Reduce Electrical Noise**
   - Add ferrite beads on phase wires
   - Separate CAN from high-current paths

### Problem 3: Motors Don't Sync (Traction Control Issues)

**Symptom:** One motor pulls harder, jerky acceleration.

**Fixes:**

1. **Run Motor Detection on BOTH VESCs**
   - Connect to each individually via USB
   - Run detection wizard separately
   - Similar motors should have similar values

2. **Match Current Limits**
   - Same motor current limits on both
   - Same battery current limits

3. **Enable Traction Control**
   - Motor Settings → Additional Info → Traction Control
   - Set same value on both VESCs

4. **Check for Faulty Motor**
   - Swap motors between VESCs
   - If problem follows motor, motor issue
   - If problem stays with VESC, VESC issue

### Problem 4: Master VESC Fault When Slave Connected

**Symptom:** Master works alone, faults when CAN connected.

**Fixes:**

1. **CAN ID Conflict**
   - Disconnect slave
   - Change slave ID via USB
   - Reconnect

2. **Slave Sending Bad Data**
   - Disable slave's CAN status temporarily
   - Clear faults on both
   - Re-enable with matching settings

3. **Power Supply Sag**
   - Both VESCs sharing battery
   - Add larger capacitor on DC bus
   - Check battery can deliver combined current

---

## Multi-VESC Configuration (AWD)

### 4WD / AWD Setup

```
              ┌─── Slave VESC (ID 1) ─── Motor 1
Throttle ─── Master VESC (ID 0) ─── Motor 2
              ├─── Slave VESC (ID 2) ─── Motor 3
              └─── Slave VESC (ID 3) ─── Motor 4
```

**Key Settings:**
- Only Master receives throttle input
- All slaves in CAN app mode
- Unique IDs for each (0, 1, 2, 3)
- CAN bus terminated at both ends

### Current Scaling for Multi-Motor

If motors are different sizes:
- App Settings → [Input] → Multiple ESCs
- Set current scale per VESC
- Example: 80% for smaller motor

---

## Diagnostic Commands

### VESC Tool Terminal

**Check CAN Status:**
```
can_scan
```
Shows all VESCs on bus with their IDs.

**Send Test Command to Slave:**
```
can_current 1 5.0
```
Sends 5A to VESC ID 1. Motor should spin briefly.

**Check CAN Traffic:**
```
can_listen
```
Shows CAN messages being received.

---

## Quick Reference

### Setup Sequence

1. ✅ Wire CAN (CANH, CANL, GND)
2. ✅ Set unique CAN IDs
3. ✅ Set slave to "No App" or "CAN"
4. ✅ Run motor detection on each
5. ✅ Enable CAN status on master
6. ✅ Test each motor individually
7. ✅ Test together

### Troubleshooting Priority

| Issue | First Check | Second Check |
|-------|-------------|--------------|
| Slave won't spin | CAN ID conflict | App mode setting |
| CAN timeout | Wiring/termination | Baud rate |
| Sync issues | Motor detection | Current limits |
| Master faults | Slave CAN ID | Power supply |

---

## References

- Source: `bldc/comm/can/comm_can.c` - CAN communication
- Source: `bldc/app/app.c:213-245` - App mode handling
- Related: `can-uart-integration-guide.md` - CAN protocol details
- Related: `vesc-hardware-compatibility-guide.md` - Hardware CAN specs

---

*Last updated: 2026-01-14 | Source-verified troubleshooting*
