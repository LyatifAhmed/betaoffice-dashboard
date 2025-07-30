import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ShoppingCart, CheckCircle2 } from "lucide-react";

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
  const [hovered, setHovered] = useState(false);

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
      const res = await axios.post("/api/validate-coupon", { couponCode: trimmedCode });

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
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        hovered ? "w-[90%] sm:w-[500px] p-4 shadow-xl" : "w-56 p-2"
      } bg-white border rounded-xl shadow-sm overflow-hidden`}
    >
      {/* Compact view */}
      {!hovered && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-800">{currentPlan?.label}</span>
          </div>
          {couponApplied && (
            <span className="text-xs text-green-600 font-semibold">
              -£{discountAmount.toFixed(2)}
            </span>
          )}
        </div>
      )}

      {/* Expanded view */}
      {hovered && (
        <>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-gray-900">Your Plan</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleChange("monthly")}
                className={`text-sm px-3 py-1 rounded-md border ${
                  stripePriceId === "price_1RBKvBACVQjWBIYus7IRSyEt"
                    ? "bg-blue-600 text-white"
                    : "border-blue-600 text-blue-600"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => handleChange("annual")}
                className={`text-sm px-3 py-1 rounded-md border ${
                  stripePriceId === "price_1RBKvlACVQjWBIYuVs4Of01v"
                    ? "bg-green-600 text-white"
                    : "border-green-600 text-green-600"
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          <p className="font-semibold text-blue-700">{currentPlan?.label}</p>
          {couponApplied && (
            <p className="text-green-600 text-sm mt-1">
              Discounted Price: £{(currentPlan.price - discountAmount).toFixed(2)}
            </p>
          )}

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm">
            {[
              "AI Mail Sorting",
              "Full Privacy (Director Address)",
              "Fast Setup (under 10 min)",
              "Transparent Pricing – No Hidden Fees",
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center space-x-2 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flex mt-4 space-x-2">
            <input
              type="text"
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="border p-2 rounded-md flex-1"
            />
            <button
              onClick={handleApplyCoupon}
              className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-md"
            >
              Apply
            </button>
          </div>
        </>
      )}
    </div>
  );
}
