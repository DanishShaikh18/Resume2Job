# backend\processing\chunker.py
import re
from matching.vector_store import embed_chunks

def find_name(contact_text):
    ignore_patterns = [
        r'^\+?\d{1,3}[-\s]?\d{10}$',
        r'[\w\.-]+@[\w\.-]+',
        r'(https?:\/\/)?[\w\.]*?(linkedin|github)\.com[^\s]*',
        r'(email|linkedin|github|phone|contact|address)',
        r'^[^a-zA-Z]+$',
    ]
    tokens = contact_text.split()
    filtered = [word for word in tokens if not any(re.match(p, word.lower()) for p in ignore_patterns)]
    return " ".join(filtered[:3]).title().lower().replace(" ", "_")


def map_section(section, section_map):
    for key, synonyms in section_map.items():
        if section in synonyms:
            return key
    return section  # default to original if no match


def create_chunks(sample_data,session_id):
    chunks = []
    resume_owner = find_name(sample_data.get("contact", "unknown_contact"))

    # Flexible section name mappings
    section_map = {
        "contact": ["contact", "personal information"],
        "skills": ["skills", "technologies", "tools"],
        "experience": ["experience", "work experience", "professional experience"],
        "projects": ["projects", "case studies"],
        "leadership": ["leadership", "leadership experience", "positions", "roles", "extracurriculars"],
        "education": ["education", "academics", "qualifications"],
        "certifications": ["certifications", "courses", "licenses"]
    }

    for raw_section, text in sample_data.items():
        section = raw_section.strip().lower()
        mapped_section = map_section(section, section_map)
        text = text.strip()

        if not text:
            continue

        # CONTACT
        if mapped_section == "contact":
            if len(text) > 20:
                chunks.append({
                    "chunk_text": text,
                    "section": mapped_section,
                    "resume_owner": resume_owner
                })

        # SKILLS
        elif mapped_section == "skills":
            pattern = re.compile(r'\b\w+\s*:\s*[^:]+(?=\b\w+\s*:|$)')
            for match in pattern.finditer(text):
                chunk_text = match.group().strip()
                if len(chunk_text) > 20:
                    chunks.append({
                        "chunk_text": chunk_text,
                        "section": mapped_section,
                        "resume_owner": resume_owner
                    })

        # PROFILE-LIKE BLOCKS (education, summary, certifications) → 1 Chunk
        elif mapped_section in ["education", "certifications"] or "summary" in mapped_section:
            chunk_text = f"{raw_section.title()}: {text}"
            if len(chunk_text) > 20:
                chunks.append({
                    "chunk_text": chunk_text,
                    "section": mapped_section,
                    "resume_owner": resume_owner
                })

        # BULLET/LINE BASED CHUNKING
        elif mapped_section in ["experience", "projects", "leadership"]:
            parts = re.split(r'\s*-\s+', text)
            for part in parts:
                cleaned = part.strip()
                if len(cleaned) > 20:
                    chunks.append({
                        "chunk_text": cleaned,
                        "section": mapped_section,
                        "resume_owner": resume_owner
                    })

        # DEFAULT
        else:
            if len(text) > 20:
                chunks.append({
                    "chunk_text": text,
                    "section": mapped_section,
                    "resume_owner": resume_owner
                })

    embed_chunks(chunks,session_id,"resume")
    
    





# import spacy

# nlp = spacy.load("en_core_web_sm")

# def extract_name_spacy(contact_text):
#     doc = nlp(contact_text)
#     for ent in doc.ents:
#         if ent.label_ == "PERSON":
#             return ent.text
#     return None

# # Try it
# extracted_name = extract_name_spacy(sample_data["contact"])
# print(extracted_name)


# import re
# import spacy

# nlp = spacy.load("en_core_web_sm")

# def extract_name_spacy(text):
#     doc = nlp(text)
#     for ent in doc.ents:
#         if ent.label_ == "PERSON":
#             return ent.text.strip()
#     return None

# def find_name(contact_text):
#     # Step 1: Define regex ignore patterns
#     ignore_patterns = [
#         r'^\+?\d{1,3}[-\s]?\d{10}$',                            # Phone numbers
#         r'[\w\.-]+@[\w\.-]+',                                   # Emails
#         r'(https?:\/\/)?[\w\.]*?(linkedin|github)\.com[^\s]*',  # URLs
#         r'(email|linkedin|github|phone|contact|address)',       # Common keywords
#         r'^[^a-zA-Z]+$',                                        # Pure symbols
#     ]

#     # Step 2: Clean using regex logic
#     tokens = contact_text.split()
#     filtered = [word for word in tokens if not any(re.match(pat, word.lower()) for pat in ignore_patterns)]

#     # Step 3: Try regex-based name extraction
#     if filtered:
#         name = " ".join(filtered[:3]).title()
#         # Validate that it actually looks like a name
#         if all(part.istitle() for part in name.split()):
#             print("Extracted (Regex):", name)
#             return name

#     # Step 4: Fallback to spaCy if regex fails
#     spacy_name = extract_name_spacy(contact_text)
#     if spacy_name:
#         print("Extracted (spaCy):", spacy_name)
#         return spacy_name

#     print("Name not found.")
#     return None

# # ✅ Run it on your sample
# find_name(sample_data["contact"])



