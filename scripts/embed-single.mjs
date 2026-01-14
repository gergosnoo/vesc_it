import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function chunkMarkdown(content, filename) {
  const chunks = [];
  const lines = content.split('\n');
  let currentChunk = '';
  let currentSection = '';

  for (const line of lines) {
    if (line.startsWith('# ') || line.startsWith('## ')) {
      if (currentChunk.trim().length > 200) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: { source: filename, section: currentSection }
        });
      }
      currentSection = line.replace(/^#+\s*/, '');
      currentChunk = line + '\n';
    } else {
      currentChunk += line + '\n';
      if (currentChunk.length > 1500) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: { source: filename, section: currentSection }
        });
        currentChunk = '';
      }
    }
  }
  if (currentChunk.trim().length > 100) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: { source: filename, section: currentSection }
    });
  }
  return chunks;
}

async function embed(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  const chunks = chunkMarkdown(content, filename);

  console.log('Processing', filename + '...');
  console.log('  ' + chunks.length + ' chunks');

  // Delete existing chunks for this file using metadata filter
  await supabase.from('documents').delete().filter('metadata->source', 'eq', filename);

  let chunkIndex = 0;
  for (const chunk of chunks) {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunk.content
    });

    await supabase.from('documents').insert({
      content: chunk.content,
      embedding: embedding.data[0].embedding,
      metadata: {
        source: filename,
        section: chunk.metadata.section,
        chunk: chunkIndex++
      }
    });
  }

  console.log('Embedded', chunks.length, 'chunks');

  // Get new total
  const { count } = await supabase.from('documents').select('id', { count: 'exact' });
  console.log('Total:', count);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node embed-single.mjs <path-to-file>');
  process.exit(1);
}

embed(filePath);
