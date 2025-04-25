"use client";

import { useState, useEffect } from "react";
import StickyCart from "../components/StickyCart";
import KycForm from "../components/KycForm";

export default function KycPage() {
  const [hoxtonProductId, setHoxtonProductId] = useState<number | null>(null);
  const [stripePriceId, setStripePriceId] = useState<string | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);

  const handlePlanChange = (
    plan: "monthly" | "annual",
    hoxtonId: number,
    stripeId: string
  ) => {
    setHoxtonProductId(hoxtonId);
    setStripePriceId(stripeId);
    setPlanLoaded(true);
  };

  useEffect(() => {
    const stored = localStorage.getItem("selected_plan");
    if (stored === "monthly" || stored === "annual") {
      const hoxtonId = stored === "monthly" ? 2736 : 2737;
      const stripeId =
        stored === "monthly"
          ? "price_1RBKvBACVQjWBIYus7IRSyEt"
          : "price_1RBKvlACVQjWBIYuVs4Of01v";
      handlePlanChange(stored, hoxtonId, stripeId);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyCart onChange={handlePlanChange} />

      <main className="py-10 px-4">
        {planLoaded && hoxtonProductId ? (
          <KycForm lockedProductId={hoxtonProductId.toString()} />
        ) : (
          <div className="text-center mt-20 text-gray-600 text-sm animate-pulse">
            Loading selected plan...
          </div>
        )}
      </main>
    </div>
  );
}



