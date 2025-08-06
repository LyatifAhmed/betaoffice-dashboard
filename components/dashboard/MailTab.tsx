"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SimulatedMailTab from "@/components/dashboard/SimulatedMailTab";

type MailTabProps = {
  mailItems: any[];
  reviewStatus: string;
  hoxtonStatus: string;
};

export default function MailTab({ mailItems, reviewStatus, hoxtonStatus }: MailTabProps) {
  const showSimulated = reviewStatus === "NO_ID" || hoxtonStatus === "stopped";

  useEffect(() => {
    // opsiyonel: scroll-to-top simülasyon moduna geçince
    if (showSimulated) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [showSimulated]);

  if (showSimulated) {
    return (
      <Card className="glass-card border border-dashed border-white/30">
        <CardContent className="p-6">
          <div className="text-gray-500 text-sm mb-4">
            👀 This is a simulated preview of how your mail will appear after ID verification is complete.
          </div>
          <SimulatedMailTab />
        </CardContent>
      </Card>
    );
  }

  if (mailItems.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-gray-500 text-sm">📭 You have 0 letters.</CardContent>
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
