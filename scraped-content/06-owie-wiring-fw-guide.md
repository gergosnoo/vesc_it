# OWIE Wiring & Firmware Setup Guide

**Source:** https://pev.dev/t/owie-wiring-fw-guide/336
**Views:** 9,254 (TOP #9 on pev.dev)
**Type:** Hardware installation / Wiring guide

---

## Overview

This guide demonstrates how to integrate an OWIE (ESP8266-based WiFi module) with a Future Motion BMS and VESC controller for OneWheel XR conversions using 15s batteries.

## ⚠️ Critical Safety Note

"Reusing the FM BMS as a charge only BMS in a VESC OneWheel conversion disables safety features and by going this route you accept that risk."

## Hardware Requirements

- VESC controller (author uses Little FOCer 3.1)
- Future Motion BMS (XR or Pint model)
- 15-series battery pack
- ESP8266 microcontroller chip
- Soldering equipment

## Firmware Installation Process (Windows)

**Step 1-2:** Download the latest OWIE firmware.bin from the GitHub releases page and obtain the nodemcu-flasher tool.

**Step 3-5:** Extract the flasher software and connect the ESP8266 via Micro USB to your computer, then launch ESP8266Flasher.exe.

**Step 6-7:** Configure the Advanced tab baud rate to "115200" and select your downloaded firmware binary file.

**Step 8:** Navigate to the Operation tab, select the appropriate COM port from the dropdown menu, and click "Flash."

**Step 9:** Press the chip's reset button and verify the WiFi network "Owie-xxx" appears on your phone to confirm successful installation.

## Wiring Configuration

The author's specific setup includes:

- **Power Source:** FM BMS 5V and GND pins energize the OWIE
- **Data Connection:** OWIE Rx connects to the white wire from FM BMS
- **Activation:** OWIE powers on only when FM BMS receives charging voltage through the XLR port
- **Purple Wire Route:** Connects XLR positive (pin 2 with diode or pin 3) to FM BMS positive terminals

The latching switch and 10-amp diode prevent backfeed to charging pins. Two main installation options exist:
1. Place OWIE in the battery enclosure (author's preference)
2. Place in the controller box with extended power/ground wiring

## Key Technical Differences in Updated Method

The November 2022 revision improved safety by ensuring "the charge and discharge path are no longer shared," allowing the FM BMS to cut power during charging if necessary—a significant improvement over the previous bridged configuration.
