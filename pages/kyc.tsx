// pages/kyc.tsx
"use client";

import StickyCart from "../components/StickyCart";
import KycForm from "../components/KycForm";
import { useState } from "react";

export default function KycPage() {
  const [productId, setProductId] = useState<number | null>(null);
  const [stripePriceId, setStripePriceId] = useState<string>("");

  const handleCartChange = (
    plan: "monthly" | "annual",
    hoxtonProductId: number,
    stripePriceId: string
  ) => {
    setProductId(hoxtonProductId);
    setStripePriceId(stripePriceId);
    // Also store price ID in localStorage for webhook tracking (optional)
    localStorage.setItem("selected_plan", stripePriceId);
  };

  return (
    <>
      <StickyCart onChange={handleCartChange} />
      {productId && <KycForm lockedProductId={productId} />}
    </>
  );
}


