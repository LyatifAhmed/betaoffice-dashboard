"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet2, CreditCard, ArrowDownCircle } from "lucide-react";
import { toast } from "react-hot-toast";

type WalletSectionProps = {
  balance: number;
  customerEmail: string;
  externalId: string;
};

export default function WalletSection({ balance, customerEmail, externalId }: WalletSectionProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const MAX_TOPUP_AMOUNT = 1000;

  const handleQuickTopUp = (val: number) => {
    setAmount(val.toString());
  };

  const handleTopUp = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > MAX_TOPUP_AMOUNT) {
      toast.error("💸 Please enter a valid amount under £1000.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe-topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 🍪 external_id via cookie
        body: JSON.stringify({ amount: parsedAmount }),
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("❌ Stripe top-up failed.");
      }
    } catch (err) {
      console.error("Top-up error:", err);
      toast.error("❌ Could not process top-up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Balance */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-green-800">
          <Wallet2 className="w-5 h-5" /> Wallet Balance
        </h2>
        <p className="text-xl font-bold text-green-700">£{balance.toFixed(2)}</p>
      </div>

      {/* Quick Top-up */}
      <div className="flex gap-2">
        {[5, 10, 20].map((val) => (
          <Button
            key={val}
            variant="outline"
            className="backdrop-blur bg-white/50 text-gray-700"
            onClick={() => handleQuickTopUp(val)}
          >
            +£{val}
          </Button>
        ))}
      </div>

      {/* Custom Amount + Top-up */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="number"
          placeholder="Enter amount (£)"
          min="1"
          max={MAX_TOPUP_AMOUNT}
          className="px-4 py-2 rounded-lg border border-gray-300 w-full sm:w-40 text-gray-800"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button
          onClick={handleTopUp}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          <CreditCard className="w-4 h-4" />
          {loading ? "Processing..." : "Top up"}
        </Button>
      </div>

      {/* Info Note */}
      <div className="text-sm text-gray-600 mt-2">
        💡 You can use your wallet balance for <strong>mail forwarding</strong> or request payout once eligible.
      </div>

      {/* Future Payout Placeholder */}
      <div className="mt-6 bg-white/40 backdrop-blur-sm border border-dashed border-gray-300 p-4 rounded-lg text-gray-700 flex items-center gap-2 text-sm">
        <ArrowDownCircle className="w-4 h-4 text-gray-500" />
        Soon you'll be able to withdraw via Wise, Binance or Gift Cards. Stay tuned!
      </div>
    </div>
  );
}
