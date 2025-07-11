from dotenv import load_dotenv
load_dotenv()
import os
import pickle
import numpy as np
import faiss
import requests
from sentence_transformers import SentenceTransformer
from flask import Flask, request
from flask_cors import CORS
from utils import file_utils
import google.generativeai as genai
from extraction.extractor import extract_resume_chunks
from matching.jd_parser import process_jd_and_embed

# ========== ⚙️ Config ==========
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
EMBEDDING_DIM = 384
GEMINI_API_KEY = os.getenv("APP_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

# Load embedding model
model = SentenceTransformer(EMBEDDING_MODEL)

# Flask app
app = Flask(__name__)
CORS(app)

# ========== 📍 Get Embedding ==========
def get_embedding(text: str) -> list:
    return model.encode(text)

# ========== 📂 Load FAISS Index ==========
def load_faiss_index(index_path: str, metadata_path: str):
    if os.path.exists(index_path) and os.path.exists(metadata_path):
        index = faiss.read_index(index_path)
        with open(metadata_path, "rb") as f:
            metadata = pickle.load(f)
        return index, metadata
    return None, None

# ========== 🤖 Call Gemini LLM ==========
def call_llm(prompt: str) -> str:
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("❌ LLM Error:", e)
        return "Sorry, I couldn't generate a response at the moment."

# ========== Upload Endpoint ==========
@app.route('/upload', methods=['POST'])
def upload_files():
    print("Received upload request")
    session_id = request.form.get('session_id')
    resume_file = request.files.get('resume')
    jd_file = request.files.get('jd')
    
    if not session_id or not resume_file or not jd_file:
        return "Missing session_id or files", 400

    resume_path = file_utils.save_uploaded_file(resume_file, session_id, 'resume')
    jd_path = file_utils.save_uploaded_file(jd_file, session_id, 'jd')

    extract_resume_chunks(resume_path, session_id)
    process_jd_and_embed(jd_path, session_id)

    return "Files uploaded and processed", 200

# ========== Query Endpoint ==========
@app.route('/query', methods=['POST'])
def handle_query():
    session_id = request.form.get('session_id')
    prompt = request.form.get('prompt')

    if not session_id or not prompt:
        return "Missing session_id or prompt", 400

    folder = os.path.join("vector_dbs", session_id)
    resume_index_path = os.path.join(folder, "resume_index.faiss")
    resume_metadata_path = os.path.join(folder, "resume_metadata.pkl")
    jd_index_path = os.path.join(folder, "jd_index.faiss")
    jd_metadata_path = os.path.join(folder, "jd_metadata.pkl")

    resume_index, resume_metadata = load_faiss_index(resume_index_path, resume_metadata_path)
    jd_index, jd_metadata = load_faiss_index(jd_index_path, jd_metadata_path)

    if resume_index is None or jd_index is None or len(jd_metadata) == 0:
        return "Session not found or embeddings missing", 404


    prompt_embedding = get_embedding(prompt)
    k = 3
    resume_distances, resume_indices = resume_index.search(np.array([prompt_embedding], dtype=np.float32), k)
    jd_distances, jd_indices = jd_index.search(np.array([prompt_embedding], dtype=np.float32), k)

    resume_chunks = [resume_metadata[i]["chunk_text"] for i in resume_indices[0] if i < len(resume_metadata)]
    jd_chunks = [jd_metadata[i]["chunk_text"] for i in jd_indices[0] if i < len(jd_metadata)]

    llm_prompt = (
        f"Based on the following resume and job description, answer the question: {prompt}\n\n"
        f"Resume:\n{' '.join(resume_chunks)}\n\n"
        f"Job Description:\n{' '.join(jd_chunks)}"
    )

    response = call_llm(llm_prompt)
    return response, 200

# # ========== Start App ==========
# if __name__ == '__main__':
#     app.run(debug=True, use_reloader=False)
