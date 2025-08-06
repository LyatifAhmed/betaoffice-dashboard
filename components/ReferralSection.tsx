"use client";

import { ClipboardCopy, Gift, Wallet, Banknote, HandCoins } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface ReferralSectionProps {
  userEmail: string;
  walletBalance: number;
  subscriptionId: string;
}

export default function ReferralSection({ userEmail, walletBalance, subscriptionId }: ReferralSectionProps) {
  const [referralLink, setReferralLink] = useState("");
  const [payoutRequested, setPayoutRequested] = useState(false);
  const payoutThreshold = 15;

  useEffect(() => {
    if (userEmail) {
      const encoded = encodeURIComponent(userEmail);
      setReferralLink(`https://betaoffice.uk/?ref=${encoded}`);
    }
  }, [userEmail]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const handleRequestPayout = async () => {
    try {
      const res = await fetch("/api/request-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, subscriptionId }),
      });
      if (!res.ok) throw new Error("Failed to request payout");
      toast.success("✅ Payout request submitted!");
      setPayoutRequested(true);
    } catch {
      toast.error("❌ Could not request payout. Try again later.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Referral Rules */}
      <div className="glass-box p-4 text-sm text-gray-200">
        <h2 className="font-semibold text-white mb-2 flex items-center">
          <Gift className="w-4 h-4 mr-2 text-yellow-400" />
          Referral Rules
        </h2>
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          <li>Earn <strong className="text-green-300">£5 credit</strong> per verified sign-up.</li>
          <li>Referral must complete payment & KYC.</li>
          <li>Credits added monthly, usable for mail forwarding.</li>
          <li>Automatic payout after <strong className="text-green-300">£{payoutThreshold}</strong>.</li>
          <li>No spam or abuse — violators will be banned.</li>
        </ul>
      </div>

      {/* Referral Link Box */}
      <div className="glass-box p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-auto text-sm break-all text-white">
          <p className="mb-1 font-medium text-blue-100">Your Referral Link:</p>
          <code className="text-blue-400">{referralLink}</code>
        </div>

        <Button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md"
        >
          <ClipboardCopy size={16} /> Copy Link
        </Button>
      </div>

      {/* Wallet + Payout */}
      <div className="glass-box p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center text-white">
          <Wallet className="w-4 h-4 mr-2 text-green-400" />
          Your Referral Wallet
        </h2>
        <p className="text-lg font-bold text-green-300">£{walletBalance.toFixed(2)}</p>

        {walletBalance >= payoutThreshold && !payoutRequested ? (
          <Button
            onClick={handleRequestPayout}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md"
          >
            <HandCoins className="w-4 h-4" /> Request Payout
          </Button>
        ) : payoutRequested ? (
          <div className="text-sm text-blue-400 flex items-center gap-2">
            <Banknote className="w-4 h-4" /> Payout requested, pending processing.
          </div>
        ) : (
          <div className="text-sm text-gray-300">
            You need at least £{payoutThreshold} to request payout.
          </div>
        )}
      </div>

    </div>
  );
}