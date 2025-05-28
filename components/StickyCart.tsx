"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Props = {
  onChange?: (
    plan: "monthly" | "annual",
    hoxtonProductId: number,
    stripePriceId: string
  ) => void;
  email?: string; // optional prop for checkout
};

export default function StickyCart({ onChange, email }: Props) {
  const planMap: Record<
    string,
    { label: string; hoxtonProductId: number; price: number }
  > = {
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

  const [stripePriceId, setStripePriceId] = useState<string>("price_1RBKvBACVQjWBIYus7IRSyEt");
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [couponId, setCouponId] = useState<string | null>(null);

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

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    if (!stripe) {
      toast.error("Stripe failed to load.");
      return;
    }

    const safeEmail = email || "test@example.com";
    const externalId = `${safeEmail.split("@")[0]}-${new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .slice(0, 14)}`;

    try {
      const res = await axios.post("/api/checkout-session", {
        stripePriceId,
        externalId,
        couponId,
      });


      const sessionId = res.data?.sessionId;

      if (sessionId) {
        await stripe.redirectToCheckout({ sessionId });
      } else {
        console.warn("❌ No session ID returned:", res.data);
        toast.error("Unable to start checkout.");
      }
    } catch (error: any) {
      console.error("❌ Stripe checkout error:", error);
      toast.error("Checkout failed. Please try again.");
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
            Discounted Price: £
            {(currentPlan.price - discountAmount).toFixed(2)}
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

      <button
        onClick={handleCheckout}
        className="bg-black text-white px-4 py-2 rounded hover:opacity-80 mt-4 sm:mt-0"
      >
        Checkout
      </button>
    </div>
  );
}
