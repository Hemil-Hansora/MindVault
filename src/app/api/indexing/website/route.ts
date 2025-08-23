import { addToQdrant } from "@/lib/qdrant";
import { splitter } from "@/lib/splitter";
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: "No URL provided." },
        { status: 400 }
      );
    }

    const loader = new RecursiveUrlLoader(url, {
      extractor: (document) => {
        return document
          .replace(/<script[\s\S]?>[\s\S]?<\/script>/gi, "")
          .replace(/<style[\s\S]?>[\s\S]?<\/style>/gi, "")
          .replace(/<nav[\s\S]?>[\s\S]?<\/nav>/gi, "")
          .replace(/<header[\s\S]?>[\s\S]?<\/header>/gi, "")
          .replace(/<footer[\s\S]?>[\s\S]?<\/footer>/gi, "")
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim();
      },
      maxDepth: 2,
      excludeDirs: ["admin", "login", "register", "cart", "checkout"],
    });

    const rawDocs = await loader.load();

    const filteredDocs = rawDocs.filter(doc => 
            doc.pageContent && doc.pageContent.trim().length > 100
        );

    const docs = await splitter.splitDocuments(filteredDocs);

    await addToQdrant(docs);
    console.log("Indexing done ....");

    return NextResponse.json({
      success: true,
      message: `Website "${url}" indexed successfully.`,
      data: {
                originalUrl: url,
                pagesProcessed: filteredDocs.length,
                chunksCreated: docs.length,
                indexedAt: new Date().toISOString()
            }
    });
  } catch (error) {
    console.error("Error during website indexing:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: `Failed to index website: ${errorMessage}` },
      { status: 500 }
    );
  }
}
