"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SimulatedMailTab from "@/components/dashboard/SimulatedMailTab";
import { motion } from "framer-motion";

type MailTabProps = {
  mailItems: any[];
  reviewStatus: string;
  hoxtonStatus: string;
};

export default function MailTab({ mailItems, reviewStatus, hoxtonStatus }: MailTabProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const showSimulated = !reviewStatus || reviewStatus !== "ACTIVE";

  console.log("reviewStatus:", reviewStatus, "| showSimulated:", showSimulated);




  useEffect(() => {
    if (showSimulated) window.scrollTo({ top: 0, behavior: "smooth" });

    const hasSeen = localStorage.getItem("hasSeenMailOnboarding");
    if (!hasSeen && mailItems.length === 0 && !showSimulated) {
      setShowOnboarding(true);
    }
  }, [showSimulated, mailItems.length]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("hasSeenMailOnboarding", "true");
  };

  if (showSimulated) {
    return (
      <Card className="glass-card border border-dashed border-white/30">
        <CardContent className="p-6">
          <Card className="glass-card border border-dashed border-white/30">
  <CardContent className="p-6">
    <div>Test message before warning</div>
    <div className="text-yellow-700 bg-yellow-100 border-l-4 border-yellow-400 text-sm px-4 py-3 rounded mb-4">
      👀 This is a simulated preview of how your mail will appear once your account is fully verified and active.
    </div>
    <SimulatedMailTab />
  </CardContent>
</Card>


          <SimulatedMailTab />
        </CardContent>
      </Card>
    );
  }

  if (mailItems.length === 0) {
    return (
      <Card className="glass-card relative overflow-visible">
        <CardContent className="p-6 text-gray-500 text-sm">
          📭 You have 0 letters.
          {showOnboarding && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-50 bg-white/70 backdrop-blur-md border border-fuchsia-300 text-fuchsia-800 shadow-lg rounded-xl p-4 max-w-sm text-sm"
            >
              <div className="font-semibold mb-2">👋 Welcome to your Mail Inbox</div>
              <p className="mb-2">
                This is where your scanned mail will appear once verified. You can filter by category or search by sender.
              </p>
              <button
                onClick={dismissOnboarding}
                className="text-xs text-fuchsia-700 hover:underline"
              >
                Got it
              </button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {mailItems.map((mail) => (
        <Card key={mail.id} className="glass-card">
          <CardContent className="p-4">
            <div className="font-semibold">{mail.sender}</div>
            <div className="text-sm text-gray-500">{mail.subject}</div>
            {/* ...diğer detaylar */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
