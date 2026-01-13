/**
 * Simple VESC_IT Document Embedding Script (ESM)
 * Runs directly with Node.js without tsx
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error('Missing environment variables. Please set:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('  - OPENAI_API_KEY');
  process.exit(1);
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Configuration
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const EMBEDDING_MODEL = 'text-embedding-3-small';
const KNOWLEDGE_BASE_DIR = path.join(__dirname, '..', 'knowledge-base');

/**
 * Read all markdown files
 */
function readMarkdownFiles() {
  const files = [];

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
 * Split content into chunks
 */
function chunkContent(content, source) {
  const chunks = [];
  const sections = content.split(/(?=^#{1,3}\s)/m);
  let chunkIndex = 0;

  for (const section of sections) {
    if (section.trim().length === 0) continue;

    const headerMatch = section.match(/^(#{1,3})\s+(.+)/m);
    const sectionTitle = headerMatch ? headerMatch[2].trim() : undefined;

    if (section.length <= CHUNK_SIZE) {
      chunks.push({
        content: section.trim(),
        metadata: { source, section: sectionTitle, chunk_index: chunkIndex++ }
      });
    } else {
      let start = 0;
      while (start < section.length) {
        const end = Math.min(start + CHUNK_SIZE, section.length);
        let chunkText = section.slice(start, end);

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
          metadata: { source, section: sectionTitle, chunk_index: chunkIndex++ }
        });

        start += chunkText.length - CHUNK_OVERLAP;
        if (start < 0) start = 0;
      }
    }
  }

  return chunks;
}

/**
 * Generate embedding
 */
async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Clear existing documents
 */
async function clearDocuments() {
  console.log('Clearing existing documents...');
  const { error } = await supabase
    .from('documents')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Error clearing documents:', error);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('=== VESC_IT Document Embedding Pipeline ===\n');

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
  const allChunks = [];
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
      const embedding = await generateEmbedding(chunk.content);

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

      // Rate limiting
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (err) {
      console.error(`   Error processing chunk ${i}:`, err.message);
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
