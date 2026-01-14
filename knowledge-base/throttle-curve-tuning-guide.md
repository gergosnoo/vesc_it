# Throttle Curve Tuning Guide

## Overview

**Key Terms:** throttle curve, PPM mapping, expo, exponential, deadband, ramp time, throttle calibration, remote calibration, throttle feel, throttle response

This guide covers tuning throttle response for PPM and ADC inputs, including exponential curves, deadband, ramping, and calibration procedures.

**Source:** bldc firmware - app_ppm.c, app_adc.c, datatypes.h

---

## Why Tune Throttle Curves?

Stock throttle settings are often:
- Too sensitive at low throttle
- Too linear (same response everywhere)
- Missing deadband (twitchy at center)
- Too aggressive or too sluggish

**Good throttle tuning provides:**
- Smooth, controllable low-speed operation
- Progressive power delivery
- Comfortable cruising without fatigue
- Predictable braking feel

---

## Throttle Curve Parameters

**Location:** App Settings → PPM or ADC

### Exponential (Expo)

| Parameter | Default | Range | Effect |
|-----------|---------|-------|--------|
| Throttle Exp | 0.0 | 0.0 - 5.0 | Curve aggressiveness |
| Throttle Exp Brake | 0.0 | 0.0 - 5.0 | Brake curve |
| Throttle Exp Mode | Poly | Expo/Natural/Poly | Curve algorithm |

### What Expo Does

```
Expo = 0.0 (Linear):
Input: ████████████████████ (100%)
Output: ████████████████████ (100%)
        ↑ Same response everywhere

Expo = 2.0 (Curved):
Input: ██████████ (50%)
Output: ████ (20%)
        ↑ Soft start, aggressive end

Expo = 4.0 (Very Curved):
Input: ██████████ (50%)
Output: ██ (10%)
        ↑ Very soft start, very aggressive end
```

### Expo Modes Explained

**Source:** `datatypes.h:603-607`

| Mode | Behavior | Best For |
|------|----------|----------|
| Expo | Traditional exponential | Racing, quick response |
| Natural | Logarithmic curve | Smooth, natural feel |
| Poly | Polynomial blend | Most riders (default) |

**Recommendation:** Use **Poly** mode for best balance of control and responsiveness.

---

## Deadband (Center Dead Zone)

Deadband creates a neutral zone around throttle center where no input is registered.

### Why Use Deadband?

- **Eliminates throttle twitch** at neutral
- **Reduces hand fatigue** during cruising
- **Compensates for worn remotes** with drift

### Setting Deadband

**For PPM:**
```
Pulse Center: 1.5ms (typical)
Hysteresis: 0.15 (default)
```
Hysteresis acts as deadband - throttle must move 15% from center before registering.

**For ADC:**
```
Voltage Center: 2.0V (typical)
Hysteresis: 0.15 (default)
```

### Deadband Values

| Hysteresis | Effect |
|------------|--------|
| 0.05 | Minimal deadband (responsive) |
| 0.10 | Small deadband |
| 0.15 | Default (balanced) |
| 0.20 | Larger deadband (relaxed) |
| 0.25+ | Very large (may feel sluggish) |

---

## Ramp Time (Acceleration Smoothing)

Ramp time controls how quickly throttle changes take effect.

**Location:** App Settings → PPM/ADC → Ramp Time

| Parameter | Default | Purpose |
|-----------|---------|---------|
| Ramp Time Pos | 0.4s | Acceleration smoothing |
| Ramp Time Neg | 0.2s | Braking smoothing |

### Ramp Time Effects

```
Ramp Time = 0.0s (Instant):
Throttle: ─────┐
Output:   ─────┘ (Immediate response)
↑ Jerky but responsive

Ramp Time = 0.5s (Smooth):
Throttle: ─────┐
Output:   ─────╲ (Gradual ramp)
↑ Smooth but delayed
```

### Recommended Ramp Times

| Riding Style | Ramp Pos | Ramp Neg |
|--------------|----------|----------|
| Cruising/Comfort | 0.5-1.0s | 0.3-0.5s |
| Street/Responsive | 0.2-0.4s | 0.1-0.2s |
| Racing/Aggressive | 0.0-0.1s | 0.0-0.1s |
| Beginners | 0.5-0.8s | 0.3-0.4s |

**Note:** Very low ramp times can cause wheel slip on acceleration and lock-up on braking.

---

## Remote Calibration Procedure

### PPM Remote Calibration

1. Go to **App Settings → PPM**
2. Click **"Run Detection"** or **"Mapping"**
3. Follow prompts:
   - Move throttle to **full forward**
   - Move throttle to **full brake**
   - Return throttle to **center**
4. Click **Apply** then **Write**

### Verifying Calibration

1. Go to **Real-Time Data → PPM**
2. Watch the decoded value as you move throttle:
   - Center: Should show ~0%
   - Full forward: Should show ~100%
   - Full brake: Should show ~-100%

### Common Calibration Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Throttle doesn't reach 100% | Pulse end too high | Lower Pulse End value |
| Throttle twitches at center | No deadband | Increase Hysteresis |
| Brake doesn't work | Wrong control type | Change to "Current No Rev Brake" |
| Reversed direction | Throttle inverted | Swap Pulse Start/End values |

---

## Tuning for Different Feel

### "My throttle feels unresponsive"

**Problem:** Linear response feels sluggish at low throttle

**Fix:**
1. Add expo: `Throttle Exp = 1.5-2.5`
2. Reduce ramp time: `Ramp Time Pos = 0.2-0.3s`
3. Use Poly mode for smooth curve

### "My throttle is too twitchy"

**Problem:** Too sensitive, hard to hold steady speed

**Fix:**
1. Increase hysteresis: `0.15 → 0.20`
2. Add ramp time: `Ramp Time Pos = 0.4-0.6s`
3. Reduce expo if too aggressive at high throttle

### "Braking is too harsh"

**Problem:** Grabby brakes, hard to modulate

**Fix:**
1. Add brake expo: `Throttle Exp Brake = 1.5-2.0`
2. Increase brake ramp: `Ramp Time Neg = 0.3-0.5s`
3. Consider reducing brake current limit

### "Cruising is fatiguing"

**Problem:** Constantly adjusting throttle

**Fix:**
1. Increase deadband: `Hysteresis = 0.18-0.22`
2. Consider PID speed mode instead of current mode
3. Add slight ramp time for stability

---

## Throttle Curve Presets

### Beginner Preset

```
Control Type:       Current No Rev Brake
Throttle Exp:       2.0
Throttle Exp Brake: 1.5
Throttle Exp Mode:  Poly
Ramp Time Pos:      0.5s
Ramp Time Neg:      0.3s
Hysteresis:         0.18
```
**Feel:** Forgiving, smooth, easy to control

### Street Riding Preset

```
Control Type:       Current No Rev Brake
Throttle Exp:       1.5
Throttle Exp Brake: 1.0
Throttle Exp Mode:  Poly
Ramp Time Pos:      0.3s
Ramp Time Neg:      0.2s
Hysteresis:         0.15
```
**Feel:** Balanced, responsive, good for commuting

### Aggressive Preset

```
Control Type:       Smart Rev
Throttle Exp:       0.5
Throttle Exp Brake: 0.5
Throttle Exp Mode:  Expo
Ramp Time Pos:      0.1s
Ramp Time Neg:      0.1s
Hysteresis:         0.10
```
**Feel:** Direct, powerful, requires experience

---

## Testing Your Throttle Curve

### Bench Test (Before Riding)

1. Prop board so wheel spins freely
2. Go to Real-Time Data
3. Slowly increase throttle
4. Watch motor current and RPM
5. Verify smooth ramp-up
6. Test braking response

### Ride Test Checklist

- [ ] Smooth acceleration from stop
- [ ] Easy to hold constant speed
- [ ] No twitch at throttle center
- [ ] Predictable braking feel
- [ ] Comfortable after 10+ minutes

---

## Advanced: Current vs Duty vs PID Modes

**Location:** App Settings → PPM/ADC → Control Type

| Mode | Behavior | Best For |
|------|----------|----------|
| Current | Throttle = motor current | Most applications |
| Duty | Throttle = PWM duty cycle | Simple setups |
| PID | Throttle = target RPM | Constant speed cruise |

**For ESK8/EUC:** Use **Current No Rev Brake** or **Smart Rev**
**For E-bike:** Use **Current** or **PID** for cruise control feel

---

## Quick Reference

| Goal | Adjust |
|------|--------|
| Softer low throttle | ↑ Throttle Exp |
| More responsive | ↓ Ramp Time, ↓ Expo |
| Larger dead zone | ↑ Hysteresis |
| Smoother braking | ↑ Throttle Exp Brake, ↑ Ramp Neg |
| Less hand fatigue | ↑ Hysteresis, ↑ Ramp Time |

---

## References

- Source: `bldc/applications/app_ppm.c` - PPM handling
- Source: `bldc/applications/app_adc.c` - ADC handling
- Source: `bldc/datatypes.h:603-607` - Expo mode enum
- Related: `vesc-remote-input-configuration.md` - Input setup
- Related: `vesc-beginner-settings-guide.md` - Current limits

---

*Last updated: 2026-01-14 | Source verified against bldc repository*
