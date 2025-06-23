"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Info, FileText } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("mail");
  const [subscription, setSubscription] = useState<any>(null);
  const [mailItems, setMailItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/me", { withCredentials: true }).then(res => {
      setSubscription(res.data.subscription);
      setMailItems(res.data.mailItems || []);
    }).finally(() => setLoading(false));
  }, []);

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

      if (!res.ok) {
        throw new Error("Failed to generate certificate");
      }

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

  if (loading) return <div className="p-6">Loading...</div>;
  if (!subscription) return <div className="p-6 text-red-500">No subscription found</div>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        Welcome, {subscription?.customer_first_name || "User"}
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="mail"><Mail className="w-4 h-4 mr-2" />Incoming Mail</TabsTrigger>
          <TabsTrigger value="details"><Info className="w-4 h-4 mr-2" />Details</TabsTrigger>
        </TabsList>

        <TabsContent value="mail">
          <Card>
            <CardContent className="p-6">
              {mailItems.length === 0 ? (
                <p className="text-gray-500 text-sm">No scanned mail yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2 border">Sender</th>
                        <th className="text-left p-2 border">Title</th>
                        <th className="text-left p-2 border">Date</th>
                        <th className="text-left p-2 border">Document</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mailItems.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2 border">{item.sender_name || "Unknown"}</td>
                          <td className="p-2 border">{item.document_title || "-"}</td>
                          <td className="p-2 border">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-2 border">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="details">
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Status: {" "}
                  <span className={
                    subscription.review_status === "ACTIVE" ? "text-green-600" :
                    subscription.review_status === "PENDING" ? "text-yellow-600" :
                    "text-gray-500"
                  }>
                    {subscription.review_status || "Unknown"}
                  </span>
                </span>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={cancelSubscription}>Cancel Subscription</Button>
                  <Button onClick={handleGenerateCertificate}>Generate PDF Certificate</Button>
                </div>
              </div>

              <div>
                <h2 className="text-md font-semibold">Company</h2>
                <p>{subscription.company_name || "Not provided"}</p>
                <p>
                  {subscription.shipping_line_1}<br />
                  {subscription.shipping_city}, {subscription.shipping_postcode}<br />
                  {subscription.shipping_country}
                </p>
              </div>

              <div>
                <h2 className="text-md font-semibold">Plan</h2>
                <p>{subscription.product_id || "Not set"}</p>
                <p className="text-sm text-gray-500">
                  Start Date: {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString() : "N/A"}
                </p>
              </div>

              <div>
                <h2 className="text-md font-semibold">Contact Info</h2>
                <p>Name: {subscription.customer_first_name} {subscription.customer_last_name}</p>
                <p>Email: {subscription.customer_email}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

