import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

let supabase: SupabaseClient | null = null;
let openai: OpenAI | null = null;

function getSupabase() {
  if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
}

function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    const supabaseClient = getSupabase();
    const openaiClient = getOpenAI();

    if (!supabaseClient || !openaiClient) {
      return NextResponse.json(
        { response: 'Service not configured. Please check environment variables.' },
        { status: 503 }
      );
    }

    // Generate embedding for the query
    const embeddingResponse = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search for relevant documents
    const { data: documents, error } = await supabaseClient.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 5,
    });

    if (error) {
      console.error('Supabase error:', error);
    }

    // Build context from matched documents
    const context = documents?.map((doc: any) =>
      `[Source: ${doc.metadata?.source || 'unknown'}]\n${doc.content}`
    ).join('\n\n---\n\n') || '';

    // Generate response with GPT
    const chatResponse = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are VESC_IT, an expert assistant for VESC motor controller and Refloat package configuration.
You help users with:
- VESC motor setup and FOC tuning
- Refloat package configuration for self-balancing PEVs (Onewheels)
- Troubleshooting motor detection, faults, and connectivity issues
- CAN bus multi-VESC setups
- WiFi/BLE configuration via VESC Express

Use the following knowledge base context to answer questions. If the context doesn't contain relevant information, use your general knowledge but mention when you're not certain.

CONTEXT:
${context || 'No relevant documents found in knowledge base.'}
`
        },
        ...history.slice(-6).map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = chatResponse.choices[0]?.message?.content ||
      'I apologize, but I could not generate a response.';

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { response: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
