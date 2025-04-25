"use client";

import { useEffect, useState } from "react";

type Props = {
  onChange?: (plan: "monthly" | "annual") => void;
};

export default function StickyCart({ onChange }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");

  useEffect(() => {
    const stored = localStorage.getItem("selected_plan");
    if (stored === "annual" || stored === "monthly") {
      setSelectedPlan(stored);
      onChange?.(stored);
    }
  }, [onChange]);

  const handleChange = (plan: "monthly" | "annual") => {
    localStorage.setItem("selected_plan", plan);
    setSelectedPlan(plan);
    onChange?.(plan);
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow border-b border-gray-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-sm md:text-base">
      <div className="mb-2 sm:mb-0">
        <strong>Selected Plan: </strong>{" "}
        <span className="text-blue-600 font-medium">
          {selectedPlan === "monthly" ? "Monthly (£20 + VAT)" : "Annual (£200 + VAT)"}
        </span>
      </div>
      <div className="space-x-2">
        <button
          onClick={() => handleChange("monthly")}
          className={`px-3 py-1 rounded border ${
            selectedPlan === "monthly"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border-blue-600"
          } hover:opacity-90 transition`}
        >
          Monthly
        </button>
        <button
          onClick={() => handleChange("annual")}
          className={`px-3 py-1 rounded border ${
            selectedPlan === "annual"
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
