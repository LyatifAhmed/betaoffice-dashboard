"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Info, FileText, RefreshCw } from "lucide-react";
import WalletSection from "@/components/WalletSection";
import ForwardMailButton from "@/components/ForwardMailButton";

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
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const cancelSubscription = async () => {
    const confirmed = window.confirm("Are you sure you want to cancel your subscription?");
    if (!confirmed || !subscription?.external_id || !subscription?.stripe_subscription_id) return;

    try {
      await axios.post("/api/hoxton/cancel-subscription", {
        external_id: subscription.external_id,
        stripe_subscription_id: subscription.stripe_subscription_id,
      });
      alert("✅ Cancellation requested. Your subscription will end at the end of this billing period.");
    } catch (err) {
      console.error("Cancel error", err);
      alert("❌ Failed to cancel. Please try again.");
    }
  };

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
    const diffInMs = now.getTime() - createdDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays > 30;
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
      message = "⏳ Your identity verification is in progress. We’ll notify you when it's complete.";
    } else if (status === "NO_ID") {
      bgColor = "bg-blue-100 text-blue-800 border-blue-300";
      message = "📩 We are waiting for your identity verification. Please check your email.";
    } else if (status === "CANCELLED") {
      bgColor = "bg-red-100 text-red-800 border-red-300";
      message = "❌ Your subscription has been cancelled. Contact support for help.";
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
      
      <div
        className={`mb-6 p-4 rounded-lg border ${
          subscription.review_status === "ACTIVE"
            ? "bg-green-50 border-green-400 text-green-800"
            : subscription.review_status === "PENDING"
            ? "bg-yellow-50 border-yellow-400 text-yellow-800"
            : "bg-red-50 border-red-400 text-red-800"
        }`}
      >
        <p className="font-medium">
          {subscription.review_status === "ACTIVE" && "✅ Your identity has been verified. Welcome!"}
          {subscription.review_status === "PENDING" && "🕐 Your identity verification is still in progress. We'll notify you when it's ready."}
          {subscription.review_status === "CANCELLED" && "❌ Your subscription has been cancelled. Please contact support if this is an error."}
        </p>
      </div>
      
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
        </TabsList>

        <TabsContent value="mail">
          {subscription.review_status !== "ACTIVE" && (
            <div className="mb-4 p-4 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-900">
              <h2 className="font-semibold mb-1 text-yellow-800">🕵️ Identity Verification Pending</h2>
              <p className="text-sm">
                We’ve received your application, but your identity verification is not yet complete.  
                Please check your email and follow the instructions to verify your identity.
              </p>
            </div>
          )}

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search by sender..."
                  className="border px-2 py-1 rounded w-full"
                  value={searchSender}
                  onChange={(e) => setSearchSender(e.target.value)}
                />
                <input
                  type="date"
                  className="border px-2 py-1 rounded w-full"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="border px-2 py-1 rounded w-full"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {filteredMails.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">
                  ✉️ No scanned mail yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2 border">Sender</th>
                        <th className="text-left p-2 border">Title</th>
                        <th className="text-left p-2 border">Date</th>
                        <th className="text-left p-2 border">Document</th>
                        <th className="text-left p-2 border">Forward</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMails.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2 border">{item.sender_name || "Unknown"}</td>
                          <td className="p-2 border">{item.document_title || "-"}</td>
                          <td className="p-2 border">{new Date(item.created_at).toLocaleDateString()}</td>
                          <td className="p-2 border">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              <FileText className="w-4 h-4 mr-1" />View
                            </a>
                          </td>
                          <td className="p-2 border">
                            <ForwardMailButton
                              mailId={item.id}
                              documentTitle={item.document_title}
                              isExpired={isLinkExpired(item.created_at)}
                              customerAddress={{
                                line1: subscription.shipping_line_1,
                                city: subscription.shipping_city,
                                postcode: subscription.shipping_postcode,
                                country: subscription.shipping_country,
                              }}
                              externalId={subscription.external_id}
                              balance={subscription.wallet_balance || 0}
                              forwardCost={2.5}
                              onForwardSuccess={fetchMailData}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <WalletSection
                balance={subscription.wallet_balance || 0}
                customerEmail={subscription.customer_email}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <span className="text-sm font-medium">
                  Status: {" "}
                  <span
                    className={
                      subscription.review_status === "ACTIVE"
                        ? "text-green-600"
                        : subscription.review_status === "PENDING"
                        ? "text-yellow-600"
                        : "text-gray-500"
                    }
                  >
                    {subscription.review_status || "Unknown"}
                  </span>
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="destructive" onClick={cancelSubscription}>
                    Cancel Subscription
                  </Button>
                  <Button onClick={handleGenerateCertificate}>
                    Generate PDF Certificate
                  </Button>
                </div>
              </div>

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

              <div className="text-sm">
                <h2 className="text-md font-semibold">Plan</h2>
                <p>{subscription.product_id || "Not set"}</p>
                <p className="text-gray-500">
                  Start Date: {" "}
                  {subscription.start_date
                    ? new Date(subscription.start_date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div className="text-sm break-words">
                <h2 className="text-md font-semibold">Contact Info</h2>
                <p>
                  Name: {subscription.customer_first_name} {" "}
                  {subscription.customer_last_name}
                </p>
                <p>Email: {subscription.customer_email}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
