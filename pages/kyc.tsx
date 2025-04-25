// pages/kyc.tsx
"use client";

import { useEffect, useState } from "react";
import StickyCart from "../components/StickyCart";
import KycForm from "../components/KycForm";

export default function KYCPage() {
  const [productId, setProductId] = useState<number | null>(null);

  useEffect(() => {
    const selected = localStorage.getItem("selected_plan");
    if (selected === "monthly") {
      setProductId(2736);
    } else if (selected === "annual") {
      setProductId(2737);
    }
  }, []);

  if (!productId) {
    return (
      <div className="p-6 text-center text-red-600">
        ❌ No plan selected. Please choose a plan first.
      </div>
    );
  }

  return (
    <div>
      <StickyCart />
      <div className="bg-green-50 border border-green-500 p-4 text-center text-green-700 font-medium">
        You selected the <strong>{productId === 2736 ? "Monthly" : "Annual"}</strong> plan. Let’s complete your KYC!
      </div>
      <KycForm lockedProductId={productId} />
    </div>
  );
}


