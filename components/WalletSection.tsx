import { useState } from "react";
import { Button } from "@/components/ui/button";

type WalletSectionProps = {
  balance: number;
  customerEmail: string;
};

export default function WalletSection({ balance, customerEmail }: WalletSectionProps) {
  const [topUpLoading, setTopUpLoading] = useState(false);

  const handleTopUp = async () => {
    setTopUpLoading(true);
    try {
      const res = await fetch("/api/stripe-topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail }),
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
      <h2 className="text-lg font-semibold mb-2">📮 Forwarding Wallet</h2>
      <p className="text-sm mb-2">Current balance: <strong>£{balance.toFixed(2)}</strong></p>
      <Button onClick={handleTopUp} disabled={topUpLoading}>
        {topUpLoading ? "Processing..." : "Top up wallet"}
      </Button>
    </div>
  );
}
