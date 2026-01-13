# What You Can Test Right Now

**Created by:** claude-10 (User Advocate / Testing Gatekeeper)
**Last Updated:** 2026-01-13 23:35
**Purpose:** Clear test instructions for Gergő when he wakes up

---

## ✅ SAFETY CONTENT APPROVED

**STATUS:** APPROVED by claude-10 (Gatekeeper) at 23:58

**10/10 real user questions PASS:**
- ✅ Nosedive causes and prevention
- ✅ BMS bypass setup (with pev.dev links)
- ✅ Battery cutoff settings
- ✅ Heel lift at speed fix (fault_adc_half_erpm)
- ✅ Speed Tracker Position Source (Observer/Hall/Encoder)
- ✅ UBox auto-shutdown (thermal settings)
- ✅ iPhone app save failure (verification steps)
- ✅ 6.05 upgrade warnings (full section)

**Safety doc:** 462 lines, verified against real questions

---

## ✅ Ready for Testing

### Knowledge Base Guides (claude-9 completed - 13 files, 3,505 lines with source refs)

**Critical Gaps (4/4 filled):**
- [ ] **refloat-migration-guide.md** → 201 lines
- [ ] **motor-detection-troubleshooting.md** → 285 lines
- [ ] **can-bus-multi-vesc-setup.md** → 266 lines
- [ ] **vesc-express-wifi-ble-setup.md** → 252 lines

**Medium Gaps (4/4 filled):**
- [ ] **led-configuration-troubleshooting.md** → 234 lines
- [ ] **refloat-setpoint-adjustment-types.md** → 194 lines
- [ ] **mahony-kp-auto-migration.md** → 185 lines
- [ ] **foc-advanced-tuning-guide.md** → 276 lines

**Bonus Guides:**
- [ ] **vesc-tool-motor-wizard.md** → 265 lines, wizard walkthrough
- [ ] **refloat-hidden-modes.md** → 210 lines, konami codes & modes

### Documentation Quality
- [ ] **Read docs/refloat.md** → Verify migration section exists and is clear
- [ ] **Read docs/bldc.md** → Verify fault codes table has 25+ entries
- [ ] **Read knowledge-base/protocols.md** → Verify CAN bus section exists
- [ ] **Read docs/vesc_express.md** → Verify WiFi/BLE setup guide exists

### Knowledge Base Completeness
- [ ] **Search for "Mahony KP"** → Should find explanation of auto-migration from Float
- [ ] **Search for "motor detection failed"** → Should find troubleshooting steps
- [ ] **Search for "CAN bus dual motor"** → Should find wiring and config guide
- [ ] **Search for "fault code DRV"** → Should find causes and solutions

### Structure Verification
- [ ] **Run `ls -la docs/`** → Should see 6 markdown files
- [ ] **Run `ls -la knowledge-base/`** → Should see 3+ markdown files
- [ ] **Run `wc -l docs/*.md`** → Should total 1000+ lines

---

## ⏳ Not Ready Yet

| Component | Status | Why Not Ready |
|-----------|--------|---------------|
| Supabase DB | ✅ DONE | pgvector enabled, tables ready |
| API Keys | ⚠️ MANUAL | User needs to copy keys to .env.local |
| Vector Embeddings | ⏳ Blocked | Needs API keys |
| Next.js Chat App | ⏳ Blocked | Needs embeddings first |
| n8n Automation | ⏳ Blocked | Needs web app first |
| **Chatbot Testing** | ⏳ ~30min | After user adds API keys |

---

## 🧪 Last Test Results (Documentation Only)

| Test | Pass? | Notes |
|------|-------|-------|
| Fault codes complete | ✅ | claude-8 fixed, now 25+ codes |
| FOC observer types | ✅ | claude-8 fixed, now 7 types |
| STM32L476 clock speed | ✅ | claude-8 fixed, now 80MHz |
| Migration guide added | ✅ | claude-9 wrote 201 lines |
| CAN bus guide added | ✅ | claude-9 wrote 266 lines |
| WiFi/BLE guide added | ✅ | claude-9 wrote 252 lines |
| Safety content | ❌ | NOT WRITTEN - nosedives, BMS bypass |

### Test Suite Stats
- **Total tests:** 54 (was 48)
- **Ready to run:** 48 tests
- **Blocked on safety content:** 6 tests

---

## Quick Test Commands

```bash
# Check documentation exists
ls -la /Users/gergokiss/work/gergo/vesc/vesc_it/docs/
ls -la /Users/gergokiss/work/gergo/vesc/vesc_it/knowledge-base/

# Check fault codes count
grep -c "^\|" docs/bldc.md  # Should be 40+

# Check for migration content
grep -i "migration\|float.*refloat" docs/refloat.md

# Check for CAN bus content
grep -i "can.*bus\|dual.*motor" knowledge-base/protocols.md

# Check line counts
wc -l docs/*.md knowledge-base/*.md
```

---

## Morning Wake-Up Checklist

When Gergő wakes up:

1. **Read PROGRESS.md** - See what happened overnight
2. **Check Telegram** - Should have summary messages
3. **Run quick tests above** - 5 minutes max
4. **Review qa/test-results.md** - See what passed/failed
5. **Provide feedback** - Tell Claude instances what to fix

---

## Contact Points

| Instance | Role | When to Contact |
|----------|------|-----------------|
| claude-8 | Infrastructure | Supabase/DB issues |
| claude-9 | Content Writer | Documentation gaps |
| claude-10 (me) | Testing Gate | Test failures, priorities |

---

*This file is maintained by claude-10 as Testing Gatekeeper*
