# Claude-8 Context

> **Role:** Infrastructure Lead
> **Last Updated:** 2026-01-14 09:28

## Current Focus
🏆 ALL FEATURES LIVE & TESTED (09:28)
- 5 routes deployed and working
- 413 chunks embedded (20 KB files)
- 10/10 QA tests passing
- Learning Center bug fixed

**Current Routes (all ✅ LIVE):**
- / - Chatbot (413 embeddings)
- /learn - Learning Center (3 paths, interactive lessons)
- /playground - Parameter visualizer (3D board)
- /safety - Safety headroom simulator
- /troubleshoot - Troubleshooting wizard (5 flows)

## Blockers & Pending
- **n8n URL needed** - Need VPS URL to set up automation workflow
- No other blockers

## Key Learnings
- **tsx memory leak**: Python > Node.js for embedding scripts
- **Step type handling**: lesson pages need to handle 'text', 'interactive', 'simulator' types
- **Markdown in content**: Split by \n and render manually, not whitespace-pre-wrap

## Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase | ✅ LIVE | hbllswwmktfqoeslgvgg.supabase.co |
| pgvector | ✅ READY | 1536 dimensions |
| Embeddings | ✅ 413 chunks | 20 KB files embedded |
| Next.js | ✅ LIVE | 5 routes deployed |
| Vercel | ✅ LIVE | vesc-it.vercel.app (Frankfurt) |
| n8n | 🔲 PENDING | Needs VPS URL |

## QA Status
- **All Tests**: 10/10 PASS
- **Chatbot**: BMS, Amps, Faults, Hardware, tiltback_duty ✅
- **UI Features**: Playground, Safety, Troubleshoot, Learn ✅

## If I Crash - Continue Here

**Current State:** All features LIVE, QA APPROVED, ready for wake-up
**Next Action:**
1. Wait for Gergő to test
2. n8n automation (needs VPS URL)
3. More features based on feedback

**Key Files:**
- Embedding: `scripts/embed.py` + `.venv/bin/python3`
- Learn route: `src/app/learn/page.tsx`
- Lesson page: `src/app/learn/[pathId]/[lessonId]/page.tsx`
- TESTING.md: `qa/TESTING.md`

**Git Status:** Clean, pushed to gergosnoo/vesc_it

---
*Updated 09:28 - All 5 routes live, 10/10 tests pass, ready for Gergő's wake-up testing*
