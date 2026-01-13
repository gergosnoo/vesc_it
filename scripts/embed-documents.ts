/**
 * VESC_IT Document Embedding Script
 *
 * This script:
 * 1. Creates the documents table if it doesn't exist
 * 2. Reads all markdown files from knowledge-base/
 * 3. Chunks them into smaller pieces
 * 4. Generates embeddings using OpenAI
 * 5. Stores them in Supabase
 *
 * Usage: npx tsx scripts/embed-documents.ts
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Configuration
const CHUNK_SIZE = 1000; // characters per chunk
const CHUNK_OVERLAP = 200; // overlap between chunks
const EMBEDDING_MODEL = 'text-embedding-3-small';
const KNOWLEDGE_BASE_DIR = path.join(__dirname, '..', 'knowledge-base');

interface DocumentChunk {
  content: string;
  metadata: {
    source: string;
    section?: string;
    chunk_index: number;
  };
}

/**
 * Create the documents table if it doesn't exist
 */
async function createSchema() {
  console.log('Creating schema...');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        embedding vector(1536),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow public read" ON documents;
      CREATE POLICY "Allow public read" ON documents FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Allow service role insert" ON documents;
      CREATE POLICY "Allow service role insert" ON documents FOR INSERT WITH CHECK (true);
    `
  });

  if (error) {
    // Table might already exist, try direct creation
    console.log('Trying direct table creation...');
    const { error: createError } = await supabase
      .from('documents')
      .select('id')
      .limit(1);

    if (createError && createError.code === '42P01') {
      console.error('Table does not exist. Please run supabase/schema.sql manually in Supabase SQL Editor.');
      process.exit(1);
    }
  }

  console.log('Schema ready.');
}

/**
 * Read all markdown files from knowledge-base directory
 */
function readMarkdownFiles(): { filename: string; content: string }[] {
  const files: { filename: string; content: string }[] = [];

  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    console.error(`Knowledge base directory not found: ${KNOWLEDGE_BASE_DIR}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(KNOWLEDGE_BASE_DIR);

  for (const entry of entries) {
    const fullPath = path.join(KNOWLEDGE_BASE_DIR, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isFile() && entry.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      files.push({ filename: entry, content });
      console.log(`  Read: ${entry} (${content.length} chars)`);
    }
  }

  return files;
}

/**
 * Split content into overlapping chunks
 */
function chunkContent(content: string, source: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  // Split by headers first to maintain context
  const sections = content.split(/(?=^#{1,3}\s)/m);

  let chunkIndex = 0;

  for (const section of sections) {
    if (section.trim().length === 0) continue;

    // Extract section header
    const headerMatch = section.match(/^(#{1,3})\s+(.+)/m);
    const sectionTitle = headerMatch ? headerMatch[2].trim() : undefined;

    // If section is small enough, keep it whole
    if (section.length <= CHUNK_SIZE) {
      chunks.push({
        content: section.trim(),
        metadata: {
          source,
          section: sectionTitle,
          chunk_index: chunkIndex++
        }
      });
    } else {
      // Split large sections into overlapping chunks
      let start = 0;
      while (start < section.length) {
        const end = Math.min(start + CHUNK_SIZE, section.length);
        let chunkText = section.slice(start, end);

        // Try to end at a sentence or paragraph boundary
        if (end < section.length) {
          const lastPeriod = chunkText.lastIndexOf('. ');
          const lastNewline = chunkText.lastIndexOf('\n\n');
          const breakPoint = Math.max(lastPeriod, lastNewline);

          if (breakPoint > CHUNK_SIZE * 0.5) {
            chunkText = chunkText.slice(0, breakPoint + 1);
          }
        }

        chunks.push({
          content: chunkText.trim(),
          metadata: {
            source,
            section: sectionTitle,
            chunk_index: chunkIndex++
          }
        });

        // Ensure we always advance by at least 1 character to prevent infinite loop
        const advance = Math.max(chunkText.length - CHUNK_OVERLAP, 1);
        start += advance;
      }
    }
  }

  return chunks;
}

/**
 * Generate embedding for a single text
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Clear existing documents (optional)
 */
async function clearDocuments() {
  console.log('Clearing existing documents...');
  const { error } = await supabase
    .from('documents')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (error) {
    console.error('Error clearing documents:', error);
  }
}

/**
 * Main embedding pipeline
 */
async function main() {
  console.log('=== VESC_IT Document Embedding Pipeline ===\n');

  // Validate environment
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
    console.error('Missing environment variables. Please set:');
    console.error('  - SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    console.error('  - OPENAI_API_KEY');
    process.exit(1);
  }

  // Check if we should clear existing documents
  const shouldClear = process.argv.includes('--clear');
  if (shouldClear) {
    await clearDocuments();
  }

  // Read markdown files
  console.log('\n1. Reading markdown files...');
  const files = readMarkdownFiles();
  console.log(`   Found ${files.length} files\n`);

  // Chunk all files
  console.log('2. Chunking content...');
  const allChunks: DocumentChunk[] = [];
  for (const file of files) {
    const chunks = chunkContent(file.content, file.filename);
    allChunks.push(...chunks);
    console.log(`   ${file.filename}: ${chunks.length} chunks`);
  }
  console.log(`   Total: ${allChunks.length} chunks\n`);

  // Generate embeddings and insert
  console.log('3. Generating embeddings and inserting...');
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];

    try {
      // Generate embedding
      const embedding = await generateEmbedding(chunk.content);

      // Insert into Supabase
      const { error } = await supabase
        .from('documents')
        .insert({
          content: chunk.content,
          embedding,
          metadata: chunk.metadata
        });

      if (error) {
        console.error(`   Error inserting chunk ${i}:`, error.message);
        errorCount++;
      } else {
        successCount++;
        process.stdout.write(`\r   Progress: ${successCount}/${allChunks.length}`);
      }

      // Rate limiting - OpenAI allows ~3000 RPM for embedding
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (err) {
      console.error(`   Error processing chunk ${i}:`, err);
      errorCount++;
    }
  }

  console.log(`\n\n4. Complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);

  // Verify
  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });

  console.log(`\n   Total documents in database: ${count}`);
}

main().catch(console.error);
