"""
Vector Store — ChromaDB wrapper for indexing, persisting, and retrieving
scholarship knowledge chunks. Handles collection management, upsert operations,
and filtered semantic search with metadata constraints.
"""

import os
import json
from typing import List, Dict, Any, Optional
from pathlib import Path

CHROMA_PERSIST_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "chroma_db"
)
COLLECTION_NAME = "scholarship_knowledge_base"

_chroma_client = None
_collection = None
_json_path = os.path.join(CHROMA_PERSIST_DIR, "fallback_index.json")


class _JSONCollection:
    """Persistent local lexical index used when optional ChromaDB is not installed."""
    def __init__(self):
        try:
            with open(_json_path, encoding="utf-8") as handle:
                self.rows = json.load(handle)
        except (OSError, json.JSONDecodeError):
            self.rows = {}

    def _save(self):
        Path(CHROMA_PERSIST_DIR).mkdir(parents=True, exist_ok=True)
        with open(_json_path, "w", encoding="utf-8") as handle:
            json.dump(self.rows, handle, ensure_ascii=False)

    def count(self):
        return len(self.rows)

    def upsert(self, ids, documents, embeddings, metadatas):
        for rid, document, metadata in zip(ids, documents, metadatas):
            self.rows[rid] = {"document": document, "metadata": metadata}
        self._save()

    def get(self, where=None, include=None):
        selected = [(rid, row) for rid, row in self.rows.items() if _matches(row["metadata"], where)]
        return {"ids": [rid for rid, _ in selected], "documents": [row["document"] for _, row in selected],
                "metadatas": [row["metadata"] for _, row in selected]}

    def query(self, query_embeddings, n_results, include=None, where=None):
        rows = self.get(where=where)
        count = min(n_results, len(rows["ids"]))
        return {"ids": [rows["ids"][:count]], "documents": [rows["documents"][:count]],
                "metadatas": [rows["metadatas"][:count]], "distances": [[0.0] * count]}


def _matches(metadata, where):
    if not where:
        return True
    for key, value in where.items():
        if isinstance(value, dict) and "$eq" in value:
            value = value["$eq"]
        if metadata.get(key) != value:
            return False
    return True


def _get_client():
    global _chroma_client
    if _chroma_client is None:
        try:
            import chromadb
            Path(CHROMA_PERSIST_DIR).mkdir(parents=True, exist_ok=True)
            _chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
            print(f"[VectorStore] ChromaDB initialized at: {CHROMA_PERSIST_DIR}")
        except ImportError:
            raise RuntimeError(
                "chromadb is not installed. Run: pip install chromadb>=0.5.0"
            )
    return _chroma_client


def get_collection():
    """Returns (or creates) the scholarship ChromaDB collection."""
    global _collection
    if _collection is None:
        try:
            import chromadb  # noqa: F401
        except ImportError:
            _collection = _JSONCollection()
            print(f"[VectorStore] ChromaDB unavailable; using local lexical index at: {_json_path}")
            return _collection
        client = _get_client()
        _collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        print(f"[VectorStore] Collection '{COLLECTION_NAME}' ready. Count: {_collection.count()}")
    return _collection


def index_chunks(chunks: List[Dict[str, Any]], embedder) -> int:
    """
    Indexes a list of chunk dicts into ChromaDB.
    Args:
        chunks: List of {"id": str, "text": str, "metadata": dict}
        embedder: Any embedder with .embed_documents(List[str]) -> List[List[float]]
    Returns:
        Number of chunks indexed.
    """
    if not chunks:
        return 0

    collection = get_collection()

    ids = [c["id"] for c in chunks]
    texts = [c["text"] for c in chunks]
    metadatas = []
    for c in chunks:
        # ChromaDB metadata values must be str, int, float, or bool — no nested dicts
        clean_meta = {}
        for k, v in c["metadata"].items():
            if isinstance(v, (str, int, float, bool)):
                clean_meta[k] = v
            else:
                clean_meta[k] = json.dumps(v)
        metadatas.append(clean_meta)

    print(f"[VectorStore] Generating embeddings for {len(texts)} chunks...")
    embeddings = embedder.embed_documents(texts)

    # Upsert in batches of 100 to avoid memory issues
    batch_size = 100
    for i in range(0, len(ids), batch_size):
        collection.upsert(
            ids=ids[i:i + batch_size],
            documents=texts[i:i + batch_size],
            embeddings=embeddings[i:i + batch_size],
            metadatas=metadatas[i:i + batch_size],
        )
        print(f"[VectorStore] Indexed batch {i // batch_size + 1} ({min(i + batch_size, len(ids))}/{len(ids)})")

    final_count = collection.count()
    print(f"[VectorStore] ✅ Total documents in collection: {final_count}")
    return len(ids)


def vector_search(
    query: str,
    embedder,
    k: int = 5,
    where: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Retrieves top-K most semantically similar chunks for a query.

    Args:
        query: Natural language search query.
        embedder: Embedder instance for query embedding.
        k: Number of results to return.
        where: Optional ChromaDB metadata filter dict.
               e.g. {"document_type": "eligibility_rules"} or
                    {"scholarship_id": "sch_reliance_ug_2026"}

    Returns:
        List of dicts with "text", "metadata", "distance", "id".
    """
    collection = get_collection()

    if collection.count() == 0:
        print("[VectorStore] WARNING: Collection is empty. Run ingest_scholarships.py first.")
        return []

    if embedder.__class__.__name__ == "MockEmbedder":
        # The mock vectors are intentionally non-semantic; lexical matching is a more useful offline fallback.
        terms = {word.lower() for word in query.split() if len(word) > 2}
        rows = collection.get(where=where, include=["documents", "metadatas"] if where else ["documents", "metadatas"])
        ranked = []
        for rid, doc, meta in zip(rows.get("ids", []), rows.get("documents", []), rows.get("metadatas", [])):
            haystack = (doc + " " + " ".join(str(v) for v in meta.values())).lower()
            score = sum(1 for term in terms if term in haystack)
            if score:
                ranked.append((score, rid, doc, meta))
        ranked.sort(key=lambda row: row[0], reverse=True)
        return [{"id": rid, "text": doc, "metadata": meta, "distance": 1 - min(score / max(len(terms), 1), 1),
                 "relevance_score": round(min(score / max(len(terms), 1), 1), 4)}
                for score, rid, doc, meta in ranked[:k]]

    query_embedding = embedder.embed_query(query)

    query_kwargs = {
        "query_embeddings": [query_embedding],
        "n_results": min(k, collection.count()),
        "include": ["documents", "metadatas", "distances"],
    }

    if where:
        query_kwargs["where"] = where

    results = collection.query(**query_kwargs)

    output = []
    for i, (doc, meta, dist, rid) in enumerate(zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
        results["ids"][0],
    )):
        output.append({
            "id": rid,
            "text": doc,
            "metadata": meta,
            "distance": dist,
            "relevance_score": round(1 - dist, 4),  # cosine distance → similarity
        })

    return output


def get_collection_count() -> int:
    """Returns the number of indexed chunks."""
    try:
        return get_collection().count()
    except Exception:
        return 0


def clear_collection():
    """Deletes and recreates the collection (useful for re-indexing)."""
    global _collection
    try:
        os.remove(_json_path)
    except FileNotFoundError:
        pass
    try:
        import chromadb  # noqa: F401
    except ImportError:
        _collection = None
        get_collection()
        return
    client = _get_client()
    try:
        client.delete_collection(COLLECTION_NAME)
        print(f"[VectorStore] Cleared collection '{COLLECTION_NAME}'.")
    except Exception:
        pass
    _collection = None
    get_collection()
