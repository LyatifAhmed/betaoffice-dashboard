// pages/api/hoxton/mail.ts  (EK: mock desteği)
import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

const MOCK_ITEMS = [
  {
    id: "1296480",
    external_id: "demo-ext-1",
    url: "https://example.com/mock.pdf",
    url_envelope_front: "https://example.com/env-front.jpg",
    url_envelope_back: "https://example.com/env-back.jpg",
    file_name: "the_a_team_limited_1296480.pdf",
    created_at: "2025-05-15T14:30:00Z",
    ai_metadata: {
      sender_name: "Trotters Independent Traders",
      document_title: "Statement of Account",
      reference_number: "Statement-679229",
      summary: "Monthly service statement for April 2025",
      industry: "Professional Services",
      categories: ["Financial","Official / Legal"],
      sub_categories: ["Regulatory-Communication","Legal-Notice"],
      key_information: [
        { key: "due_date", value: "2025-06-15" },
        { key: "amount", value: "£120.00" }
      ]
    }
  },
  {
    id: "1296481",
    external_id: "demo-ext-1",
    file_name: "notice_1296481.pdf",
    created_at: "2025-06-02T09:10:00Z",
    ai_metadata: {
      sender_name: "HM Revenue & Customs",
      document_title: "Tax Notice",
      categories: ["Taxation"],
      summary: "PAYE reference update",
      key_information: [{ key: "reference", value: "PAYE-123456" }]
    }
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const external_id = req.query.external_id as string | undefined;
  const source = (req.query.source as "remote" | "db" | "mock" | undefined) ?? "remote";
  if (!external_id && source !== "mock") {
    return res.status(400).json({ error: "missing external_id" });
  }

  // 👉 MOCK kısa devre
  if (source === "mock") {
    res.setHeader("content-type", "application/json");
    return res.status(200).json(MOCK_ITEMS);
  }

  try {
    const backend = getBackendUrl();
    const url =
      source === "db"
        ? `${backend}/mail?external_id=${encodeURIComponent(external_id!)}`
        : `${backend}/subscription/${encodeURIComponent(external_id!)}/mail`;

    const r = await fetch(url, withBasicAuth({ headers: { accept: "application/json" } }));
    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text || "backend error");

    res.setHeader("content-type", "application/json");
    return res.status(200).send(text);
  } catch (e: any) {
    console.error("Mail fetch error:", e?.message || e);
    return res.status(500).json({ error: "Failed to fetch mail items" });
  }
}
