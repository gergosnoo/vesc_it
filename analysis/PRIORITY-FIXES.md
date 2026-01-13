# Priority Fixes for Claude-8
**Created by:** Claude-9
**Date:** 2026-01-13 22:50
**Status:** 🔴 BLOCKING - Must fix before Phase 1

---

## Critical Issues (Must Fix NOW)

### 1. Fault Codes Table Incomplete
**File:** `docs/bldc.md:184-195`
**Severity:** HIGH
**Issue:** Only 7 fault codes listed, actually 30+ exist
**Impact:** AI chatbot can't diagnose 80% of hardware issues

**Fix Required:**
```markdown
## Fault Codes

| Code | Name | Cause |
|------|------|-------|
| 0 | None | No fault |
| 1 | Over Voltage | Input voltage too high |
| 2 | Under Voltage | Input voltage too low |
| 3 | DRV | Gate driver fault |
| 4 | Abs Over Current | Absolute overcurrent |
| 5 | Over Temp FET | MOSFET overtemperature |
| 6 | Over Temp Motor | Motor overtemperature |
| 7 | Gate Driver Over Voltage | Gate driver supply too high |
| 8 | Gate Driver Under Voltage | Gate driver supply too low |
| 9 | MCU Under Voltage | MCU voltage brownout |
| 10 | Watchdog Reset | System reset from watchdog |
| 11 | Encoder SPI | SPI encoder communication error |
| 12 | Encoder Sin/Cos Low | Sin/cos amplitude too low |
| 13 | Encoder Sin/Cos High | Sin/cos amplitude too high |
| 14 | Flash Corruption | Flash memory CRC error |
| 15-17 | Current Sensor Offset | Current sensor offset too high |
| 18 | Unbalanced Currents | Phase currents unbalanced |
| 19 | BRK | Brake resistor fault |
| 20-22 | Resolver Faults | Resolver LOT/DOS/LOS errors |
| 25 | Encoder No Magnet | Magnetic encoder lost magnet |
| 26 | Encoder Magnet Strong | Magnetic encoder field too strong |
| 27 | Phase Filter | Phase filter fault |
| 29 | LV Output Fault | Low voltage output fault |
```

**Source:** `bldc/datatypes.h:144-173`

---

### 2. FOC Observer Types Incomplete
**File:** `docs/bldc.md:42-47`
**Severity:** MEDIUM
**Issue:** Lists 5 types with vague "MXV variants", actually 7 distinct types

**Fix Required:**
```markdown
### FOC Observer Types

| Type | Enum Value | Description |
|------|------------|-------------|
| Ortega Original | 0 | Original Ortega observer |
| Mxlemming | 1 | Mxlemming improved observer |
| Ortega Lambda Comp | 2 | Ortega with lambda compensation |
| Mxlemming Lambda Comp | 3 | Mxlemming with lambda compensation |
| MXV | 4 | MXV observer |
| MXV Lambda Comp | 5 | MXV with lambda compensation |
| MXV Lambda Comp Lin | 6 | MXV with linear lambda compensation |
```

**Source:** `bldc/datatypes.h:128-134`

---

### 3. STM32L476 Clock Speed Error
**File:** `knowledge-base/architecture.md:78`
**Severity:** CRITICAL
**Issue:** Claims 168 MHz, actually 80 MHz max

**Fix Required:**
```diff
- │                   STM32L476 MCU (168 MHz)                       │
+ │                   STM32L476 MCU (80 MHz)                        │
```

---

### 4. Refloat Missing Features
**File:** `docs/refloat.md`
**Severity:** MEDIUM
**Issue:** Missing modes and parameters

**Add:**
- `mahony_kp_roll` parameter (separate from `mahony_kp`)
- MODE_HANDTEST (bench testing)
- MODE_FLYWHEEL (indoor training)
- Konami sequence system (hidden feature)
- Full SetpointAdjustmentType enum

---

## Verification Checklist

After fixes, claude-8 must:
- [ ] Update bldc.md with complete fault codes
- [ ] Update bldc.md with complete FOC observer types
- [ ] Fix architecture.md clock speed
- [ ] Update refloat.md with missing features
- [ ] Commit and push changes
- [ ] Send TTS + Telegram report
- [ ] Request re-review from Claude-9

---

## Timeline

**Expected:** 15-20 minutes to complete all fixes
**Blocking:** Phase 1 (Supabase) should NOT start until docs are accurate

---

*Created by Claude-9 | Observer Instance*
