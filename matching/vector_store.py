import os
import pickle
import numpy as np 
import faiss
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# ========== ⚙️ Config ==========
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
EMBEDDING_DIM = 384  # for all-MiniLM-L6-v2

model = SentenceTransformer(EMBEDDING_MODEL)

# ========== 📍 Get Embedding ==========
def get_embedding(text: str) -> list:
    return model.encode(text)

# ========== 📂 Load or Create FAISS Index ==========
def load_faiss_index(index_path: str, metadata_path: str):
    if os.path.exists(index_path) and os.path.exists(metadata_path):
        index = faiss.read_index(index_path)
        with open(metadata_path, "rb") as f:
            metadata = pickle.load(f)
    else:
        index = faiss.IndexFlatL2(EMBEDDING_DIM)
        metadata = []
    return index, metadata

# ========== 💾 Save FAISS Index ==========
def save_faiss_index(index, metadata, index_path: str, metadata_path: str):
    faiss.write_index(index, index_path)
    with open(metadata_path, "wb") as f:
        pickle.dump(metadata, f)

# ========== 🧠 Main Embedding Logic ==========
def embed_chunks(chunks: list, session_id: str, chunk_type: str):
    """
    chunk_type: either 'resume' or 'jd'
    session_id: uniquely identifies a user/session
    """
    # Create folder for the session
    folder = os.path.join("vector_dbs", session_id)
    os.makedirs(folder, exist_ok=True)

    # Define paths
    index_path = os.path.join(folder, f"{chunk_type}_index.faiss")
    metadata_path = os.path.join(folder, f"{chunk_type}_metadata.pkl")

    # Load or create index
    index, metadata = load_faiss_index(index_path, metadata_path)

    # Embed and store
    for chunk in tqdm(chunks, desc=f"Embedding {chunk_type} chunks"):
        if isinstance(chunk, dict):
            text = chunk.get("chunk_text", "").strip()
        elif isinstance(chunk, str):
            text = chunk.strip()
            chunk = {"chunk_text": text, "section": "unknown"}
        else:
            continue

        if not text:
            continue

        vector = get_embedding(text)
        index.add(np.array([vector], dtype=np.float32))
        metadata.append(chunk)


    save_faiss_index(index, metadata, index_path, metadata_path)
    print(f"✅ Stored {len(metadata)} {chunk_type} chunks for session {session_id}.")
