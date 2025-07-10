import os
import shutil
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def save_uploaded_file(uploaded_file, session_id, file_type):
    folder = os.path.join("uploaded_files", session_id)
    os.makedirs(folder, exist_ok=True)

    ext = os.path.splitext(uploaded_file.filename)[-1]
    filename = f"{file_type}{ext}"
    file_path = os.path.join(folder, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(uploaded_file, f)


    return file_path