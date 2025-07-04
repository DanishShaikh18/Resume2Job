#sectioner.py
def create_section(cleaned_text):
    sections = {}
    current_key = ""

    for line in cleaned_text.splitlines():

        if not line.strip():
            continue

        words = line.strip().split()

        if (line.istitle() or line.isupper()) and len(words) < 3:
            current_key = line.strip().lower()
            sections[current_key] = ""
        elif current_key:
            sections[current_key] += line.strip() +" "
    print()
    print("Below is Sections")
    print(sections)





