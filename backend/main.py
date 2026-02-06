from fastapi import FastAPI, UploadFile, File
import os
import shutil
from rag.loader import load_text
from fastapi.middleware.cors import CORSMiddleware



from rag.chunker import chunk_text
from rag.vector_store import store_chunks

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)   

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def root():
    return {"status": "server is alive"}


@app.post("/send-to-teacher")
async def send_to_teacher(question: str, answer: str):
    # For now, just store/log it (later teacher dashboard will read this)
    print("Question sent to teacher:", question)
    print("Answer sent to teacher:", answer)

    return {
        "message": "Answer sent to teacher for verification"
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 🔹 Load text (PDF / PPTX safe)
        text = load_text(file_path) if "load_text" in globals() else load_pdf_text(file_path)

        if not text or not text.strip():
            return {
    "message": "File uploaded successfully",
    "filename": file.filename
}


        # 🔹 Chunk text
        chunks = chunk_text(text)

        if not chunks:
            return {
                "message": "Text found but could not be chunked",
                "filename": file.filename,
                "chunks_stored": 0
            }

        # 🔹 Store in ChromaDB
        store_chunks(
            chunks,
            metadata={"filename": file.filename}
        )

        return {
            "message": "File uploaded and indexed successfully",
            "filename": file.filename,
            "chunks_stored": len(chunks)
        }

    except Exception as e:
        # 🔴 This is CRITICAL for debugging
        print("UPLOAD ERROR:", str(e))
        return {
            "message": "Internal error while processing file",
            "error": str(e)
        }
