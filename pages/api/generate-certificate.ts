import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsed = parse(req.headers.cookie || "");
  const externalId = parsed.external_id;

  if (!externalId) {
    return res.status(401).json({ error: "Missing external_id cookie." });
  }

  const backendUrl = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL; // örn: https://betaoffice.uk

  if (!backendUrl || !siteUrl) {
    return res.status(500).json({ error: "Missing environment variables." });
  }

  try {
    const subRes = await axios.get(`${backendUrl}/subscription?external_id=${externalId}`);
    const subscription = subRes.data;

    const companyName = subscription?.company_name || "Your Company";
    const fullName = `${subscription?.customer_first_name || ""} ${subscription?.customer_last_name || ""}`.trim();

    // 📥 Logo'yu site public klasöründen base64 olarak çek
    const logoRes = await fetch(`${siteUrl}/logopdf.png`);
    const logoBuffer = Buffer.from(await logoRes.arrayBuffer());

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const logoImage = await pdfDoc.embedPng(logoBuffer);

    const { width, height } = logoImage.scale(0.25);
    page.drawImage(logoImage, { x: 50, y: 770, width, height });

    // Metin içeriği
    const textY = 700;
    page.drawText("Letter of Certification", { x: 50, y: textY, size: 18, font });
    page.drawText(new Date().toDateString(), { x: 50, y: textY - 20, size: 12, font });
    page.drawText("To Whom It May Concern,", { x: 50, y: textY - 60, size: 12, font });

    const bodyY = textY - 80;
    page.drawText(`This letter confirms that the following company is registered at`, { x: 50, y: bodyY, size: 12, font });
    page.drawText(`86-90 Paul Street, London, EC2A 4NE.`, { x: 50, y: bodyY - 15, size: 12, font });
    page.drawText(`Under the terms of a virtual office subscription with`, { x: 50, y: bodyY - 30, size: 12, font });
    page.drawText(`Generation Beta Digital Ltd, they are entitled to use this address`, { x: 50, y: bodyY - 45, size: 12, font });
    page.drawText(`as its registered office address.`, { x: 50, y: bodyY - 60, size: 12, font });

    page.drawText("Account holder:", { x: 50, y: bodyY - 90, size: 12, font });
    page.drawText(companyName, { x: 150, y: bodyY - 90, size: 12, font });

    page.drawText("Contact Name:", { x: 50, y: bodyY - 105, size: 12, font });
    page.drawText(fullName, { x: 150, y: bodyY - 105, size: 12, font });

    page.drawText("Sincerely,", { x: 50, y: bodyY - 140, size: 12, font });
    page.drawText("BetaOffice Customer Support", { x: 50, y: bodyY - 155, size: 12, font });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=certificate.pdf");
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("❌ Failed to generate certificate:", error);
    res.status(500).json({ error: "Failed to generate certificate." });
  }
}

