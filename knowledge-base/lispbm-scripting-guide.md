# LispBM Custom Scripting Guide

## Overview

**Key Terms:** LispBM, VESC scripting, custom code, Lisp programming, VESC package, automation, custom functions, vesc_pkg, extension functions, script examples

This guide covers writing custom LispBM scripts for VESC, including available functions, common patterns, and package development.

**Source:** bldc/lispBM/lispif_vesc_extensions.c, vesc_pkg/

---

## What is LispBM?

LispBM is a lightweight Lisp interpreter embedded in VESC firmware. It allows:

- Custom motor control logic
- Sensor data processing
- CAN bus communication
- LED and display control
- Persistent settings storage
- Multi-threaded automation

**Key advantage:** Modify behavior without recompiling firmware.

---

## Getting Started

### Running LispBM Scripts

1. Open VESC Tool
2. Go to **VESC Dev Tools → LispBM Scripting**
3. Write or paste your script
4. Click **Upload** to run on VESC
5. Click **Stop** to halt execution

### Basic Syntax

```lisp
; Comments start with semicolon

; Define a variable
(def my-var 42)

; Define a function
(defun double (x)
    (* x 2))

; Call function
(print (double 21))  ; Output: 42

; Conditional
(if (> x 10)
    (print "big")
    (print "small"))

; Loop
(looprange i 0 10
    (print i))
```

---

## Motor Control Functions

### Setting Motor Output

| Function | Description | Example |
|----------|-------------|---------|
| `set-current` | Set motor current (A) | `(set-current 10.0)` |
| `set-current-rel` | Set relative current (-1 to 1) | `(set-current-rel 0.5)` |
| `set-duty` | Set duty cycle (-1 to 1) | `(set-duty 0.3)` |
| `set-brake` | Set brake current (A) | `(set-brake 5.0)` |
| `set-brake-rel` | Set relative brake | `(set-brake-rel 0.2)` |
| `set-rpm` | Set target RPM | `(set-rpm 3000)` |
| `set-pos` | Set position (degrees) | `(set-pos 180.0)` |

### Reading Motor State

| Function | Returns | Example |
|----------|---------|---------|
| `get-rpm` | Motor RPM | `(get-rpm)` |
| `get-current` | Motor current (A) | `(get-current)` |
| `get-current-in` | Input current (A) | `(get-current-in)` |
| `get-duty` | Current duty cycle | `(get-duty)` |
| `get-vin` | Input voltage (V) | `(get-vin)` |
| `get-temp-fet` | FET temperature (°C) | `(get-temp-fet)` |
| `get-temp-mot` | Motor temperature (°C) | `(get-temp-mot)` |
| `get-fault` | Current fault code | `(get-fault)` |

### Example: Simple Throttle Control

```lisp
; Read ADC input and control motor
(loopwhile t
    (progn
        (def throttle (get-adc 0))  ; Read ADC channel 0
        (def mapped (- (* throttle 2.0) 1.0))  ; Map 0-1 to -1 to 1
        (set-current-rel mapped)
        (sleep 0.02)))  ; 50Hz update rate
```

---

## Sensor Functions

### ADC (Analog Input)

```lisp
; Read raw ADC value (0.0 to 3.3V)
(get-adc 0)      ; Channel 0
(get-adc 1)      ; Channel 1

; Read decoded ADC (processed by app config)
(get-adc-decoded 0)
```

### IMU (Accelerometer/Gyroscope)

```lisp
; Get roll, pitch, yaw (degrees)
(get-imu-rpy)    ; Returns (roll pitch yaw)

; Get quaternion
(get-imu-quat)   ; Returns (w x y z)

; Get acceleration (g)
(get-imu-acc)    ; Returns (x y z)

; Get angular velocity (deg/s)
(get-imu-gyro)   ; Returns (x y z)
```

### Example: Tilt-Based Control

```lisp
(loopwhile t
    (progn
        (def rpy (get-imu-rpy))
        (def pitch (ix rpy 1))  ; Get pitch angle

        ; Map pitch to current (-30° to +30° → -1 to 1)
        (def current (/ pitch 30.0))
        (set-current-rel current)
        (sleep 0.01)))
```

---

## CAN Bus Functions

### Local CAN Communication

```lisp
; Send CAN message (standard ID)
(can-send-sid id data)

; Send CAN message (extended ID)
(can-send-eid id data)

; Receive CAN message
(can-recv-sid timeout)  ; Returns (id data) or nil
(can-recv-eid timeout)

; List connected VESC devices
(can-list-devs)  ; Returns list of CAN IDs

; Get local CAN ID
(can-local-id)
```

### Control Remote VESCs

```lisp
; Set duty on remote VESC (CAN ID 1)
(canset-duty 1 0.5)

; Set current on remote VESC
(canset-current 1 15.0)

; Read from remote VESC
(canget-rpm 1)
(canget-current 1)
(canget-vin 1)
```

### Example: Dual Motor Sync

```lisp
; Sync two motors via CAN
(def slave-id 1)

(loopwhile t
    (progn
        (def throttle (get-adc-decoded 0))

        ; Set local motor
        (set-current-rel throttle)

        ; Set remote motor (same current)
        (canset-current-rel slave-id throttle)

        (sleep 0.01)))
```

---

## Threading and Events

### Creating Threads

```lisp
; Spawn a named thread with priority (0-255, higher = more priority)
(spawn "MyThread" 100 my-function arg1 arg2)

; Thread with loop
(loopwhile-thd ("Worker" 150) t
    (progn
        ; Thread code here
        (sleep 0.1)))
```

### Event Handling

```lisp
; Enable event types
(event-enable 'event-can-sid)
(event-enable 'event-data-rx)

; Event handler thread
(defun event-handler ()
    (loopwhile t
        (recv
            ((event-can-sid . ((? id) . (? data)))
                (print (list "CAN:" id data)))
            ((event-data-rx . (? data))
                (print (list "Data:" data)))
            (_ nil))))

(event-register-handler (spawn event-handler))
```

---

## Persistent Storage

### EEPROM Functions

```lisp
; Store float at address 0
(eeprom-store-f 0 3.14)

; Read float from address 0
(eeprom-read-f 0)

; Store integer at address 1
(eeprom-store-i 1 42)

; Read integer from address 1
(eeprom-read-i 1)
```

### Example: Persistent Settings

```lisp
; Settings addresses
(def addr-min-throttle 0)
(def addr-max-throttle 1)

; Load settings on startup
(def min-thr (eeprom-read-f addr-min-throttle))
(def max-thr (eeprom-read-f addr-max-throttle))

; Use default if not set
(if (= min-thr 0.0)
    (progn
        (setq min-thr 0.1)
        (eeprom-store-f addr-min-throttle min-thr)))
```

---

## Configuration Functions

### Read/Write Parameters

```lisp
; Read motor config parameter
(conf-get 'l-current-max)
(conf-get 'foc-motor-r)

; Set motor config parameter
(conf-set 'l-current-max 60.0)

; Store config to flash
(conf-store)
```

### Motor Detection

```lisp
; Run FOC detection
(conf-detect-foc can-id max-loss min-current max-current)

; Measure resistance
(conf-measure-res current)

; Measure inductance
(conf-measure-ind current)
```

---

## Common Patterns

### Low-Pass Filter

```lisp
(defun lpf (val sample fconst)
    (- val (* fconst (- val sample))))

; Usage
(def filtered 0.0)
(loopwhile t
    (progn
        (def raw (get-adc 0))
        (setq filtered (lpf filtered raw 0.1))
        (sleep 0.01)))
```

### Value Clamping

```lisp
(defun clamp (val min-val max-val)
    (cond
        ((< val min-val) min-val)
        ((> val max-val) max-val)
        (t val)))

(defun clamp01 (val)
    (clamp val 0.0 1.0))
```

### Range Mapping

```lisp
(defun map-range (val in-min in-max out-min out-max)
    (+ out-min
       (* (/ (- val in-min) (- in-max in-min))
          (- out-max out-min))))

; Map 0-3.3V to 0-100%
(map-range (get-adc 0) 0.0 3.3 0.0 100.0)
```

### Timeout Reset

```lisp
; Reset watchdog timeout (call regularly to prevent motor stop)
(timeout-reset)
```

---

## Package Development

### Package Structure

```
my-package/
├── description.qml    # Metadata and UI
├── code.lisp          # Main LispBM script
└── src/ (optional)    # C source for native libs
```

### description.qml Example

```qml
import QtQuick 2.0

Item {
    property string name: "My Package"
    property string description: "A custom VESC package"
    property string author: "Your Name"
    property string version: "1.0"
}
```

### Importing Libraries

```lisp
; Import from VESC package
(import "pkg@://vesc_packages/lib_name/lib.vescpkg" 'symbol)
(read-eval-program symbol)

; Import local file
(import "helper.lisp" 'helper)
(read-eval-program helper)

; Import native C library
(import "native_lib.bin" 'mylib)
(load-native-lib mylib)
```

---

## Debugging Tips

### Print Debugging

```lisp
(print "Debug message")
(print (list "Value:" my-var))

; Format numbers
(print (str-from-n 3.14159 "%.2f"))  ; "3.14"
```

### Error Handling

```lisp
; Trap errors
(def result (trap (potentially-failing-code)))

(if (eq (first result) 'exit-ok)
    (print "Success")
    (print "Error occurred"))
```

### System Information

```lisp
(sysinfo 'fw-ver)      ; Firmware version
(sysinfo 'hw-name)     ; Hardware name
(sysinfo 'uuid)        ; VESC UUID
(systime)              ; System time (seconds)
```

---

## Complete Example: Custom Throttle

```lisp
; Custom throttle with expo curve and deadband

(def deadband 0.05)
(def expo 2.0)
(def max-current 40.0)

(defun apply-expo (val exp)
    (* (sign val) (pow (abs val) exp)))

(defun apply-deadband (val db)
    (if (< (abs val) db)
        0.0
        (/ (- val (* (sign val) db)) (- 1.0 db))))

(defun sign (x)
    (cond ((< x 0) -1.0) ((> x 0) 1.0) (t 0.0)))

(loopwhile t
    (progn
        ; Read throttle (0 to 1)
        (def raw (get-adc-decoded 0))

        ; Map to -1 to 1
        (def centered (- (* raw 2.0) 1.0))

        ; Apply deadband
        (def db-applied (apply-deadband centered deadband))

        ; Apply expo curve
        (def expo-applied (apply-expo db-applied expo))

        ; Set current
        (set-current (* expo-applied max-current))

        ; Reset timeout
        (timeout-reset)

        (sleep 0.02)))
```

---

## References

- Source: `bldc/lispBM/lispif_vesc_extensions.c` - 234 VESC extensions
- Source: `vesc_pkg/` - Package examples
- Source: `vesc_pkg/refloat/lisp/` - Refloat scripts
- Related: `vesc-remote-input-configuration.md` - Input setup
- Related: `can-uart-integration-guide.md` - External control

---

*Last updated: 2026-01-14 | Source verified against bldc repository*
