"""
Embedder — Generates vector embeddings for scholarship text chunks.
Supports Gemini gemini-embedding-001 (primary) and OpenAI text-embedding-3-small
(fallback), with a local hash-based mock for zero-dependency offline testing.
"""

import os
import hashlib
import struct
from typing import List, Optional


def get_embedder():
    """
    Returns the best available embedder based on installed packages and API keys.
    Priority: Gemini → OpenAI → Mock (for local/offline testing)
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if gemini_key:
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            print("[Embedder] Using Gemini gemini-embedding-001")
            return GoogleGenerativeAIEmbeddings(
                model="models/gemini-embedding-001",
                google_api_key=gemini_key,
                task_type="retrieval_document",
            )
        except ImportError:
            print("[Embedder] langchain-google-genai not installed, trying OpenAI...")

    if openai_key:
        try:
            from langchain_openai import OpenAIEmbeddings
            print("[Embedder] Using OpenAI text-embedding-3-small")
            return OpenAIEmbeddings(
                model="text-embedding-3-small",
                openai_api_key=openai_key,
            )
        except ImportError:
            print("[Embedder] langchain-openai not installed, using mock embedder.")

    print("[Embedder] WARNING: No API key found. Using mock hash-based embedder (for offline testing only).")
    return MockEmbedder()


class MockEmbedder:
    """
    Deterministic hash-based embedder for offline testing.
    Generates 768-dimensional pseudo-embedding from text SHA-256 hash.
    NOT suitable for semantic search — only for integration testing.
    """
    DIMENSIONS = 768

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._hash_embed(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._hash_embed(text)

    def _hash_embed(self, text: str) -> List[float]:
        digest = hashlib.sha256(text.encode()).digest()
        # Repeat digest to fill 768 dimensions (each float = 4 bytes → 3072 bytes total)
        repeated = (digest * (self.DIMENSIONS * 4 // len(digest) + 1))
        floats = []
        for i in range(self.DIMENSIONS):
            val = struct.unpack_from("f", repeated, i * 4 % (len(repeated) - 4))[0]
            # Normalize to [-1, 1] range
            floats.append(max(-1.0, min(1.0, val / 1e30)))
        return floats
