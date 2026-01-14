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

// Simple auth check via API key
function validateApiKey(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  const expectedKey = process.env.N8N_API_KEY;
  if (!expectedKey) return false;
  return authHeader === `Bearer ${expectedKey}`;
}

// Section-aware chunking for markdown
function chunkMarkdown(content: string, source: string): { content: string; metadata: any }[] {
  const chunks: { content: string; metadata: any }[] = [];
  const lines = content.split('\n');

  let currentChunk = '';
  let currentSection = '';
  let chunkIndex = 0;
  const MAX_CHUNK_SIZE = 1500; // characters

  for (const line of lines) {
    // Detect section headers
    if (line.startsWith('## ')) {
      // Save previous chunk if exists
      if (currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: { source, section: currentSection, chunk_index: chunkIndex++ }
        });
      }
      currentSection = line.replace(/^#+\s*/, '');
      currentChunk = line + '\n';
    } else if (line.startsWith('### ') || line.startsWith('#### ')) {
      // Sub-section, might start new chunk if current is large
      if (currentChunk.length > MAX_CHUNK_SIZE) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: { source, section: currentSection, chunk_index: chunkIndex++ }
        });
        currentChunk = '';
      }
      currentChunk += line + '\n';
    } else {
      currentChunk += line + '\n';

      // Check if chunk is getting too large
      if (currentChunk.length > MAX_CHUNK_SIZE * 1.5) {
        // Find a good break point (paragraph or list item)
        const breakPoint = currentChunk.lastIndexOf('\n\n');
        if (breakPoint > MAX_CHUNK_SIZE / 2) {
          chunks.push({
            content: currentChunk.slice(0, breakPoint).trim(),
            metadata: { source, section: currentSection, chunk_index: chunkIndex++ }
          });
          currentChunk = currentChunk.slice(breakPoint).trim() + '\n';
        }
      }
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: { source, section: currentSection, chunk_index: chunkIndex }
    });
  }

  return chunks;
}

export async function POST(request: Request) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { url, content, source } = await request.json();

    if (!url && !content) {
      return NextResponse.json(
        { error: 'Either url or content is required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabase();
    const openaiClient = getOpenAI();

    if (!supabaseClient || !openaiClient) {
      return NextResponse.json(
        { error: 'Service not configured' },
        { status: 503 }
      );
    }

    // Fetch content if URL provided
    let textContent = content;
    let sourceName = source;

    if (url) {
      const response = await fetch(url);
      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${response.status}` },
          { status: 400 }
        );
      }
      textContent = await response.text();
      sourceName = source || url.split('/').pop() || 'unknown';
    }

    // Chunk the content
    const chunks = chunkMarkdown(textContent, sourceName);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No content to embed' },
        { status: 400 }
      );
    }

    // Generate embeddings and store
    let embedded = 0;
    let errors: string[] = [];

    for (const chunk of chunks) {
      try {
        // Generate embedding
        const embeddingResponse = await openaiClient.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunk.content,
        });
        const embedding = embeddingResponse.data[0].embedding;

        // Store in Supabase
        const { error } = await supabaseClient
          .from('documents')
          .insert({
            content: chunk.content,
            metadata: chunk.metadata,
            embedding,
          });

        if (error) {
          errors.push(`Chunk ${chunk.metadata.chunk_index}: ${error.message}`);
        } else {
          embedded++;
        }
      } catch (err: any) {
        errors.push(`Chunk ${chunk.metadata.chunk_index}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      source: sourceName,
      chunks_total: chunks.length,
      chunks_embedded: embedded,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('Embed API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/embed',
    methods: ['POST'],
    description: 'Embed markdown content into vector database',
  });
}
