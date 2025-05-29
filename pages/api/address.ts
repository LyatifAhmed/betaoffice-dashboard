import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawPostcode = req.query.postcode?.toString() || "";
  const postcode = rawPostcode.trim().toUpperCase();

  // Simple UK postcode format check
  const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}$/i;
  if (!postcodeRegex.test(postcode)) {
    return res.status(400).json({ error: "Invalid UK postcode format" });
  }

  try {
    // Example: Replace with your actual getAddress.io or similar API
    const apiKey = process.env.GETADDRESS_API_KEY;
    const endpoint = `https://api.getAddress.io/find/${postcode}?api-key=${apiKey}`;

    const fetchRes = await fetch(endpoint);
    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json({ error: "Address lookup failed" });
    }

    const data = await fetchRes.json();

    return res
      .status(200)
      .setHeader("Cache-Control", "no-store") // Disable cache
      .json({ addresses: data.addresses || [] });

  } catch (err) {
    console.error("Address lookup error:", err);
    return res.status(500).json({ error: "Server error during address lookup" });
  }
}
