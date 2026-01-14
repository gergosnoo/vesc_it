# Claude-8 Context

> **Role:** Infrastructure Lead
> **Last Updated:** 2026-01-14 11:58

## Current Focus
✅ ALL INFRASTRUCTURE COMPLETE (11:58)

**Live at https://vesc-it.vercel.app:**
| Route | Status | Description |
|-------|--------|-------------|
| `/` | ✅ ChatGPT UI | Dark theme, 938 embeddings |
| `/api/embed` | ✅ LIVE | Embedding API for n8n automation |
| `/api/chat` | ✅ LIVE | RAG chatbot with GPT-4o-mini |
| `/learn` | ✅ LIVE | Learning Center (3 paths) |
| `/playground` | ✅ LIVE | Parameter visualizer |
| `/safety` | ✅ LIVE | Safety simulator |
| `/troubleshoot` | ✅ LIVE | 5 diagnostic wizards |

## Session Progress (11:58)

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
| FOC doc embedded (+11 chunks) | ✅ Done (938 total) |
| n8n workflow configured | ✅ ACTIVE |

## n8n Workflow - COMPLETE

**URL:** https://n8n.srv1094773.hstgr.cloud/workflow/5HoXjl1A1myy1ge3
**Status:** ✅ ACTIVE

**Flow:**
```
GitHub Push → Webhook → Code (extract .md) → HTTP Request → /api/embed
```

**Configuration:**
- Webhook: Receives GitHub push events
- Code: Extracts .md files from commits, builds raw URLs
- HTTP Request: POST to https://vesc-it.vercel.app/api/embed
  - Authorization: Bearer N8N_API_KEY
  - Body: `{"url": "{{ $json.url }}", "source": "{{ $json.path }}"}`

**Test:** Push any .md file to knowledge-base/ and it will auto-embed!

## Embedding API

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

## Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase | ✅ LIVE | 938 chunks, pgvector 1536d |
| Vercel | ✅ LIVE | 7 routes, ChatGPT UI + APIs |
| n8n | ✅ ACTIVE | Auto-embeds .md on GitHub push |
| Knowledge Base | ✅ COMPLETE | 40 files, all embedded |

## Key Learnings

- **OpenAI n8n node** - NO embedding action, use HTTP Request instead
- **Section-aware chunking** - keeps headers with content for better RAG
- **Tailwind classes** - gray-800/900 for dark theme
- **n8n Delete key** - removes nodes on canvas

## If I Crash - Continue Here

**Current State:** ALL INFRASTRUCTURE COMPLETE
**Next Actions:**
1. Monitor n8n workflow for any errors
2. Await claude-10 QA approval on any new content
3. Available for new features/improvements

**Key Commands:**
```bash
# Check embedding count
cd /Users/gergokiss/work/gergo/vesc/vesc_it
source .venv/bin/activate
python -c "from supabase import create_client; import os; c = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY']); print(c.table('documents').select('id', count='exact').execute().count)"

# Manual embed if needed
curl -X POST https://vesc-it.vercel.app/api/embed \
  -H "Authorization: Bearer $(grep N8N_API_KEY .env.local | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://raw.githubusercontent.com/gergosnoo/vesc_it/master/knowledge-base/YOUR-FILE.md"}'
```

**n8n URL:** https://n8n.srv1094773.hstgr.cloud/workflow/5HoXjl1A1myy1ge3

---
*Updated 11:58 - n8n ACTIVE, all infrastructure complete, 938 embeddings*
