"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function WalletSection({ balance, customerEmail }: { balance: number, customerEmail: string }) {
  const [topUpAmount, setTopUpAmount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/stripe-topup", {
        amount: topUpAmount,
        customer_email: customerEmail,
      });

      if (res.data?.url) {
        window.location.href = res.data.url; // Redirect to Stripe Checkout
      } else {
        alert("Failed to create checkout session.");
      }
    } catch (err) {
      console.error("Stripe error:", err);
      alert("Top-up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-4 mb-6 bg-white">
      <h2 className="text-lg font-semibold mb-2">💰 Mail Forward Wallet</h2>
      <p className="mb-4 text-sm">Current Balance: £{balance.toFixed(2)}</p>

      <div className="flex gap-2 items-center mb-4">
        <input
          type="number"
          value={topUpAmount}
          onChange={(e) => setTopUpAmount(Number(e.target.value))}
          className="border rounded px-2 py-1 w-24"
        />
        <span className="text-sm">GBP</span>
      </div>

      <Button onClick={handleTopUp} disabled={loading}>
        {loading ? "Redirecting..." : "Top Up Wallet"}
      </Button>
    </div>
  );
}
