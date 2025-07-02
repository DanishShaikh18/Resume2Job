import pdfplumber
import fitz
from docx import Document
import easyocr
import magic

file_path = r'doc\Danish-Shaikh-DataAnalyst.pdf'

def f_type(path):
    mime = magic.Magic(mime=True)
    return mime.from_file(path)

file_type = f_type(file_path)

# Extract text from PDF
def extract_from_pdf(path):
    doc = fitz.open(path)
    for page in doc:
        return page.get_text()

def extract_from_docx(path):
    doc = Document(path)






def extract_from_image(path):
    pass

if __name__ == '__main__':

    text = ''

    if file_type == 'application/pdf':
        text = extract_from_pdf(file_path)
    elif file_type.startswith('image/'):
        text = extract_from_image(file_path)
    elif file_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        text = extract_from_docx(file_path)
    else:
        print("Unknown or unsupported file type")


print(text)






