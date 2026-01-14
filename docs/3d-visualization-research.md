# 3D Floatwheel Visualization Research

> **Researcher:** claude-9 (Knowledge Architect)
> **Date:** 2026-01-14
> **For:** claude-8 (Implementation)

---

## 3D Model Sources

### Recommended: Sketchfab OneWheel Models

Both models are **free** with **CC Attribution** license (must credit author).

#### Option 1: Electric Skateboard OneWheel (RECOMMENDED)
- **URL:** https://sketchfab.com/3d-models/electric-skateboard-onewheel-8f2d3e44a30542559a5d09ffe577be39
- **Author:** Numbian (credit required)
- **Triangles:** 25.3k (lower = better for web)
- **Vertices:** 12.7k
- **Textures:** Normal, color, specular maps (painted from photos)
- **License:** CC Attribution
- **Why best:** Lower poly, includes all texture maps, good for Three.js

#### Option 2: OneWheel Pint
- **URL:** https://sketchfab.com/3d-models/onewheel-pint-cb822b5e535641f7ba23893a8f61b16e
- **Author:** maxime.montegnies (credit required)
- **Triangles:** 28.3k
- **Vertices:** 15.2k
- **Textures:** Unknown (made in Blender)
- **License:** CC Attribution
- **Downloads:** 3,873 (popular, well-tested)

### Download Format
Sketchfab provides **GLTF/GLB** export for all downloadable models - perfect for Three.js.

### Not Suitable
- **pev.dev:** Accessories only (fenders, rails), no complete boards
- **Printables/Thingiverse:** STL for 3D printing, not web-optimized

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
| `surge` | Forward thrust animation |
| `nosedive_warning` | Board flashes red, nose dips |

### Physics Simulation

```javascript
// Simplified board physics for visualization
class FloatwheelPhysics {
  update(telemetry, dt) {
    // Tire rotation from ERPM
    const rps = telemetry.erpm / (this.motorPoles * 30);
    this.tireAngle += rps * 2 * Math.PI * dt;

    // Board tilt from IMU
    this.pitch = lerp(this.pitch, telemetry.pitch, 0.1);
    this.roll = lerp(this.roll, telemetry.roll, 0.1);

    // Smoothed for visual appeal
    this.board.rotation.set(this.pitch, 0, this.roll);
    this.tire.rotation.x = this.tireAngle;
  }
}
```

---

## Three.js Implementation Notes

### Model Loading
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
loader.load('/models/onewheel.glb', (gltf) => {
  const board = gltf.scene;

  // Find tire mesh for rotation
  const tire = board.getObjectByName('tire') || board.getObjectByName('wheel');

  // Find motor mesh for glow effects
  const motor = board.getObjectByName('motor') || board.getObjectByName('hub');

  scene.add(board);
});
```

### Recommended Scene Setup
```javascript
// Orbit controls for user interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Ground plane for shadow
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.ShadowMaterial({ opacity: 0.3 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

// Lighting for realistic look
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(5, 10, 5);
directional.castShadow = true;
```

---

## Data Flow Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   VESC/BLE      │────▶│  WebSocket/BLE   │────▶│   Three.js      │
│   Telemetry     │     │  Bridge          │     │   Renderer      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │  Zustand Store   │
                        │  (React state)   │
                        └──────────────────┘
```

### Telemetry Update Rate
- **Target:** 20-30 FPS for smooth animation
- **VESC BLE:** ~10 Hz typical, interpolate for smoothness
- **Simulated:** Use `requestAnimationFrame` at 60 FPS with interpolation

---

## Attribution Requirements

When using Sketchfab models, display credit:
```
3D Model: "Electric Skateboard OneWheel" by Numbian
Licensed under CC Attribution
https://sketchfab.com/Numbian
```

---

## Recommendations for claude-8

1. **Download Option 1 model** (lower poly, better textures)
2. **Use GLTFLoader** in Three.js
3. **Implement smoothing** (lerp) for visual polish
4. **Add orbit controls** for user interaction
5. **Store telemetry in Zustand** for React integration
6. **Start with static model**, add animations incrementally

---

*Research complete. Ready for implementation handoff.*
