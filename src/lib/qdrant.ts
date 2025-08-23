import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embedding";

export const addToQdrant = async (docs: any) => {
  await QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: process.env.QDRANT_END_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: "MindVault",
  });
};

export const searchInQdrant = async () => {
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_END_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: "MindVault",
    }
  );

  const vectorRetriever = vectorStore.asRetriever({ k: 7, searchType: "mmr" });

  return vectorRetriever
};
