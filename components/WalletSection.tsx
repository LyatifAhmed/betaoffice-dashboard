import { useState } from "react";
import { Button } from "@/components/ui/button";

type WalletSectionProps = {
  balance: number;
  customerEmail: string;
};

export default function WalletSection({ balance, customerEmail }: WalletSectionProps) {
  const [amount, setAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);

  const handleTopUp = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid top-up amount (e.g. 5, 10, 25)");
      return;
    }

    setTopUpLoading(true);
    try {
      const res = await fetch("/api/stripe-topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail, amount: parsedAmount }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("❌ Top-up failed.");
      }
    } catch (err) {
      console.error("Top-up error", err);
      alert("❌ Could not process top-up.");
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded-md shadow-sm mt-6">
      <h2 className="text-lg font-semibold mb-2 text-red-600">📮 Forwarding Wallet</h2>
      <p className="text-sm mb-2">Current balance: <strong>£{balance.toFixed(2)}</strong></p>

      <div className="flex items-center gap-2 mt-2">
        <input
          type="number"
          min="1"
          placeholder="Enter amount (£)"
          className="border px-3 py-2 rounded w-40"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button onClick={handleTopUp} disabled={topUpLoading}>
          {topUpLoading ? "Processing..." : "Top up wallet"}
        </Button>
      </div>
    </div>
  );
}
