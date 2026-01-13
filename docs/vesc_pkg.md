# VESC Package System

## Overview

The VESC Package system extends VESC functionality through installable packages. Packages contain:

- LispBM scripts for custom logic
- Native C libraries for performance
- QML user interfaces
- Configuration definitions

**Repository:** `../vesc_pkg/`
**License:** GPL-3.0

## Package Types

### Application Packages
Full applications for specific use cases:
- `balance` - Self-balancing control
- `refloat` - Advanced balance package
- `vbms32` - 32-cell BMS management
- `blacktip_dpv` - Underwater scooter

### Library Packages
Reusable components:
- `lib_ws2812` - LED strip driver
- `lib_files` - Fonts, images, MIDI
- `lib_nau7802` - 24-bit ADC driver
- `lib_pn532` - NFC reader driver

## Package Structure

```
package_name/
├── pkgdesc.qml        # Package metadata
├── Makefile           # Build instructions
├── README.md          # Documentation
├── *.lisp             # LispBM scripts
├── ui.qml             # QML user interface
└── native_code/       # C library (optional)
    ├── Makefile
    ├── *.c
    └── conf/
        ├── settings.xml
        └── datatypes.h
```

## Package Descriptor (pkgdesc.qml)

```qml
import QtQuick 2.15

Item {
    property string pkgName: "My Package"
    property string pkgDescriptionMd: "README.md"
    property string pkgLisp: "main.lisp"
    property string pkgQml: "ui.qml"
    property bool pkgQmlIsFullscreen: false
    property string pkgOutput: "mypackage.vescpkg"

    function isCompatible(fwRxParams) {
        return fwRxParams.hwTypeStr().toLowerCase() == "vesc"
    }
}
```

## LispBM Integration

### Loading Native Libraries
```lisp
(import "mylib/mylib.bin" 'mylib)
(load-native-lib mylib)

; Call native function
(ext-mylib-function arg1 arg2)
```

### Importing Packages
```lisp
; Import from package store
(import "pkg::ws2812@://vesc_packages/lib_ws2812/ws2812.vescpkg" 'ws2812)
(load-native-lib ws2812)
```

## Building Packages

### Requirements
- `gcc-arm-embedded` 13+
- `make`
- `vesc_tool` (CLI mode)

### Build Commands
```bash
# Build package
make

# Build with specific vesc_tool
make VESC_TOOL=/path/to/vesc_tool

# Clean build
make clean
```

## Configuration System

### XML Definition (settings.xml)
```xml
<config>
    <param name="my_param" type="double" default="1.0">
        <description>My parameter description</description>
    </param>
</config>
```

### Code Generation
```bash
vesc_tool --xmlConfToCode conf/settings.xml
```

Generates:
- `confparser.h/c` - Serialization code
- `confxml.h/c` - XML embedding
- `datatypes.h` - Type definitions
- `conf_default.h` - Default values

## QML User Interface

```qml
import QtQuick 2.12
import QtQuick.Controls 2.12
import Vedder.vesc.utility 1.0
import Vedder.vesc.commands 1.0
import Vedder.vesc.configparams 1.0

Item {
    id: mainItem
    anchors.fill: parent

    property Commands mCommands: VescIf.commands()
    property ConfigParams mCustomConf: VescIf.customConfig(0)

    // UI components...
}
```

## Available Packages

| Package | Purpose |
|---------|---------|
| balance | Self-balancing board |
| refloat | Advanced balance |
| tnt | Trick and Trail balance |
| vbms32 | 32-cell BMS |
| vbms_harmony32 | Harmony 32-cell BMS |
| blacktip_dpv | Underwater scooter |
| logui | Data logging UI |
| vdisp | Display dashboard |

| Library | Purpose |
|---------|---------|
| lib_ws2812 | WS2812 LED driver |
| lib_files | Fonts, images |
| lib_interpolation | Interpolation |
| lib_nau7802 | NAU7802 ADC |
| lib_pn532 | PN532 NFC |
| lib_midi | MIDI parser |
| lib_disp_ui | Display UI |
| lib_code_server | Remote code |

## Resources

- [GitHub Repository](https://github.com/vedderb/vesc_pkg)
- [Package Development Guide](https://github.com/vedderb/vesc_pkg/blob/master/README.md)
