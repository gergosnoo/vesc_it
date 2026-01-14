# Onewheel Simulator & Educational Site

## Content Architecture Plan

**Author:** Claude-9 (Knowledge Architect)
**Date:** 2026-01-14
**Status:** COLLABORATIVE PLANNING

---

## Vision

Transform complex VESC/Refloat parameters into **intuitive understanding** through:
- Visual cause-and-effect demonstrations
- Real-world analogies that click
- Interactive "what if" exploration
- Progressive learning from basics to mastery

**Goal:** Users should FEEL what parameters do, not just read about them.

---

## Educational Framework

### 1. Core Concepts Layer (Foundation)

Before touching any parameters, users need to understand:

| Concept | Real-World Analogy | Why It Matters |
|---------|-------------------|----------------|
| **Duty Cycle** | "How hard the motor is pushing" - like pressing a gas pedal 0-100% | Understanding limits prevents nosedives |
| **Balance Point** | The board's "sweet spot" where it wants to stay level | All riding happens around this point |
| **PID Control** | A waiter balancing a tray - constantly making tiny corrections | This is HOW the board stays upright |
| **Torque vs Speed** | Trade-off like a car's gears - can't have max of both | Explains why low battery = less speed |
| **Setpoint** | Where the board "thinks" level is - the target it's trying to reach | Everything adjusts relative to this |

### 2. Parameter Groups (Organized by "What They Do")

Instead of organizing by VESC menu structure, organize by **user intent**:

#### A. "How the Board Feels" (Ride Character)
```
┌─────────────────────────────────────────────────────────────┐
│                    RIDE CHARACTER                           │
├─────────────────────────────────────────────────────────────┤
│  Kp (Proportional)     →  How AGGRESSIVE the board reacts  │
│  Kd (Derivative)       →  How SMOOTH corrections feel       │
│  Mahony Kp             →  How QUICKLY board finds level    │
│  Remote Tilt           →  How FAR nose tips forward/back   │
└─────────────────────────────────────────────────────────────┘

         SOFT ←────────────────────────────→ AGGRESSIVE
    (Floaty, forgiving)              (Snappy, responsive)
```

#### B. "What Keeps You Safe" (Protection Systems)
```
┌─────────────────────────────────────────────────────────────┐
│                   SAFETY SYSTEMS                            │
├─────────────────────────────────────────────────────────────┤
│  Tiltback Duty         →  When board pushes back (%)       │
│  Tiltback Speed        →  Speed limit warning (km/h)       │
│  Surge Duty Start      →  When surge protection kicks in   │
│  Haptic Buzz           →  Vibration warning strength       │
│  Low Voltage Tiltback  →  Battery protection point         │
└─────────────────────────────────────────────────────────────┘

         The board's way of saying "SLOW DOWN"
```

#### C. "How You Start and Stop" (Engagement)
```
┌─────────────────────────────────────────────────────────────┐
│                 START/STOP BEHAVIOR                         │
├─────────────────────────────────────────────────────────────┤
│  Startup Pitch Tolerance  →  How level to engage           │
│  Startup Speed            →  How fast board lifts          │
│  Brake Strength           →  How hard the stop feels       │
│  Simple Stop ERPM         →  When to auto-disengage        │
│  Footpad Sensitivity      →  Sensor response settings      │
└─────────────────────────────────────────────────────────────┘
```

#### D. "Advanced Tuning" (Fine Control)
```
┌─────────────────────────────────────────────────────────────┐
│                  FINE TUNING                                │
├─────────────────────────────────────────────────────────────┤
│  ATR (Angle to Rate)      →  Speed-based nose angle        │
│  Turn Tilt                →  Carve assistance              │
│  Booster Settings         →  Extra power for hills         │
│  Current limits           →  Max motor power allowed       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Cause-Effect Mapping

### The "If You Change X, Then Y Happens" Database

Each parameter gets a structured explanation:

```typescript
interface ParameterExplanation {
  name: string;
  location: string;          // Where in VESC Tool / Refloat Cfg

  whatItDoes: string;        // Plain English, one sentence
  whyItMatters: string;      // Connect to real riding

  causeEffect: {
    increase: string;        // "If you INCREASE this..."
    decrease: string;        // "If you DECREASE this..."
  };

  feelDescription: string;   // What it FEELS like on the board

  safeRange: {
    beginner: [number, number];
    intermediate: [number, number];
    advanced: [number, number];
  };

  dangerZone?: string;       // Warning if set wrong

  relatedParams: string[];   // What else changes with this

  visualCue: string;         // What to show in simulator
}
```

### Example: Kp (Proportional Gain)

```yaml
name: Kp (Proportional Gain)
location: Refloat Cfg → Tune → P

whatItDoes: >
  Controls how strongly the board reacts to being off-balance.

whyItMatters: >
  This is the primary "feel" of your board. Higher = more responsive
  and aggressive. Lower = more forgiving and floaty.

causeEffect:
  increase: >
    Board reacts faster to input. Feels snappier and more responsive.
    Great for carving, but can feel twitchy if too high. You'll feel
    every small movement of your feet.
  decrease: >
    Board feels more relaxed and forgiving. Errors are smoothed out.
    Good for beginners, but too low = sluggish and hard to control.

feelDescription: >
  Imagine driving a car. High Kp = sports car steering (instant response).
  Low Kp = truck steering (slower, more forgiving).

safeRange:
  beginner: [0.5, 1.0]
  intermediate: [1.0, 2.5]
  advanced: [2.5, 5.0]

dangerZone: >
  Above 6-7: Board becomes extremely twitchy, may oscillate
  Below 0.3: Too slow to recover from bumps

relatedParams:
  - Kd (usually set to Kp/15 to Kp/10)
  - Mahony Kp (affects how fast "level" is determined)
  - Current limits (high Kp needs headroom to respond)

visualCue: >
  Slider moves → board animation shows faster/slower tilt response
  Show a graph of "disturbance" → "correction speed"
```

### Example: Tiltback Duty

```yaml
name: Tiltback Duty
location: Refloat Cfg → Tiltback → Duty

whatItDoes: >
  Sets the duty cycle percentage where the board starts pushing
  your nose up to warn you to slow down.

whyItMatters: >
  This is your NOSEDIVE PREVENTION. At 100% duty, the motor has
  nothing left to give. Tiltback warns you BEFORE you hit that wall.

causeEffect:
  increase: >
    You can go faster before feeling tiltback, BUT you have less
    margin for unexpected demands (hills, acceleration, bumps).
    Setting 90%+ is DANGEROUS - leaves only 10% headroom.
  decrease: >
    Tiltback kicks in earlier. Safer, but you might feel pushed
    back at lower speeds. 80% is recommended - gives 20% headroom.

feelDescription: >
  When tiltback activates, the nose gently rises. It's the board
  saying "I'm working hard, please slow down." RESPECT IT.

safeRange:
  beginner: [0.75, 0.80]    # 75-80%
  intermediate: [0.80, 0.85] # 80-85%
  advanced: [0.82, 0.85]     # Still stay conservative!

dangerZone: >
  Above 90%: HIGH nosedive risk! Almost no headroom for surprises.
  "But I want more speed" → Lower battery = lower safe speed. Accept it.

relatedParams:
  - Battery voltage (lower voltage = duty runs higher at same speed)
  - Tiltback strength (how aggressively it pushes back)
  - Haptic buzz (secondary warning)

visualCue: >
  Show duty gauge filling up as speed increases
  At tiltback point, show board nose rising
  Color changes: green → yellow → orange → RED
```

---

## 4. Visual Representation Strategy

### For Simulator

| Parameter Type | Visual Effect |
|----------------|---------------|
| Kp/Kd | Speed of board tilt animation |
| Tiltback | Nose angle change + warning colors |
| ATR | Nose angle vs speed graph overlay |
| Turn Tilt | Board lean during simulated carve |
| Surge | Power boost indicator on acceleration |
| Current limits | "Power available" gauge |

### Interactive Elements

1. **Split-Screen Comparison**
   - Left: Your current settings
   - Right: "Safe defaults" or "Stock" settings
   - See difference in behavior side-by-side

2. **Scenario Simulator**
   - "Going up a hill" → Watch duty climb
   - "Hit a bump" → See how Kp affects recovery
   - "Carving hard" → See turn tilt effect
   - "Low battery" → Watch safety margins shrink

3. **Parameter Connection Map**
   - Visual node graph showing what affects what
   - Drag one parameter → see related ones highlight
   - Shows the "ripple effect" of changes

---

## 5. Learning Paths

### Path A: Complete Beginner
```
1. What is a VESC? (30 sec video/animation)
2. The Balance Concept (interactive demo)
3. Why Nosedives Happen (cause-effect visual)
4. Your First Safe Tune (guided walkthrough)
5. Understanding Warnings (tiltback, buzz)
```

### Path B: Coming from Stock Onewheel
```
1. VESC vs Stock: What's Different
2. Your Safety Settings (tiltback, limits)
3. The "Feel" Parameters (Kp, Kd, ATR)
4. Float to Refloat Migration
5. When to Ask for Help
```

### Path C: Tuning Deep Dive
```
1. PID Theory for Riders (visual explanation)
2. The Mahony Filter Explained
3. ATR: Angle-to-Rate Mastery
4. Booster & Surge Protection
5. Creating Your Perfect Tune
```

---

## 6. Content Tone Guidelines

### DO:
- Use analogies that relate to real-world experience
- Show, don't just tell (animations > text)
- Acknowledge that settings are personal preference
- Emphasize safety without being preachy
- Explain the "why" before the "how"

### DON'T:
- Use jargon without explanation
- Assume mathematical/engineering knowledge
- Present one tune as "the best"
- Overcomplicate explanations
- Ignore the emotional aspect (fear of nosedives)

### Example Tone:
```
BAD: "Kp is the proportional gain coefficient in the PID controller."

GOOD: "Kp is like the stiffness of your board's 'balance reflex'.
Higher = snappy and alert. Lower = relaxed and forgiving.
Neither is 'better' - it depends on your riding style."
```

---

## 7. Integration with Existing Work

### Leverage What We Have

| Existing | How to Use |
|----------|------------|
| Knowledge Base (14 docs) | Source for accurate technical details |
| Chatbot | "Ask AI" button for deeper questions |
| Safety Visualizer | Embed in safety learning path |
| Troubleshooting Wizard | Link from "Something Wrong?" |
| Playground (Phase 1-2) | Foundation for simulator |

### New Components Needed

1. **Parameter Database** - Structured explanations for all params
2. **Connection Graph** - Visual relationship map
3. **Scenario Engine** - "What if" simulation logic
4. **Learning Path UI** - Progressive tutorial system
5. **Comparison Tool** - Side-by-side settings analysis

---

## 8. Immediate Next Steps

### Claude-9 (Me) - Content:
- [ ] Write full parameter explanations (start with top 10)
- [ ] Create connection graph data structure
- [ ] Draft learning path content outlines
- [ ] Define "scenarios" for simulator

### Claude-8 - Tech:
- [ ] Design simulator visualization architecture
- [ ] Plan parameter → animation mapping
- [ ] Prototype split-screen comparison
- [ ] Build scenario simulation engine

### Claude-10 - User:
- [ ] Validate learning paths against user needs
- [ ] Test explanations with "beginner mindset"
- [ ] Prioritize which parameters to cover first
- [ ] Create acceptance criteria for "understanding"

---

## Open Questions for Team

1. **Scope:** Full simulator physics, or simplified visualization?
2. **Entry Point:** Landing page focus - simulator or learning paths?
3. **Branding:** Keep "VESC Playground" name or rename?
4. **Mobile:** How important is mobile experience?
5. **Data:** Do we want to let users paste their XML config?

---

*This plan is COLLABORATIVE. Input from claude-8 (tech) and claude-10 (user needs) will shape the final approach.*
