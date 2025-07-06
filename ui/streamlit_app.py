import streamlit as st
from PIL import Image
from io import StringIO
import base64

st.set_page_config(
    page_title="Resume 2 Job",
    page_icon="📄",
    layout="wide",  # 🔥 Full-width layout
    initial_sidebar_state="collapsed"
)

# ======================== ✨ Custom Styling ========================
st.markdown("""
<style>
body {
    font-family: 'Segoe UI', sans-serif;
}
h1 {
    font-size: 3rem !important;
    text-align: center;
    margin-bottom: 30px;
}
input[type="text"] {
    font-size: 1.2rem !important;
}
textarea {
    font-size: 1.1rem !important;
}
.stTextInput>div>div>input {
    padding: 18px;
    font-size: 1.2rem;
    border-radius: 12px;
}
.stTextArea textarea {
    padding: 15px;
    border-radius: 12px;
}
.stFileUploader {
    font-size: 1.1rem;
}
.stButton>button {
    font-size: 1.2rem;
    padding: 10px 25px;
    border-radius: 10px;
    background-color: #3a3a3a;
    color: white;
}
.chat-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 30px;
}
.user-bubble {
    align-self: flex-end;
    background-color: #0b7285;
    color: white;
    padding: 18px;
    border-radius: 18px 18px 0 18px;
    max-width: 70%;
    font-size: 1.2rem;
}
.bot-bubble {
    align-self: flex-start;
    background-color: #343541;
    color: white;
    padding: 18px;
    border-radius: 18px 18px 18px 0;
    max-width: 70%;
    font-size: 1.2rem;
}
</style>
""", unsafe_allow_html=True)

# ======================== 🧠 Title ========================
st.markdown("# 🤖 Resume 2 Job — Let AI Read Your Resume Like a Recruiter")

# ======================== 📄 Resume Upload ========================
col1, col2 = st.columns(2)
with col1:
    resume_file = st.file_uploader("📎 Upload your Resume", type=["pdf", "docx"])
with col2:
    jd_method = st.radio("How to give Job Description?", ["📁 Upload", "📝 Paste"])

# ======================== 📑 Job Description ========================
job_desc = ""
if jd_method == "📁 Upload":
    jd_file = st.file_uploader("Upload JD file", type=["txt", "pdf", "docx"], key="jd_file")
    if jd_file:
        jd_content = jd_file.read().decode("utf-8", errors="ignore")
        job_desc = jd_content
else:
    job_desc = st.text_area("Paste Job Description here", height=250)

# ======================== 💬 Prompt Bar ========================
prompt = st.text_input("💬 Ask a question like ‘What skills do I need to improve?’", key="prompt_input")

# ======================== 🔍 Response Section ========================
if st.button("Ask Resume2Job"):
    if not resume_file or not job_desc or not prompt:
        st.warning("🚨 Please provide all inputs first.")
    else:
        st.markdown('<div class="chat-container">', unsafe_allow_html=True)
        st.markdown(f'<div class="user-bubble">🧑‍💼 You: {prompt}</div>', unsafe_allow_html=True)

        # 👇 Placeholder for real response
        sample_response = f"""
        ✅ Based on your resume and the job description, you’re a **great fit** for this role.

        **Matched Skills:** Python, Data Analysis, Flask  
        **Missing Keywords:** Docker, Kubernetes, CI/CD

        ✍️ Recommendation: Mention your recent ML project and improve your summary to reflect deployment skills.
        """

        st.markdown(f'<div class="bot-bubble">🤖 Resume2Job:<br>{sample_response}</div>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

# # ======================== ℹ️ Footer ========================
# st.markdown("---")
# st.markdown("<center><small>Made with ❤️ by Danish Shaikh | Resume 2 Job</small></center>", unsafe_allow_html=True)