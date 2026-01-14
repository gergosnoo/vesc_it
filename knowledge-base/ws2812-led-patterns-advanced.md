# WS2812 Addressable LED Advanced Guide

## Overview

**Key Terms:** WS2812, addressable LED, LED strip, RGB LED, RGBW, LED patterns, custom lighting, Neopixel, LispBM LED, PWM LED, headlights, underglow, status LED

This advanced guide covers WS2812/Neopixel addressable LED control using VESC's LispBM scripting and native C library.

**Source:** `bldc/lispBM/c_libs/examples/ws2812/code.c`, `vesc_pkg/lib_ws2812/`

---

## Hardware Setup

### Supported Pins

**Source:** `bldc/lispBM/c_libs/examples/ws2812/code.c:114-142`

| Timer | Channel | GPIO Pin | Notes |
|-------|---------|----------|-------|
| TIM4 | CH1 | PB6 | Default on many VESCs |
| TIM4 | CH2 | PB7 | Alternative |
| TIM3 | CH1 | PC6 | If TIM4 unavailable |
| TIM3 | CH2 | PC7 | Alternative |

### Wiring

```
VESC Pin    →  LED Strip
─────────────────────────
5V          →  VCC (Power)
GND         →  GND (Ground)
PB6/PB7     →  DIN (Data In)
```

**Important:**
- Use level shifter if VESC GPIO is 3.3V and LEDs need 5V logic
- Add 300-500Ω resistor on data line for signal integrity
- Add 1000µF capacitor across power if using many LEDs
- Keep data wire under 1 meter from VESC to first LED

### Power Considerations

| LED Count | Max Current | Power at 5V |
|-----------|-------------|-------------|
| 10 LEDs | 600mA | 3W |
| 30 LEDs | 1.8A | 9W |
| 60 LEDs | 3.6A | 18W |
| 144 LEDs | 8.6A | 43W |

**Rule of thumb:** Each WS2812 LED draws up to 60mA at full white.

---

## Initialization

### Using C Library (Recommended)

**Source:** `bldc/lispBM/c_libs/examples/ws2812/code.c:231-280`

```lisp
; Import the WS2812 C library
(import "ws2812/ws2812.bin" 'ws2812)

; Initialize: (num_leds, is_ch2, is_tim4, use_rgbw)
; is_ch2: 0 = CH1 (PB6/PC6), 1 = CH2 (PB7/PC7)
; is_tim4: 0 = TIM3, 1 = TIM4
; use_rgbw: 0 = RGB (24-bit), 1 = RGBW (32-bit)

(ext-ws2812-init 30 0 1 0)  ; 30 LEDs, CH1, TIM4, RGB mode
```

### Parameter Reference

| Parameter | Value | Description |
|-----------|-------|-------------|
| `num_leds` | 1-300+ | Number of LEDs in strip |
| `is_ch2` | 0 or 1 | Which timer channel |
| `is_tim4` | 0 or 1 | Which timer (TIM3 or TIM4) |
| `use_rgbw` | 0 or 1 | RGB (24-bit) or RGBW (32-bit) |

---

## Color Control

### Setting Individual LED Colors

```lisp
; Set LED color: (led_index, color)
; Color format: 0xRRGGBB (RGB) or 0xWWRRGGBB (RGBW)

(ext-ws2812-set-color 0 0xFF0000)   ; LED 0 = Red
(ext-ws2812-set-color 1 0x00FF00)   ; LED 1 = Green
(ext-ws2812-set-color 2 0x0000FF)   ; LED 2 = Blue
(ext-ws2812-set-color 3 0xFFFFFF)   ; LED 3 = White
```

### Setting Brightness

```lisp
; Global brightness: 0-100 (percentage)
(ext-ws2812-set-brightness 50)  ; 50% brightness
```

### Common Colors

| Color | Hex Code | RGB Values |
|-------|----------|------------|
| Red | `0xFF0000` | (255, 0, 0) |
| Green | `0x00FF00` | (0, 255, 0) |
| Blue | `0x0000FF` | (0, 0, 255) |
| White | `0xFFFFFF` | (255, 255, 255) |
| Yellow | `0xFFFF00` | (255, 255, 0) |
| Cyan | `0x00FFFF` | (0, 255, 255) |
| Magenta | `0xFF00FF` | (255, 0, 255) |
| Orange | `0xFF8000` | (255, 128, 0) |
| Purple | `0x8000FF` | (128, 0, 255) |

---

## LED Patterns (LispBM Examples)

### Pattern 1: Solid Color

```lisp
; Set all LEDs to same color
(defun set-all-leds (color num-leds)
    (looprange i 0 num-leds
        (ext-ws2812-set-color i color)))

; Usage
(set-all-leds 0x00FF00 30)  ; All green
```

### Pattern 2: Rainbow Cycle

```lisp
; HSV to RGB conversion
(defun hsv-to-rgb (h s v)
    (let ((c (* v s))
          (x (* c (- 1.0 (abs (- (mod (/ h 60.0) 2.0) 1.0)))))
          (m (- v c)))
        (let ((rgb (cond
            ((< h 60) (list c x 0))
            ((< h 120) (list x c 0))
            ((< h 180) (list 0 c x))
            ((< h 240) (list 0 x c))
            ((< h 300) (list x 0 c))
            (t (list c 0 x)))))
            (+ (bitwise-shl (to-i32 (* (+ (first rgb) m) 255)) 16)
               (bitwise-shl (to-i32 (* (+ (second rgb) m) 255)) 8)
               (to-i32 (* (+ (third rgb) m) 255))))))

; Rainbow cycle animation
(defun rainbow-cycle (num-leds offset)
    (looprange i 0 num-leds
        (let ((hue (mod (+ (* i (/ 360 num-leds)) offset) 360)))
            (ext-ws2812-set-color i (hsv-to-rgb hue 1.0 1.0)))))

; Run animation loop
(loopwhile t
    (progn
        (def offset (mod (+ offset 5) 360))
        (rainbow-cycle 30 offset)
        (sleep 0.05)))
```

### Pattern 3: Breathing Effect

```lisp
; Breathing (fade in/out)
(defun breathing (color num-leds speed)
    (let ((brightness (* 50 (+ 1 (sin (* (systime) speed))))))
        (ext-ws2812-set-brightness (to-i32 brightness))
        (set-all-leds color num-leds)))

; Run breathing loop
(loopwhile t
    (progn
        (breathing 0x0000FF 30 3.0)  ; Blue breathing
        (sleep 0.02)))
```

### Pattern 4: Chase / Running Lights

```lisp
; Chase pattern
(defun chase (color bg-color num-leds position)
    (looprange i 0 num-leds
        (if (= i position)
            (ext-ws2812-set-color i color)
            (ext-ws2812-set-color i bg-color))))

; Run chase animation
(def pos 0)
(loopwhile t
    (progn
        (chase 0xFF0000 0x000000 30 pos)
        (setq pos (mod (+ pos 1) 30))
        (sleep 0.05)))
```

---

## Motor Telemetry Integration

### Speed-Based Color

```lisp
; Color changes based on speed
(defun speed-color-strip (num-leds)
    (let ((speed (abs (get-rpm)))
          (max-speed 5000))
        (let ((ratio (min 1.0 (/ speed max-speed))))
            ; Gradient: Green → Yellow → Red
            (let ((r (to-i32 (* ratio 255)))
                  (g (to-i32 (* (- 1.0 ratio) 255))))
                (set-all-leds (+ (bitwise-shl r 16) (bitwise-shl g 8)) num-leds)))))

; Run in loop
(loopwhile t
    (progn
        (speed-color-strip 30)
        (sleep 0.1)))
```

### Battery Level Indicator

```lisp
; Battery gauge on LED strip
(defun battery-gauge (num-leds)
    (let ((vin (get-vin))
          (min-v 42.0)   ; Empty voltage (12S)
          (max-v 50.4))  ; Full voltage (12S)
        (let ((ratio (/ (- vin min-v) (- max-v min-v)))
              (lit-leds (to-i32 (* ratio num-leds))))
            (looprange i 0 num-leds
                (if (< i lit-leds)
                    ; Color based on level
                    (if (< ratio 0.2)
                        (ext-ws2812-set-color i 0xFF0000)  ; Red (low)
                        (if (< ratio 0.5)
                            (ext-ws2812-set-color i 0xFFFF00)  ; Yellow
                            (ext-ws2812-set-color i 0x00FF00)))  ; Green
                    (ext-ws2812-set-color i 0x000000))))))  ; Off

; Run gauge update
(loopwhile t
    (progn
        (battery-gauge 30)
        (sleep 0.5)))
```

### Duty Cycle Warning

```lisp
; Flash red when duty cycle high
(defun duty-warning (num-leds threshold)
    (let ((duty (abs (get-duty))))
        (if (> duty threshold)
            (progn
                (set-all-leds 0xFF0000 num-leds)  ; Red warning
                (sleep 0.1)
                (set-all-leds 0x000000 num-leds)  ; Off
                (sleep 0.1))
            (set-all-leds 0x00FF00 num-leds))))  ; Green = OK

; Run with 80% threshold
(loopwhile t
    (duty-warning 30 0.8))
```

---

## Onewheel/Balance Board Patterns

### Tilt-Based Color

```lisp
; Color changes with board tilt
(defun tilt-color (num-leds)
    (let ((pitch (get-imu-pitch))  ; -90 to +90 degrees
          (roll (get-imu-roll)))
        ; Map pitch to hue (nose up = blue, nose down = red)
        (let ((hue (+ 180 (* pitch 2))))
            (set-all-leds (hsv-to-rgb (mod hue 360) 1.0 1.0) num-leds))))

(loopwhile t
    (progn
        (tilt-color 30)
        (sleep 0.05)))
```

### Status Indicators (Front/Rear)

```lisp
; Brake lights (rear LEDs red when braking)
(defun brake-lights (front-leds rear-leds rear-start)
    (let ((current (get-current)))
        ; Front = white (headlights)
        (looprange i 0 front-leds
            (ext-ws2812-set-color i 0xFFFFFF))
        ; Rear = depends on braking
        (looprange i 0 rear-leds
            (if (< current -5.0)  ; Braking
                (ext-ws2812-set-color (+ rear-start i) 0xFF0000)
                (ext-ws2812-set-color (+ rear-start i) 0x330000)))))  ; Dim red

; 10 front LEDs, 10 rear LEDs starting at index 20
(loopwhile t
    (progn
        (brake-lights 10 10 20)
        (sleep 0.05)))
```

---

## Troubleshooting

### LEDs Not Lighting

1. **Check power** - 5V supply adequate?
2. **Check data pin** - Correct GPIO selected in init?
3. **Check first LED** - First LED damaged = whole strip fails
4. **Check logic level** - May need level shifter (3.3V → 5V)

### Flickering or Wrong Colors

1. **Reduce brightness** - Power supply overloaded
2. **Add capacitor** - 1000µF across power rails
3. **Shorter data wire** - Keep under 1 meter
4. **Add resistor** - 300-500Ω on data line

### Only Some LEDs Work

1. **Check solder joints** - Especially at strip connections
2. **Bad LED in chain** - Cut and rejoin around bad LED
3. **Power injection** - Long strips need power at multiple points

---

## Quick Reference

### Init Parameters

```lisp
(ext-ws2812-init num_leds is_ch2 is_tim4 use_rgbw)
; num_leds: 1-300+
; is_ch2: 0=CH1, 1=CH2
; is_tim4: 0=TIM3, 1=TIM4
; use_rgbw: 0=RGB, 1=RGBW
```

### Function Reference

| Function | Arguments | Description |
|----------|-----------|-------------|
| `ext-ws2812-init` | (leds, ch2, tim4, rgbw) | Initialize |
| `ext-ws2812-set-color` | (led_index, color) | Set one LED |
| `ext-ws2812-set-brightness` | (0-100) | Global brightness |

### Color Calculation

```lisp
; Build RGB color
(def color (+ (bitwise-shl r 16) (bitwise-shl g 8) b))

; Extract components
(def r (bitwise-and (bitwise-shr color 16) 0xFF))
(def g (bitwise-and (bitwise-shr color 8) 0xFF))
(def b (bitwise-and color 0xFF))
```

---

## References

- Source: `bldc/lispBM/c_libs/examples/ws2812/code.c` - Native C library
- Source: `vesc_pkg/lib_ws2812/` - Package wrapper
- Related: `led-configuration-troubleshooting.md` - Basic LED setup
- Related: `lispbm-scripting-guide.md` - LispBM scripting basics

---

*Last updated: 2026-01-14 | Deep-dive from bldc/lispBM source*
