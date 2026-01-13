# Refloat Hidden Modes and Konami Sequences

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-13
**Source:** `refloat/src/state.h`, `refloat/src/main.c`, `refloat/src/konami.h`
**Addresses:** GAP-06, GAP-07 (Low Priority)

---

## Operating Modes

Refloat has three operating modes:

| Mode | Value | Description |
|------|-------|-------------|
| **MODE_NORMAL** | 0 | Standard riding mode |
| **MODE_HANDTEST** | 1 | Bench testing mode |
| **MODE_FLYWHEEL** | 2 | Upright spin mode |

---

## MODE_HANDTEST (Bench Testing)

### What It Does

Handtest mode allows testing the board balance without riding it:
- Limits motor current to **7A maximum**
- Disables haptic feedback (pushback)
- Disables I-term and tune modifiers
- Safe for holding the board in hand

### How to Activate

Handtest is activated via app command (Floaty, Float Control):
1. Open app with board connected
2. Find "Handtest" or "Bench Test" option
3. Toggle on

**Not activated via konami sequence** - requires app command.

### What Changes

When handtest activates:
```c
d->float_conf.ki = 0;           // No integral term
d->float_conf.kp_brake = 1;     // Minimal brake tuning
// Current limited to 7A internally
```

### Safety Notes

- **Do NOT stand on board in handtest mode**
- Limited current = limited torque
- Use only for bench testing sensors/response
- Disable before riding

---

## MODE_FLYWHEEL (Upright Spin)

### What It Does

Flywheel mode allows spinning the wheel while holding board upright:
- Board stands on tail, wheel in air
- Motor maintains balance for the wheel to spin
- Current limited to **40A maximum**
- Used for showing off / demos

### How to Activate

**Method 1: Konami Sequence**

With board on (lights active), step on sensors in sequence:
```
LEFT → NONE → RIGHT → NONE → LEFT → NONE → RIGHT
```

Meaning: Left foot, off, right foot, off, left foot, off, right foot

**Method 2: App Command**

Some apps have flywheel button.

### Requirements for Activation

- Board must be nearly upright (pitch > 70°)
- Konami sequence completed correctly
- Board will beep once when activated

### Exiting Flywheel Mode

**Press both footpad sensors simultaneously** → exits to normal mode

---

## Konami Sequences

**Source:** `refloat/src/main.c:83-93`

```c
// From refloat/src/main.c:83-93
static const FootpadSensorState flywheel_konami_sequence[] = {
    FS_LEFT, FS_NONE, FS_RIGHT, FS_NONE, FS_LEFT, FS_NONE, FS_RIGHT
};

static const FootpadSensorState headlights_on_konami_sequence[] = {
    FS_LEFT, FS_NONE, FS_LEFT, FS_NONE, FS_RIGHT
};

static const FootpadSensorState headlights_off_konami_sequence[] = {
    FS_RIGHT, FS_NONE, FS_RIGHT, FS_NONE, FS_LEFT
};
```

### How Konami Works

1. Step on specific sensor
2. Lift foot completely (FS_NONE)
3. Repeat pattern within timeout
4. Success triggers action

### Available Sequences

| Sequence | Pattern | Action |
|----------|---------|--------|
| **Flywheel** | L → off → R → off → L → off → R | Enter flywheel mode |
| **Headlights On** | L → off → L → off → R | Turn on headlights |
| **Headlights Off** | R → off → R → off → L | Turn off headlights |

### Pattern Legend

- **L** = Left sensor (front or heel depending on stance)
- **R** = Right sensor
- **off** = Both sensors released

### Timing Requirements

- Each step must be distinct
- Must complete within timeout period
- LEDs may flash to confirm progress

---

## Headlight Konami Shortcuts

### Headlights On

```
LEFT → (off) → LEFT → (off) → RIGHT
```

Activates headlights without using app.

### Headlights Off

```
RIGHT → (off) → RIGHT → (off) → LEFT
```

Deactivates headlights.

### Requirements

- `led_mode` must not be OFF
- LEDs must be configured
- Board in ready or idle state

---

## State Compatibility Mapping

For apps that need state info:

| Internal State | Compatible Value | Description |
|----------------|------------------|-------------|
| STATE_DISABLED | 0 | Board disabled |
| STATE_RUNNING | 1 | Normal riding |
| STATE_RUNNING + stop | 2 | Stopped/fault |
| STATE_RUNNING + wheelslip | 3 | Wheelslip detected |
| STATE_RUNNING + darkride | 4 | Upside-down riding |
| MODE_FLYWHEEL | 5 | Flywheel mode active |

---

## Troubleshooting

### Konami Not Working

1. **Check sensor calibration** - both sensors must work
2. **Practice timing** - each step must be distinct
3. **Wait for LEDs** - may need to be in idle state
4. **Try slower** - rushing can miss steps

### Flywheel Won't Activate

1. **Hold board more upright** - need >70° pitch
2. **Complete sequence fully** - all 7 steps
3. **Listen for beep** - confirms activation

### Stuck in Handtest Mode

1. Use app to disable handtest
2. Power cycle board
3. Reconnect app and toggle off

---

## Safety Warnings

### MODE_HANDTEST

- **Current is limited** - board will not support rider weight
- **Only for bench testing** - never ride
- **Check mode before riding** - apps show handtest indicator

### MODE_FLYWHEEL

- **Wheel spins fast** - keep hands/objects clear
- **Not for riding** - different balance behavior
- **Exit before riding** - press both sensors
- **40A current** - still powerful

---

*Content verified against refloat source code | Ready for embedding*
