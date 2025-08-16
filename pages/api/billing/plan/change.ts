// /pages/api/billing/plan/change.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../_shared";
import { getExternalId, getDbSubscription } from "../_shared";
import { stripe } from "../_shared";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const externalId = getExternalId(req, res);
  if (!externalId) return;

  const { price_id } = (req.body ?? {}) as { price_id?: string };
  if (!price_id) {
    return res.status(400).json({ error: "Missing price_id" });
  }

  try {
    const dbSub = await getDbSubscription(externalId);
    if (!dbSub?.stripe_subscription_id) {
      return res.status(404).json({ error: "Stripe subscription not found" });
    }

    // Stripe: mevcut abonelikteki ilk item’ı yeni price ile güncelle
    const stripeSub = await stripe.subscriptions.retrieve(dbSub.stripe_subscription_id);
    const itemId = stripeSub.items.data[0]?.id;
    if (!itemId) {
      return res.status(500).json({ error: "No subscription item on Stripe" });
    }

    await stripe.subscriptionItems.update(itemId, { price: price_id, proration_behavior: "create_prorations" });

    // DB’de de price_id’ı saklayalım (tekil model adı!)
    await prisma.subscriptions.update({
      where: { external_id: externalId },
      data: { stripe_price_id: price_id },
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("plan/change error:", e);
    res.status(500).json({ error: "Failed to change plan" });
  }
}
