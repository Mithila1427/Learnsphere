from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fake DB (temporary)
doubts = []

class Question(BaseModel):
    question: str
    files: List[str] = []

class TeacherRequest(BaseModel):
    question: str
    answer: str
    studentName: str
class VerifyRequest(BaseModel):
    question: str
    answer: str
    status: str
    comment: str | None = None

@app.post("/ask")
async def ask_ai(data: Question):

    result = ask_question(data.question)

    return {
        "answer": result["answer"],
        "verified": result["verified"]
    }


@app.post("/send_to_teacher")
def send_to_teacher(data: TeacherRequest):

    doubts.append({
        "question": data.question,
        "answer": data.answer,
        "studentName": data.studentName,
        "status": "pending"
    })

    print("NEW DOUBT:", doubts)

    return {"message": "Sent to teacher"}

@app.get("/check_status/{name}")
def check_status(name: str):

    results = [d for d in doubts if d["studentName"] == name]
    
    return results
@app.post("/verify_answer")
def verify_answer(data: dict):

    question = data["question"]
    status = data["status"]          # verified or rejected
    comment = data.get("comment")   # teacher comment (optional)

    for d in doubts:
        if d["question"] == question:
            d["status"] = status
            d["comment"] = comment

    print("UPDATED DOUBTS:", doubts)

    return {"message": "Status Updated"}
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    return {"filename": file.filename}