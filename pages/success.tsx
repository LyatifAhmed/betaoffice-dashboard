'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SuccessPage() {
  const router = useRouter();
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setFallback(true);
      return;
    }

    (async () => {
      try {
        const r = await fetch(
          `/api/success/get-token-from-session?session_id=${encodeURIComponent(sessionId)}`
        );

        if (!r.ok) throw new Error(await r.text());
        const { token } = await r.json();

        if (token && !cancelled) {
          sessionStorage.setItem("kyc_token", token);
          router.push(`/kyc?token=${encodeURIComponent(token)}`);
          return;
        }

        if (!cancelled) {
          setTimeout(() => !cancelled && setFallback(true), 6000);
        }
      } catch {
        if (!cancelled) {
          setTimeout(() => !cancelled && setFallback(true), 6000);
        }
      }
    })();

    const priceId = localStorage.getItem("stripe_price_id");
    if (priceId === "price_1RBKvBACVQjWBIYus7IRSyEt") {
      localStorage.setItem("hoxton_product_id", "2736");
    } else if (priceId === "price_1RBKvlACVQjWBIYuVs4Of01v") {
      localStorage.setItem("hoxton_product_id", "2737");
    }

    return () => {
      cancelled = true;
    };
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
          ✅ Payment complete, but your form isn&apos;t ready yet.<br />
          Please check your email to access the KYC form.
        </p>
      )}
    </div>
  );
}
