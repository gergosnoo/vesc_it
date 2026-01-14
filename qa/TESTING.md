# What You Can Test Right Now

**Last Updated:** 2026-01-14 09:25

---

## READY - Go Try These!

| What | URL | Works? |
|------|-----|--------|
| **Chatbot** | https://vesc-it.vercel.app | ✅ YES |
| **Playground** | https://vesc-it.vercel.app/playground | ✅ YES |
| **Safety** | https://vesc-it.vercel.app/safety | ✅ YES |
| **Troubleshoot** | https://vesc-it.vercel.app/troubleshoot | ✅ YES |
| **Learning Center** | https://vesc-it.vercel.app/learn | ✅ NEW! |

---

## Quick Tests - Try These!

### Chatbot
1. Ask: **"What is tiltback_duty?"** → Should show 0.75-0.85 range
2. Ask: **"What is FAULT_CODE_OVER_TEMP_FET?"** → Should show causes & fixes
3. Ask: **"UBOX specs"** → Should show V2_100 (±300A) and SINGLE_100 (±150A)

### Learning Center
1. Go to /learn
2. Click "Complete Beginner"
3. Click "Why Nosedives Happen"
4. Read through lessons (⚠️ Step 2 may have empty content - known bug)

---

## What Each Feature Does

### Chatbot (/)
Ask VESC questions, get AI answers from 413 embedded chunks.

### Learning Center (/learn) 🆕
3 learning paths for different experience levels:
- Complete Beginner (5 lessons)
- Coming from Stock Onewheel (4 lessons)
- Tuning Deep Dive (5 lessons)

### Playground (/playground)
Drag sliders to see how parameters affect the board. 3D visualization.

### Safety (/safety)
See your nosedive risk. Click scenarios like "Uphill" to see risk change.

### Troubleshoot (/troubleshoot)
Step-by-step guides for common problems:
- Motor Detection Failed
- Footpad Sensor Issues (6.05 heel lift fix!)
- Nosedive Prevention
- BMS Bypass (with safety warnings!)
- CAN Bus Not Working

---

## Test Results (claude-10 verified 09:25)

| Test | Result |
|------|--------|
| Chatbot - BMS balancing | ✅ PASS |
| Chatbot - Motor vs Battery Amps | ✅ PASS |
| Chatbot - Fault codes | ✅ PASS |
| Chatbot - Hardware (UBOX, Little FOCer) | ✅ PASS |
| Chatbot - tiltback_duty | ✅ PASS |
| Playground - sliders work | ✅ PASS |
| Safety - scenario selector | ✅ PASS |
| Troubleshoot - all 5 flows | ✅ PASS |
| Learning Center - UI navigation | ✅ PASS |
| Learning Center - lesson content | ⚠️ Step 2 empty |

**Total: 9/10 PASS (1 minor bug)**

---

## Known Issues

| Issue | Severity |
|-------|----------|
| /learn Step 2 content empty | Minor - UI bug |
| General nosedive question generic | Low - RAG tuning opportunity |

---

## NOT Ready Yet

| Feature | Why |
|---------|-----|
| n8n automation | Phase 3 - not started |

---

## Found a Bug?

Tell claude-10 or open GitHub issue.

---

*All 5 features live and tested! 413 chunks in knowledge base.*
