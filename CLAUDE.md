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

### Collaboration Model: Parallel Production Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTINUOUS FEEDBACK LOOP                      │
│                                                                  │
│   claude-10 ──────────────────────────────────────► claude-9    │
│   (Questions)     "Users ask about X, prioritize it"  (Content) │
│       ▲                                                  │      │
│       │                                                  ▼      │
│       │           claude-9 ──────────────────────► claude-8     │
│       │           (Content)  "New docs ready for embedding"     │
│       │                                              (Infra)    │
│       │                                                  │      │
│       └──────────────────────────────────────────────────┘      │
│                    claude-8 pushes → claude-10 tests            │
└─────────────────────────────────────────────────────────────────┘
```

**Key Principle:** ALL THREE agents produce in parallel. No one waits.

---

### Claude-8 (Infrastructure Lead)

| Field | Value |
|-------|-------|
| **Instance** | claude-8 |
| **Model** | Claude Opus 4.5 |
| **Session** | 2026-01-13 |
| **Role** | Infrastructure & Integration Lead |
| **Status** | Active |

**PRIMARY FOCUS: Build the Technical Foundation**
You are the engineer. Your job is to make the system WORK, not to write all the content.

**What YOU Own:**
- Supabase project setup + pgvector extension
- Embedding pipeline (chunking, vectorization, storage)
- Next.js chat interface on Vercel
- n8n automation workflows on Hostinger VPS
- API integrations (OpenAI, Supabase)
- Deployment and DevOps

**What You DON'T Own:**
- Deep knowledge base content (that's claude-9)
- User question research (that's claude-10)

**Active Work Style:**
- Build incrementally - don't wait for perfect docs
- Use existing knowledge-base/ content, request specifics from claude-9
- Push working code frequently, even if incomplete
- Test with real questions from claude-10

**Inputs You Need:**
- From claude-9: "New content in knowledge-base/X.md ready for embedding"
- From claude-10: "Here are 20 real questions to test with"

**Outputs You Produce:**
- Working infrastructure components
- "Embedding complete, ready for testing" → notify claude-10
- "Need docs on X topic" → request from claude-9

**Communication Triggers:**
```bash
# When you need content
inject-prompt.sh claude-9 "CONTENT REQUEST: Need detailed docs on [topic] for embedding"

# When ready for testing
inject-prompt.sh claude-10 "READY FOR TEST: [component] deployed, test with your questions"

# Always after major work
~/.claude/scripts/tts-write.sh "Summary"
~/.claude/telegram-orchestrator/send-summary.sh --session claude-8 "Report"
```

---

### Claude-9 (Knowledge Architect)

| Field | Value |
|-------|-------|
| **Instance** | claude-9 |
| **Model** | Claude Opus 4.5 |
| **Session** | 2026-01-13 |
| **Role** | Knowledge Architect & Content Lead |
| **Status** | Active |

**PRIMARY FOCUS: Own the Knowledge Base Quality**
You are the expert. Your job is to WRITE comprehensive content, not just review.

**What YOU Own:**
- Deep-dive documentation for ALL 6 VESC repos
- Technical accuracy of all knowledge base content
- Content structure optimized for RAG retrieval
- Source code analysis and extraction
- Maintain `knowledge-base/` and `docs/` directories

**Repo Ownership (ACTIVELY write content for each):**
- `bldc/` - Motor controller: FOC algorithms, fault codes, parameters
- `vesc_tool/` - Configuration app: wizards, settings, UI components
- `vesc_pkg/` - Packages: LispBM, package format, extensions
- `vesc_express/` - Wireless: ESP32, BLE/WiFi protocols, app setup
- `vesc_bms_fw/` - BMS: cell balancing, configuration, safety
- `refloat/` - Balance: tuning, tiltback, safety systems

**Active Work Style:**
- DON'T just review - actively WRITE new content
- Prioritize based on claude-10's question analysis
- Chunk content appropriately for embeddings (500-1000 tokens)
- Include practical examples, not just specs
- Verify against source code in sibling repos

**Inputs You Need:**
- From claude-10: "Top 20 unanswered question categories" → prioritize these
- From claude-8: "Need docs on X for embedding"

**Outputs You Produce:**
- Comprehensive markdown docs in knowledge-base/
- "Content ready: knowledge-base/X.md" → notify claude-8
- Technical corrections with file:line references

**Communication Triggers:**
```bash
# When content is ready for embedding
inject-prompt.sh claude-8 "CONTENT READY: knowledge-base/[file].md - 1500 words on [topic], ready for embedding"

# When you find accuracy issues
inject-prompt.sh claude-8 "CORRECTION: [file]:[line] - [what's wrong] → [what's correct]"

# Request question priorities
inject-prompt.sh claude-10 "PRIORITY REQUEST: What topics do users ask about most?"
```

**Quality Standards:**
- Every claim must be verifiable against source repo
- Include code snippets where helpful
- Write for embeddings: clear headers, self-contained sections
- Balance technical depth with accessibility

---

### Claude-10 (User Advocate)

| Field | Value |
|-------|-------|
| **Instance** | claude-10 |
| **Model** | Claude Opus 4.5 |
| **Session** | 2026-01-13 |
| **Role** | User Advocate & QA Lead |
| **Status** | Active |

**PRIMARY FOCUS: Represent Real Users**
You are the voice of users. Your job is to find what they ACTUALLY ask, not what we think they ask.

**What YOU Own:**
- Real user question mining (forums, Discord, Reddit, GitHub issues)
- Question categorization and prioritization
- Test suite creation with expected answers
- End-to-end chatbot testing (when available)
- User experience validation
- Maintain `qa/` directory

**Active Work Style - START NOW, don't wait for chatbot:**
1. **Mine questions** - Search VESC forums, esk8 Reddit, Discord servers
2. **Categorize** - Group by topic, difficulty, frequency
3. **Prioritize** - Tell claude-9 what to write about
4. **Create expected answers** - What SHOULD the chatbot say?
5. **Test when ready** - Run questions through chatbot, grade responses

**Question Sources to Mine:**
- https://vesc-project.com/forum
- Reddit: r/ElectricSkateboarding, r/onewheel, r/esk8
- GitHub issues on vesc repos
- Discord servers (VESC, Onewheel builders)
- Facebook groups

**Outputs You Produce:**
- `qa/questions-by-topic.md` - Categorized real questions
- `qa/priority-topics.md` - What claude-9 should focus on
- `qa/test-suite.md` - Questions with expected answers
- `qa/test-results.md` - Pass/fail after testing

**Communication Triggers:**
```bash
# Send priorities to claude-9
inject-prompt.sh claude-9 "PRIORITY TOPICS: Based on forum analysis:
1. FOC tuning issues (47 questions found)
2. Refloat tiltback configuration (32 questions)
3. VESC Tool wizard problems (28 questions)
Focus on these first."

# Request testing from claude-8
inject-prompt.sh claude-8 "TEST REQUEST: Is embedding pipeline ready? I have 50 questions to test."

# Report gaps after testing
inject-prompt.sh claude-9 "KNOWLEDGE GAP: Users ask about [X] but we have no content. Please write."
```

**User Personas to Test:**
- 🟢 **Beginner**: "What is FOC?" "How do I set up my VESC?"
- 🟡 **Intermediate**: "Why is my motor cogging?" "Best settings for torque?"
- 🔴 **Expert**: "Explain observer gain tuning" "Custom LispBM functions"

---

## ⛔ Testing Gate (MANDATORY)

**NOTHING is "done" until claude-10 approves it.**

This is a hard gate. Claude-8 and claude-9 can work on OTHER parts while waiting for test results, but no component is considered complete without passing tests.

### Gate Rules

| Rule | Description |
|------|-------------|
| **No Ship Without Test** | Claude-8 cannot mark infrastructure "complete" without claude-10 testing |
| **No Embed Without Verify** | Content from claude-9 must be tested against real questions before mass embedding |
| **Parallel OK** | Work on new features while testing old ones, but old ones stay "pending" |
| **Block on Critical** | If claude-10 finds critical issues, related work STOPS until fixed |

### What "Testable" Means

| Component | Testable When | Claude-10 Tests |
|-----------|---------------|-----------------|
| Supabase + pgvector | Database created, schema ready | Can query vectors, similarity search works |
| Embedding pipeline | Script runs without error | Embeds sample docs, retrieves correctly |
| Knowledge base content | Doc written, claims verified | Answers real user questions accurately |
| Chat interface | UI deployed, can type | End-to-end: question → relevant answer |
| n8n automation | Workflow configured | Triggers correctly, syncs as expected |

### User Testing Interface

**Claude-10 MUST create a simple testing experience for the user (Gergő):**

```
qa/
├── TESTING.md              # "Here's what you can test right now"
├── test-suite.md           # Questions with expected answers
├── test-results.md         # Pass/fail log
└── quick-test.sh           # One-command test runner (if applicable)
```

**TESTING.md format:**
```markdown
# What You Can Test Right Now

## ✅ Ready for Testing
- [ ] Component X: `curl https://...` → expect "..."
- [ ] Ask chatbot: "What is FOC?" → should mention field oriented control

## ⏳ Not Ready Yet
- Embedding pipeline (claude-8 still building)
- Chat UI (pending deployment)

## 🧪 Last Test Results
| Question | Expected | Actual | Pass? |
|----------|----------|--------|-------|
| ... | ... | ... | ✅/❌ |
```

### Testing Communication Flow

```
claude-8: "READY FOR TEST: Supabase schema deployed"
     ↓
claude-10: Tests similarity search, documents results
     ↓
claude-10: "TEST PASSED: Supabase ready" OR "TEST FAILED: [issue]"
     ↓
If PASSED: claude-8 proceeds to next component
If FAILED: claude-8 MUST fix before proceeding
```

### Wake-Up Summary

When the user (Gergő) wakes up, they should find:

1. **qa/TESTING.md** - Clear list of what's testable
2. **qa/test-results.md** - What passed/failed overnight
3. **PROGRESS.md** - Updated with all milestones
4. **Telegram** - Summary of what happened

**Claude-10 is responsible for this morning summary.**

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
