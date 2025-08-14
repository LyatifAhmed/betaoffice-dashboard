"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ForwardMailButtonProps {
  mailId: number | string;
  balance: number;
  forwardCost: number;
  onForwardSuccess: () => void;
  documentTitle: string;
  isExpired: boolean;
  customerAddress: {
    line1: string;
    city: string;
    postcode: string;
    country: string;
  };
  externalId: string;
}

export default function ForwardMailButton({
  mailId,
  balance,
  forwardCost,
  onForwardSuccess,
  documentTitle,
  isExpired,
  customerAddress,
  externalId,
}: ForwardMailButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleForward = async () => {
    if (balance < forwardCost) {
      alert("❌ Not enough balance. Please top up your wallet first.");
      return;
    }
    if (isExpired) {
      alert("❌ The document link has expired. Please contact support.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to forward “${documentTitle}”? £${forwardCost.toFixed(2)} will be deducted from your balance.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/mail/forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailId,
          documentTitle,
          customerAddress,
          externalId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        alert("✅ Mail forwarding requested successfully.");
        onForwardSuccess?.();
      } else {
        alert("❌ Failed to forward mail. Please try again.");
      }
    } catch (err) {
      console.error("Forward error", err);
      alert("❌ Error forwarding mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleForward}
      disabled={loading || balance < forwardCost || isExpired}
      className="gap-2"
      title={
        isExpired
          ? "This document link is expired"
          : balance < forwardCost
          ? "Insufficient balance"
          : "Forward this mail"
      }
    >
      {loading ? "Processing..." : `Forward (£${forwardCost.toFixed(2)})`}
    </Button>
  );
}
