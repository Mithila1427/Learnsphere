import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer
import chromadb

# Load embedding model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Connect to ChromaDB
chroma_client = chromadb.HttpClient(host="localhost", port=8000)

collection = chroma_client.get_or_create_collection(name="documents")


def store_pdf(file_path):
    # Open PDF
    doc = fitz.open(file_path)

    text = ""
    for page in doc:
        text += page.get_text()

    # Split text into chunks
    chunks = [text[i:i+500] for i in range(0, len(text), 500)]

    # Generate embeddings
    embeddings = model.encode(chunks).tolist()

    # Store in ChromaDB
    ids = [f"id_{i}" for i in range(len(chunks))]

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids
    )
