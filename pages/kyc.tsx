"use client";

import { useEffect, useState } from "react";
import StickyCart from "../components/StickyCart";
import KycForm from "../components/KycForm";

const planMap = {
  monthly: {
    hoxtonProductId: 2736,
    label: "Monthly (£20 + VAT)",
  },
  annual: {
    hoxtonProductId: 2737,
    label: "Annual (£200 + VAT)",
  },
};

export default function KycPage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [hoxtonProductId, setHoxtonProductId] = useState<number>(planMap.monthly.hoxtonProductId);
  const [stripePriceId, setStripePriceId] = useState<string>("price_1RBKvBACVQjWBIYus7IRSyEt");
  const [couponId, setCouponId] = useState<string | null>(null);
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
  const [planLoaded, setPlanLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("selected_plan");
    console.log("Stored plan in localStorage:", stored);
    if (stored === "price_1RBKvBACVQjWBIYus7IRSyEt") {
      setSelectedPlan("monthly");
      setHoxtonProductId(planMap.monthly.hoxtonProductId);
      setStripePriceId(stored);
    } else if (stored === "price_1RBKvlACVQjWBIYuVs4Of01v") {
      setSelectedPlan("annual");
      setHoxtonProductId(planMap.annual.hoxtonProductId);
      setStripePriceId(stored);
    } else {
      console.warn("Unknown or missing stored plan. Defaulting to monthly.");
    }
    setPlanLoaded(true);
  }, []);

  const handleCartChange = (
    plan: "monthly" | "annual",
    hoxtonId: number,
    priceId: string
  ) => {
    setSelectedPlan(plan);
    setHoxtonProductId(hoxtonId);
    setStripePriceId(priceId);
  };

  const handleCouponUpdate = (
    couponCode: string,
    discount: number,
    couponId: string | null
  ) => {
    setDiscountedPrice(discount);
    setCouponId(couponId);
  };

  const selectedPlanLabel = planMap[selectedPlan]?.label || "Unknown Plan";

  console.log("Render State", {
    selectedPlan,
    hoxtonProductId,
    stripePriceId,
    planLoaded,
  });

  return (
    <>
      <StickyCart onChange={handleCartChange} onCoupon={handleCouponUpdate} />

      <main className="py-10 px-4">
        {planLoaded && hoxtonProductId ? (
          <KycForm
            lockedProductId={hoxtonProductId}
            selectedPlanLabel={selectedPlanLabel}
            discountedPrice={discountedPrice}
            couponCode={couponId || ""}
            stripePriceId={stripePriceId}
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