"use client";

import { useEffect, useState } from "react";
import StickyCart from "../components/StickyCart";
import KycForm from "../components/KycForm"; // This is your form component

// Types
type PlanKey = "monthly" | "annual";

type Plan = {
  hoxtonProductId: number;
  label: string;
  stripePriceId: string;
};

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

export default function KycPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("monthly");
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");
  const [planLoaded, setPlanLoaded] = useState(false);

  // Load previously chosen plan (by stored Stripe price id)
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("selected_plan") : null;
      if (stored === planMap.annual.stripePriceId) {
        setSelectedPlan("annual");
      } else if (stored === planMap.monthly.stripePriceId) {
        setSelectedPlan("monthly");
      }
    } finally {
      setPlanLoaded(true);
    }
  }, []);

  // StickyCart -> plan change
  const handleCartChange = (
    plan: PlanKey,
    _hoxtonId: number,
    stripePriceId: string
  ) => {
    setSelectedPlan(plan);
    // Persist last chosen Stripe price on client
    try {
      localStorage.setItem("selected_plan", stripePriceId);
    } catch {}
  };

  // StickyCart -> coupon update
  const handleCouponUpdate = (
    code: string,
    discount: number,
    id: string | null
  ) => {
    setCouponCode(code || "");
    setDiscountedPrice(Number.isFinite(discount) ? discount : 0);
    setCouponId(id);
  };

  const currentPlan = planMap[selectedPlan];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <StickyCart onChange={handleCartChange} onCoupon={handleCouponUpdate} />

      <main className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-200 dark:border-white/10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Verification</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Choose your plan in the cart, complete KYC, then proceed to payment.
          </p>

          {/* Optional: show applied coupon */}
          {couponId && (
            <div className="mb-6 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40">
              Coupon <strong>{couponCode.toUpperCase()}</strong> applied.
            </div>
          )}

          {planLoaded ? (
            <KycForm
              lockedProductId={currentPlan.hoxtonProductId}
              selectedPlanLabel={currentPlan.label}
              stripePriceId={currentPlan.stripePriceId}
              discountedPrice={discountedPrice}
              couponId={couponId}
            />
          ) : (
            <div className="text-center mt-20 text-gray-600 dark:text-gray-300 text-sm animate-pulse">
              Loading selected plan...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
