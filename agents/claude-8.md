# Claude-8 Context

> **Role:** Infrastructure Lead
> **Last Updated:** 2026-01-14 11:01

## Current Focus
🚀 ALL SYSTEMS LIVE - 927 EMBEDDINGS (11:01)

**Live at https://vesc-it.vercel.app:**
| Route | Status | Description |
|-------|--------|-------------|
| `/` | ✅ LIVE | Chatbot (927 embeddings) |
| `/learn` | ✅ LIVE | Learning Center (3 paths) |
| `/playground` | ✅ LIVE | Parameter visualizer |
| `/safety` | ✅ LIVE | Safety simulator |
| `/troubleshoot` | ✅ LIVE | 5 diagnostic wizards |

## Session Progress (10:56)

| Task | Chunks | Status |
|------|--------|--------|
| Fixed RAG chunking bug | - | ✅ Done |
| Scraped pev.dev (9 posts) | 60 | ✅ Done |
| Embedded claude-9 KB batch 1 | 124 | ✅ Done |
| Embedded claude-9 KB batch 2 | 48 | ✅ Done |
| Embedded claude-9 KB batch 3 | 45 | ✅ Done |
| Embedded claude-9 KB batch 4 | 75 | ✅ Done |
| Embedded claude-9 KB batch 5 (HW Compat, Beginner, CAN/UART) | 75 | ✅ Done |
| Fixed API bug (history undefined) | - | ✅ Done |
| Embedded Round 4 (LispBM, Backup, Mobile) | 84 | ✅ Done |
| **Total embeddings** | **927** | 🎉 |

## Blockers & Pending
- **n8n ready** - URL: https://n8n.srv1094773.hstgr.cloud
- Workflow started, needs OpenAI + Supabase nodes
- **Modern Chat UI** - In backlog per Gergő

## Key Learnings
- **RAG chunking**: Section-aware by `##` headers keeps content together
- **pev.dev scraping**: WebFetch works, .json API not public
- **Embedding flow**: Python venv + incremental processing avoids OOM
- **API defaults**: Always use `history = []` default for undefined arrays

## Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase | ✅ LIVE | 927 chunks, pgvector 1536d |
| Vercel | ✅ LIVE | 5 routes, Frankfurt region |
| n8n | 🔄 PARTIAL | Webhook + Code, needs completion |
| Knowledge Base | ✅ LIVE | 39 files in knowledge-base/ |

## If I Crash - Continue Here

**Current State:** All deployed, 927 embeddings, awaiting Round 4 QA
**Next Action:**
1. Wait for claude-10 QA results on 843 chunks
2. If claude-9 sends more KB docs → embed them
3. When directed → finish n8n workflow
4. When directed → start Chat UI redesign

**Key Commands:**
```bash
# Embed new KB file
export $(grep -v '^#' .env.local | xargs) && source .venv/bin/activate
# Then run Python embedding script

# Check embedding count
# In Python: client.table('documents').select('id', count='exact').execute()
```

**n8n URL:** https://n8n.srv1094773.hstgr.cloud

---
*Updated 11:01 - 927 embeddings, all routes live, awaiting Round 4 QA*
