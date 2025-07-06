from processing.chunker import create_chunks
#sectioner.py
def create_section(cleaned_text):
    sections = {}
    current_key = "contact"

    for line in cleaned_text.splitlines():

        if not line.strip():
            continue

        words = line.strip().split()

        if (line.istitle() or line.isupper()) and len(words) < 3:
            current_key = line.strip().lower()
            sections[current_key] = ""
        else:
            if current_key not in sections:
                sections[current_key] = ""
            sections[current_key] += line.strip() +" "
    # print()
    # print("Below is Sections")
    # print(sections)

    create_chunks(sections)





