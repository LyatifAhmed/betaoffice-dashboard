// components/dashboard/DashboardTabs.tsx

"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MailTab from "@/components/dashboard/MailTab";
import DetailsTab from "@/components/dashboard/DetailsTab";
import ReferralTab from "@/components/dashboard/ReferralTab";

export default function DashboardTabs({
  subscription,
  mailItems,
  wallet,
}: {
  subscription: any;
  mailItems: any[];
  wallet: any;
}) {
  const [activeTab, setActiveTab] = useState("mail");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="flex justify-center gap-4 mb-6 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-inner p-1">
        <TabsTrigger value="mail" className="px-4 py-2 font-medium">
          📬 Mail
        </TabsTrigger>
        <TabsTrigger value="details" className="px-4 py-2 font-medium">
          📄 Details
        </TabsTrigger>
        <TabsTrigger value="referral" className="px-4 py-2 font-medium">
          🎁 Referral
        </TabsTrigger>
      </TabsList>

      <TabsContent value="mail">
        <MailTab
          mailItems={mailItems}
          reviewStatus={reviewStatus}
          hoxtonStatus={subscription?.hoxton_status}
        />

      </TabsContent>

      <TabsContent value="details">
        <DetailsTab subscription={subscription} wallet={wallet} />
      </TabsContent>

      <TabsContent value="referral">
        <ReferralTab subscription={subscription} />
      </TabsContent>
    </Tabs>
  );
}
