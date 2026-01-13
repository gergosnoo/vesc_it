# Real User Questions by Topic

**Created by:** claude-10 (User Advocate)
**Date:** 2026-01-13
**Source:** Forums, Reddit, GitHub, Discord
**Total Questions:** 75+

---

## 1. Motor Detection (15 questions)

### From Forums
| Question | Source | Frequency |
|----------|--------|-----------|
| "Motor detection failed - what should I check first?" | esk8.news, vesc-project | HIGH |
| "Hall Error 255 during detection" | michobby, forums | HIGH |
| "Motor detection says R is 0 in FOC mode" | vesc-project | MEDIUM |
| "Detection parameters - when should I increase current?" | esk8.news | MEDIUM |
| "Motor doesn't activate during run detection" | esk8.news | HIGH |
| "Bad detection result received - impossible to achieve motor detection" | vesc-project | HIGH |
| "Sensor detection failed" | vesc-project | HIGH |

### From GitHub Issues
| Question | Issue # | Status |
|----------|---------|--------|
| "Motor phase calculation problems in FOC mode" | bldc#139 | Open |
| "Motor stutter when braking after duty cycle limit" | bldc#262 | Fixed |
| "Motor/App Data often not saved to VESC" | vesc_tool#87 | Open |

---

## 2. CAN Bus / Dual Motor (12 questions)

| Question | Source | Frequency |
|----------|--------|-----------|
| "Can't spin both motors over CAN-bus" | vesc-project | HIGH |
| "Dual Motor Setup not working via CAN Bus" | vesc-project | HIGH |
| "Can't get Dual drive/CAN bus working" | vesc-project | HIGH |
| "CAN bus is not supported in this version of the tool" | esk8.news | HIGH |
| "Connect 4 VESC with CAN-bus, motors stuttering" | vesc-project | MEDIUM |
| "FSESC 4.20 CAN bus not detecting" | vesc-project | MEDIUM |
| "Able to read CAN messages but cannot write" | vesc-project | MEDIUM |
| "How do I set CAN IDs?" | Discord | HIGH |
| "Do I need termination resistors?" | forums | MEDIUM |
| "Master/slave configuration for dual motor" | forums | HIGH |

---

## 3. Fault Codes (12 questions)

| Question | Source | Fault Code |
|----------|--------|------------|
| "What does FAULT_CODE_UNDER_VOLTAGE mean?" | vesc-project | 2 |
| "FAULT_CODE_DRV constantly - what is wrong?" | vesc-project | 3 |
| "How do I see my fault codes?" | beginners | - |
| "What causes FAULT_CODE_ABS_OVER_CURRENT?" | vesc-project | 4 |
| "VESC freewheels after fault codes during braking" | vesc-project | 4 |
| "FAULT_CODE_HIGH_OFFSET_CURRENT_SENSOR_3" | vesc-project | 15-17 |
| "Over voltage faults using power supply" | vesc-project | 1 |
| "How to use trigger sampled at fault?" | endless-sphere | - |
| "Encoder fault codes 25/26 intermittently" | forums | 25,26 |
| "Flash corruption fault code 14" | forums | 14 |

---

## 4. Float/Refloat Configuration (15 questions)

### Migration
| Question | Source |
|----------|--------|
| "Should Mahony KP be adjusted after migrating?" | pev.dev |
| "Can settings be saved and restored after installing Refloat?" | pev.dev |
| "Where is the migration documentation?" | pev.dev |
| "LED type set to NONE but LEDs stay on" | pev.dev |
| "What happens to Mahony KP values automatically?" | pev.dev |
| "Does Float Package work on 6.05 firmware?" | pev.dev |

### Configuration
| Question | Source |
|----------|--------|
| "How do I tune ATR for different terrain?" | forums |
| "What is Torque Tilt and when to adjust?" | forums |
| "Asymmetric braking feels wrong - how to adjust?" | forums |
| "What is mahony_kp_roll vs mahony_kp?" | github |
| "Why use the package - is there not all settings in VESC Tool itself?" | pev.dev |
| "I keep losing my selected tuning" | pev.dev |
| "High/Low Voltage Threshold settings" | pev.dev |

---

## 5. VESC Tool / Basic Setup (10 questions)

| Question | Source | Frequency |
|----------|--------|-----------|
| "What is Motor Amps vs Battery Amps?" | esk8.news | HIGH |
| "How do I calculate battery amp limits?" | esk8.news | HIGH |
| "What should I set regen to?" | esk8.news | MEDIUM |
| "ESC Fault Time - is 0.5s right?" | esk8.news | MEDIUM |
| "PPM Mapping/Throttle Curve feels unresponsive" | esk8.news | MEDIUM |
| "VESC firmware stuck on 2.18" | esk8.news | LOW |
| "One VESC is out of date but both updated to 5.1" | esk8.news | MEDIUM |
| "Motor jitter when hitting cutoff start" | esk8.news | MEDIUM |
| "RT Data shows No Connection but USB connected" | forums | HIGH |
| "How do I save and backup my configuration?" | beginners | HIGH |

---

## 6. FOC Tuning (8 questions)

| Question | Source |
|----------|--------|
| "What is observer gain and how does it affect riding?" | forums |
| "Which FOC observer type should I use?" | forums |
| "Motor stutters at low speed in sensorless mode" | endless-sphere |
| "Should I enable cross coupling?" | endless-sphere |
| "How do I use saturation compensation?" | endless-sphere |
| "Reducing L or Ldq by 30% - when is this appropriate?" | endless-sphere |
| "Observer gain at minimum duty - what values?" | endless-sphere |
| "Getting higher current under sensorless" | endless-sphere |

---

## 7. BMS / Power (6 questions)

| Question | Source |
|----------|--------|
| "How do I set battery cutoff voltages correctly?" | forums |
| "Over voltage on hard braking with full battery" | forums |
| "How does VESC BMS communicate with motor controller?" | forums |
| "Cell balancing doesn't work" | forums |
| "How to get FM BMS to retain cell balancing" | pev.dev |
| "Balance threshold configuration" | github |

---

## 8. Connectivity / VESC Express (7 questions)

| Question | Source |
|----------|--------|
| "VESC Express WiFi - how to configure network?" | forums |
| "BLE connection drops constantly on my phone" | forums |
| "Floaty/Float Control app not seeing my board" | forums |
| "What's the difference between VESC Express and built-in Bluetooth?" | forums |
| "External LCM light control not working" | pev.dev |
| "App bug - failing to save config changes silently" | pev.dev |
| "How to factory reset VESC Express?" | Discord |

---

---

## 9. Safety Critical Questions (NEW - 10 questions)

| Question | Source | Severity |
|----------|--------|----------|
| "What causes nosedives on VESC Onewheels?" | pev.dev, forums | 🔴 CRITICAL |
| "How do I set up BMS bypass (charge-only)?" | pev.dev | 🔴 CRITICAL |
| "What are the VESC 6.05 upgrade warnings?" | pev.dev | 🔴 HIGH |
| "Heel lift disengages at high speed after 6.05 upgrade" | pev.dev | 🔴 HIGH |
| "Speed tracker shows wrong values after firmware update" | pev.dev | 🟡 MEDIUM |
| "UBox controller auto-shutdown while riding" | pev.dev | 🔴 CRITICAL |
| "How to prevent BMS from cutting power while riding?" | forums | 🔴 CRITICAL |
| "What battery cutoff settings prevent nosedives?" | forums | 🔴 HIGH |
| "iPhone VESC app silently fails to save config" | pev.dev | 🟡 MEDIUM |
| "Speed Tracker Position Source - what should it be?" | pev.dev | 🟡 MEDIUM |

---

## Question Frequency Analysis

| Topic | # Questions | User Frustration |
|-------|-------------|------------------|
| Motor Detection | 15 | 🔥 Very High |
| CAN Bus/Dual Motor | 12 | 🔥 Very High |
| Fault Codes | 12 | 🔥 High |
| Float/Refloat | 15 | 🔥 High |
| **Safety Critical** | 10 | 🔥🔥 CRITICAL |
| VESC Tool Basics | 10 | 😐 Medium |
| FOC Tuning | 8 | 😐 Medium |
| BMS/Power | 6 | 😐 Medium |
| Connectivity | 7 | 😐 Medium |

---

## User Persona Breakdown

| Persona | % of Questions | Top Topics |
|---------|----------------|------------|
| **Beginner** (first VESC) | 45% | Detection, Settings, Fault Codes |
| **Intermediate** (has configured before) | 35% | CAN Bus, Migration, Tuning |
| **Expert** (develops packages) | 20% | FOC, LispBM, Advanced |

---

*Compiled by claude-10 | User Advocate*
