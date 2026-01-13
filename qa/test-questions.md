# VESC_IT QA Test Questions

**Created by:** claude-10 (Knowledge Engineer & QA)
**Date:** 2026-01-13
**Status:** Initial version - questions gathered from real forums/communities

---

## Test Categories

| Category | Source Repo | Question Count |
|----------|-------------|----------------|
| BLDC Fault Diagnosis | bldc/ | 12 |
| Motor Detection Issues | bldc/ | 8 |
| FOC Tuning | bldc/ | 7 |
| Refloat Configuration | refloat/ | 15 |
| VESC Tool Usage | vesc_tool/ | 6 |
| BMS/Power | vesc_bms_fw/ | 4 |
| Connectivity | vesc_express/ | 5 |

**Total Questions:** 57

---

## 1. BLDC Fault Diagnosis (12 questions)

### Beginner Level

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| FD-01 | "What does FAULT_CODE_UNDER_VOLTAGE mean?" | Battery voltage dropped below minimum. Check battery charge, connections. | vesc-project.com |
| FD-02 | "I'm getting FAULT_CODE_DRV constantly. What is wrong?" | Gate driver fault - often hardware issue, check phase wires, could need capacitor fix on clones | vesc-project.com |
| FD-03 | "How do I see my fault codes?" | Connect VESC Tool > Terminal tab > type "faults" command | vesc-project.com |
| FD-04 | "What causes FAULT_CODE_ABS_OVER_CURRENT?" | Current exceeded absolute limit. Can happen during traction loss/regain. May need to increase abs_max or check motor params | vesc-project.com |

### Intermediate Level

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| FD-05 | "My VESC freewheels after getting fault codes during hard braking" | Possible MOSFET damage from overcurrent. Check using sample data at fault, may need hardware replacement | vesc-project.com |
| FD-06 | "What is the difference between 'Current' and 'Current Filtered' in fault reports?" | Current is instantaneous, Filtered is low-pass filtered reading. Spikes may show in Current but not Filtered | forum |
| FD-07 | "FAULT_CODE_HIGH_OFFSET_CURRENT_SENSOR_3 - what should I do?" | Current sensor on phase 3 has failed or drifted. Use Sample Data > Current tab to diagnose | vesc-project.com |
| FD-08 | "I get over voltage faults using power supply instead of battery" | Power supplies can't absorb regen current. Use a battery or add resistive load | vesc-project.com |

### Expert Level

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| FD-09 | "How can I use 'trigger sampled at fault' for diagnosis?" | Connect to VESC, enable trigger, induce fault while connected - gives exact conditions at fault time | endless-sphere |
| FD-10 | "Why do I get encoder fault codes 25/26 intermittently?" | Magnet distance issues - 25 is too far, 26 is too close. Adjust magnet position | datasheet |
| FD-11 | "What causes fault code 14 (Flash Corruption)?" | Flash memory CRC failed - possible hardware issue or interrupted firmware update | bldc source |
| FD-12 | "How do I interpret resolver faults (20-22)?" | LOT=loss of tracking, DOS=degradation of signal, LOS=loss of signal - check resolver wiring | bldc source |

---

## 2. Motor Detection Issues (8 questions)

### Beginner Level

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| MD-01 | "Motor detection failed - what should I check first?" | Remove load, disable other inputs (PPM), check motor connections, ensure no resistance | maytech, esk8 |
| MD-02 | "I get 'Hall Error 255' during detection" | Hall sensor wiring issue - check 6-pin connection sequence, may be damaged sensor | michobby |
| MD-03 | "Motor detection says 'R is 0' in FOC mode" | Set motor type to BLDC first, write settings, then switch back to FOC | vesc-project.com |

### Intermediate Level

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| MD-04 | "Detection parameters - when should I increase current?" | Increase motor current from 5A to 10A for motors with high resistance or small size | esk8.news |
| MD-05 | "What is the 'D value' and why set it to 0?" | Duty cycle for detection. Set to 0 for low-inductance motors that struggle with default 0.5 | forum |
| MD-06 | "Firmware and VESC Tool version mismatch - does it affect detection?" | Yes! Always match firmware version with VESC Tool version. Download manually if needed | electric-skateboard.builders |

### Expert Level

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| MD-07 | "How do I manually tune flux linkage after failed auto-detection?" | Use terminal command `foc_detect_apply_all`, or manually measure using back-EMF | forum |
| MD-08 | "Time constant parameter - when to change from 1000us to 500us?" | For over current faults during detection, reduce to 500us for faster current loop response | vesc-project.com |

---

## 3. FOC Tuning (7 questions)

### Beginner Level

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| FOC-01 | "What is observer gain and how does it affect riding?" | Controls how fast sensorless mode estimates rotor position. Higher = more responsive but can cause noise | forum |
| FOC-02 | "Which FOC observer type should I use?" | MXV Lambda Comp Lin (type 6) is recommended for most applications. Original Ortega for older setups | bldc source |

### Intermediate Level

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| FOC-03 | "Motor stutters at low speed in sensorless mode" | Calculate ERPM where stuttering occurs, set that as sensorless ERPM under Hall config | endless-sphere |
| FOC-04 | "Should I enable cross coupling?" | Usually no for EV applications. It's designed for servo drives with high inductance | endless-sphere |
| FOC-05 | "How do I use saturation compensation?" | Enable it and start with ~30% factor. Higher current = more saturation, helps at high load | endless-sphere |

### Expert Level

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| FOC-06 | "Reducing L or Ldq by 30% - when is this appropriate?" | Can improve stability but reduces efficiency. Good for motors that oscillate at high current | endless-sphere |
| FOC-07 | "Observer gain at minimum duty - what values work best?" | Try 0.1 or 0.05 for startup stability. Trade-off is slower observer at low speed | endless-sphere |

---

## 4. Refloat Configuration (15 questions)

### Beginner Level

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| RF-01 | "I'm migrating from Float - what happens to Mahony KP?" | If > 1.0, Refloat auto-sets: Mahony KP=0.4, KI=0, Accelerometer Confidence Decay=0.1 | pev.dev |
| RF-02 | "Should I keep my Float 1.8 Mahony KP value?" | No, Refloat handles Mahony differently. Let it auto-configure or use separate pitch/roll values | pev.dev |
| RF-03 | "Can I restore my Float settings to Refloat?" | Yes, Refloat 100% compatible with Float 1.3/2.0 configs. Auto-backup/restore on upgrade | github |

### Intermediate Level

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| RF-04 | "Where is the migration documentation?" | In the Refloat README on GitHub and the Initial Board Setup guide on pev.dev | pev.dev |
| RF-05 | "LED type set to NONE but LEDs stay on - why?" | Config restore from Float may not carry LED type. Re-apply LED settings manually | pev.dev |
| RF-06 | "External LCM light control not working on Floatwheel" | Known issue with External light type. Check AppUI button appears but may need firmware update | pev.dev |
| RF-07 | "Do I need to reconfigure anything on firmware 6.05+?" | No, package should ride well with defaults on 6.05+. Only tune if needed | pev.dev |
| RF-08 | "What is mahony_kp_roll and how is it different from mahony_kp?" | Separate KP for roll axis. Improves handling in turns and balance profile | github |

### Expert Level

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| RF-09 | "How do I tune ATR for different terrain (grass, hills)?" | Increase atr_strength_up for uphill/grass, atr_strength_down for downhill. Adjust speed_boost for high-speed | docs |
| RF-10 | "What is Torque Tilt and when should I adjust it?" | Current-based nose angle. Higher values give more nose drop under acceleration | docs |
| RF-11 | "Asymmetric braking feels wrong - how to adjust?" | Increase kp_brake > 1.0 for stronger brakes, kp2_brake > 1.0 for more brake dampening | docs |
| RF-12 | "What is MODE_HANDTEST?" | Bench testing mode for checking balance without riding | source |
| RF-13 | "What is MODE_FLYWHEEL?" | Indoor training mode - operates without footpad engagement | source |
| RF-14 | "Is there a Konami sequence hidden feature?" | Yes, secret sequences can unlock modes. Check source code for specifics | source |
| RF-15 | "What are all the SetpointAdjustmentType options?" | Full enum in source - includes ATR, Torque Tilt, Turn Tilt, Brake Tilt, Booster, Nose Angling | source |

---

## 5. VESC Tool Usage (6 questions)

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| VT-01 | "How do I check current firmware version?" | Connect > Info tab shows firmware version, or Terminal > type 'version' | docs |
| VT-02 | "Motor calibration wizard vs manual detection - which to use?" | Wizard for beginners. Manual for troubleshooting or unusual motors | maytech |
| VT-03 | "Can I use VESC Tool mobile app for full configuration?" | Yes on Android/iOS but desktop has more features. Use desktop for initial setup | docs |
| VT-04 | "How do I save and backup my configuration?" | File > Export Configuration XML. Keep separate motor.xml and app.xml | docs |
| VT-05 | "RT Data shows 'No Connection' but USB is connected" | Check COM port selection, try different USB cable, reinstall USB drivers | forum |
| VT-06 | "What is 'VESC Dev Tools' menu for?" | Advanced diagnostics - Terminal, sampled data, firmware upload, GPDrive | forum |

---

## 6. BMS/Power (4 questions)

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| BMS-01 | "How do I set battery cutoff voltages correctly?" | Calculate from cell count. 3.2V/cell for cutoff start, 3.0V/cell for end. Leave headroom | docs |
| BMS-02 | "What causes over voltage on hard braking with full battery?" | Regen can't go into full battery. Set lower duty or enable over-voltage protection | forum |
| BMS-03 | "How does VESC BMS communicate with motor controller?" | CAN bus. Configure CAN ID and baud rate to match. Enable BMS limiting | docs |
| BMS-04 | "Cell balancing doesn't work - troubleshooting steps?" | Check balance wire connections, verify cell voltage readings, ensure balance threshold set correctly | docs |

---

## 7. Connectivity (5 questions)

| ID | Question | Expected Answer Summary | Source |
|----|----------|------------------------|--------|
| CON-01 | "VESC Express WiFi - how to configure network?" | Connect via USB first, configure WiFi SSID/password in VESC Tool, then connect wirelessly | docs |
| CON-02 | "BLE connection drops constantly on my phone" | Check for interference, try different BLE module, update VESC Express firmware | forum |
| CON-03 | "How do I connect multiple VESCs via CAN?" | Set unique CAN IDs, connect CAN H-H and L-L, enable status broadcast | docs |
| CON-04 | "Floaty/Float Control app not seeing my board" | Ensure VESC Express is configured, try resetting BLE, check app permissions | forum |
| CON-05 | "What's the difference between VESC Express and built-in Bluetooth?" | VESC Express has WiFi + BLE on ESP32. Built-in BT is basic, Express is more capable | docs |

---

## Testing Methodology

### Test Execution

1. **Question Input:** Submit exact question text to chatbot
2. **Response Capture:** Record full response
3. **Accuracy Check:** Compare against expected answer
4. **Completeness Check:** Did it cover all key points?
5. **Clarity Check:** Would a beginner understand?
6. **Actionability Check:** Can user take action from this?

### Scoring Rubric

| Score | Meaning |
|-------|---------|
| PASS | Accurate, complete, clear, actionable |
| PARTIAL | Correct but missing details or clarity |
| FAIL | Incorrect or unhelpful |
| GAP | Question cannot be answered (missing KB) |

### User Personas

| Persona | Experience | Expectations |
|---------|------------|--------------|
| Beginner | First VESC, no EE background | Step-by-step, explain terms |
| Intermediate | Has configured VESCs, some issues | Focused troubleshooting |
| Expert | Develops packages, deep tuning | Technical details, source refs |

---

## Known Knowledge Gaps (Pre-Test)

Based on research vs. current documentation:

| Gap ID | Topic | Severity | Missing From |
|--------|-------|----------|--------------|
| GAP-01 | Float to Refloat migration guide | HIGH | refloat.md |
| GAP-02 | LED configuration troubleshooting | MEDIUM | refloat.md |
| GAP-03 | Motor detection troubleshooting flowchart | HIGH | bldc.md |
| GAP-04 | FOC advanced tuning guide | MEDIUM | bldc.md |
| GAP-05 | CAN bus multi-VESC setup | HIGH | protocols.md |
| GAP-06 | MODE_HANDTEST / MODE_FLYWHEEL docs | LOW | refloat.md |
| GAP-07 | Konami sequence documentation | LOW | refloat.md |
| GAP-08 | Complete SetpointAdjustmentType enum | MEDIUM | refloat.md |
| GAP-09 | Mahony KP auto-migration behavior | MEDIUM | refloat.md |
| GAP-10 | VESC Express WiFi setup guide | HIGH | vesc_express.md |

---

## Sources Referenced

- [pev.dev Refloat Thread](https://pev.dev/t/refloat-a-new-vesc-package/1505)
- [VESC Project Forum - Fault Codes](https://vesc-project.com/node/787)
- [Endless Sphere - VESC Tuning](https://endless-sphere.com/sphere/threads/vesc-tuning-tips.125527/)
- [GitHub - lukash/refloat](https://github.com/lukash/refloat)
- [SUPzero VESC Config Tool](https://supzero.ch/vesc_config/)
- [Maytech Motor Detection Guide](https://maytech.cn/blogs/news/motor-detection-in-vesc_tool-step-by-step-guide)

---

*Created by claude-10 | Knowledge Engineer & QA*
