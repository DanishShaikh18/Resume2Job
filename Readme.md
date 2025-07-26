# Resume2Job – AI-Powered Resume & JD Matching Assistant (RAG-based)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Last Commit](https://img.shields.io/github/last-commit/DanishShaikh18/Resume2Job)
![Repo Size](https://img.shields.io/github/repo-size/DanishShaikh18/Resume2Job)

**Resume2Job** is a full-stack AI tool that builds a personalized assistant works exclusively on your **uploaded Resume** and **Job Description (JD)**. It uses a custom Retrieval-Augmented Generation (RAG) pipeline to deliver highly relevant, context-aware responses for job seekers and students giving insights that generic models or keyword-based ATS systems simply can’t.
<br><br>
## ✨ Key Features

| Feature                          | Why It's Unique                                                      |
| -------------------------------- | -------------------------------------------------------------------- |
| 🎯 **RAG Personalized AI**       | Works *only* on uploaded resume + JD, not general internet data.     |
| 📄 **JD Input Flexibility**      | Upload JD as file or paste as text (auto-saved for processing).      |
| 🧠 **Semantic Matching**         | Uses vector embeddings (FAISS + metadata) to retrieve meaningful context. |
| 🪄 **ChatGPT-Like UX**           | Clean, modern UI with chat-like interaction, dynamic responses.      |
| 🧪 **Multi-format Support**      | Handles PDF, DOCX, TXT, and image (OCR) inputs for both resume and JD. |
| 🔑 **Session Isolation**         | All files and context tied to a unique `session_id` per user session.|
<br>

## 📈 Use Cases
- 📄 Resume tailoring for specific job roles
- 🧠 Gap analysis (missing skills or mismatched experience)
- ✍️ Suggesting resume improvements based on JD keywords
- 🗣️ Practice prompts: "How do I improve this resume for this job?"

<br>

## 🧩 Problem It Solves

Generic AI tools and ATS systems often fail to provide **resume-specific** insights because they operate on generalized data or keyword matching.

**Resume2Job** changes that by:
- Deeply analyzing **your resume and a specific job description side-by-side**
- Fetching the **most relevant sections semantically** using vector embeddings
- Providing feedback, skill-gap analysis, tailoring suggestions — all in real-time
  
<br>

## 🚀 Demo Screenshot  
> *(Add screenshot of the home page / chat interface here)*  
![Screenshot](screenshots/home.png)

<br>

## 🧠 How RAG Works Here
Upload Resume + JD → Extract + Clean + Sectionizing → Chunk → Embed → Store(FAISS)
↓
User prompt → Semantic Search(Top-k chunks) → Inject into LLM prompt → Get Response

<br>

## 📂 Semantic Pipeline Components

- **Extractor**: Parses PDF, DOCX, TXT, and image (OCR via PyMuPDF & Pillow)
- **Cleaner**: Removes non-informative content (garbage, footers, broken headers)
- **Sectioner**: Detects & organizes sections like *Skills*, *Experience*, etc.
- **Chunker**: Splits resume and JD into semantic chunks for better embeddings
- **Embedding**: Uses Sentence Transformers to convert chunks to vectors
- **FAISS Store**: Stores embeddings with metadata, organized by session
- **Retriever (RAG)**: Top-K semantically matched chunks are pulled at runtime
- **LLM Prompting**: Chunks + prompt are combined and sent to Google’s Gemini/Generative AI API

<br>

## 🖥️ Frontend – React.js (Deployed ✅)

> *(Add screenshot of upload UI and chat interface here)*  
![Upload Screenshot](screenshots/upload.png)

### Key Features
- Clean, modern, dynamic UI 
- Upload Resume (PDF, DOCX, IMG)
- Upload or paste JD (with toggle)
- Dynamic chat interface with expandable input and real-time responses
- Built with Vite + TailwindCSS for speed and responsiveness


## ⚙️ Backend – Flask API (In Progress 🚧)

### Endpoints

#### `POST /upload`
- Accepts: `session_id`, `resume`, `jd_file` or `jd_text`
- Stores them under `uploaded_files/<session_id>/`

#### `POST /prompt`
- Accepts: `session_id`, `prompt`
- Retrieves stored resume + JD
- Passes through extraction → chunking → vector search → LLM

<br>

## 🧪 Tech Stack

### 🔨 Frontend
- React.js (Vite)
- Tailwind CSS
- `react-dropzone` for file uploads
- `axios` for API integration

### 🧠 Backend
- Flask 3.1 + Flask-CORS
- FAISS for vector similarity search
- Sentence Transformers (for semantic embeddings)
- PyMuPDF, Pillow, python-docx, python-magic (file parsing)
- Google Generative AI (for LLM inference)

### 📦 Python Dependencies
```bash
Flask==3.1.0
flask-cors==5.0.1
faiss-cpu==1.11.0
numpy==2.3.1
sentence-transformers==5.0.0
requests==2.32.4
python-dotenv==1.1.0
gunicorn==21.2.0
google-generativeai==0.8.5
tqdm==4.67.1
python-docx==1.2.0
python-magic==0.4.27
Pillow==11.1.0
PyMuPDF==1.26.1
```

<br>

## 🔐 Session Management
Each user interaction (uploads + chat) is assigned a unique session_id:
- Ensures file isolation
- Enables easy testing/debugging
- Scalable across users or environments

<br>

## 🧑‍💻 Author & Developer Notes
- Built completely from scratch, including:
- Custom file parsers for multiple formats
- Smart semantic chunking and embedding logic
- Scalable FAISS setup with dynamic metadata
- All pre-processing, chunking, and semantic retrieval were built from scratch no AI or LLM involvement until the final prompt stage.

<br>

## 🤝 Let's Connect
If you found this project helpful or are interested in collaborating, feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/danish-shaikh-b6442a212/).

<br>

## 📝 License  
This project is licensed under the MIT License.





