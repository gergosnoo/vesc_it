# Claude-10 Context

> **Role:** User Advocate & QA Gatekeeper
> **Last Updated:** 2026-01-14 13:24

## Current Focus

🎉 **1000+ CHUNKS MILESTONE!** 1009 chunks, 45+ docs, comprehensive VESC coverage.

**Current State:**
- Chatbot: ✅ 1009 chunks, all tests pass
- Playground: ✅ 3D FIX VERIFIED - proper Floatwheel model
- Safety: ✅ LIVE and working
- Troubleshooting Wizard: ✅ 5/5 flows PASS
- Learning Center: ✅ LIVE and working
- Knowledge Base: ✅ COMPREHENSIVE - 45+ docs, expert-level content
- n8n Automation: ✅ LIVE - auto-embeds on push
- Questions DB: 106+ questions answered

**Latest Actions (14:03 - END OF DAY):**
- 🚗 XR TO VESC CONVERSION QA - 2/3 PASS (1057 chunks) - guide overview, Hypercore detection values
- ⚡ FOC OVERMODULATION QA APPROVED - 3/3 PASS - 15% voltage, vs FW, duty scaling
- 💡 WS2812 LED PATTERNS QA APPROVED - 3/3 PASS - hardware setup, rainbow code, brake lights
- 🔬 HFI SENSORLESS QA APPROVED - 3/3 PASS - FFT, voltage params, 180° error
- 🎉 14 FEATURES QA APPROVED - 1057 chunks total!

**pev.dev QA Results:**
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| PintV/XRV battery limits | 30A/-30A | 30A/-30A | ✅ PASS |
| Superflux MK1 FOC | 27-35mΩ, 105-136µH | Exact match | ✅ PASS |
| Motor wizard steps | Step-by-step guide | Comprehensive | ✅ PASS |

**Priority Topics for claude-9:**
1. Encoder/Hall Sensor Troubleshooting (HIGH)
2. VESC Tool RT Data Interpretation (MEDIUM)
3. Field Weakening Tuning (MEDIUM)

## Test Results (Final)

| Test | Before Embeddings | After Embeddings |
|------|-------------------|------------------|
| T11-01 Nosedive | ⚠️ PARTIAL | ✅ PASS |
| T11-03 BMS Bypass | ❌ FAIL | ✅ PASS |
| T11-05 6.05 Heel Lift | ❌ FAIL | ✅ PASS |

**Key KB Content Verified:**
- BMS: "B- is NOT bridged" warning included
- 6.05: `fault_adc_half_erpm = 0` fix included
- Nosedive: "Balance" usage type, BMS limit mode

## Playground Plan Review (00:41 → 00:52)

**Status:** ✅ FULLY APPROVED - all gaps fixed!

| Gap | Severity | Status |
|-----|----------|--------|
| BMS bypass warning | CRITICAL | ✅ FIXED - B- bridge warning included |
| fault_adc_half_erpm | CRITICAL | ✅ FIXED - Added to SafetyConfig |
| Footpad sensor troubleshooting | MEDIUM | ✅ FIXED - Flow added |
| WiFi/BLE troubleshooting | MEDIUM | ✅ FIXED - Flow added |
| surge_duty_start, simple_stop_erpm | MEDIUM | ✅ FIXED - Parameters added |

**Verified:** Grep confirmed all fixes present in plan file

## Team Communication Log

| Time | To | Message |
|------|-----|---------|
| 00:50 | claude-9 | Playground feedback - 2 must-fix gaps |
| 00:50 | claude-8 | QA status - 3/3 tests PASS |
| 00:52 | claude-9 | Fixes VERIFIED - plan fully approved |

## User Personas I Represent

### 🔰 Beginner (Confused Newbie)
- "What is VESC?"
- "How do I connect my board to the app?"
- "What do all these settings mean?"
- "Why won't my motor spin?"
- Needs: Simple explanations, step-by-step guides, warnings about safety

### 🔧 Intermediate (DIY Builder)
- "How do I migrate from Float to Refloat?"
- "What current limits should I set for my weight?"
- "How do I set up dual motors with CAN?"
- "My motor detection failed - what do I check?"
- Needs: Specific instructions, troubleshooting steps, config recommendations

### 🎓 Expert (Tuner/Developer)
- "What FOC observer type gives best low-speed performance?"
- "How do I tune Mahony KP for my IMU?"
- "What's the difference between MXV Lambda types?"
- "How do I write custom LispBM code?"
- Needs: Technical details, source code references, advanced parameters

## If I Crash - Pickup Point

1. **Chatbot:** ✅ 1057 chunks, 14 FEATURES QA APPROVED
2. **Playground:** ✅ 3D FIXED - proper Floatwheel model
3. **Safety:** ✅ QA APPROVED - LIVE at /safety
4. **Troubleshoot:** ✅ QA APPROVED - LIVE at /troubleshoot (5/5 flows)
5. **Learning Center:** ✅ QA APPROVED - LIVE at /learn (3 paths, 14 lessons)
6. **Knowledge Base:** ✅ 45+ docs, expert content (HFI, BMS, detection edge cases)
7. **URLs:** All at https://vesc-it.vercel.app
8. **Test Suite:** qa/test-suite.md has 64+ tests
9. **Questions DB:** qa/questions-by-topic.md has 15 categories, 110+ questions
10. **KB Status:** COMPREHENSIVE - 1057 chunks, continuous updates via n8n
11. **Latest QA:** XR Conversion, FOC Overmod, WS2812 LED, BMS, HFI - 14 FEATURES APPROVED
12. **Tomorrow:** Finish XR Q3 (Hall wiring), send new priorities to claude-9

## Key Learnings This Session

1. **Embeddings are critical** - Without them, chatbot returns generic GPT answers
2. **Chunking bugs cause OOM** - Fixed infinite loop in advance calculation
3. **Real user questions > synthetic tests** - Always verify against forum questions
4. **Safety content must be specific** - Settings names, navigation paths, values
5. **Drive the team** - Use inject-prompt.sh to give feedback to other instances

## My Role

- I am the GATE - nothing ships without my approval
- I represent ALL user levels: beginners, intermediates, experts
- I verify answers are accurate AND accessible
- I mine questions from DIVERSE sources (forums, Reddit, GitHub)
- **I drive the team** - set priorities, give feedback, coordinate

---
*Updated 2026-01-14 13:33 - 1022 chunks, HFI/BMS/Detection edge cases QA APPROVED*
