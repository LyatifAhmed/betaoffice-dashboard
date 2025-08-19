// pages/kyc.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import StickyCart from "@/components/StickyCart";
import KycForm from "@/components/KycForm";

// ---- Types ----
type PlanKey = "monthly" | "annual";

type Plan = {
  hoxtonProductId: number;
  label: string;
  stripePriceId: string;
};

// ---- Plans ----
const planMap: Record<PlanKey, Plan> = {
  monthly: {
    hoxtonProductId: 2736,
    label: "Monthly (£20 + VAT)",
    stripePriceId: "price_1RBKvBACVQjWBIYus7IRSyEt",
  },
  annual: {
    hoxtonProductId: 2737,
    label: "Annual (£200 + VAT)",
    stripePriceId: "price_1RBKvlACVQjWBIYuVs4Of01v",
  },
};

// Navbar yaklaşık yüksekliği
const NAV_HEIGHT = 72; // px

export default function KycPage() {
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("monthly");
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");
  const [planLoaded, setPlanLoaded] = useState(false);

  // Referral
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // ---- Load selected plan from localStorage ----
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("selected_plan") : null;
      if (stored === planMap.annual.stripePriceId) setSelectedPlan("annual");
      else if (stored === planMap.monthly.stripePriceId) setSelectedPlan("monthly");
    } finally {
      setPlanLoaded(true);
    }
  }, []);

  // ---- Detect referral code from URL & persist ----
  useEffect(() => {
    const q = router.query;
    const possibleKeys = ["ref", "referral", "rc", "code"];
    let found: string | null = null;

    for (const k of possibleKeys) {
      const v = q[k] as string | undefined;
      if (v && typeof v === "string" && v.trim() !== "") {
        found = v.trim();
        break;
      }
    }

    try {
      if (found) {
        localStorage.setItem("referrer_code", found);
        setReferralCode(found);
      } else {
        const stored = localStorage.getItem("referrer_code");
        if (stored && stored.trim() !== "") setReferralCode(stored.trim());
      }
    } catch {}
  }, [router.query]);

  // ---- StickyCart callbacks ----
  const handleCartChange = (plan: PlanKey, _hoxtonId: number, stripePriceId: string) => {
    setSelectedPlan(plan);
    try {
      localStorage.setItem("selected_plan", stripePriceId);
    } catch {}
  };

  const handleCouponUpdate = (code: string, discount: number, id: string | null) => {
    setCouponCode(code || "");
    setDiscountedPrice(Number.isFinite(discount) ? discount : 0);
    setCouponId(id);
  };

  const currentPlan = planMap[selectedPlan];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* NAVBAR (çizgisiz görünüm için flat prop’un varsa kullan) */}
      <div className="relative z-30">
        {/* Eğer Navbar flat prop desteklemiyorsa <Navbar /> olarak bırak */}
        <Navbar /* flat */ />
      </div>

      {/* STICKY CART — Navbar'ın hemen altında yapışık */}
      <div
        className="sticky z-20 w-full border-b border-transparent bg-transparent"
        style={{ top: NAV_HEIGHT }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <StickyCart onChange={handleCartChange} onCoupon={handleCouponUpdate} />
        </div>
      </div>

      {/* İçerik — nav + cart aşağısında başlasın */}
      <main className="mx-auto max-w-4xl px-4 pt-20">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-200 dark:border-white/10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Verification</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Choose your plan in the cart, complete KYC, then proceed to payment.
          </p>

          {/* KYC FORM anchor */}
          <div id="kyc-form">
            {planLoaded ? (
              <KycForm
                lockedProductId={currentPlan.hoxtonProductId}
                selectedPlanLabel={currentPlan.label}
                stripePriceId={currentPlan.stripePriceId}
                discountedPrice={discountedPrice}
                couponId={couponId}
                // KycForm props'unda yoksa bu satırı kaldır veya KycForm'da optional ekle
                // referralCode={referralCode || undefined}
              />
            ) : (
              <div className="text-center mt-20 text-gray-600 dark:text-gray-300 text-sm animate-pulse">
                Loading selected plan...
              </div>
            )}
          </div>

          {/* Referral legal note */}
          {referralCode && (
            <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/40 p-4">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                <strong>Referral notice:</strong> If you arrived via a referral link, your referrer may receive a small
                reward after your account is activated and your first payment is successfully processed. This does not
                affect the price you pay. Rewards are subject to our{" "}
                <Link href="/terms-of-service#referrals" className="underline">
                  Referral Terms
                </Link>
                .
              </p>
              <p className="mt-2 text-[12px] text-amber-800/80 dark:text-amber-200/80">
                Referral code detected:{" "}
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-800 rounded">{referralCode}</code>
              </p>
            </div>
          )}
        </div>
      </main>
      {/* Footer kaldırıldı (duplicate fix) */}
    </div>
  );
}
