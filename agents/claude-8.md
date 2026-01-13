# Claude-8 Context

> **Role:** Infrastructure Lead
> **Last Updated:** 2026-01-14 00:50

## Current Focus
Phase 1 & 2 COMPLETE. Awaiting user decision on Phase 3 (n8n) or wrap up.
- Chatbot LIVE at vesc-it.vercel.app
- 159 embeddings in Supabase
- QA APPROVED by claude-10

## Blockers & Pending
- **n8n URL needed** - Need VPS URL to set up automation workflow
- No other blockers

## Key Learnings
Insights discovered during work:
- **tsx memory leak**: Node.js tsx loader has catastrophic memory issues with regex string operations. Python is far more reliable for embedding scripts.
- **Supabase new key format**: Keys now start with `sb_publishable_` and `sb_secret_` instead of old format.
- **Vercel region**: Set to Frankfurt (fra1) for Hungary users - was defaulting to Washington D.C.
- **Lazy initialization**: Next.js serverless functions need lazy client initialization to avoid build errors when env vars are empty.

## Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase | ✅ LIVE | hbllswwmktfqoeslgvgg.supabase.co |
| pgvector | ✅ READY | Extension enabled, 1536 dimensions |
| Embeddings | ✅ DONE | 159 chunks from 14 KB files |
| Next.js | ✅ LIVE | Chat API + UI deployed |
| Vercel | ✅ LIVE | vesc-it.vercel.app (Frankfurt) |
| n8n | 🔲 PENDING | Needs VPS URL from user |

## QA Status
- **Chatbot Tests**: 3/3 PASS (safety tests approved)
- **Testing Gate**: PASSED by claude-10

## My Understanding of Role
- I build infrastructure, not content
- I request docs from claude-9, testing from claude-10
- Nothing ships without claude-10 approval
- Python > Node.js for data processing scripts

## If I Crash - Continue Here

**Current State:** Phase 1 & 2 COMPLETE, QA APPROVED
**Next Action:** Wait for user decision:
1. Set up n8n (needs VPS URL)
2. Run 51 optional tests
3. Wrap up for the night

**Key Files:**
- Embedding script: `scripts/embed.py` (working)
- Chat API: `src/app/api/chat/route.ts`
- Environment: `.env.local` (has all keys)

**Git Status:** Clean, pushed to gergosnoo/vesc_it

---
*Updated after Phase 1 & 2 completion, QA approval received.*
