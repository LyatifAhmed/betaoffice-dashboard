"use client";

import { useEffect, useState } from "react";

type Props = {
  onChange?: (
    plan: "monthly" | "annual",
    hoxtonProductId: number,
    stripePriceId: string
  ) => void;
};

export default function StickyCart({ onChange }: Props) {
  const planMap: Record<string, { label: string; hoxtonProductId: number }> = {
    "price_1RBKvBACVQjWBIYus7IRSyEt": {
      label: "Monthly (£20 + VAT)",
      hoxtonProductId: 2736,
    },
    "price_1RBKvlACVQjWBIYuVs4Of01v": {
      label: "Annual (£200 + VAT)",
      hoxtonProductId: 2737,
    },
  };

  const [stripePriceId, setStripePriceId] = useState<string>("price_1RBKvBACVQjWBIYus7IRSyEt"); // default to monthly

  useEffect(() => {
    const stored = localStorage.getItem("selected_plan");
    if (stored && planMap[stored]) {
      setStripePriceId(stored);
      onChange?.(
        stored === "price_1RBKvBACVQjWBIYus7IRSyEt" ? "monthly" : "annual",
        planMap[stored].hoxtonProductId,
        stored
      );
    }
  }, [onChange]);

  const handleChange = (plan: "monthly" | "annual") => {
    const newStripeId =
      plan === "monthly"
        ? "price_1RBKvBACVQjWBIYus7IRSyEt"
        : "price_1RBKvlACVQjWBIYuVs4Of01v";

    localStorage.setItem("selected_plan", newStripeId);
    setStripePriceId(newStripeId);
    onChange?.(plan, planMap[newStripeId].hoxtonProductId, newStripeId);
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow border-b border-gray-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-sm md:text-base">
      <div className="mb-2 sm:mb-0">
        <strong>Selected Plan: </strong>{" "}
        <span className="text-blue-600 font-medium">
          {planMap[stripePriceId]?.label || "Loading..."}
        </span>
      </div>
      <div className="space-x-2">
        <button
          onClick={() => handleChange("monthly")}
          className={`px-3 py-1 rounded border ${
            stripePriceId === "price_1RBKvBACVQjWBIYus7IRSyEt"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border-blue-600"
          } hover:opacity-90 transition`}
        >
          Monthly
        </button>
        <button
          onClick={() => handleChange("annual")}
          className={`px-3 py-1 rounded border ${
            stripePriceId === "price_1RBKvlACVQjWBIYuVs4Of01v"
              ? "bg-green-600 text-white"
              : "bg-white text-green-600 border-green-600"
          } hover:opacity-90 transition`}
        >
          Annual
        </button>
      </div>
    </div>
  );
}

