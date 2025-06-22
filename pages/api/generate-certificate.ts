// File: pages/api/generate-certificate.ts

import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsed = parse(req.headers.cookie || "");
  const externalId = parsed.external_id;

  if (!externalId) {
    return res.status(401).json({ error: "Missing external_id cookie." });
  }

  const backendUrl = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // e.g. https://betaoffice.uk

  if (!backendUrl || !baseUrl) {
    return res.status(500).json({ error: "Missing environment variables." });
  }

  try {
    // 1. Subscription verisini çek
    const subRes = await axios.get(`${backendUrl}/subscription?external_id=${externalId}`);
    const subscription = subRes.data;

    const companyName = subscription?.company_name || "Your Company";
    const fullName = `${subscription?.customer_first_name || ""} ${subscription?.customer_last_name || ""}`.trim();

    // 2. PDF oluştur
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 boyutu
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 3. Logo ekle
    const imageRes = await fetch(`${baseUrl}/logopdf.png`);
    const imageBuffer = await imageRes.arrayBuffer();
    const logoImage = await pdfDoc.embedPng(imageBuffer);
    const pngDims = logoImage.scale(0.4);
    page.drawImage(logoImage, {
      x: 50,
      y: 770,
      width: pngDims.width,
      height: pngDims.height,
    });

    // 4. Metin ekle
    page.drawText("Letter of Certification", { x: 50, y: 720, size: 18, font });
    page.drawText(new Date().toDateString(), { x: 50, y: 700, size: 12, font });

    page.drawText("To Whom It May Concern,", { x: 50, y: 670, size: 12, font });

    const lines = [
      `This letter confirms that the following company is registered at`,
      `86-90 Paul Street, London, EC2A 4NE.`,
      `Under the terms of a virtual office subscription with`,
      `Generation Beta Digital Ltd, they are entitled to use this address`,
      `as its registered office address.`,
    ];
    lines.forEach((line, i) => {
      page.drawText(line, { x: 50, y: 650 - i * 15, size: 12, font });
    });

    page.drawText("Account holder:", { x: 50, y: 560, size: 12, font });
    page.drawText(companyName, { x: 150, y: 560, size: 12, font });

    page.drawText("Contact Name:", { x: 50, y: 545, size: 12, font });
    page.drawText(fullName, { x: 150, y: 545, size: 12, font });

    page.drawText("Sincerely,", { x: 50, y: 510, size: 12, font });
    page.drawText("BetaOffice Customer Support", { x: 50, y: 495, size: 12, font });

    // 5. PDF'i gönder
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=certificate.pdf");
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error: any) {
    console.error("❌ PDF generation failed:", error.message, error.stack);
    res.status(500).json({ error: "Failed to generate certificate." });
  }
}

