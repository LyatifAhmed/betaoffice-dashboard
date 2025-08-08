// components/layout/ReferralArea.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";

export default function ReferralArea() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://betaoffice.io/ref/yourcode";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex justify-center px-2 sm:px-6 lg:px-3 pt-16">
      <div className="w-full max-w-[92rem] space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl p-6 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            🤝 Referral Program
          </h2>

          <p className="text-sm text-white/80">
            Invite your friends and earn rewards when they sign up with your referral link. You can withdraw your rewards via Wise, Payoneer, Binance or use them as credits.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="bg-white/10 px-4 py-2 rounded-lg text-sm text-white font-mono backdrop-blur">
              {referralLink}
            </div>
            <Button
              onClick={handleCopy}
              variant="ghost"
              className="flex gap-2 text-white border border-white/20 hover:border-white/40 backdrop-blur px-4 py-2"
            >
              <Copy size={16} />
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>

          <div className="text-xs text-white/60">
            * Referral rewards become available after your referee completes KYC and activates their subscription.
          </div>
        </div>
      </div>
    </div>
  );
}
