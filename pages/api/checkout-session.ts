// pages/api/checkout-session.ts  (veya create-checkout-session.ts)
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

type Body = {
  price_id: string;
  external_id: string;
  coupon_id?: string | null;
  email?: string | null;
  referrer_code?: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { price_id, external_id, coupon_id, email, referrer_code } = (req.body || {}) as Body;
  if (!price_id || !external_id) return res.status(400).json({ error: "Missing required fields (price_id, external_id)" });

  try {
    const meta: Record<string, string> = { external_id, stripe_price_id: price_id };
    if (referrer_code?.trim()) meta.referrer_code = referrer_code.trim();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: price_id, quantity: 1 }],

      // 7 gün “trial” + ödeme yöntemi topla
      subscription_data: {
        trial_period_days: 7,
        trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
        metadata: meta,
      },

      payment_method_collection: "always", // ✅ subscription ile kullanılabilir
      // ⛔ customer_creation KALDIRILDI

      customer_email: email || undefined, // Stripe gerekirse otomatik Customer oluşturur
      billing_address_collection: "auto",

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/kyc-submitted?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,

      metadata: meta,
      discounts: coupon_id && coupon_id.trim() !== "" ? [{ coupon: coupon_id }] : undefined,
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("❌ Stripe Checkout Error:", err?.message || err);
    return res.status(500).json({ error: "Failed to create Stripe checkout session" });
  }
}
