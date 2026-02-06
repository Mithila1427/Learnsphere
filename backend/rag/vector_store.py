import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import uuid

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.Client(
    Settings(
        persist_directory="chroma_db",
        anonymized_telemetry=False
    )
)

collection = client.get_or_create_collection(name="student_resources")


def store_chunks(collection, chunks, metadata):
    collection.add(
        documents=chunks,
        metadatas=[metadata] * len(chunks),
        ids=[str(uuid.uuid4()) for _ in chunks]
    )
