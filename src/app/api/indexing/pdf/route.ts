import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { addToQdrant } from "@/lib/qdrant";
import { splitter } from "@/lib/splitter";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdfFile") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file upload",
        },
        { status: 400 }
      );
    }

    const pdfLoader = new PDFLoader(file, {
      splitPages: true,
    });

    const rawDocs = await pdfLoader.load();

    const docs = await splitter.splitDocuments(rawDocs);

    await addToQdrant(docs);

    console.log("Indexing done ....");

    return NextResponse.json({
      success: true,
      message: `PDF "${file.name}" indexed successfully.`,
    });
  } catch (error) {
    console.error("Error during indexing:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: `Failed to index PDF: ${errorMessage}` },
      { status: 500 }
    );
  }
}
