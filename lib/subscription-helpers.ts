// lib/subscription-helpers.ts
import type { NextApiRequest } from "next";
import { getBackendUrl, withBasicAuth } from "./server-backend";
import { getExternalId } from "./get-external";

type CompanyLike = {
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  price_id?: string | null;
  // fallback alanlar:
  subscription?: any;
  wallet_balance?: number;
};

export async function loadCompanyByExternalId(req: NextApiRequest) {
  const external_id = getExternalId(req);
  if (!external_id) return { external_id: null, company: null };

  const url = `${getBackendUrl()}/company?external_id=${encodeURIComponent(external_id)}`;
  const r = await fetch(url, withBasicAuth({ headers: { accept: "application/json" } }));
  if (!r.ok) return { external_id, company: null };

  const company = (await r.json()) as CompanyLike;
  return { external_id, company };
}

export function pickStripeCustomer(company: CompanyLike | null) {
  return company?.stripe_customer_id || company?.subscription?.stripe_customer_id || null;
}
export function pickStripeSubscription(company: CompanyLike | null) {
  return (
    company?.stripe_subscription_id ||
    company?.subscription?.stripe_subscription_id ||
    null
  );
}
