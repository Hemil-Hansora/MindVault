import { TaskType } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const embeddings = new GoogleGenerativeAIEmbeddings({
    model : "text-embedding-004",
    taskType : TaskType.RETRIEVAL_DOCUMENT,
    apiKey : process.env.GEMINI_API_KEY
})


