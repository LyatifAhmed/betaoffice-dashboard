// pages/api/generate-certificate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const externalId = parse(req.headers.cookie || "").external_id;
    if (!externalId) return res.status(401).json({ error: "Missing external_id cookie." });

    const backendUrl = getBackendUrl();

    // Backend: GET /subscription/{external_id}
    const subRes = await fetch(
      `${backendUrl}/subscription/${encodeURIComponent(externalId)}`,
      withBasicAuth()
    );
    if (!subRes.ok) {
      const msg = await subRes.text();
      throw new Error(`Backend subscription fetch failed: ${subRes.status} ${msg}`);
    }
    const subscription = await subRes.json();

    const companyName: string = subscription?.company_name || "Your Company";
    const fullName = `${subscription?.customer_first_name || ""} ${subscription?.customer_last_name || ""}`.trim();

    // Create PDF (A4)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Load logo from public/base64/logo.txt (raw base64, no data URL prefix inside the file)
    const logoPath = path.join(process.cwd(), "public", "base64", "logo.txt");
    const base64Data = fs.readFileSync(logoPath, "utf8").trim();
    const pngImage = await pdfDoc.embedPng(Buffer.from(base64Data, "base64"));

    const pngDims = pngImage.scale(0.3);
    page.drawImage(pngImage, { x: 450, y: 760, width: pngDims.width, height: pngDims.height });

    // Text
    const draw = (text: string, x: number, y: number, size = 12) =>
      page.drawText(text, { x, y, size, font });

    draw("Letter of Certification", 50, 780, 18);
    draw(new Date().toDateString(), 50, 760);

    draw("To Whom It May Concern,", 50, 720);
    draw("This letter confirms that the following company is registered at", 50, 700);
    draw("86-90 Paul Street, London, EC2A 4NE.", 50, 685);
    draw("Under the terms of a virtual office subscription with", 50, 670);
    draw("Generation Beta Digital Ltd, they are entitled to use this address", 50, 655);
    draw("as its registered office address.", 50, 640);

    draw("Account holder:", 50, 610);
    draw(companyName, 150, 610);

    draw("Contact Name:", 50, 595);
    draw(fullName || "—", 150, 595);

    draw("Sincerely,", 50, 560);
    draw("BetaOffice Customer Support", 50, 545);

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="betaoffice-certificate.pdf"');
    // Optional: prevent caching
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error: any) {
    console.error("❌ Failed to generate certificate:", error);
    res.status(500).json({ error: error?.message || "Failed to generate certificate." });
  }
}
