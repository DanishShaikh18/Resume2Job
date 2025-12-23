# backend/extraction/extractor.py

from dotenv import load_dotenv
load_dotenv()

import os
from docx import Document
from PIL import Image
import google.generativeai as genai
import fitz

from processing.cleaner import clean_text

genai.configure(api_key=os.getenv("APP_API_KEY"))

# =========================
# File type detection (SAFE – extension based)
# =========================
def f_type(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        return "pdf"
    if ext == ".docx":
        return "docx"
    if ext in [".png", ".jpg", ".jpeg"]:
        return "image"
    return "unknown"

# =========================
# PDF extraction
# =========================
def extract_from_pdf(path):
    doc = fitz.open(path)
    return "".join(page.get_text() for page in doc)

# =========================
# DOCX extraction
# =========================
def extract_from_docx(path):
    doc = Document(path)
    return "\n".join(p.text.strip() for p in doc.paragraphs if p.text.strip())

# =========================
# Image extraction (Gemini Vision)
# =========================
def extract_from_image(path):
    img = Image.open(path)

    model = genai.GenerativeModel("models/gemini-1.5-flash")
    response = model.generate_content([
        img,
        "Extract all text from this image and return plain text only."
    ])

    return response.text.strip()

# =========================
# Main resume processing
# =========================
def extract_resume_chunks(file_path, session_id):
    t = f_type(file_path)

    if t == "pdf":
        extracted_text = extract_from_pdf(file_path)
    elif t == "docx":
        extracted_text = extract_from_docx(file_path)
    elif t == "image":
        extracted_text = extract_from_image(file_path)
    else:
        raise ValueError("Unsupported resume file type")

    clean_text(extracted_text, session_id)
