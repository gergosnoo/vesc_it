# VESC Hardware Compatibility Guide

## Overview

**Key Terms:** VESC hardware, VESC versions, FOC compatible, clone VESC, FSESC, hardware limits, DRV8301, DRV8323S, which VESC, VESC 4.12, VESC 6, Little FOCer, StormCore

This guide explains VESC hardware versions, FOC compatibility, current/voltage limits, and warnings about clone controllers.

**Source:** bldc/hwconf/ - Hardware configuration files

---

## Quick Compatibility Table

| Hardware | FOC Support | Max Current | Max Voltage | Recommended For |
|----------|-------------|-------------|-------------|-----------------|
| VESC 4.12 | Yes (limited) | 50A cont | 57V | Light e-skate, learning |
| VESC 6.x | Yes (full) | 80-120A | 57V | Most applications |
| VESC 75/300 | Yes (full) | 300A+ | 72V | High power builds |
| Little FOCer | Yes (full) | 60-100A | 75V | Onewheel, quality clone |
| StormCore | Yes (full) | 60-100A | 60V | Premium alternative |
| FSESC 4.20 | Partial | 50A | 57V | Budget (with caution) |
| Generic clones | Varies | ? | ? | NOT recommended |

---

## Official VESC Hardware Versions

### VESC 4.12 (Legacy)

**Status:** Legacy design, still functional

**Specifications:**
```
Current Limit: -100A to +100A
Absolute Max: 150A
Voltage: 6V to 57V (nominal 48V)
Gate Driver: DRV8302
```

**Pros:**
- Proven design
- Well documented
- Many community resources

**Cons:**
- Older gate driver
- Lower current handling
- Less thermal headroom

**Best For:** Learning, light e-skate, budget builds

### VESC 6.x Series (Current Standard)

**Variants:** MK1, MK3, MK4, MK5, MK6, MK6_HP, MK6_MAX

**Specifications:**
```
Current Limit: -120A to +160A (varies by variant)
Absolute Max: 160A to 240A
Voltage: 6V to 57V (nominal 48V)
Gate Driver: DRV8301
```

**Key Differences by Variant:**

| Variant | Abs Max | Notes |
|---------|---------|-------|
| MK1-MK3 | 160A | Original design |
| MK4-MK5 | 180A | Improved thermals |
| MK6 | 200A | Latest revision |
| MK6_HP | 220A | High power variant |
| MK6_MAX | 240A | Maximum rating |

**Best For:** E-skate, e-bike, Onewheel, most DIY PEVs

### VESC 75/300 (High Power)

**Specifications:**
```
Current Limit: -400A to +400A
Absolute Max: 480A
Voltage: 11V to 72V (nominal 60V)
Gate Driver: Advanced (varies)
```

**Variants:** R1, R2, R3, MKIV

**Best For:** High power e-bikes, large motors, racing

---

## Quality Third-Party Hardware

### Little FOCer (Fungineers)

**Versions:** LF 3.0, LF 3.1, LF 4.0

**Specifications:**
```
LF 3.1:
- Current: 60A continuous
- Voltage: Up to 75V
- Gate Driver: DRV8301

LF 4.0:
- Current: 100A continuous
- Voltage: Up to 75V
- Gate Driver: DRV8323S
```

**Why Recommended:**
- Open source design
- Community supported
- Proper thermal design
- Used extensively in Onewheel community

### StormCore (Lacroix/Trampa Partner)

**Variants:** 60D, 100D, 100S

**Specifications:**
```
60D: Dual 60A, up to 60V
100D: Dual 100A, up to 60V
100S: Single 100A, up to 60V
Gate Driver: DRV8323S
```

**Why Recommended:**
- Premium build quality
- Excellent thermal management
- Professional support
- Integrated features (IMU, etc.)

### MakerX Controllers

**Variants:** HD60, HD75, DV4, DV6

**Good quality third-party option with proper VESC firmware support.**

---

## Gate Driver Chips Explained

The gate driver chip is critical for FOC performance and reliability.

### DRV8301 (Standard)

**Used in:** VESC 6.x, Little FOCer 3.x, many clones

**Features:**
- 12 fault detection flags
- Overcurrent per phase
- Overtemperature warning/shutdown
- Voltage monitoring

**Reliability:** Good, proven design

### DRV8323S (Premium)

**Used in:** Little FOCer 4, StormCore, HD series

**Features:**
- 27 fault detection flags
- VGS monitoring per phase
- Shoot-through protection
- Enhanced gate drive protection

**Reliability:** Excellent, best for demanding applications

### DRV8316 (Newest)

**Features:**
- Advanced fault detection
- Configurable OCP modes
- Buck converter OCP
- SPI fault reporting

**Reliability:** Excellent for newer designs

---

## Clone VESC Warnings

### FSESC (Flipsky) Controllers

**Reality Check:** FSESC controllers are NOT official VESC products. They use VESC firmware but hardware quality varies significantly.

#### FSESC 4.20 Issues

**Common Problems:**
1. **Thermal issues** - Inadequate heatsinking
2. **Component quality** - Lower grade MOSFETs
3. **Solder quality** - Cold joints, flux residue
4. **Current ratings** - Often overstated

**Real-world limits:**
```
Advertised: 50A continuous
Reality: 30-40A before thermal throttling
```

**If using FSESC 4.20:**
- Reduce current limits by 20-30%
- Add additional heatsinking
- Monitor temperatures closely
- Don't trust advertised ratings

#### FSESC 6.6 / 6.7

**Better than 4.20 but still:**
- Check for `HW_NO_ABS_MAX_CALC` flag (indicates non-standard limiting)
- Thermal design often inadequate
- QC inconsistent between batches

### Generic "VESC" Clones

**Red Flags:**
- No specific hardware config in bldc firmware
- Unknown gate driver chip
- No community documentation
- Suspiciously low prices

**Risks:**
- May not support FOC properly
- Current sensing may be inaccurate
- Fault protection may be incomplete
- No warranty or support

**Recommendation:** Avoid unless you can verify hardware against known good configs.

---

## FOC Compatibility Requirements

### What Hardware Needs for FOC

FOC (Field Oriented Control) requires:

1. **3-phase current sensing**
   - Look for `HW_HAS_3_SHUNTS` or `HW_HAS_PHASE_SHUNTS` in config

2. **Proper gate driver**
   - DRV8301, DRV8316, DRV8320S, or DRV8323S

3. **Sufficient processing power**
   - STM32F4 or better MCU

4. **Accurate voltage reference**
   - For proper current measurement

### FOC vs BLDC Mode

| Feature | FOC | BLDC |
|---------|-----|------|
| Efficiency | Higher | Lower |
| Smoothness | Better | Cogging possible |
| Low speed torque | Excellent | Poor |
| Hardware requirements | Higher | Lower |
| Tuning complexity | Higher | Lower |

**Recommendation:** Always use FOC if hardware supports it.

---

## Hardware Selection Guide

### For Onewheel / Self-Balancing

**Recommended:**
- Little FOCer 3.1 or 4.0
- StormCore 60D/100S
- VESC 6 MK5+

**Requirements:**
- 60A+ continuous current
- Fast control loop (important for balance)
- Good thermal management
- Reliable fault detection

### For E-Skateboard

**Recommended:**
- VESC 6.x (single or dual)
- StormCore 60D (dual)
- Flipsky Dual 6.6 Pro (budget)

**Requirements:**
- Dual motor support or two controllers
- CAN bus for synchronization
- 40A+ per motor

### For E-Bike

**Recommended:**
- VESC 6.x
- VESC 75/300 (high power)
- Any quality FOC controller

**Requirements:**
- Match motor voltage/current
- Consider integrated solutions
- Weatherproofing important

---

## Verifying Hardware Compatibility

### In VESC Tool

1. Connect to controller
2. Go to **Firmware** tab
3. Check **Hardware** dropdown
4. Verify your controller model is listed

### In Firmware

If your hardware isn't listed, it may:
- Be a clone without proper config
- Need community firmware
- Not be fully compatible

### Hardware Config Files

Check `/hwconf/` in bldc repository:
```
hwconf/
├── trampa/        # Official VESC (Trampa)
├── vesc/          # Official VESC variants
├── flipsky/       # Flipsky (clone)
├── flipsky_official/  # Flipsky "official"
├── stormcore/     # StormCore (quality 3rd party)
├── makerx/        # MakerX controllers
└── shaman/        # Various others
```

If your controller isn't here, **be cautious**.

---

## Troubleshooting Hardware Issues

### "Motor Detection Failed"

**Check:**
1. Gate driver working (VESC Tool → Realtime → DRV Faults)
2. Current sensing functional
3. Phase wires connected properly
4. Motor compatible with voltage

### Overheating

**Causes:**
1. Current limits too high for hardware
2. Inadequate heatsinking
3. Ambient temperature too high
4. Clone hardware with understated limits

**Fix:**
1. Reduce motor and battery current by 20%
2. Add heatsink/thermal pad
3. Improve airflow
4. Use conservative settings

### Random Faults

**Common with clones:**
1. Poor solder joints
2. Inadequate filtering
3. Noisy current sensing
4. Marginal component ratings

---

## Recommended Hardware by Budget

### Budget (~$50-80)

- FSESC 4.20 (with caution, reduce limits)
- Flipsky 4.12 (similar caveats)

**Note:** Budget options require more careful tuning and monitoring.

### Mid-Range (~$100-200)

- Little FOCer 3.1 (~$150)
- Flipsky 6.6 Pro (~$120)
- VESC 6 MK3/MK4 (~$180)

### Premium (~$200+)

- Little FOCer 4.0 (~$200)
- StormCore 60D (~$250)
- VESC 6 MK6 (~$280)
- VESC 75/300 (~$400+)

---

## References

- Source: `bldc/hwconf/` - All hardware configurations
- Source: `bldc/hwconf/drv8301.h` - DRV8301 driver
- Source: `bldc/hwconf/drv8323s.h` - DRV8323S driver
- Related: `vesc-beginner-settings-guide.md` - Safe starting settings
- Related: `conservative-beginner-settings.md` - First-time setup

---

*Last updated: 2026-01-14 | Source verified against bldc repository*
