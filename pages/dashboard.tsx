"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Info, FileText, Trash2 } from "lucide-react";

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
  const [selectedExpiredIds, setSelectedExpiredIds] = useState<Set<string>>(new Set());

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
    const interval = setInterval(fetchMailData, 10000);
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

  const isExpired = (dateStr: string) => {
    const created = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 30;
  };

  const filteredMails = mailItems.filter((item) => {
    const createdDate = new Date(item.created_at);
    const matchesSender = item.sender_name?.toLowerCase().includes(searchSender.toLowerCase());
    const matchesStart = startDate ? createdDate >= new Date(startDate) : true;
    const matchesEnd = endDate ? createdDate <= new Date(endDate) : true;
    return matchesSender && matchesStart && matchesEnd;
  });

  const toggleExpiredSelect = (id: string) => {
    setSelectedExpiredIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const selectAllExpired = () => {
    const expiredIds = filteredMails
      .filter((item) => isExpired(item.created_at))
      .map((item) => item.id);
    setSelectedExpiredIds(new Set(expiredIds));
  };

  const deleteSelected = () => {
    if (!window.confirm("Delete selected mails from dashboard view?")) return;
    setMailItems((prev) => prev.filter((item) => !selectedExpiredIds.has(item.id)));
    setSelectedExpiredIds(new Set());
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!subscription) return <div className="p-6 text-red-500">No subscription found</div>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Welcome, {subscription?.customer_first_name || "User"}</h1>

      {newMailAlert && (
        <div className="mb-4 p-4 rounded bg-blue-100 text-blue-800 border border-blue-300">
          📬 New mail received
          <button onClick={() => setNewMailAlert(false)} className="ml-4 underline text-sm text-blue-700">
            Dismiss
          </button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex flex-wrap gap-2">
          <TabsTrigger value="mail"><Mail className="w-4 h-4 mr-2" />Incoming Mail</TabsTrigger>
          <TabsTrigger value="details"><Info className="w-4 h-4 mr-2" />Details</TabsTrigger>
        </TabsList>

        <TabsContent value="mail">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
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

              <div className="flex justify-between items-center mb-2 text-sm">
                <Button variant="outline" onClick={selectAllExpired}>
                  Select All Expired
                </Button>
                <Button variant="destructive" onClick={deleteSelected} disabled={selectedExpiredIds.size === 0}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete Selected
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border"><input type="checkbox" disabled /></th>
                      <th className="p-2 border text-left">Sender</th>
                      <th className="p-2 border text-left">Title</th>
                      <th className="p-2 border text-left">Date</th>
                      <th className="p-2 border text-left">Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMails.map((item) => {
                      const expired = isExpired(item.created_at);
                      return (
                        <tr key={item.id} className="border-t">
                          <td className="p-2 border text-center">
                            {expired && (
                              <input
                                type="checkbox"
                                checked={selectedExpiredIds.has(item.id)}
                                onChange={() => toggleExpiredSelect(item.id)}
                              />
                            )}
                          </td>
                          <td className="p-2 border">{item.sender_name || "Unknown"}</td>
                          <td className="p-2 border">{item.document_title || "-"}</td>
                          <td className="p-2 border">{new Date(item.created_at).toLocaleDateString()}</td>
                          <td className="p-2 border">
                            {expired ? (
                              <span className="text-red-500">Expired</span>
                            ) : (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center"
                              >
                                <FileText className="w-4 h-4 mr-1" /> View
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <span className="text-sm font-medium">
                  Status: <span className={
                    subscription.review_status === "ACTIVE"
                      ? "text-green-600"
                      : subscription.review_status === "PENDING"
                      ? "text-yellow-600"
                      : "text-gray-500"
                  }>
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
                  Start Date:{" "}
                  {subscription.start_date
                    ? new Date(subscription.start_date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div className="text-sm break-words">
                <h2 className="text-md font-semibold">Contact Info</h2>
                <p>
                  Name: {subscription.customer_first_name}{" "}
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
