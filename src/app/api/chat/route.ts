import { client } from "@/lib/client";
import { searchInQdrant } from "@/lib/qdrant";
import { NextResponse } from "next/server";
import { streamText, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 🔑 Convert UIMessage[] → ModelMessage[]
    const modelMessages = convertToModelMessages(messages);

    // Safely get last user query
    const lastMessage = modelMessages[modelMessages.length - 1];
    console.log(lastMessage)
    let userQuery = ''
    if (typeof lastMessage?.content === "string") {
  userQuery = lastMessage.content.trim();
} else if (Array.isArray(lastMessage?.content)) {
  userQuery = lastMessage.content
    .map((c: any) => (c.type === "text" ? c.text : ""))
    .join(" ")
    .trim();
}


    // Retrieve relevant docs
    const retriever = await searchInQdrant();
    const relevantDocs = await retriever.invoke(userQuery);

    // System prompt with retrieved context
    const SYSTEM_PROMPT = `
      You are a highly knowledgeable AI assistant. 
      Your role is to answer user queries strictly based on the provided context retrieved from documents or web pages. 

      Guidelines:
      1. Use ONLY the information from the given context to answer. 
         - If the answer is not present in the context, say clearly:
           "The provided documents do not contain enough information to answer this question."
      2. Present answers in a clean, well-structured format:
         - Use numbered lists or bullet points for steps.
         - Use code blocks for code snippets.
      3. At the END of your answer, provide a **"Sources"** section listing all relevant source URLs (deduplicated).
      4. Maintain a professional, simple tone so answers are easy to understand.
      5. If multiple sources overlap, merge them logically instead of repeating.

      Context (from retrieved documents):
      ${JSON.stringify(relevantDocs)}
    `;

    // 🔑 Use converted modelMessages
    const result = await streamText({
      model: client("gemini-2.0-flash"),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: `An error occurred: ${errorMessage}` },
      { status: 500 }
    );
  }
}
