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

      // ✅ Statü kontrolü
      if (subscription.review_status !== "ACTIVE") {
        setError("Your identity verification is still pending.");
        router.push("/login");
        return;
      }

      setSubscription({ ...subscription, stripe_subscription_id });
      setMailItems(mailItems || []);
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
  const external_id = subscription?.external_id;
  const stripe_subscription_id = subscription?.subscription?.stripe_subscription_id;

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




  const isPendingKyc = subscription?.subscription?.status === "NO_ID";

  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !subscription)
    return <div className="p-6 text-red-500">Error: {error || "No subscription loaded."}</div>;

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <UserIcon className="h-5 w-5" />
        Welcome, {subscription?.customer_first_name || subscription?.customer?.first_name || "User"}
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Subscription Details</h2>
        <p>
          Status:{" "}
          {subscription?.review_status === "PENDING" && (
            <span className="text-yellow-600 font-semibold">Pending Verification</span>
          )}
          {subscription?.review_status === "ACTIVE" && (
            <span className="text-green-600 font-semibold">Active</span>
          )}
          {!subscription?.review_status && (
            <span className="text-gray-500 font-medium">Unknown</span>
          )}</p>
        <p>Company: {subscription?.company_name || subscription?.company?.name || <em>Not provided</em>}</p>

        {(subscription?.shipping_line_1 || subscription?.shipping_address?.shipping_address_line_1) ? (
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

        <Button onClick={() => setConfirmOpen(true)} className="mt-4 bg-red-500 hover:bg-red-600">
          Cancel Subscription
        </Button>
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to cancel?</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTitle className="text-red-600">Important</AlertTitle>
            <AlertDescription>
              Your subscription will remain active until the end of your billing cycle. Make sure to download all important scanned documents before then, otherwise your dashboard will reset and files will be permanently deleted.
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
  const cookie = ctx.req.headers.cookie || "";
  const hasAuth =
    cookie.includes("external_id=") &&
    !cookie.includes("external_id=;") &&
    !cookie.includes("external_id=deleted");

  if (!hasAuth) {
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
