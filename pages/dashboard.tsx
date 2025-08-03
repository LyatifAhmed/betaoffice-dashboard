"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Info, FileText, RefreshCw, Gift } from "lucide-react";
import WalletSection from "@/components/WalletSection";
import ForwardMailButton from "@/components/ForwardMailButton";
import SubscriptionControls from "@/components/dashboard/SubscriptionControls";
import ReferralSection from "@/components/ReferralSection";
import AffiliateCards from "@/components/AffiliateCards";
import AISummaryButton from "@/components/AISummaryButton";
import SmartStatusBar from "@/components/SmartStatusBar";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("mail");
  const [subscription, setSubscription] = useState<any>(null);
  const [mailItems, setMailItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastMailId, setLastMailId] = useState<number | null>(null);
  const [newMailAlert, setNewMailAlert] = useState(false);
  const [searchSender, setSearchSender] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchMailData = async () => {
    try {
      const res = await axios.get("/api/me", { withCredentials: true });
      setSubscription(res.data.subscription);
      const items = res.data.mailItems || [];
      setMailItems(items);
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

  const isLinkExpired = (createdAt: string): boolean => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    return (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24) > 1;
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!subscription) return <div className="p-6 text-red-500">No subscription found</div>;

  const filteredMails = mailItems.filter((item) => {
    const matchesSender = item.sender_name?.toLowerCase().includes(searchSender.toLowerCase());
    const createdDate = new Date(item.created_at);
    const matchesStart = startDate ? createdDate >= new Date(startDate) : true;
    const matchesEnd = endDate ? createdDate <= new Date(endDate) : true;
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSender && matchesStart && matchesEnd && matchesCategory;
  });

  const subscriptionStart = new Date(subscription?.start_date);
  const isFirst7Days = (new Date().getTime() - subscriptionStart.getTime()) / (1000 * 60 * 60 * 24) <= 7;

  return (
    <main className="relative pt-[46px]">
      <SmartStatusBar
        status={subscription?.review_status || "UNKNOWN"}
        newMail={newMailAlert}
        isFirstWeek={isFirst7Days}
      />

      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-center">Welcome, {subscription?.customer_first_name || "User"}</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 flex justify-center gap-2">
            <TabsTrigger value="mail"><Mail className="w-4 h-4 mr-2" />Mail</TabsTrigger>
            <TabsTrigger value="details"><Info className="w-4 h-4 mr-2" />Details</TabsTrigger>
            <TabsTrigger value="referral"><Gift className="w-4 h-4 mr-2" />Referral</TabsTrigger>
          </TabsList>

          <TabsContent value="mail">
            <Card className="bg-white/60 backdrop-blur-md shadow-xl border border-gray-200 rounded-xl">
              <CardContent className="p-6">
                {/* Mail Section */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card className="bg-white/60 backdrop-blur-md shadow-xl border border-gray-200 rounded-xl">
              <CardContent className="space-y-6 p-6">
                {/* Details Section */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral">
            <Card className="bg-white/60 backdrop-blur-md shadow-xl border border-gray-200 rounded-xl">
              <CardContent className="space-y-6 p-6">
                <ReferralSection userEmail={subscription.customer_email} walletBalance={subscription.wallet_balance} subscriptionId={subscription.id} />
                <AffiliateCards />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
