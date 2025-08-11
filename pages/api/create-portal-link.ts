// pages/api/create-portal-link.ts
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";
import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // İstersen sabit/stable bir tarih kullan: "2024-06-20"
  apiVersion: "2025-07-30.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieHeader = req.headers.cookie || "";
  const externalId = parse(cookieHeader).external_id;

  if (!externalId) return res.status(401).json({ error: "Missing external_id cookie" });

  try {
    const backendUrl = getBackendUrl();

    // Backend'deki GET /subscription/{external_id} endpoint'i (path param)
    const subRes = await fetch(
      `${backendUrl}/subscription/${encodeURIComponent(externalId)}`,
      withBasicAuth()
    );

    if (!subRes.ok) {
      const errText = await subRes.text();
      throw new Error(`Backend subscription fetch failed: ${subRes.status} ${errText}`);
    }

    const data = await subRes.json();
    const stripeCustomerId = data?.stripe_customer_id;
    if (!stripeCustomerId) throw new Error("Stripe customer ID not found");

    const baseUrl = (
      process.env.BASE_URL ||                           // .env.local / prod
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) || // Vercel preview
      req.headers.origin ||                             // fallback: isteğin origin'i
      "http://localhost:3000"
    ).replace(/\/$/, "");

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/dashboard`,
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Portal link error:", err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
}
