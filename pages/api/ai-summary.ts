import type { NextApiRequest, NextApiResponse } from "next";
import { summarizePdf } from "@/lib/summarizePdf";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { pdfUrl } = req.body;

  if (!pdfUrl || typeof pdfUrl !== "string") {
    return res.status(400).json({ error: "Missing or invalid pdfUrl in request body." });
  }

  try {
    const summary = await summarizePdf(pdfUrl);
    return res.status(200).json({ summary });
  } catch (err: any) {
    console.error("❌ PDF summarization failed:", err.message);
    return res.status(500).json({ error: "Failed to summarize PDF", details: err.message });
  }
}
