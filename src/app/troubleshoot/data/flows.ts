import { TroubleshootingFlow } from './types';

export const TROUBLESHOOTING_FLOWS: TroubleshootingFlow[] = [
  // MOTOR DETECTION FLOW
  {
    id: 'motor-detection',
    title: 'Motor Detection Failed',
    description: 'Solve motor detection errors step by step',
    icon: '⚙️',
    color: 'from-blue-500 to-cyan-500',
    startStep: 'start',
    steps: {
      start: {
        id: 'start',
        type: 'question',
        title: 'What error code did you get?',
        description:
          'Check the error message in VESC Tool after detection failed.',
        options: [
          { label: '-10 (Flux linkage failed)', nextStep: 'flux-linkage' },
          { label: '-1 (Bad motor values)', nextStep: 'bad-motor' },
          {
            label: '-100 to -129 (Fault during detection)',
            nextStep: 'fault-during',
          },
          {
            label: "Detection runs but motor doesn't spin",
            nextStep: 'no-spin',
          },
          { label: 'Other / Unknown', nextStep: 'generic' },
        ],
      },

      'flux-linkage': {
        id: 'flux-linkage',
        type: 'action',
        title: 'Flux Linkage Detection Failed (-10)',
        description:
          "The VESC couldn't measure the motor's magnetic field strength. This is usually a connection or current issue.",
        diagram: 'motor-phases',
        checklist: [
          {
            text: 'Check all 3 motor phase wires are connected',
            hint: 'Look for loose bullet connectors',
          },
          {
            text: "Verify phase wires aren't touching each other",
            hint: 'Shorted phases prevent detection',
          },
          {
            text: 'Increase detection current to 5-10A',
            hint: 'Motor Settings > FOC > Detection Current',
          },
          {
            text: 'Try spinning the wheel by hand during detection',
            hint: 'Helps if motor has high cogging',
          },
        ],
        options: [
          { label: 'Fixed! Detection works now', nextStep: 'success' },
          { label: 'Still failing', nextStep: 'flux-advanced' },
        ],
      },

      'flux-advanced': {
        id: 'flux-advanced',
        type: 'action',
        title: 'Advanced Flux Linkage Troubleshooting',
        description: "Let's try some advanced fixes.",
        checklist: [
          {
            text: 'Measure resistance between phase wires (should be < 1 ohm)',
          },
          { text: 'Check motor temperature sensor is connected correctly' },
          { text: 'Try detection with motor disconnected from wheel' },
          { text: 'Use "RL" detection first, then "Lambda"' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Still not working', nextStep: 'escalate' },
        ],
      },

      'bad-motor': {
        id: 'bad-motor',
        type: 'action',
        title: 'Bad Motor Values (-1)',
        description: 'The detected values are outside expected range.',
        diagram: 'motor-params',
        checklist: [
          {
            text: 'Verify motor is compatible with VESC',
            hint: 'Check KV rating, phase count',
          },
          { text: 'Try manual parameter entry if you know specs' },
          { text: 'Check for motor damage (burnt smell, visual damage)' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Values still wrong', nextStep: 'escalate' },
        ],
      },

      'fault-during': {
        id: 'fault-during',
        type: 'question',
        title: 'Fault Occurred During Detection',
        description:
          'A fault code was triggered. The last two digits indicate the specific fault.',
        options: [
          { label: 'Over voltage (-101)', nextStep: 'fault-overvolt' },
          { label: 'Under voltage (-102)', nextStep: 'fault-undervolt' },
          { label: 'DRV error (-103)', nextStep: 'fault-drv' },
          { label: 'Over current (-105)', nextStep: 'fault-overcurrent' },
          { label: 'Over temp (-107 or -115)', nextStep: 'fault-temp' },
          { label: 'Other fault', nextStep: 'fault-generic' },
        ],
      },

      'fault-overvolt': {
        id: 'fault-overvolt',
        type: 'action',
        title: 'Over Voltage Fault (-101)',
        description: 'Battery voltage exceeded VESC limits during detection.',
        checklist: [
          { text: 'Check battery is not fully charged during detection' },
          {
            text: 'Verify voltage settings match your battery (max voltage)',
          },
          { text: 'Check for regen issues - wheel might have spun' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Still getting this fault', nextStep: 'escalate' },
        ],
      },

      'fault-undervolt': {
        id: 'fault-undervolt',
        type: 'action',
        title: 'Under Voltage Fault (-102)',
        description: 'Battery voltage too low during detection.',
        checklist: [
          {
            text: 'Charge battery before detection (50%+ recommended)',
          },
          { text: 'Check battery connections for high resistance' },
          { text: 'Verify min voltage setting matches your battery' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Still failing', nextStep: 'escalate' },
        ],
      },

      'fault-drv': {
        id: 'fault-drv',
        type: 'action',
        title: 'DRV Error (-103)',
        description:
          'The DRV8301/8302 gate driver chip detected a problem. This is often a hardware issue.',
        diagram: 'drv-chip',
        checklist: [
          { text: 'Power cycle the VESC completely' },
          { text: 'Check for visible damage on the VESC' },
          { text: "Verify motor phase wires aren't shorted" },
          { text: 'Try a different motor if available' },
        ],
        options: [
          { label: 'Cleared after power cycle', nextStep: 'success' },
          { label: 'Keeps happening', nextStep: 'drv-failure' },
        ],
      },

      'drv-failure': {
        id: 'drv-failure',
        type: 'escalate',
        title: 'Possible DRV Chip Failure',
        description:
          'Repeated DRV errors usually indicate hardware damage. The VESC may need repair or replacement.',
        links: [
          {
            label: 'VESC Repair Services',
            url: 'https://pev.dev/t/vesc-repair-services/123',
          },
          {
            label: 'DRV Replacement Guide',
            url: 'https://www.youtube.com/watch?v=drv-repair',
          },
        ],
      },

      'fault-overcurrent': {
        id: 'fault-overcurrent',
        type: 'action',
        title: 'Over Current Fault (-105)',
        description: 'Current exceeded safe limits during detection.',
        checklist: [
          { text: 'Lower detection current (try 3-5A first)' },
          { text: 'Check for phase wire shorts' },
          { text: 'Verify motor is not stalled mechanically' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Still failing', nextStep: 'escalate' },
        ],
      },

      'fault-temp': {
        id: 'fault-temp',
        type: 'action',
        title: 'Over Temperature Fault (-107/-115)',
        description: 'VESC or motor too hot during detection.',
        checklist: [
          { text: 'Let VESC cool down before retrying' },
          { text: 'Check heatsink is properly mounted' },
          { text: 'Verify temperature sensor is connected' },
          { text: 'Try detection in a cooler environment' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Overheating persists', nextStep: 'escalate' },
        ],
      },

      'fault-generic': {
        id: 'fault-generic',
        type: 'action',
        title: 'Unknown Fault Code',
        description: 'Try these general troubleshooting steps.',
        checklist: [
          { text: 'Note the exact fault code for reference' },
          { text: 'Power cycle the VESC' },
          { text: 'Reset motor config to defaults' },
          { text: 'Check all connections' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Need more help', nextStep: 'escalate' },
        ],
      },

      'no-spin': {
        id: 'no-spin',
        type: 'action',
        title: "Motor Doesn't Spin During Detection",
        description: "Detection runs but wheel doesn't move.",
        checklist: [
          { text: 'Increase detection current (try 10-15A)' },
          { text: "Check motor phase order isn't reversed" },
          { text: "Verify motor isn't mechanically stuck" },
          { text: 'Try "Open Loop" mode for detection' },
        ],
        options: [
          { label: 'Motor spins now', nextStep: 'success' },
          { label: 'Still no movement', nextStep: 'escalate' },
        ],
      },

      generic: {
        id: 'generic',
        type: 'action',
        title: 'General Detection Troubleshooting',
        description: 'Try these common fixes.',
        checklist: [
          { text: 'Update VESC firmware to latest version' },
          { text: 'Reset motor config to defaults before detection' },
          { text: 'Try detection with battery power, not USB only' },
          {
            text: 'Check detection current is appropriate for motor (5-15A typical)',
          },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Still having issues', nextStep: 'escalate' },
        ],
      },

      success: {
        id: 'success',
        type: 'solution',
        title: '✅ Problem Solved!',
        description:
          'Great! Your motor detection should now work. Remember to write the motor configuration after successful detection.',
        links: [
          { label: 'Next: Configure App Settings', url: '/playground' },
          { label: 'Learn about FOC tuning', url: '/' },
        ],
      },

      escalate: {
        id: 'escalate',
        type: 'escalate',
        title: 'Need More Help',
        description:
          'This issue might need community support or hardware inspection.',
        links: [
          { label: 'Ask on pev.dev Forum', url: 'https://pev.dev' },
          { label: 'Join VESC Discord', url: 'https://discord.gg/vesc' },
          { label: 'Ask our AI Chatbot', url: '/' },
        ],
      },
    },
  },

  // CAN BUS FLOW
  {
    id: 'can-bus',
    title: 'CAN Bus Not Working',
    description: 'Troubleshoot multi-VESC communication',
    icon: '🔌',
    color: 'from-purple-500 to-pink-500',
    startStep: 'start',
    steps: {
      start: {
        id: 'start',
        type: 'question',
        title: "What's the symptom?",
        description: 'How is CAN bus failing?',
        options: [
          { label: 'No devices found on CAN scan', nextStep: 'no-devices' },
          { label: 'Intermittent connection', nextStep: 'intermittent' },
          { label: 'Slave VESC not responding', nextStep: 'slave-silent' },
          { label: 'CAN detection failed (-51)', nextStep: 'detection-failed' },
        ],
      },

      'no-devices': {
        id: 'no-devices',
        type: 'action',
        title: 'No CAN Devices Found',
        description: "The master VESC can't see any slaves.",
        diagram: 'can-wiring',
        checklist: [
          {
            text: 'Verify CAN H to CAN H, CAN L to CAN L wiring',
            hint: 'Crossed wires = no communication',
          },
          {
            text: 'Check each VESC has a UNIQUE CAN ID',
            hint: 'App Settings > General > VESC ID',
          },
          {
            text: 'Confirm CAN baud rate matches on all VESCs',
            hint: 'Usually 500K',
          },
          { text: 'Both VESCs must be powered on' },
        ],
        options: [
          { label: 'Found devices!', nextStep: 'success' },
          { label: 'Still nothing', nextStep: 'can-hardware' },
        ],
      },

      'can-hardware': {
        id: 'can-hardware',
        type: 'action',
        title: 'Check CAN Hardware',
        description: 'Physical layer troubleshooting.',
        checklist: [
          {
            text: 'Add 120Ω termination resistor at each end',
            hint: 'Not in the middle!',
          },
          { text: 'Try lower baud rate (125K)' },
          { text: 'Check for cable damage or loose connectors' },
          { text: 'Test with shorter cable if possible' },
        ],
        options: [
          { label: 'Working now', nextStep: 'success' },
          { label: 'Still failing', nextStep: 'escalate' },
        ],
      },

      intermittent: {
        id: 'intermittent',
        type: 'action',
        title: 'Intermittent CAN Connection',
        description: 'Connection drops randomly.',
        checklist: [
          { text: 'Check for loose connections or vibration issues' },
          { text: 'Verify termination resistors are installed' },
          { text: 'Look for EMI interference from motor wires' },
          { text: 'Try shielded cable for CAN bus' },
        ],
        options: [
          { label: 'Connection stable now', nextStep: 'success' },
          { label: 'Still dropping', nextStep: 'escalate' },
        ],
      },

      'slave-silent': {
        id: 'slave-silent',
        type: 'action',
        title: 'Slave VESC Not Responding',
        description: 'One VESC seen but not responding to commands.',
        checklist: [
          { text: 'Verify slave is configured for CAN forwarding' },
          { text: 'Check slave CAN ID matches what master expects' },
          { text: 'Power cycle both VESCs' },
          { text: 'Update firmware on both to same version' },
        ],
        options: [
          { label: 'Slave responding now', nextStep: 'success' },
          { label: 'Still silent', nextStep: 'escalate' },
        ],
      },

      'detection-failed': {
        id: 'detection-failed',
        type: 'action',
        title: 'CAN Detection Failed (-51)',
        description: 'Motor detection failed over CAN bus.',
        checklist: [
          { text: 'Run detection directly on slave VESC first' },
          { text: 'Verify CAN communication is working before detection' },
          { text: 'Check timeout settings for CAN commands' },
        ],
        options: [
          { label: 'Detection works now', nextStep: 'success' },
          { label: 'Still failing', nextStep: 'escalate' },
        ],
      },

      success: {
        id: 'success',
        type: 'solution',
        title: '✅ CAN Bus Working!',
        description:
          "Your VESCs are communicating. Don't forget to configure CAN status messages if you need real-time data from slaves.",
        links: [{ label: 'Back to Troubleshooting', url: '/troubleshoot' }],
      },

      escalate: {
        id: 'escalate',
        type: 'escalate',
        title: 'Need More Help',
        description:
          'CAN issues can be tricky. Consider getting community help.',
        links: [
          { label: 'CAN Bus Guide', url: '/' },
          { label: 'Ask Community', url: 'https://pev.dev' },
        ],
      },
    },
  },

  // BMS BYPASS FLOW - CRITICAL SAFETY
  {
    id: 'bms-bypass',
    title: 'BMS Bypass Issues',
    description: 'Troubleshoot charge-only BMS configuration safely',
    icon: '🔋',
    color: 'from-orange-500 to-red-500',
    startStep: 'start',
    steps: {
      start: {
        id: 'start',
        type: 'question',
        title: 'What BMS issue are you experiencing?',
        description: 'Select your symptom.',
        options: [
          { label: 'Board cuts out while riding', nextStep: 'cutout' },
          { label: 'BMS not charging correctly', nextStep: 'charge-issue' },
          { label: 'Want to bypass BMS for safety', nextStep: 'bypass-guide' },
          {
            label: 'Already bypassed but having issues',
            nextStep: 'bypass-check',
          },
        ],
      },

      cutout: {
        id: 'cutout',
        type: 'action',
        title: 'BMS Cutout While Riding',
        description:
          'Sudden power loss from BMS protection can cause NOSEDIVE. This is why charge-only bypass exists.',
        diagram: 'bms-cutout',
        checklist: [
          {
            text: 'Check if BMS has discharge current limit',
            hint: 'Many FM BMS cut at 30-40A',
          },
          {
            text: 'Check cell voltage under load',
            hint: 'One weak cell can trigger cutoff',
          },
          {
            text: 'Consider charge-only bypass for safety',
            hint: 'Removes BMS from discharge path',
          },
        ],
        options: [
          { label: 'I want to bypass discharge', nextStep: 'bypass-guide' },
          { label: 'Need to diagnose further', nextStep: 'escalate' },
        ],
      },

      'charge-issue': {
        id: 'charge-issue',
        type: 'action',
        title: 'BMS Charging Problems',
        description: 'Battery not charging properly through BMS.',
        checklist: [
          { text: 'Verify charger output voltage matches battery' },
          { text: 'Check charging port and cable for damage' },
          { text: 'Confirm BMS balance wires are connected' },
          { text: 'Check for cell voltage imbalance (>0.1V spread)' },
        ],
        options: [
          { label: 'Charging works now', nextStep: 'success' },
          { label: 'Still not charging', nextStep: 'escalate' },
        ],
      },

      'bypass-guide': {
        id: 'bypass-guide',
        type: 'action',
        title: '⚠️ CRITICAL: Charge-Only Bypass',
        description:
          'There is a RIGHT way and a WRONG way to bypass BMS discharge.',
        diagram: 'bms-bypass-methods',
        checklist: [
          {
            text: '❌ WRONG: Bridging B- terminal directly',
            hint: 'This DISABLES overcharge protection → FIRE RISK from regen!',
          },
          {
            text: '✅ RIGHT: Charge-only wiring',
            hint: 'BMS monitors charging, VESC handles discharge. Regen protection preserved.',
          },
          {
            text: 'Set VESC voltage limits to match battery',
            hint: 'l_min_vin above cell minimum, l_max_vin below cell max',
          },
          { text: 'Configure LV tiltback above BMS cutoff voltage' },
        ],
        options: [
          { label: 'Show me wiring guides', nextStep: 'wiring-links' },
          {
            label: 'Already done, still having issues',
            nextStep: 'bypass-check',
          },
        ],
      },

      'wiring-links': {
        id: 'wiring-links',
        type: 'solution',
        title: 'Charge-Only Wiring Guides',
        description: 'Use these guides for the CORRECT charge-only method:',
        links: [
          {
            label: 'FM BMS Charge-Only Guide',
            url: 'https://pev.dev/t/guide-how-to-wire-fm-bms-as-charge-only-for-your-vesc/322',
          },
          {
            label: 'Pint BMS Bypass (Proper Method)',
            url: 'https://pev.dev/t/pint-vesc-fm-bms-bypass-the-proper-way/693',
          },
          {
            label: 'General VESC Setup',
            url: 'https://fallman.tech/onewheel-vesc/',
          },
        ],
      },

      'bypass-check': {
        id: 'bypass-check',
        type: 'question',
        title: 'Checking Your Bypass',
        description: 'How did you wire the BMS bypass?',
        options: [
          { label: 'I bridged the B- terminal', nextStep: 'b-minus-warning' },
          { label: 'BMS is on charge circuit only', nextStep: 'charge-only-check' },
          { label: 'Not sure / someone else did it', nextStep: 'verify-method' },
        ],
      },

      'b-minus-warning': {
        id: 'b-minus-warning',
        type: 'escalate',
        title: '🔥 DANGER: B- Bridge Method',
        description:
          'Bridging B- DISABLES overcharge protection! Regenerative braking can overcharge your cells, causing thermal runaway and FIRE.',
        links: [
          {
            label: '⚠️ Rewire to charge-only method',
            url: 'https://pev.dev/t/guide-how-to-wire-fm-bms-as-charge-only-for-your-vesc/322',
          },
        ],
      },

      'verify-method': {
        id: 'verify-method',
        type: 'action',
        title: 'Verify Your Bypass Method',
        description: 'Check how your BMS is wired.',
        checklist: [
          {
            text: 'Trace the main discharge wire path',
            hint: 'Does it go through the BMS or bypass it?',
          },
          { text: 'Check if B- terminal has a jumper wire' },
          { text: 'Verify charger connects to BMS input' },
        ],
        options: [
          { label: 'B- is bridged', nextStep: 'b-minus-warning' },
          { label: 'Proper charge-only wiring', nextStep: 'charge-only-check' },
        ],
      },

      'charge-only-check': {
        id: 'charge-only-check',
        type: 'action',
        title: 'Verifying Charge-Only Setup',
        description: "Your method is correct. Let's check the configuration.",
        checklist: [
          {
            text: 'VESC l_min_vin set above cell minimum (e.g., 3.0V × cells)',
          },
          {
            text: 'VESC l_max_vin set below cell maximum (e.g., 4.15V × cells)',
          },
          { text: 'LV tiltback triggers before VESC cutoff' },
          { text: 'HV tiltback set below max to prevent regen cutoff' },
        ],
        options: [
          { label: 'All configured correctly', nextStep: 'success' },
          { label: 'Need help with settings', nextStep: 'escalate' },
        ],
      },

      success: {
        id: 'success',
        type: 'solution',
        title: '✅ BMS Configured Safely',
        description:
          'Your charge-only bypass is correctly set up. Ride safe!',
        links: [{ label: 'Back to Troubleshooting', url: '/troubleshoot' }],
      },

      escalate: {
        id: 'escalate',
        type: 'escalate',
        title: 'Get Expert Help',
        description:
          'BMS configuration is safety-critical. Consider getting community review.',
        links: [
          { label: 'pev.dev BMS Forum', url: 'https://pev.dev/c/battery/bms' },
          { label: 'Ask our AI Chatbot', url: '/' },
        ],
      },
    },
  },

  // FOOTPAD SENSOR FLOW
  {
    id: 'footpad-sensor',
    title: 'Footpad Sensor Issues',
    description: 'Troubleshoot engagement, disengagement, and sensor faults',
    icon: '👟',
    color: 'from-green-500 to-teal-500',
    startStep: 'start',
    steps: {
      start: {
        id: 'start',
        type: 'question',
        title: 'What footpad issue are you having?',
        description: 'Select the symptom that best describes your problem.',
        options: [
          { label: 'Board won\'t engage (both feet on)', nextStep: 'no-engage' },
          { label: 'Board disengages while riding', nextStep: 'disengage' },
          {
            label: 'Heel lift not working at speed (6.05)',
            nextStep: 'heel-lift-speed',
          },
          { label: 'Sensor readings inconsistent', nextStep: 'calibration' },
        ],
      },

      'no-engage': {
        id: 'no-engage',
        type: 'action',
        title: 'Board Won\'t Engage',
        description: 'Both feet on but board doesn\'t activate.',
        checklist: [
          {
            text: 'Check ADC readings in VESC Tool RT Data',
            hint: 'ADC1 and ADC2 should change when stepping on pads',
          },
          { text: 'Verify footpad connector is fully seated' },
          { text: 'Check sensor thresholds in Refloat config' },
          { text: 'Clean sensor surface if dirty or wet' },
        ],
        options: [
          { label: 'Board engages now', nextStep: 'success' },
          { label: 'Still not working', nextStep: 'sensor-hardware' },
        ],
      },

      'sensor-hardware': {
        id: 'sensor-hardware',
        type: 'action',
        title: 'Check Sensor Hardware',
        description: 'Physical sensor troubleshooting.',
        checklist: [
          { text: 'Test each sensor half independently' },
          { text: 'Check for damaged wires or connectors' },
          { text: 'Verify sensor type matches VESC config' },
          { text: 'Try cleaning with isopropyl alcohol' },
        ],
        options: [
          { label: 'Fixed!', nextStep: 'success' },
          { label: 'Sensor may be damaged', nextStep: 'escalate' },
        ],
      },

      disengage: {
        id: 'disengage',
        type: 'action',
        title: 'Unexpected Disengagement',
        description: 'Board turns off while riding.',
        checklist: [
          { text: 'Check for moisture on sensor surface' },
          { text: 'Verify grip tape is not too thick over sensor' },
          { text: 'Increase sensor hysteresis in config' },
          { text: 'Check for loose footpad mounting' },
        ],
        options: [
          { label: 'Stays engaged now', nextStep: 'success' },
          { label: 'Still dropping out', nextStep: 'calibration' },
        ],
      },

      'heel-lift-speed': {
        id: 'heel-lift-speed',
        type: 'action',
        title: '⚠️ VESC 6.05 Heel Lift Issue',
        description:
          'After upgrading to VESC 6.05, heel lift may stop working at higher speeds. This is due to fault_adc_half_erpm behavior change.',
        diagram: 'heel-lift-erpm',
        checklist: [
          {
            text: 'Go to Refloat Cfg → Faults',
            hint: 'Find the fault_adc_half_erpm setting',
          },
          {
            text: 'Set fault_adc_half_erpm = 0',
            hint: 'This makes heel lift work at ALL speeds',
          },
          { text: 'Write configuration and test' },
        ],
        options: [
          { label: 'Heel lift works at all speeds now', nextStep: 'success' },
          { label: 'Still not working', nextStep: 'escalate' },
        ],
      },

      calibration: {
        id: 'calibration',
        type: 'action',
        title: 'Sensor Calibration',
        description: 'Fine-tune sensor thresholds.',
        checklist: [
          { text: 'Open VESC Tool RT Data tab' },
          { text: 'Note ADC values when off sensor (0.5-1.5V typical)' },
          { text: 'Note ADC values when pressing firmly (2.5-3.5V typical)' },
          { text: 'Set thresholds with 0.3V margin from observed values' },
        ],
        options: [
          { label: 'Calibration complete', nextStep: 'success' },
          { label: 'Values not changing', nextStep: 'sensor-hardware' },
        ],
      },

      success: {
        id: 'success',
        type: 'solution',
        title: '✅ Footpad Working!',
        description:
          'Your sensors are properly configured. Always test at low speed first!',
        links: [{ label: 'Back to Troubleshooting', url: '/troubleshoot' }],
      },

      escalate: {
        id: 'escalate',
        type: 'escalate',
        title: 'Need More Help',
        description: 'Footpad issues can be hardware-related.',
        links: [
          { label: 'Sensor Replacement Guide', url: 'https://pev.dev' },
          { label: 'Ask our AI Chatbot', url: '/' },
        ],
      },
    },
  },

  // NOSEDIVE PREVENTION FLOW
  {
    id: 'nosedive-prevention',
    title: 'Prevent Nosedives',
    description: 'Understand and configure safety settings',
    icon: '🛡️',
    color: 'from-red-500 to-orange-500',
    startStep: 'start',
    steps: {
      start: {
        id: 'start',
        type: 'question',
        title: 'What brings you here?',
        description: 'Let\'s make sure you\'re riding safely.',
        options: [
          { label: 'Just crashed / almost crashed', nextStep: 'after-crash' },
          { label: 'Want to prevent future nosedives', nextStep: 'prevention' },
          { label: 'Understanding duty cycle warnings', nextStep: 'duty-explained' },
          { label: 'Setting up tiltback correctly', nextStep: 'tiltback-setup' },
        ],
      },

      'after-crash': {
        id: 'after-crash',
        type: 'question',
        title: 'What happened?',
        description: 'Understanding the cause helps prevent recurrence.',
        options: [
          { label: 'Board cut out suddenly', nextStep: 'sudden-cutout' },
          { label: 'Nose dropped on a hill', nextStep: 'hill-nosedive' },
          { label: 'Happened at high speed', nextStep: 'speed-nosedive' },
          { label: 'Board felt sluggish before crash', nextStep: 'sluggish-before' },
        ],
      },

      'sudden-cutout': {
        id: 'sudden-cutout',
        type: 'action',
        title: 'Sudden Cutout Analysis',
        description: 'Board stopped without warning - likely a fault or BMS issue.',
        checklist: [
          { text: 'Check VESC fault log in terminal (faults command)' },
          { text: 'Look for overcurrent, overvoltage, or DRV faults' },
          { text: 'If BMS is in discharge path, consider charge-only bypass' },
          { text: 'Check battery cell balance' },
        ],
        options: [
          { label: 'Found the cause', nextStep: 'prevention' },
          { label: 'No faults found', nextStep: 'escalate' },
        ],
      },

      'hill-nosedive': {
        id: 'hill-nosedive',
        type: 'action',
        title: 'Hill Nosedive',
        description: 'Motor hit torque limit trying to maintain balance on incline.',
        checklist: [
          { text: 'Check if surge_duty_start is enabled in Refloat' },
          { text: 'Verify tiltback duty is set to 80-82%' },
          { text: 'Enable booster for extra surge capacity' },
          { text: 'Consider riding slower on steep hills' },
        ],
        options: [
          { label: 'Settings updated', nextStep: 'prevention' },
          { label: 'Already had these settings', nextStep: 'escalate' },
        ],
      },

      'speed-nosedive': {
        id: 'speed-nosedive',
        type: 'action',
        title: 'High Speed Nosedive',
        description: 'Hit duty cycle limit at top speed.',
        checklist: [
          {
            text: 'Check your tiltback settings',
            hint: 'Duty tiltback should be 80-82%, not 90%+',
          },
          { text: 'Verify haptic buzz is enabled and you can feel it' },
          { text: 'Consider lower top speed for your battery voltage' },
          { text: 'Full battery = higher safe speed, low battery = slower' },
        ],
        options: [
          { label: 'Understood, adjusting settings', nextStep: 'prevention' },
          { label: 'Still need help', nextStep: 'escalate' },
        ],
      },

      'sluggish-before': {
        id: 'sluggish-before',
        type: 'action',
        title: 'Sluggish Response Before Crash',
        description: 'Board was fighting to keep you balanced - motor at limit.',
        checklist: [
          { text: 'This is called duty cycle limiting' },
          { text: 'Tiltback should have warned you to slow down' },
          { text: 'If you didn\'t feel tiltback, check settings' },
          { text: 'Haptic buzz is another important warning' },
        ],
        options: [
          { label: 'Check my tiltback settings', nextStep: 'tiltback-setup' },
          { label: 'Tiltback was working', nextStep: 'prevention' },
        ],
      },

      prevention: {
        id: 'prevention',
        type: 'action',
        title: 'Nosedive Prevention Checklist',
        description: 'Essential settings for safe riding.',
        checklist: [
          {
            text: 'Tiltback Duty: 80-82%',
            hint: 'Refloat Cfg → Tiltback → Duty Cycle',
          },
          {
            text: 'Haptic Buzz enabled and strong',
            hint: 'You should clearly feel the warning',
          },
          { text: 'Surge Booster enabled for quick torque response' },
          { text: 'Know your battery voltage (lower = less headroom)' },
          { text: 'Ride conservatively until you know your limits' },
        ],
        options: [
          { label: 'All set!', nextStep: 'success' },
          { label: 'Need more detail on tiltback', nextStep: 'tiltback-setup' },
        ],
      },

      'duty-explained': {
        id: 'duty-explained',
        type: 'action',
        title: 'Understanding Duty Cycle',
        description: 'Duty cycle is how hard your motor is working (0-100%).',
        checklist: [
          {
            text: '100% duty = motor at absolute limit',
            hint: 'No more torque available for balance',
          },
          {
            text: 'Tiltback at 80% gives 20% headroom for bumps',
          },
          { text: 'Speed and hills both increase duty' },
          { text: 'Low battery = less available power = higher duty at same speed' },
        ],
        options: [
          { label: 'Got it, show prevention settings', nextStep: 'prevention' },
          { label: 'Configure tiltback', nextStep: 'tiltback-setup' },
        ],
      },

      'tiltback-setup': {
        id: 'tiltback-setup',
        type: 'action',
        title: 'Tiltback Configuration',
        description: 'Proper tiltback saves lives.',
        checklist: [
          {
            text: 'Open Refloat Cfg → Tiltback',
          },
          {
            text: 'Set Duty Cycle tiltback to 80-82%',
            hint: 'Not 90%! That leaves no safety margin',
          },
          {
            text: 'Set tiltback strength to 3-5°',
            hint: 'You should clearly feel it pushing back',
          },
          { text: 'Enable haptic buzz as secondary warning' },
          { text: 'Test at low speed to feel what it\'s like' },
        ],
        options: [
          { label: 'Configured!', nextStep: 'success' },
          { label: 'Need more help', nextStep: 'escalate' },
        ],
      },

      success: {
        id: 'success',
        type: 'solution',
        title: '✅ Ride Safe!',
        description:
          'You\'ve taken important steps to prevent nosedives. Remember: respect the tiltback, it\'s trying to save you.',
        links: [
          { label: 'Safety Visualizer', url: '/safety' },
          { label: 'Parameter Playground', url: '/playground' },
        ],
      },

      escalate: {
        id: 'escalate',
        type: 'escalate',
        title: 'Get Expert Review',
        description: 'Have an experienced rider review your setup.',
        links: [
          { label: 'pev.dev Community', url: 'https://pev.dev' },
          { label: 'Ask our AI Chatbot', url: '/' },
        ],
      },
    },
  },
];

export function getFlowById(id: string): TroubleshootingFlow | undefined {
  return TROUBLESHOOTING_FLOWS.find((flow) => flow.id === id);
}
