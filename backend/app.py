# backend/app.py

from dotenv import load_dotenv
load_dotenv()


import os


from flask import Flask, request


from flask_cors import CORS


import google.generativeai as genai


from utils import file_utils


from extraction.extractor import extract_resume_chunks


from matching.jd_parser import process_jd_and_embed


from matching.vector_store import VECTOR_STORE



# =========================
# Flask App
# =========================
app = Flask(__name__)
CORS(app)


# =========================
# Gemini Config
# =========================
def configure_gemini():
    genai.configure(api_key=os.getenv("APP_API_KEY"))


# =========================
# Infer response mode
# =========================
def infer_response_mode(prompt: str) -> str:
    prompt_lower = prompt.lower()

    if any(word in prompt_lower for word in [
        "guarantee", "step by step", "in detail",
        "what should i do", "how can i improve",
        "explain deeply", "detailed"
    ]):
        return "detailed"

    return "brief"


# =========================
# LLM Call
# =========================
def call_llm(prompt: str) -> str:
    try:
        configure_gemini()
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return "Sorry, I couldn't generate a response at the moment."


# =========================
# Upload Endpoint
# =========================
@app.route("/upload", methods=["POST"])
def upload_files():
    session_id = request.form.get("session_id")
    resume_file = request.files.get("resume")
    jd_file = request.files.get("jd")

    if not session_id or not resume_file or not jd_file:
        return "Missing session_id or files", 400

    resume_path = file_utils.save_uploaded_file(resume_file, session_id, "resume")
    jd_path = file_utils.save_uploaded_file(jd_file, session_id, "jd")

    # Respond immediately
    response = "Upload received. Processing started."

    # Background processing
    def process():
        extract_resume_chunks(resume_path, session_id)
        process_jd_and_embed(jd_path, session_id)

    import threading
    threading.Thread(target=process, daemon=True).start()

    return response, 200


@app.route("/", methods=["GET"])
def health():
    return {"status": "ok", "service": "Resume2Job backend"}


# =========================
# Query Endpoint
# =========================
@app.route("/query", methods=["POST"])
def handle_query():
    session_id = request.form.get("session_id")
    prompt = request.form.get("prompt")

    if not session_id or not prompt:
        return "Missing session_id or prompt", 400

    if session_id not in VECTOR_STORE:
        return "Session not found", 404

    resume_vectors = VECTOR_STORE[session_id]["resume"]
    jd_vectors = VECTOR_STORE[session_id]["jd"]

    if not resume_vectors or not jd_vectors:
        return "Data not ready yet. Please try again.", 404

    # Take first few chunks (simple & safe)
    resume_chunks = [v["meta"]["chunk_text"] for v in resume_vectors[:4]]
    jd_chunks = [v["meta"]["chunk_text"] for v in jd_vectors[:4]]

    mode = infer_response_mode(prompt)

    if mode == "brief":
        llm_prompt = f"""
You are a professional career advisor.

Answer the question clearly and concisely.

RULES:
- Keep the response SHORT (max 120 words)
- Use bullet points only
- No long explanations
- No repetition
- Be direct and practical

STRUCTURE:
## Verdict
(one line)

## Key Strengths
- max 3 bullet points

## Key Gaps
- max 2 bullet points

User Question:
{prompt}

Resume:
{chr(10).join(resume_chunks)}

Job Description:
{chr(10).join(jd_chunks)}
"""
    else:
        llm_prompt = f"""
You are a professional career advisor.

Give a detailed, structured analysis.

RULES:
- Use clear Markdown headings
- Use bullet points
- Explain briefly under each point
- Avoid unnecessary repetition

STRUCTURE:
## Overall Verdict
(short paragraph)

## Strengths & Matches
- bullets with explanation

## Gaps / Areas to Improve
- bullets with explanation

## What to Do to Strengthen Qualification
- actionable steps

User Question:
{prompt}

Resume:
{chr(10).join(resume_chunks)}

Job Description:
{chr(10).join(jd_chunks)}
"""

    response = call_llm(llm_prompt)
    return response, 200


# =========================
# Run App
# =========================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=8000,
        debug=False,
        use_reloader=False
    )
