# Knowledge Gaps Report

**Created by:** claude-10 (Knowledge Engineer & QA)
**Date:** 2026-01-13 22:57
**Purpose:** Identified gaps that will cause poor chatbot responses

---

## Executive Summary

After researching real user questions from VESC forums, Discord, and Reddit, I identified **10 knowledge gaps** in the current documentation. These are topics users frequently ask about that are NOT adequately covered in our knowledge base.

**Impact:** If left unaddressed, the AI chatbot will:
- Fail to answer ~40% of common beginner questions
- Give incomplete troubleshooting advice
- Miss critical migration/upgrade guidance

---

## Critical Gaps (Must Address Before Launch)

### GAP-01: Float to Refloat Migration Guide
**Severity:** HIGH
**File:** `docs/refloat.md`
**Evidence:** Multiple pev.dev users asking about migration (joeygiamportone, rene_the_hacker)

**Missing Content:**
- Step-by-step migration from Float 1.3/2.0 to Refloat
- What happens to Mahony KP values automatically
- Which settings transfer, which don't (e.g., LED type issues)
- Link to pev.dev Initial Board Setup guide

**User Question Examples:**
- "Should the Mahony KP value in App config be adjusted after migrating?"
- "Can settings be saved and restored after installing Refloat?"
- "Where is the migration documentation?"

---

### GAP-03: Motor Detection Troubleshooting Flowchart
**Severity:** HIGH
**File:** `docs/bldc.md`
**Evidence:** esk8.news, electric-skateboard.builders - 10+ threads on detection failures

**Missing Content:**
- Flowchart: Detection failed → Check these in order
- Common causes with solutions:
  - Load on motor
  - PPM/other inputs active
  - Hall sensor wiring (Error 255)
  - Current/D value adjustments
  - Firmware/VESC Tool version mismatch
- "R is 0" error specific fix
- When to increase detection current (5A → 10A)

**User Question Examples:**
- "Motor detection failed - what should I check first?"
- "I get 'Hall Error 255' during detection"
- "Detection says 'R is 0' in FOC mode"

---

### GAP-05: CAN Bus Multi-VESC Setup
**Severity:** HIGH
**File:** `knowledge-base/protocols.md`
**Evidence:** Repeated questions about connecting dual motors/multi-ESC setups

**Missing Content:**
- Physical wiring diagram (CAN H-H, L-L)
- CAN ID assignment for each VESC
- Baud rate configuration
- Status message broadcasting setup
- Master/slave configuration
- Common issues (termination resistors, noise)

**User Question Examples:**
- "How do I connect multiple VESCs via CAN?"
- "My dual motor setup loses sync"
- "CAN status messages not being received"

---

### GAP-10: VESC Express WiFi/BLE Setup Guide
**Severity:** HIGH
**File:** `docs/vesc_express.md`
**Evidence:** Connectivity issues are top complaints

**Missing Content:**
- Initial WiFi configuration steps (USB first)
- Network SSID/password setup in VESC Tool
- BLE pairing process
- Troubleshooting connection drops
- App compatibility (Floaty, Float Control)
- Factory reset procedure

**User Question Examples:**
- "VESC Express WiFi - how to configure network?"
- "BLE connection drops constantly on my phone"
- "Floaty app not seeing my board"

---

## Medium Priority Gaps

### GAP-02: LED Configuration Troubleshooting
**Severity:** MEDIUM
**File:** `docs/refloat.md`

**Missing Content:**
- LED type options explained (WS2812, SK6812, External, None)
- What happens when migrating LED settings from Float
- "LEDs stay on with type NONE" fix
- External LCM control setup

---

### GAP-04: FOC Advanced Tuning Guide
**Severity:** MEDIUM
**File:** `docs/bldc.md`

**Missing Content:**
- Observer type selection guide (when to use each)
- Saturation compensation explained
- Cross coupling (when to enable/disable)
- L/Ldq reduction technique
- Observer gain tuning at min duty
- Sensorless ERPM calculation

---

### GAP-08: Complete SetpointAdjustmentType Enum
**Severity:** MEDIUM
**File:** `docs/refloat.md`

**Missing Content:**
- Full list of adjustment types with descriptions
- When each type activates
- Interaction between types
- Tuning each independently

---

### GAP-09: Mahony KP Auto-Migration Behavior
**Severity:** MEDIUM
**File:** `docs/refloat.md`

**Missing Content:**
- Exact conditions for auto-migration (KP > 1.0)
- What values get set: KP=0.4, KI=0, Decay=0.1
- Why this is done (different IMU handling)
- Manual override options

---

## Low Priority Gaps

### GAP-06: MODE_HANDTEST / MODE_FLYWHEEL Documentation
**Severity:** LOW
**File:** `docs/refloat.md`

**Missing Content:**
- What these modes are for
- How to activate them
- Safety considerations

---

### GAP-07: Konami Sequence Documentation
**Severity:** LOW
**File:** `docs/refloat.md`

**Missing Content:**
- What sequences exist
- What they unlock
- Easter egg or actual feature?

---

## Recommended Actions for claude-8

| Priority | Gap | Action | Est. Effort |
|----------|-----|--------|-------------|
| 1 | GAP-01 | Add migration section to refloat.md | 15 min |
| 2 | GAP-03 | Add troubleshooting flowchart to bldc.md | 20 min |
| 3 | GAP-05 | Add CAN bus section to protocols.md | 20 min |
| 4 | GAP-10 | Expand vesc_express.md with setup guide | 15 min |
| 5 | GAP-04 | Add FOC tuning section to bldc.md | 15 min |
| 6 | GAP-02 | Add LED troubleshooting to refloat.md | 10 min |
| 7 | GAP-08/09 | Complete refloat.md setpoint docs | 10 min |
| 8 | GAP-06/07 | Add hidden features section | 5 min |

**Total estimated:** ~2 hours of documentation work

---

## Verification Process

After claude-8 addresses these gaps:
1. claude-10 will re-test questions against updated KB
2. Verify answers meet beginner/intermediate/expert needs
3. Update test-questions.md with PASS/FAIL status
4. Report final coverage percentage

---

*Report by claude-10 | Will notify claude-8 via inject-prompt*
