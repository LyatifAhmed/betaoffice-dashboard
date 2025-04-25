"use client";

import { useEffect, useState } from "react";
import StickyCart from "../components/StickyCart";
import KycForm from "../components/KycForm";

export default function KycPage() {
  const [hoxtonProductId, setHoxtonProductId] = useState<number | null>(null);
  const [stripePriceId, setStripePriceId] = useState<string | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);

  // Map for plan logic
  const planMap = {
    monthly: { hoxton: 2736, stripe: "price_1RBKvBACVQjWBIYus7IRSyEt" },
    annual: { hoxton: 2737, stripe: "price_1RBKvlACVQjWBIYuVs4Of01v" },
  };

  // Load initial plan from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("selected_plan") as "monthly" | "annual" | null;
    if (stored && planMap[stored]) {
      setHoxtonProductId(planMap[stored].hoxton);
      setStripePriceId(planMap[stored].stripe);
    }
    setPlanLoaded(true);
  }, []);

  // Handle update when user switches plan
  const handlePlanChange = (plan: "monthly" | "annual", hoxtonId: number, stripeId: string) => {
    localStorage.setItem("selected_plan", plan);
    setHoxtonProductId(hoxtonId);
    setStripePriceId(stripeId);
  };

  return (
    <main className="py-10 px-4">
      <StickyCart onChange={handlePlanChange} />
      {planLoaded && hoxtonProductId && stripePriceId ? (
        <KycForm lockedProductId={hoxtonProductId} stripePriceId={stripePriceId} />
      ) : (
        <div className="text-center mt-20 text-gray-600 text-sm animate-pulse">
          Loading selected plan...
        </div>
      )}
    </main>
  );
}
