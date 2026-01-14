# VESC Hardware-Specific Guides

## Overview

This guide covers the most popular VESC-compatible controllers, their specifications, recommended settings, and known issues. All specifications are verified against official firmware hardware definitions.

**Note:** Limits shown are **hardware limits** from firmware. Actual safe operating limits depend on your cooling, ambient temperature, and usage patterns.

---

## Quick Comparison Table

| Controller | Motor Amps | Battery Amps | Voltage | Best For |
|------------|------------|--------------|---------|----------|
| UBOX 75V | ±135A | ±135A | 75V | Onewheel, esk8 |
| UBOX 100V | ±150-300A | ±150-300A | 100V | High power Onewheel |
| FSESC 75/100 | ±120A | ±120A | 75V | Budget esk8 |
| FSESC 75/300 | ±400A | ±400A | 75V | High power esk8 |
| Little FOCer V3 | ±150A | ±100A | 60V | DIY Onewheel |
| Little FOCer V4 | ±250A | ±100A | 75V | DIY Onewheel |
| Stormcore 60D | ±150A | ±120A | 60V | Dual motor esk8 |
| Stormcore 100D | ±150-300A | ±100A | 100V | High power builds |

---

## UBOX Controllers

### UBOX 75V

**Source:** `hwconf/Ubox/75v/hw_ubox_75_core.h`

**Variants:**
- UBOX_V1_75_MICRO
- UBOX_V1_75_TYPEC
- UBOX_V2_75
- UBOX_SINGLE_75

**Hardware Limits:**
| Parameter | Limit |
|-----------|-------|
| Motor Current | ±135A |
| Battery Current | ±135A |
| Absolute Current | 180A |
| Max Voltage | 75V |

**Recommended Settings for Onewheel (20S):**
| Parameter | Value | Why |
|-----------|-------|-----|
| Motor Current Max | 80-100A | Balance of torque and heat |
| Motor Current Min | -80A | Regenerative braking |
| Battery Current Max | 30-40A | Cell protection |
| Battery Current Min | -15A | Regen into battery |
| Tiltback Duty | 0.80-0.85 | Safety margin |

**Known Issues:**

1. **Field Weakening Auto-Shutdown**
   - Some UBOX units shut down when field weakening is enabled
   - **Fix:** Disable field weakening or update firmware

2. **Heat Management**
   - Enclosed design can trap heat
   - **Fix:** Add thermal paste, ensure good case contact, consider venting

3. **DRV Faults on Startup**
   - Occasional DRV faults when powering on
   - **Fix:** Check phase wires, ensure clean power supply

---

### UBOX 100V

**Source:** `hwconf/Ubox/100v/hw_ubox_100_core.h`

**Variants:**
- UBOX_V2_100 (dual): ±300A motor, 420A abs
- UBOX_SINGLE_100: ±150A motor, 210A abs
- UBOX_SINGLE_80: ±135A motor, 180A abs

**Hardware Limits (V2 Dual):**
| Parameter | Limit |
|-----------|-------|
| Motor Current | ±300A |
| Battery Current | ±300A |
| Absolute Current | 420A |
| Max Voltage | 100V |

**Recommended Settings for High-Power Onewheel:**
| Parameter | Value |
|-----------|-------|
| Motor Current Max | 100-150A |
| Motor Current Min | -100A |
| Battery Current Max | 40-60A |
| Battery Current Min | -20A |

**High Voltage Considerations:**
- 100V systems can run 24S batteries (20S with headroom)
- Higher voltage = lower current for same power = less heat
- BUT: Regen overvoltage risk increases - set limits carefully!

---

### UBOX 126V

**Source:** `hwconf/Ubox/126v/hw_ubox_126_core.h`

**Variants:**
- UBOX_126_160: ±240A motor
- UBOX_126_100: ±150A motor

**Hardware Limits (160A model):**
| Parameter | Limit |
|-----------|-------|
| Motor Current | ±240A |
| Battery Current | ±240A |
| Absolute Current | 290A |
| Max Voltage | 126V |

**Use Case:** Extreme high-voltage builds (30S batteries)

---

## Flipsky FSESC Controllers

### FSESC 75/100 (V1 and V2)

**Source:** `hwconf/flipsky/hw_75_100.h`, `hw_75_100_V2.h`

**Hardware Limits:**
| Parameter | V1 | V2 |
|-----------|-------|-------|
| Motor Current | ±120A | ±120A |
| Battery Current | ±120A | ±120A |
| Absolute Current | 160A | 200A |
| Max Voltage | 75V | 75V |

**Good For:**
- Budget electric skateboards
- Medium power builds
- Beginners learning VESC

**Recommended Settings (12S esk8):**
| Parameter | Value |
|-----------|-------|
| Motor Current Max | 60-80A |
| Motor Current Min | -60A |
| Battery Current Max | 40-50A |
| Battery Current Min | -20A |

**Known Issues:**

1. **Quality Variance**
   - Early units had quality control issues
   - **V2 is significantly better** than V1
   - Buy from reputable sellers

2. **Current Sensor Accuracy**
   - Some units have current sensor drift
   - **Fix:** Calibrate current offset in VESC Tool

3. **Limited Cooling**
   - Heatsink design can be inadequate for sustained load
   - **Fix:** Add external heatsink or limit current

---

### FSESC 75/200 ALU

**Source:** `hwconf/flipsky/hw_fsesc_75_200_alu.h`

**Hardware Limits:**
| Parameter | Limit |
|-----------|-------|
| Motor Current | ±300A |
| Battery Current | ±280A |
| Absolute Current | 450A |
| Max Voltage | 75V |

**Better Cooling:** Aluminum case improves heat dissipation.

**Recommended For:**
- High-power electric skateboards
- DIY EUC builds
- Applications needing sustained high current

---

### FSESC 75/300

**Source:** `hwconf/flipsky/hw_fsesc_75_300.h`

**Hardware Limits:**
| Parameter | Limit |
|-----------|-------|
| Motor Current | ±400A |
| Battery Current | ±400A |
| Absolute Current | 480A |
| Max Voltage | 75V |

**Top-Tier Flipsky:** Their highest current rating. Good for powerful e-bikes and high-power builds.

---

## Little FOCer (Shaman)

### Little FOCer V3 / V3.1

**Source:** `hwconf/shaman/Little_FOCer/hw_Little_FOCer_core.h`

**Key Terms:** Little FOCer, LittleFOCer, LF V3, Little FOCer V3 current limits, Little FOCer V3 specs

#### Little FOCer V3 Current Limits (Hardware Maximum)

The Little FOCer V3 has the following **hardware limits** (absolute maximum the controller can handle):

- **Motor Current Limit:** ±150A (standard) or ±250A (extended firmware)
- **Battery Current Limit:** ±100A
- **Absolute Current Limit:** 175A (standard) or 350A (extended)
- **Maximum Voltage:** 60V (limits to 16S batteries)

| Parameter | Standard | Extended |
|-----------|----------|----------|
| Motor Current | ±150A | ±250A |
| Battery Current | ±100A | ±100A |
| Absolute Current | 175A | 350A |
| Max Voltage | 60V | 60V |

**IMPORTANT:** Hardware limits are NOT recommended operating limits! For reliable operation, set your current limits to 70-80% of hardware maximum.

**Most Popular Onewheel Controller!**

**Why Little FOCer for Onewheels:**
- Compact size fits in OW hub
- Reasonable current handling
- Open source hardware
- Active community support
- Lower cost than UBOX

#### Little FOCer V3 Recommended Settings (Safe Operating Range)

For Onewheel use with 16S battery, these **recommended settings** provide good performance while staying well within hardware limits:

| Parameter | Recommended Value | Hardware Max |
|-----------|-------------------|--------------|
| Motor Current Max | 60-80A | 150A |
| Motor Current Min | -60A | -150A |
| Battery Current Max | 25-35A | 100A |
| Battery Current Min | -12A | -100A |
| Tiltback Duty | 0.80 | - |

**Why not use hardware limits?** Running at maximum current generates excessive heat and reduces lifespan. The recommended 60-80A motor current provides excellent torque while keeping the controller cool.

**Known Issues:**

1. **Voltage Limit (60V)**
   - Cannot run 20S batteries (max ~16S)
   - For higher voltage, use Little FOCer V4 or UBOX

2. **Heat Sensitive**
   - Small form factor = limited thermal mass
   - **Fix:** Good thermal interface to hub/enclosure, reduce current if overheating

3. **Current Sensor Position**
   - V3.0 had current sensing issues
   - **V3.1 fixed this** - prefer V3.1

---

### Little FOCer V4

**Source:** `hwconf/shaman/Little_FOCer_4/hw_Little_FOCer_V4.h`

**Hardware Limits:**
| Parameter | Limit |
|-----------|-------|
| Motor Current | ±250A |
| Battery Current | ±100A |
| Absolute Current | 350A |
| Max Voltage | 75V |

**Upgrade from V3:**
- Higher voltage (75V vs 60V) - can run 20S!
- Higher motor current capability
- Improved thermal design

**Recommended for:** Modern DIY Onewheels with 20S batteries

---

## Stormcore Controllers

### Stormcore 60D

**Source:** `hwconf/stormcore/60D/hw_stormcore_60d_core.h`

**Variants:**
- STORMCORE_60D (standard)
- STORMCORE_60Dxs
- STORMCORE_60D+ (enhanced)

**Hardware Limits:**
| Parameter | Limit |
|-----------|-------|
| Motor Current | ±150A |
| Battery Current | ±120A |
| Absolute Current | 200A |
| Max Voltage | 60V |

**Dual Motor ESC:** Two motors on one board!

**Good For:**
- Dual motor electric skateboards
- Compact builds needing dual drive
- 12S configurations

**Recommended Dual Motor Settings (12S):**
| Parameter | Per Motor |
|-----------|-----------|
| Motor Current Max | 60A |
| Motor Current Min | -50A |
| Battery Current Max | 40A |
| Battery Current Min | -15A |

---

### Stormcore 100D

**Source:** `hwconf/stormcore/100D/hw_stormcore_100d_core.h`

**Variants:**
- STORMCORE_100D (single): ±150A motor
- STORMCORE_100D_PARALLEL: ±300A motor
- STORMCORE_100D_V2: Enhanced version
- STORMCORE_100DX: Extended features

**Hardware Limits (Parallel Mode):**
| Parameter | Limit |
|-----------|-------|
| Motor Current | ±300A |
| Battery Current | ±100A (per motor side) |
| Absolute Current | 400A |
| Max Voltage | 100V |

**High Voltage Dual:** Supports up to 24S batteries with dual motor control.

---

## MakerX Go-FOC Series

### Go-FOC M100

**Source:** `hwconf/makerx/hw_go_foc_m100.h`

**Hardware Limits:**
| Parameter | Limit |
|-----------|-------|
| Motor Current | ±120A |
| Battery Current | ±120A |
| Absolute Current | 160A |

**Entry-level MakerX** - Similar specs to FSESC 75/100.

---

### Go-FOC G300

**Source:** `hwconf/makerx/hw_go_foc_g300.h`

**Hardware Limits:**
| Parameter | Limit |
|-----------|-------|
| Motor Current | ±500A |
| Battery Current | ±400A |
| Absolute Current | 650A |

**High Power Monster:** For extreme builds only.

---

### Go-FOC HI200 / HV200

**Source:** `hwconf/makerx/hw_go_foc_hi200.h`, `hw_go_foc_hv200.h`

| Model | Motor Amps | Battery Amps |
|-------|------------|--------------|
| HI200 | ±300A | ±300A |
| HV200 | ±200A | ±200A |

**Balanced Performance:** Good middle ground between power and size.

---

## Cheap FOCer 2

**Source:** `hwconf/shaman/Cheap_FOCer_2/hw_Cheap_FOCer_2_core.h`

**Hardware Limits:**
| Parameter | Limit |
|-----------|-------|
| Motor Current | ±120A |
| Battery Current | ±120A |
| Absolute Current | 160A |

**Budget Option:** Open source design, good for learning and low-power applications.

---

## Hardware Selection Guide

### For DIY Onewheel

| Battery | Recommended Controller |
|---------|----------------------|
| 16S | Little FOCer V3/V3.1 |
| 20S | Little FOCer V4, UBOX 75V |
| 20S+ High Power | UBOX 100V |

### For Electric Skateboard

| Motors | Power Level | Recommended |
|--------|-------------|-------------|
| Single | Budget | FSESC 75/100 |
| Single | Performance | FSESC 75/200 ALU |
| Dual | Budget | Stormcore 60D |
| Dual | Performance | Stormcore 100D |
| Dual | Extreme | Go-FOC G300 × 2 |

### For E-bike

| Use Case | Recommended |
|----------|-------------|
| Light commuter | Little FOCer V3 |
| Performance | UBOX 75V |
| High power | FSESC 75/300 |

---

## General Hardware Tips

### Thermal Management

1. **Use thermal paste** between VESC and heatsink/enclosure
2. **Ensure airflow** if possible
3. **Monitor temperatures** in VESC Tool realtime data
4. **Derate current limits** in hot environments

### Current Settings Philosophy

```
Motor Amps > Battery Amps (usually 1.5-2× higher)
```

**Why:** At low speeds (high torque demand), duty cycle is low, so motor can draw high current while battery current stays reasonable.

### Hardware Limit vs Safe Limit

Hardware limits in firmware are **absolute maximums**. For reliable operation:

```
Safe limit ≈ 70-80% of hardware limit
```

**Example:** UBOX 75V has 135A hardware limit → Run at 100-110A for reliability.

---

## Troubleshooting by Controller

### UBOX Specific

| Issue | Cause | Fix |
|-------|-------|-----|
| Random shutdown | Field weakening | Disable FW |
| Hot enclosure | Poor thermal contact | Reapply thermal paste |
| DRV on startup | Phase wire issue | Check connections |

### FSESC Specific

| Issue | Cause | Fix |
|-------|-------|-----|
| Current reading wrong | Sensor drift | Calibrate offset |
| Overheating | Inadequate cooling | Add heatsink |
| Inconsistent behavior | Quality variance | May need replacement |

### Little FOCer Specific

| Issue | Cause | Fix |
|-------|-------|-----|
| Overtemp at low current | Poor mounting | Improve thermal interface |
| Faults at 60V+ | Voltage limit | Use V4 or UBOX |
| Noisy operation | V3.0 sensor issue | Upgrade to V3.1 |

---

## References

- Source: `bldc/hwconf/Ubox/` - UBOX hardware definitions
- Source: `bldc/hwconf/flipsky/` - Flipsky FSESC definitions
- Source: `bldc/hwconf/shaman/` - Little FOCer, Cheap FOCer definitions
- Source: `bldc/hwconf/stormcore/` - Stormcore definitions
- Source: `bldc/hwconf/makerx/` - MakerX Go-FOC definitions

---

*Last updated: 2026-01-14 | Source verified against bldc repository*
