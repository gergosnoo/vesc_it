# VESC AI System - Technical Specification

**Author:** Claude-9 (Observer Instance)
**Date:** 2026-01-13
**Version:** 1.0

---

## 1. System Overview

### 1.1 Vision

Create an AI-powered assistant that can:
1. Answer technical VESC questions with source-verified accuracy
2. Generate working LispBM code from natural language
3. Diagnose motor and configuration issues
4. Recommend safe parameter configurations
5. Learn from community-submitted data

### 1.2 Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                           VESC AI SYSTEM                               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────┐      ┌──────────────────┐                       │
│  │  User Interface  │      │  VESC Hardware   │                       │
│  │  (Web/Telegram)  │      │  (via Express)   │                       │
│  └────────┬─────────┘      └────────┬─────────┘                       │
│           │                         │                                  │
│           ▼                         ▼                                  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                         n8n ORCHESTRATOR                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │  │
│  │  │ Webhook     │  │ Data        │  │ AI          │             │  │
│  │  │ Receiver    │  │ Transform   │  │ Router      │             │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                │                                       │
│           ┌────────────────────┼────────────────────┐                 │
│           │                    │                    │                 │
│           ▼                    ▼                    ▼                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │
│  │   Supabase      │  │   OpenAI API    │  │  VESC Express   │       │
│  │   Vector DB     │  │   (GPT-4)       │  │  (Telemetry)    │       │
│  │                 │  │                 │  │                 │       │
│  │  • Embeddings   │  │  • Q&A          │  │  • Real-time    │       │
│  │  • Docs chunks  │  │  • Code gen     │  │  • Diagnostics  │       │
│  │  • User data    │  │  • Analysis     │  │  • Commands     │       │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Specifications

### 2.1 Supabase Vector Database

#### Tables

```sql
-- Document chunks for semantic search
CREATE TABLE vesc_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_file TEXT NOT NULL,
    source_repo TEXT NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_index INT NOT NULL,
    embedding VECTOR(1536),  -- OpenAI ada-002
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LispBM code examples
CREATE TABLE lispbm_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    code TEXT NOT NULL,
    category TEXT NOT NULL,  -- gpio, motor, can, system
    complexity INT CHECK (complexity BETWEEN 1 AND 5),
    embedding VECTOR(1536),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Motor configurations (community-submitted)
CREATE TABLE motor_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    motor_name TEXT NOT NULL,
    motor_kv INT,
    poles INT,
    resistance FLOAT,
    inductance FLOAT,
    flux_linkage FLOAT,
    observer_type INT,
    current_max FLOAT,
    submitted_by TEXT,
    verified BOOLEAN DEFAULT FALSE,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fault diagnosis knowledge
CREATE TABLE fault_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fault_code INT NOT NULL,
    symptom_text TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    solution TEXT NOT NULL,
    confidence FLOAT,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions and context
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    hardware_config JSONB,
    last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for vector search
CREATE INDEX ON vesc_docs USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON lispbm_examples USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON motor_configs USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON fault_knowledge USING ivfflat (embedding vector_cosine_ops);
```

#### RPC Functions

```sql
-- Semantic search for documentation
CREATE OR REPLACE FUNCTION search_docs(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.78,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    source_file TEXT,
    source_repo TEXT,
    chunk_text TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        vesc_docs.id,
        vesc_docs.source_file,
        vesc_docs.source_repo,
        vesc_docs.chunk_text,
        1 - (vesc_docs.embedding <=> query_embedding) AS similarity
    FROM vesc_docs
    WHERE 1 - (vesc_docs.embedding <=> query_embedding) > match_threshold
    ORDER BY vesc_docs.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Find similar motor configurations
CREATE OR REPLACE FUNCTION find_similar_motors(
    query_embedding VECTOR(1536),
    match_count INT DEFAULT 3
)
RETURNS TABLE (
    id UUID,
    motor_name TEXT,
    motor_kv INT,
    poles INT,
    config JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        motor_configs.id,
        motor_configs.motor_name,
        motor_configs.motor_kv,
        motor_configs.poles,
        jsonb_build_object(
            'resistance', motor_configs.resistance,
            'inductance', motor_configs.inductance,
            'flux_linkage', motor_configs.flux_linkage,
            'observer_type', motor_configs.observer_type,
            'current_max', motor_configs.current_max
        ),
        1 - (motor_configs.embedding <=> query_embedding) AS similarity
    FROM motor_configs
    WHERE motor_configs.verified = TRUE
    ORDER BY motor_configs.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

### 2.2 n8n Workflow Design

#### Workflow 1: Question Answering

```yaml
name: VESC Q&A Workflow
trigger: Webhook (POST /vesc-question)
nodes:
  1. Webhook Receiver:
     - Accept: { question: string, user_id: string, context?: object }

  2. Create Embedding:
     - HTTP Request to OpenAI embeddings API
     - Model: text-embedding-ada-002
     - Input: question

  3. Search Supabase:
     - RPC call: search_docs(embedding, 0.78, 5)
     - Get relevant documentation chunks

  4. Build Prompt:
     - System: "You are a VESC expert. Answer based on the provided context."
     - Context: Retrieved documentation chunks
     - Question: User question

  5. Call GPT-4:
     - Model: gpt-4-turbo
     - Temperature: 0.3 (factual)
     - Max tokens: 1000

  6. Verify Citations:
     - Check if response references source files
     - Add source links if missing

  7. Log Response:
     - Store in Supabase for improvement

  8. Return Response:
     - Webhook response with answer
```

#### Workflow 2: LispBM Code Generation

```yaml
name: LispBM Code Generator
trigger: Webhook (POST /lispbm-generate)
nodes:
  1. Webhook Receiver:
     - Accept: { description: string, user_id: string }

  2. Create Embedding:
     - Embed the description

  3. Find Similar Examples:
     - Search lispbm_examples table
     - Get 3 most similar verified examples

  4. Build Prompt:
     - System: "Generate LispBM code for VESC. Use these examples as reference."
     - Examples: Retrieved similar code
     - Request: User description

  5. Generate Code:
     - Call GPT-4
     - Temperature: 0.2 (deterministic)

  6. Validate Syntax:
     - Basic bracket matching
     - Check for known function names
     - Verify parameter counts

  7. Return Code:
     - Return generated LispBM code
     - Include example explanation
```

#### Workflow 3: Motor Configuration Advisor

```yaml
name: Motor Config Advisor
trigger: Webhook (POST /motor-config)
nodes:
  1. Webhook Receiver:
     - Accept: { motor_name: string, kv: int, poles: int, battery_cells: int }

  2. Create Embedding:
     - Embed motor description

  3. Find Similar Motors:
     - Search motor_configs table
     - Get verified configurations for similar motors

  4. Calculate Safe Limits:
     - Max voltage = cells * 4.2V
     - Suggested current based on kV and similar motors
     - Temperature limits (MOSFET, motor)

  5. Generate Recommendations:
     - Call GPT-4 with motor data and similar configs
     - Include safety warnings

  6. Return Configuration:
     - JSON with recommended parameters
     - Explanation of each value
     - Safety notes
```

#### Workflow 4: Fault Diagnosis

```yaml
name: Fault Diagnosis
trigger: Webhook (POST /diagnose)
nodes:
  1. Webhook Receiver:
     - Accept: { fault_code: int, symptoms: string, telemetry?: object }

  2. Lookup Fault Code:
     - Query fault_knowledge by code

  3. Search Similar Cases:
     - Embed symptoms
     - Find similar past diagnoses

  4. Analyze Telemetry:
     - If telemetry provided:
       - Check voltage levels
       - Check temperatures
       - Check current spikes

  5. Generate Diagnosis:
     - Combine fault knowledge + similar cases + telemetry
     - Call GPT-4 for natural language explanation

  6. Return Diagnosis:
     - Likely causes (ranked)
     - Suggested fixes
     - Prevention tips
```

### 2.3 Data Ingestion Pipeline

#### Document Processing

```python
# Pseudocode for document ingestion

def ingest_vesc_docs():
    repos = ['bldc', 'vesc_tool', 'vesc_pkg', 'vesc_express', 'vesc_bms_fw', 'refloat']

    for repo in repos:
        # Process markdown files
        for md_file in glob(f'{repo}/**/*.md'):
            chunks = split_into_chunks(md_file, max_chars=1500)
            for i, chunk in enumerate(chunks):
                embedding = create_embedding(chunk)
                insert_into_supabase('vesc_docs', {
                    'source_file': md_file,
                    'source_repo': repo,
                    'chunk_text': chunk,
                    'chunk_index': i,
                    'embedding': embedding,
                    'metadata': extract_metadata(chunk)
                })

        # Process C headers for API docs
        for h_file in glob(f'{repo}/**/*.h'):
            functions = extract_function_signatures(h_file)
            for func in functions:
                doc = generate_function_doc(func)
                embedding = create_embedding(doc)
                insert_into_supabase('vesc_docs', {
                    'source_file': h_file,
                    'source_repo': repo,
                    'chunk_text': doc,
                    'chunk_index': 0,
                    'embedding': embedding,
                    'metadata': {'type': 'api', 'function': func.name}
                })
```

---

## 3. Integration Points

### 3.1 Telegram Bot Integration

```yaml
n8n Workflow: Telegram Handler
trigger: Telegram Bot Message

nodes:
  1. Message Router:
     - /ask <question> → Q&A Workflow
     - /code <description> → LispBM Generator
     - /config <motor> → Config Advisor
     - /diag <fault> → Fault Diagnosis

  2. Format Response:
     - Convert markdown to Telegram-compatible
     - Add inline keyboard for follow-ups

  3. Send Response:
     - Telegram API sendMessage
```

### 3.2 VESC Express Real-Time Integration

```
┌─────────────┐     WiFi TCP      ┌─────────────┐
│ VESC Express│ ◄──────────────► │  n8n Node   │
│ (ESP32)     │     Port 65102    │ (Listener)  │
└─────────────┘                   └──────┬──────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │  Supabase   │
                                  │  (Telemetry)│
                                  └─────────────┘
```

**Telemetry Collection:**
- Poll VESC Express every 1s
- Store: voltage, current, RPM, temperatures
- Trigger alerts on anomalies

### 3.3 VESC Tool Plugin (Future)

Potential Qt plugin that:
- Sends configuration to AI for validation
- Gets recommendations before applying
- Logs usage patterns (anonymized)

---

## 4. Security Considerations

### 4.1 Data Privacy

- No personal data stored without consent
- Motor configs anonymized before sharing
- Telemetry data encrypted at rest

### 4.2 API Security

- All endpoints require API key
- Rate limiting: 60 requests/minute
- Input sanitization for all user inputs

### 4.3 Code Safety

- Generated LispBM code sandboxed before execution
- Safety limits validated (current, voltage)
- Warning for dangerous configurations

---

## 5. Deployment Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Supabase project
- [ ] Create database schema
- [ ] Set up n8n on Hostinger VPS
- [ ] Create document ingestion pipeline

### Phase 2: Core Features (Week 3-4)
- [ ] Implement Q&A workflow
- [ ] Implement LispBM code generator
- [ ] Set up Telegram bot

### Phase 3: Advanced Features (Week 5-6)
- [ ] Motor configuration advisor
- [ ] Fault diagnosis system
- [ ] VESC Express integration

### Phase 4: Polish (Week 7-8)
- [ ] Web interface
- [ ] Performance optimization
- [ ] Documentation

---

## 6. Cost Estimates

| Service | Monthly Cost |
|---------|--------------|
| Supabase (Pro) | ~$25 |
| OpenAI API | ~$50-100 (usage based) |
| n8n (self-hosted) | $0 (VPS cost) |
| Hostinger VPS | ~$15 |
| **Total** | **~$90-140/month** |

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Question accuracy | >90% verified correct |
| Code generation success | >80% valid syntax |
| Response time | <3s average |
| User satisfaction | >4/5 rating |
| Active users | 100+ monthly |

---

*Technical Specification by Claude-9 | Observer Instance*
