"use client";

import StickyCart from "../components/StickyCart";
import { useEffect, useState } from "react";
import KycForm from "../components/KycForm";

export default function KycPage() {
  const [hoxtonProductId, setHoxtonProductId] = useState<number | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);

  const planMap: Record<string, { hoxtonProductId: number; label: string }> = {
    "price_1RBKvBACVQjWBIYus7IRSyEt": { hoxtonProductId: 2736, label: "Monthly (£20 + VAT)" },
    "price_1RBKvlACVQjWBIYuVs4Of01v": { hoxtonProductId: 2737, label: "Annual (£200 + VAT)" },
  };

  useEffect(() => {
    const stored = localStorage.getItem("selected_plan");
    if (stored && planMap[stored]) {
      setHoxtonProductId(planMap[stored].hoxtonProductId);
    }
    setPlanLoaded(true);
  }, []);

  const handleCartChange = (
    _plan: "monthly" | "annual",
    hoxtonProductId: number
  ) => {
    setHoxtonProductId(hoxtonProductId);
  };

  return (
    <>
      <StickyCart onChange={handleCartChange} />
      <main className="py-10 px-4">
        {planLoaded && hoxtonProductId ? (
          <KycForm lockedProductId={hoxtonProductId} />
        ) : (
          <div className="text-center mt-20 text-gray-600 text-sm animate-pulse">
            Loading selected plan...
          </div>
        )}
      </main>
    </>
  );
}
