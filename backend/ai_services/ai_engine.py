import chromadb
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader
import uuid


# -----------------------------
# GROQ CLIENT
# -----------------------------
import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

# Get API key from .env
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

groq_client = Groq(api_key=GROQ_API_KEY)

# -----------------------------
# EMBEDDING MODEL
# -----------------------------
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# -----------------------------
# CHROMADB DATABASE
# -----------------------------
chroma_client = chromadb.PersistentClient(path="./chroma")

collection = chroma_client.get_or_create_collection(
    name="study_material"
)

verified_collection = chroma_client.get_or_create_collection(
    name="teacher_verified_answers"
)


# ------------------------------------------------
# EXTRACT TEXT FROM PDF
# ------------------------------------------------
def extract_text(pdf_path):

    reader = PdfReader(pdf_path)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text

    return text


# ------------------------------------------------
# SPLIT TEXT INTO SMALL CHUNKS
# ------------------------------------------------
def chunk_text(text, size=500):

    chunks = []

    for i in range(0, len(text), size):
        chunk = text[i:i + size]
        chunks.append(chunk)

    return chunks


# ------------------------------------------------
# STORE PDF CONTENT INTO CHROMADB
# ------------------------------------------------
def store_pdf(pdf_path):

    text = extract_text(pdf_path)

    chunks = chunk_text(text)

    embeddings = embedding_model.encode(chunks).tolist()

    ids = [str(uuid.uuid4()) for _ in chunks]

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids
    )


# ------------------------------------------------
# ASK QUESTION USING RAG
# ------------------------------------------------
def ask_question(question):

    query_embedding = embedding_model.encode([question]).tolist()

    # -------------------------
    # Check teacher verified answers
    # -------------------------
    try:
        verified_results = verified_collection.query(
            query_embeddings=query_embedding,
            n_results=1
        )

        if verified_results and verified_results["documents"]:
            docs = verified_results["documents"][0]
            distances = verified_results["distances"][0]

            if docs and distances and distances[0] < 0.25:
                return {
                    "answer": docs[0],
                    "verified": True
                }

    except Exception as e:
        print("Verified search skipped:", e)

    # -------------------------
    # Search study material (PDF RAG)
    # -------------------------
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=3
    )

    documents = results["documents"][0] if results["documents"] else []

    context = " ".join(documents) if documents else "No context available."

    prompt = f"""
You are an academic AI assistant.

Use ONLY the context below to answer the question.

Context:
{context}

Question:
{question}

Answer clearly.
"""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer,
        "verified": False
    }