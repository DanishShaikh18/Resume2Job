import os
import pickle
import faiss
import requests
from sentence_transformers import SentenceTransformer

# ====== 🔧 CONFIG ======
GEMINI_API_KEY = "AIzaSyA1aPF_NnR6jIsAVU2DaQEW3rGaphzhSzU"  # replace with yours
EMBEDDING_DIM = 384
EMBED_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
TOP_K = 5

# ====== 🔍 Load FAISS & Metadata ======
def load_faiss_index(index_path, metadata_path):
    index = faiss.read_index(index_path)
    with open(metadata_path, "rb") as f:
        metadata = pickle.load(f)
    return index, metadata

# ====== 🔎 Search Top K Chunks ======
def search_similar_chunks(query, index, metadata, top_k=TOP_K):
    vector = EMBED_MODEL.encode([query])
    distances, indices = index.search(vector, top_k)
    return [metadata[i] for i in indices[0] if i < len(metadata)]

# ====== 🤖 Ask Gemini via REST API ======
def ask_gemini(question, context_chunks):
    context = "\n".join([chunk["chunk_text"] for chunk in context_chunks])
    prompt = f"""
You are an expert resume evaluator.

Context:
{context}

Question:
{question}

Answer:"""

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY
    }
    body = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }

    response = requests.post(url, headers=headers, json=body)
    response.raise_for_status()
    return response.json()["candidates"][0]["content"]["parts"][0]["text"]

# ====== 🧪 TEST RUN ======
if __name__ == "__main__":
    session_id = "session_danish_shaikh_123"
    folder = os.path.join("vector_dbs", session_id)

    # Load indices
    resume_index, resume_meta = load_faiss_index(
        os.path.join(folder, "resume_index.faiss"),
        os.path.join(folder, "resume_metadata.pkl")
    )
    jd_index, jd_meta = load_faiss_index(
        os.path.join(folder, "jd_index.faiss"),
        os.path.join(folder, "jd_metadata.pkl")
    )

    # Pick JD chunk as query
    jd_query = jd_meta[0]["chunk_text"]
    top_resume_chunks = search_similar_chunks(jd_query, resume_index, resume_meta)

    # Ask Gemini
    question = "Do I qualify for this role?"
    response = ask_gemini(question, top_resume_chunks)
    print("\n✅ Gemini Response:\n", response)
