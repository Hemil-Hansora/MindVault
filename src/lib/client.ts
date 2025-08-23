import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const client = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
