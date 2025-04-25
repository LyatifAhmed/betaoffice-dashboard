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
  const [planLoaded, setPlanLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("selected_plan") as "monthly" | "annual" | null;
    if (stored && planMap[stored]) {
      setSelectedPlan(stored);
      setHoxtonProductId(planMap[stored].hoxtonProductId);
    }
    setPlanLoaded(true);
  }, []);

  const handleCartChange = (plan: "monthly" | "annual", hoxtonId: number) => {
    setSelectedPlan(plan);
    setHoxtonProductId(hoxtonId);
  };

  const selectedPlanLabel = planMap[selectedPlan]?.label || "Unknown Plan";

  return (
    <>
      <StickyCart onChange={handleCartChange} />
      <main className="py-10 px-4">
        {planLoaded && hoxtonProductId ? (
          <KycForm lockedProductId={hoxtonProductId} selectedPlanLabel={selectedPlanLabel} />
        ) : (
          <div className="text-center mt-20 text-gray-600 text-sm animate-pulse">
            Loading selected plan...
          </div>
        )}
      </main>
    </>
  );
}

