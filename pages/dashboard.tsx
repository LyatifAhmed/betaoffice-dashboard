"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { MailIcon, UserIcon, LogOutIcon, FileTextIcon, ShieldAlert } from "lucide-react";

type MailItem = {
  id: string;
  created_at: string;
  url: string;
  sender_name?: string;
  document_title?: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [mailItems, setMailItems] = useState<MailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/me", { withCredentials: true });
        if (!res.data?.subscription) {
          setError("Subscription not found.");
          router.push("/login");
          return;
        }
        setSubscription(res.data.subscription);
        setMailItems(res.data.mailItems);
      } catch (err) {
        console.error("Auth error", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const cancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      await axios.post("/api/hoxton/cancel-subscription", {
        external_id: subscription?.external_id,
      });
      alert("Subscription cancel scheduled.");
    } catch (err) {
      console.error("Cancel error", err);
      alert("Failed to cancel.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !subscription) return <div className="p-6 text-red-500">Error: {error || "No subscription loaded."}</div>;

  const isPendingKyc = subscription?.subscription?.status === "NO_ID";

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <UserIcon className="h-5 w-5" /> Welcome, {subscription?.customer_first_name || subscription?.customer?.first_name || "User"}
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Subscription Details</h2>
        <p>Status: <strong>{subscription?.subscription?.status || "Unknown"}</strong></p>
        <p>Company: {subscription?.company_name || subscription?.company?.name || <em>Not provided</em>}</p>

        {subscription?.shipping_line_1 || subscription?.shipping_address?.shipping_address_line_1 ? (
          <p>
            Forwarding Address:
            <br />
            <strong>
              {subscription.shipping_line_1 || subscription.shipping_address?.shipping_address_line_1}
              {subscription.shipping_line_2 && `, ${subscription.shipping_line_2}`}
              <br />
              {subscription.shipping_city}, {subscription.shipping_postcode}
              <br />
              {subscription.shipping_country}
            </strong>
          </p>
        ) : (
          <p>Forwarding Address: <em>No address selected</em></p>
        )}

        <button
          onClick={cancelSubscription}
          className="mt-4 px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
        >
          Cancel Subscription
        </button>
      </section>

      {isPendingKyc ? (
        <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-lg shadow-sm flex gap-3 items-start">
          <ShieldAlert className="text-yellow-600 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Identity verification pending</h3>
            <p className="text-sm text-yellow-700">
              Please complete the KYC verification to receive mail.
            </p>
          </div>
        </div>
      ) : (
        <section>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <MailIcon className="h-5 w-5" /> Incoming Mail
          </h2>
          {mailItems.length === 0 ? (
            <p>No scanned mail yet.</p>
          ) : (
            <ul className="space-y-4">
              {mailItems.map(item => (
                <li key={item.id} className="border p-4 rounded shadow-sm bg-white">
                  <p><strong>Sender:</strong> {item.sender_name || "Unknown"}</p>
                  <p><strong>Title:</strong> {item.document_title || ""}</p>
                  <p><strong>Date:</strong> {new Date(item.created_at).toLocaleDateString()}</p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    <FileTextIcon className="inline h-4 w-4 mr-1" /> View Document
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="mt-10 text-right">
        <button
          onClick={() => {
            document.cookie = "external_id=; Max-Age=0; path=/";
            router.push("/login");
          }}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500"
        >
          <LogOutIcon className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );
}

