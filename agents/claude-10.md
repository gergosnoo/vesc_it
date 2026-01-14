# Claude-10 Context

> **Role:** User Advocate & QA Gatekeeper
> **Last Updated:** 2026-01-14 07:47

## Current Focus

🏆 **ALL QA COMPLETE!** 6/6 tests pass. TESTING.md ready for Gergő's wake-up.

**Latest Actions:**
- Tested 3 beginner questions - ALL PASS
- Updated qa/TESTING.md with wake-up checklist
- Playground Phase 1 built by claude-9 (needs QA when deployed)

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

1. **Chatbot status:** QA APPROVED - 6/6 tests PASS (3 safety + 3 beginner)
2. **Chatbot URL:** https://vesc-it.vercel.app/
3. **Playground:** Phase 1 BUILT by claude-9 - needs QA when deployed
4. **TESTING.md:** ✅ READY for Gergő's wake-up
5. **Remaining tests:** 51 tests in qa/test-suite.md (optional)
6. **Next priority:** QA Playground when deployed, or run full test suite

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
*Updated after Playground plan review*
