"use client";

import { useEffect, useState } from "react";
import StickyCart from "../components/StickyCart";
import KycForm from "../components/KycForm";

export default function KycPage() {
  const [hoxtonProductId, setHoxtonProductId] = useState<number | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);

  const planMap: Record<string, number> = {
    "price_1RBKvBACVQjWBIYus7IRSyEt": 2736, // Monthly
    "price_1RBKvlACVQjWBIYuVs4Of01v": 2737  // Annual
  };

  useEffect(() => {
    const stored = localStorage.getItem("selected_plan");
    if (stored && planMap[stored]) {
      setHoxtonProductId(planMap[stored]);
    }
    setPlanLoaded(true);
  }, []);

  return (
    <>
      <StickyCart />
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




