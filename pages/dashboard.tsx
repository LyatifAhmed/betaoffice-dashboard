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
  
  const handleGenerateCertificate = async () => {
    try {
      const res = await fetch("/api/generate-certificate");
      if (!res.ok) throw new Error("Failed to generate certificate");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "betaoffice-certificate.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("❌ Could not generate certificate. Please try again.");
    }
  };
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
      console.error("Error fetching data:", error);
      if (error.response?.status === 403) {
        window.location.href = "/";
      }
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

  const filteredMails = mailItems.filter((item) => {
    const matchesSender = item.sender_name?.toLowerCase().includes(searchSender.toLowerCase());
    const createdDate = new Date(item.created_at);
    const matchesStart = startDate ? createdDate >= new Date(startDate) : true;
    const matchesEnd = endDate ? createdDate <= new Date(endDate) : true;
    return matchesSender && matchesStart && matchesEnd;
  });

  const isLinkExpired = (createdAt: string): boolean => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    return (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24) > 30;
  };

  const renderStatusCard = () => {
    const status = subscription?.review_status;
    let bgColor = "bg-gray-100 text-gray-800 border-gray-300";
    let message = "Your subscription status is unknown.";

    if (status === "ACTIVE") {
      bgColor = "bg-green-100 text-green-800 border-green-300";
      message = "✅ Your identity is verified. You can now use all features.";
    } else if (status === "PENDING") {
      bgColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
      message = "⏳ Your identity verification is in progress.";
    } else if (status === "NO_ID") {
      bgColor = "bg-blue-100 text-blue-800 border-blue-300";
      message = "📩 We are waiting for your identity verification. Please check your email.";
    } else if (status === "CANCELLED") {
      bgColor = "bg-red-100 text-red-800 border-red-300";
      message = "❌ Your subscription has been cancelled.";
    }

    return (
      <div className={`p-4 mb-6 rounded border ${bgColor} flex justify-between items-center`}>
        <p className="text-sm font-medium">{message}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchMailData}
          className="text-sm flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh status
        </Button>
      </div>
    );
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!subscription) return <div className="p-6 text-red-500">No subscription found</div>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        Welcome, {subscription?.customer_first_name || "User"}
      </h1>

      {renderStatusCard()}

      {activeTab === "details" && (
        <SubscriptionControls
          stripeSubscriptionId={subscription.stripe_subscription_id}
          externalId={subscription.external_id}
          hoxtonStatus={subscription.review_status}
          cancelAtPeriodEnd={subscription.cancel_at_period_end}
          reviewStatus={subscription.review_status}
        />
      )}

      {newMailAlert && (
        <div className="mb-4 p-4 rounded bg-blue-100 text-blue-800 border border-blue-300">
          📬 New mail received
          <button
            onClick={() => setNewMailAlert(false)}
            className="ml-4 underline text-sm text-blue-700"
          >
            Dismiss
          </button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="mail"><Mail className="w-4 h-4 mr-2" />Incoming Mail</TabsTrigger>
          <TabsTrigger value="details"><Info className="w-4 h-4 mr-2" />Details</TabsTrigger>
          <TabsTrigger value="referral"><Gift className="w-4 h-4 mr-2" />Referral</TabsTrigger>
        </TabsList>

        {/* 📬 MAIL */}
        <TabsContent value="mail">
          <Card>
            <CardContent className="p-6">
              {/* ... mail search & table ... */}
              <WalletSection
                balance={subscription.wallet_balance || 0}
                customerEmail={subscription.customer_email}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🧾 DETAILS */}
        <TabsContent value="details">
          <Card>
            <CardContent className="space-y-6 p-6">
              <Button onClick={handleGenerateCertificate}>
                Generate PDF Certificate
              </Button>

              {/* Company Info */}
              <div className="text-sm break-words">
                <h2 className="text-md font-semibold">Company</h2>
                <p>{subscription.company_name || "Not provided"}</p>
                <p>
                  {subscription.shipping_line_1}
                  <br />
                  {subscription.shipping_city}, {subscription.shipping_postcode}
                  <br />
                  {subscription.shipping_country}
                </p>
              </div>

              {/* Plan Info */}
              <div className="text-sm">
                <h2 className="text-md font-semibold">Plan</h2>
                <p>{subscription.product_id || "Not set"}</p>
                <p className="text-gray-500">
                  Start Date:{" "}
                  {subscription.start_date
                    ? new Date(subscription.start_date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              {/* Contact Info */}
              <div className="text-sm break-words">
                <h2 className="text-md font-semibold">Contact Info</h2>
                <p>
                  Name: {subscription.customer_first_name} {subscription.customer_last_name}
                </p>
                <p>Email: {subscription.customer_email}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🎁 REFERRAL */}
        <TabsContent value="referral">
          <Card>
            <CardContent className="space-y-6 p-6">
              <ReferralSection userEmail={subscription.customer_email} />
              <AffiliateCards />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </main>
  );
}
