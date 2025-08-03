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
      <SmartStatusBar status={subscription?.review_status} newMail={newMailAlert} isFirstWeek={isFirst7Days} />
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
                {subscription.review_status !== "ACTIVE" ? (
                  <div className="text-center text-gray-500 text-sm py-10">
                    🛑 You must verify your identity to access scanned mail.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                      <input type="text" placeholder="Search sender" className="border px-2 py-1 rounded w-full" value={searchSender} onChange={(e) => setSearchSender(e.target.value)} />
                      <input type="date" className="border px-2 py-1 rounded w-full" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      <input type="date" className="border px-2 py-1 rounded w-full" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      <select className="border px-2 py-1 rounded w-full" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">All</option>
                        <option value="Invoice">Invoice</option>
                        <option value="Bank">Bank</option>
                        <option value="Government">Government</option>
                        <option value="Personal">Personal</option>
                      </select>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left p-2 border">Sender</th>
                            <th className="text-left p-2 border">Title</th>
                            <th className="text-left p-2 border">Date</th>
                            <th className="text-left p-2 border">Category</th>
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
                              <td className="p-2 border">{item.category || "Unclassified"}</td>
                              <td className="p-2 border">
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className={`flex items-center ${isLinkExpired(item.created_at) ? "text-gray-400 line-through" : "text-blue-600 hover:underline"}`}>
                                  <FileText className="w-4 h-4 mr-1" />View
                                </a>
                                {!isLinkExpired(item.created_at) && item.url && (
                                  <AISummaryButton pdfUrl={item.url} />
                                )}
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
                    <WalletSection balance={subscription.wallet_balance || 0} customerEmail={subscription.customer_email} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card className="bg-white/60 backdrop-blur-md shadow-xl border border-gray-200 rounded-xl">
              <CardContent className="space-y-6 p-6">
                <Button onClick={async () => {
                  const res = await fetch("/api/generate-certificate");
                  if (!res.ok) return alert("❌ Failed to generate PDF");
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "betaoffice-certificate.pdf";
                  link.click();
                  URL.revokeObjectURL(url);
                }}>Generate PDF Certificate</Button>
                <div className="text-sm break-words">
                  <h2 className="text-md font-semibold">Company</h2>
                  <p>{subscription.company_name || "Not provided"}</p>
                  <p>{subscription.shipping_line_1}<br />{subscription.shipping_city}, {subscription.shipping_postcode}<br />{subscription.shipping_country}</p>
                </div>
                <div className="text-sm">
                  <h2 className="text-md font-semibold">Plan</h2>
                  <p>{subscription.product_id || "Not set"}</p>
                  <p className="text-gray-500">Start: {new Date(subscription.start_date).toLocaleDateString()}</p>
                </div>
                <div className="text-sm break-words">
                  <h2 className="text-md font-semibold">Contact Info</h2>
                  <p>{subscription.customer_first_name} {subscription.customer_last_name}</p>
                  <p>{subscription.customer_email}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral">
            <Card className="bg-white/60 backdrop-blur-md shadow-xl border border-gray-200 rounded-xl">
              <CardContent className="space-y-6 p-6">
                <ReferralSection userEmail={subscription.customer_email} />
                <AffiliateCards />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
