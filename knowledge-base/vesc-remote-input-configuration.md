# VESC Remote & Input Configuration Guide

## Overview

**Key Terms:** PPM, ADC, UART, remote, throttle, input, servo, analog, control type, throttle curve, safe start, ramp time, traction control

This guide covers configuring remote controls and throttle inputs for VESC controllers. Includes PPM (servo/PWM), ADC (analog voltage), and UART (serial) input methods.

**Source:** bldc firmware - datatypes.h, app_ppm.c, app_adc.c, confgenerator.c

---

## Input Types Overview

The VESC supports multiple input methods configured in **App Settings → General → App to Use**:

| App Type | Input Method | Use Case |
|----------|--------------|----------|
| PPM | PWM servo signal | Standard RC remotes, ESK8 remotes |
| ADC | Analog voltage | Thumb throttles, hall triggers |
| UART | Serial commands | Bluetooth modules, VESC remotes |
| PPM_UART | Both combined | Remote + app control |
| ADC_UART | Both combined | Throttle + app control |
| Nunchuk | I2C Wii controller | Nintendo Nunchuk |
| NRF | Nordic wireless | NRF24L01+ modules |
| Custom | Custom firmware | User applications |

**Location:** App Settings → General → App to Use

---

## PPM Configuration (RC Remote/Servo)

PPM (Pulse Position Modulation) is the standard for RC remotes and many ESK8 controllers.

### Control Types

| Type | Description | Use Case |
|------|-------------|----------|
| Current | Proportional current with reversing | General use |
| Current No Rev | Current, forward only | Single-direction vehicles |
| Current No Rev Brake | Forward + separate brake | Most ESK8 setups |
| Duty | Direct duty cycle control | Simple setups |
| PID | Speed (RPM) control | Constant speed applications |
| Smart Rev | Smart low-speed reversing | Electric skateboards |

**Recommended for ESK8:** `Current No Rev Brake` or `Smart Rev`

### Key PPM Parameters

**Location:** App Settings → PPM

| Parameter | Default | Range | Purpose |
|-----------|---------|-------|---------|
| Pulse Start | 1.0 ms | 0.5-1.5 ms | Minimum pulse (idle) |
| Pulse End | 2.0 ms | 1.5-2.5 ms | Maximum pulse (full throttle) |
| Pulse Center | 1.5 ms | 1.0-2.0 ms | Neutral position |
| Hysteresis | 0.15 | 0.0-0.5 | Dead zone for direction change |

### PPM Calibration

1. Go to **App Settings → PPM**
2. Click **Run Detection**
3. Move throttle: Full forward → Full brake → Center
4. Values auto-fill based on your remote
5. Click **Apply** then **Write**

### PPM Wiring

```
Remote Receiver → VESC
─────────────────────
Signal (White/Orange) → PPM input pin
Ground (Black/Brown)  → GND
Power (Red)           → 5V (optional, receiver may have own power)
```

### Throttle Curve Settings

| Parameter | Value | Effect |
|-----------|-------|--------|
| Throttle Exp | 0.0 | Linear response |
| Throttle Exp | 1.0-2.0 | More control at low throttle |
| Throttle Exp | 3.0+ | Very soft start, aggressive end |
| Throttle Exp Mode | Poly | Smoothest curve (recommended) |

### Safe Start Options

| Mode | Behavior |
|------|----------|
| Disabled | Motor responds immediately |
| Regular | Throttle must be at neutral on power-up |
| No Fault | Regular but no fault if out of range |

**Recommended:** `Regular` for safety

---

## ADC Configuration (Analog Throttle)

ADC inputs accept 0-3.3V analog signals from thumb throttles, hall sensors, or potentiometers.

### Control Types

| Type | Description |
|------|-------------|
| Current | Analog → motor current |
| Current Rev Center | Center point = neutral, both directions |
| Current Rev Button | Button activates reverse |
| Current No Rev Brake Center | Forward + brake from center |
| Current No Rev Brake ADC | Brake from second ADC input |
| Duty | Direct duty cycle |
| PID | Speed (RPM) control |

**Common for thumb throttles:** `Current No Rev Brake Center` or `Current`

### Key ADC Parameters

**Location:** App Settings → ADC

| Parameter | Default | Purpose |
|-----------|---------|---------|
| Voltage Start | 0.9V | Throttle begins here |
| Voltage End | 3.0V | Full throttle voltage |
| Voltage Center | 2.0V | Neutral (for reversing modes) |
| Voltage Min | 0.0V | Fault below this |
| Voltage Max | 3.5V | Fault above this |

### ADC Calibration

1. Go to **App Settings → ADC**
2. With throttle **released**, note the voltage reading
3. Set **Voltage Start** slightly above this value
4. With throttle **full**, note the voltage reading
5. Set **Voltage End** slightly below this value
6. Set **Voltage Min/Max** to catch disconnection faults

### ADC Wiring

```
Thumb Throttle → VESC
────────────────────
Signal (typically Green/Yellow) → ADC input pin
Ground (Black)                  → GND
Power (Red)                     → 3.3V or 5V (check throttle specs)
```

### Two-Channel ADC (Throttle + Brake)

For separate brake lever:

| Parameter | Throttle | Brake |
|-----------|----------|-------|
| Voltage Start | 0.9V | 0.9V |
| Voltage End | 3.0V | 3.0V |
| Channel | ADC1 | ADC2 |

Set **Control Type** to `Current No Rev Brake ADC`

### ADC Update Rate

| Setting | Value | Use |
|---------|-------|-----|
| Default | 500 Hz | Most applications |
| High Response | 1000 Hz | Racing, precision |
| Low Power | 100 Hz | Battery saving |

---

## UART Configuration (Serial Control)

UART allows control via serial commands from Bluetooth modules, displays, or custom controllers.

### Basic Setup

**Location:** App Settings → General

| Setting | Value |
|---------|-------|
| App to Use | UART (or PPM_UART, ADC_UART) |
| Baud Rate | 115200 (default) |

### UART for Bluetooth

Most VESC Bluetooth modules (like the VESC Express) use UART:

1. Set **App to Use** = UART
2. Ensure **Baud Rate** matches module (usually 115200)
3. Connect module to VESC UART pins (TX → RX, RX → TX)

### Combined Modes

| Mode | Behavior |
|------|----------|
| PPM_UART | PPM remote + UART commands (app control) |
| ADC_UART | ADC throttle + UART commands (app control) |

**Use combined modes when:** You want both physical remote AND app control

---

## Ramp Time Settings

Ramp time controls how quickly throttle changes take effect.

| Parameter | Default | Effect |
|-----------|---------|--------|
| Ramp Time Pos | 0.4s | Acceleration smoothing |
| Ramp Time Neg | 0.2s | Braking smoothing |

### Tuning Guidelines

| Riding Style | Ramp Pos | Ramp Neg |
|--------------|----------|----------|
| Smooth/Cruising | 0.5-1.0s | 0.3-0.5s |
| Responsive | 0.2-0.4s | 0.1-0.2s |
| Racing | 0.0-0.1s | 0.0-0.1s |

**Warning:** Very low ramp times can cause jerky response and wheel slip.

---

## Traction Control

VESC includes basic traction control for multi-motor setups.

**Location:** App Settings → PPM/ADC → Traction Control

| Parameter | Default | Purpose |
|-----------|---------|---------|
| TC Enabled | false | Master enable |
| TC Max Diff | 3000 ERPM | Max allowed speed difference |

### How It Works

When one wheel spins faster than another by more than `TC Max Diff`, the faster motor's current is reduced.

**Best for:** Dual motor ESK8, differential steering

---

## Multi-ESC Synchronization

For dual/quad motor setups:

**Location:** App Settings → PPM/ADC → Multi ESC

| Setting | Purpose |
|---------|---------|
| Multi ESC | Enable CAN bus sync |
| TC | Traction control between motors |
| TC Max Diff | RPM difference threshold |

### Setup for Dual Motors

1. Enable **Multi ESC** on both VESCs
2. Connect via CAN bus
3. Set **CAN ID** differently on each (0 and 1)
4. Only one VESC needs remote connected

---

## Troubleshooting

### PPM Not Responding

| Check | Solution |
|-------|----------|
| App to Use | Must be PPM or PPM_UART |
| Pulse values | Run detection, verify range |
| Wiring | Signal wire to PPM pin, ground connected |
| Safe Start | Throttle at neutral before power-on |

### ADC Faults

| Fault | Cause | Fix |
|-------|-------|-----|
| ADC Fault | Voltage outside Min/Max | Adjust voltage limits |
| No Response | Wrong control type | Match control type to setup |
| Jittery | Noise on signal | Add filtering, shorter wires |

### UART Not Working

| Check | Solution |
|-------|----------|
| Baud rate | Must match connected device |
| TX/RX swap | Try swapping TX and RX wires |
| App to Use | Must include UART |

---

## Quick Reference: Common Setups

### ESK8 with Mini Remote

```
App to Use: PPM
Control Type: Current No Rev Brake (or Smart Rev)
Pulse Start: 1.0ms
Pulse End: 2.0ms
Ramp Time Pos: 0.3s
Ramp Time Neg: 0.2s
Safe Start: Regular
```

### Thumb Throttle (E-bike style)

```
App to Use: ADC
Control Type: Current
Voltage Start: 0.9V
Voltage End: 3.0V
Ramp Time Pos: 0.5s
Ramp Time Neg: 0.2s
Safe Start: Regular
```

### Bluetooth App Control Only

```
App to Use: UART
Baud Rate: 115200
(Connect Bluetooth module to UART pins)
```

### Dual Motor with Remote + App

```
App to Use: PPM_UART
Control Type: Current No Rev Brake
Multi ESC: Enabled
TC: Enabled
TC Max Diff: 3000 ERPM
```

---

## References

- Source: `bldc/datatypes.h:588-709` - Input type definitions
- Source: `bldc/applications/app_ppm.c` - PPM implementation
- Source: `bldc/applications/app_adc.c` - ADC implementation
- Source: `bldc/confgenerator.c:216-342` - Config serialization
- Related: `vesc-motor-wizard-guide.md` - Initial setup
- Related: `vesc-beginner-settings-guide.md` - Current limits

---

*Last updated: 2026-01-14 | Source verified against bldc repository*
