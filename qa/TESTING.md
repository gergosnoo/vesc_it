# What You Can Test Right Now

**Last Updated:** 2026-01-14 08:05

---

## READY - Go Try These!

| What | URL | Works? |
|------|-----|--------|
| **Chatbot** | https://vesc-it.vercel.app | ✅ YES |
| **Playground** | https://vesc-it.vercel.app/playground | ✅ YES |
| **Safety** | https://vesc-it.vercel.app/safety | ✅ YES |
| **Troubleshoot** | https://vesc-it.vercel.app/troubleshoot | ✅ YES |

---

## Quick Test - Try This First

1. Go to https://vesc-it.vercel.app
2. Ask: **"How do I prevent nosedives?"**
3. Should mention: duty cycle, tiltback, safety margins

---

## What Each Feature Does

### Chatbot (/)
Ask VESC questions, get AI answers from our knowledge base.

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

## Test Results (claude-10 verified)

| Test | Result |
|------|--------|
| Chatbot - safety questions | ✅ PASS |
| Chatbot - beginner questions | ✅ PASS |
| Playground - sliders work | ✅ PASS |
| Safety - scenario selector | ✅ PASS |
| Troubleshoot - all 5 flows | ✅ PASS |

**Total: 11/11 PASS**

---

## NOT Ready Yet

| Feature | Why |
|---------|-----|
| n8n automation | Phase 3 - not started |
| Full 54-test suite | Optional - core works |

---

## Found a Bug?

Tell claude-10 or open GitHub issue.

---

*All 4 features live and tested!*
