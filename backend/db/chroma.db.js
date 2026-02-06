import { ChromaClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";

const client = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false,
});

const embeddingFunction = new DefaultEmbeddingFunction();

export const collection = await client.getOrCreateCollection({
  name: "ai_doubts",
  embeddingFunction,
});

export async function addToChroma(id, text, metadata = {}) {
  return await collection.add({
    ids: [id],
    documents: [text],
    metadatas: [metadata],
  });
}

export async function searchChroma(query, limit = 3) {
  return await collection.query({
    queryTexts: [query],
    nResults: limit,
  });
}
