Resume2Job

Resume2Job is a learning-focused full-stack project that analyzes how well a resume matches a given job description.
It helps users understand strengths, gaps, and improvement areas using structured AI-generated feedback.

This project is built to demonstrate real-world LLM integration, document processing, and backend–frontend coordination — not as a commercial product, but as a solid engineering learning project.

🚀 Features

Upload Resume (PDF / DOCX / Image)

Upload or paste Job Description

Automatic resume & JD text extraction

Cleaning, sectioning, and chunking of content

Context-aware AI analysis

Structured, readable output (no essay dumping)

Adaptive response depth:

Short answers by default

Detailed guidance when explicitly asked

Fully working frontend + backend

Free-tier friendly (no paid APIs required)

🧠 How the System Works

User uploads a resume and a job description

Backend extracts raw text from uploaded files

Text is cleaned and split into logical sections

Important content chunks are stored per session

User asks a question (e.g. “Am I qualified for this role?”)

Relevant resume & JD chunks are injected into an AI prompt

Gemini generates a structured career-focused response

Frontend renders the output using Markdown

🏗️ Tech Stack
Frontend

React

Fetch API

React Markdown (for clean formatted output)

Backend

Python (Flask)

Flask-CORS

Background threading for processing

Session-based in-memory storage

AI / LLM

Google Gemini (gemini-pro)

Prompt engineering for output control

Embeddings intentionally disabled (free-tier safe)

📁 Project Structure
resume2job/
│
├── backend/
│   ├── app.py                  # Flask API
│   ├── extraction/             # Resume text extraction
│   ├── processing/             # Cleaning, sectioning, chunking
│   ├── matching/               # JD parsing & in-memory storage
│   ├── utils/                  # File handling helpers
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   └── Resume2Job.jsx      # Main UI logic
│   └── package.json
│
└── README.md

✨ Response Intelligence (Important Design)

The system controls response length and depth, not the model.

Default Behavior

Short, scannable responses

Clear verdict + strengths + gaps

When User Asks for Details

(e.g. “What should I do to guarantee qualification?”)

Deeper analysis

Actionable improvement steps

Structured recommendations

This is handled using prompt-level response modes, not by switching models.

🧪 Example Output
Short Response (Default)
## Verdict
Yes, you are a strong match for this role.

## Key Strengths
- Strong Python, SQL, and Power BI skills
- Hands-on ML and data pipeline projects
- Relevant BCA academic background

## Key Gaps
- Excel not explicitly mentioned
- No internship experience listed

Detailed Response (On Request)
## Overall Verdict
You are a strong candidate with most core requirements met.

## Strengths & Matches
- Solid foundation in data analysis and ML
- End-to-end project experience
- Ability to communicate technical insights

## Gaps / Areas to Improve
- Excel and R not explicitly listed
- No formal internship experience mentioned

## What to Do to Strengthen Qualification
- Add Excel to your skills section
- Document projects on GitHub
- Apply for data-related internships

⚙️ Local Setup
Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py


Backend runs on:

http://localhost:8000

Frontend Setup
cd frontend
npm install
npm run dev

🚀 Deployment Notes

Designed for free-tier deployment

No native OS-level dependencies

Windows-safe (no python-magic)

No external vector databases

Stateless backend (session-based memory only)

🎯 Project Goals

This project was built to:

Learn end-to-end LLM integration

Practice backend architecture & debugging

Understand prompt engineering deeply

Build a deployable AI system

Focus on clarity, correctness, and stability

It is a learning + portfolio project, not a commercial product.

⚠️ Limitations

No semantic similarity search (embeddings disabled)

Session data is not persistent

Output quality depends on input quality

Not optimized for high concurrent users

These trade-offs were made intentionally to keep the system simple and reliable.

👤 Author

Danish Shaikh
BCA Student | Python & Data-Oriented Developer

📄 License

This project is intended for educational and personal learning purposes.