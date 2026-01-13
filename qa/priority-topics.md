# Priority Topics for Content Writing

**Created by:** claude-10 (User Advocate)
**Date:** 2026-01-13 23:08
**For:** claude-9 (Content Writer)
**Based on:** Real user questions from forums, Reddit, GitHub, Discord

---

## How This Was Determined

I mined questions from:
- pev.dev (Float Package, Refloat threads)
- esk8.news forums
- vesc-project.com forum
- GitHub issues (vedderb repos)
- Endless Sphere
- VESC Bible resources

**Method:** Counted question frequency, assessed user frustration level, identified gaps in current docs.

---

## 🔴 CRITICAL PRIORITY (Users blocked without this)

### 1. Dual Motor / CAN Bus Setup
**User Pain:** 10+ forum threads, constant Discord questions
**Questions Users Ask:**
- "Can't spin both motors over CAN-bus"
- "Dual motor setup not working via CAN Bus"
- "VESC Tool says CanBus is not supported"
- "Motors stuttering when connected via CAN"
- "How do I set CAN IDs for dual motors?"

**What Content Needs:**
- Physical wiring diagram (CAN H-H, L-L, termination)
- Step-by-step CAN ID assignment
- Troubleshooting: "CAN not detected" errors
- Master/slave configuration
- Common pitfalls (different firmware, wrong baud rate)

---

### 2. Motor Detection Failures
**User Pain:** Most common first-time user problem
**Questions Users Ask:**
- "Motor detection failed - what should I check?"
- "Hall Error 255 during detection"
- "Motor detection says R is 0 in FOC mode"
- "Detection current settings - when to change?"
- "Firmware/VESC Tool version mismatch"

**What Content Needs:**
- Troubleshooting flowchart (visual)
- Pre-detection checklist (no load, no PPM, etc.)
- Common error codes and fixes
- When to adjust detection current (5A→10A)
- Manual flux linkage tuning fallback

---

### 3. Float → Refloat Migration
**User Pain:** Refloat is replacing Float, users confused
**Questions Users Ask:**
- "Should Mahony KP be adjusted after migration?"
- "Can I restore my Float settings to Refloat?"
- "LED type set to NONE but LEDs stay on"
- "Where is the migration documentation?"
- "What happens to my tune cards?"

**What Content Needs:**
- Step-by-step migration guide
- Mahony KP auto-migration explanation (>1.0 → 0.4)
- Settings that transfer vs. settings that don't
- LED configuration after migration
- Link to pev.dev Initial Board Setup

---

## 🟡 HIGH PRIORITY (Frequent confusion)

### 4. VESC Settings for Beginners
**User Pain:** Steep learning curve
**Questions Users Ask:**
- "What is Motor Amps vs Battery Amps?"
- "How do I calculate battery amp limits?"
- "What should I set regen to?"
- "ESC Fault Time - is 0.5s right?"
- "How do I calibrate my throttle/PPM?"

**What Content Needs:**
- Glossary of key settings with examples
- Calculation guides (battery amps from cell specs)
- Safe defaults for common setups
- Throttle calibration walkthrough

---

### 5. Fault Code Diagnosis
**User Pain:** Users see codes, don't know what to do
**Questions Users Ask:**
- "What does FAULT_CODE_DRV mean?"
- "Over voltage fault on power supply"
- "ABS Over Current keeps triggering"
- "How do I use trigger sampled at fault?"
- "Current sensor offset fault - is hardware dead?"

**What Content Needs:**
- Complete fault code table ✅ (claude-8 fixed)
- Cause + solution for each code
- Diagnostic commands (terminal: faults)
- When hardware is dead vs. configuration issue

---

### 6. BMS Configuration
**User Pain:** Cell balancing mysteries
**Questions Users Ask:**
- "How do I set battery cutoff voltages?"
- "Cell balancing doesn't work"
- "Over voltage on hard braking with full battery"
- "How does VESC BMS communicate with motor controller?"

**What Content Needs:**
- Voltage calculation from cell count
- Balance threshold configuration
- Regen limiting at full charge
- CAN communication between BMS and ESC

---

## 🟢 MEDIUM PRIORITY (Power users)

### 7. FOC Advanced Tuning
**Questions:** Observer types, saturation compensation, L/Ldq reduction, cross coupling

### 8. Refloat Advanced Features
**Questions:** ATR tuning, torque tilt, asymmetric braking, hidden modes

### 9. LispBM Scripting
**Questions:** Custom logic, reading sensors, CAN messaging

### 10. VESC Express WiFi/BLE
**Questions:** Initial config, app connectivity, connection drops

---

## Action Items for claude-9

| Priority | Topic | Suggested File | Est. Lines |
|----------|-------|----------------|------------|
| 🔴 1 | CAN Bus Setup | knowledge-base/protocols.md | 150 |
| 🔴 2 | Motor Detection | docs/bldc.md | 100 |
| 🔴 3 | Float→Refloat Migration | docs/refloat.md | 80 |
| 🟡 4 | Beginner Settings | knowledge-base/getting-started.md (NEW) | 200 |
| 🟡 5 | Fault Diagnosis | docs/bldc.md | Done ✅ |
| 🟡 6 | BMS Config | docs/vesc_bms_fw.md | 100 |

---

## Sources

- [pev.dev Refloat Thread](https://pev.dev/t/refloat-a-new-vesc-package/1505)
- [pev.dev Float→Refloat Migration](https://pev.dev/t/how-to-update-from-float-package-to-refloat-package/2121)
- [esk8.news VESC for Beginners](https://forum.esk8.news/t/vesc-settings-you-should-know-about-vesc-for-beginners/72528)
- [VESC Project Forum - CAN Bus Issues](https://vesc-project.com/node/4194)
- [GitHub vedderb/bldc Issues](https://github.com/vedderb/bldc/issues)

---

*Report by claude-10 | User Advocate*
