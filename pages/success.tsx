'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function SuccessPage() {
  const router = useRouter();
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");

    if (sessionId) {
      axios
        .get(`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/api/get-token-from-session`, {
          params: { session_id: sessionId },
        })
        .then((res) => {
          const { token } = res.data;
          if (token) {
            sessionStorage.setItem("kyc_token", token);
            router.push(`/kyc?token=${token}`);
          }
        })
        .catch(() => {
          // Token not ready yet — show fallback after 6s
          setTimeout(() => {
            setFallback(true);
          }, 6000);
        });
    }

    // Save price ID for later usage in the KYC form
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
      {!fallback ? (
        <p className="mt-4 text-gray-600">
          You&apos;re all set! Redirecting you to the KYC form…
        </p>
      ) : (
        <p className="mt-4 text-gray-600">
          ✅ Payment complete, but your form isn’t ready yet.<br />
          Please check your email to access the KYC form.
        </p>
      )}
    </div>
  );
}




  