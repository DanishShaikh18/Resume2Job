# backend\processing\cleaner.py
import re
from processing.sectioner import create_section


headings = ['profile summary','skills','experience','professional experience','projects','courses','certifications','education','leadership experience',]

def is_likely_heading(line):
    words = line.strip().lower().split()
    return len(words)<=3 and any(h in line.lower() for h in headings )


def clean_text(text,session_id):
    print("Received text in cleaner.py:")
    

    cleaned_lines = []

    text = re.sub(r"[–—:|=]+", ":", text)

    for line in text.splitlines():
        line = re.sub(r"[•●▪■]", "-", line)
        line = line.replace("–", "-").replace("—", "-").replace("“", '"').replace("”", '"').replace("’", "'")
        line = re.sub(r'[^\x00-\x7F]+', ' ', line)

        line = re.sub(r"\s+", " ", line.strip())

        if not line:
            continue

        if is_likely_heading(line):
            cleaned_lines.append(line.strip())
        else:
            line = line.lower()
            line = re.sub(r"(?<!\d)[,;!?](?!\d)", "", line)
            cleaned_lines.append(line)

    cleaned_text = "\n".join(cleaned_lines)
    # print("Below is Cleaned text ")
    # print(cleaned_text)
    # print()

    create_section(cleaned_text,session_id)





