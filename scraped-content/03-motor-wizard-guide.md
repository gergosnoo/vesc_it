# Motor Wizard Guide

**Source:** https://pev.dev/t/motor-wizard-guide/486
**Views:** 17,194 (TOP #1 on pev.dev)
**Type:** Tutorial / Step-by-step guide

---

## Critical Pre-Setup Requirements

Always maintain backups of motor and app configurations before beginning. Remember to regularly write settings to the controller—data won't transfer until explicitly written, and Bluetooth disconnections can cause loss of changes.

## Initial Motor Configuration (Step 1)

Start by selecting "No" for default parameters. Choose "Large Outrunner" with these foundational settings:
- Maximum power loss: 400W
- Open loop ERPM: 700
- "Sensorless ERPM = 2000" (this critical value gets adjusted later)
- Motor poles: 30

For battery configuration, specify your cell count based on pack type. The guide lists common options including "Stock XR (64V) = 15S" through "High Voltage Pack (135V) = 32S" configurations.

Run motor detection by selecting the detection button and allowing wheel free-spin. Compare resulting values against reference ranges, as detection results vary considerably based on motor and controller specifications.

## Motor Settings - General Configuration (Step 2)

**Current Parameters:**
- Hypercore motors: 120A maximum, -100A brake current
- Superflux/Cannon Core: 180A maximum, -160A brake current
- Battery limits vary by pack (35-60A typical maximum)

**Voltage Settings (per-cell basis):**
Establish cutoff thresholds at "2.3V per cell" for start and "2.0V per cell" for end conditions.

**Temperature Protections:**
- MOSFET: 75°C start, 85°C end
- Motor: 80°C start, 95°C end

These trigger pushback alerts—exceeding them risks equipment damage.

## FOC Motor Settings (Step 3)

Adjust observer gain to approximately half the wizard-detected value (range: 0.6-0.9). Set hall sensor interpolation at 250 ERPM with sensorless ERPM maintained at 2000.

Field weakening typically requires 30-50A maximum start current at 60-65% duty cycle.

## Motor "Crunch" Resolution

Address common issues systematically:

1. Reduce observer gain to wizard value's half
2. Confirm sensorless ERPM at 2000
3. Set sensor interpolation to 250 ERPM
4. Adjust zero vector frequency (maximum 30)
5. Increase motor resistance to 1.2× detected values

The guide emphasizes making single adjustments between tests rather than multiple simultaneous changes.
