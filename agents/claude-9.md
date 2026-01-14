# Claude-9 Context

> **Role:** Knowledge Architect
> **Last Updated:** 2026-01-14 07:57
> **Session:** ACTIVE - Building Phase 3

---

## Current Focus

**PIVOT:** Onewheel Simulator & Educational Site

Working on educational content architecture for the simulator.

Built the full interactive troubleshooting wizard with:
- 5 comprehensive flows (Motor Detection, CAN Bus, BMS Bypass, Footpad, Nosedive Prevention)
- Interactive checklists with progress tracking
- 7 animated SVG diagrams
- Step navigation with history and back button
- Solution and escalation endpoints with helpful links

## What I Just Built

### Troubleshooting Wizard (`/troubleshoot`)

**Files created:**
- `src/app/troubleshoot/page.tsx` - Main flow selector
- `src/app/troubleshoot/[flowId]/page.tsx` - Dynamic wizard page
- `src/app/troubleshoot/data/types.ts` - TypeScript types
- `src/app/troubleshoot/data/flows.ts` - 5 complete troubleshooting flows (~800 lines)
- `src/app/troubleshoot/components/WizardStep.tsx` - Step renderer
- `src/app/troubleshoot/components/InteractiveChecklist.tsx` - Checkable items
- `src/app/troubleshoot/components/DiagramRenderer.tsx` - 7 SVG diagrams

**Flows included:**
1. Motor Detection Failed - Error codes, flux linkage, DRV errors
2. CAN Bus Not Working - Wiring, termination, multi-VESC
3. BMS Bypass Issues - CRITICAL safety content (B- bridge warning!)
4. Footpad Sensor Issues - Including 6.05 heel lift fix
5. Nosedive Prevention - Tiltback, duty cycle, safety settings

### What You Can Do Right Now

**Test the chatbot:**
```
Open https://vesc-it.vercel.app
Try: "How do I prevent nosedives?"
Try: "My motor detection is failing with error -10"
Try: "How do I set up BMS bypass safely?"
```

**Review the Playground plan:**
```
Read: thoughts/shared/plans/2026-01-14-vesc-playground.md
Decide: Do you want to build this next?
```

---

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Knowledge Base | ✅ Complete | 14 docs, 3,967 lines |
| Chatbot | ✅ Live | vesc-it.vercel.app |
| Playground Plan | ✅ Approved | Ready to build |
| Playground Build | 🔲 Not started | Waiting for your decision |

## What I Built

### Knowledge Base (14 documents)

| Priority | Document | What It Covers |
|----------|----------|----------------|
| 🔴 Critical | safety-critical-settings.md | Nosedive prevention, BMS bypass (WRONG vs RIGHT method), 6.05 warnings |
| 🟠 High | motor-detection-troubleshooting.md | Error codes, flux linkage issues, detection failures |
| 🟠 High | can-bus-multi-vesc-setup.md | Multi-VESC wiring, termination, CAN IDs |
| 🟠 High | vesc-express-wifi-ble-setup.md | WiFi modes, BLE pairing, app connectivity |
| 🟡 Medium | refloat-migration-guide.md | Float → Refloat upgrade path |
| 🟡 Medium | foc-advanced-tuning-guide.md | Observer types, current control, filtering |
| 🟡 Medium | All others... | LED, footpad, hidden modes, wizards |

### VESC Playground Plan

**The idea:** Instead of just text answers, show users what happens when they change settings.

**Three tools in one:**
1. **Parameter Playground** - Drag a slider, watch the 3D board respond
2. **Safety Visualizer** - See your nosedive risk in real-time as a gauge
3. **Troubleshooting Wizard** - Animated step-by-step guides

**Tech:** Next.js + Three.js + Framer Motion (same stack as chatbot, easy to integrate)

---

## Key Safety Insights

Things I learned that riders NEED to know:

| Issue | What Happens | The Fix |
|-------|--------------|---------|
| **BMS B- bridge** | Disables overcharge protection → fire risk | Use charge-only wiring instead |
| **fault_adc_half_erpm** | Heel lift stops working at speed after 6.05 | Set to 0 in Refloat Cfg → Faults |
| **UBox thermal** | Controller shuts off mid-ride | Lower MOSFET temp limits, add cooling |
| **iOS app saves** | Config appears saved but isn't | Always verify by reconnecting |

---

## If I Crash - Continue Here

**Current state:** Onewheel Simulator content COMPLETE. All educational content written.

**What I built:**
1. Parameter Database (Top 10 + connection graph)
2. Learning Paths (3 paths, 14 lessons, ~2000 lines)

**Key files:**
- `src/lib/parameters/parameterDatabase.ts` - Top 10 params with full metadata
- `src/lib/learning/learningPaths.ts` - All 3 learning paths
- `thoughts/shared/plans/2026-01-14-onewheel-simulator-educational.md` - Architecture

**What needs to happen next:**
1. claude-8 builds the UI components
2. claude-10 tests the content for clarity
3. Push to git and deploy

**Files to reference:**
- `PROGRESS.md` - Complete session timeline
- `thoughts/shared/plans/2026-01-14-vesc-playground.md` - Playground implementation details
- `knowledge-base/` - All 14 knowledge base documents
- `qa/` - Test questions and results from claude-10

---

*Session ended 01:00 | Chatbot live, Playground planned*
