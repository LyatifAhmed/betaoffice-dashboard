// pages/success.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");

    if (sessionId) {
      // ✅ Request token from backend using session_id
      axios
        .get(`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/api/get-token-from-session`, {
          params: { session_id: sessionId },
        })
        .then((res) => {
          const { token } = res.data;

          // ✅ Save token for optional reuse and redirect
          sessionStorage.setItem("kyc_token", token);
          router.push(`/kyc?token=${token}`);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch token:", err);
        });
    }

    // Store price ID in localStorage for KYC form reference
    const priceId = localStorage.getItem("stripe_price_id");

    if (priceId === "price_1RBKvBACVQjWBIYus7IRSyEt") {
      localStorage.setItem("hoxton_product_id", "2736");
    } else if (priceId === "price_1RBKvlACVQjWBIYuVs4Of01v") {
      localStorage.setItem("hoxton_product_id", "2737");
    }
  }, [router]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold">Processing your payment...</h1>
      <p className="mt-4 text-gray-600">You&apos;re all set! Please wait, redirecting you to the KYC form...</p>
    </div>
  );
}




  