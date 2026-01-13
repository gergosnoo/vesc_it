# VESC_IT Project Configuration

## Active Claude Instance

| Field | Value |
|-------|-------|
| **Instance** | claude-8 |
| **Model** | Claude Opus 4.5 |
| **Session** | 2026-01-13 |
| **Role** | Primary developer for VESC_IT project |
| **Status** | Active |

### Responsibilities (claude-8)

- Build AI chatbot for VESC/Refloat configuration questions
- Set up Supabase vector database with pgvector
- Create Next.js web app on Vercel
- Configure n8n automation on Hostinger VPS
- Maintain documentation and progress logs
- Push updates to gergosnoo/vesc_it repo

### Handoff Notes

When session ends, update PROGRESS.md with:
- Current status and blockers
- Next steps for claude-9 or later instance
- Any environment setup needed

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
| Knowledge Base | Markdown docs | ✅ Complete |
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

### Progress Tracking

**ALWAYS use PROGRESS.md for session logging:**

```bash
# Get accurate timestamps before logging
bash ~/.claude/scripts/get-timestamp.sh time   # HH:MM
bash ~/.claude/scripts/get-timestamp.sh date   # YYYY-MM-DD
```

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

## License

GPL-3.0 (consistent with VESC ecosystem)
