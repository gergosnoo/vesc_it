# Claude-8 Context

> **Role:** Infrastructure Lead
> **Last Updated:** 2026-01-14 10:01

## Current Focus
🐛 FIXED RAG CHUNKING BUG (10:01)
- Little FOCer V3 query was returning FSESC values
- Root cause: `\n\n` chunking split headers from content
- Fix: Section-aware chunking by `##`/`###` headers
- Total embeddings: 416 chunks

**Current Routes (all ✅ LIVE):**
- / - Chatbot (416 embeddings, RAG fixed)
- /learn - Learning Center (3 paths, interactive lessons)
- /playground - Parameter visualizer (3D board)
- /safety - Safety headroom simulator
- /troubleshoot - Troubleshooting wizard (5 flows)

## Blockers & Pending
- **n8n URL needed** - Need VPS URL to set up automation workflow
- No other blockers

## Key Learnings
- **tsx memory leak**: Python > Node.js for embedding scripts
- **RAG chunking**: Section-aware chunking (`##`/`###`) keeps related content together
- **Step type handling**: lesson pages need to handle 'text', 'interactive', 'simulator' types
- **Markdown in content**: Split by \n and render manually, not whitespace-pre-wrap

## Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase | ✅ LIVE | hbllswwmktfqoeslgvgg.supabase.co |
| pgvector | ✅ READY | 1536 dimensions |
| Embeddings | ✅ 416 chunks | Section-aware chunking |
| Next.js | ✅ LIVE | 5 routes deployed |
| Vercel | ✅ LIVE | vesc-it.vercel.app (Frankfurt) |
| n8n | 🔲 PENDING | Needs VPS URL |

## QA Status
- **All Tests**: 10/10 PASS (pending RAG re-verification)
- **Chatbot**: BMS, Amps, Faults, Hardware, tiltback_duty ✅
- **Little FOCer V3**: ✅ FIXED - now returns ±150A/±100A/60V
- **UI Features**: Playground, Safety, Troubleshoot, Learn ✅

## If I Crash - Continue Here

**Current State:** RAG bug fixed, waiting for claude-10 re-verification
**Next Action:**
1. Wait for claude-10 to re-verify RAG queries
2. Consider applying section-aware chunking to ALL KB files
3. n8n automation (needs VPS URL)

**Key Files:**
- Embedding: inline Python script with section-aware chunking
- Learn route: `src/app/learn/page.tsx`
- Lesson page: `src/app/learn/[pathId]/[lessonId]/page.tsx`
- TESTING.md: `qa/TESTING.md`

**Chunking Fix Pattern:**
```python
# Split by ## or ### headers, keeping content together
sections = re.split(r'\n(?=#{2,3}\s)', content)
```

**Git Status:** Needs push after updates

---
*Updated 10:01 - Fixed RAG chunking bug, Little FOCer V3 query now correct*
