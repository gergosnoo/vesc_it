# 3D Floatwheel Visualization Requirements

**Created by:** claude-10 (User Advocate)
**Date:** 2026-01-14 12:06
**Purpose:** Define user-focused 3D visualization for /playground

---

## 3D Model Sources Found

### Best Options (Web-Ready GLTF)

| Source | Model | License | Quality |
|--------|-------|---------|---------|
| [Sketchfab - OneWheel Pint](https://sketchfab.com/3d-models/onewheel-pint-cb822b5e535641f7ba23893a8f61b16e) | Pint board | CC | HIGH - Ready for Three.js |
| [Sketchfab - Electric OneWheel](https://sketchfab.com/3d-models/electric-skateboard-onewheel-8f2d3e44a30542559a5d09ffe577be39) | Low-poly Pint | CC | MEDIUM - Textured, dirty look |
| [Sketchfab Onewheel Tag](https://sketchfab.com/tags/onewheel) | Multiple models | Various | Browse for best fit |

### STL Sources (Need Conversion)

| Source | Models | Notes |
|--------|--------|-------|
| [Printables - Floatwheel ADV](https://www.printables.com/model/518877-floatwheel-adv) | Full board | STL → needs GLTF conversion |
| [Printables - Floatwheel Tag](https://www.printables.com/tag/floatwheel) | Various parts | Accessories, fenders |
| [pev.dev - Floatwheel Parts](https://pev.dev/t/floatwheel-adv-adv-pro-3d-printed-custom-parts-free-stls/1135) | Custom parts | Community models |
| [Cults3D - Onewheel](https://cults3d.com/en/tags/onewheel?only_free=true) | 49 free models | Various accessories |

---

## User-Focused Animations

### What Users Would LOVE to See

#### 1. Speed Visualization (ALL USERS)
- **Tire rotation** - Spins based on simulated speed
- **Motor glow** - Subtle glow intensity with current
- **Wind effects** - Optional particle trails at high speed

#### 2. Tilt Response (BEGINNER → EXPERT)
- **Pitch tilt** - Board tilts forward/back based on setpoint
- **Duty cycle warning** - Board nose dips when approaching limit
- **Pushback animation** - Visual tilt-back at tiltback_duty threshold

#### 3. Current Flow (INTERMEDIATE → EXPERT)
- **Motor current indicator** - Glowing coils in hub motor
- **Battery drain** - Visual battery level indicator
- **Regen animation** - Reverse flow on braking (green glow)

#### 4. Safety Warnings (CRITICAL - ALL USERS)
- **Red glow** - When approaching duty limit
- **Nose dip** - Visual nosedive warning
- **Tiltback animation** - Shows what pushback looks like
- **Fault flash** - Red strobe on fault condition

---

## Parameter → Animation Mapping

| Parameter | Animation | User Value |
|-----------|-----------|------------|
| `tiltback_duty` | Nose tilts up at threshold | See when pushback kicks in |
| `tiltback_speed` | Speed indicator turns yellow | Know your speed limit |
| `motor_current` | Motor coil glow intensity | Understand power usage |
| `battery_current` | Battery indicator drain rate | See real-time consumption |
| `duty_cycle` | Headroom bar + board color | Critical safety indicator |
| `surge_duty_start` | Surge mode indicator | When surge kicks in |
| `fault_adc_half_erpm` | Footpad sensor highlight | Heel lift visualization |

---

## Interactive Features Users Want

### Slider → 3D Response

1. **Drag tiltback_duty slider** → Watch board tilt animate
2. **Increase speed** → Tire spins faster, wind effects
3. **Max out duty** → Board glows red, nose dips warning
4. **Trigger fault** → Red flash, board stops

### Camera Controls

- **Orbit** - Click and drag to rotate view
- **Zoom** - Scroll to zoom in/out
- **Presets** - Side view, top view, rider perspective
- **Auto-rotate** - Gentle spin when idle

### Educational Overlays

- **Hotspots** - Click motor, battery, footpads for info
- **Annotations** - Labels that appear on hover
- **Cross-section** - Optional cutaway view of motor/battery

---

## Technical Requirements

### Three.js Implementation

```
- GLTF loader for model
- Separate meshes for: tire, motor, board, footpads, battery
- Animation mixer for smooth transitions
- Raycaster for click interactions
- Responsive canvas (mobile-friendly)
```

### Performance

- **Target:** 60fps on mid-range devices
- **Fallback:** 2D simplified view for low-end
- **Model size:** < 5MB GLTF
- **Texture size:** 1024x1024 max

---

## Priority Order (User Value)

| Priority | Feature | Why Users Want It |
|----------|---------|-------------------|
| P0 | Tire spin based on speed | Intuitive, engaging |
| P0 | Board tilt based on pitch | Core understanding |
| P1 | Duty cycle warning (red glow) | SAFETY - nosedive prevention |
| P1 | Tiltback animation | See what pushback looks like |
| P2 | Motor current glow | Power visualization |
| P2 | Camera orbit controls | Exploration |
| P3 | Battery indicator | Nice-to-have |
| P3 | Educational hotspots | Deep learning |

---

## Recommended Model

**Primary:** [Sketchfab OneWheel Pint](https://sketchfab.com/3d-models/onewheel-pint-cb822b5e535641f7ba23893a8f61b16e)

**Why:**
- Free (CC license)
- GLTF export available
- High quality
- Clean geometry
- Separate parts (tire, board, motor visible)

**Backup:** Create simplified low-poly model if licensing issues

---

## Next Steps

1. [ ] Download GLTF from Sketchfab (claude-8)
2. [ ] Verify license allows commercial use
3. [ ] Test model in Three.js viewer
4. [ ] Implement tire rotation animation
5. [ ] Connect to parameter sliders
6. [ ] Add safety warning effects
7. [ ] QA test on mobile devices

---

*Created by claude-10 | User Advocate | 2026-01-14*
