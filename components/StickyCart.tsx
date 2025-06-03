"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Props {
  onChange?: (plan: "monthly" | "annual", hoxtonProductId: number, stripePriceId: string) => void;
  onCoupon?: (couponCode: string, discount: number, couponId: string | null) => void;
}

const planMap = {
  "price_1RBKvBACVQjWBIYus7IRSyEt": {
    label: "Monthly (£20 + VAT)",
    hoxtonProductId: 2736,
    price: 20,
  },
  "price_1RBKvlACVQjWBIYuVs4Of01v": {
    label: "Annual (£200 + VAT)",
    hoxtonProductId: 2737,
    price: 200,
  },
};

type StripePriceKey = keyof typeof planMap;

export default function StickyCart({ onChange, onCoupon }: Props) {
  const [stripePriceId, setStripePriceId] = useState<StripePriceKey>("price_1RBKvBACVQjWBIYus7IRSyEt");
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponId, setCouponId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("selected_plan");
    if (stored && stored in planMap) {
      const key = stored as StripePriceKey;
      setStripePriceId(key);
      onChange?.(
        key === "price_1RBKvBACVQjWBIYus7IRSyEt" ? "monthly" : "annual",
        planMap[key].hoxtonProductId,
        key
      );
    }
  }, [onChange]);

  const handleChange = (plan: "monthly" | "annual") => {
    const newStripeId: StripePriceKey =
      plan === "monthly"
        ? "price_1RBKvBACVQjWBIYus7IRSyEt"
        : "price_1RBKvlACVQjWBIYuVs4Of01v";

    localStorage.setItem("selected_plan", newStripeId);
    setStripePriceId(newStripeId);
    onChange?.(plan, planMap[newStripeId].hoxtonProductId, newStripeId);
  };

  const resetCouponState = () => {
    setDiscountAmount(0);
    setCouponApplied(false);
    setCouponId(null);
  };

  const handleApplyCoupon = async () => {
    const trimmedCode = couponCode.trim().toUpperCase();
    if (!trimmedCode) return;

    try {
      const res = await axios.post("/api/validate-coupon", {
        code: trimmedCode, // ✅ Updated key to match backend
      });

      if (res.data.valid) {
        setDiscountAmount(res.data.discountAmount || 0);
        setCouponId(res.data.couponId || null);
        setCouponApplied(true);
        onCoupon?.(trimmedCode, res.data.discountAmount || 0, res.data.couponId || null);
        toast.success(`🎉 Coupon "${trimmedCode}" applied successfully!`);
      } else {
        resetCouponState();
        toast.error("Invalid or expired coupon code.");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      resetCouponState();
      toast.error("❌ Error validating coupon. Try again later.");
    }
  };

  const currentPlan = planMap[stripePriceId];

  return (
    <div className="sticky top-0 z-50 bg-white shadow border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-sm md:text-base space-y-2 sm:space-y-0">
      <div className="flex flex-col">
        <strong>Selected Plan:</strong>{" "}
        <span className="text-blue-600 font-medium">
          {currentPlan?.label || "Loading..."}
        </span>

        {couponApplied && (
          <span className="text-green-600 text-sm mt-1">
            Discounted Price: £{(currentPlan.price - discountAmount).toFixed(2)}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-2 sm:mt-0">
        <input
          type="text"
          placeholder="Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="border p-1 rounded w-32 sm:w-40"
        />
        <button
          onClick={handleApplyCoupon}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mt-2 sm:mt-0"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
