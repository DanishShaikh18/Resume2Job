import os
import pickle
import numpy as np 
import faiss
from tqdm import tqdm
from sentence_transformers import SentenceTransformer

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
        text = chunk.get("chunk_text", "").strip()
        if not text:
            continue
        vector = get_embedding(text)
        index.add(np.array([vector], dtype=np.float32))
        metadata.append(chunk)

    save_faiss_index(index, metadata, index_path, metadata_path)
    print(f"✅ Stored {len(metadata)} {chunk_type} chunks for session {session_id}.")

# ========== 🧪 Test Run ==========
if __name__ == "__main__":
    resume_chunks = [
        {"chunk_text": "danish shaikh 9321602175 : email : danish89761@gmail.com", "section": "contact", "resume_owner": "danish_shaikh"},
        {"chunk_text": "built an affiliate-based gaming accessories platform", "section": "projects", "resume_owner": "danish_shaikh"},
    ]

    jd_chunks = [
        {"chunk_text": "we are hiring a data analyst with experience in SQL, Power BI, and ML", "section": "job_description"}
    ]

    session_id = "session_danish_shaikh_123"

    embed_chunks(resume_chunks, session_id=session_id, chunk_type="resume")
    embed_chunks(jd_chunks, session_id=session_id, chunk_type="jd")
