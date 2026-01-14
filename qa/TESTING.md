# What You Can Test Right Now

**Last Updated:** 2026-01-14 13:56
**Total Chunks:** 1057 🎉 (+XR Conversion Guide)

---

## READY - Go Try These!

| What | URL | Works? |
|------|-----|--------|
| **Chatbot** | https://vesc-it.vercel.app | ✅ YES |
| **3D Playground** | https://vesc-it.vercel.app/playground | ✅ **NEW!** |
| **Safety** | https://vesc-it.vercel.app/safety | ✅ YES |
| **Troubleshoot** | https://vesc-it.vercel.app/troubleshoot | ✅ YES |
| **Learning Center** | https://vesc-it.vercel.app/learn | ✅ YES |

---

## NEW: 3D Floatwheel Playground!

**URL:** https://vesc-it.vercel.app/playground

**Features:**
- 🎮 Full 3D Onewheel-style board
- 🔄 Tire spins based on speed
- 📐 Board tilts based on pitch
- 💡 Motor glows based on current
- 🔴 Red warning at duty limit
- 🎥 Drag to rotate, scroll to zoom
- Toggle 2D/3D in header

**Try it:** Adjust sliders and watch the 3D board respond!

---

## Quick Tests - Chatbot (1046 chunks!) 🎉

| Question | Should Include |
|----------|----------------|
| "What settings for my first ride?" | kp=0.7, tiltback_duty=0.75 |
| "VESC Express WiFi not showing" | 5V power issue, LED check |
| "Motor detection values change wildly" | Calibration, motor phase |
| "Slave motor won't spin" | CAN ID, termination, wiring |
| "CAN timeout errors" | 120Ω resistor, shielding |
| "What is tiltback_duty?" | 0.75-0.85 range |
| "FAULT_CODE_OVER_TEMP_FET?" | Causes & fixes |
| "What is the VESC BLE UUID?" | 6E400001-B5A3-F393-E0A9-E50E24DCCA9E |
| "Why are my BMS cells not balancing?" | balance_mode, vc_balance_min, LTC6813 |
| "What is HFI and when to use it?" | Zero-speed sensorless, IPM motor, voltage injection |
| "WS2812 LED setup for VESC?" | Pin config, power wiring, init params |
| "LED brake light pattern?" | Tilt-based, deceleration detection |
| **"What is overmodulation?"** | **15% more voltage, foc_overmod_factor, 1.15 optimal** |
| **"Overmodulation vs field weakening?"** | **Efficiency better, no heat, simpler** |
| **"Why is my duty stuck at 85%?"** | **Overmod scaling, NOT a problem** |
| **"How to convert Onewheel XR to VESC?"** | **Little FOCer/UBOX, motor detection, BMS** |
| **"Hall sensor wiring for XR motor?"** | **5-wire: VCC, GND, A, B, C** |

---

## Knowledge Base Stats

| Metric | Value |
|--------|-------|
| **Total Docs** | 50 files |
| **Total Chunks** | 1046 🎉 |
| **Topics Covered** | 12/12 categories |
| **n8n Automation** | ✅ ACTIVE |
| **3D Playground** | ✅ LIVE |

---

## Test Results (13:56)

| Feature | Tests | Status |
|---------|-------|--------|
| 3D Playground | 4/4 | ✅ QA APPROVED |
| 3D Floatwheel Fix | 3/3 | ✅ QA APPROVED |
| First Ride Tuning | 1/1 | ✅ QA APPROVED |
| Common Setup Problems | 2/2 | ✅ QA APPROVED |
| CAN Troubleshooting | 3/3 | ✅ QA APPROVED |
| FOC Observer Tuning | 3/3 | ✅ QA APPROVED |
| VESC Express Protocol | 3/3 | ✅ QA APPROVED |
| HFI Sensorless | 3/3 | ✅ QA APPROVED |
| Motor Detection Edge Cases | 3/3 | ✅ QA APPROVED |
| BMS Cell Balancing | 3/3 | ✅ QA APPROVED |
| WS2812 LED Patterns | 3/3 | ✅ QA APPROVED |
| **FOC Overmodulation** | 3/3 | ✅ QA APPROVED |
| n8n Workflow | 1/1 | ✅ QA APPROVED |

---

## All Features

| Feature | What It Does |
|---------|--------------|
| **Chatbot** | AI answers from 969 chunks |
| **3D Playground** | Interactive parameter visualizer |
| **Learning Center** | 3 paths, 14 lessons |
| **Safety** | Nosedive risk calculator |
| **Troubleshoot** | 5 step-by-step flows |

---

*Ready for Gergő to test!*
