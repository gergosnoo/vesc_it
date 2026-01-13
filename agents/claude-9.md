# Claude-9 Context

> **Role:** Knowledge Architect
> **Last Updated:** 2026-01-13 23:58

## Current Focus
- ✅ ALL KB CONTENT COMPLETE
- ✅ Passed claude-10's testing gate (10/10 real user questions)
- Standing by for embedding phase

## Blockers & Pending
- None - KB ready for embedding
- Waiting on claude-8's embedding pipeline

## Key Learnings
Technical insights from source code analysis:

**Safety-Critical:**
- `fault_adc_half_erpm` controls heel lift at speed - set to 0 for consistent behavior
- BMS B- bridge method DISABLES overcharge protection = fire risk
- UBox controllers have aggressive thermal cutoffs - adjust MOSFET temp limits
- iOS apps may silently fail saves - always verify via reconnect

**Source Code Patterns:**
- `motor_data.h:55-58`: current_max/min determine nosedive threshold
- `state.h:46-58`: SAT enum gaps intentional for "classes" (normal/warning/error)
- `conf/datatypes.h:226`: fault_adc_half_erpm changed in 6.05
- VESC 6.05 uses per-cell voltage, not total pack

## Content Status
ALL COMPLETE - 14 documents, 3,967 lines:

| Doc | Lines | Status |
|-----|-------|--------|
| safety-critical-settings.md | 462 | ✅ 10/10 tests |
| motor-detection-troubleshooting.md | ~285 | ✅ Verified |
| foc-advanced-tuning-guide.md | ~276 | ✅ Verified |
| can-bus-multi-vesc-setup.md | ~283 | ✅ Verified |
| vesc-express-wifi-ble-setup.md | ~265 | ✅ Verified |
| refloat-migration-guide.md | ~200 | ✅ Verified |
| mahony-kp-auto-migration.md | ~191 | ✅ Verified |
| led-configuration-troubleshooting.md | ~247 | ✅ Verified |
| refloat-setpoint-adjustment-types.md | ~209 | ✅ Verified |
| refloat-hidden-modes.md | ~226 | ✅ Verified |
| vesc-tool-motor-wizard.md | ~265 | ✅ Verified |
| + 3 more docs | ~1000 | ✅ Verified |

## For Gergő When He Wakes

**What's Ready:**
- 14 knowledge base documents covering ALL 6 VESC repos
- All verified against source code with file:line references
- Passed 60+ test cases from claude-10
- Safety-critical content covers nosedives, BMS bypass, 6.05 issues

**What's Next:**
- Claude-8 building embedding pipeline (Supabase done)
- Once embedded, chatbot will be testable
- Check qa/TESTING.md for test instructions

## If I Crash - Continue Here
**Current state:** KB COMPLETE, waiting for embedding

**Next action if continuing:**
- Support embedding phase if issues arise
- Handle any new gap requests from claude-10
- Assist with chatbot testing

---
*KB approved by testing gate at 23:58*
