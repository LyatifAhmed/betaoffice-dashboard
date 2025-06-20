"use client";

import { useEffect, useState } from "react";
import StickyCart from "../components/StickyCart";
import KycForm from "../components/KycForm"; // This is your form component

const planMap = {
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
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");
  const [planLoaded, setPlanLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("selected_plan");
    if (stored === planMap.annual.stripePriceId) {
      setSelectedPlan("annual");
    } else {
      setSelectedPlan("monthly");
    }
    setPlanLoaded(true);
  }, []);

  const handleCartChange = (
    plan: "monthly" | "annual",
    hoxtonId: number,
    stripePriceId: string
  ) => {
    setSelectedPlan(plan);
    localStorage.setItem("selected_plan", stripePriceId);
  };

  const handleCouponUpdate = (
    code: string,
    discount: number,
    id: string | null
  ) => {
    setCouponCode(code);
    setDiscountedPrice(discount);
    setCouponId(id);
  };

  const currentPlan = planMap[selectedPlan];

  return (
    <>
      <StickyCart onChange={handleCartChange} onCoupon={handleCouponUpdate} />

      <main className="py-10 px-4">
        {planLoaded ? (
          <KycForm
            lockedProductId={currentPlan.hoxtonProductId}
            selectedPlanLabel={currentPlan.label}
            stripePriceId={currentPlan.stripePriceId}
            discountedPrice={discountedPrice}
            couponId={couponId} // ✅ matches KycForm props
          />
        ) : (
          <div className="text-center mt-20 text-gray-600 text-sm animate-pulse">
            Loading selected plan...
          </div>
        )}
      </main>
    </>
  );
}
