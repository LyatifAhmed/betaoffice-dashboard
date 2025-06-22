// File: pages/api/generate-certificate.ts

import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { PDFDocument, StandardFonts } from "pdf-lib";
import axios from "axios";
import fs from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsed = parse(req.headers.cookie || "");
  const externalId = parsed.external_id;

  if (!externalId) {
    return res.status(401).json({ error: "Missing external_id cookie." });
  }

  const backendUrl = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;
  if (!backendUrl) {
    return res.status(500).json({ error: "Missing backend URL" });
  }

  try {
    const subRes = await axios.get(`${backendUrl}/subscription?external_id=${externalId}`);
    const subscription = subRes.data;

    const companyName = subscription?.company_name || "Your Company";
    const fullName = `${subscription?.customer_first_name || ""} ${subscription?.customer_last_name || ""}`.trim();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
 

    // Logo eklemeden önce:
    const logoPath = path.join(process.cwd(), "public", "logopdf.png");
    const logoImageBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoImageBytes); // veya embedJpg
    const logoDims = logoImage.scale(0.5);

    // Sayfaya yerleştir
    page.drawImage(logoImage, {
    x: 400,
    y: 740,
    width: logoDims.width,
    height: logoDims.height,
    });
 
    page.drawText("Letter of Certification", { x: 50, y: 780, size: 18, font });
    page.drawText(new Date().toDateString(), { x: 50, y: 760, size: 12, font });
    page.drawText("To Whom It May Concern,", { x: 50, y: 720, size: 12, font });

    page.drawText(`This letter confirms that the following company is registered at`, { x: 50, y: 700, size: 12, font });
    page.drawText(`86-90 Paul Street, London, EC2A 4NE.`, { x: 50, y: 685, size: 12, font });
    page.drawText(`Under the terms of a virtual office subscription with`, { x: 50, y: 670, size: 12, font });
    page.drawText(`Generation Beta Digital Ltd, they are entitled to use this address`, { x: 50, y: 655, size: 12, font });
    page.drawText(`as its registered office address.`, { x: 50, y: 640, size: 12, font });

    page.drawText("Account holder:", { x: 50, y: 610, size: 12, font });
    page.drawText(companyName, { x: 150, y: 610, size: 12, font });

    page.drawText("Contact Name:", { x: 50, y: 595, size: 12, font });
    page.drawText(fullName, { x: 150, y: 595, size: 12, font });

    page.drawText("Sincerely,", { x: 50, y: 560, size: 12, font });
    page.drawText("BetaOffice Customer Support", { x: 50, y: 545, size: 12, font });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=certificate.pdf");
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("❌ Failed to generate certificate:", error);
    res.status(500).json({ error: "Failed to generate certificate." });
  }
}
