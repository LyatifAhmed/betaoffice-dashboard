"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SmartStatusBar from "@/components/SmartStatusBar";
import MailTab from "@/components/dashboard/MailTab";
import DetailsTab from "@/components/dashboard/DetailsTab";
import ReferralTab from "@/components/dashboard/ReferralTab";
import SimulatedMailTab from "@/components/dashboard/SimulatedMailTab";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("mail");
  const [subscription, setSubscription] = useState<any>(null);
  const [mailItems, setMailItems] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastMailId, setLastMailId] = useState<number | null>(null);
  const [newMailAlert, setNewMailAlert] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMailData = async () => {
    try {
      const res = await axios.get("/api/me", { withCredentials: true });
      setSubscription(res.data.subscription);
      setWallet(res.data.subscription.wallet);
      const items = res.data.mailItems || [];
      setMailItems(items);

      const unread = items.filter((mail: any) => mail.read === false).length;
      setUnreadCount(unread);

      if (items.length > 0) {
        const newestId = items[0].id;
        if (lastMailId !== null && newestId !== lastMailId) {
          setNewMailAlert(true);
        }
        setLastMailId(newestId);
      }
    } catch (error: any) {
      if (error.response?.status === 403) window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMailData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMailData();
    }, 10000);
    return () => clearInterval(interval);
  }, [lastMailId]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading your dashboard...</div>;
  if (!subscription) return <div className="text-center py-20 text-red-500">No subscription found.</div>;

  const reviewStatus = subscription?.review_status?.toUpperCase();
  const hoxtonStatus = subscription?.hoxton_status;

  return (
    <main className="relative pt-[56px] bg-gradient-to-br from-white/50 to-gray-100 min-h-screen backdrop-blur-xl">
      <SmartStatusBar
        status={reviewStatus || "UNKNOWN"}
        unreadCount={unreadCount}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-10 drop-shadow-md">
          Welcome, {subscription?.customer_first_name || "User"}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex justify-center gap-4 mb-6 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-inner p-1">
            <TabsTrigger value="mail" className="px-4 py-2 font-medium">📬 Mail</TabsTrigger>
            <TabsTrigger value="details" className="px-4 py-2 font-medium">📄 Details</TabsTrigger>
            <TabsTrigger value="referral" className="px-4 py-2 font-medium">🎁 Referral</TabsTrigger>
          </TabsList>

          <TabsContent value="mail">
            {(reviewStatus === "NO_ID" || hoxtonStatus === "stopped") ? (
              <SimulatedMailTab />
            ) : (
              <MailTab
                mailItems={mailItems}
                reviewStatus={reviewStatus}
                hoxtonStatus={hoxtonStatus}
              />
            )}
          </TabsContent>

          <TabsContent value="details">
            <DetailsTab subscription={subscription} wallet={wallet} />
          </TabsContent>

          <TabsContent value="referral">
            <ReferralTab subscription={subscription} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
