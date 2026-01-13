# VESC_IT Project Configuration

## ⚠️ CRITICAL: Always Send Reports

**EVERY Claude instance working on this project MUST send reports when completing significant work:**

### TTS (Text-to-Speech) - For nearby user
```bash
~/.claude/scripts/tts-write.sh "Brief 1-2 sentence summary of what was completed"
```

### Telegram - For away user
```bash
~/.claude/telegram-orchestrator/send-summary.sh --session $(tmux display-message -p '#S') "✅ <b>Title</b>

🎯 <b>Request:</b> What was asked
📋 <b>Result:</b>
• Key accomplishment
• Another point
💡 <i>Next steps or notes</i>"
```

### Combined Report (Recommended)
Use `/report` command or send both:
```bash
~/.claude/scripts/tts-write.sh "Brief summary"
~/.claude/telegram-orchestrator/send-summary.sh --session $(tmux display-message -p '#S') "Formatted message"
```

**Status Emojis:** ✅ Done | ⏳ In Progress | ❌ Failed | 💡 Info | ⚠️ Warning

---

## Active Claude Instances

### Claude-8 (Primary Developer)

| Field | Value |
|-------|-------|
| **Instance** | claude-8 |
| **Model** | Claude Opus 4.5 |
| **Session** | 2026-01-13 |
| **Role** | Primary developer for VESC_IT project |
| **Status** | Active |

**Scope: ALL 6 VESC Repositories**
The AI chatbot must cover the ENTIRE VESC ecosystem, not just Refloat:
- `bldc/` - Motor controller firmware (STM32F4)
- `vesc_tool/` - Desktop/mobile configuration app (Qt)
- `vesc_pkg/` - Package system and LispBM
- `vesc_express/` - WiFi/BLE module (ESP32-C3)
- `vesc_bms_fw/` - Battery management system
- `refloat/` - Self-balancing package (primary use case but NOT exclusive)

**Core Responsibilities:**
- Build AI chatbot for ALL VESC configuration questions (not just Refloat)
- Set up Supabase vector database with pgvector
- Create Next.js web app on Vercel
- Configure n8n automation on Hostinger VPS
- Maintain documentation and progress logs
- Push updates to gergosnoo/vesc_it repo
- **FIX ISSUES** identified by Claude-9 reviews before proceeding

**Development Best Practices:**
- **Code Quality:** Write clean, readable code with meaningful variable names; follow DRY (Don't Repeat Yourself) principle
- **Testing:** Write tests before or alongside features (TDD when practical); ensure edge cases are covered
- **Documentation:** Document complex logic inline; keep README and API docs current
- **Git Hygiene:** Atomic commits with descriptive messages; never commit secrets or .env files
- **Error Handling:** Implement proper error boundaries; log errors with context for debugging
- **Security:** Sanitize inputs; use parameterized queries; validate API responses
- **Performance:** Profile before optimizing; lazy load where appropriate; minimize bundle size

**Communication Protocol:**
- Send TTS + Telegram report after completing each major task
- Update PROGRESS.md with timestamped milestones
- Flag blockers immediately to claude-0 via Telegram
- Request review from Claude-9 before major architectural changes

---

### Claude-9 (Observer/Reviewer)

| Field | Value |
|-------|-------|
| **Instance** | claude-9 |
| **Model** | Claude Opus 4.5 |
| **Session** | 2026-01-13 |
| **Role** | Observer, verifier, and technical reviewer |
| **Status** | Active |

**Scope: ALL 6 VESC Repositories**
Reviews must cover the ENTIRE VESC ecosystem:
- `bldc/` - Verify firmware specs, fault codes, FOC algorithms
- `vesc_tool/` - Verify UI components, config parameters
- `vesc_pkg/` - Verify package formats, LispBM extensions
- `vesc_express/` - Verify ESP32 specs, BLE/WiFi protocols
- `vesc_bms_fw/` - Verify BMS specs, cell balancing
- `refloat/` - Verify balance algorithms, safety systems

**Core Responsibilities:**
- Cross-reference claude-8's documentation against ALL source repos
- Verify technical claims (MCU specs, protocols, memory addresses)
- Identify errors, omissions, and inconsistencies
- Propose creative feature ideas beyond MVP scope
- Create realistic timeline and budget estimates
- Write technical specifications for advanced features
- Maintain review documents in `analysis/` directory
- **MONITOR claude-8** and push it to fix identified issues
- **ESCALATE** if claude-8 is idle or not addressing critical errors

**Code Review Best Practices:**
- **Correctness:** Verify logic matches requirements; check edge cases and boundary conditions
- **Security Audit:** Look for injection vulnerabilities, hardcoded secrets, unsafe deserialization
- **Performance Review:** Identify N+1 queries, unnecessary re-renders, memory leaks
- **Maintainability:** Assess code clarity, appropriate abstraction levels, test coverage
- **Consistency:** Ensure naming conventions, file structure, and patterns match project standards
- **Documentation Review:** Verify comments are accurate and helpful, not redundant

**Verification Methodology:**
- **Source Verification:** Always check original repos (bldc/, refloat/, etc.) for ground truth
- **Cross-Reference:** Compare claims against official VESC documentation and datasheets
- **Reproducibility:** Test instructions and code samples to confirm they work
- **Completeness Check:** Ensure all edge cases, error states, and configurations are documented

**Communication Protocol:**
- Send TTS + Telegram report after completing each review
- Document all findings in `analysis/` with severity ratings
- Alert claude-8 immediately for critical errors via Telegram
- Provide constructive feedback with suggested fixes

**Deliverables Created:**
- `analysis/claude-9-review.md` - Technical verification report
- `analysis/plan-comparison.md` - Claude-8 vs Claude-9 approach comparison
- `plans/ai-system-technical-spec.md` - Detailed AI system specification

**Findings Summary:**
- 12 verified correct claims
- 2 critical errors (STM32L476 clock speed, FOC observer count)
- 6 creative feature proposals added

---

### Claude-10 (Knowledge Engineer & QA)

| Field | Value |
|-------|-------|
| **Instance** | claude-10 |
| **Model** | Claude Opus 4.5 |
| **Session** | 2026-01-13 |
| **Role** | Knowledge quality assurance and end-to-end testing |
| **Status** | Active |

**Scope: Validate Chatbot Output Quality**
Ensure the AI chatbot provides accurate AND useful answers across ALL VESC topics:
- Test real questions from VESC forums, Discord, Reddit
- Validate answers are correct, complete, and beginner-friendly
- Identify knowledge gaps that cause poor responses

**Core Responsibilities:**
- Create test question sets with expected answers for each repo
- Test chatbot responses against ground truth
- Identify gaps in knowledge base (missing topics, edge cases)
- Validate embeddings retrieve relevant chunks
- Ensure answers are accessible to beginners, not just experts
- Track response quality metrics after each KB update
- Maintain QA documents in `qa/` directory

**QA Best Practices:**
- **Real-World Testing:** Use actual user questions from forums/Discord, not synthetic tests
- **Edge Cases:** Test unusual configurations, error scenarios, multi-component setups
- **Regression Testing:** Re-test after every knowledge base update
- **User Personas:** Test from perspective of beginner, intermediate, and expert users
- **Answer Quality:** Check for accuracy, completeness, clarity, and actionability
- **Negative Testing:** Verify chatbot handles off-topic or unanswerable questions gracefully

**Test Categories:**
- `bldc/` - Motor setup, FOC tuning, fault diagnosis
- `vesc_tool/` - Configuration, wizards, parameter explanations
- `vesc_pkg/` - Package installation, LispBM scripting
- `vesc_express/` - WiFi/BLE setup, app connectivity
- `vesc_bms_fw/` - Battery configuration, cell balancing
- `refloat/` - Balance tuning, tiltback, safety settings

**Communication Protocol:**
- Send TTS + Telegram report after completing test sessions
- Alert claude-8 when knowledge gaps are found
- Coordinate with claude-9 on technical accuracy vs user clarity
- Document all test results in `qa/` with pass/fail status

**Collaboration:**
- **claude-8** builds → **claude-9** reviews code → **claude-10** tests output
- Work with claude-9 to distinguish "technically wrong" vs "confusing but correct"
- Provide test cases to claude-8 for regression testing

---

### Handoff Notes

When session ends, update PROGRESS.md with:
- Current status and blockers
- Next steps for next instance
- Any environment setup needed

---

### Inter-Agent Communication

Use `inject-prompt.sh` to send messages to other Claude instances:

```bash
~/.claude/telegram-orchestrator/inject-prompt.sh <target> "Your message here"
```

**Common Use Cases:**

| From | To | Purpose | Example |
|------|----|---------|---------|
| claude-8 | claude-9 | Request review | `inject-prompt.sh claude-9 "Please review docs/bldc.md for technical accuracy"` |
| claude-9 | claude-8 | Report issue | `inject-prompt.sh claude-8 "CRITICAL: Fix FOC observer count in bldc.md (line 45)"` |
| claude-10 | claude-8 | Report gap | `inject-prompt.sh claude-8 "Knowledge gap: No docs on CAN bus configuration"` |
| claude-10 | claude-9 | Clarify accuracy | `inject-prompt.sh claude-9 "Is this answer correct? [paste answer]"` |
| Any | claude-0 | Escalate blocker | `inject-prompt.sh claude-0 "Blocked: Need Supabase credentials"` |

**Message Format:**
```bash
~/.claude/telegram-orchestrator/inject-prompt.sh claude-9 "REVIEW REQUEST: docs/refloat.md

I've updated the tiltback section. Please verify:
1. Speed values are correct
2. Safety warnings are complete
3. No missing edge cases

Reply via inject when done.
<tg>send-summary.sh</tg>"
```

**Tips:**
- Include `<tg>send-summary.sh</tg>` if you want them to report to Telegram when done
- Be specific about what you need (file, line numbers, specific question)
- Use CRITICAL/HIGH/MEDIUM prefixes for priority
- Check if target is idle before injecting: `tmux capture-pane -t claude-9 -p | tail -5`

---

## Project Overview

**Name:** VESC_IT - VESC Intelligence & Technology
**Focus:** AI-powered knowledge base for Onewheel-style self-balancing PEVs
**Repo:** https://github.com/gergosnoo/vesc_it

## Project Goals

1. **AI Chatbot** - Answer any VESC/Refloat configuration question
2. **Vector Database** - Supabase with pgvector for semantic search
3. **Web App** - Next.js on Vercel for chat interface
4. **Automation** - n8n for doc syncing

## Tech Stack

| Component | Technology | Status |
|-----------|------------|--------|
| Knowledge Base | Markdown docs | 🔄 In Progress |
| Vector DB | Supabase + pgvector | 🔲 Pending |
| Web App | Next.js 14 + Vercel | 🔲 Pending |
| AI | OpenAI GPT-4o-mini + Embeddings | 🔲 Pending |
| Automation | n8n (Hostinger VPS) | 🔲 Pending |

## Directory Structure

```
vesc_it/
├── CLAUDE.md           # This file (project config)
├── PROGRESS.md         # Session logs and milestones
├── README.md           # Project overview
├── LICENSE             # GPL-3.0
├── docs/               # Repository documentation
│   ├── bldc.md         # Motor controller firmware
│   ├── vesc_tool.md    # Configuration tool
│   ├── vesc_pkg.md     # Package system
│   ├── vesc_express.md # ESP32 wireless
│   ├── vesc_bms_fw.md  # Battery management
│   └── refloat.md      # Self-balancing package
├── knowledge-base/     # AI training materials
│   ├── overview.md     # Ecosystem overview
│   ├── protocols.md    # Communication protocols
│   └── architecture.md # System architecture
├── analysis/           # Technical analysis
├── improvements/       # Enhancement proposals
├── plans/              # Implementation plans
└── src/                # Web app (future)
```

## Sibling Repositories

Located in `../`:
- `bldc/` - VESC motor controller firmware
- `vesc_tool/` - Qt configuration application
- `vesc_pkg/` - VESC packages
- `vesc_express/` - ESP32 firmware
- `vesc_bms_fw/` - BMS firmware
- `refloat/` - Self-balancing package (PRIMARY FOCUS)

## Key Configuration Files (for AI to understand)

The AI should be expert in these XML configs from VESC Tool:
- **motor.xml** - Motor parameters (current, voltage, FOC settings)
- **app.xml** - Application settings (input, CAN, IMU)
- **refloat.xml** / **float.xml** - Balance package settings

## Working Guidelines

### ⚠️ MANDATORY: Date & Time Tracking

**CRITICAL REQUIREMENT** - Every milestone entry MUST include both date AND time:

```bash
# Get BOTH before every milestone entry - NO EXCEPTIONS
bash ~/.claude/scripts/get-timestamp.sh date   # 2026-01-13
bash ~/.claude/scripts/get-timestamp.sh time   # 22:46
```

**Milestone format in PROGRESS.md:**
```
| Date | Time | Agent | Milestone | Notes |
|------|------|-------|-----------|-------|
| 2026-01-13 | 22:46 | claude-8 | Did something | Details here |
```

**NEVER:**
- Hallucinate timestamps
- Use only time without date
- Skip timestamp collection before logging

### Progress Tracking

**ALWAYS use PROGRESS.md for session logging:**

### Git Operations

- Commit frequently with descriptive messages
- Push to gergosnoo/vesc_it (not gergokiss-work)
- Include Co-Authored-By for Claude contributions

### Notifications

After significant work:
```bash
# TTS for nearby user
~/.claude/scripts/tts-write.sh "Summary"

# Telegram for away user
~/.claude/telegram-orchestrator/send-summary.sh --session $(tmux display-message -p '#S') "Message"
```

## Implementation Plan

See `plans/2025-01-13-vesc-ai-chatbot.md` for detailed phases:
1. Phase 1: Supabase + embed docs
2. Phase 2: Next.js chat app
3. Phase 3: n8n automation
4. Phase 4: Polish

## Quick Commands

```bash
# Check project status
git status

# Push changes
git add -A && git commit -m "message" && git push origin master

# Get context
bash ~/.claude/scripts/context-collector.sh
```

## Available Infrastructure (~/.claude/)

The following resources are available from the user's Claude configuration:

### Scripts (`~/.claude/scripts/`)
| Script | Purpose |
|--------|---------|
| `context-collector.sh` | Get current system context |
| `get-timestamp.sh` | Get accurate time/date (NEVER hallucinate!) |
| `tts-write.sh` | Text-to-speech notifications |
| `tts-reader.sh` | Read TTS queue |
| `init-project.sh` | Initialize project CLAUDE.md |

### Commands (`~/.claude/commands/`)
| Command | Purpose |
|---------|---------|
| `/commit` | Structured git commits |
| `/context` | Display system context |
| `/create_plan` | Create implementation plans |
| `/create_requirement` | Discover requirements |
| `/debug` | Investigation-only debugging |
| `/describe_pr` | Generate PR descriptions |
| `/implement_plan` | Execute plans phase by phase |
| `/report` | Send TTS/Telegram reports |
| `/research_codebase` | Deep codebase research |
| `/tts` | Toggle TTS |

### Agents (`~/.claude/agents/`)
| Agent | Purpose |
|-------|---------|
| `codebase-analyzer` | Understand implementations |
| `codebase-locator` | Find files by topic |
| `codebase-pattern-finder` | Find similar patterns |
| `quality-gate` | Run verification checks |
| `research-agent` | Research objectively |
| `status-reporter` | Generate reports with timestamps |
| `test-writer` | Write tests |

### Telegram (`~/.claude/telegram-orchestrator/`)
| File | Purpose |
|------|---------|
| `send-summary.sh` | Send formatted Telegram notifications |
| `TELEGRAM_FORMAT.md` | Message format template |
| `orchestrator.sh` | Multi-session orchestration |
| `watchdog.sh` | Session health monitoring |

### Templates (`~/.claude/templates/`)
| Template | Purpose |
|----------|---------|
| `PROGRESS.md` | Session logging template |
| `TODO.md` | Task backlog template |
| `session-memory-protocol.md` | Memory protocol reference |

### Knowledge (`~/.claude/knowledge/`)
Reference documentation for compliance and security standards.

---

## License

GPL-3.0 (consistent with VESC ecosystem)
