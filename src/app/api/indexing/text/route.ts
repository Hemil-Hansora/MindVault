import { NextResponse } from "next/server";
import { Document } from "langchain/document";
import { client } from "@/lib/client";
import { splitter } from "@/lib/splitter";
import { addToQdrant } from "@/lib/qdrant";
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { text: userText } = await req.json();

    if (!userText || typeof userText !== "string") {
      return NextResponse.json(
        { success: false, error: "No text provided or invalid format." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an AI assistant that converts the user's text into proper format.
Correct typos, arrange words properly if they are not, and make the prompt meaningful.`;

    // const response = await client.chat.completions.create({
    //   model: "gemini-2.0-flash",
    //   messages: [
    //     { role: "system", content: systemPrompt },
    //     { role: "user", content: userText },
    //   ],
    // });

    const {text} = await generateText({
        model : client("gemini-2.0-flash"),
        system : systemPrompt,
        prompt : userText
    })

    

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to get a formatted response from the AI model.",
        },
        { status: 500 }
      );
    }

    const doc = new Document({
      pageContent: text,
      metadata: { source: "manual-text-input" },
    });

    const docs = await splitter.splitDocuments([doc]);

    await addToQdrant(docs);

    console.log("✅ Indexing Done (Formatted text stored)");

    return NextResponse.json({
      success: true,
      message: "Text processed and indexed successfully.",
    });
  } catch (error) {
    console.error("Error during text indexing:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: `Failed to index text: ${errorMessage}` },
      { status: 500 }
    );
  }
}
