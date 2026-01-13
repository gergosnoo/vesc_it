# VESC AI Chatbot Implementation Plan

## Overview

Build an AI-powered chatbot that can answer any VESC configuration question using a vector database of VESC documentation and code knowledge. The system uses RAG (Retrieval Augmented Generation) to provide accurate, context-aware responses.

## Current State Analysis

**What exists:**
- Documentation repository with 13 markdown files (~3000 lines)
- GitHub repo: `gergosnoo/vesc_it`
- Knowledge covering 6 VESC repositories (bldc, vesc_tool, vesc_pkg, vesc_express, vesc_bms_fw, refloat)
- Documented protocols, architecture, configuration parameters

**What's needed:**
- Vector database for semantic search
- Chat interface for users
- Embedding pipeline for documentation
- AI integration for responses

## Desired End State

A web application where users can:
1. Ask natural language questions about VESC configuration
2. Get accurate, sourced answers from the knowledge base
3. Receive code examples and configuration suggestions
4. Access conversation history

**Verification:** User can ask "How do I configure FOC motor detection?" and receive accurate step-by-step guidance with references to source documentation.

## What We're NOT Doing (v1)

- User authentication (public access)
- Multi-language support
- Real-time VESC device connection
- Configuration file generation
- Payment/subscription features

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VESC AI CHATBOT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    VERCEL (Next.js 14)                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │   Chat UI    │  │  API Routes  │  │  Edge Functions  │  │ │
│  │  │  (React)     │  │  /api/chat   │  │  (streaming)     │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│              │                    │                              │
│              ▼                    ▼                              │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐ │
│  │     SUPABASE     │  │              OPENAI                   │ │
│  │  ┌────────────┐  │  │  ┌────────────┐  ┌────────────────┐  │ │
│  │  │  pgvector  │  │  │  │ Embeddings │  │   GPT-4o-mini  │  │ │
│  │  │  (vectors) │  │  │  │ ada-002    │  │   (chat)       │  │ │
│  │  └────────────┘  │  │  └────────────┘  └────────────────┘  │ │
│  │  ┌────────────┐  │  └──────────────────────────────────────┘ │
│  │  │ PostgreSQL │  │                                           │
│  │  │ (history)  │  │                                           │
│  │  └────────────┘  │                                           │
│  └──────────────────┘                                           │
│              ▲                                                   │
│              │                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │   n8n (VPS)      │  │   GitHub         │                     │
│  │  ┌────────────┐  │  │  vesc_it repo    │                     │
│  │  │ Doc Sync   │◀─┼──│  (source)        │                     │
│  │  │ Workflow   │  │  └──────────────────┘                     │
│  │  └────────────┘  │                                           │
│  └──────────────────┘                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Approach

1. **Phase 1:** Set up Supabase with pgvector and embed existing docs
2. **Phase 2:** Create Next.js app on Vercel with chat interface
3. **Phase 3:** Connect n8n for automated doc syncing
4. **Phase 4:** Polish and optimize

---

## Phase 1: Supabase Vector Database Setup

### Overview
Set up Supabase project with pgvector extension and create embedding pipeline for existing documentation.

### 1.1 Create Supabase Project

**Action:** Create new Supabase organization/project via browser
- Organization: `vesc-ai`
- Project: `vesc-knowledge`
- Region: EU (closest to user)
- Plan: Free tier (sufficient for start)

### 1.2 Database Schema

**SQL to execute in Supabase SQL Editor:**

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table (source markdown files)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,           -- file path
  title TEXT,                     -- document title
  content TEXT NOT NULL,          -- full content
  metadata JSONB DEFAULT '{}',    -- repo, category, etc
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks for RAG
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,          -- chunk content
  embedding vector(1536),         -- OpenAI ada-002 dimension
  chunk_index INTEGER,            -- order in document
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,       -- browser session
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,             -- 'user' or 'assistant'
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',     -- referenced chunks
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to search similar chunks
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT,
  metadata JSONB,
  source TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.metadata,
    d.source
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 1.3 Create Embedding Script

**File:** `scripts/embed-docs.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

const DOCS_PATH = '../docs';
const KNOWLEDGE_PATH = '../knowledge-base';
const CHUNK_SIZE = 1000; // characters
const CHUNK_OVERLAP = 200;

async function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

async function embedChunk(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  return response.data[0].embedding;
}

async function processFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const title = content.split('\n')[0].replace(/^#\s*/, '');
  const source = path.relative('../', filePath);

  // Insert document
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({ source, title, content })
    .select()
    .single();

  if (docError) throw docError;

  // Chunk and embed
  const chunks = await chunkText(content);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedChunk(chunks[i]);

    await supabase.from('document_chunks').insert({
      document_id: doc.id,
      content: chunks[i],
      embedding,
      chunk_index: i,
      metadata: { source, title }
    });

    console.log(`  Chunk ${i + 1}/${chunks.length}`);
  }
}

async function main() {
  const files = [
    ...fs.readdirSync(DOCS_PATH).map(f => path.join(DOCS_PATH, f)),
    ...fs.readdirSync(KNOWLEDGE_PATH).map(f => path.join(KNOWLEDGE_PATH, f))
  ].filter(f => f.endsWith('.md'));

  for (const file of files) {
    console.log(`Processing: ${file}`);
    await processFile(file);
  }

  console.log('Done!');
}

main();
```

### Success Criteria - Phase 1

#### Automated Verification:
- [ ] Supabase project created and accessible
- [ ] SQL schema executed without errors
- [ ] Embedding script runs: `npx ts-node scripts/embed-docs.ts`
- [ ] Query test: `SELECT COUNT(*) FROM document_chunks` returns > 0

#### Manual Verification:
- [ ] Supabase dashboard shows tables with data
- [ ] Test similarity search in SQL editor returns relevant results

---

## Phase 2: Vercel Next.js Application

### Overview
Create the web application with chat interface and API routes.

### 2.1 Project Setup

```bash
# Create Next.js app
npx create-next-app@latest vesc-ai-web --typescript --tailwind --app --src-dir

# Install dependencies
cd vesc-ai-web
npm install @supabase/supabase-js openai ai @vercel/analytics
npm install -D @types/node
```

### 2.2 Project Structure

```
vesc-ai-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Chat page
│   │   ├── globals.css         # Tailwind styles
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts    # Chat API endpoint
│   ├── components/
│   │   ├── Chat.tsx            # Chat container
│   │   ├── MessageList.tsx     # Message display
│   │   ├── MessageInput.tsx    # Input form
│   │   └── SourceCard.tsx      # Source references
│   └── lib/
│       ├── supabase.ts         # Supabase client
│       ├── openai.ts           # OpenAI client
│       └── rag.ts              # RAG logic
├── .env.local                  # Environment variables
└── vercel.json                 # Vercel config
```

### 2.3 Core Files

**File:** `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
```

**File:** `src/lib/rag.ts`
```typescript
import OpenAI from 'openai';
import { supabaseAdmin } from './supabase';

const openai = new OpenAI();

export async function getRelevantContext(query: string) {
  // Generate embedding for query
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  // Search for similar chunks
  const { data: chunks, error } = await supabaseAdmin.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 5
  });

  if (error) throw error;

  return chunks;
}

export function buildPrompt(query: string, context: any[]) {
  const contextText = context
    .map(c => `[Source: ${c.source}]\n${c.content}`)
    .join('\n\n---\n\n');

  return `You are VESC AI, an expert assistant for VESC motor controller configuration and development.

Use the following context to answer the user's question. If the context doesn't contain relevant information, say so but try to help based on general VESC knowledge.

Always cite your sources when referencing specific information.

CONTEXT:
${contextText}

USER QUESTION: ${query}

Provide a helpful, accurate response:`;
}
```

**File:** `src/app/api/chat/route.ts`
```typescript
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { getRelevantContext, buildPrompt } from '@/lib/rag';

const openai = new OpenAI();

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  // Get relevant context from vector DB
  const context = await getRelevantContext(lastMessage);

  // Build prompt with context
  const prompt = buildPrompt(lastMessage, context);

  // Create chat completion
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [
      { role: 'system', content: prompt },
      ...messages.slice(0, -1),
      { role: 'user', content: lastMessage }
    ]
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

**File:** `src/app/page.tsx`
```typescript
'use client';

import { useChat } from 'ai/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">VESC AI Assistant</h1>
        <p className="text-gray-400 text-sm">Ask anything about VESC configuration</p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">👋 Welcome to VESC AI</p>
            <p className="mt-2">Try asking:</p>
            <ul className="mt-2 space-y-1">
              <li>"How do I configure FOC motor detection?"</li>
              <li>"What current limits should I set for a 10S battery?"</li>
              <li>"How does the ATR algorithm work in Refloat?"</li>
            </ul>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl p-4 rounded-lg ${
              m.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-100'
            }`}>
              <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="animate-pulse">Thinking...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about VESC configuration..."
            className="flex-1 p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 2.4 Environment Variables

**File:** `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

### 2.5 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Success Criteria - Phase 2

#### Automated Verification:
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Vercel deployment succeeds

#### Manual Verification:
- [ ] Chat UI loads at deployed URL
- [ ] Can send message and receive response
- [ ] Response references VESC documentation
- [ ] Streaming works (text appears progressively)

---

## Phase 3: n8n Automation Setup

### Overview
Set up n8n on Hostinger VPS to automatically sync documentation changes.

### 3.1 n8n Workflow: Doc Sync

**Trigger:** GitHub webhook on push to vesc_it repo

**Steps:**
1. Receive webhook
2. Fetch changed markdown files
3. Re-embed changed documents
4. Update Supabase

### 3.2 Workflow JSON

```json
{
  "name": "VESC Doc Sync",
  "nodes": [
    {
      "name": "GitHub Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "vesc-doc-sync",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Filter MD Files",
      "type": "n8n-nodes-base.filter",
      "parameters": {
        "conditions": {
          "string": [{"value1": "={{$json.commits[0].modified}}", "operation": "contains", "value2": ".md"}]
        }
      }
    },
    {
      "name": "Fetch File Content",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://raw.githubusercontent.com/gergosnoo/vesc_it/master/{{$json.path}}",
        "method": "GET"
      }
    },
    {
      "name": "Generate Embedding",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "embeddings",
        "model": "text-embedding-ada-002",
        "input": "={{$json.content}}"
      }
    },
    {
      "name": "Update Supabase",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "upsert",
        "table": "documents"
      }
    }
  ]
}
```

### Success Criteria - Phase 3

#### Automated Verification:
- [ ] n8n workflow executes on test webhook
- [ ] Supabase documents table updates

#### Manual Verification:
- [ ] Push change to vesc_it repo
- [ ] Verify new content appears in chat responses

---

## Phase 4: Polish & Optimize

### Overview
Improve user experience and optimize performance.

### 4.1 Enhancements

1. **Source Citations**
   - Show source documents in responses
   - Link to GitHub files

2. **Suggested Questions**
   - Pre-populate common questions
   - Dynamic suggestions based on topic

3. **Response Quality**
   - Tune system prompt
   - Add few-shot examples
   - Handle edge cases

4. **Analytics**
   - Track popular questions
   - Monitor response quality
   - Usage statistics

### Success Criteria - Phase 4

#### Manual Verification:
- [ ] Sources shown with responses
- [ ] Suggested questions work
- [ ] Analytics visible in Vercel dashboard

---

## Testing Strategy

### Unit Tests
- RAG context retrieval
- Embedding generation
- Prompt building

### Integration Tests
- Full chat flow (question → context → response)
- Supabase connection
- OpenAI API calls

### Manual Testing Steps
1. Ask simple question: "What is VESC?"
2. Ask configuration question: "How do I set motor current limits?"
3. Ask code question: "Show me LispBM example for LED control"
4. Ask complex question: "Compare FOC observer types"
5. Test edge case: Ask about non-VESC topic

---

## Cost Estimates

| Service | Tier | Est. Monthly Cost |
|---------|------|-------------------|
| Supabase | Free | $0 |
| Vercel | Hobby | $0 |
| OpenAI Embeddings | Pay-as-you-go | ~$1 |
| OpenAI GPT-4o-mini | Pay-as-you-go | ~$5-20 |
| n8n (self-hosted) | VPS | Existing |
| **Total** | | **~$5-25/month** |

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1 | 1-2 hours | Supabase account |
| Phase 2 | 2-3 hours | Phase 1, Vercel account |
| Phase 3 | 1 hour | Phase 1, n8n access |
| Phase 4 | 2-3 hours | Phase 2 |
| **Total** | **6-9 hours** | |

---

## References

- Source documentation: `vesc_it/docs/`, `vesc_it/knowledge-base/`
- Improvement ideas: `vesc_it/improvements/opportunities.md`
- Architecture diagram: `vesc_it/analysis/ecosystem-map.md`
