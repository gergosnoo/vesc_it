# 3D Floatwheel Visualization Research

> **Researcher:** claude-9 (Knowledge Architect)
> **Date:** 2026-01-14
> **Updated:** 2026-01-14 (Added exact dimensions & fix recommendations)
> **For:** claude-8 (Implementation)

---

## ⚠️ Current Issues (Gergő Feedback)

1. **Wheel dimensions WRONG** - Not matching real Floatwheel specs
2. **Wheel orientation WRONG** - Rotation axis incorrect for forward travel
3. **Not using real model** - Programmatic torus doesn't look like a tire

---

## Floatwheel ADV Exact Dimensions

**Source:** Official specs comparison with Onewheel GT/XR (similar form factor)

### Board Dimensions

| Measurement | Value (Imperial) | Value (Metric) |
|-------------|------------------|----------------|
| **Board Length** | ~30" | ~76 cm |
| **Board Width** | ~9.5" | ~24 cm |
| **Board Height** | ~9-10" | ~23-25 cm |
| **Weight** | 35-36 lbs | 16-16.5 kg |

### Wheel/Tire Dimensions

| Measurement | Value (Imperial) | Value (Metric) |
|-------------|------------------|----------------|
| **Tire Diameter** | 11.5" total | 29.2 cm |
| **Hub/Rim Diameter** | 6" (6.5" on GT) | 15.2-16.5 cm |
| **Tire Width** | 6.5" | 16.5 cm |
| **Axle Diameter** | 75mm (ADV) | 7.5 cm |

### Key Ratios (for 3D modeling)

```
Board Length / Wheel Diameter = 30" / 11.5" ≈ 2.6:1
Wheel Width / Wheel Diameter = 6.5" / 11.5" ≈ 0.57:1 (chunky tire)
Board Width ≈ Wheel Diameter ≈ 9.5-11.5"
```

---

## Fix Options

### Option A: Download Sketchfab Model (FASTEST)

**OneWheel Pint Model:**
- **URL:** https://sketchfab.com/3d-models/onewheel-pint-cb822b5e535641f7ba23893a8f61b16e
- **Author:** maxime.montegnies (CC Attribution)
- **Triangles:** 28.3k
- **Downloads:** 3,873 (popular, tested)
- **Format:** GLTF/GLB (perfect for Three.js)
- **⚠️ Note:** Pint is SMALLER (~27" board) - scale up 10-15% for ADV

**Electric Skateboard OneWheel:**
- **URL:** https://sketchfab.com/3d-models/electric-skateboard-onewheel-8f2d3e44a30542559a5d09ffe577be39
- **Author:** Numbian (CC Attribution)
- **Triangles:** 25.3k (lower = better)
- **Format:** GLTF/GLB

### Option B: Fix Programmatic Model (MORE ACCURATE)

Replace torus with proper tire geometry:

```javascript
// WRONG - Current torus implementation
const wheel = new THREE.TorusGeometry(0.2, 0.08, 16, 100);

// CORRECT - Chunky tire cylinder with rounded edges
function createFloatwheelTire() {
  // Floatwheel ADV dimensions (meters)
  const TIRE_DIAMETER = 0.292;  // 11.5" = 29.2 cm
  const TIRE_WIDTH = 0.165;     // 6.5" = 16.5 cm
  const HUB_DIAMETER = 0.152;   // 6" = 15.2 cm

  // Use LatheGeometry for realistic tire profile
  const profile = [];
  const tireRadius = TIRE_DIAMETER / 2;
  const hubRadius = HUB_DIAMETER / 2;
  const halfWidth = TIRE_WIDTH / 2;
  const bulge = 0.015; // Tire bulge

  // Create cross-section profile
  profile.push(new THREE.Vector2(hubRadius, -halfWidth));
  profile.push(new THREE.Vector2(tireRadius + bulge, -halfWidth * 0.7));
  profile.push(new THREE.Vector2(tireRadius + bulge * 1.5, 0));
  profile.push(new THREE.Vector2(tireRadius + bulge, halfWidth * 0.7));
  profile.push(new THREE.Vector2(hubRadius, halfWidth));

  const geometry = new THREE.LatheGeometry(profile, 64);

  // CRITICAL: Rotate so wheel axis is along Z (perpendicular to travel)
  geometry.rotateX(Math.PI / 2);

  return geometry;
}
```

### Option C: Hybrid (RECOMMENDED)

1. Download Sketchfab model for realistic appearance
2. Scale to match Floatwheel ADV dimensions
3. Verify wheel orientation matches forward travel direction

---

## Wheel Orientation Fix

**Problem:** Wheel spinning on wrong axis

**Travel Direction:** When board moves forward, tire rotates around Z-axis (left-right axle)

```javascript
// WRONG - Rotating around X or Y
tire.rotation.x += speed * dt;  // ❌ Tire wobbles side-to-side

// CORRECT - Rotating around Z (wheel axle)
tire.rotation.z += speed * dt;  // ✅ Tire rolls forward/backward
```

**Scene Setup:**
```
      Y (up)
      |
      |
      +---- X (right)
     /
    Z (forward = travel direction)

Wheel axle runs along X-axis
Wheel rotates around X-axis for forward movement
Board nose points toward +Z
```

---

## 3D Model Sources Found

### Full Board Models

| Source | Type | License | Best For |
|--------|------|---------|----------|
| [Sketchfab OneWheel Pint](https://sketchfab.com/3d-models/onewheel-pint-cb822b5e535641f7ba23893a8f61b16e) | GLTF | CC Attribution | Web visualization |
| [Sketchfab Electric Skateboard](https://sketchfab.com/3d-models/electric-skateboard-onewheel-8f2d3e44a30542559a5d09ffe577be39) | GLTF | CC Attribution | Web visualization |

### Community Parts (Accessories Only - NOT full boards)

| Source | Type | Notes |
|--------|------|-------|
| [Printables Floatwheel Tag](https://www.printables.com/tag/floatwheel) | STL | Fenders, bumpers, rails |
| [pev.dev Custom Parts](https://pev.dev/t/floatwheel-adv-adv-pro-3d-printed-custom-parts-free-stls/1135) | STL | Accessories, no full board |
| [Thingiverse OneWheel](https://www.thingiverse.com/tag:onewheel) | STL | 3D printing, not web-optimized |
| [Yeggi Floatwheel](https://www.yeggi.com/q/floatwheel+adv/) | STL | Aggregator, 516+ models |

### GitHub Repos (Firmware, NOT CAD)

| Repo | Content |
|------|---------|
| [kreier/floatwheel](https://github.com/kreier/floatwheel) | DIY build guide |
| [contactsimonwilson/floatwheel](https://github.com/contactsimonwilson/floatwheel) | Firmware (C/Assembly) |
| [floatwheel](https://github.com/floatwheel) | Official - Owie fork |

**❌ No official Floatwheel CAD/STEP files found publicly available.**

---

## Recommended Implementation

### Step 1: Download Sketchfab Model

```bash
# From Sketchfab, download GLTF format
# Place in: public/models/onewheel.glb
```

### Step 2: Scale to ADV Dimensions

```javascript
// Pint is ~27" board, ADV is ~30"
const SCALE_FACTOR = 30 / 27;  // ~1.11

loader.load('/models/onewheel.glb', (gltf) => {
  const board = gltf.scene;
  board.scale.setScalar(SCALE_FACTOR);
  scene.add(board);
});
```

### Step 3: Fix Rotation Axis

```javascript
// Find tire mesh and rotate correctly
const tire = board.getObjectByName('tire') || board.getObjectByName('wheel');

function animate() {
  // Rotate around correct axis for forward travel
  if (tire) {
    tire.rotation.x += speed * dt;  // Assumes model oriented with X as axle
  }
  requestAnimationFrame(animate);
}
```

### Step 4: Add Attribution

```html
<!-- Required for CC Attribution license -->
<footer>
  3D Model: "OneWheel Pint" by maxime.montegnies
  <a href="https://sketchfab.com/3d-models/onewheel-pint-cb822b5e535641f7ba23893a8f61b16e">
    Licensed under CC Attribution
  </a>
</footer>
```

---

## Parameter-to-Visual Mappings

### Real-Time Telemetry → Visual Effects

| VESC Parameter | Visual Effect | Implementation |
|----------------|---------------|----------------|
| `speed` (ERPM) | Tire rotation speed | `tire.rotation.x += speed * dt` |
| `pitch` (IMU) | Board forward/back tilt | `board.rotation.x = pitch` |
| `roll` (IMU) | Board left/right tilt | `board.rotation.z = roll` |
| `motor_current` | Motor glow intensity | Emissive material brightness |
| `duty_cycle` | Throttle indicator | Color gradient (green→yellow→red) |
| `battery_level` | Battery LED strip | Segmented bar (green→red) |
| `fault_code` | Warning flash | Red pulse overlay |
| `temperature` | Heat shimmer/glow | Red tint on motor area |

### Refloat-Specific Visualizations

| Refloat State | Visual Indicator |
|---------------|------------------|
| `state == RUNNING` | Normal stance, slight motion |
| `state == ENGAGED` | Rider weight on board |
| `state == STARTUP` | Startup animation |
| `tiltback_active` | Nose rises gradually |
| `nosedive_warning` | Board flashes red, nose dips |

---

## Summary for claude-8

**Immediate Fix (Fastest):**
1. Download [OneWheel Pint GLTF](https://sketchfab.com/3d-models/onewheel-pint-cb822b5e535641f7ba23893a8f61b16e)
2. Scale by 1.11x for ADV size
3. Fix rotation axis to X for forward travel
4. Add attribution footer

**Dimensions to Use:**
- Board: 30" × 9.5" (76cm × 24cm)
- Wheel: 11.5" diameter × 6.5" wide (29cm × 16.5cm)
- Wheel axis: perpendicular to travel direction

---

*Research updated 2026-01-14 with exact dimensions and fix recommendations.*
