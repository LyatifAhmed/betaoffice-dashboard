// pages/api/create-portal-link.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieHeader = req.headers.cookie || "";
  const externalId = parse(cookieHeader).external_id;

  if (!externalId) return res.status(401).json({ error: "Missing external_id cookie" });

  try {
    const backendUrl = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL!;
    const apiUser = process.env.NEXT_PUBLIC_API_USER!;
    const apiPass = process.env.NEXT_PUBLIC_API_PASS!;

    const subRes = await fetch(`${backendUrl}/subscription?external_id=${externalId}`, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${apiUser}:${apiPass}`).toString("base64"),
      },
    });

    const data = await subRes.json();
    const stripeCustomerId = data?.stripe_customer_id;

    if (!stripeCustomerId) throw new Error("Stripe customer ID not found");

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: "https://betaoffice.uk/dashboard",
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Portal link error:", err);
    res.status(500).json({ error: err.message });
  }
}
