"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  ShoppingCart,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useAnimation,
} from "framer-motion";

interface Props {
  onChange?: (
    plan: "monthly" | "annual",
    hoxtonProductId: number,
    stripePriceId: string
  ) => void;
  onCoupon?: (
    couponCode: string,
    discount: number,
    couponId: string | null
  ) => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
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
  const isMobile = useIsMobile();
  const [stripePriceId, setStripePriceId] = useState<StripePriceKey>(
    "price_1RBKvBACVQjWBIYus7IRSyEt"
  );
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [mouseX, setMouseX] = useState(0);

  const x = useMotionValue(0);
  const controls = useAnimation();
  const screenWidthRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      screenWidthRef.current = window.innerWidth;
    }
  }, []);

  const currentPlan = planMap[stripePriceId];

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
        onCoupon?.(
          trimmedCode,
          res.data.discountAmount || 0,
          res.data.couponId || null
        );
        toast.success(`🎉 Coupon "${trimmedCode}" applied successfully!`);
      } else {
        setDiscountAmount(0);
        setCouponApplied(false);
        setCouponId(null);
        toast.error("Invalid or expired coupon code.");
      }
    } catch {
      toast.error("❌ Error validating coupon. Try again later.");
    }
  };

  const handlePlanChange = (plan: "monthly" | "annual") => {
    const newId =
      plan === "monthly"
        ? "price_1RBKvBACVQjWBIYus7IRSyEt"
        : "price_1RBKvlACVQjWBIYuVs4Of01v";
    localStorage.setItem("selected_plan", newId);
    setStripePriceId(newId);
    onChange?.(plan, planMap[newId].hoxtonProductId, newId);
  };

  const snapToNearest = async () => {
    if (!screenWidthRef.current) return;
    const safeMargin = 300; // 16px boşluk ekranın kenarlarından
    const snapPoints = [
      -screenWidthRef.current / 2 + safeMargin,
      0,
      screenWidthRef.current / 2 - safeMargin,
    ];
    const current = x.get();
    const closest = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - current) < Math.abs(prev - current) ? curr : prev
    );
    await controls.start({
      x: closest,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    });
  };


  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-[75%] max-w-lg z-50">
      <motion.div
        drag="x"
        dragConstraints={{
          left: -(screenWidthRef.current || 0) / 2 + 80,
          right: (screenWidthRef.current || 0) / 2 - 80,
        }}
        style={{ x }}
        animate={controls}
        dragElastic={0.2}
        dragMomentum={false}
        onDragEnd={snapToNearest}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          setMouseX(e.clientX - rect.left);
        }}
        className={`relative rounded-2xl border border-gray-200 bg-white/30 backdrop-blur-md shadow-lg transition-all duration-500 ease-in-out pointer-events-auto hover:ring-2 hover:ring-blue-500/60 hover:shadow-xl hover:shadow-blue-500/30 ${
          expanded ? "p-4" : "h-14 px-4"
        }`}
        onMouseEnter={() => !isMobile && setExpanded(true)}
        onMouseLeave={() => !isMobile && setExpanded(false)}
      >
        <motion.div
          className="absolute top-0 left-0 h-full w-1 pointer-events-none z-[-1]"
          style={{
            left: mouseX,
            background: "linear-gradient(to bottom, #3b82f6, transparent)",
            width: "100px",
            opacity: 0.25,
            filter: "blur(40px)",
          }}
        />

        <div
          className="flex justify-between items-center h-full cursor-pointer"
          onClick={() => isMobile && setExpanded((prev) => !prev)}
        >
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-800">
              {currentPlan.label}
              {couponApplied && (
                <span className="text-green-600 ml-2">
                  -£{discountAmount.toFixed(2)}
                </span>
              )}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              key="cart-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-4 space-y-4 text-sm text-gray-700"
            >
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePlanChange("monthly")}
                  className={`text-sm px-3 py-1 rounded-md border ${
                    stripePriceId === "price_1RBKvBACVQjWBIYus7IRSyEt"
                      ? "bg-blue-600 text-white"
                      : "border-blue-600 text-blue-600"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => handlePlanChange("annual")}
                  className={`text-sm px-3 py-1 rounded-md border ${
                    stripePriceId === "price_1RBKvlACVQjWBIYuVs4Of01v"
                      ? "bg-green-600 text-white"
                      : "border-green-600 text-green-600"
                  }`}
                >
                  Annual
                </button>
              </div>

              {couponApplied && (
                <p className="text-green-600">
                  Discounted Price: £{(
                    currentPlan.price - discountAmount
                  ).toFixed(2)}
                </p>
              )}

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {["AI Mail Sorting", "Full Privacy (Director Address)", "Fast Setup", "Transparent Pricing – No Hidden Fees"].map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
