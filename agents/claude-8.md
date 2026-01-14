# Claude-8 Context

> **Role:** Infrastructure Lead
> **Last Updated:** 2026-01-14 11:40

## Current Focus
🔧 N8N WORKFLOW + NEW EMBEDDING (11:40)

**Live at https://vesc-it.vercel.app:**
| Route | Status | Description |
|-------|--------|-------------|
| `/` | ✅ ChatGPT UI | Dark theme, 927 embeddings |
| `/api/embed` | ✅ NEW | Embedding API for n8n automation |
| `/learn` | ✅ LIVE | Learning Center (3 paths) |
| `/playground` | ✅ LIVE | Parameter visualizer |
| `/safety` | ✅ LIVE | Safety simulator |
| `/troubleshoot` | ✅ LIVE | 5 diagnostic wizards |

## Session Progress (11:40)

| Task | Status |
|------|--------|
| Fixed RAG chunking bug | ✅ Done |
| Scraped pev.dev (9 posts) | ✅ Done |
| Embedded 927 chunks (4 rounds) | ✅ Done |
| Fixed API bug (history undefined) | ✅ Done |
| ChatGPT-style UI redesign | ✅ Done |
| Pushed to Vercel (38 files) | ✅ Done |
| UI QA verification | ✅ PASSED |
| Created /api/embed endpoint | ✅ Done |
| Configure n8n workflow | 🔄 In Progress |
| Embed foc-fundamentals-explained.md | ⏳ Pending |

## New: Embedding API

Created `/api/embed` endpoint for automated embedding:
- POST with Bearer token auth (N8N_API_KEY)
- Accepts `url` (GitHub raw) or `content` (direct text)
- Section-aware chunking (~1500 chars)
- Auto-embeds and stores in Supabase

**Usage:**
```bash
curl -X POST https://vesc-it.vercel.app/api/embed \
  -H "Authorization: Bearer $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://raw.githubusercontent.com/.../file.md", "source": "file.md"}'
```

## n8n Workflow Status

**URL:** https://n8n.srv1094773.hstgr.cloud/workflow/5HoXjl1A1myy1ge3

**Current Flow:**
1. ✅ Webhook - receives GitHub push events
2. ✅ Code in JavaScript - extracts .md files from commits
3. 🔄 HTTP Request - needs config to call /api/embed
4. ❌ "If row exists" - remove (embed API handles dedup)

**To Complete:**
1. Change HTTP Request: POST to https://vesc-it.vercel.app/api/embed
2. Add Authorization header with N8N_API_KEY
3. Send JSON body: `{"url": "{{ $json.url }}", "source": "{{ $json.path }}"}`
4. Delete "If row exists" node
5. Save and activate workflow

## Blockers & Pending

- **n8n browser UI** - slow to configure, may use API instead
- **New FOC doc** - foc-fundamentals-explained.md ready for embedding

## Key Learnings

- **OpenAI n8n node** - NO embedding action, use HTTP Request instead
- **Section-aware chunking** - keeps headers with content for better RAG
- **Tailwind classes** - gray-800/900 for dark theme

## Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase | ✅ LIVE | 927 chunks, pgvector 1536d |
| Vercel | ✅ LIVE | 6 routes, ChatGPT UI + embed API |
| n8n | 🔄 PARTIAL | Webhook + Code done, HTTP needs config |
| Knowledge Base | ✅ COMPLETE | 39 files, all embedded |

## If I Crash - Continue Here

**Current State:** Embedding API deployed, n8n partially configured
**Next Actions:**
1. Embed foc-fundamentals-explained.md using Python script
2. Complete n8n workflow (or use API to configure)
3. Test webhook trigger with test push

**Key Commands:**
```bash
# Embed new doc with Python script
cd /Users/gergokiss/work/gergo/vesc/vesc_it
source .venv/bin/activate
python scripts/embed-knowledge.py

# Or use curl to test embed API
curl -X POST https://vesc-it.vercel.app/api/embed \
  -H "Authorization: Bearer $(grep N8N_API_KEY .env.local | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://raw.githubusercontent.com/gergosnoo/vesc_it/master/knowledge-base/foc-fundamentals-explained.md"}'

# Check embedding count
# In Python: client.table('documents').select('id', count='exact').execute()
```

**n8n URL:** https://n8n.srv1094773.hstgr.cloud/workflow/5HoXjl1A1myy1ge3

---
*Updated 11:40 - Embed API deployed, n8n in progress, FOC doc queued*
