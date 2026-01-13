# Claude-10 Context

> **Role:** User Advocate & QA Gatekeeper
> **Last Updated:** 2026-01-13 23:55

## Current Focus
Being the GATE. Rejected safety content that passed synthetic tests but failed real user questions.

## Blockers & Pending
- Waiting for claude-9 to fix 5 safety content gaps
- Waiting for user to add API keys to .env.local
- Will re-verify safety content after claude-9 fixes

## LESSON LEARNED
Synthetic tests (my T11-01 to T11-06) are too easy. REAL user questions from forums are the true test. Always verify against qa/questions-by-topic.md, not just my test-suite.md.

## Key Learnings

### Nosedive Causes (from shreddlabs.com, fallman.tech)
- Motor power exhaustion (can't maintain balance AND propel)
- BMS cutting power unexpectedly during discharge
- Low battery (<35% = reduced safe speed)
- Fighting pushback instead of respecting it
- Rapid acceleration, uphill, strong winds

### BMS Bypass Critical Info (from pev.dev)
- **OLD METHOD (BAD):** Bridging positive post disables overcharge protection
- **PROPER METHOD (GOOD):** Preserves charge protection while bypassing discharge
- Charge-only = BMS handles charging, discharge goes direct to VESC
- XR needs proper method, Pint may be simpler
- Popular BMS options: XLITE, ZBMS, VFBMS32 (official VESC)

### Motor Detection Issues (from esk8.news, electric-skateboard.builders)
- Temperature sensor showing wrong values (113°C idle)
- Wildly changing R/L values each detection run
- CAN bus issues with dual motor setups
- "Bad detection result received" = motor coughing

## Question Mining Status

| Source | Checked | Questions Found | Notes |
|--------|---------|-----------------|-------|
| pev.dev | ✅ | 15+ | Safety, migration, detection |
| vesc-project.com/forum | ✅ | 10+ | Fault codes, detection |
| esk8.news | ✅ | 12+ | Detection, dual motor |
| electric-skateboard.builders | ✅ | 8+ | Motor detection failures |
| shreddlabs.com | ✅ | 5 | Nosedive mechanics |
| fallman.tech | ✅ | 6 | VESC build info, BMS |
| r/ElectricSkateboarding | 🔲 | 0 | Search failed |
| r/onewheel | 🔲 | 0 | Search failed |
| GitHub issues | ✅ | 5+ | From earlier research |

## Top Priority Topics (sent to claude-9)
1. **GAP-11: Safety Critical** - Nosedives, BMS bypass, 6.05 warnings (URGENT)
2. Motor detection troubleshooting (DONE)
3. CAN bus multi-VESC setup (DONE)
4. Float → Refloat migration (DONE)

## Testing Status

| Component | Ready? | Tested? | Result | Notes |
|-----------|--------|---------|--------|-------|
| Knowledge Base | ✅ | ✅ | 13 docs, 3505 lines | claude-9 verified |
| Test Suite | ✅ | - | 54 tests ready | 48 runnable, 6 blocked |
| Supabase | 🔲 | | | claude-8 working |
| Embeddings | 🔲 | | | Blocked on Supabase |
| Chat UI | 🔲 | | | Blocked on embeddings |

## My Understanding of Role
- I am the GATE - nothing ships without my approval
- I represent real users, not synthetic tests
- I drive priorities for claude-9 based on real questions
- I actively push other agents via inject-prompt
- I mine questions from DIVERSE sources

## Sources for Safety Content (send to claude-9)
- https://shreddlabs.com/2019/07/12/nosedives/ (nosedive mechanics)
- https://fallman.tech/onewheel-vesc/ (BMS charge-only)
- https://pev.dev/t/guide-how-to-wire-fm-bms-as-charge-only-for-your-vesc/322
- https://pev.dev/t/pint-vesc-fm-bms-bypass-the-proper-way/693

## If I Crash - Continue Here
1. Read this file for context
2. Check qa/test-suite.md for 54 tests
3. Check qa/KNOWLEDGE-GAPS.md for GAP-11 status
4. Push claude-9 for safety content if not written
5. Check claude-8 for infrastructure ETA

---
*Update this file when your context shifts significantly, not on a rigid schedule.*
