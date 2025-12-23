# backend/matching/vector_store.py

from typing import List, Dict

# =========================
# In-memory storage (NO embeddings)
# =========================
# Structure:
# VECTOR_STORE = {
#   session_id: {
#       "resume": [ { "meta": {...} }, ... ],
#       "jd":     [ { "meta": {...} }, ... ]
#   }
# }

VECTOR_STORE = {}

# =========================
# Dummy embedding function
# =========================
def get_embedding(text: str) -> list:
    """
    Embeddings are intentionally disabled
    (avoids Gemini quota issues on free tier)
    """
    return []

# =========================
# Main storage entry
# =========================
def embed_chunks(chunks: List[Dict], session_id: str, chunk_type: str):
    """
    chunk_type: 'resume' or 'jd'
    session_id: unique per user session
    """

    if session_id not in VECTOR_STORE:
        VECTOR_STORE[session_id] = {
            "resume": [],
            "jd": []
        }

    for chunk in chunks:
        if isinstance(chunk, dict):
            text = chunk.get("chunk_text", "").strip()
            if not text:
                continue
            VECTOR_STORE[session_id][chunk_type].append({
                "meta": chunk
            })

        elif isinstance(chunk, str):
            text = chunk.strip()
            if not text:
                continue
            VECTOR_STORE[session_id][chunk_type].append({
                "meta": {
                    "chunk_text": text,
                    "section": "unknown"
                }
            })
