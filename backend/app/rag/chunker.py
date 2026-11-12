"""
Text Chunker — Splits raw scholarship documents into semantically meaningful
chunks with 800-token size and 150-token overlap. Each chunk inherits
the parent document's metadata for filtered ChromaDB retrieval.
"""

from typing import List, Dict, Any
import hashlib

try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False


def _simple_chunker(text: str, chunk_size: int = 3200, overlap: int = 600) -> List[str]:
    """
    Fallback chunker when LangChain is not available.
    Uses character-level splitting (3200 chars ≈ 800 tokens at ~4 chars/token).
    """
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        # Try to break at a sentence boundary
        if end < len(text):
            last_period = text.rfind(".", start, end)
            last_newline = text.rfind("\n", start, end)
            boundary = max(last_period, last_newline)
            if boundary > start + (chunk_size // 2):
                end = boundary + 1
        chunks.append(text[start:end].strip())
        if end >= len(text):
            break
        start = end - overlap
    return [c for c in chunks if c]


def chunk_documents(raw_docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Takes a list of raw documents ({"text": str, "metadata": dict}) and
    splits each into overlapping chunks, preserving metadata.

    Returns a flat list of chunk dicts with:
        - "text": str (the chunk content)
        - "metadata": dict (inherited from parent document, plus chunk_index)
        - "id": str (unique chunk ID: scholarship_id + doc_type + chunk_index)
    """
    all_chunks = []

    if LANGCHAIN_AVAILABLE:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=3200,        # ~800 tokens at ~4 chars/token
            chunk_overlap=600,      # ~150 tokens overlap
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
    else:
        splitter = None

    for doc in raw_docs:
        text = doc["text"]
        metadata = doc["metadata"]

        if splitter and LANGCHAIN_AVAILABLE:
            text_chunks = splitter.split_text(text)
        else:
            text_chunks = _simple_chunker(text)

        for i, chunk_text in enumerate(text_chunks):
            if not chunk_text.strip():
                continue

            scholarship_id = metadata.get("scholarship_id", "unknown")
            doc_type = metadata.get("document_type", "general")
            source_key = metadata.get("source", "seed")
            source_suffix = hashlib.sha1(str(source_key).encode()).hexdigest()[:8]
            chunk_id = f"{scholarship_id}_{doc_type}_{source_suffix}_{i}"

            all_chunks.append({
                "id": chunk_id,
                "text": chunk_text,
                "metadata": {
                    **metadata,
                    "chunk_index": i,
                    "total_chunks": len(text_chunks),
                }
            })

    print(f"[Chunker] Created {len(all_chunks)} chunks from {len(raw_docs)} documents.")
    return all_chunks
