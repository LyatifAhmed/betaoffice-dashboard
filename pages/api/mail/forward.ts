import type { NextApiRequest, NextApiResponse } from "next";

const HOXTON_API_KEY = process.env.HOXTON_API_KEY!;
const HOXTON_API_URL = process.env.HOXTON_API_URL!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mailId, externalId, customerAddress } = req.body;

  if (!mailId || !externalId || !customerAddress) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const payload = {
    forwarding_address: {
      shipping_address_line_1: customerAddress.line1,
      shipping_address_city: customerAddress.city,
      shipping_address_postcode: customerAddress.postcode,
      shipping_address_country: customerAddress.country,
    },
  };

  try {
    const response = await fetch(
      `${HOXTON_API_URL}/subscription/${externalId}/mail/${mailId}/forward`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " + Buffer.from(`${HOXTON_API_KEY}:`).toString("base64"),
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errorText = await response.text();
      console.error("❌ Hoxton API Error:", errorText);
      return res.status(response.status).json({ success: false, error: errorText });
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}
