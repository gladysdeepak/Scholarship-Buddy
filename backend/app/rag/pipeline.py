"""
RAG Pipeline — Full ingestion pipeline:
  1. Load scholarship content (seed data, PDFs, URLs)
  2. Chunk documents with overlap
  3. Generate embeddings
  4. Index into ChromaDB

This module is the entry point for both the CLI ingest script
and the FastAPI startup auto-indexer.
"""

from typing import List, Any, Optional
from app.rag.document_loader import load_from_seed_data
from app.rag.chunker import chunk_documents
from app.rag.embedder import get_embedder
from app.rag import vector_store


def run_full_ingestion(scholarships: List[Any], force_reindex: bool = False,
                       extra_docs: Optional[List[dict]] = None) -> int:
    """
    Runs the complete ingestion pipeline on the provided scholarship list.

    Args:
        scholarships: List of Scholarship Pydantic objects from scholarship_seed.py
        force_reindex: If True, clears the existing collection before re-indexing.

    Returns:
        Number of chunks indexed.
    """
    # Check if already indexed
    current_count = vector_store.get_collection_count()
    if current_count > 0 and not force_reindex:
        print(f"[Pipeline] ChromaDB already has {current_count} chunks. Skipping ingestion.")
        print("[Pipeline] Use force_reindex=True to rebuild the index.")
        return current_count

    if force_reindex and current_count > 0:
        print(f"[Pipeline] Force re-index: clearing {current_count} existing chunks...")
        vector_store.clear_collection()

    print(f"[Pipeline] Starting ingestion for {len(scholarships)} scholarships...")

    # Step 1: Load raw documents from seed data
    raw_docs = load_from_seed_data(scholarships)
    raw_docs.extend(extra_docs or [])
    print(f"[Pipeline] Loaded {len(raw_docs)} raw documents.")

    # Step 2: Chunk documents
    chunks = chunk_documents(raw_docs)
    print(f"[Pipeline] Split into {len(chunks)} chunks.")

    # Step 3: Get embedder
    embedder = get_embedder()

    # Step 4: Index into ChromaDB
    indexed = vector_store.index_chunks(chunks, embedder)
    print(f"[Pipeline] ✅ Ingestion complete. Indexed {indexed} chunks.")

    return indexed


def search(
    query: str,
    k: int = 5,
    filter_scholarship_id: Optional[str] = None,
    filter_doc_type: Optional[str] = None,
) -> List[dict]:
    """
    Public search interface for the RAG pipeline.

    Args:
        query: Natural language query string.
        k: Number of results to retrieve.
        filter_scholarship_id: Optional filter to restrict results to a specific scholarship.
        filter_doc_type: Optional filter ("overview", "eligibility_rules", "documents_and_process").

    Returns:
        List of relevant chunk dicts with text, metadata, and relevance score.
    """
    if vector_store.get_collection_count() == 0:
        return []

    embedder = get_embedder()

    where = {}
    if filter_scholarship_id:
        where["scholarship_id"] = filter_scholarship_id
    if filter_doc_type:
        where["document_type"] = filter_doc_type

    return vector_store.vector_search(
        query=query,
        embedder=embedder,
        k=k,
        where=where if where else None,
    )
