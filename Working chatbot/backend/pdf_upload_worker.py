# pdf_upload_worker.py

from dotenv import load_dotenv
import os
import groq
import fitz  # PyMuPDF

load_dotenv()

groq_client = groq.Client(api_key=os.environ["GROQ_API_KEY"])

UPLOAD_DIR = "uploads"
TEXT_DIR = "extracted_texts"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(TEXT_DIR, exist_ok=True)

def handle_pdf_upload(filename: str, content: bytes) -> str:
    try:
        # Enforce 5 file limit
        if len(os.listdir(TEXT_DIR)) >= 5:
            return "error:You can upload a maximum of 5 PDFs."

        # Save original PDF
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(content)

        # Extract text using PyMuPDF
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for i, page in enumerate(doc):
            if i >= 100:  # ✅ Limit to 100 pages
                break
            text += page.get_text()

        doc.close()

        if not text.strip():
            return "error:Could not extract readable text from this PDF."

        # ✅ Write up to 200,000 characters (~100 pages worth)
        text_path = os.path.join(TEXT_DIR, f"{filename}.txt")
        with open(text_path, "w", encoding="utf-8") as f:
            f.write(text[:9000])

        return "success"

    except Exception as e:
        return f"error:{str(e)}"


def get_study_response(prompt: str) -> str:
    try:
        files = sorted(os.listdir(TEXT_DIR))[:5]
        if not files:
            return "Please upload at least one study material first."

        context_blocks = []
        for fname in files:
            path = os.path.join(TEXT_DIR, fname)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                context_blocks.append(f"{fname}:\n{f.read()}")

        context = "\n\n".join(context_blocks)
        final_prompt = (
            "You are a helpful tutor AI. Use the following study materials to answer the question clearly:\n\n"
            f"{context}\n\n"
            f"Question: {prompt}"
        )

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": final_prompt}],
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Sorry, something went wrong: {str(e)}"
