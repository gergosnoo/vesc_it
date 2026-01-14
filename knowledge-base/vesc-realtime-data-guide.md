# VESC Real-Time Data Interpretation Guide

## Overview

**Key Terms:** RT data, real-time data, VESC Tool, telemetry, sampled at fault, trigger sampling, debug sampling, connection timeout, no connection

This guide explains how to interpret VESC real-time data, use fault sampling for debugging, and troubleshoot connection issues.

**Source:** bldc firmware - commands.c, mc_interface.c, datatypes.h, timeout.h

---

## Understanding Real-Time Data

Real-time (RT) data shows live telemetry from your VESC. This is essential for:
- Monitoring motor performance
- Diagnosing issues
- Tuning settings
- Verifying changes

**Location:** VESC Tool → Real-Time Data tab

---

## Key RT Data Fields

### Temperature

| Field | Description | Warning Level |
|-------|-------------|---------------|
| MOSFET Temp | Controller FET temperature | >80°C |
| Motor Temp | Motor winding temperature | >100°C |

**Note:** Some VESCs have 3 individual MOSFET temperature sensors.

### Currents

| Field | Description | Units |
|-------|-------------|-------|
| Motor Current | Current through motor phases | Amps |
| Battery Current | Current from/to battery | Amps |
| Id | Direct axis current (FOC) | Amps |
| Iq | Quadrature axis current (FOC) | Amps |

**Understanding Id/Iq:**
- **Iq** = Torque-producing current (what moves the motor)
- **Id** = Field-modifying current (used for field weakening)
- For most operation: Id ≈ 0, Iq = motor current

### Electrical

| Field | Description | Notes |
|-------|-------------|-------|
| Duty Cycle | % of max voltage applied | 0-100% |
| Input Voltage | Battery voltage | Volts |
| Vd | Direct axis voltage (FOC) | Volts |
| Vq | Quadrature axis voltage (FOC) | Volts |

### Mechanical

| Field | Description | Units |
|-------|-------------|-------|
| ERPM | Electrical RPM | RPM × pole pairs |
| Tachometer | Revolution count | Revolutions |
| Tacho Absolute | Absolute rev count | Always positive |

**Converting ERPM to RPM:**
```
RPM = ERPM / (motor_poles / 2)

Example: 15000 ERPM with 14-pole motor
RPM = 15000 / 7 = 2143 RPM
```

### Energy

| Field | Description | Units |
|-------|-------------|-------|
| Amp Hours | Energy consumed | Ah |
| Amp Hours Charged | Energy regenerated | Ah |
| Watt Hours | Power consumed | Wh |
| Watt Hours Charged | Power regenerated | Wh |

### Status

| Field | Description |
|-------|-------------|
| Fault Code | Current fault (if any) |
| Timeout | Communication timeout active |
| Kill Switch | Kill switch engaged |

---

## "RT Data Shows No Connection"

This is a common issue where VESC Tool connects via USB but shows "No Connection" in RT Data.

### Causes and Fixes

| Cause | Solution |
|-------|----------|
| Wrong serial port | Select correct port in Connection menu |
| Charge-only USB cable | Use data cable (not all cables have data lines) |
| Baud rate mismatch | Verify baud rate (default 115200) |
| Firmware crashed | Power cycle VESC |
| Driver issue (Windows) | Install STM32 Virtual COM Port driver |

### Troubleshooting Steps

1. **Check USB Cable:**
   - Try a different cable (quality, short cable)
   - Connect directly to computer (not through hub)

2. **Check Port Selection:**
   - Disconnect/reconnect USB
   - Note which port appears/disappears
   - Select that port manually

3. **Verify Connection:**
   ```
   VESC Tool → Connection → Connect (manual)
   Select correct port
   Click Connect
   ```

4. **Check Firmware:**
   - If VESC boots but doesn't respond, firmware may be corrupted
   - Try bootloader mode and reflash

---

## Trigger Sampled at Fault

This powerful debugging feature captures high-speed data when a fault occurs, helping identify the root cause.

**Source:** `mc_interface.c:2089-2117`

### How It Works

1. **Arm the trigger** - VESC continuously samples data into circular buffer
2. **Wait for fault** - System monitors for any fault condition
3. **Capture window** - When fault occurs, captures samples before and after
4. **Auto-transmit** - Data automatically sent to VESC Tool

### Using Sampled at Fault

**Location:** VESC Tool → Real-Time Data → Experiment Tab

1. Click **"Sample Now"** dropdown
2. Select **"Trigger on Fault"**
3. Click **"Sample"** to arm
4. Operate motor normally
5. When fault occurs, data is captured and displayed

### Interpreting Sampled Data

The capture shows:

| Channel | Description |
|---------|-------------|
| Phase A/B/C Current | Raw current waveforms |
| Phase A/B/C Voltage | Raw voltage waveforms |
| Vzero | Zero reference voltage |
| Status | Control state flags |
| Current FIR | Filtered current values |
| Switching Freq | PWM frequency |
| Phase | Motor electrical angle |

### What to Look For

| Pattern | Indicates |
|---------|-----------|
| Current spike before fault | Over-current event |
| Voltage drop before fault | Under-voltage/brownout |
| Erratic phase currents | Phase wire issue |
| Sudden zero current | Connection lost |
| Gradual rise then fault | Thermal issue |

---

## Sampling Modes

**Source:** `datatypes.h:237-245`

| Mode | Purpose | Use Case |
|------|---------|----------|
| Off | Disabled | Normal operation |
| Now | Single immediate sample | Quick snapshot |
| Start | Continuous sampling | Ongoing analysis |
| Trigger Start | Sample when motor running | Startup analysis |
| **Trigger Fault** | Capture on fault | **Debugging faults** |
| Send Last | Transmit previous capture | Review old data |

---

## Connection Timeout

The VESC has a safety timeout that stops the motor if communication is lost.

**Source:** `timeout.h:39-52`

### Timeout Behavior

```
No commands received for X ms
        │
        ▼
Timeout flag set
        │
        ▼
Motor current → 0 (or brake current)
        │
        ▼
Commands resume → Timeout clears
```

### Timeout Settings

**Location:** App Settings → General → Timeout

| Parameter | Default | Purpose |
|-----------|---------|---------|
| Timeout | 1000ms | Time without commands before stopping |
| Brake Current | 0A | Current applied during timeout |

### Timeout Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Motor stops randomly | Connection dropout | Check cables, reduce timeout |
| "Timeout" in RT Data | No recent commands | Move throttle or send keepalive |
| Motor won't start | Timeout active | Power cycle or reconnect app |

---

## RT Data Scaling

When reading raw protocol data, values are scaled:

| Factor | Precision | Used For |
|--------|-----------|----------|
| ×10 | Tenths | Temperature |
| ×100 | Hundredths | Currents |
| ×1000 | Thousandths | Voltage, Duty, Speed |
| ×10000 | 0.0001 | Ah, Wh |
| ×1000000 | μ | Position |

**Note:** VESC Tool handles this automatically - these are only relevant for custom applications.

---

## Common RT Data Patterns

### Normal Operation

```
Motor Current: 20-50A (varies with load)
Battery Current: 10-30A (lower than motor current)
Duty Cycle: 30-80% (varies with speed)
Temperature: <60°C (stable)
Fault Code: None
```

### Over-Current Event

```
Motor Current: Spikes to limit
Battery Current: May spike
Fault Code: ABS_OVER_CURRENT (4)
```

### Thermal Issue

```
Temperature: Gradually rising
Above 80°C: Thermal rollback starts
Above 100°C: OVER_TEMP_FET fault
```

### Voltage Sag (Low Battery)

```
Input Voltage: Dropping under load
Duty Cycle: Increasing to compensate
Eventually: UNDER_VOLTAGE fault
```

### Phase Wire Issue

```
Motor Current: Erratic or unbalanced
Duty Cycle: May oscillate
Possible: DRV fault or UNBALANCED_CURRENTS
```

---

## RT Data Recording

VESC Tool can record RT data for later analysis:

1. Go to **Real-Time Data** tab
2. Click **"RT Data Recording"**
3. Select data to record
4. Click **Start**
5. Operate motor
6. Click **Stop**
7. Save CSV file

### Analyzing Recorded Data

Recorded CSV can be:
- Opened in Excel/LibreOffice
- Plotted in MATLAB/Python
- Shared for community help

---

## Quick Reference: Debugging with RT Data

| Issue | Check In RT Data |
|-------|------------------|
| Motor won't spin | Fault code, timeout, duty cycle |
| Cuts out at speed | Voltage, temperature, duty |
| Jerky motion | Current waveform, hall/encoder status |
| Overheating | Temperature trends |
| Range issues | Wh consumed, battery voltage |
| Random faults | Use "Trigger on Fault" sampling |

---

## References

- Source: `bldc/comm/commands.c` - RT data transmission
- Source: `bldc/motor/mc_interface.c:2089-2117` - Fault sampling
- Source: `bldc/datatypes.h:237-245` - Sampling modes
- Source: `bldc/timeout.h:39-52` - Timeout handling
- Related: `vesc-fault-code-reference.md` - All fault codes
- Related: `vesc-error-recovery-guide.md` - Recovery procedures

---

*Last updated: 2026-01-14 | Source verified against bldc repository*
