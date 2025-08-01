import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { summarizeDocument } from "./summarize-document";

export async function summarizePdf(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const buffer = await blob.arrayBuffer();

    const loader = new PDFLoader(new Blob([buffer]));
    const docs = await loader.load();
    const summary = await summarizeDocument(docs);
    return summary;
  } catch (err: any) {
    console.error("❌ summarizePdf failed:", err);
    return "Summary unavailable.";
  }
}
