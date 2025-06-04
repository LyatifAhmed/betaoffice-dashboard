"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { MailIcon, UserIcon, LogOutIcon, FileTextIcon, ShieldAlert } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [mailItems, setMailItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const externalId = typeof window !== "undefined" ? localStorage.getItem("external_id") : null;

  useEffect(() => {
  if (!externalId) {
    router.push("/login");
    return;
  }
  const fetchData = async () => {
    try {
      const sub = await axios.get(`/api/hoxton/subscription?external_id=${externalId}`);
      setSubscription(sub.data);

      const mail = await axios.get(`/api/hoxton/mail?external_id=${externalId}`);
      setMailItems(mail.data);
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [externalId, router]); // 🔁 'router' eklendi


  const cancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription at the end of your billing term?")) return;
    try {
      await axios.post(`/api/hoxton/cancel-subscription`, { external_id: externalId });
      alert("Your subscription will be canceled at the end of the billing cycle.");
    } catch (err) {
      alert("Failed to cancel subscription.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const isPendingKyc = subscription.subscription.status === "NO_ID";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <UserIcon className="h-5 w-5" /> Welcome, {subscription.customer.first_name}
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Subscription Details</h2>
        <p>Status: <strong>{subscription.subscription.status}</strong></p>
        <p>Company: {subscription.company.name}</p>
        <p>Forwarding Address: {subscription.shipping_address.shipping_address_line_1}, {subscription.shipping_address.shipping_address_city}</p>
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
              Your subscription is active but mail delivery is on hold until you complete the KYC verification.
              Please check your inbox for a link from HoxtonMix to complete the ID check.
            </p>
          </div>
        </div>
      ) : (
        <section>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><MailIcon className="h-5 w-5" /> Incoming Mail</h2>
          {mailItems.length === 0 ? (
            <p>No scanned mail yet.</p>
          ) : (
            <ul className="space-y-4">
              {mailItems.map(item => (
                <li key={item.id} className="border p-4 rounded shadow-sm bg-white">
                  <p><strong>Sender:</strong> {item.ai_metadata?.sender_name || "Unknown"}</p>
                  <p><strong>Title:</strong> {item.ai_metadata?.document_title || ""}</p>
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
            localStorage.removeItem("external_id");
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

