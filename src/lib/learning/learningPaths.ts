/**
 * Learning Paths for Onewheel Simulator
 *
 * Three paths designed for different user types:
 * A: Complete Beginner - Never used VESC before
 * B: Stock Onewheel Rider - Familiar with riding, new to VESC
 * C: Tuning Deep Dive - Ready for advanced customization
 */

export interface LessonStep {
  id: string;
  type: 'text' | 'interactive' | 'quiz' | 'simulator';
  title: string;
  content: string;
  tips?: string[];
  interactiveElement?: string; // Reference to simulator component
  quizQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "3 min"
  icon: string;
  steps: LessonStep[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  targetAudience: string;
  estimatedTime: string;
  lessons: Lesson[];
}

// ============================================================
// PATH A: COMPLETE BEGINNER
// ============================================================

const PATH_A_BEGINNER: LearningPath = {
  id: 'beginner',
  title: 'Complete Beginner',
  description: 'New to VESC? Start here. Learn the fundamentals.',
  icon: '🌱',
  color: 'from-green-500 to-emerald-500',
  targetAudience: 'Never used a VESC-based board before',
  estimatedTime: '15-20 min',
  lessons: [
    // Lesson 1: What is a VESC?
    {
      id: 'what-is-vesc',
      title: 'What is a VESC?',
      description: 'The brain of your board, explained simply',
      duration: '2 min',
      icon: '🧠',
      steps: [
        {
          id: 'vesc-intro',
          type: 'text',
          title: 'Meet Your Board\'s Brain',
          content: `
**VESC** stands for **V**edder **E**lectronic **S**peed **C**ontroller.

Think of it like this:
- Your **battery** is the fuel tank
- Your **motor** is the engine
- The **VESC** is the driver

The VESC reads sensors, makes decisions, and tells the motor exactly how much power to deliver—hundreds of times per second. It's what keeps you balanced.

**Why does this matter?**
Unlike a stock Onewheel where everything is locked down, a VESC lets you customize *everything*. You can make your board feel exactly how you want.
          `,
        },
        {
          id: 'vesc-vs-stock',
          type: 'text',
          title: 'VESC vs Stock Controllers',
          content: `
| Stock Onewheel | VESC-Based Board |
|----------------|------------------|
| Settings locked | Everything adjustable |
| One ride feel | Infinite customization |
| Limited diagnostics | Full telemetry |
| Proprietary | Open source |

**The trade-off:** More control means more responsibility. That's why we're here—to help you understand what you're adjusting.
          `,
        },
        {
          id: 'refloat-intro',
          type: 'text',
          title: 'What is Refloat?',
          content: `
**Refloat** is a software package that runs on your VESC. It's specifically designed for self-balancing boards (like Onewheels).

Think of it like apps on a phone:
- VESC = the phone's operating system
- Refloat = an app that makes balancing work

Refloat handles:
- **Balance control** (keeping you upright)
- **Safety features** (warnings, tiltback)
- **Ride tuning** (how the board "feels")

When we talk about adjusting parameters, we're mostly adjusting Refloat settings.
          `,
          tips: [
            'Refloat replaced an older package called "Float"',
            'Most settings are in "Refloat Cfg" in VESC Tool',
          ],
        },
      ],
    },

    // Lesson 2: The Balance Concept
    {
      id: 'balance-concept',
      title: 'How Balance Works',
      description: 'Understanding the magic that keeps you upright',
      duration: '3 min',
      icon: '⚖️',
      steps: [
        {
          id: 'balance-basics',
          type: 'text',
          title: 'The Balancing Act',
          content: `
Your board stays upright the same way you balance a broom on your palm: **constant tiny corrections**.

Here's what happens every millisecond:
1. **Sensors detect** which way you're tilting
2. **Software calculates** how to correct
3. **Motor applies** exactly the right force
4. **You stay balanced** (hopefully!)

This happens **1000+ times per second**. When it works, it feels like magic. When it fails... that's a nosedive.
          `,
        },
        {
          id: 'balance-interactive',
          type: 'interactive',
          title: 'See It In Action',
          content: `
Watch what happens as the rider leans forward and back.

Notice how the motor works harder (higher duty) when:
- Going uphill
- Accelerating
- Fighting a headwind
- At higher speeds

**The key insight:** The motor has limits. When you exceed them, it can't keep you balanced.
          `,
          interactiveElement: 'balanceVisualization',
        },
        {
          id: 'duty-cycle-intro',
          type: 'text',
          title: 'What is Duty Cycle?',
          content: `
**Duty cycle** is how hard your motor is working, shown as a percentage (0-100%).

| Duty | What's Happening |
|------|------------------|
| 20% | Cruising on flat ground |
| 50% | Moderate speed or slight hill |
| 80% | Pushing hard or steep hill |
| 95% | Motor at its limit! |
| 100% | **No power left = NOSEDIVE** |

**The golden rule:** Never let duty reach 100%. That's why we have warnings.
          `,
          tips: [
            'Duty is affected by speed, hills, acceleration, and battery voltage',
            'Lower battery = higher duty at the same speed',
          ],
        },
        {
          id: 'duty-quiz',
          type: 'quiz',
          title: 'Quick Check',
          content: 'Let\'s make sure you understand duty cycle.',
          quizQuestion: {
            question: 'What happens when motor duty reaches 100%?',
            options: [
              'The board goes faster',
              'The motor has no power left to balance you',
              'The battery charges faster',
              'Nothing, 100% is fine',
            ],
            correctIndex: 1,
            explanation:
              'At 100% duty, the motor is maxed out. It has nothing left to give, which means it can\'t correct your balance. This causes a nosedive.',
          },
        },
      ],
    },

    // Lesson 3: Why Nosedives Happen
    {
      id: 'nosedive-causes',
      title: 'Why Nosedives Happen',
      description: 'Know the causes to avoid the crash',
      duration: '4 min',
      icon: '⚠️',
      steps: [
        {
          id: 'nosedive-truth',
          type: 'text',
          title: 'The Hard Truth',
          content: `
**A nosedive is not a malfunction.** It's physics.

Your board balances by pushing against the ground. When it can't push hard enough, the nose drops. This happens when:

1. **You exceed motor limits** (duty too high)
2. **Something unexpected demands more power** (bump, hill, acceleration)
3. **The board cuts out** (BMS, fault, or hardware issue)

The first two are **preventable**. The third is rare but serious.
          `,
        },
        {
          id: 'nosedive-scenarios',
          type: 'interactive',
          title: 'Common Nosedive Scenarios',
          content: `
**Scenario 1: The Speed Demon**
Riding full speed, feeling great, then... nose drops.
*What happened:* Duty hit 100% at top speed.
*Prevention:* Respect tiltback warnings.

**Scenario 2: The Surprise Hill**
Cruising fine, hit a hill, instant nosedive.
*What happened:* Hill demanded more power than available.
*Prevention:* Slow down before hills, enable surge protection.

**Scenario 3: The Hard Acceleration**
Aggressive takeoff, nose immediately drops.
*What happened:* Demanded 100% power from standstill.
*Prevention:* Smooth acceleration, especially at low battery.

**Scenario 4: The Low Battery Trap**
Same route you always ride, suddenly nosedive.
*What happened:* Low battery = less power available.
*Prevention:* Know your battery limits, charge earlier.
          `,
          interactiveElement: 'nosediveScenarios',
        },
        {
          id: 'warning-signs',
          type: 'text',
          title: 'Warning Signs to Watch For',
          content: `
Your board tries to warn you before a nosedive. **Learn these signals:**

🔶 **Tiltback** - Nose rises, pushing you to slow down
*What to do:* SLOW DOWN. Don't fight it.

🔶 **Haptic Buzz** - Board vibrates through your feet
*What to do:* Immediate speed reduction needed.

🔶 **Sluggish Response** - Board feels "heavy" or unresponsive
*What to do:* You're near the limit. Back off.

🔶 **Surging** - Unexpected power boost feeling
*What to do:* Board is compensating. Ease up.

**The warnings only work if you LISTEN to them.**
          `,
          tips: [
            'Tiltback feels like riding slightly uphill',
            'If you ignore tiltback, you\'re choosing to nosedive',
          ],
        },
        {
          id: 'nosedive-quiz',
          type: 'quiz',
          title: 'Safety Check',
          content: 'What should you do when you feel tiltback?',
          quizQuestion: {
            question: 'You\'re riding and the nose starts rising on its own. What should you do?',
            options: [
              'Lean forward harder to push through it',
              'Slow down - the board is warning you',
              'Speed up to get past the hill',
              'Ignore it, tiltback is annoying',
            ],
            correctIndex: 1,
            explanation:
              'Tiltback is your board\'s way of saying "I\'m running out of power." Fighting it uses MORE power and can cause a nosedive. Always respect the warning.',
          },
        },
      ],
    },

    // Lesson 4: Your First Safe Tune
    {
      id: 'first-safe-tune',
      title: 'Your First Safe Tune',
      description: 'Start with settings that protect you',
      duration: '5 min',
      icon: '🛡️',
      steps: [
        {
          id: 'safe-defaults',
          type: 'text',
          title: 'Starting Point: Safe Defaults',
          content: `
Before you customize anything, you need a **safe baseline**. These settings prioritize keeping you upright over maximum performance.

**The Beginner Safety Package:**

| Setting | Value | Why |
|---------|-------|-----|
| Tiltback Duty | 80% | Gives 20% headroom for surprises |
| Tiltback Speed | 25 km/h | Reasonable limit while learning |
| Haptic Buzz | 78% | Early warning before tiltback |
| Surge Start | 75% | Hill protection kicks in early |

These values are *conservative*. You can adjust later as you gain experience.
          `,
        },
        {
          id: 'tiltback-setup',
          type: 'interactive',
          title: 'Setting Up Tiltback',
          content: `
Tiltback is your primary safety net. Let's configure it right.

**Tiltback Duty: 80%**
- Leaves 20% headroom for unexpected demands
- You'll feel pushback before hitting limits
- As you improve, you can raise it to 82-85%

**Tiltback Strength: 3-5°**
- How aggressively the nose rises
- Too weak = you might not notice
- Too strong = feels jarring

**Try it:** Use the simulator to feel different tiltback strengths.
          `,
          interactiveElement: 'tiltbackSimulator',
        },
        {
          id: 'feel-settings',
          type: 'text',
          title: 'Feel Settings for Beginners',
          content: `
These affect how the board "feels" under your feet:

**Kp (Responsiveness): Start at 1.0-1.5**
- Controls how quickly the board reacts
- Lower = more forgiving, floaty feel
- Higher = snappier, more responsive

**Kd (Smoothness): Kp divided by 10-15**
- If Kp is 1.5, try Kd around 0.1-0.15
- Helps prevent wobbles
- Too low = can oscillate at speed

**Mahony Kp: 0.4-0.5**
- How fast the board finds "level"
- Lower = more stable reference point
- Keep it moderate while learning

**Don't overthink these at first.** Default values are usually fine. Focus on safety settings first.
          `,
          tips: [
            'Ride the defaults for at least 10 miles before adjusting feel',
            'Small changes (0.1-0.2) make noticeable differences',
          ],
        },
        {
          id: 'tune-summary',
          type: 'text',
          title: 'Beginner Tune Summary',
          content: `
Here's your complete beginner-safe configuration:

**Safety Settings:**
\`\`\`
Tiltback Duty:     80%
Tiltback Speed:    25 km/h
Haptic Buzz Duty:  78%
Surge Duty Start:  75%
\`\`\`

**Feel Settings:**
\`\`\`
Kp:        1.5
Kd:        0.12
Mahony Kp: 0.4
\`\`\`

**Engagement:**
\`\`\`
Startup Pitch Tolerance: 20°
Simple Stop ERPM:        2000
\`\`\`

Write these to your board, then **ride at least 20 miles before changing anything**. Get used to how it feels.
          `,
        },
      ],
    },

    // Lesson 5: Understanding Warnings
    {
      id: 'understanding-warnings',
      title: 'Understanding Warnings',
      description: 'What your board is trying to tell you',
      duration: '3 min',
      icon: '🔔',
      steps: [
        {
          id: 'warning-types',
          type: 'text',
          title: 'Types of Warnings',
          content: `
Your board has multiple ways to warn you. Learn them all:

**1. Tiltback (Nose Rise)**
- Cause: Duty approaching limit
- Feel: Nose gently rises, pushing you back
- Action: Reduce speed immediately

**2. Haptic Buzz**
- Cause: Duty at buzz threshold
- Feel: Vibration through your feet
- Action: Urgent - slow down NOW

**3. Surge Boost**
- Cause: Sudden power demand (hill, bump)
- Feel: Unexpected acceleration feeling
- Action: Ease off, you're near limits

**4. Low Voltage Tiltback**
- Cause: Battery getting low
- Feel: Constant slight nose-up
- Action: Head home, charge soon
          `,
        },
        {
          id: 'warning-timing',
          type: 'interactive',
          title: 'When Warnings Activate',
          content: `
Your safety features activate in a specific order:

\`\`\`
Surge Start (75%) → Haptic Buzz (78%) → Tiltback (80%) → DANGER (90%+)
     ↓                    ↓                  ↓              ↓
"I'm working"      "Pay attention!"   "SLOW DOWN"    "About to fail"
\`\`\`

**The gap between tiltback (80%) and danger (100%) is your safety margin.**

Reducing tiltback to 75% = 25% margin (very safe)
Increasing tiltback to 90% = only 10% margin (risky!)
          `,
          interactiveElement: 'warningTimeline',
        },
        {
          id: 'responding-right',
          type: 'text',
          title: 'Responding Correctly',
          content: `
**When you feel a warning:**

✅ **DO:**
- Shift weight slightly back
- Let speed naturally decrease
- Keep knees bent, stay relaxed
- Look for a safe place to stop if needed

❌ **DON'T:**
- Lean forward to "power through"
- Make sudden movements
- Panic (smooth is safe)
- Ignore repeated warnings
          `,
          tips: [
            'Carving reduces speed more gently than sudden braking',
            'If warnings are constant, your battery may be low',
          ],
        },
        {
          id: 'warning-quiz',
          type: 'quiz',
          title: 'Final Check',
          content: 'Let\'s make sure you\'re ready to ride safely.',
          quizQuestion: {
            question: 'Your settings: Surge at 75%, Buzz at 78%, Tiltback at 80%. What happens at 82% duty?',
            options: [
              'Nothing - board is still fine',
              'Surge activates',
              'You\'re past all warnings, in danger zone',
              'Board shuts off',
            ],
            correctIndex: 2,
            explanation:
              'At 82%, you\'re past the tiltback threshold (80%). All warnings have already fired. You\'re now in the danger zone with only 18% headroom. You should have slowed down earlier!',
          },
        },
      ],
    },
  ],
};

// ============================================================
// PATH B: STOCK ONEWHEEL RIDER
// ============================================================

const PATH_B_STOCK_OW: LearningPath = {
  id: 'stock-ow',
  title: 'Coming from Stock Onewheel',
  description: 'You know how to ride. Now learn the VESC difference.',
  icon: '🔄',
  color: 'from-blue-500 to-cyan-500',
  targetAudience: 'Experienced Onewheel riders new to VESC',
  estimatedTime: '12-15 min',
  lessons: [
    // Lesson 1: VESC vs Stock Differences
    {
      id: 'vesc-vs-stock',
      title: 'VESC vs Stock: Key Differences',
      description: 'What changes when you go VESC',
      duration: '3 min',
      icon: '⚡',
      steps: [
        {
          id: 'major-differences',
          type: 'text',
          title: 'The Big Changes',
          content: `
You know how to ride. Here's what's different with VESC:

**What's Similar:**
- Basic riding feel (you'll adapt quickly)
- General balance mechanics
- Foot positioning
- Basic safety concepts

**What's Different:**
| Aspect | Stock OW | VESC |
|--------|----------|------|
| Pushback | Fixed, aggressive | Fully adjustable |
| Top speed | Hard-limited | You set the limits |
| Ride feel | 3-4 presets | Infinite tuning |
| Warnings | Limited options | Multiple layers |
| Diagnostics | Basic app | Full telemetry |
| Safety margins | Hidden | Visible & adjustable |

**The key insight:** With great power comes great responsibility. Stock OW makes decisions for you. VESC lets YOU decide.
          `,
        },
        {
          id: 'power-difference',
          type: 'text',
          title: 'Power & Performance',
          content: `
VESC boards often have more power than stock, but that's a double-edged sword:

**More Power Means:**
✅ Better hill climbing
✅ Faster acceleration
✅ Higher potential top speed
✅ More torque for tricks

**But Also:**
⚠️ Easier to overpower the motor
⚠️ More responsibility on settings
⚠️ Steeper learning curve for tuning
⚠️ More ways to misconfigure

**Don't max everything out just because you can.** Start conservative.
          `,
          tips: [
            'Your first VESC ride should be at beginner-level settings',
            'Add performance gradually as you learn the feel',
          ],
        },
        {
          id: 'nosedive-difference',
          type: 'text',
          title: 'Nosedive Behavior',
          content: `
Stock OW and VESC handle limits differently:

**Stock Onewheel:**
- Pushback is aggressive and early
- Hard speed limit (can't be exceeded)
- Board "protects you from yourself"
- Nosedives still happen, but feel more sudden

**VESC/Refloat:**
- You configure when/how warnings happen
- No hard speed limit (just warnings)
- You must respect your own settings
- More warning signals, but YOU must listen

**Critical difference:** Stock OW won't let you exceed limits. VESC will let you ignore warnings and crash. It trusts you to be smart.
          `,
        },
      ],
    },

    // Lesson 2: Translating Your Experience
    {
      id: 'translate-experience',
      title: 'Your Stock OW Experience, Translated',
      description: 'Map what you know to VESC concepts',
      duration: '3 min',
      icon: '🗺️',
      steps: [
        {
          id: 'mode-translation',
          type: 'text',
          title: 'Stock Modes → VESC Settings',
          content: `
Here's how stock OW modes roughly translate to VESC settings:

**Sequoia (Beginner)**
→ Low Kp (~0.8), Low max speed, Strong tiltback

**Cruz (Cruising)**
→ Moderate Kp (~1.2), Gentle tiltback, Comfortable speed

**Mission (Aggressive)**
→ Higher Kp (~1.8), Later tiltback, More speed allowed

**Delirium (Expert)**
→ High Kp (~2.5+), Minimal tiltback, You're on your own

**Custom Shaping (XR/GT)**
→ This is what VESC gives you for EVERYTHING
          `,
        },
        {
          id: 'feel-mapping',
          type: 'interactive',
          title: 'Finding Your Feel',
          content: `
Use this guide to recreate (or improve) your preferred stock feel:

**If you liked Delirium/Highline (aggressive):**
- Kp: 2.0-3.0
- Tiltback Duty: 85%
- ATR: 0.8-1.2 (for that nose-up at speed feel)

**If you liked Mission (balanced):**
- Kp: 1.5-2.0
- Tiltback Duty: 82%
- ATR: 0.5-0.7

**If you liked Pacific (floaty):**
- Kp: 0.8-1.2
- Tiltback Duty: 80%
- Lower Mahony (0.3-0.4)

Try these in the simulator to see how they feel!
          `,
          interactiveElement: 'modeComparison',
        },
        {
          id: 'pushback-translation',
          type: 'text',
          title: 'Pushback → Tiltback',
          content: `
Stock OW "pushback" = Refloat "tiltback"

**Stock Pushback:**
- Comes at ~15 mph on XR
- Very aggressive
- Can't be disabled

**Refloat Tiltback:**
- You choose when (duty % or speed)
- You choose how strong (degrees)
- You choose if haptic buzz helps
- Can be made gentler or stronger

**Recommended starting point:**
- Duty Tiltback: 80-82%
- Speed Tiltback: Match your old comfort zone
- Strength: 3-4° (noticeable but not violent)
          `,
        },
      ],
    },

    // Lesson 3: Float → Refloat Migration (if applicable)
    {
      id: 'float-to-refloat',
      title: 'Float → Refloat Changes',
      description: 'If you used Float package before',
      duration: '2 min',
      icon: '🔄',
      steps: [
        {
          id: 'refloat-improvements',
          type: 'text',
          title: 'What Changed in Refloat',
          content: `
Refloat is the evolution of Float. Key improvements:

**Better Safety:**
- Surge protection (proactive power boost)
- Improved tiltback algorithms
- Better fault handling

**New Features:**
- ATR (Angle-to-Rate) for speed-based nose angle
- Turn tilt assistance
- Improved startup behavior
- Better haptic feedback options

**Setting Changes:**
Some parameter names/locations changed. The simulator will help you find the equivalent settings.
          `,
        },
        {
          id: 'migration-tips',
          type: 'text',
          title: 'Migration Tips',
          content: `
If you have Float settings you loved:

1. **Don't just copy numbers** - some scales changed
2. **Start with Refloat defaults** and adjust
3. **Key translations:**
   - Float Kp ≈ Refloat Kp (similar)
   - Float Roll ≈ Refloat Roll Kp
   - Float ATR → Different implementation

4. **New settings to explore:**
   - Surge protection (ENABLE IT)
   - Improved tiltback curves
   - Better startup tuning
          `,
          tips: [
            'Refloat defaults are well-tested, try them first',
            'Surge protection alone is worth the upgrade',
          ],
        },
      ],
    },

    // Lesson 4: Safety Settings Deep Dive
    {
      id: 'safety-for-experienced',
      title: 'Safety Settings for Experienced Riders',
      description: 'How to stay safe while pushing limits',
      duration: '4 min',
      icon: '🛡️',
      steps: [
        {
          id: 'experienced-safety',
          type: 'text',
          title: 'Safety Without Sacrifice',
          content: `
You want performance AND safety. Here's how:

**The Experienced Rider Safety Stack:**

\`\`\`
Surge Start:     82%  (catches hills early)
Haptic Buzz:     84%  (vibration warning)
Tiltback Duty:   86%  (still leaves 14% headroom)
Absolute Max:    92%  (hard limit you NEVER exceed)
\`\`\`

This gives you:
- More speed than beginner settings
- Multiple warning layers
- Still 8-14% safety margin
- Room for aggressive riding
          `,
        },
        {
          id: 'surge-explained',
          type: 'text',
          title: 'Surge Protection: Your Hill Saver',
          content: `
Surge is Refloat's hill/bump protection. Stock OW doesn't have this.

**How it works:**
1. Motor duty spikes suddenly (hill, acceleration)
2. Surge detects the spike
3. Temporarily allows extra power
4. Prevents the nosedive that would happen

**Why you want it:**
On stock OW, hitting a steep hill mid-ride could nosedive you. With surge, the board fights harder to keep you up.

**Settings:**
- Surge Start: 80-85% (when it activates)
- Surge Scaler: 1.0-1.5 (how much extra power)
          `,
        },
        {
          id: 'layered-warnings',
          type: 'interactive',
          title: 'Layered Warning Strategy',
          content: `
As an experienced rider, you can run tighter margins—but add more warning layers:

\`\`\`
75% ── Surge protection active (silent safety net)
82% ── Mild haptic pulse (first heads-up)
85% ── Strong haptic buzz (pay attention!)
87% ── Tiltback begins (slow down NOW)
90% ── Full tiltback (EMERGENCY)
\`\`\`

This gives you gradual feedback instead of sudden pushback.
          `,
          interactiveElement: 'warningLayers',
        },
      ],
    },
  ],
};

// ============================================================
// PATH C: TUNING DEEP DIVE
// ============================================================

const PATH_C_DEEP_DIVE: LearningPath = {
  id: 'deep-dive',
  title: 'Tuning Deep Dive',
  description: 'Master the parameters. Create your perfect ride.',
  icon: '🔬',
  color: 'from-purple-500 to-pink-500',
  targetAudience: 'Experienced riders ready to fully customize',
  estimatedTime: '25-30 min',
  lessons: [
    // Lesson 1: PID Theory for Riders
    {
      id: 'pid-theory',
      title: 'PID Control Explained',
      description: 'The math behind the magic (made simple)',
      duration: '5 min',
      icon: '📐',
      steps: [
        {
          id: 'pid-basics',
          type: 'text',
          title: 'What is PID?',
          content: `
PID stands for **P**roportional, **I**ntegral, **D**erivative. It's a control algorithm that's been around since 1911.

**For our board, it means:**
- **P (Kp):** How hard to react to the current error
- **I (Ki):** How to correct for accumulated past errors
- **D (Kd):** How to anticipate future errors

In Refloat, we mainly adjust P and D. Integral is handled automatically.
          `,
        },
        {
          id: 'kp-deep',
          type: 'text',
          title: 'Kp: The Reaction Force',
          content: `
**Kp (Proportional Gain)** = "How hard should I push when I'm off balance?"

Imagine holding a broom upright on your palm:
- **High Kp:** Small tilt = BIG correction (twitchy)
- **Low Kp:** Small tilt = small correction (sluggish)

**The math:**
\`\`\`
Correction Force = Kp × Current Tilt Angle
\`\`\`

If you're tilted 2° and Kp=2, correction force is 4 units.
If Kp=4, correction force is 8 units (twice as aggressive).

**Trade-offs:**
| Kp | Pros | Cons |
|----|------|------|
| Low (0.5-1.0) | Forgiving, smooth | Slow to react, can't handle bumps |
| Mid (1.0-2.5) | Balanced feel | General purpose |
| High (2.5-5.0) | Snappy, precise | Can oscillate, feels twitchy |
          `,
        },
        {
          id: 'kd-deep',
          type: 'text',
          title: 'Kd: The Damper',
          content: `
**Kd (Derivative Gain)** = "How should I respond to HOW FAST I'm tilting?"

Back to the broom analogy:
- If the broom is tilting SLOWLY, gentle correction
- If it's FALLING FAST, need aggressive save

**The math:**
\`\`\`
Damping Force = Kd × Rate of Tilt Change
\`\`\`

**Why Kd matters:**
- Without Kd, the board overcorrects and oscillates
- Kd "puts on the brakes" as you approach level
- Prevents speed wobbles at high speed

**The golden ratio:**
Most riders find stability when **Kd ≈ Kp / 10 to Kp / 15**

If Kp = 2.0, try Kd = 0.13 to 0.20
          `,
        },
        {
          id: 'pid-interactive',
          type: 'interactive',
          title: 'See PID in Action',
          content: `
Watch how the board responds to a bump with different settings:

**Low Kp + Low Kd:**
- Slow to recover
- Board "sways" after bump
- Feels floaty but unstable

**High Kp + Low Kd:**
- Fast recovery
- Oscillates after bump
- Feels twitchy

**Balanced Kp + Kd:**
- Quick recovery
- Returns to level smoothly
- This is the goal!
          `,
          interactiveElement: 'pidSimulator',
        },
        {
          id: 'pid-quiz',
          type: 'quiz',
          title: 'PID Understanding Check',
          content: 'Test your understanding of the balance system.',
          quizQuestion: {
            question: 'Your board wobbles at high speed. What should you adjust?',
            options: [
              'Increase Kp for more response',
              'Decrease Kd to reduce damping',
              'Increase Kd to add more damping',
              'Lower tiltback duty',
            ],
            correctIndex: 2,
            explanation:
              'Speed wobbles are oscillations - the board is overcorrecting back and forth. Increasing Kd adds damping, which reduces oscillations. Think of Kd as "shock absorbers" for your tune.',
          },
        },
      ],
    },

    // Lesson 2: Mahony Filter
    {
      id: 'mahony-filter',
      title: 'The Mahony Filter',
      description: 'How your board knows which way is "up"',
      duration: '4 min',
      icon: '🧭',
      steps: [
        {
          id: 'mahony-basics',
          type: 'text',
          title: 'What is the Mahony Filter?',
          content: `
Before the board can balance you, it needs to know which way is "level." That's harder than it sounds.

**The Problem:**
Your board has accelerometers and gyroscopes. But:
- Accelerometers can't tell acceleration from gravity
- Gyroscopes drift over time
- Vibrations create noise in both

**The Solution: Mahony Filter**
Named after Robert Mahony, this algorithm fuses sensor data to find true orientation.

**Mahony Kp controls:**
- How quickly the filter updates its "level" reference
- Higher = faster adaptation, but less stable
- Lower = more stable reference, but slower to adapt
          `,
        },
        {
          id: 'mahony-effects',
          type: 'text',
          title: 'Mahony Kp Effects',
          content: `
**High Mahony Kp (1.0+):**
- Board quickly adapts to new "level"
- Good for: Variable terrain, trails
- Risk: Can feel "drifty" or uncertain
- Nose may wander over time

**Low Mahony Kp (0.2-0.4):**
- Board holds stable level reference
- Good for: Street riding, consistency
- Risk: Slow to adapt to new surfaces
- Feels more "locked in"

**Most riders prefer:** 0.3-0.6

**Trail riders might want:** 0.8-1.2

**Trick riders might want:** 0.2-0.4 (stable reference)
          `,
        },
        {
          id: 'mahony-interactive',
          type: 'interactive',
          title: 'See Mahony in Action',
          content: `
Watch how the board's "level reference" changes with different Mahony Kp:

**Scenario: Riding onto a ramp**

*Low Mahony:* Board keeps original level, nose dips on ramp
*High Mahony:* Board quickly adapts to ramp angle

**Scenario: Bumpy terrain**

*Low Mahony:* Level stays stable, ignores small bumps
*High Mahony:* Level constantly adjusts, can feel choppy
          `,
          interactiveElement: 'mahonySimulator',
        },
      ],
    },

    // Lesson 3: ATR Mastery
    {
      id: 'atr-mastery',
      title: 'ATR: Angle-to-Rate',
      description: 'Speed-based nose angle for natural riding',
      duration: '4 min',
      icon: '📈',
      steps: [
        {
          id: 'atr-concept',
          type: 'text',
          title: 'What is ATR?',
          content: `
**ATR (Angle-to-Rate)** adjusts your nose angle based on speed.

**The Problem Without ATR:**
At high speed, you're leaning forward a lot to maintain speed. This can be tiring and leaves less weight on your rear foot.

**ATR Solution:**
As you speed up, the board automatically raises the nose slightly. You can stand more upright while still going fast.

**The effect:**
- At 0 km/h: Normal nose angle
- At 20 km/h: Nose raised 2-3°
- At 30 km/h: Nose raised 4-5°

This happens gradually - you won't notice a sudden change.
          `,
        },
        {
          id: 'atr-settings',
          type: 'text',
          title: 'ATR Settings Explained',
          content: `
**ATR Strength (0-2.0)**
- How much the nose rises with speed
- 0 = disabled, 1.0 = moderate, 2.0 = aggressive
- Most riders: 0.4-0.8

**ATR Speed Boost**
- Rate at which ATR increases with speed
- Higher = more effect at lower speeds

**ATR Angle Limit**
- Maximum nose rise from ATR
- Prevents too much nose-up at extreme speed

**ATR Transition**
- How quickly ATR kicks in/out
- Smoother = more natural feel
          `,
        },
        {
          id: 'atr-interactive',
          type: 'interactive',
          title: 'Feel ATR at Different Speeds',
          content: `
Use the simulator to experience how ATR affects your riding position:

**No ATR (Strength = 0):**
- Constant forward lean at speed
- Rear foot feels light
- More tiring on long rides

**Moderate ATR (Strength = 0.6):**
- Standing more upright at cruise
- Even weight distribution
- Natural feeling speed progression

**Aggressive ATR (Strength = 1.5):**
- Very upright at speed
- Can feel like riding uphill
- Some find this fatiguing
          `,
          interactiveElement: 'atrSimulator',
        },
      ],
    },

    // Lesson 4: Surge & Booster
    {
      id: 'surge-booster',
      title: 'Surge & Booster Protection',
      description: 'Your hill and bump safety net',
      duration: '4 min',
      icon: '⚡',
      steps: [
        {
          id: 'surge-mechanics',
          type: 'text',
          title: 'How Surge Works',
          content: `
**Surge** is proactive nosedive prevention for sudden power demands.

**Normal riding:**
Motor duty fluctuates normally (40-70%)

**You hit a hill:**
1. Duty spikes suddenly (70% → 85%)
2. Surge detects the rapid increase
3. Surge temporarily boosts allowed power
4. You ride up the hill safely
5. Surge releases as demand drops

**Without surge:**
That duty spike could hit your tiltback or even nosedive before you react.
          `,
        },
        {
          id: 'surge-settings',
          type: 'text',
          title: 'Surge Settings',
          content: `
**Surge Duty Start (75-90%)**
- Duty level where surge activates
- Lower = more protection, earlier intervention
- Higher = less intervention, more natural feel
- Recommended: 80-85%

**Surge Scaler (0.5-2.0)**
- How much extra power surge provides
- Higher = more aggressive boost
- Most riders: 1.0-1.5

**Key relationship:**
Surge Start should be BELOW your Tiltback Duty
Otherwise surge never helps before tiltback kicks in
          `,
          tips: [
            'Surge Start 5-8% below Tiltback Duty is ideal',
            'If you never feel surge, lower the start threshold',
          ],
        },
        {
          id: 'booster-deep',
          type: 'text',
          title: 'Booster: The Current Multiplier',
          content: `
**Booster** provides extra current (power) for demanding situations.

**When it helps:**
- Steep hill starts
- Hard acceleration
- Fighting headwinds
- Any high-current demand

**Settings:**
- Booster Current: Extra amps available
- Booster Angle: Lean angle that triggers boost
- Booster Ramp: How quickly boost kicks in

**Trade-off:**
More boost = more power, but also more battery draw and motor heat.

**For trail/hill riders:** Higher boost helps
**For street cruisers:** Default boost is usually fine
          `,
        },
      ],
    },

    // Lesson 5: Creating Your Perfect Tune
    {
      id: 'perfect-tune',
      title: 'Creating Your Perfect Tune',
      description: 'Putting it all together',
      duration: '5 min',
      icon: '🎯',
      steps: [
        {
          id: 'tune-philosophy',
          type: 'text',
          title: 'The Tuning Philosophy',
          content: `
There is no "best" tune. There's only the best tune **for you**.

**Step 1: Define your riding style**
- Chill cruiser? Carver? Speed demon? Trail rider?
- Solo or group rides?
- Flat ground or hilly terrain?

**Step 2: Start with a template**
Don't start from scratch. Pick a base:
- Conservative (safety-focused)
- Balanced (general purpose)
- Aggressive (performance)

**Step 3: Change ONE thing at a time**
Adjust, ride 5 miles, evaluate. Repeat.

**Step 4: Document what works**
Write down your settings. You'll forget.
          `,
        },
        {
          id: 'tune-templates',
          type: 'text',
          title: 'Tuning Templates',
          content: `
**🟢 THE CRUISER (Chill street rides)**
\`\`\`
Kp:             1.3
Kd:             0.10
Mahony:         0.4
ATR:            0.5
Tiltback Duty:  82%
Surge Start:    78%
\`\`\`

**🟡 THE CARVER (Aggressive carving)**
\`\`\`
Kp:             2.2
Kd:             0.18
Mahony:         0.5
ATR:            0.7
Turn Tilt:      3.0
Tiltback Duty:  85%
Surge Start:    80%
\`\`\`

**🔴 THE TRAIL BEAST (Off-road/hills)**
\`\`\`
Kp:             1.8
Kd:             0.15
Mahony:         0.8
ATR:            0.4
Surge Start:    75%
Surge Scaler:   1.5
Booster Current: +15A
\`\`\`
          `,
        },
        {
          id: 'tune-iteration',
          type: 'interactive',
          title: 'The Iteration Process',
          content: `
**Use this systematic approach:**

1. **Baseline ride** (5 miles, note feelings)
2. **Identify ONE issue** (too twitchy? too slow? wobbles?)
3. **Make ONE adjustment** (small change only)
4. **Test ride** (same route, 5 miles)
5. **Compare** to baseline
6. **Keep or revert**
7. **Repeat**

**Common adjustments:**
| Problem | Try This |
|---------|----------|
| Twitchy at speed | Lower Kp or increase Kd |
| Wobbles | Increase Kd |
| Sluggish response | Increase Kp |
| Nose wanders | Lower Mahony Kp |
| Tired legs at speed | Increase ATR |
| Hills feel scary | Lower Surge Start, increase Scaler |
          `,
          interactiveElement: 'tuneIterator',
        },
        {
          id: 'tune-final',
          type: 'text',
          title: 'Your Tune, Your Ride',
          content: `
**Remember:**
- Safety first, always
- Small changes make big differences
- Ride the same route when testing
- Your tune will evolve with your skills
- What works today might need adjustment in 6 months

**Final tips:**
- Screenshot/save your settings
- Share with the community
- Be willing to help others
- Never stop learning

Now go ride and enjoy your perfectly tuned board!
          `,
        },
      ],
    },
  ],
};

// ============================================================
// EXPORT ALL PATHS
// ============================================================

export const LEARNING_PATHS: LearningPath[] = [
  PATH_A_BEGINNER,
  PATH_B_STOCK_OW,
  PATH_C_DEEP_DIVE,
];

export function getLearningPathById(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find((path) => path.id === id);
}

export function getLessonById(
  pathId: string,
  lessonId: string
): Lesson | undefined {
  const path = getLearningPathById(pathId);
  if (!path) return undefined;
  return path.lessons.find((lesson) => lesson.id === lessonId);
}
