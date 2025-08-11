// pages/api/mail/forward.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { mailId, externalId, customerAddress } = req.body || {};
  if (!mailId || !externalId || !customerAddress) {
    return res.status(400).json({ error: "Missing mailId, externalId or customerAddress" });
  }

  try {
    const backend = getBackendUrl();

    // Backend: POST /mail/forward?external_id=...&item_id=...
    const url = `${backend}/mail/forward?external_id=${encodeURIComponent(
      externalId
    )}&item_id=${encodeURIComponent(mailId)}`;

    const address = {
      shipping_address_line_1: customerAddress.line1,
      ...(customerAddress.line2 ? { shipping_address_line_2: customerAddress.line2 } : {}),
      ...(customerAddress.line3 ? { shipping_address_line_3: customerAddress.line3 } : {}),
      shipping_address_city: customerAddress.city,
      shipping_address_postcode: customerAddress.postcode,
      ...(customerAddress.state ? { shipping_address_state: customerAddress.state } : {}),
      shipping_address_country: customerAddress.country,
    };

    const r = await fetch(
      url,
      withBasicAuth({
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ address }),
      })
    );

    const text = await r.text();
    if (!r.ok) {
      console.error("❌ Backend forward error:", r.status, text);
      return res.status(r.status).send(text || "backend error");
    }

    res.setHeader("content-type", "application/json");
    return res.status(200).send(text);
  } catch (err: any) {
    console.error("❌ Unexpected error:", err?.message || err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}
