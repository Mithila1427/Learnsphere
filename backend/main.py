from unittest import result

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import shutil
import uuid
from datetime import datetime
import chromadb
from dotenv import load_dotenv
import os

load_dotenv()

from ai_services.ai_engine import ask_question, store_pdf

app = FastAPI()

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# CHROMADB
# -----------------------------
client = chromadb.PersistentClient(path="./chroma")

collection = client.get_or_create_collection(
    name="teacher_verified_answers"
)

# -----------------------------
# TEMP STORAGE FOR TEACHER QUEUE
# -----------------------------
teacher_queue = []

# -----------------------------
# REQUEST MODELS
# -----------------------------
class QuestionRequest(BaseModel):
    question: str


class TeacherRequest(BaseModel):
    question: str
    answer: str
    studentName: str


class EditAnswer(BaseModel):
    id: str
    new_answer: str


# -----------------------------
# ROOT
# -----------------------------
@app.get("/")
def root():
    return {"status": "server is alive"}


# -----------------------------
# STUDENT ASK QUESTION
# -----------------------------
@app.post("/ask")
async def ask_question_api(req: QuestionRequest):

    # 1️⃣ Check if teacher already verified this question
    for d in teacher_queue:
        if d["subject"].lower().strip() == req.question.lower().strip() and d["status"] == "verified":
            return {
                "question": req.question,
                "answer": d["content"],
                "verified": True
            }

    # 2️⃣ Otherwise call AI
    result = ask_question(req.question)

    # Safety check (in case AI returns None)
    answer = result.get("answer", "AI could not generate an answer.").replace("Send to Teacher for Verification", "")
    verified = result.get("verified", False)

    return {
        "question": req.question,
        "answer": answer,
        "verified": verified
    }
# -----------------------------
# STUDENT SEND TO TEACHER
# -----------------------------
@app.post("/send_to_teacher")
def send_to_teacher(req: TeacherRequest):

    doubt = {
        "id": str(uuid.uuid4()),
        "studentName": req.studentName,
        "subject": req.question,
        "content": req.answer,
        "timestamp": datetime.now().strftime("%H:%M"),
        "status": "pending"
    }

    teacher_queue.append(doubt)

    return {"message": "sent to teacher"}


# -----------------------------
# TEACHER FETCH DOUBTS
# -----------------------------
@app.get("/pending_doubts")
def get_pending_doubts():
    return teacher_queue


# -----------------------------
# TEACHER ACCEPT ANSWER
# -----------------------------
@app.post("/accept_answer/{id}")
def accept_answer(id: str):

    for d in teacher_queue:

        if d["id"] == id:

            d["status"] = "verified"

            collection.add(
    documents=[d["subject"] + " " + d["content"]],
                metadatas=[{
                    "verified": True,
                    "teacher_verified": True,
                    "timestamp": d["timestamp"]
                }],
                ids=[str(uuid.uuid4())]
            )

            return {"message": "answer verified"}

    return {"error": "submission not found"}


# -----------------------------
# TEACHER EDIT ANSWER
# -----------------------------
@app.post("/edit_answer")
def edit_answer(req: EditAnswer):

    for d in teacher_queue:

        if d["id"] == req.id:

            d["content"] = req.new_answer
            d["status"] = "verified"

            collection.add(
    documents=[d["subject"] + " " + req.new_answer],
    metadatas=[{
        "verified": True,
        "teacher_verified": True,
        "edited": True
    }],
    ids=[str(uuid.uuid4())]
)

            return {"message": "edited and verified"}

    return {"error": "submission not found"}


# -----------------------------
# TEACHER REJECT ANSWER
# -----------------------------
class RejectRequest(BaseModel):
    id: str
    comment: str

@app.post("/reject")
def reject(req: RejectRequest):

    for d in teacher_queue:

        if d["id"] == req.id:

            d["status"] = "rejected"
            d["comment"] = req.comment

            return {
                "message": "submission rejected",
                "comment": req.comment
            }

    return {"error": "submission not found"}


# -----------------------------
# FILE UPLOAD
# -----------------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
@app.get("/check_status/{student_name}")
def check_status(student_name: str):

    results = []

    for d in teacher_queue:

        if d["studentName"].strip().lower() == student_name.strip().lower():

            results.append({
                "id": d["id"],                 # add id (important)
                "question": d["subject"],
                "answer": d["content"],
                "status": d["status"],
                "comment": d.get("comment", "")
            })

    return results

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    try:

        file_path = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        store_pdf(file_path)

        return {
            "message": "File uploaded and indexed successfully",
            "filename": file.filename
        }

    except Exception as e:

        print("UPLOAD ERROR:", str(e))

        return {
            "message": "Internal error while processing file",
            "error": str(e)
        }