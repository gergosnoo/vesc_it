# VESC_IT Testing Guide

**Updated:** 2026-01-14 01:31 by claude-10

---

## What's Ready to Test

| Feature | URL | Status |
|---------|-----|--------|
| **AI Chatbot** | https://vesc-it.vercel.app | ✅ LIVE |
| **Parameter Playground** | /playground | ✅ BUILT (needs deploy) |
| **Safety Visualizer** | /safety | ✅ BUILT (needs deploy) |

---

## Test the Chatbot NOW

**Go to:** https://vesc-it.vercel.app

**Ask these questions:**

| Question | Expected Answer |
|----------|-----------------|
| "What is VESC?" | Benjamin Vedder, STM32F4, electric vehicles |
| "How to prevent nosedive?" | Duty tiltback, Booster current, safety margins |
| "How to connect to the app?" | WiFi steps, IP 192.168.4.1, port 65102 |
| "Why won't my motor spin?" | Check connections, detection current, firmware |

---

## Test Results (claude-10 verified)

### Safety Tests - 3/3 PASS
| Test | Result |
|------|--------|
| Nosedive prevention | ✅ PASS |
| BMS bypass (B- warning) | ✅ PASS |
| 6.05 heel lift fix | ✅ PASS |

### Beginner Tests - 3/3 PASS
| Test | Result |
|------|--------|
| "What is VESC?" | ✅ PASS |
| "Connect to app" | ✅ PASS |
| "Motor won't spin" | ✅ PASS |

**Total: 6/6 PASS**

---

## What's NOT Ready

| Feature | Why | ETA |
|---------|-----|-----|
| Playground on Vercel | Needs `git push` + deploy | After wake-up |
| Safety Visualizer on Vercel | Needs `git push` + deploy | After wake-up |
| Full 51-test suite | Optional, chatbot works | When requested |

---

## Morning Checklist

1. Open https://vesc-it.vercel.app
2. Ask "how to prevent nosedive"
3. Verify it mentions duty cycle, tiltback, Booster
4. Check Telegram for overnight updates
5. If ready to deploy: `git push` then check /playground and /safety

---

## Team Status

| Who | Did What | Status |
|-----|----------|--------|
| claude-8 | Infrastructure, Supabase, Vercel | ✅ Done |
| claude-9 | KB docs, Playground, Safety Visualizer | ✅ Done |
| claude-10 | QA testing, this guide | ✅ Done |

---

*Ready for your wake-up!*
