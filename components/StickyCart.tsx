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
        couponCode: trimmedCode,
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
    <div className="sticky top-0 z-50 bg-gray-50 border border-gray-300 shadow-lg px-6 py-6 rounded-md mx-4 sm:mx-auto max-w-4xl mt-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-800">Selected Plan:</h3>
          <p className="text-blue-700 font-bold text-lg">{currentPlan?.label || "Loading..."}</p>
          {couponApplied && (
            <p className="text-green-600 mt-1 text-sm">
              Discounted Price: £{(currentPlan.price - discountAmount).toFixed(2)}
            </p>
          )}
        </div>

        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => handleChange("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 ${
              stripePriceId === "price_1RBKvBACVQjWBIYus7IRSyEt"
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 border-blue-600"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => handleChange("annual")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 ${
              stripePriceId === "price_1RBKvlACVQjWBIYuVs4Of01v"
                ? "bg-green-600 text-white"
                : "bg-white text-green-600 border-green-600"
            }`}
          >
            Annual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <p><strong>✓ AI Mail Sorting</strong> – Organised inbox with smart summaries.</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <p><strong>✓ Full Privacy</strong> – Director address privacy included.</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <p><strong>✓ Fast Setup</strong> – Get started in under 10 minutes.</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <p><strong>✓ Transparent Pricing</strong> – No hidden handling or setup fees.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:space-x-2">
        <input
          type="text"
          placeholder="Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="border p-2 rounded-md w-full sm:w-48 mb-2 sm:mb-0"
        />
        <button
          onClick={handleApplyCoupon}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
        >
          Apply Coupon
        </button>
      </div>
    </div>
  );
}
