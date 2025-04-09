// pages/success.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const priceId = urlParams.get("price_id");

    if (priceId) {
      // Save the raw Stripe price ID
      localStorage.setItem("stripe_price_id", priceId);

      // Map Stripe price ID to Hoxton Mix product ID
      if (priceId === "price_1RBKvBACVQjWBIYus7IRSyEt") {
        localStorage.setItem("hoxton_product_id", "2736"); // Monthly
      } else if (priceId === "price_1RBKvlACVQjWBIYuVs4Of01v") {
        localStorage.setItem("hoxton_product_id", "2737"); // Annual
      }

      // Redirect to the KYC form
      router.push("/kyc");
    }
  }, [router]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold">Processing your payment...</h1>
      <p className="mt-4 text-gray-600">You’ll be redirected shortly.</p>
    </div>
  );
}



  