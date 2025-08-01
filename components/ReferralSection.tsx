"use client";

import { ClipboardCopy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

type ReferralSectionProps = {
  userEmail: string;
};

export default function ReferralSection({ userEmail }: ReferralSectionProps) {
  const [referralLink, setReferralLink] = useState("");

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

  return (
    <div className="space-y-6">
      {/* Referral Rules Box */}
      <div className="bg-white/50 backdrop-blur border border-gray-200 p-4 rounded-lg text-sm text-gray-800 shadow">
        <h2 className="font-semibold text-gray-900 mb-2">📜 Referral Rules</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Earn <strong>£5 credit</strong> per verified sign-up.</li>
          <li>Referral must complete payment & KYC.</li>
          <li>Credits apply monthly; payouts on request.</li>
          <li>No spam or abuse — violators may be banned.</li>
        </ul>
      </div>

      {/* Referral Link Box */}
      <div className="bg-white/60 backdrop-blur-md border border-gray-200 p-6 rounded-xl shadow flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-auto text-sm break-all text-gray-900">
          <p className="mb-1 font-medium">Your Referral Link:</p>
          <code className="text-blue-600">{referralLink}</code>
        </div>

        <Button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition"
        >
          <ClipboardCopy size={16} /> Copy Link
        </Button>
      </div>
    </div>
  );
}
