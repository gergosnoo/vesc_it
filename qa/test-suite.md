# Test Suite: Questions with Expected Answers

**Created by:** claude-10 (User Advocate / Testing Gatekeeper)
**Date:** 2026-01-13
**Purpose:** Validate chatbot accuracy against new content

---

## How to Use This Test Suite

1. Ask the chatbot each question exactly as written
2. Compare response to Expected Answer
3. Score using the rubric
4. Log results in `qa/test-results.md`

### Scoring Rubric

| Score | Criteria |
|-------|----------|
| ✅ **PASS** | Answer matches expected content, is accurate and helpful |
| ⚠️ **PARTIAL** | Correct but missing key details or unclear |
| ❌ **FAIL** | Incorrect, misleading, or unhelpful |

---

## Test Category 1: Float → Refloat Migration (10 tests)

### T1-01: Basic Migration Question
**Question:** "How do I migrate from Float to Refloat?"

**Expected Answer Should Include:**
- Backup current config first (Start Page → Backup Configs)
- Install Refloat from Package Store
- Automatic config restore dialog will appear
- Confirm to restore settings
- Verify LED type and voltage thresholds after

---

### T1-02: Mahony KP Question
**Question:** "What happens to Mahony KP when migrating to Refloat?"

**Expected Answer Should Include:**
- If old value > 1.0, Refloat may auto-adjust
- New defaults: KP = 0.4, KI = 0, Decay = 0.1
- Refloat uses separate pitch/roll values (mahony_kp, mahony_kp_roll)
- Can manually adjust if board feels different

---

### T1-03: LED Issue Question
**Question:** "I set LED type to NONE but LEDs stay on after migrating to Refloat"

**Expected Answer Should Include:**
- LED settings may not transfer correctly from Float
- Check if you have an LCM - if yes, set to External
- If no LCM, power cycle the board after changing settings
- Verify LED type options: None, WS2812, SK6812, External

---

### T1-04: Firmware Compatibility
**Question:** "Which firmware version works with Refloat?"

**Expected Answer Should Include:**
- Refloat 1.2+ works best with firmware 6.05+
- On 6.02, need to manually set voltage thresholds
- Recommended: Update firmware before installing

---

### T1-05: Voltage Thresholds
**Question:** "Do I need to set voltage thresholds in Refloat?"

**Expected Answer Should Include:**
- On 6.05+: No, uses per-cell values automatically
- On 6.02: Yes, must set manually in Specs tab
- Calculate: Low = 3.2V × cells, High = 4.2V × cells

---

## Test Category 2: Motor Detection (10 tests)

### T2-01: Detection Failed General
**Question:** "Motor detection failed. What should I check?"

**Expected Answer Should Include:**
- Check phase wire connections
- Ensure motor spins freely (no load)
- Disconnect PPM/ADC inputs
- Increase detection current if needed (5A → 7-10A)
- Match VESC Tool version with firmware

---

### T2-02: Hall Error 255
**Question:** "I get Hall Error 255 during motor detection"

**Expected Answer Should Include:**
- Invalid Hall sensor combination (all high or all low)
- Check Hall sensor wiring (Hall A→H1, B→H2, C→H3, 5V, GND)
- Verify 5V supply to Hall connector
- Test by rotating motor and watching readings

---

### T2-03: R is 0 Error
**Question:** "Motor detection says R is 0"

**Expected Answer Should Include:**
- VESC couldn't measure phase resistance
- Check phase wire connections and solder joints
- Increase detection current (try 7A or 10A)
- Test continuity between phases with multimeter
- Check for shorts (should be roughly equal resistance)

---

### T2-04: Flux Linkage Failed
**Question:** "Flux linkage detection failed"

**Expected Answer Should Include:**
- Motor couldn't spin to measure back-EMF
- Remove any load from motor (wheel, propeller)
- Check for mechanical obstruction
- Increase detection current
- Check for faults in terminal

---

### T2-05: Detection Error Codes
**Question:** "I got error code -103 during motor detection"

**Expected Answer Should Include:**
- Subtract 100 to get fault code: -103 = Fault 3 (DRV)
- DRV = Gate driver error
- Check for shorts in phase wires
- May indicate hardware damage
- Common fault codes: -101 (Over Voltage), -102 (Under Voltage), -104 (Overcurrent)

---

### T2-06: Pre-Detection Checklist
**Question:** "What should I do before running motor detection?"

**Expected Answer Should Include:**
- Motor phase wires connected (3 wires)
- Motor can spin freely (no load)
- Hall sensors wired if using
- Battery charged (avoid low voltage)
- Disconnect other inputs (PPM, ADC, UART)
- VESC Tool matches firmware version

---

## Test Category 3: CAN Bus / Dual Motor (10 tests)

### T3-01: Basic CAN Wiring
**Question:** "How do I wire two VESCs together for dual motor?"

**Expected Answer Should Include:**
- CAN H to CAN H
- CAN L to CAN L
- GND to GND (recommended)
- Use twisted pair cable
- Keep wires short (< 2m)

---

### T3-02: CAN IDs
**Question:** "How do I set up CAN IDs for dual motor?"

**Expected Answer Should Include:**
- Each VESC needs unique ID (0-254)
- Master = ID 0 (default)
- Slave = ID 1, 2, 3...
- Configure in App Settings → General → VESC ID
- Both need same baud rate

---

### T3-03: Baud Rate
**Question:** "What CAN baud rate should I use?"

**Expected Answer Should Include:**
- 500 Kbps is most common and recommended
- All VESCs must use same baud rate
- 125K for long cables, 1Mbps for short/high performance
- Configure in App Settings → General → CAN Baud Rate

---

### T3-04: Termination Resistors
**Question:** "Do I need termination resistors for CAN?"

**Expected Answer Should Include:**
- Needed for: long cables (>1m), high baud (500K+), noisy environments, >2 VESCs
- 120Ω resistor between CAN H and CAN L
- Place at EACH END of bus, not in middle

---

### T3-05: Motors Lose Sync
**Question:** "My dual motors lose sync over CAN"

**Expected Answer Should Include:**
- Check Timeout setting in App Settings
- Enable CAN Status Messages on slave
- Verify cable connections
- Try adding termination resistors
- Check baud rates match

---

### T3-06: CAN Detection Failed (-51)
**Question:** "I get CAN detection failed error -51"

**Expected Answer Should Include:**
- Check physical CAN connections (H to H, L to L)
- Verify both VESCs powered on
- Check baud rates match
- Try different CAN IDs
- Test each VESC individually first

---

### T3-07: CAN Forwarding
**Question:** "How do I configure the slave VESC without unplugging cables?"

**Expected Answer Should Include:**
- Use CAN Forwarding in VESC Tool
- Connect USB to Master
- Go to Connection → CAN Forward
- Select slave VESC ID
- All settings now apply to slave

---

## Test Category 4: Fault Codes (5 tests)

### T4-01: Under Voltage Fault
**Question:** "What does FAULT_CODE_UNDER_VOLTAGE mean?"

**Expected Answer Should Include:**
- Input voltage dropped below minimum
- Check battery charge level
- Verify battery connections
- May need to adjust l_min_vin setting

---

### T4-02: DRV Fault
**Question:** "I keep getting FAULT_CODE_DRV. What's wrong?"

**Expected Answer Should Include:**
- Gate driver fault
- Check for phase wire shorts
- May indicate hardware damage
- Check solder joints
- Can happen on cheap clones

---

### T4-03: View Faults Command
**Question:** "How do I see what fault codes my VESC has?"

**Expected Answer Should Include:**
- Connect VESC Tool
- Go to Terminal
- Type "faults" command
- Shows fault history
- "faults_clear" to clear

---

### T4-04: Overcurrent Fault
**Question:** "What causes FAULT_CODE_ABS_OVER_CURRENT?"

**Expected Answer Should Include:**
- Current exceeded absolute maximum
- Can happen during traction loss/regain
- Check motor parameters
- May need to increase abs_max_current
- Check for shorts

---

### T4-05: Encoder Faults
**Question:** "I get encoder fault code 25"

**Expected Answer Should Include:**
- Code 25 = Encoder No Magnet
- Magnet too far from encoder
- Adjust magnet position closer
- Code 26 = magnet too strong/close

---

## Test Category 5: VESC Tool Basics (5 tests)

### T5-01: Motor vs Battery Amps
**Question:** "What's the difference between motor amps and battery amps?"

**Expected Answer Should Include:**
- Motor amps = current to motor phases
- Battery amps = current from battery
- Motor amps set per side on dual controllers
- Battery amps = discharge rate from cells

---

### T5-02: Calculate Battery Amps
**Question:** "How do I calculate what battery amp limit to set?"

**Expected Answer Should Include:**
- Based on cell continuous discharge rating
- Multiply rating by cells in parallel
- Divide by 2 for per-side setting on dual
- Example: P42A cells, 4P = 4 × continuous rating

---

### T5-03: Regen Settings
**Question:** "What should I set regen (battery negative) to?"

**Expected Answer Should Include:**
- About 8 amps per cell is safe
- Higher settings stress battery
- Minimal range benefit from higher regen
- Consider cell chemistry limits

---

### T5-04: Backup Configuration
**Question:** "How do I backup my VESC configuration?"

**Expected Answer Should Include:**
- Method 1: Start Page → Backup Configs
- Method 2: File → Export Configuration XML
- Keep separate motor.xml and app.xml
- Store backup safely

---

### T5-05: RT Data No Connection
**Question:** "RT Data shows No Connection but USB is connected"

**Expected Answer Should Include:**
- Check COM port selection
- Try different USB cable
- Reinstall USB drivers
- Check VESC is powered on
- Close/reopen VESC Tool

---

---

## Test Category 6: LED Configuration (5 tests)

### T6-01: LED Mode Options
**Question:** "What LED modes does Refloat support?"

**Expected Answer Should Include:**
- Off (disabled)
- Internal (VESC controls LEDs directly)
- External (LCM controls LEDs)
- Both (Internal + External)

---

### T6-02: LEDs Stay On Issue
**Question:** "I set LED mode to Off but LEDs stay on"

**Expected Answer Should Include:**
- If you have LCM, set to External instead of Off
- If no LCM, power cycle the board after changing
- Emergency: hold both footpad sensors at power on to disable LEDs

---

### T6-03: Wrong LED Colors
**Question:** "My LED colors are wrong - red shows as green"

**Expected Answer Should Include:**
- Wrong color order setting
- Try GRB for WS2812 LEDs
- Try RGB if colors still wrong
- Power cycle after changing

---

### T6-04: LED Color Order
**Question:** "What LED color order should I use for WS2812?"

**Expected Answer Should Include:**
- GRB for WS2811, WS2812, WS2812B, SK2812
- GRBW for SK6812 with white channel

---

### T6-05: LED Migration from Float
**Question:** "LEDs don't work after migrating from Float"

**Expected Answer Should Include:**
- LED settings may not transfer correctly
- Verify mode is Internal or Both
- Check color order matches LED type
- Power cycle after changes

---

## Test Category 7: Setpoint Adjustment Types (4 tests)

### T7-01: What is SAT
**Question:** "What is Setpoint Adjustment Type in Refloat?"

**Expected Answer Should Include:**
- Indicates why Refloat is adjusting balance setpoint
- Affects how the board tilts
- Different types for speed, duty, voltage, temperature

---

### T7-02: Speed Pushback SAT
**Question:** "What is SAT_PB_SPEED?"

**Expected Answer Should Include:**
- Activates when speed exceeds tiltback_speed setting
- Tilts back to warn rider
- Uses tiltback_duty_step_size for rate
- Generates warning beep

---

### T7-03: High Voltage SAT
**Question:** "Why is my board tilting back when battery is full?"

**Expected Answer Should Include:**
- SAT_PB_HIGH_VOLTAGE (code 10)
- Triggered when voltage > hv_threshold
- Usually during regen braking with full battery
- Protects battery from overcharge

---

### T7-04: SAT Priority
**Question:** "Which pushback condition has highest priority?"

**Expected Answer Should Include:**
- SAT_REVERSESTOP during reverse
- SAT_PB_ERROR for safety
- SAT_PB_HIGH_VOLTAGE for battery protection
- Error conditions take precedence over speed limits

---

## Test Category 8: Mahony KP Tuning (4 tests)

### T8-01: What is Mahony KP
**Question:** "What is Mahony KP in Refloat?"

**Expected Answer Should Include:**
- Filter parameter for pitch/roll estimation
- Lower values = smoother, more filtered
- Higher values = more responsive
- Refloat uses separate pitch and roll KP

---

### T8-02: Auto-Migration Trigger
**Question:** "When does Refloat auto-migrate Mahony KP?"

**Expected Answer Should Include:**
- When old KP > 1.0
- Sets mahony_kp to 0.4
- Sets mahony_ki to 0
- Sets accel_confidence_decay to 0.1

---

### T8-03: Board Feels Different
**Question:** "My board feels different after Refloat update"

**Expected Answer Should Include:**
- KP may have been auto-migrated from >1.0 to 0.4
- Try increasing KP slightly (0.5-0.6)
- Match roll KP to pitch KP
- Give time to adjust

---

### T8-04: Mahony KP Recommended Values
**Question:** "What Mahony KP should I use?"

**Expected Answer Should Include:**
- Default: 0.4 for both pitch and roll
- Smoother: 0.2-0.3
- More responsive: 0.5-0.8
- Keep ki at 0

---

## Test Category 9: FOC Advanced Tuning (4 tests)

### T9-01: Observer Types
**Question:** "Which FOC observer type should I use?"

**Expected Answer Should Include:**
- MXV Lambda Comp Lin (type 6) recommended for most
- Original Ortega (0) for older setups
- Mxlemming variants for improved performance

---

### T9-02: Saturation Compensation
**Question:** "What is FOC saturation compensation?"

**Expected Answer Should Include:**
- Helps at high current where motor saturates
- Start with 30% factor
- Higher current = more saturation
- Improves stability at high load

---

### T9-03: Cross Coupling
**Question:** "Should I enable cross coupling in FOC?"

**Expected Answer Should Include:**
- Usually no for EV applications
- Designed for servo drives with high inductance
- May cause issues in skateboard/Onewheel applications

---

### T9-04: Low Speed Stutter
**Question:** "Motor stutters at low speed in sensorless mode"

**Expected Answer Should Include:**
- Calculate ERPM where stuttering occurs
- Set that as sensorless ERPM under Hall config
- Consider using HFI for low-speed operation
- May need to adjust observer gain

---

## Summary

| Category | Test Count |
|----------|------------|
| Float → Refloat Migration | 5 |
| Motor Detection | 6 |
| CAN Bus / Dual Motor | 7 |
| Fault Codes | 5 |
| VESC Tool Basics | 5 |
| LED Configuration | 5 |
| Setpoint Adjustment Types | 4 |
| Mahony KP Tuning | 4 |
| FOC Advanced Tuning | 4 |
| Motor Wizard | 3 |
| **TOTAL** | **48 tests** |

---

## Test Category 10: Motor Wizard (3 tests)

### T10-01: Usage Type Selection
**Question:** "Which usage type should I select in the VESC wizard for a DIY Onewheel?"

**Expected Answer Should Include:**
- Select "Balance" usage type
- Disables BMS limit mode (allows full current)
- Sets fast fault stop time (50ms)

---

### T10-02: Wizard Prerequisites
**Question:** "What do I need before running the motor setup wizard?"

**Expected Answer Should Include:**
- Connection established (USB, BT, or WiFi)
- Battery connected (fully charged recommended)
- Motor connected (all 3 phase wires)
- Motor can spin freely (no load)

---

### T10-03: E-Skate vs Balance Settings
**Question:** "What's the difference between E-Skate and Balance usage type?"

**Expected Answer Should Include:**
- E-Skate: duty_start 0.85, HFI start enabled
- Balance: duty_start 1.0, BMS limit disabled
- Both use fast fault stop (50ms)

---

## Test Category 11: Safety Critical (6 tests) ✅

**STATUS:** Content VERIFIED - safety-critical-settings.md (324 lines)
**Verified by:** claude-10 (Testing Gatekeeper) at 23:48

### T11-01: Nosedive Causes
**Question:** "What causes nosedives on VESC Onewheels?"

**Expected Answer Should Include:**
- Motor reaching duty cycle limit (pushback ignored)
- Battery voltage sag under load
- Current limits too low for rider weight
- Exceeding motor torque capability
- BMS cutting power unexpectedly

---

### T11-02: Nosedive Prevention
**Question:** "How do I prevent nosedives on my DIY Onewheel?"

**Expected Answer Should Include:**
- Respect tiltback warnings (don't fight pushback)
- Set appropriate current limits for weight/terrain
- Use BMS bypass (charge-only) for discharge
- Keep battery charged (voltage sag worse at low charge)
- Don't exceed rated motor specs

---

### T11-03: BMS Bypass Setup
**Question:** "How do I set up BMS bypass (charge-only)?"

**Expected Answer Should Include:**
- BMS still handles charging (balancing, overcharge protection)
- Discharge goes direct from battery to VESC (bypasses BMS current limit)
- Prevents BMS from cutting power during high current draws
- Wiring: Charge through BMS, discharge direct to pack
- CRITICAL: Understand battery safety before modifying

---

### T11-04: Why BMS Bypass
**Question:** "Why do people bypass the BMS on Onewheels?"

**Expected Answer Should Include:**
- Stock BMS may cut power at high current (causes nosedive)
- BMS current limits often lower than VESC/motor capability
- Sudden BMS shutoff is dangerous mid-ride
- Charge-only preserves cell balancing safety
- Common on high-performance DIY builds

---

### T11-05: Firmware 6.05 Heel Lift Warning
**Question:** "Heel lift stopped working after VESC 6.05 upgrade"

**Expected Answer Should Include:**
- 6.05 changed heel lift behavior at speed
- Check heel_lift_erpm_decay setting
- Disable "Half Switch Fault" if having issues
- May need to re-enable specific settings post-upgrade
- Test at low speed before riding

---

### T11-06: Battery Cutoff Settings
**Question:** "What battery cutoff settings prevent nosedives?"

**Expected Answer Should Include:**
- Set VESC cutoff START well above BMS cutoff
- Gradual power reduction (soft cutoff) before BMS hard cutoff
- Typical: Start at 3.3V/cell, End at 3.0V/cell
- Regen cutoff to prevent overcharge on full battery
- Match settings to your specific cell chemistry

---

## Summary

| Category | Test Count |
|----------|------------|
| Float → Refloat Migration | 5 |
| Motor Detection | 6 |
| CAN Bus / Dual Motor | 7 |
| Fault Codes | 5 |
| VESC Tool Basics | 5 |
| LED Configuration | 5 |
| Setpoint Adjustment Types | 4 |
| Mahony KP Tuning | 4 |
| FOC Advanced Tuning | 4 |
| Motor Wizard | 3 |
| Safety Critical ⚠️ | 6 |
| **TOTAL** | **54 tests** |

---

## Notes for Testing

- Run all tests AFTER embeddings are generated
- Document exact chatbot responses
- Note response time if relevant
- Flag any hallucinated content
- Report gaps back to claude-9
- **Safety Critical tests require dedicated safety-critical-settings.md content first**

---

*Created by claude-10 | User Advocate + Testing Gatekeeper*
