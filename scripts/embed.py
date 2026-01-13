#!/usr/bin/env python3
"""
VESC_IT Document Embedding Script
Processes markdown files and stores embeddings in Supabase
"""

import os
import re
import json
from pathlib import Path
from supabase import create_client, Client
from openai import OpenAI

# Configuration
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
EMBEDDING_MODEL = 'text-embedding-3-small'
KNOWLEDGE_BASE_DIR = Path(__file__).parent.parent / 'knowledge-base'

# Initialize clients
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

if not all([SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY]):
    print("Missing environment variables. Please set:")
    print("  - SUPABASE_URL")
    print("  - SUPABASE_SERVICE_ROLE_KEY")
    print("  - OPENAI_API_KEY")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai = OpenAI(api_key=OPENAI_API_KEY)


def read_markdown_files():
    """Read all markdown files from knowledge base."""
    files = []

    if not KNOWLEDGE_BASE_DIR.exists():
        print(f"Knowledge base directory not found: {KNOWLEDGE_BASE_DIR}")
        exit(1)

    for entry in sorted(KNOWLEDGE_BASE_DIR.iterdir()):
        if entry.is_file() and entry.suffix == '.md':
            content = entry.read_text(encoding='utf-8')
            files.append({'filename': entry.name, 'content': content})
            print(f"  Read: {entry.name} ({len(content)} chars)")

    return files


def chunk_content(content, source):
    """Split content into chunks."""
    chunks = []

    # Simple split by headers
    sections = re.split(r'(?=^#{1,3}\s)', content, flags=re.MULTILINE)
    chunk_index = 0

    for section in sections:
        if not section.strip():
            continue

        # Extract section header
        header_match = re.match(r'^(#{1,3})\s+(.+)', section, re.MULTILINE)
        section_title = header_match.group(2).strip() if header_match else None

        if len(section) <= CHUNK_SIZE:
            chunks.append({
                'content': section.strip(),
                'metadata': {
                    'source': source,
                    'section': section_title,
                    'chunk_index': chunk_index
                }
            })
            chunk_index += 1
        else:
            # Split large sections
            start = 0
            while start < len(section):
                end = min(start + CHUNK_SIZE, len(section))
                chunk_text = section[start:end]

                # Try to end at sentence boundary
                if end < len(section):
                    last_period = chunk_text.rfind('. ')
                    last_newline = chunk_text.rfind('\n\n')
                    break_point = max(last_period, last_newline)

                    if break_point > CHUNK_SIZE * 0.5:
                        chunk_text = chunk_text[:break_point + 1]

                chunks.append({
                    'content': chunk_text.strip(),
                    'metadata': {
                        'source': source,
                        'section': section_title,
                        'chunk_index': chunk_index
                    }
                })
                chunk_index += 1

                start += len(chunk_text) - CHUNK_OVERLAP
                if start < 0:
                    start = 0

    return chunks


def generate_embedding(text):
    """Generate embedding for text."""
    response = openai.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text
    )
    return response.data[0].embedding


def clear_documents():
    """Clear all existing documents."""
    print("Clearing existing documents...")
    try:
        supabase.table('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    except Exception as e:
        print(f"Error clearing documents: {e}")


def main():
    import sys

    print("=== VESC_IT Document Embedding Pipeline ===\n")

    # Check for clear flag
    should_clear = '--clear' in sys.argv
    if should_clear:
        clear_documents()

    # Read files
    print("\n1. Reading markdown files...")
    files = read_markdown_files()
    print(f"   Found {len(files)} files\n")

    # Chunk all files
    print("2. Chunking content...")
    all_chunks = []
    for f in files:
        chunks = chunk_content(f['content'], f['filename'])
        all_chunks.extend(chunks)
        print(f"   {f['filename']}: {len(chunks)} chunks")
    print(f"   Total: {len(all_chunks)} chunks\n")

    # Generate embeddings and insert
    print("3. Generating embeddings and inserting...")
    success_count = 0
    error_count = 0

    for i, chunk in enumerate(all_chunks):
        try:
            embedding = generate_embedding(chunk['content'])

            supabase.table('documents').insert({
                'content': chunk['content'],
                'embedding': embedding,
                'metadata': chunk['metadata']
            }).execute()

            success_count += 1
            print(f"\r   Progress: {success_count}/{len(all_chunks)}", end='', flush=True)

        except Exception as e:
            print(f"\n   Error on chunk {i}: {e}")
            error_count += 1

    print(f"\n\n4. Complete!")
    print(f"   Success: {success_count}")
    print(f"   Errors: {error_count}")

    # Verify count
    result = supabase.table('documents').select('id', count='exact').execute()
    print(f"\n   Total documents in database: {result.count}")


if __name__ == '__main__':
    main()
