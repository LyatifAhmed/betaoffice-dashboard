// components/StickyCart.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ShoppingCart, ShieldCheck, Bot, BadgePercent, Sparkles,
} from "lucide-react";

type PlanKey = "monthly" | "annual";
interface StickyCartProps {
  onChange?: (plan: PlanKey, hoxtonProductId: number, stripePriceId: string) => void;
  onCoupon?: (code: string, discount: number, id: string | null) => void;
}

const VAT_RATE = 0.2;
const PRICES: Record<PlanKey, { stripeId: string; hoxtonProductId: number; base: number; period: "/month" | "/year" }> = {
  monthly: { stripeId: "price_1RBKvBACVQjWBIYus7IRSyEt", hoxtonProductId: 2736, base: 20,  period: "/month" },
  annual:  { stripeId: "price_1RBKvlACVQjWBIYuVs4Of01v", hoxtonProductId: 2737, base: 200, period: "/year"  },
};

export default function StickyCart({ onChange, onCoupon }: StickyCartProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PlanKey>("monthly");

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("selected_plan_key") as PlanKey | null;
      if (s === "monthly" || s === "annual") setSelected(s);
    } catch {}
  }, []);

  useEffect(() => {
    const p = PRICES[selected];
    onChange?.(selected, p.hoxtonProductId, p.stripeId);
    try { localStorage.setItem("selected_plan_key", selected); } catch {}
    // plan değişince kuponu sıfırla
    setDiscount(0); setCouponApplied(false); setCouponId(null);
  }, [selected, onChange]);

  const base = PRICES[selected].base;
  const effectiveBase = Math.max(0, base - Math.max(0, discount));
  const vat = +(effectiveBase * VAT_RATE).toFixed(2);
  const total = +(effectiveBase + vat).toFixed(2);

  // saving badges (Hoxton hissi)
  const eqMonthly = 200 / 12; // 16.67
  const savePerMonthIncVat = +((20 - eqMonthly) * (1 + VAT_RATE)).toFixed(2); // ~4.00
  const savePerYearIncVat = +(savePerMonthIncVat * 12).toFixed(2); // ~48.00

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setBusy(true);
    try {
      const resp = await fetch("/api/validate-coupon", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: code, plan: selected }),
      });
      const data = await resp.json();

      if (resp.ok && data.valid) {
        const amountOff = Math.max(0, Number(data.amountOff ?? 0));
        const applied = Math.min(amountOff, base);
        setDiscount(applied);
        setCouponApplied(true);
        setCouponId(data.couponId || null);
        onCoupon?.(code, applied, data.couponId || null);
        toast.success("Coupon applied");
      } else {
        setDiscount(0);
        setCouponApplied(false);
        setCouponId(null);
        toast.error(data?.message || "Invalid or expired coupon");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleContinue = () => {
    setOpen(false);
    document.querySelector("#kyc-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed right-6 z-50" style={{ top: "100px" }}>

      {/* floating button */}
      <button
        onClick={() => setOpen((s) => !s)}
        className="relative w-14 h-14 flex items-center justify-center rounded-full 
                   bg-indigo-600 text-white shadow-lg hover:scale-105 transition"
        aria-label="Open cart"
      >
        <ShoppingCart size={22} />
        {couponApplied && (
          <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
            −£{discount.toFixed(0)}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[340px] rounded-2xl border border-gray-200/50 
                        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl p-5">
          {/* header */}
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              London Registered Office
            </h3>
          </div>

          {/* hoxton-like save ribbon */}
          {selected === "monthly" ? (
            <p className="mb-3 text-sm text-pink-700 bg-pink-50 rounded-lg px-3 py-2 border border-pink-200">
              <strong>Switch to annual</strong> and save <strong>£{savePerMonthIncVat.toFixed(2)}</strong> every month!
            </p>
          ) : (
            <p className="mb-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
              <strong>Saved £{savePerYearIncVat.toFixed(2)}</strong> with annual billing · Equivalent to <strong>£16.67/mo</strong>
            </p>
          )}

          {/* plan tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelected("monthly")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                selected === "monthly" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
            >
              £20 + VAT /mo
            </button>
            <button
              onClick={() => setSelected("annual")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                selected === "annual" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
            >
              £200 + VAT /yr
            </button>
          </div>

          {/* price box */}
          <div className="space-y-1 mb-4">
            <Row label="Base" value={`£${base.toFixed(2)} ${PRICES[selected].period}`} />
            {couponApplied && discount > 0 && <Row label="Discount" value={`– £${discount.toFixed(2)}`} />}
            <Row label="VAT (20%)" value={`£${vat.toFixed(2)}`} />
            <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-1 border-t border-gray-200 dark:border-gray-700">
              <span>Total today</span>
              <span>£{total.toFixed(2)} {PRICES[selected].period}</span>
            </div>
          </div>

          {/* features */}
          <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-200 mb-4">
            <li className="flex items-center gap-2"><Bot className="w-4 h-4 text-emerald-600" /> AI-sorted mail included</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Director privacy included</li>
            <li className="flex items-center gap-2"><BadgePercent className="w-4 h-4 text-emerald-600" /> Transparent pricing — no hidden fees</li>
          </ul>

          {/* coupon */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Coupon code</label>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code"
                className="flex-1 rounded-lg bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 px-3 py-2 outline-none border border-gray-300 dark:border-gray-700"
              />
              <button
                onClick={applyCoupon}
                disabled={busy}
                className="rounded-lg px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                Apply
              </button>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full rounded-xl py-3 text-center font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Continue to KYC
          </button>

          <p className="mt-2 text-[12px] text-gray-600 dark:text-gray-400 text-center">
            No charge until ID verification is completed.
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-200">
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
