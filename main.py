# main.py

from extraction.extractor import extract_resume_chunks
from matching.jd_parser import process_jd_and_embed

resume_path = r""
jd_path = r""
session_id = ""


def run_pipeline(resume_path, jd_path, session_id):
    extract_resume_chunks(resume_path, session_id)
    process_jd_and_embed(jd_path, session_id)


def accept_data(resume_path,jd_path,session_id):
    run_pipeline(resume_path,jd_path,session_id)








