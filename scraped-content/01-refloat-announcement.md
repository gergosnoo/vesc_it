# Refloat - A New VESC Package

**Source:** https://pev.dev/t/refloat-a-new-vesc-package/1505
**Author:** riddimrider
**Date:** March 17, 2024
**Views:** ~8,765

---

## Overview

Refloat represents a refactored version of the Float package designed for electric skateboard control systems. The developer outlines three primary objectives: modernizing the codebase for easier feature development, ensuring consistent behavior across all operational aspects, and establishing a collaborative development framework with clear contribution guidelines.

## Key Features

**Mahony KP Separation:** The system now distinguishes between firmware-level (App Config) and package-level configuration. The firmware uses "true pitch" measurements with a KP value of 0.4, while the package maintains separate settings. During migration, values exceeding 1.0 trigger automatic adjustment to recommended parameters.

**Multi-Axis Control:** Rather than a single Mahony KP setting, Refloat introduces independent Pitch, Roll, and Yaw KP parameters. This allows refined handling characteristics, particularly during turns. Lower roll KP values reportedly improve nose stability during carving maneuvers.

**User Interface:** A completely redesigned graphical interface with improved configuration management.

**LED System:** Advanced lighting control featuring front/rear/status strip configuration with customizable animations, running at 30 FPS while consuming approximately 1% CPU.

## Installation

Users can migrate from Float by exporting XML configuration, installing Refloat, and restoring the backup. The package is available via GitHub releases and installs through the VESC Tool interface.

## Development Roadmap

Planned enhancements include configurable quick-access buttons, multi-configuration management, automatic gyro calibration, expanded LED animations, and standardization of package communication protocols using Protocol Buffers.
