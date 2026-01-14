# Nosedive Prevention Checklist for VESC Onewheels

## What is a Nosedive?

A **nosedive** occurs when the motor cannot provide enough torque to keep the board balanced, causing the nose to drop and the rider to fall forward. This is the most dangerous failure mode for self-balancing boards.

**Key Terms:** nosedive, nose dive, faceplant, cutout, motor cutout, board dropped, fell off onewheel

---

## Why Nosedives Happen

### The Physics: Duty Cycle and Headroom

The motor's power is measured by **duty cycle** - the percentage of maximum power being used:
- **0% duty cycle** = Motor idle
- **50% duty cycle** = Motor at half power
- **100% duty cycle** = Motor at MAXIMUM power (no reserve!)

**Duty Headroom** = The reserve power available for unexpected demands.

```
Example:
At 85% duty cycle → 15% headroom → Safe
At 95% duty cycle → 5% headroom → DANGER
At 100% duty cycle → 0% headroom → NOSEDIVE IMMINENT
```

When duty cycle hits 100%, the motor literally cannot push harder. If you need more torque (acceleration, hill, bump) and there's none left → **nosedive**.

---

## Critical Safety Parameters

### 1. Tiltback Duty (`tiltback_duty`)

**What it does:** Raises the nose to slow you down when duty cycle gets high.

**Location:** Refloat Cfg → Tiltback → Duty

| Setting | Risk Level | Recommendation |
|---------|------------|----------------|
| 90%+ | 🔴 DANGEROUS | Almost no headroom |
| 85% | 🟡 Moderate | Experienced riders only |
| 80% | 🟢 Safe | Recommended for most |
| 75% | 🟢 Very Safe | Conservative/beginners |

**Source:** `refloat/src/refloat.c` - `tiltback_duty` parameter

**Key Point:** Setting tiltback_duty to 90% means you only get warned when 90% of power is used. That leaves only 10% for hills, acceleration, or bumps. **This is NOT enough.**

### 2. Surge Duty Start (`surge_duty_start`)

**What it does:** Activates surge protection to provide extra power burst when needed.

**Location:** Refloat Cfg → Surge → Duty Start

**Critical Rule:** `surge_duty_start` must be LESS than `tiltback_duty`

```
✅ CORRECT: surge_duty_start = 0.75, tiltback_duty = 0.80
❌ WRONG: surge_duty_start = 0.85, tiltback_duty = 0.80
```

If surge kicks in AFTER tiltback, it defeats the purpose.

### 3. Tiltback Speed (`tiltback_speed`)

**What it does:** Maximum speed limit enforced by nose-up pushback.

**Location:** Refloat Cfg → Tiltback → Speed

**Recommendation:** Set based on your battery and skill level.

| Battery | Conservative | Moderate | Aggressive |
|---------|-------------|----------|------------|
| 16S | 25 km/h | 30 km/h | 35 km/h |
| 20S | 30 km/h | 35 km/h | 40 km/h |

**Remember:** Higher voltage = more headroom at speed. But physics still apply!

### 4. Haptic Buzz (`haptic_buzz_duty`)

**What it does:** Vibrates the board to warn you when duty is high.

**Location:** Refloat Cfg → Haptic Buzz → Duty

**Recommendation:** Set 5-10% below `tiltback_duty`

```
Example: tiltback_duty = 0.80
         haptic_buzz_duty = 0.70-0.75
```

This gives you warning BEFORE tiltback kicks in.

---

## The Nosedive Prevention Checklist

### Before Every Ride

- [ ] **Battery charged adequately** (>30% recommended)
- [ ] **Tire pressure correct** (lower pressure = more rolling resistance = higher duty)
- [ ] **Check for mechanical issues** (loose bolts, worn bearings)

### Settings Verification

- [ ] **tiltback_duty ≤ 0.85** (80% recommended)
- [ ] **surge_duty_start < tiltback_duty** (at least 5% lower)
- [ ] **haptic_buzz enabled** and set below tiltback
- [ ] **Battery cutoffs configured** for your cell count

### During Ride Awareness

- [ ] **Respect tiltback** - When nose pushes up, SLOW DOWN
- [ ] **Respect haptic buzz** - Vibration means "ease off"
- [ ] **Watch for signs of high duty:**
  - Motor feels "strained"
  - Nose wants to dip on acceleration
  - Tiltback activating frequently
- [ ] **Reduce speed on:**
  - Hills (up OR down)
  - Rough terrain
  - Low battery
  - Cold weather (battery sag)

---

## Calculating Safe Duty Headroom

### The 20% Rule

**Always maintain at least 20% headroom.**

```
Max safe duty = 80%
That leaves 20% for:
- Acceleration bursts
- Hitting bumps
- Small inclines
- Unexpected demands
```

### Factors That Increase Duty

| Factor | Duty Impact |
|--------|-------------|
| Speed | ↑ Higher duty at higher speeds |
| Hills (uphill) | ↑ +10-30% depending on grade |
| Heavy rider | ↑ More torque needed = higher duty |
| Low battery | ↑ Voltage sag = higher duty for same speed |
| Acceleration | ↑ Burst demand spikes duty |
| Rough terrain | ↑ Constant corrections = higher average duty |
| Cold weather | ↑ Battery internal resistance increases |
| Headwind | ↑ More resistance = higher duty |

### Real Example: Why Low Battery is Dangerous

```
Full battery (84V on 20S):
- Cruising at 30 km/h = 60% duty
- 40% headroom = SAFE

Low battery (72V on 20S):
- Same 30 km/h = 70% duty (higher because lower voltage)
- 30% headroom = Less safe

Very low battery (68V):
- Same 30 km/h = 78% duty
- 22% headroom = RISKY
- Hit a bump or small hill = NOSEDIVE
```

**This is why you should slow down as battery drains!**

---

## Nosedive Warning Signs

### Immediate Warning Signs (React NOW)

| Sign | What It Means | Action |
|------|---------------|--------|
| Tiltback (nose rises) | High duty cycle | SLOW DOWN IMMEDIATELY |
| Haptic buzz/vibration | Approaching duty limit | Ease off throttle |
| Motor sounds strained | Working hard | Reduce speed |
| Nose dips on acceleration | Near duty limit | Stop accelerating |

### Gradual Warning Signs (Ride Adjustments Needed)

| Sign | What It Means | Action |
|------|---------------|--------|
| Frequent tiltback | Riding too fast for conditions | Lower cruise speed |
| Reduced acceleration feel | Less headroom available | Check battery level |
| Board feels "heavy" | High average duty | Slow down |

---

## Safe Speed by Battery Level

| Battery Level | Recommended Max Speed |
|--------------|----------------------|
| 80-100% | Full rated speed |
| 60-80% | 90% of max speed |
| 40-60% | 75% of max speed |
| 20-40% | 60% of max speed |
| <20% | Limp home mode - very slow |

---

## Special Situations

### Uphill Riding

- Hills dramatically increase duty
- 10% grade can add 20-30% duty
- **Slow down BEFORE the hill, not during**
- If tiltback activates on a hill, dismount safely

### Carving/Turning

- Sharp turns increase duty
- Wide, smooth carves are safer
- Reduce speed before turns

### Rough Terrain

- Bumps cause duty spikes
- Each correction requires power
- Slow down on rough ground

### Cold Weather

- Battery delivers less power when cold
- Internal resistance increases
- Treat like "low battery" even when charged

---

## Parameter Quick Reference

| Parameter | Safe Value | Location |
|-----------|------------|----------|
| tiltback_duty | 0.75-0.80 | Refloat Cfg → Tiltback → Duty |
| tiltback_speed | 25-35 km/h | Refloat Cfg → Tiltback → Speed |
| surge_duty_start | 0.70-0.75 | Refloat Cfg → Surge → Duty Start |
| haptic_buzz_duty | 0.70-0.75 | Refloat Cfg → Haptic Buzz → Duty |
| tiltback_strength | 0.8-1.5 | Refloat Cfg → Tiltback → Strength |

---

## What To Do If You Feel a Nosedive Coming

1. **Shift weight back** - Get off the front foot
2. **Bend knees** - Lower center of gravity
3. **Don't panic brake** - Sudden braking can make it worse
4. **Run it out if possible** - If nose touches, try to run forward
5. **Roll, don't catch** - If you fall, tuck and roll, don't put hands out

---

## Summary: The 5 Rules of Nosedive Prevention

1. **Set tiltback_duty to 80% or lower** - This is your primary protection
2. **Respect all warnings** - Tiltback and buzz mean SLOW DOWN NOW
3. **Slow down as battery drains** - Low battery = less headroom
4. **Know your limits** - Hills, speed, and terrain all affect duty
5. **Watch the duty gauge** - If you have a display, monitor it

**Remember:** The board cannot break the laws of physics. When it runs out of power, it WILL nosedive. Your job is to never get there.

---

## References

- Source: `refloat/src/refloat.c` - Tiltback and surge parameters
- Source: `refloat/src/refloat.h` - Parameter definitions
- Related: `safety-critical-settings.md` - Comprehensive safety guide
- Related: `parameterDatabase.ts` - All Refloat parameters explained

---

*Last updated: 2026-01-14 | Optimized for RAG retrieval with explicit terms*
