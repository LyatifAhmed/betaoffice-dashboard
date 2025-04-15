// pages/success.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");

    // Get price ID from session storage if saved during checkout
    const priceId = localStorage.getItem("stripe_price_id");

    if (priceId === "price_1RBKvBACVQjWBIYus7IRSyEt") {
      localStorage.setItem("hoxton_product_id", "2736");
    } else if (priceId === "price_1RBKvlACVQjWBIYuVs4Of01v") {
      localStorage.setItem("hoxton_product_id", "2737");
    }

    // Instead of creating a token here, just wait and redirect after a few seconds
    const tokenFromEmail = sessionStorage.getItem("kyc_token"); // optional future use
    if (tokenFromEmail) {
      router.push(`/kyc?token=${tokenFromEmail}`);
    } else {
      // Just show the success message and let user use the email link
      console.log("✅ Token created by webhook — check your email.");
    }
  }, [router]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold">Processing your payment...</h1>
      <p className="mt-4 text-gray-600">You&apos;re all set! Please check your email to complete your KYC form.</p>
    </div>
  );
}



  