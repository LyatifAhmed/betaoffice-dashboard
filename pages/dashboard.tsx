"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import {
  MailIcon,
  UserIcon,
  LogOutIcon,
  FileTextIcon,
  ShieldAlert,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GetServerSidePropsContext } from "next";
import { parse } from "cookie";

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/me", { withCredentials: true });
        const { subscription, mailItems, stripe_subscription_id } = res.data;

        if (!subscription) {
          setError("Subscription not found.");
          router.push("/login");
          return;
        }

        setSubscription({ ...subscription, stripe_subscription_id });
        setMailItems(mailItems || []);
      } catch (err) {
        console.error("❌ Auth error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const cancelSubscription = async () => {
    const external_id = subscription?.external_id;
    const stripe_subscription_id = subscription?.stripe_subscription_id;

    if (!external_id || !stripe_subscription_id) {
      alert("Missing subscription details.");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to cancel your subscription?");
    if (!confirmed) return;

    try {
      await axios.post("/api/hoxton/cancel-subscription", {
        external_id,
        stripe_subscription_id,
      });
      alert("✅ Cancellation requested. Your subscription will end at the end of this billing period.");
    } catch (err) {
      console.error("Cancel error", err);
      alert("❌ Failed to cancel. Please try again.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !subscription) return <div className="p-6 text-red-500">Error: {error || "No subscription loaded."}</div>;

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <UserIcon className="h-5 w-5" />
        Welcome, {subscription?.customer_first_name || subscription?.customer?.first_name || "User"}
      </h1>

      {subscription?.review_status !== "ACTIVE" && (
        <div className="mb-4 p-4 border-l-4 border-yellow-400 bg-yellow-50 text-yellow-800 rounded">
          ⚠️ Your ID verification is still pending. You will not receive scanned mail until the review is complete.
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border rounded-lg p-4 shadow bg-white">
          <h3 className="font-semibold text-gray-800 mb-1">Subscription Status</h3>
          <p>
            {subscription.status === "CANCELLED" ? (
              <span className="text-red-600 font-medium">Cancelled</span>
            ) : (
              <span className="text-green-600 font-medium">Active</span>
            )}
          </p>
        </div>

        <div className="border rounded-lg p-4 shadow bg-white">
          <h3 className="font-semibold text-gray-800 mb-1">ID Verification Status</h3>
          <p>
            {subscription.review_status === "ACTIVE" && (
              <span className="text-green-600 font-medium">Verified ✅</span>
            )}
            {subscription.review_status === "PENDING" && (
              <span className="text-yellow-600 font-medium">Pending Review ⏳</span>
            )}
            {!subscription.review_status && (
              <span className="text-gray-500">Unknown</span>
            )}
          </p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Subscription Details</h2>
        <p>Company: {subscription?.company_name || <em>Not provided</em>}</p>
        <p>
          Forwarding Address:
          <br />
          <strong>
            {subscription.shipping_line_1}
            {subscription.shipping_line_2 && `, ${subscription.shipping_line_2}`}
            <br />
            {subscription.shipping_city}, {subscription.shipping_postcode}
            <br />
            {subscription.shipping_country}
          </strong>
        </p>

        <Button onClick={() => setConfirmOpen(true)} className="mt-4 bg-red-500 hover:bg-red-600">
          Cancel Subscription
        </Button>
      </section>

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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to cancel?</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTitle className="text-red-600">Important</AlertTitle>
            <AlertDescription>
              Your subscription will remain active until the end of your billing cycle. Make sure to download all important scanned documents before then.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Go Back
            </Button>
            <Button variant="destructive" onClick={cancelSubscription}>
              Confirm Cancellation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const parsed = parse(ctx.req.headers.cookie || "");
  const externalId = parsed.external_id;

  if (!externalId) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
