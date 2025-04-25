"use client";

import { useEffect, useState } from "react";
import StickyCart from "../components/StickyCart";
import KycForm from "../components/KycForm";
import Link from 'next/link';

export default function KYCPage() {
  const [lockedProductId, setLockedProductId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("selected_plan");
    if (stored) {
      setLockedProductId(stored);
    }
  }, []);

  if (!lockedProductId) {
    return (
      <div className="text-center mt-10">
        ❌ No plan selected. Please go back to{" "}
        <Link href="/" className="text-blue-600 underline">
          homepage
        </Link>{" "}
        and choose a plan.
      </div>
    );
  }

  return (
    <div>
      <StickyCart />
      <div className="mt-4">
        <KycForm lockedProductId={lockedProductId} />
      </div>
    </div>
  );
}


