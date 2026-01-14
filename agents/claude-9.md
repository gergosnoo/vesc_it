# Claude-9 Context

> **Role:** Knowledge Architect
> **Last Updated:** 2026-01-14 08:58
> **Session:** Active Content Creation - BMS & Beginner Guides

---

## 🌅 For Gergő When You Wake Up

### TL;DR

**I built all the educational content for the Onewheel Simulator.**

Two main files ready to use:
1. `src/lib/parameters/parameterDatabase.ts` - 11 parameters explained (QA approved)
2. `src/lib/learning/learningPaths.ts` - 3 learning paths, 14 lessons (~2000 lines)

Everything is pushed to GitHub. Waiting for claude-8 to build UI components.

---

## What I Created Today

### 1. Parameter Database (11 Parameters)

| # | Parameter | Why It's Important |
|---|-----------|-------------------|
| 1 | Tiltback Duty | Primary nosedive prevention |
| 2 | Kp | Main ride feel control |
| 3 | Kd | Smoothness/stability |
| 4 | Mahony Kp | Level tracking speed |
| 5 | Surge Duty Start | Hill protection |
| 6 | Tiltback Speed | Absolute speed limit |
| 7 | Startup Pitch Tolerance | How level to engage |
| 8 | Simple Stop ERPM | Dismount behavior |
| 9 | ATR Strength | Speed-based nose angle |
| 10 | Haptic Buzz Duty | Vibration warning |
| 11 | fault_adc_half_erpm | VESC 6.05 heel lift fix (QA added) |

Each parameter has:
- Plain English explanation
- "If you increase/decrease" cause-effect
- Safe ranges by skill level
- Related parameters
- Animation keys for simulator

### 2. Learning Paths (3 Paths, 14 Lessons)

**Path A: Complete Beginner** (15-20 min)
- What is VESC/Refloat
- How balance works (with duty cycle)
- Why nosedives happen (with scenarios)
- Your first safe tune
- Understanding warnings

**Path B: Stock Onewheel Rider** (12-15 min)
- VESC vs Stock differences
- Translating modes to settings
- Float → Refloat migration
- Safety for experienced riders

**Path C: Tuning Deep Dive** (25-30 min)
- PID theory (Kp, Kd explained simply)
- Mahony filter demystified
- ATR mastery
- Surge & Booster protection
- Creating your perfect tune

### 3. Connection Graph

Shows how parameters relate:
```
surge_duty_start ──must_be_less_than──► tiltback_duty
kp ──────────────────ratio────────────► kd (Kd ≈ Kp/10)
```

---

## What's NOT Done Yet

| Task | Owner | Status |
|------|-------|--------|
| Learning path UI | claude-8 | Not started |
| Parameter slider UI | claude-8 | Not started |
| Content QA review | claude-10 | ✅ APPROVED |

---

## Key Design Decisions

1. **Organize by user intent, not VESC menus**
   - "How It Feels" instead of "Refloat Cfg > Tune"
   - Users ask "how do I make it feel X" not "where is parameter Y"

2. **Cause-effect explanations**
   - Every parameter shows what happens if you increase/decrease
   - Real-world analogies (car steering, broom balancing)

3. **Progressive learning**
   - Beginners start with safety, not performance
   - Stock OW riders get translation, not basics
   - Deep dive for those who want to understand the math

---

## If I Crash - Continue Here

**Current state:** All content written and pushed. Waiting for UI.

**Key files:**
- `src/lib/parameters/parameterDatabase.ts`
- `src/lib/learning/learningPaths.ts`
- `thoughts/shared/plans/2026-01-14-onewheel-simulator-educational.md`

**Next steps:**
1. Claude-8 builds UI components
2. Claude-10 tests content clarity
3. Integration and polish

---

## Earlier Work (Still Live)

From overnight session:
- **Chatbot** → https://vesc-it.vercel.app (working!)
- **Troubleshooting Wizard** → /troubleshoot (5 flows)
- **Safety Visualizer** → /safety (nosedive risk gauge)
- **Parameter Playground** → /playground (sliders)

---

## QA Improvements Implemented

Based on claude-10's review:
1. Added `fault_adc_half_erpm` parameter (#11) - critical for VESC 6.05 heel lift fix
2. Added BMS bypass safety section in Learning Path A (Understanding Warnings lesson)

---

## New Content Created (08:58)

### vesc-bms-configuration-guide.md (~350 lines)
Deep-dive into vesc_bms_fw repo. Covers:
- Cell balancing modes and parameters
- Charge control configuration
- CAN bus integration with motor controller
- Distributed balancing for multi-BMS setups
- Fault codes and troubleshooting
- BMS bypass for Onewheels (charge-only method)

### vesc-beginner-settings-guide.md (~400 lines)
Most common beginner confusions. Covers:
- Motor Amps vs Battery Amps (THE #1 question)
- How to calculate battery limits from cell specs
- Voltage cutoff settings by cell chemistry
- Temperature limits
- PPM/throttle calibration
- Safe starting defaults for esk8, Onewheel, e-bike
- Common beginner mistakes and fixes

---

## If I Crash - Continue Here

**Current state:** Active content creation. Two new KB docs written.

**Key files created:**
- `knowledge-base/vesc-bms-configuration-guide.md`
- `knowledge-base/vesc-beginner-settings-guide.md`

**Next steps:**
1. Notify claude-8 to re-embed knowledge base
2. Claude-10 to test new content against user questions
3. Continue writing if more gaps identified

---

*Session updated 08:58 | Actively writing new knowledge base content*
